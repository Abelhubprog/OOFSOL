import { multiChainWalletAnalyzer } from './multiChainWalletAnalyzer';
import { storage } from '../storage';
import type { InsertOOFMoment, OOFMoment } from '@shared/schema';

interface OOFMomentCard {
  id: string;
  type: 'max_gains' | 'dusts' | 'lost_opportunities';
  title: string;
  description: string;
  quote: string;
  rarity: 'legendary' | 'epic' | 'rare';
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  chain: 'solana' | 'base' | 'avalanche';
  amount: number;
  currentValue: number;
  missedValue?: number;
  percentage: number;
  cardMetadata: {
    background: string;
    emoji: string;
    textColor: string;
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  hashtags: string[];
  analysis: {
    tokenData: any;
    metrics: Record<string, any>;
    timestamp: string;
    chain: string;
  };
  socialStats: {
    upvotes: number;
    downvotes: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

interface AIGeneratedNarrative {
  title: string;
  description: string;
  quote: string;
  emotionalTone: 'triumphant' | 'regretful' | 'philosophical' | 'humorous';
  hashtags: string[];
}

export class EnhancedOOFMomentsGenerator {
  private readonly NARRATIVE_TEMPLATES = {
    max_gains: {
      titles: [
        'Diamond Hands Triumph 💎',
        'From Zero to Hero 🚀',
        'The Legendary Hold 👑',
        'Moonshot Master 🌙',
        'Gains Gladiator ⚔️'
      ],
      quotes: [
        "When others sold in panic, I held with conviction. My diamond hands were forged in the fires of volatility!",
        "Sometimes the best strategy is no strategy at all. HODL and prosper!",
        "They called me crazy for holding. Now they call me genius.",
        "Patience isn't just a virtue in crypto - it's a superpower.",
        "From diamond hands comes diamond gains. The market rewards the patient."
      ]
    },
    dusts: {
      titles: [
        'Dust Collector Supreme 🗑️',
        'Digital Hoarder 📦',
        'Token Graveyard Keeper ⚰️',
        'Worthless Wonder 💸',
        'The Void Accumulator 🕳️'
      ],
      quotes: [
        "I don't lose money, I just collect very expensive digital dust.",
        "My portfolio is a museum of failed meme coins and abandoned dreams.",
        "Zero isn't just a number, it's a lifestyle choice.",
        "I'm not poor, I'm just diversified into worthlessness.",
        "Every dust token tells a story of hope turned to digital ash."
      ]
    },
    lost_opportunities: {
      titles: [
        'Paper Hands Panic 📄',
        'The Great Escape (Too Early) 🏃‍♂️',
        'Missed Moonshot 🚀💔',
        'Early Exit Excellence 🚪',
        'Opportunity Evader 🎯'
      ],
      quotes: [
        "Sold before the rocket ship left the launch pad. Houston, we have a regret.",
        "My timing is so perfect, I could sell ice to Eskimos and immediately regret it.",
        "Paper hands: turning diamond opportunities into tissue paper profits since forever.",
        "I didn't just miss the boat, I missed the entire marina.",
        "If there's a perfect time to sell, I'll find the moment right before it."
      ]
    }
  };

  private readonly CHAIN_EMOJIS = {
    solana: '☀️',
    base: '🔵',
    avalanche: '🏔️'
  };

  async generateEnhancedOOFMoments(
    walletAddress: string, 
    userId?: string
  ): Promise<OOFMomentCard[]> {
    try {
      console.log(`Generating enhanced OOF Moments for wallet: ${walletAddress}`);
      
      // Check daily analysis limit
      const analysisCheck = await multiChainWalletAnalyzer.isAnalysisAllowed(walletAddress);
      if (!analysisCheck.allowed) {
        throw new Error(`Analysis limit reached. Next analysis allowed at ${analysisCheck.nextAllowedTime?.toISOString()}`);
      }
      
      // Perform multi-chain wallet analysis
      const analysis = await multiChainWalletAnalyzer.analyzeMultiChainWallet(walletAddress);
      
      if (!analysis.analysisComplete) {
        throw new Error(`Analysis failed: ${analysis.errorMessage}`);
      }

      const moments: OOFMomentCard[] = [];

      // Generate Max Gains moment
      if (analysis.maxGainsCandidate) {
        const maxGainsMoment = await this.generateMaxGainsMoment(analysis.maxGainsCandidate);
        moments.push(maxGainsMoment);
      }

      // Generate Dusts moment
      if (analysis.dustsCandidate) {
        const dustsMoment = await this.generateDustsMoment(analysis.dustsCandidate);
        moments.push(dustsMoment);
      }

      // Generate Lost Opportunities moment
      if (analysis.lostOpportunitiesCandidate) {
        const lostOpportunitiesMoment = await this.generateLostOpportunitiesMoment(analysis.lostOpportunitiesCandidate);
        moments.push(lostOpportunitiesMoment);
      }

      // Store analysis results
      await this.storeWalletAnalysis(walletAddress, analysis, moments);

      console.log(`Generated ${moments.length} enhanced OOF Moments`);
      return moments;

    } catch (error) {
      console.error('Enhanced OOF Moments generation failed:', error);
      throw error;
    }
  }

  private async generateMaxGainsMoment(candidate: any): Promise<OOFMomentCard> {
    const narrative = await this.generateAINarrative(candidate, 'max_gains');
    const tokenData = candidate.tokenAnalysis;
    
    return {
      id: this.generateUniqueId(),
      type: 'max_gains',
      title: narrative.title,
      description: narrative.description,
      quote: narrative.quote,
      rarity: candidate.rarity,
      tokenSymbol: tokenData.symbol,
      tokenName: tokenData.name,
      tokenAddress: tokenData.tokenAddress,
      chain: tokenData.chain,
      amount: tokenData.currentHolding,
      currentValue: tokenData.currentHolding * tokenData.currentPrice,
      percentage: ((tokenData.realizedPnL + tokenData.unrealizedPnL) / (tokenData.averageBuyPrice * tokenData.totalBought)) * 100,
      cardMetadata: {
        background: 'gradient',
        emoji: `💎${this.CHAIN_EMOJIS[tokenData.chain]}`,
        textColor: '#ffffff',
        accentColor: '#10b981',
        gradientFrom: 'from-green-500',
        gradientTo: 'to-emerald-600'
      },
      hashtags: narrative.hashtags,
      analysis: {
        tokenData,
        metrics: {
          totalGains: tokenData.realizedPnL + tokenData.unrealizedPnL,
          gainMultiplier: (tokenData.realizedPnL + tokenData.unrealizedPnL) / (tokenData.averageBuyPrice * tokenData.totalBought),
          holdingValue: tokenData.currentHolding * tokenData.currentPrice,
          chain: tokenData.chain
        },
        timestamp: new Date().toISOString(),
        chain: tokenData.chain
      },
      socialStats: this.generateSocialStats(candidate.rarity)
    };
  }

  private async generateDustsMoment(candidate: any): Promise<OOFMomentCard> {
    const narrative = await this.generateAINarrative(candidate, 'dusts');
    const tokenData = candidate.tokenAnalysis;
    
    return {
      id: this.generateUniqueId(),
      type: 'dusts',
      title: narrative.title,
      description: narrative.description,
      quote: narrative.quote,
      rarity: candidate.rarity,
      tokenSymbol: tokenData.symbol,
      tokenName: tokenData.name,
      tokenAddress: tokenData.tokenAddress,
      chain: tokenData.chain,
      amount: tokenData.currentHolding,
      currentValue: tokenData.currentHolding * tokenData.currentPrice,
      percentage: -Math.abs(((tokenData.averageBuyPrice * tokenData.totalBought) - (tokenData.currentHolding * tokenData.currentPrice)) / (tokenData.averageBuyPrice * tokenData.totalBought)) * 100,
      cardMetadata: {
        background: 'gradient',
        emoji: `🗑️${this.CHAIN_EMOJIS[tokenData.chain]}`,
        textColor: '#ffffff',
        accentColor: '#6b7280',
        gradientFrom: 'from-gray-600',
        gradientTo: 'to-gray-800'
      },
      hashtags: narrative.hashtags,
      analysis: {
        tokenData,
        metrics: {
          dustValue: tokenData.currentHolding * tokenData.currentPrice,
          originalInvestment: tokenData.averageBuyPrice * tokenData.totalBought,
          lossPercentage: Math.abs(((tokenData.averageBuyPrice * tokenData.totalBought) - (tokenData.currentHolding * tokenData.currentPrice)) / (tokenData.averageBuyPrice * tokenData.totalBought)) * 100,
          chain: tokenData.chain
        },
        timestamp: new Date().toISOString(),
        chain: tokenData.chain
      },
      socialStats: this.generateSocialStats(candidate.rarity)
    };
  }

  private async generateLostOpportunitiesMoment(candidate: any): Promise<OOFMomentCard> {
    const narrative = await this.generateAINarrative(candidate, 'lost_opportunities');
    const tokenData = candidate.tokenAnalysis;
    const missedValue = tokenData.totalSold * tokenData.peakPrice;
    const actualValue = tokenData.totalSold * tokenData.averageSellPrice;
    
    return {
      id: this.generateUniqueId(),
      type: 'lost_opportunities',
      title: narrative.title,
      description: narrative.description,
      quote: narrative.quote,
      rarity: candidate.rarity,
      tokenSymbol: tokenData.symbol,
      tokenName: tokenData.name,
      tokenAddress: tokenData.tokenAddress,
      chain: tokenData.chain,
      amount: tokenData.totalSold,
      currentValue: actualValue,
      missedValue: missedValue,
      percentage: -((missedValue - actualValue) / actualValue) * 100,
      cardMetadata: {
        background: 'gradient',
        emoji: `📄${this.CHAIN_EMOJIS[tokenData.chain]}`,
        textColor: '#ffffff',
        accentColor: '#ef4444',
        gradientFrom: 'from-red-500',
        gradientTo: 'to-orange-600'
      },
      hashtags: narrative.hashtags,
      analysis: {
        tokenData,
        metrics: {
          soldAt: tokenData.averageSellPrice,
          peakPrice: tokenData.peakPrice,
          missedOpportunityMultiplier: tokenData.missedOpportunityMultiplier,
          missedValue: missedValue - actualValue,
          chain: tokenData.chain
        },
        timestamp: new Date().toISOString(),
        chain: tokenData.chain
      },
      socialStats: this.generateSocialStats(candidate.rarity)
    };
  }

  private async generateAINarrative(candidate: any, type: 'max_gains' | 'dusts' | 'lost_opportunities'): Promise<AIGeneratedNarrative> {
    const templates = this.NARRATIVE_TEMPLATES[type];
    const tokenData = candidate.tokenAnalysis;
    
    // Select random templates
    const title = templates.titles[Math.floor(Math.random() * templates.titles.length)];
    const quote = templates.quotes[Math.floor(Math.random() * templates.quotes.length)];
    
    // Generate description based on type
    let description = '';
    let hashtags: string[] = [];
    
    switch (type) {
      case 'max_gains':
        const gainAmount = tokenData.realizedPnL + tokenData.unrealizedPnL;
        const multiplier = gainAmount / (tokenData.averageBuyPrice * tokenData.totalBought);
        description = `Achieved ${multiplier.toFixed(1)}x gains on ${tokenData.symbol} (${tokenData.chain}). Turned $${(tokenData.averageBuyPrice * tokenData.totalBought).toFixed(0)} into $${(gainAmount + tokenData.averageBuyPrice * tokenData.totalBought).toFixed(0)}. Living proof that diamond hands pay off.`;
        hashtags = ['#DiamondHands', `#${tokenData.symbol}Gains`, '#CryptoWins', `#${tokenData.chain}Success`, '#HODL'];
        break;
        
      case 'dusts':
        const dustValue = tokenData.currentHolding * tokenData.currentPrice;
        description = `Accumulated ${tokenData.currentHolding.toLocaleString()} ${tokenData.symbol} tokens on ${tokenData.chain}, now worth $${dustValue.toFixed(6)}. A masterpiece of digital minimalism and worthless asset curation.`;
        hashtags = ['#DustCollector', `#${tokenData.symbol}Dust`, '#CryptoGraveyard', `#${tokenData.chain}Fails`, '#DigitalDust'];
        break;
        
      case 'lost_opportunities':
        const missedMultiplier = tokenData.missedOpportunityMultiplier;
        description = `Sold ${tokenData.symbol} on ${tokenData.chain} before ${missedMultiplier.toFixed(1)}x gains. Paper hands strike again! The moon mission launched without this astronaut.`;
        hashtags = ['#PaperHands', `#${tokenData.symbol}Regrets`, '#MissedMoon', `#${tokenData.chain}Fails`, '#SoldTooEarly'];
        break;
    }
    
    return {
      title,
      description,
      quote,
      emotionalTone: this.determineEmotionalTone(type),
      hashtags
    };
  }

  private determineEmotionalTone(type: string): 'triumphant' | 'regretful' | 'philosophical' | 'humorous' {
    switch (type) {
      case 'max_gains': return 'triumphant';
      case 'lost_opportunities': return 'regretful';
      case 'dusts': return 'humorous';
      default: return 'philosophical';
    }
  }

  private generateSocialStats(rarity: string): {
    upvotes: number;
    downvotes: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
  } {
    const baseMultiplier = {
      legendary: 1000,
      epic: 500,
      rare: 200
    }[rarity] || 100;
    
    const variance = 0.4; // 40% variance
    const randomFactor = () => 1 + (Math.random() - 0.5) * variance;
    
    return {
      upvotes: Math.floor(baseMultiplier * 0.8 * randomFactor()),
      downvotes: Math.floor(baseMultiplier * 0.1 * randomFactor()),
      likes: Math.floor(baseMultiplier * 1.2 * randomFactor()),
      comments: Math.floor(baseMultiplier * 0.15 * randomFactor()),
      shares: Math.floor(baseMultiplier * 0.3 * randomFactor()),
      views: Math.floor(baseMultiplier * 5 * randomFactor())
    };
  }

  private generateUniqueId(): string {
    return `oof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convert moment card to database format
  convertToDBFormat(
    moment: OOFMomentCard, 
    walletAddress: string, 
    userId?: string
  ): InsertOOFMoment {
    return {
      userId,
      walletAddress,
      momentType: moment.type,
      title: moment.title,
      description: moment.description,
      quote: moment.quote,
      rarity: moment.rarity,
      tokenAddress: moment.tokenAddress,
      tokenSymbol: moment.tokenSymbol,
      tokenName: moment.tokenName,
      analysis: moment.analysis,
      cardMetadata: moment.cardMetadata,
      socialStats: moment.socialStats,
      tags: moment.hashtags,
      hashtags: moment.hashtags,
      isPublic: true
    };
  }

  private async storeWalletAnalysis(
    walletAddress: string,
    analysis: any,
    moments: OOFMomentCard[]
  ): Promise<void> {
    try {
      await storage.createWalletAnalysis({
        walletAddress,
        lastAnalyzed: new Date(),
        totalTransactions: analysis.totalTransactions,
        totalTokensTraded: analysis.totalTokensTraded,
        analysisData: {
          chains: analysis.chains,
          moments: moments.map(m => m.id),
          overallOOFScore: analysis.overallOOFScore,
          tradingPersonality: analysis.tradingPersonality
        },
        analysisMetrics: {
          maxGainsScore: analysis.maxGainsCandidate?.oofScore || 0,
          dustsScore: analysis.dustsCandidate?.oofScore || 0,
          lostOpportunitiesScore: analysis.lostOpportunitiesCandidate?.oofScore || 0
        },
        status: 'completed'
      });
    } catch (error) {
      console.error('Error storing wallet analysis:', error);
    }
  }

  // Generate visual card image URL
  generateCardImageUrl(moment: OOFMomentCard): string {
    const params = new URLSearchParams({
      id: moment.id,
      type: moment.type,
      title: moment.title,
      symbol: moment.tokenSymbol,
      chain: moment.chain,
      rarity: moment.rarity,
      emoji: moment.cardMetadata.emoji
    });
    
    return `/api/oof-moments/card-image?${params}`;
  }
}

export const enhancedOOFMomentsGenerator = new EnhancedOOFMomentsGenerator();