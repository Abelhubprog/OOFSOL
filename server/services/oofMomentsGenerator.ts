import { solanaWalletAnalysis } from './solanaWalletAnalysis';
import type { InsertOOFMoment, OOFMoment } from '@shared/schema';

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
  transactions: any[];
}

interface OOFMomentCard {
  momentType: 'paper_hands' | 'dust_collector' | 'gains_master';
  title: string;
  description: string;
  quote: string;
  rarity: 'legendary' | 'epic' | 'rare';
  cardMetadata: {
    background: string;
    emoji: string;
    textColor: string;
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  tags: string[];
  analysis: {
    tokenData: TokenAnalysis;
    metrics: Record<string, any>;
    timestamp: string;
  };
}

export class OOFMomentsGenerator {
  private readonly PAPER_HANDS_QUOTES = [
    "My hands were paper, my heart now torn, a simple hodl would've made me reborn...",
    "Sold at the bottom, bought at the peak, now my portfolio's looking rather weak.",
    "Diamond hands? More like tissue paper in a hurricane.",
    "I turned a moonshot into a crater dive with surgical precision.",
    "Exit strategy: panic sell at the worst possible moment.",
    "My timing is so bad, I could make day trading look profitable.",
    "Bought high, sold low - the art of reverse psychology on profits."
  ];

  private readonly DUST_COLLECTOR_QUOTES = [
    "Collecting digital dust like it's a precious metal collection.",
    "My wallet is a graveyard of forgotten dreams and worthless tokens.",
    "Zero balance gang - we don't lose money, we make it disappear!",
    "My tokens went to the same place as my socks in the dryer.",
    "Portfolio diversity: 47 different ways to lose money.",
    "I didn't lose money, I paid tuition to the school of hard knocks.",
    "Dust to dust, tokens to nothing - the circle of DeFi life."
  ];

  private readonly GAINS_MASTER_QUOTES = [
    "Sometimes even a broken clock is right twice a day.",
    "Luck is what happens when preparation meets opportunity... or pure dumb luck.",
    "I didn't choose the gains life, the gains life chose me.",
    "From zero to hero, with just a sprinkle of cosmic alignment.",
    "When the stars align and your ape instincts pay off.",
    "Success is 1% inspiration, 99% being in the right place at the right time.",
    "Making it rain while others make it pain."
  ];

  async generateOOFMoments(walletAddress: string, userId?: string): Promise<OOFMomentCard[]> {
    try {
      console.log(`Generating OOF Moments for wallet: ${walletAddress}`);
      
      // Analyze the wallet
      const analysis = await solanaWalletAnalysis.analyzeWallet(walletAddress);
      
      if (!analysis.analysisComplete) {
        throw new Error(`Analysis failed: ${analysis.errorMessage}`);
      }

      const moments: OOFMomentCard[] = [];

      // Generate Paper Hands moment
      if (analysis.paperHandsMoments.length > 0) {
        const paperHandsMoment = this.generatePaperHandsMoment(analysis.paperHandsMoments[0]);
        moments.push(paperHandsMoment);
      }

      // Generate Dust Collector moment
      if (analysis.dustTokens.length > 0) {
        const dustMoment = this.generateDustCollectorMoment(analysis.dustTokens);
        moments.push(dustMoment);
      }

      // Generate Gains Master moment
      if (analysis.biggestGain) {
        const gainsMoment = this.generateGainsMasterMoment(analysis.biggestGain);
        moments.push(gainsMoment);
      }

      console.log(`Generated ${moments.length} OOF Moments`);
      return moments;

    } catch (error) {
      console.error('Error generating OOF Moments:', error);
      throw error;
    }
  }

