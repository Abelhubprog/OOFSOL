import { Connection, PublicKey } from '@solana/web3.js';
import { BlockchainData } from '../orchestrator/coordinator';

export interface TokenTransaction {
  signature: string;
  timestamp: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  action: 'buy' | 'sell' | 'transfer';
  amount: number;
  price: number;
  value: number;
  fee: number;
}

export class WalletDataAgent {
  private solanaConnection: Connection;

  constructor() {
    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );
  }

  async fetchComprehensiveData(walletAddress: string): Promise<BlockchainData> {
    const wallet = new PublicKey(walletAddress);

    // Fetch transaction signatures
    const signatures = await this.solanaConnection.getSignaturesForAddress(
      wallet,
      { limit: 1000 }
    );

    // Parse transactions in batches
    const batchSize = 50;
    const tokenHistory: TokenTransaction[] = [];
    const allTransactions = [];

    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);
      
      const transactions = await Promise.all(
        batch.map(async (sig) => {
          try {
            return await this.solanaConnection.getParsedTransaction(
              sig.signature,
              { maxSupportedTransactionVersion: 0 }
            );
          } catch (error) {
            console.warn(`Failed to fetch transaction ${sig.signature}:`, error);
            return null;
          }
        })
      );

      const validTransactions = transactions.filter(Boolean);
      allTransactions.push(...validTransactions);

      // Parse token transactions from this batch
      for (const tx of validTransactions) {
        const tokenTxs = await this.parseTokenTransactions(tx, walletAddress);
        tokenHistory.push(...tokenTxs);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(tokenHistory);

    return {
      transactions: allTransactions,
      tokenHistory,
      performanceMetrics
    };
  }

  private async parseTokenTransactions(
    transaction: any,
    walletAddress: string
  ): Promise<TokenTransaction[]> {
    if (!transaction || !transaction.meta || transaction.meta.err) {
      return [];
    }

    const tokenTransactions: TokenTransaction[] = [];
    const instructions = transaction.transaction.message.instructions;

    for (const instruction of instructions) {
      if (instruction.program === 'spl-token' && instruction.parsed) {
        const parsed = instruction.parsed;
        
        if (parsed.type === 'transfer' || parsed.type === 'transferChecked') {
          const info = parsed.info;
          
          // Check if wallet is source or destination
          const isSource = info.source === walletAddress;
          const isDestination = info.destination === walletAddress;
          
          if (isSource || isDestination) {
            // Get token info
            const tokenAddress = info.mint || 'unknown';
            const amount = parseFloat(info.amount || info.tokenAmount?.amount || '0');
            
            tokenTransactions.push({
              signature: transaction.transaction.signatures[0],
              timestamp: transaction.blockTime * 1000,
              tokenAddress,
              tokenSymbol: await this.getTokenSymbol(tokenAddress),
              tokenName: await this.getTokenName(tokenAddress),
              action: isSource ? 'sell' : 'buy',
              amount: amount / Math.pow(10, info.decimals || 9),
              price: 0, // Would need price API integration
              value: 0, // Would need price API integration
              fee: transaction.meta.fee || 0
            });
          }
        }
      }
    }

    return tokenTransactions;
  }

  private async getTokenSymbol(tokenAddress: string): Promise<string> {
    // In production, this would query token metadata
    // For now, return truncated address
    return tokenAddress.slice(0, 8).toUpperCase();
  }

  private async getTokenName(tokenAddress: string): Promise<string> {
    // In production, this would query token metadata
    return `Token ${tokenAddress.slice(0, 8)}`;
  }

  private calculatePerformanceMetrics(tokenHistory: TokenTransaction[]): any {
    if (tokenHistory.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageHoldTime: 0
      };
    }

    // Group transactions by token
    const tokenGroups = new Map<string, TokenTransaction[]>();
    
    for (const tx of tokenHistory) {
      const existing = tokenGroups.get(tx.tokenAddress) || [];
      existing.push(tx);
      tokenGroups.set(tx.tokenAddress, existing);
    }

    let totalPnL = 0;
    let wins = 0;
    let losses = 0;
    let biggestWin = 0;
    let biggestLoss = 0;
    let totalHoldTime = 0;
    let completedTrades = 0;

    // Analyze each token's trading history
    for (const [tokenAddress, transactions] of tokenGroups) {
      const sortedTxs = transactions.sort((a, b) => a.timestamp - b.timestamp);
      
      let position = 0;
      let entryPrice = 0;
      let entryTime = 0;

      for (const tx of sortedTxs) {
        if (tx.action === 'buy' && position === 0) {
          // Opening position
          position = tx.amount;
          entryPrice = tx.price;
          entryTime = tx.timestamp;
        } else if (tx.action === 'sell' && position > 0) {
          // Closing position
          const pnl = (tx.price - entryPrice) * Math.min(position, tx.amount);
          totalPnL += pnl;
          
          if (pnl > 0) {
            wins++;
            biggestWin = Math.max(biggestWin, pnl);
          } else {
            losses++;
            biggestLoss = Math.min(biggestLoss, pnl);
          }

          const holdTime = tx.timestamp - entryTime;
          totalHoldTime += holdTime;
          completedTrades++;

          position -= tx.amount;
          if (position <= 0) {
            position = 0;
          }
        }
      }
    }

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? wins / totalTrades : 0;
    const averageHoldTime = completedTrades > 0 ? totalHoldTime / completedTrades : 0;

    return {
      totalPnL,
      winRate,
      biggestWin,
      biggestLoss,
      averageHoldTime: averageHoldTime / (1000 * 60 * 60 * 24) // Convert to days
    };
  }
}