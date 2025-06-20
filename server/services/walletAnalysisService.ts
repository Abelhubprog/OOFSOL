import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAnalysisResult, Transaction, TokenHolding, TradingPattern, TradingPersonality, NFTHolding } from '../ai/types';
import { DatabaseUtils } from '../db/utils';

interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
}

interface PriceData {
  current: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  ath: number;
  athDate: Date;
}

interface RugPullIndicators {
  liquidityPulled: boolean;
  creatorDumped: boolean;
  socialMediaGone: boolean;
  riskScore: number;
}

export class EnhancedWalletAnalysisService {
  private connection: Connection;
  private readonly RPC_ENDPOINTS = [
    process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana'
  ];

  constructor() {
    this.connection = new Connection(this.RPC_ENDPOINTS[0], {
      commitment: 'confirmed',
      wsEndpoint: process.env.SOLANA_WS_URL
    });
  }

  // Main analysis method
  async analyzeWallet(walletAddress: string): Promise<WalletAnalysisResult> {
    try {
      console.log(`🔍 Starting comprehensive analysis for wallet: ${walletAddress}`);
      
      // Check cache first
      const cached = await DatabaseUtils.getCachedWalletAnalysis(walletAddress);
      if (cached) {
        console.log(`📊 Returning cached analysis for ${walletAddress}`);
        return cached;
      }

      const publicKey = new PublicKey(walletAddress);
      
      // Parallel data fetching for performance
      const [
        balance,
        transactions,
        tokenHoldings,
        nftHoldings
      ] = await Promise.all([
        this.getSOLBalance(publicKey),
        this.getTransactionHistory(publicKey),
        this.getTokenHoldings(publicKey),
        this.getNFTHoldings(publicKey)
      ]);

      console.log(`📊 Analysis complete: ${transactions.length} txs, ${tokenHoldings.length} tokens, ${nftHoldings.length} NFTs`);

      // Process transactions for patterns
      const tradingPatterns = await this.analyzeTradingPatterns(transactions);
      const personality = this.determineTradingPersonality(transactions, tradingPatterns);
      const riskScore = this.calculateRiskScore(transactions, tradingPatterns);

      const result: WalletAnalysisResult = {
        address: walletAddress,
        balance,
        transactions: transactions.slice(0, 100), // Limit for response size
        tokens: tokenHoldings,
        nfts: nftHoldings,
        riskScore,
        patterns: tradingPatterns,
        opportunities: await this.findMissedOpportunities(transactions),
        regrets: await this.findTradeRegrets(transactions),
        personality
      };

      // Cache the result
      await DatabaseUtils.cacheWalletAnalysis(walletAddress, result);

      return result;

    } catch (error) {
      console.error(`❌ Wallet analysis failed for ${walletAddress}:`, error);
      throw new Error(`Wallet analysis failed: ${error.message}`);
    }
  }

