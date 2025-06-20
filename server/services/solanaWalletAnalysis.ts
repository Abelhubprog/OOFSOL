import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAnalysisResult, Transaction, TokenHolding, TradingPattern, TradingPersonality } from '../ai/types';
import { DatabaseUtils } from '../db/utils';

interface TokenAccount {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

interface TokenTransaction {
  signature: string;
  timestamp: number;
  tokenAddress: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  pricePerToken?: number;
  solAmount?: number;
  blockTime: number;
}

interface TokenAnalysis {
  tokenAddress: string;
  symbol: string;
  name: string;
  totalBought: number;
  totalSold: number;
  currentHolding: number;
  averageBuyPrice: number;
  averageSellPrice: number;
  realizedPnL: number;
  unrealizedPnL: number;
  isDust: boolean;
  isGain: boolean;
  isPaperHands: boolean;
  maxPrice: number;
  currentPrice: number;
  transactions: TokenTransaction[];
}

interface WalletAnalysisResult {
  walletAddress: string;
  totalTransactions: number;
  totalTokensTraded: number;
  biggestGain: TokenAnalysis | null;
  biggestLoss: TokenAnalysis | null;
  dustTokens: TokenAnalysis[];
  paperHandsMoments: TokenAnalysis[];
  profitableTokens: TokenAnalysis[];
  analysisComplete: boolean;
  errorMessage?: string;
}

export class SolanaWalletAnalysisService {
  private connection: Connection;
  private readonly DUST_THRESHOLD = 0.001; // SOL equivalent
  private readonly PAPER_HANDS_THRESHOLD = 0.5; // Sold before 50% of peak
  private readonly MIN_TRANSACTIONS = 2; // Minimum buy/sell pairs

  constructor() {
    // Use public RPC endpoints for initial analysis
    const endpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ];
    
    this.connection = new Connection(endpoints[0], 'confirmed');
  }

