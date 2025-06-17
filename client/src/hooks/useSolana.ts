
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useCallback } from 'react';

export const useSolana = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const getBalance = useCallback(async (address?: PublicKey) => {
    if (!address) return 0;
    try {
      const balance = await connection.getBalance(address);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }, [connection]);

  const sendSOL = useCallback(async (to: PublicKey, amount: number) => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'processed');
    return signature;
  }, [publicKey, sendTransaction, connection, connected]);

  const getTokenAccountsByOwner = useCallback(async (owner: PublicKey) => {
    try {
      const response = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });
      return response.value;
    } catch (error) {
      console.error('Error getting token accounts:', error);
      return [];
    }
  }, [connection]);

  return {
    connection,
    publicKey,
    connected,
    getBalance,
    sendSOL,
    getTokenAccountsByOwner,
  };
};
