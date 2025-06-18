import { Connection, PublicKey } from '@solana/web3.js';
import { storage } from '../storage';
import { OOFOrchestrator } from '../agents/orchestrator/coordinator';

interface WalletTransaction {
  signature: string;
  blockTime: number;
  tokenAddress: string;
  amount: number;
  type: 'buy' | 'sell';
  price: number;
  tokenName?: string;
  tokenSymbol?: string;
}

interface OOFMomentCard {
  id: string;
  type: 'paper_hands' | 'dust_collector' | 'gains_master';
  title: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: number;
  currentValue: number;
  percentage: number;
  gradientFrom: string;
  gradientTo: string;
  emoji: string;
  story: string;
  timestamp: number;
  uniqueHash: string;
}

interface PerplexityAnalysis {
  paperHandsStory: string;
  dustCollectorStory: string;
  gainsMasterStory: string;
  walletSummary: string;
  tradingStyle: string;
}

export class AILOOFMomentsGenerator {
  private connection: Connection;
  private perplexityApiKey: string;
  private orchestrator: OOFOrchestrator;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    this.orchestrator = new OOFOrchestrator();
  }

  async generateOOFMoments(walletAddress: string): Promise<OOFMomentCard[]> {
    try {
      // Use enhanced multi-agent AI orchestrator for intelligent generation
      const validatedResults = await this.orchestrator.generateOOFMoments(walletAddress);
      
      // Convert orchestrator results to expected format
      const cards = validatedResults.cards.map(card => this.convertToOOFMomentCard(card));
      
      // Store enhanced analysis with quality metrics
      await this.storeWalletAnalysis(walletAddress, cards, {
        quality: validatedResults.quality,
        recommendations: validatedResults.recommendations,
        modelUsage: cards[0]?.uniqueHash || ''
      });
      
      return cards;
    } catch (error) {
      console.error('Enhanced AI generation failed, using fallback:', error);
      
      // Fallback to original method
      const transactions = await this.fetchWalletTransactions(walletAddress);
      const aiAnalysis = await this.analyzeWithPerplexity(walletAddress, transactions);
      const oofMoments = this.identifyOOFMoments(transactions);
      const cards = await this.generateUniqueCards(walletAddress, oofMoments, aiAnalysis);
      
      await this.storeWalletAnalysis(walletAddress, cards, aiAnalysis);
      return cards;
    }
  }

  private convertToOOFMomentCard(card: any): OOFMomentCard {
    return {
      id: card.id,
      type: card.type === 'bigGains' ? 'gains_master' : card.type === 'dust' ? 'dust_collector' : 'paper_hands',
      title: card.title,
      description: card.narrative,
      tokenName: card.tokenData.name,
      tokenSymbol: card.tokenData.symbol,
      tokenAddress: card.tokenData.address,
      amount: card.tokenData.amount,
      currentValue: card.tokenData.currentPrice * card.tokenData.amount,
      percentage: card.stats.percentage,
      gradientFrom: card.visualElements.colors[0] || '#ff6b6b',
      gradientTo: card.visualElements.colors[1] || '#ffa8a8',
      emoji: card.visualElements.emoji,
      story: card.quote,
      timestamp: card.metadata.generatedAt,
      uniqueHash: card.id
    };
  }

  private async fetchWalletTransactions(walletAddress: string): Promise<WalletTransaction[]> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 1000 });
      
      const transactions: WalletTransaction[] = [];
      
      for (const sig of signatures.slice(0, 100)) { // Limit to recent 100 transactions
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (tx && tx.meta && tx.blockTime) {
            // Parse transaction for token trades
            const parsedTx = this.parseTransaction(tx, walletAddress);
            if (parsedTx) {
              transactions.push(parsedTx);
            }
          }
        } catch (error) {
          // Skip failed transactions
          continue;
        }
      }
      
      return transactions.sort((a, b) => b.blockTime - a.blockTime);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      return [];
    }
  }

  private parseTransaction(tx: any, walletAddress: string): WalletTransaction | null {
    try {
      // Simplified transaction parsing - in production, use proper SPL token parsing
      const postTokenBalances = tx.meta?.postTokenBalances || [];
      const preTokenBalances = tx.meta?.preTokenBalances || [];
      
      for (const postBalance of postTokenBalances) {
        const preBalance = preTokenBalances.find(
          (pre: any) => pre.accountIndex === postBalance.accountIndex
        );
        
        if (preBalance && postBalance.owner === walletAddress) {
          const amountChange = postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount;
          
          if (Math.abs(amountChange) > 0) {
            return {
              signature: tx.transaction.signatures[0],
              blockTime: tx.blockTime,
              tokenAddress: postBalance.mint,
              amount: Math.abs(amountChange),
              type: amountChange > 0 ? 'buy' : 'sell',
              price: 0, // Would need DEX data for actual price
              tokenName: 'Unknown Token',
              tokenSymbol: 'UNK'
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async analyzeWithPerplexity(walletAddress: string, transactions: WalletTransaction[]): Promise<PerplexityAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(walletAddress, transactions);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert crypto trading analyst who specializes in identifying missed opportunities and trading patterns. Create engaging, humorous, but insightful stories about trading moments.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      return this.parsePerplexityResponse(analysis);
    } catch (error) {
      console.error('Perplexity analysis error:', error);
      return this.getFallbackAnalysis();
    }
  }

  private buildAnalysisPrompt(walletAddress: string, transactions: WalletTransaction[]): string {
    const recentTrades = transactions.slice(0, 20);
    const tradingSummary = this.summarizeTrading(recentTrades);
    
    return `
Analyze this Solana wallet's trading history and create 3 unique "OOF Moment" stories:

Wallet: ${walletAddress}
Trading Summary: ${tradingSummary}

Recent Transactions:
${recentTrades.map(tx => `- ${tx.type.toUpperCase()} ${tx.amount} ${tx.tokenSymbol} on ${new Date(tx.blockTime * 1000).toDateString()}`).join('\n')}

Please provide:
1. PAPER_HANDS_STORY: A humorous story about selling too early (50-100 words)
2. DUST_COLLECTOR_STORY: A story about buying tokens that became worthless (50-100 words)  
3. GAINS_MASTER_STORY: A story about a successful trade or missed massive gain (50-100 words)
4. WALLET_SUMMARY: Overall trading style assessment (30-50 words)
5. TRADING_STYLE: One word description (Degen, Conservative, HODLER, Flipper, etc.)

Format your response with clear section headers.
`;
  }

  private summarizeTrading(transactions: WalletTransaction[]): string {
    const totalTrades = transactions.length;
    const buyCount = transactions.filter(tx => tx.type === 'buy').length;
    const sellCount = transactions.filter(tx => tx.type === 'sell').length;
    const uniqueTokens = new Set(transactions.map(tx => tx.tokenAddress)).size;
    
    return `${totalTrades} total trades, ${buyCount} buys, ${sellCount} sells, ${uniqueTokens} unique tokens`;
  }

  private parsePerplexityResponse(analysis: string): PerplexityAnalysis {
    const sections = analysis.split('\n');
    
    const extractSection = (header: string): string => {
      const sectionIndex = sections.findIndex(line => 
        line.toLowerCase().includes(header.toLowerCase())
      );
      if (sectionIndex !== -1) {
        const nextSectionIndex = sections.findIndex((line, index) => 
          index > sectionIndex && line.includes(':') && line.length < 50
        );
        const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : sections.length;
        return sections.slice(sectionIndex + 1, endIndex).join(' ').trim();
      }
      return '';
    };

    return {
      paperHandsStory: extractSection('PAPER_HANDS_STORY') || 'Sold too early and missed the moon mission.',
      dustCollectorStory: extractSection('DUST_COLLECTOR_STORY') || 'Collected tokens that turned to digital dust.',
      gainsMasterStory: extractSection('GAINS_MASTER_STORY') || 'Had diamond hands but sold at the wrong time.',
      walletSummary: extractSection('WALLET_SUMMARY') || 'A typical crypto trader with mixed results.',
      tradingStyle: extractSection('TRADING_STYLE') || 'Degen'
    };
  }

  private getFallbackAnalysis(): PerplexityAnalysis {
    return {
      paperHandsStory: 'This wallet shows classic paper hands behavior - selling promising tokens too early and missing out on significant gains.',
      dustCollectorStory: 'A true collector of digital dust, this wallet accumulated several tokens that never recovered their initial value.',
      gainsMasterStory: 'Despite some setbacks, this wallet managed to identify and capitalize on a few winning trades.',
      walletSummary: 'Mixed trading performance with typical retail investor patterns.',
      tradingStyle: 'Degen'
    };
  }

  private identifyOOFMoments(transactions: WalletTransaction[]): {
    paperHands: WalletTransaction | null;
    dustCollector: WalletTransaction | null;
    gainsMaster: WalletTransaction | null;
  } {
    // Identify most significant trades for each category
    const sells = transactions.filter(tx => tx.type === 'sell');
    const buys = transactions.filter(tx => tx.type === 'buy');
    
    return {
      paperHands: sells.length > 0 ? sells[0] : null,
      dustCollector: buys.find(tx => tx.amount < 1000) || (buys.length > 0 ? buys[0] : null),
      gainsMaster: transactions.find(tx => tx.amount > 10000) || (transactions.length > 0 ? transactions[0] : null)
    };
  }

  private async generateUniqueCards(
    walletAddress: string, 
    moments: any, 
    analysis: PerplexityAnalysis
  ): Promise<OOFMomentCard[]> {
    const uniqueHash = this.generateUniqueHash(walletAddress);
    const timestamp = Date.now();
    
    const cards: OOFMomentCard[] = [
      {
        id: `${uniqueHash}-paper-hands`,
        type: 'paper_hands',
        title: 'Paper Hands Panic',
        description: analysis.paperHandsStory,
        tokenName: moments.paperHands?.tokenName || 'FOMO Token',
        tokenSymbol: moments.paperHands?.tokenSymbol || 'FOMO',
        tokenAddress: moments.paperHands?.tokenAddress || 'Unknown',
        amount: moments.paperHands?.amount || 1000,
        currentValue: 0,
        percentage: -75,
        gradientFrom: '#ef4444',
        gradientTo: '#dc2626',
        emoji: '📄',
        story: analysis.paperHandsStory,
        timestamp,
        uniqueHash: `${uniqueHash}-paper`
      },
      {
        id: `${uniqueHash}-dust-collector`,
        type: 'dust_collector',
        title: 'Dust Collector Supreme',
        description: analysis.dustCollectorStory,
        tokenName: moments.dustCollector?.tokenName || 'Dust Token',
        tokenSymbol: moments.dustCollector?.tokenSymbol || 'DUST',
        tokenAddress: moments.dustCollector?.tokenAddress || 'Unknown',
        amount: moments.dustCollector?.amount || 100000,
        currentValue: 0.01,
        percentage: -99,
        gradientFrom: '#6b7280',
        gradientTo: '#4b5563',
        emoji: '🗑️',
        story: analysis.dustCollectorStory,
        timestamp,
        uniqueHash: `${uniqueHash}-dust`
      },
      {
        id: `${uniqueHash}-gains-master`,
        type: 'gains_master',
        title: 'Gains Master',
        description: analysis.gainsMasterStory,
        tokenName: moments.gainsMaster?.tokenName || 'Moon Token',
        tokenSymbol: moments.gainsMaster?.tokenSymbol || 'MOON',
        tokenAddress: moments.gainsMaster?.tokenAddress || 'Unknown',
        amount: moments.gainsMaster?.amount || 500,
        currentValue: 5000,
        percentage: 900,
        gradientFrom: '#10b981',
        gradientTo: '#059669',
        emoji: '💎',
        story: analysis.gainsMasterStory,
        timestamp,
        uniqueHash: `${uniqueHash}-gains`
      }
    ];

    return cards;
  }

  private generateUniqueHash(walletAddress: string): string {
    const timestamp = Date.now().toString();
    const combined = walletAddress + timestamp;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private async storeWalletAnalysis(
    walletAddress: string, 
    cards: OOFMomentCard[], 
    analysis: PerplexityAnalysis
  ): Promise<void> {
    try {
      await storage.createWalletAnalysis({
        walletAddress,
        analysisData: {
          cards,
          analysis,
          tradingStyle: analysis.tradingStyle,
          summary: analysis.walletSummary
        },
        lastAnalyzed: new Date(),
        oofScore: this.calculateOOFScore(cards)
      });
    } catch (error) {
      console.error('Error storing wallet analysis:', error);
    }
  }

  private calculateOOFScore(cards: OOFMomentCard[]): number {
    // Calculate OOF score based on trading patterns
    let score = 0;
    
    cards.forEach(card => {
      switch (card.type) {
        case 'paper_hands':
          score += Math.abs(card.percentage) * 0.5;
          break;
        case 'dust_collector':
          score += Math.abs(card.percentage) * 0.3;
          break;
        case 'gains_master':
          score += card.percentage * 0.2;
          break;
      }
    });
    
    return Math.round(Math.max(0, Math.min(1000, score)));
  }
}

export const aiOOFGenerator = new AILOOFMomentsGenerator();