  // SOL balance
  private async getSOLBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  }

  // Enhanced transaction history with better parsing
  private async getTransactionHistory(publicKey: PublicKey, limit: number = 1000): Promise<Transaction[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      const transactions: Transaction[] = [];

      // Process in batches to avoid rate limits
      for (let i = 0; i < signatures.length; i += 25) {
        const batch = signatures.slice(i, i + 25);
        const batchTxs = await this.connection.getParsedTransactions(
          batch.map(sig => sig.signature),
          { maxSupportedTransactionVersion: 0 }
        );

        for (let j = 0; j < batchTxs.length; j++) {
          const tx = batchTxs[j];
          if (tx && tx.blockTime) {
            const parsedTx = await this.parseTransaction(tx, signatures[i + j]);
            if (parsedTx) {
              transactions.push(parsedTx);
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Enhanced transaction parsing
  private async parseTransaction(
    tx: ParsedTransactionWithMeta, 
    signature: any
  ): Promise<Transaction | null> {
    try {
      if (!tx.blockTime || !tx.meta) return null;

      // Detect transaction type from instruction data
      const instructions = tx.transaction.message.instructions;
      let type: 'BUY' | 'SELL' | 'TRANSFER' | 'SWAP' = 'TRANSFER';
      let tokenAddress = '';
      let amount = 0;
      let priceUsd = 0;

      // Analyze token balance changes
      const preBalances = tx.meta.preTokenBalances || [];
      const postBalances = tx.meta.postTokenBalances || [];

      for (const preBalance of preBalances) {
        if (preBalance.mint && preBalance.uiTokenAmount) {
          const postBalance = postBalances.find(
            post => post.mint === preBalance.mint && post.accountIndex === preBalance.accountIndex
          );

          if (postBalance && postBalance.uiTokenAmount) {
            const change = (postBalance.uiTokenAmount.uiAmount || 0) - (preBalance.uiTokenAmount.uiAmount || 0);
            
            if (Math.abs(change) > 0.001) {
              tokenAddress = preBalance.mint;
              amount = Math.abs(change);
              type = change > 0 ? 'BUY' : 'SELL';
              
              // Estimate price from SOL change
              const solChange = this.calculateSOLChange(tx);
              priceUsd = amount > 0 ? (solChange * await this.getSOLPrice()) / amount : 0;
              break;
            }
          }
        }
      }

      return {
        signature: signature.signature,
        timestamp: new Date(tx.blockTime * 1000),
        type,
        tokenAddress,
        amount,
        priceUsd,
        success: !tx.meta.err
      };

    } catch (error) {
      console.error('Error parsing transaction:', error);
      return null;
    }
  }

  // Calculate SOL amount change in transaction
  private calculateSOLChange(tx: ParsedTransactionWithMeta): number {
    if (!tx.meta) return 0;
    
    const preBalance = tx.meta.preBalances[0] || 0;
    const postBalance = tx.meta.postBalances[0] || 0;
    const fee = tx.meta.fee || 0;
    
    return Math.abs((preBalance - postBalance - fee) / 1e9);
  }

  // Get current SOL price
  private async getSOLPrice(): Promise<number> {
    try {
      // In production, use CoinGecko or similar API
      return 100; // Mock price
    } catch (error) {
      return 100; // Fallback price
    }
  }

  // Enhanced token holdings with metadata
  private async getTokenHoldings(publicKey: PublicKey): Promise<TokenHolding[]> {
    try {
      const response = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      const holdings: TokenHolding[] = [];

      for (const account of response.value) {
        const accountInfo = account.account.data.parsed.info;
        const mint = accountInfo.mint;
        const amount = accountInfo.tokenAmount.uiAmount || 0;

        if (amount > 0) {
          const metadata = await this.getTokenMetadata(mint);
          const priceData = await this.getTokenPrice(mint);

          holdings.push({
            address: mint,
            symbol: metadata.symbol,
            name: metadata.name,
            amount,
            valueUsd: amount * priceData.current,
            priceChange24h: priceData.change24h
          });
        }
      }

      return holdings.sort((a, b) => b.valueUsd - a.valueUsd);

    } catch (error) {
      console.error('Error fetching token holdings:', error);
      return [];
    }
  }

  // NFT holdings analysis
  private async getNFTHoldings(publicKey: PublicKey): Promise<NFTHolding[]> {
    try {
      // This would integrate with Metaplex or similar NFT indexer
      // For now, return mock data
      return [];
    } catch (error) {
      console.error('Error fetching NFT holdings:', error);
      return [];
    }
  }

  // Trading pattern analysis
  private async analyzeTradingPatterns(transactions: Transaction[]): Promise<TradingPattern[]> {
    const patterns: TradingPattern[] = [];

    // Analyze for paper hands behavior
    const paperHandsPattern = this.detectPaperHands(transactions);
    if (paperHandsPattern) patterns.push(paperHandsPattern);

    // Analyze for diamond hands behavior
    const diamondHandsPattern = this.detectDiamondHands(transactions);
    if (diamondHandsPattern) patterns.push(diamondHandsPattern);

    // Analyze for FOMO buying
    const fomoPattern = this.detectFOMOBuying(transactions);
    if (fomoPattern) patterns.push(fomoPattern);

    return patterns;
  }

  // Detect paper hands behavior
  private detectPaperHands(transactions: Transaction[]): TradingPattern | null {
    const sellTransactions = transactions.filter(tx => tx.type === 'SELL');
    const quickSells = sellTransactions.filter(tx => {
      const buyTx = transactions.find(btx => 
        btx.tokenAddress === tx.tokenAddress && 
        btx.type === 'BUY' &&
        new Date(btx.timestamp).getTime() < new Date(tx.timestamp).getTime() &&
        new Date(tx.timestamp).getTime() - new Date(btx.timestamp).getTime() < 24 * 60 * 60 * 1000 // Within 24 hours
      );
      return buyTx && tx.priceUsd < buyTx.priceUsd * 1.5; // Sold before 50% gain
    });

    if (quickSells.length >= 3) {
      return {
        type: 'PAPER_HANDS',
        confidence: Math.min(quickSells.length / 10, 1),
        description: `Tendency to sell tokens quickly, often missing larger gains. ${quickSells.length} quick sells detected.`,
        examples: quickSells.slice(0, 3)
      };
    }

    return null;
  }

  // Detect diamond hands behavior
  private detectDiamondHands(transactions: Transaction[]): TradingPattern | null {
    const longHolds = transactions.filter(tx => tx.type === 'BUY').filter(buyTx => {
      const sellTx = transactions.find(stx => 
        stx.tokenAddress === buyTx.tokenAddress && 
        stx.type === 'SELL' &&
        new Date(stx.timestamp).getTime() > new Date(buyTx.timestamp).getTime()
      );
      
      if (sellTx) {
        const holdTime = new Date(sellTx.timestamp).getTime() - new Date(buyTx.timestamp).getTime();
        return holdTime > 30 * 24 * 60 * 60 * 1000; // Held for more than 30 days
      }
      
      return false; // Still holding
    });

    if (longHolds.length >= 2) {
      return {
        type: 'DIAMOND_HANDS',
        confidence: Math.min(longHolds.length / 5, 1),
        description: `Strong tendency to hold positions for extended periods. ${longHolds.length} long holds detected.`,
        examples: longHolds.slice(0, 3)
      };
    }

    return null;
  }

  // Detect FOMO buying patterns
  private detectFOMOBuying(transactions: Transaction[]): TradingPattern | null {
    const buyTransactions = transactions.filter(tx => tx.type === 'BUY');
    const fomoScore = buyTransactions.filter(tx => {
      // Look for multiple buys of same token in short time periods
      const sameDayBuys = buyTransactions.filter(otherTx => 
        otherTx.tokenAddress === tx.tokenAddress &&
        Math.abs(new Date(otherTx.timestamp).getTime() - new Date(tx.timestamp).getTime()) < 24 * 60 * 60 * 1000
      );
      return sameDayBuys.length > 1;
    }).length;

    if (fomoScore >= 3) {
      return {
        type: 'FOMO_BUYER',
        confidence: Math.min(fomoScore / 10, 1),
        description: `Tendency to make impulsive purchases, often multiple buys of the same token. ${fomoScore} FOMO episodes detected.`,
        examples: buyTransactions.slice(0, 3)
      };
    }

    return null;
  }

  // Determine overall trading personality
  private determineTradingPersonality(
    transactions: Transaction[], 
    patterns: TradingPattern[]
  ): TradingPersonality {
    const totalValue = transactions.reduce((sum, tx) => sum + (tx.amount * tx.priceUsd), 0);
    
    let type: 'DEGENERATE' | 'CONSERVATIVE' | 'SWING_TRADER' | 'WHALE' | 'SHRIMP';
    const traits: string[] = [];

    // Determine type based on transaction volume and patterns
    if (totalValue > 100000) {
      type = 'WHALE';
      traits.push('high-volume-trader', 'market-mover');
    } else if (totalValue < 1000) {
      type = 'SHRIMP';
      traits.push('small-trader', 'learning');
    } else if (patterns.some(p => p.type === 'FOMO_BUYER')) {
      type = 'DEGENERATE';
      traits.push('risk-taker', 'impulsive', 'FOMO-prone');
    } else if (patterns.some(p => p.type === 'DIAMOND_HANDS')) {
      type = 'CONSERVATIVE';
      traits.push('patient', 'long-term-focused', 'steady');
    } else {
      type = 'SWING_TRADER';
      traits.push('balanced', 'tactical', 'opportunistic');
    }

    // Add pattern-based traits
    if (patterns.some(p => p.type === 'PAPER_HANDS')) {
      traits.push('impatient', 'profit-taker');
    }

    const riskTolerance = this.calculateRiskTolerance(transactions);
    const emotionalState = this.determineEmotionalState(patterns);

    return {
      type,
      traits,
      riskTolerance,
      emotionalState
    };
  }

  // Calculate risk tolerance
  private calculateRiskTolerance(transactions: Transaction[]): number {
    const tokenDiversity = new Set(transactions.map(tx => tx.tokenAddress)).size;
    const avgTransactionSize = transactions.reduce((sum, tx) => sum + (tx.amount * tx.priceUsd), 0) / transactions.length;
    
    // Risk score based on diversity and transaction size
    return Math.min(Math.round((tokenDiversity / 10 + avgTransactionSize / 1000) * 5), 10);
  }

  // Determine emotional state
  private determineEmotionalState(patterns: TradingPattern[]): string {
    if (patterns.some(p => p.type === 'FOMO_BUYER')) {
      return 'anxious and impulsive';
    } else if (patterns.some(p => p.type === 'PAPER_HANDS')) {
      return 'nervous but profit-focused';
    } else if (patterns.some(p => p.type === 'DIAMOND_HANDS')) {
      return 'confident and patient';
    } else {
      return 'balanced and rational';
    }
  }

  // Calculate overall risk score
  private calculateRiskScore(transactions: Transaction[], patterns: TradingPattern[]): number {
    let score = 50; // Base score

    // Adjust based on trading patterns
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'FOMO_BUYER':
          score += 20 * pattern.confidence;
          break;
        case 'PAPER_HANDS':
          score += 15 * pattern.confidence;
          break;
        case 'DIAMOND_HANDS':
          score -= 10 * pattern.confidence;
          break;
      }
    });

    // Adjust based on transaction frequency
    const avgDaysBetweenTx = this.calculateAvgDaysBetweenTransactions(transactions);
    if (avgDaysBetweenTx < 1) score += 15; // Very frequent trading
    if (avgDaysBetweenTx > 7) score -= 10; // Infrequent trading

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateAvgDaysBetweenTransactions(transactions: Transaction[]): number {
    if (transactions.length < 2) return 0;
    
    const sorted = transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const totalDays = (new Date(sorted[sorted.length - 1].timestamp).getTime() - new Date(sorted[0].timestamp).getTime()) / (24 * 60 * 60 * 1000);
    
    return totalDays / (transactions.length - 1);
  }

  // Find missed opportunities
  private async findMissedOpportunities(transactions: Transaction[]): Promise<string[]> {
    const opportunities: string[] = [];

    // Look for tokens that were sold but later pumped
    const sellTxs = transactions.filter(tx => tx.type === 'SELL');
    
    for (const sellTx of sellTxs.slice(0, 5)) { // Check top 5 recent sells
      const currentPrice = await this.getCurrentTokenPrice(sellTx.tokenAddress);
      if (currentPrice > sellTx.priceUsd * 2) { // Token doubled after selling
        const missedGain = ((currentPrice - sellTx.priceUsd) * sellTx.amount).toFixed(2);
        opportunities.push(`Sold ${sellTx.tokenAddress} too early, missed $${missedGain} in gains`);
      }
    }

    return opportunities.slice(0, 3); // Return top 3 opportunities
  }

  // Find trade regrets
  private async findTradeRegrets(transactions: Transaction[]): Promise<string[]> {
    const regrets: string[] = [];

    // Look for tokens bought at high prices that are now worth much less
    const buyTxs = transactions.filter(tx => tx.type === 'BUY');
    
    for (const buyTx of buyTxs.slice(0, 5)) {
      const currentPrice = await this.getCurrentTokenPrice(buyTx.tokenAddress);
      if (currentPrice < buyTx.priceUsd * 0.5) { // Token lost 50%+ value
        const loss = ((buyTx.priceUsd - currentPrice) * buyTx.amount).toFixed(2);
        regrets.push(`Bought ${buyTx.tokenAddress} at peak, down $${loss}`);
      }
    }

    return regrets.slice(0, 3);
  }

  // Utility methods
  private async getTokenMetadata(mintAddress: string): Promise<TokenMetadata> {
    // In production, fetch from token metadata program or registry
    return {
      symbol: mintAddress.slice(0, 6).toUpperCase(),
      name: `Token ${mintAddress.slice(0, 8)}`,
      decimals: 9
    };
  }

  private async getTokenPrice(mintAddress: string): Promise<PriceData> {
    // In production, integrate with Jupiter, Birdeye, or CoinGecko
    return {
      current: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 20,
      volume24h: Math.random() * 1000000,
      marketCap: Math.random() * 10000000,
      ath: Math.random() * 5000,
      athDate: new Date()
    };
  }

  private async getCurrentTokenPrice(tokenAddress: string): Promise<number> {
    const priceData = await this.getTokenPrice(tokenAddress);
    return priceData.current;
  }
}

export const walletAnalysisService = new EnhancedWalletAnalysisService();