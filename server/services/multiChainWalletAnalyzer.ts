import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createPublicClient, http, type Address } from 'viem';
import { base, avalanche } from 'viem/chains';

interface TokenTransaction {
  signature: string;
  timestamp: number;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  pricePerToken: number;
  usdValue: number;
  blockTime: number;
  chain: 'solana' | 'base' | 'avalanche';
}

interface TokenAnalysis {
  tokenAddress: string;
  symbol: string;
  name: string;
  chain: 'solana' | 'base' | 'avalanche';
  totalBought: number;
  totalSold: number;
  currentHolding: number;
  averageBuyPrice: number;
  averageSellPrice: number;
  realizedPnL: number;
  unrealizedPnL: number;
  maxPrice: number;
  currentPrice: number;
  peakPrice: number;
  peakDate: Date;
  isDust: boolean;
  isGain: boolean;
  isPaperHands: boolean;
  missedOpportunityMultiplier: number;
  transactions: TokenTransaction[];
}

interface OOFMomentCandidate {
  type: 'max_gains' | 'dusts' | 'lost_opportunities';
  tokenAnalysis: TokenAnalysis;
  oofScore: number;
  narrative: string;
  emotionalImpact: number;
  rarity: 'legendary' | 'epic' | 'rare';
}

interface MultiChainAnalysisResult {
  walletAddress: string;
  totalTransactions: number;
  totalTokensTraded: number;
  chains: ('solana' | 'base' | 'avalanche')[];
  maxGainsCandidate: OOFMomentCandidate | null;
  dustsCandidate: OOFMomentCandidate | null;
  lostOpportunitiesCandidate: OOFMomentCandidate | null;
  allTokenAnalyses: TokenAnalysis[];
  overallOOFScore: number;
  tradingPersonality: string;
  analysisComplete: boolean;
  errorMessage?: string;
}

export class MultiChainWalletAnalyzer {
  private solanaConnection: Connection;
  private baseClient: any;
  private avalancheClient: any;
  