  private generatePaperHandsMoment(tokenAnalysis: TokenAnalysis): OOFMomentCard {
    const lossAmount = Math.abs(tokenAnalysis.realizedPnL);
    const potentialGain = (tokenAnalysis.maxPrice - tokenAnalysis.averageSellPrice) * tokenAnalysis.totalSold;
    const lossMultiplier = potentialGain / Math.max(lossAmount, 0.001);

    // Determine rarity based on loss magnitude
    let rarity: 'legendary' | 'epic' | 'rare';
    if (lossMultiplier > 100) {
      rarity = 'legendary';
    } else if (lossMultiplier > 10) {
      rarity = 'epic';
    } else {
      rarity = 'rare';
    }

    const quote = this.getRandomQuote(this.PAPER_HANDS_QUOTES);
    
    return {
      momentType: 'paper_hands',
      title: `The Paper Hands ${this.getRarityEmoji(rarity)}`,
      description: `Sold ${tokenAnalysis.symbol} before ${lossMultiplier.toFixed(1)}x gains. Now writes tragic poetry about diamond hands and missed opportunities.`,
      quote,
      rarity,
      cardMetadata: {
        background: 'bg-gradient-to-br from-yellow-300 to-orange-600',
        emoji: '🧻👑',
        textColor: 'text-white',
        accentColor: 'text-yellow-100',
        gradientFrom: 'from-yellow-400',
        gradientTo: 'to-orange-700'
      },
      tags: ['#PaperHandsProblems', '#MissedMoonshot', `#${tokenAnalysis.symbol}regrets`],
      analysis: {
        tokenData: tokenAnalysis,
        metrics: {
          lossAmount,
          potentialGain,
          lossMultiplier,
          sellPrice: tokenAnalysis.averageSellPrice,
          maxPrice: tokenAnalysis.maxPrice
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  private generateDustCollectorMoment(dustTokens: TokenAnalysis[]): OOFMomentCard {
    const totalDustTokens = dustTokens.length;
    const totalDustValue = dustTokens.reduce((sum, token) => sum + (token.currentHolding * token.currentPrice), 0);
    
    // Find the most worthless token
    const worstDust = dustTokens.sort((a, b) => 
      (a.currentHolding * a.currentPrice) - (b.currentHolding * b.currentPrice)
    )[0];

    // Determine rarity based on dust collection prowess
    let rarity: 'legendary' | 'epic' | 'rare';
    if (totalDustTokens > 20) {
      rarity = 'legendary';
    } else if (totalDustTokens > 10) {
      rarity = 'epic';
    } else {
      rarity = 'rare';
    }

    const quote = this.getRandomQuote(this.DUST_COLLECTOR_QUOTES);

    return {
      momentType: 'dust_collector',
      title: `The Dust Collector ${this.getRarityEmoji(rarity)}`,
      description: `Accumulated ${totalDustTokens} dust tokens worth $${totalDustValue.toFixed(6)}. Professional curator of worthless digital artifacts.`,
      quote,
      rarity,
      cardMetadata: {
        background: 'bg-gradient-to-br from-gray-500 to-gray-800',
        emoji: '🗑️💎',
        textColor: 'text-white',
        accentColor: 'text-gray-200',
        gradientFrom: 'from-gray-600',
        gradientTo: 'to-gray-900'
      },
      tags: ['#DustCollector', '#TokenGraveyard', '#DigitalHoarder'],
      analysis: {
        tokenData: worstDust,
        metrics: {
          totalDustTokens,
          totalDustValue,
          worstTokenValue: worstDust.currentHolding * worstDust.currentPrice,
          averageDustValue: totalDustValue / totalDustTokens
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  private generateGainsMasterMoment(tokenAnalysis: TokenAnalysis): OOFMomentCard {
    const totalGain = tokenAnalysis.realizedPnL + tokenAnalysis.unrealizedPnL;
    const gainMultiplier = totalGain / Math.max(tokenAnalysis.averageBuyPrice * tokenAnalysis.totalBought, 0.001);

    // Determine rarity based on gains magnitude
    let rarity: 'legendary' | 'epic' | 'rare';
    if (gainMultiplier > 100) {
      rarity = 'legendary';
    } else if (gainMultiplier > 10) {
      rarity = 'epic';
    } else {
      rarity = 'rare';
    }

    const quote = this.getRandomQuote(this.GAINS_MASTER_QUOTES);

    return {
      momentType: 'gains_master',
      title: `The Gains Master ${this.getRarityEmoji(rarity)}`,
      description: `Achieved ${gainMultiplier.toFixed(1)}x gains on ${tokenAnalysis.symbol}. Living proof that sometimes apes together strong.`,
      quote,
      rarity,
      cardMetadata: {
        background: 'bg-gradient-to-br from-green-400 to-emerald-700',
        emoji: '💎🚀',
        textColor: 'text-white',
        accentColor: 'text-green-100',
        gradientFrom: 'from-green-500',
        gradientTo: 'to-emerald-800'
      },
      tags: ['#GainsMaster', '#DiamondHands', `#${tokenAnalysis.symbol}moonshot`],
      analysis: {
        tokenData: tokenAnalysis,
        metrics: {
          totalGain,
          gainMultiplier,
          buyPrice: tokenAnalysis.averageBuyPrice,
          currentPrice: tokenAnalysis.currentPrice,
          holdingValue: tokenAnalysis.currentHolding * tokenAnalysis.currentPrice
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  private getRandomQuote(quotes: string[]): string {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  private getRarityEmoji(rarity: 'legendary' | 'epic' | 'rare'): string {
    switch (rarity) {
      case 'legendary': return '👑';
      case 'epic': return '🏆';
      case 'rare': return '⭐';
    }
  }

  // Generate social stats based on card quality and timing
  generateSocialStats(moment: OOFMomentCard): { likes: number; shares: number; comments: number } {
    const baseEngagement = moment.rarity === 'legendary' ? 1000 : 
                          moment.rarity === 'epic' ? 500 : 250;
    
    const variance = 0.3; // 30% variance
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    
    return {
      likes: Math.floor(baseEngagement * randomFactor),
      shares: Math.floor(baseEngagement * 0.2 * randomFactor),
      comments: Math.floor(baseEngagement * 0.1 * randomFactor)
    };
  }

  // Convert moment card to database format
  convertToDBFormat(
    moment: OOFMomentCard, 
    walletAddress: string, 
    userId?: string
  ): InsertOOFMoment {
    const socialStats = this.generateSocialStats(moment);
    
    return {
      userId,
      walletAddress,
      momentType: moment.momentType,
      title: moment.title,
      description: moment.description,
      quote: moment.quote,
      rarity: moment.rarity,
      tokenAddress: moment.analysis.tokenData.tokenAddress,
      tokenSymbol: moment.analysis.tokenData.symbol,
      tokenName: moment.analysis.tokenData.name,
      analysis: moment.analysis,
      cardMetadata: moment.cardMetadata,
      socialStats,
      tags: moment.tags,
      isPublic: true
    };
  }
}

export const oofMomentsGenerator = new OOFMomentsGenerator();