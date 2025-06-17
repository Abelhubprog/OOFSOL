import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// Solana RPC endpoints for production
const MAINNET_RPC = 'https://api.mainnet-beta.solana.com';
const DEVNET_RPC = 'https://api.devnet.solana.com';

// Use mainnet for production, devnet for development
const RPC_ENDPOINT = import.meta.env.PROD ? MAINNET_RPC : DEVNET_RPC;

export class SolanaService {
  private connection: Connection;
  
  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }

  // Get wallet balance in SOL
  async getWalletBalance(publicKey: string): Promise<number> {
    try {
      const pubKey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  }

  // Get token accounts for a wallet
  async getTokenAccounts(publicKey: string) {
    try {
      const pubKey = new PublicKey(publicKey);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        address: account.pubkey.toString()
      }));
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  }

  // Get transaction history for wallet analysis
  async getTransactionHistory(publicKey: string, limit: number = 50) {
    try {
      const pubKey = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(pubKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await this.connection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });
            return {
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              err: sig.err,
              transaction: tx
            };
          } catch (error) {
            console.error(`Error fetching transaction ${sig.signature}:`, error);
            return null;
          }
        })
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Analyze wallet for missed opportunities
  async analyzeWalletOpportunities(publicKey: string) {
    try {
      const transactions = await this.getTransactionHistory(publicKey, 100);
      const tokenAccounts = await this.getTokenAccounts(publicKey);
      
      // Analyze sell transactions and potential missed gains
      const missedOpportunities = [];
      
      for (const tx of transactions) {
        if (!tx?.transaction) continue;
        
        // Look for token transfers (sells)
        const instructions = tx.transaction.transaction.message.instructions;
        for (const instruction of instructions) {
          if ('parsed' in instruction && instruction.programId.toString() === TOKEN_PROGRAM_ID.toString() && instruction.parsed?.type === 'transfer') {
            const tokenAddress = instruction.parsed.info.mint;
            const amount = instruction.parsed.info.amount;
            
            // This would require real-time price data to calculate missed gains
            // For now, we'll create a structure for the analysis
            missedOpportunities.push({
              tokenAddress,
              sellDate: new Date(tx.blockTime! * 1000),
              amount,
              signature: tx.signature
            });
          }
        }
      }

      return {
        totalTransactions: transactions.length,
        activeTokens: tokenAccounts.length,
        missedOpportunities: missedOpportunities.slice(0, 10), // Top 10
        walletAge: this.calculateWalletAge(transactions),
        tradingActivity: this.calculateTradingActivity(transactions)
      };
    } catch (error) {
      console.error('Error analyzing wallet:', error);
      return null;
    }
  }

  // Get real-time token price (requires price API integration)
  async getTokenPrice(mintAddress: string): Promise<number> {
    try {
      // This would integrate with Jupiter API or CoinGecko for real prices
      // For now, return 0 as placeholder
      return 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  // Validate Solana address
  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  private calculateWalletAge(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    
    const oldest = transactions[transactions.length - 1];
    const newest = transactions[0];
    
    if (!oldest?.blockTime || !newest?.blockTime) return 0;
    
    return Math.floor((newest.blockTime - oldest.blockTime) / (24 * 60 * 60)); // Days
  }

  private calculateTradingActivity(transactions: any[]): string {
    const recentTxs = transactions.filter(tx => 
      tx?.blockTime && tx.blockTime > (Date.now() / 1000) - (7 * 24 * 60 * 60) // Last 7 days
    );
    
    if (recentTxs.length > 20) return 'High';
    if (recentTxs.length > 5) return 'Medium';
    return 'Low';
  }
}

export const solanaService = new SolanaService();