  private readonly DUST_THRESHOLD_USD = 1; // $1
  private readonly PAPER_HANDS_THRESHOLD = 0.3; // Sold before 30% of peak
  private readonly MIN_TRANSACTIONS = 2;
  private readonly MEMECOIN_CONTRACTS = {
    solana: [
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
      'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
      '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4', // JUP
      'So11111111111111111111111111111111111111112', // WSOL
    ],
    base: [
      '0x532f27101965dd16442e59d40670faf5ebb142e4', // BRETT
      '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    ],
    avalanche: [
      '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd', // JOE
      '0x5947bb275c521040051d82396192181b413227a3', // LINK
      '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WAVAX
    ]
  };

  constructor() {
    // Initialize blockchain connections
    this.solanaConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    this.baseClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    this.avalancheClient = createPublicClient({
      chain: avalanche,
      transport: http()
    });
  }

  async analyzeMultiChainWallet(walletAddress: string): Promise<MultiChainAnalysisResult> {
    try {
      console.log(`Starting multi-chain analysis for wallet: ${walletAddress}`);
      
      const allAnalyses: TokenAnalysis[] = [];
      const supportedChains: ('solana' | 'base' | 'avalanche')[] = [];

      // Analyze Solana transactions
      try {
        const solanaAnalyses = await this.analyzeSolanaWallet(walletAddress);
        allAnalyses.push(...solanaAnalyses);
        if (solanaAnalyses.length > 0) supportedChains.push('solana');
      } catch (error) {
        console.warn('Solana analysis failed:', error);
      }

      // Analyze Base (EVM) transactions
      try {
        const baseAnalyses = await this.analyzeEvmWallet(walletAddress, 'base');
        allAnalyses.push(...baseAnalyses);
        if (baseAnalyses.length > 0) supportedChains.push('base');
      } catch (error) {
        console.warn('Base analysis failed:', error);
      }

      // Analyze Avalanche (EVM) transactions
      try {
        const avalancheAnalyses = await this.analyzeEvmWallet(walletAddress, 'avalanche');
        allAnalyses.push(...avalancheAnalyses);
        if (avalancheAnalyses.length > 0) supportedChains.push('avalanche');
      } catch (error) {
        console.warn('Avalanche analysis failed:', error);
      }

      // Generate OOF Moment candidates
      const oofCandidates = this.generateOOFMomentCandidates(allAnalyses);
      
      return {
        walletAddress,
        totalTransactions: allAnalyses.reduce((sum, analysis) => sum + analysis.transactions.length, 0),
        totalTokensTraded: allAnalyses.length,
        chains: supportedChains,
        maxGainsCandidate: oofCandidates.maxGains,
        dustsCandidate: oofCandidates.dusts,
        lostOpportunitiesCandidate: oofCandidates.lostOpportunities,
        allTokenAnalyses: allAnalyses,
        overallOOFScore: this.calculateOverallOOFScore(oofCandidates),
        tradingPersonality: this.determineTradingPersonality(allAnalyses),
        analysisComplete: true
      };

    } catch (error) {
      console.error('Multi-chain wallet analysis failed:', error);
      return {
        walletAddress,
        totalTransactions: 0,
        totalTokensTraded: 0,
        chains: [],
        maxGainsCandidate: null,
        dustsCandidate: null,
        lostOpportunitiesCandidate: null,
        allTokenAnalyses: [],
        overallOOFScore: 0,
        tradingPersonality: 'Unknown',
        analysisComplete: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async analyzeSolanaWallet(walletAddress: string): Promise<TokenAnalysis[]> {
    const publicKey = new PublicKey(walletAddress);
    
    // Get token accounts
    const tokenAccounts = await this.solanaConnection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID
    });

    // Get transaction history
    const signatures = await this.solanaConnection.getSignaturesForAddress(publicKey, { limit: 1000 });
    
    const transactions: ParsedTransactionWithMeta[] = [];
    
    // Process transactions in batches
    for (let i = 0; i < Math.min(signatures.length, 200); i += 50) {
      const batch = signatures.slice(i, i + 50);
      const batchTxs = await this.solanaConnection.getParsedTransactions(
        batch.map(sig => sig.signature),
        { maxSupportedTransactionVersion: 0 }
      );
      
      transactions.push(...batchTxs.filter(tx => tx !== null) as ParsedTransactionWithMeta[]);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Analyze token transactions
    const tokenMap = new Map<string, TokenAnalysis>();
    
    for (const tx of transactions) {
      if (!tx.blockTime) continue;
      
      const tokenTxs = this.extractSolanaTokenTransactions(tx, walletAddress);
      
      for (const tokenTx of tokenTxs) {
        if (!tokenMap.has(tokenTx.tokenAddress)) {
          const metadata = await this.getSolanaTokenMetadata(tokenTx.tokenAddress);
          tokenMap.set(tokenTx.tokenAddress, {
            tokenAddress: tokenTx.tokenAddress,
            symbol: metadata.symbol,
            name: metadata.name,
            chain: 'solana',
            totalBought: 0,
            totalSold: 0,
            currentHolding: 0,
            averageBuyPrice: 0,
            averageSellPrice: 0,
            realizedPnL: 0,
            unrealizedPnL: 0,
            maxPrice: 0,
            currentPrice: 0,
            peakPrice: 0,
            peakDate: new Date(),
            isDust: false,
            isGain: false,
            isPaperHands: false,
            missedOpportunityMultiplier: 0,
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

    const analyses = Array.from(tokenMap.values());
    
    // Calculate metrics and get current prices
    for (const analysis of analyses) {
      await this.calculateTokenMetrics(analysis);
    }

    return analyses.filter(a => a.transactions.length >= this.MIN_TRANSACTIONS);
  }

  private async analyzeEvmWallet(walletAddress: string, chain: 'base' | 'avalanche'): Promise<TokenAnalysis[]> {
    const client = chain === 'base' ? this.baseClient : this.avalancheClient;
    const contractAddresses = this.MEMECOIN_CONTRACTS[chain];
    
    const analyses: TokenAnalysis[] = [];
    
    for (const contractAddress of contractAddresses) {
      try {
        const analysis = await this.analyzeEvmToken(walletAddress, contractAddress, chain, client);
        if (analysis && analysis.transactions.length >= this.MIN_TRANSACTIONS) {
          analyses.push(analysis);
        }
      } catch (error) {
        console.warn(`Failed to analyze ${chain} token ${contractAddress}:`, error);
      }
    }
    
    return analyses;
  }

  private async analyzeEvmToken(
    walletAddress: string, 
    tokenAddress: string, 
    chain: 'base' | 'avalanche',
    client: any
  ): Promise<TokenAnalysis | null> {
    // For EVM analysis, we would need to:
    // 1. Get token transfer events from/to the wallet
    // 2. Parse DEX transactions (Uniswap, etc.)
    // 3. Calculate token metrics
    
    // This is a simplified implementation - in production, integrate with:
    // - Moralis API
    // - Alchemy API  
    // - The Graph Protocol
    // - Direct contract calls
    
    const metadata = await this.getEvmTokenMetadata(tokenAddress, chain);
    
    return {
      tokenAddress,
      symbol: metadata.symbol,
      name: metadata.name,
      chain,
      totalBought: Math.random() * 10000,
      totalSold: Math.random() * 5000,
      currentHolding: Math.random() * 1000,
      averageBuyPrice: Math.random() * 100,
      averageSellPrice: Math.random() * 150,
      realizedPnL: (Math.random() - 0.5) * 10000,
      unrealizedPnL: (Math.random() - 0.5) * 5000,
      maxPrice: Math.random() * 200,
      currentPrice: Math.random() * 100,
      peakPrice: Math.random() * 300,
      peakDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      isDust: false,
      isGain: Math.random() > 0.5,
      isPaperHands: Math.random() > 0.7,
      missedOpportunityMultiplier: Math.random() * 50,
      transactions: [] // Would be populated with real transaction data
    };
  }

  private extractSolanaTokenTransactions(tx: ParsedTransactionWithMeta, walletAddress: string): TokenTransaction[] {
    const transactions: TokenTransaction[] = [];
    
    if (!tx.meta || !tx.blockTime) return transactions;

    try {
      const preBalances = tx.meta.preTokenBalances || [];
      const postBalances = tx.meta.postTokenBalances || [];

      const balanceChanges = new Map<string, number>();

      for (const preBalance of preBalances) {
        if (preBalance.mint && preBalance.owner === walletAddress) {
          balanceChanges.set(preBalance.mint, -(preBalance.uiTokenAmount?.uiAmount || 0));
        }
      }

      for (const postBalance of postBalances) {
        if (postBalance.mint && postBalance.owner === walletAddress) {
          const current = balanceChanges.get(postBalance.mint) || 0;
          balanceChanges.set(postBalance.mint, current + (postBalance.uiTokenAmount?.uiAmount || 0));
        }
      }

      for (const [mint, change] of balanceChanges.entries()) {
        if (Math.abs(change) > 0.0001) {
          const solAmount = this.calculateSOLAmount(tx);
          const usdValue = solAmount * 100; // Approximate SOL price
          
          transactions.push({
            signature: tx.transaction.signatures[0],
            timestamp: tx.blockTime,
            tokenAddress: mint,
            tokenName: 'Unknown Token',
            tokenSymbol: mint.slice(0, 6),
            type: change > 0 ? 'buy' : 'sell',
            amount: Math.abs(change),
            pricePerToken: Math.abs(change) > 0 ? solAmount / Math.abs(change) : 0,
            usdValue,
            blockTime: tx.blockTime,
            chain: 'solana'
          });
        }
      }
    } catch (error) {
      console.error('Error extracting Solana token transactions:', error);
    }

    return transactions;
  }

  private calculateSOLAmount(tx: ParsedTransactionWithMeta): number {
    if (!tx.meta) return 0;
    
    const preBalance = tx.meta.preBalances[0] || 0;
    const postBalance = tx.meta.postBalances[0] || 0;
    
    return Math.abs((preBalance - postBalance) / 1e9);
  }

  private async calculateTokenMetrics(analysis: TokenAnalysis): Promise<void> {
    const buyTxs = analysis.transactions.filter(tx => tx.type === 'buy');
    const sellTxs = analysis.transactions.filter(tx => tx.type === 'sell');

    // Calculate average prices
    if (buyTxs.length > 0) {
      const totalBuyValue = buyTxs.reduce((sum, tx) => sum + tx.pricePerToken * tx.amount, 0);
      analysis.averageBuyPrice = totalBuyValue / analysis.totalBought;
    }

    if (sellTxs.length > 0) {
      const totalSellValue = sellTxs.reduce((sum, tx) => sum + tx.pricePerToken * tx.amount, 0);
      analysis.averageSellPrice = totalSellValue / analysis.totalSold;
    }

    // Get current price from external API
    analysis.currentPrice = await this.getCurrentTokenPrice(analysis.tokenAddress, analysis.chain);
    
    // Find peak price from historical data
    analysis.peakPrice = await this.getPeakTokenPrice(analysis.tokenAddress, analysis.chain);
    analysis.maxPrice = Math.max(analysis.peakPrice, ...analysis.transactions.map(tx => tx.pricePerToken));

    // Calculate PnL
    analysis.realizedPnL = (analysis.averageSellPrice - analysis.averageBuyPrice) * analysis.totalSold;
    analysis.unrealizedPnL = (analysis.currentPrice - analysis.averageBuyPrice) * analysis.currentHolding;

    // Calculate missed opportunity
    if (analysis.totalSold > 0 && analysis.peakPrice > analysis.averageSellPrice) {
      analysis.missedOpportunityMultiplier = analysis.peakPrice / analysis.averageSellPrice;
    }

    // Determine categories
    analysis.isDust = analysis.currentHolding * analysis.currentPrice < this.DUST_THRESHOLD_USD;
    analysis.isGain = analysis.realizedPnL > 0 || analysis.unrealizedPnL > 0;
    analysis.isPaperHands = analysis.totalSold > 0 && 
                          analysis.averageSellPrice < analysis.peakPrice * this.PAPER_HANDS_THRESHOLD;
  }

  private generateOOFMomentCandidates(analyses: TokenAnalysis[]): {
    maxGains: OOFMomentCandidate | null;
    dusts: OOFMomentCandidate | null;
    lostOpportunities: OOFMomentCandidate | null;
  } {
    // Find best candidates for each category
    const gainers = analyses.filter(a => a.isGain).sort((a, b) => 
      (b.realizedPnL + b.unrealizedPnL) - (a.realizedPnL + a.unrealizedPnL)
    );
    
    const dustCollectors = analyses.filter(a => a.isDust).sort((a, b) => 
      b.transactions.length - a.transactions.length
    );
    
    const paperHands = analyses.filter(a => a.isPaperHands).sort((a, b) => 
      b.missedOpportunityMultiplier - a.missedOpportunityMultiplier
    );

    return {
      maxGains: gainers[0] ? this.createOOFMomentCandidate(gainers[0], 'max_gains') : null,
      dusts: dustCollectors[0] ? this.createOOFMomentCandidate(dustCollectors[0], 'dusts') : null,
      lostOpportunities: paperHands[0] ? this.createOOFMomentCandidate(paperHands[0], 'lost_opportunities') : null
    };
  }

  private createOOFMomentCandidate(
    analysis: TokenAnalysis, 
    type: 'max_gains' | 'dusts' | 'lost_opportunities'
  ): OOFMomentCandidate {
    const narratives = {
      max_gains: `Legendary diamond hands! Held ${analysis.symbol} through the storm and emerged victorious with ${((analysis.realizedPnL + analysis.unrealizedPnL) / 1000).toFixed(1)}K gains.`,
      dusts: `Master dust collector! Accumulated ${analysis.symbol} tokens now worth $${(analysis.currentHolding * analysis.currentPrice).toFixed(2)}. A true connoisseur of worthless digital artifacts.`,
      lost_opportunities: `Epic paper hands moment! Sold ${analysis.symbol} before ${analysis.missedOpportunityMultiplier.toFixed(1)}x gains. The moon mission left without you.`
    };

    const oofScore = this.calculateOOFScore(analysis, type);
    
    return {
      type,
      tokenAnalysis: analysis,
      oofScore,
      narrative: narratives[type],
      emotionalImpact: this.calculateEmotionalImpact(analysis, type),
      rarity: this.determineRarity(oofScore)
    };
  }

  private calculateOOFScore(analysis: TokenAnalysis, type: string): number {
    switch (type) {
      case 'max_gains':
        return Math.min(1000, (analysis.realizedPnL + analysis.unrealizedPnL) / 100);
      case 'dusts':
        return Math.min(1000, analysis.transactions.length * 10);
      case 'lost_opportunities':
        return Math.min(1000, analysis.missedOpportunityMultiplier * 20);
      default:
        return 0;
    }
  }

  private calculateEmotionalImpact(analysis: TokenAnalysis, type: string): number {
    const baseImpact = {
      max_gains: 85,
      dusts: 60,
      lost_opportunities: 95
    };
    
    return baseImpact[type] + Math.random() * 15;
  }

  private determineRarity(oofScore: number): 'legendary' | 'epic' | 'rare' {
    if (oofScore > 750) return 'legendary';
    if (oofScore > 400) return 'epic';
    return 'rare';
  }

  private calculateOverallOOFScore(candidates: {
    maxGains: OOFMomentCandidate | null;
    dusts: OOFMomentCandidate | null;
    lostOpportunities: OOFMomentCandidate | null;
  }): number {
    const scores = [
      candidates.maxGains?.oofScore || 0,
      candidates.dusts?.oofScore || 0,
      candidates.lostOpportunities?.oofScore || 0
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / 3);
  }

  private determineTradingPersonality(analyses: TokenAnalysis[]): string {
    const gainers = analyses.filter(a => a.isGain).length;
    const losers = analyses.filter(a => !a.isGain).length;
    const paperHands = analyses.filter(a => a.isPaperHands).length;
    const dustCollectors = analyses.filter(a => a.isDust).length;
    
    if (gainers > losers && paperHands < analyses.length * 0.3) {
      return 'Diamond Hands Legend';
    } else if (paperHands > analyses.length * 0.6) {
      return 'Paper Hands Panic';
    } else if (dustCollectors > analyses.length * 0.5) {
      return 'Dust Collector Supreme';
    } else {
      return 'Degen Trader';
    }
  }

  private async getSolanaTokenMetadata(mintAddress: string): Promise<{ symbol: string; name: string }> {
    // In production, fetch from token metadata program or registry
    return {
      symbol: mintAddress.slice(0, 6).toUpperCase(),
      name: `Token ${mintAddress.slice(0, 8)}`
    };
  }

  private async getEvmTokenMetadata(tokenAddress: string, chain: 'base' | 'avalanche'): Promise<{ symbol: string; name: string }> {
    // In production, fetch from token contract or API
    return {
      symbol: tokenAddress.slice(2, 8).toUpperCase(),
      name: `${chain.charAt(0).toUpperCase() + chain.slice(1)} Token`
    };
  }

  private async getCurrentTokenPrice(tokenAddress: string, chain: string): Promise<number> {
    // In production, integrate with:
    // - CoinGecko API
    // - Jupiter API (Solana)
    // - 1inch API (EVM)
    // - DexScreener API
    return Math.random() * 100;
  }

  private async getPeakTokenPrice(tokenAddress: string, chain: string): Promise<number> {
    // In production, fetch historical price data
    return Math.random() * 500;
  }

  // Method to check if analysis is allowed (daily limit)
  async isAnalysisAllowed(walletAddress: string): Promise<{ allowed: boolean; nextAllowedTime?: Date }> {
    // Check last analysis time from database
    // For now, allow one analysis per day
    const lastAnalysis = await this.getLastAnalysisTime(walletAddress);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (lastAnalysis && lastAnalysis > oneDayAgo) {
      const nextAllowed = new Date(lastAnalysis.getTime() + 24 * 60 * 60 * 1000);
      return { allowed: false, nextAllowedTime: nextAllowed };
    }
    
    return { allowed: true };
  }

  private async getLastAnalysisTime(walletAddress: string): Promise<Date | null> {
    // In production, query database for last analysis
    return null;
  }
}

export const multiChainWalletAnalyzer = new MultiChainWalletAnalyzer();