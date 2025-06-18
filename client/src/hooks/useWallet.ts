import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface WalletInfo {
  address: string;
  balance: number;
  isConnected: boolean;
  network: string;
}

export function useWallet() {
  const { user, isAuthenticated, primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const connectWallet = () => {
    setShowAuthFlow(true);
  };

  const fetchWalletBalance = async (address: string) => {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  };

  useEffect(() => {
    const updateWalletInfo = async () => {
      if (isAuthenticated && primaryWallet) {
        setIsLoading(true);
        
        try {
          const balance = await fetchWalletBalance(primaryWallet.address);
          
          setWalletInfo({
            address: primaryWallet.address,
            balance,
            isConnected: true,
            network: 'mainnet-beta'
          });

          // Save wallet to backend
          await fetch('/api/save-wallet', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              email: user?.email,
              walletAddress: primaryWallet.address,
              userId: user?.userId || primaryWallet.address
            }),
          });
        } catch (error) {
          console.error('Error updating wallet info:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setWalletInfo(null);
      }
    };

    updateWalletInfo();
  }, [isAuthenticated, primaryWallet, user]);

  return {
    wallet: walletInfo,
    user,
    isConnected: isAuthenticated && !!primaryWallet,
    isLoading,
    connectWallet,
    disconnect: () => {
      // Dynamic handles disconnect
      setWalletInfo(null);
    }
  };
}