  async analyzeWallet(walletAddress: string): Promise<WalletAnalysisResult> {
    try {
      console.log(`Starting analysis for wallet: ${walletAddress}`);
      
      const publicKey = new PublicKey(walletAddress);
      
      // Get all token accounts for this wallet
      const tokenAccounts = await this.getTokenAccounts(publicKey);
      console.log(`Found ${tokenAccounts.length} token accounts`);
      
      // Get transaction history
      const transactions = await this.getTransactionHistory(publicKey);
      console.log(`Found ${transactions.length} transactions`);
      
      // Analyze each token
      const tokenAnalyses = await this.analyzeTokens(tokenAccounts, transactions);
      console.log(`Analyzed ${tokenAnalyses.length} tokens`);
      
      // Categorize tokens
      const result = this.categorizeTokens(walletAddress, tokenAnalyses);
      
      return {
        ...result,
        totalTransactions: transactions.length,
        totalTokensTraded: tokenAnalyses.length,
        analysisComplete: true
      };
      
    } catch (error) {
      console.error('Wallet analysis error:', error);
      return {
        walletAddress,
        totalTransactions: 0,
        totalTokensTraded: 0,
        biggestGain: null,
        biggestLoss: null,
        dustTokens: [],
        paperHandsMoments: [],
        profitableTokens: [],
        analysisComplete: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getTokenAccounts(publicKey: PublicKey): Promise<TokenAccount[]> {
    try {
      const response = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      return response.value.map(account => {
        const accountInfo = account.account.data.parsed.info;
        return {
          mint: accountInfo.mint,
          balance: parseInt(accountInfo.tokenAmount.amount),
          decimals: accountInfo.tokenAmount.decimals,
          uiAmount: accountInfo.tokenAmount.uiAmount || 0
        };
      });
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  }

  private async getTransactionHistory(publicKey: PublicKey): Promise<ParsedTransactionWithMeta[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit: 1000 // Analyze last 1000 transactions
      });

      const transactions: ParsedTransactionWithMeta[] = [];
      
      // Process in batches to avoid rate limits
      for (let i = 0; i < signatures.length; i += 50) {
        const batch = signatures.slice(i, i + 50);
        const batchTxs = await this.connection.getParsedTransactions(
          batch.map(sig => sig.signature),
          { maxSupportedTransactionVersion: 0 }
        );
        
        transactions.push(...batchTxs.filter(tx => tx !== null) as ParsedTransactionWithMeta[]);
        
        // Rate limiting
        if (i < signatures.length - 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  private async analyzeTokens(
    tokenAccounts: TokenAccount[],
    transactions: ParsedTransactionWithMeta[]
  ): Promise<TokenAnalysis[]> {
    const tokenMap = new Map<string, TokenAnalysis>();

    // Initialize token analyses
    for (const account of tokenAccounts) {
      if (account.uiAmount > 0) {
        tokenMap.set(account.mint, {
          tokenAddress: account.mint,
          symbol: await this.getTokenSymbol(account.mint),
          name: await this.getTokenName(account.mint),
          totalBought: 0,
          totalSold: 0,
          currentHolding: account.uiAmount,
          averageBuyPrice: 0,
          averageSellPrice: 0,
          realizedPnL: 0,
          unrealizedPnL: 0,
          isDust: false,
          isGain: false,
          isPaperHands: false,
          maxPrice: 0,
          currentPrice: 0,
          transactions: []
        });
      }
    }

    // Process transactions
    for (const tx of transactions) {
      if (!tx.blockTime) continue;

      const tokenTxs = this.extractTokenTransactions(tx);
      
      for (const tokenTx of tokenTxs) {
        if (!tokenMap.has(tokenTx.tokenAddress)) {
          tokenMap.set(tokenTx.tokenAddress, {
            tokenAddress: tokenTx.tokenAddress,
            symbol: await this.getTokenSymbol(tokenTx.tokenAddress),
            name: await this.getTokenName(tokenTx.tokenAddress),
            totalBought: 0,
            totalSold: 0,
            currentHolding: 0,
            averageBuyPrice: 0,
            averageSellPrice: 0,
            realizedPnL: 0,
            unrealizedPnL: 0,
            isDust: false,
            isGain: false,
            isPaperHands: false,
            maxPrice: 0,
            currentPrice: 0,
            transactions: []
          });
        }

        const analysis = tokenMap.get(tokenTx.tokenAddress)!;
        analysis.transactions.push(tokenTx);

        if (tokenTx.type === 'buy') {
          analysis.totalBought += tokenTx.amount;
        } else if (tokenTx.type === 'sell') {
          analysis.totalSold += tokenTx.amount;
        }
      }
    }

    // Calculate metrics for each token
    const analyses = Array.from(tokenMap.values());
    for (const analysis of analyses) {
      this.calculateTokenMetrics(analysis);
    }

    return analyses;
  }

  private extractTokenTransactions(tx: ParsedTransactionWithMeta): TokenTransaction[] {
    const transactions: TokenTransaction[] = [];
    
    if (!tx.meta || !tx.blockTime) return transactions;

    try {
      // Analyze token balance changes
      const preBalances = tx.meta.preTokenBalances || [];
      const postBalances = tx.meta.postTokenBalances || [];

      const balanceChanges = new Map<string, number>();

      // Calculate balance changes
      for (const preBalance of preBalances) {
        if (preBalance.mint) {
          balanceChanges.set(preBalance.mint, -(preBalance.uiTokenAmount?.uiAmount || 0));
        }
      }

      for (const postBalance of postBalances) {
        if (postBalance.mint) {
          const current = balanceChanges.get(postBalance.mint) || 0;
          balanceChanges.set(postBalance.mint, current + (postBalance.uiTokenAmount?.uiAmount || 0));
        }
      }

      // Convert balance changes to transactions
      const balanceEntries = Array.from(balanceChanges.entries());
      for (const [mint, change] of balanceEntries) {
        if (Math.abs(change) > 0.0001) { // Ignore dust
          transactions.push({
            signature: tx.transaction.signatures[0],
            timestamp: tx.blockTime,
            tokenAddress: mint,
            type: change > 0 ? 'buy' : 'sell',
            amount: Math.abs(change),
            blockTime: tx.blockTime,
            solAmount: this.calculateSOLAmount(tx),
            pricePerToken: this.calculateTokenPrice(tx, mint, Math.abs(change))
          });
        }
      }
    } catch (error) {
      console.error('Error extracting token transactions:', error);
    }

    return transactions;
  }

  private calculateSOLAmount(tx: ParsedTransactionWithMeta): number {
    if (!tx.meta) return 0;
    
    const preBalance = tx.meta.preBalances[0] || 0;
    const postBalance = tx.meta.postBalances[0] || 0;
    
    return Math.abs((preBalance - postBalance) / 1e9); // Convert lamports to SOL
  }

  private calculateTokenPrice(tx: ParsedTransactionWithMeta, mint: string, amount: number): number {
    // Simplified price calculation - in production, use DEX data
    const solAmount = this.calculateSOLAmount(tx);
    return amount > 0 ? solAmount / amount : 0;
  }

  private calculateTokenMetrics(analysis: TokenAnalysis): void {
    const buyTxs = analysis.transactions.filter(tx => tx.type === 'buy');
    const sellTxs = analysis.transactions.filter(tx => tx.type === 'sell');

    // Calculate average prices
    if (buyTxs.length > 0) {
      const totalBuyValue = buyTxs.reduce((sum, tx) => sum + (tx.pricePerToken || 0) * tx.amount, 0);
      analysis.averageBuyPrice = totalBuyValue / analysis.totalBought;
    }

    if (sellTxs.length > 0) {
      const totalSellValue = sellTxs.reduce((sum, tx) => sum + (tx.pricePerToken || 0) * tx.amount, 0);
      analysis.averageSellPrice = totalSellValue / analysis.totalSold;
    }

    // Get current price (simplified - use latest transaction price)
    const latestTx = analysis.transactions.sort((a, b) => b.timestamp - a.timestamp)[0];
    analysis.currentPrice = latestTx?.pricePerToken || analysis.averageBuyPrice;

    // Find max price from transaction history
    analysis.maxPrice = Math.max(...analysis.transactions.map(tx => tx.pricePerToken || 0));

    // Calculate PnL
    analysis.realizedPnL = (analysis.averageSellPrice - analysis.averageBuyPrice) * analysis.totalSold;
    analysis.unrealizedPnL = (analysis.currentPrice - analysis.averageBuyPrice) * analysis.currentHolding;

    // Determine categories
    analysis.isDust = analysis.currentHolding * analysis.currentPrice < this.DUST_THRESHOLD;
    analysis.isGain = analysis.realizedPnL > 0 || analysis.unrealizedPnL > 0;
    analysis.isPaperHands = analysis.totalSold > 0 && 
                          analysis.averageSellPrice < analysis.maxPrice * this.PAPER_HANDS_THRESHOLD;
  }

  private categorizeTokens(walletAddress: string, analyses: TokenAnalysis[]): Omit<WalletAnalysisResult, 'totalTransactions' | 'totalTokensTraded' | 'analysisComplete'> {
    // Filter valid analyses
    const validAnalyses = analyses.filter(a => a.transactions.length >= this.MIN_TRANSACTIONS);

    // Find biggest gain and loss
    const gainers = validAnalyses.filter(a => a.isGain).sort((a, b) => 
      (b.realizedPnL + b.unrealizedPnL) - (a.realizedPnL + a.unrealizedPnL)
    );
    
    const losers = validAnalyses.filter(a => !a.isGain).sort((a, b) => 
      (a.realizedPnL + a.unrealizedPnL) - (b.realizedPnL + b.unrealizedPnL)
    );

    return {
      walletAddress,
      biggestGain: gainers[0] || null,
      biggestLoss: losers[0] || null,
      dustTokens: validAnalyses.filter(a => a.isDust),
      paperHandsMoments: validAnalyses.filter(a => a.isPaperHands),
      profitableTokens: gainers.slice(0, 10) // Top 10 profitable tokens
    };
  }

  private async getTokenSymbol(mintAddress: string): Promise<string> {
    // In production, fetch from token metadata or registry
    return mintAddress.slice(0, 8).toUpperCase();
  }

  private async getTokenName(mintAddress: string): Promise<string> {
    // In production, fetch from token metadata or registry
    return `Token ${mintAddress.slice(0, 8)}`;
  }

  // Method to get current token prices from external APIs
  async getCurrentTokenPrices(tokenAddresses: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    
    try {
      // In production, integrate with Jupiter, Birdeye, or other price APIs
      for (const address of tokenAddresses) {
        // Mock price for development
        prices.set(address, Math.random() * 1000);
      }
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
    
    return prices;
  }
}

export const solanaWalletAnalysis = new SolanaWalletAnalysisService();