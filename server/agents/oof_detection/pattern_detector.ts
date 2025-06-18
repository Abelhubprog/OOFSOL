import { ModelRoutingAgent } from '../routing/model_router';
import { AnalysisResult, OOFMoment } from '../orchestrator/coordinator';
import { TokenTransaction } from '../data/wallet_fetcher';

export interface TradingPattern {
  type: 'paperHands' | 'dustCollector' | 'diamondHands' | 'fomo' | 'rugPull';
  frequency: number;
  avgImpact: number;
  examples: TokenTransaction[];
}

export interface MarketInsight {
  insight: string;
  confidence: number;
  supportingData: any[];
}

export interface RiskProfile {
  riskTolerance: 'low' | 'medium' | 'high';
  diversification: number;
  leverageUsage: number;
  stopLossUsage: number;
}

export interface TradingBehavior {
  tradingFrequency: 'low' | 'medium' | 'high';
  averagePositionSize: number;
  preferredTokenTypes: string[];
  emotionalTrading: number; // 0-1 scale
}

export class OOFMomentAgent {
  constructor(private modelRouter: ModelRoutingAgent) {}

  async identifyOOFMoments(analysisData: AnalysisResult): Promise<OOFMoment[]> {
    const patterns = analysisData.patterns;
    const oofMoments: OOFMoment[] = [];

    // Detect Paper Hands moments
    const paperHandsPattern = patterns.find(p => p.type === 'paperHands');
    if (paperHandsPattern && paperHandsPattern.examples.length > 0) {
      const paperHandsMoment = await this.createPaperHandsMoment(paperHandsPattern.examples[0]);
      if (paperHandsMoment) oofMoments.push(paperHandsMoment);
    }

    // Detect Dust Collector moments
    const dustPattern = patterns.find(p => p.type === 'dustCollector');
    if (dustPattern && dustPattern.examples.length > 0) {
      const dustMoment = await this.createDustMoment(dustPattern.examples[0]);
      if (dustMoment) oofMoments.push(dustMoment);
    }

    // Detect Big Gains moments
    const diamondHandsPattern = patterns.find(p => p.type === 'diamondHands');
    if (diamondHandsPattern && diamondHandsPattern.examples.length > 0) {
      const gainsMoment = await this.createGainsMoment(diamondHandsPattern.examples[0]);
      if (gainsMoment) oofMoments.push(gainsMoment);
    }

    // Generate narratives for each moment using AI
    for (const moment of oofMoments) {
      moment.narrative = await this.generateNarrative(moment);
    }

    return oofMoments;
  }

  private async createPaperHandsMoment(transaction: TokenTransaction): Promise<OOFMoment | null> {
    if (transaction.action !== 'sell') return null;

    // Calculate missed gains if held
    const currentPrice = await this.getCurrentTokenPrice(transaction.tokenAddress);
    const missedGains = (currentPrice - transaction.price) * transaction.amount;

    if (missedGains <= 0) return null; // Not a paper hands moment if no missed gains

    return {
      type: 'paperHands',
      tokenAddress: transaction.tokenAddress,
      tokenSymbol: transaction.tokenSymbol,
      entryPrice: transaction.price * 0.8, // Estimate entry price
      exitPrice: transaction.price,
      currentPrice,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      narrative: '', // Will be filled by generateNarrative
      impact: missedGains
    };
  }

  private async createDustMoment(transaction: TokenTransaction): Promise<OOFMoment | null> {
    const currentPrice = await this.getCurrentTokenPrice(transaction.tokenAddress);
    const currentValue = currentPrice * transaction.amount;
    
    // Check if token value dropped significantly
    const lossPercentage = (transaction.price - currentPrice) / transaction.price;
    
    if (lossPercentage < 0.8) return null; // Must be at least 80% loss

    return {
      type: 'dust',
      tokenAddress: transaction.tokenAddress,
      tokenSymbol: transaction.tokenSymbol,
      entryPrice: transaction.price,
      currentPrice,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      narrative: '',
      impact: currentValue - (transaction.price * transaction.amount)
    };
  }

  private async createGainsMoment(transaction: TokenTransaction): Promise<OOFMoment | null> {
    if (transaction.action !== 'buy') return null;

    const currentPrice = await this.getCurrentTokenPrice(transaction.tokenAddress);
    const gainPercentage = (currentPrice - transaction.price) / transaction.price;

    if (gainPercentage < 2) return null; // Must be at least 200% gain

    const totalGain = (currentPrice - transaction.price) * transaction.amount;

    return {
      type: 'bigGains',
      tokenAddress: transaction.tokenAddress,
      tokenSymbol: transaction.tokenSymbol,
      entryPrice: transaction.price,
      currentPrice,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      narrative: '',
      impact: totalGain
    };
  }

  private async generateNarrative(moment: OOFMoment): Promise<string> {
    const modelSelection = await this.modelRouter.selectBestModel(
      'narrative generation for OOF moment',
      {
        complexity: 'medium',
        creativity: 'high',
        accuracy: 'medium',
        speed: 'medium',
        maxCost: 0.01,
        fallbackRequired: true
      }
    );

    const prompt = this.buildNarrativePrompt(moment);

    try {
      const response = await this.modelRouter.executeWithModel<{ narrative: string }>(
        modelSelection.primary,
        prompt
      );
      
      return response.narrative;
    } catch (error) {
      console.error('Failed to generate narrative:', error);
      return this.getFallbackNarrative(moment);
    }
  }

  private buildNarrativePrompt(moment: OOFMoment): string {
    const date = new Date(moment.timestamp).toLocaleDateString();
    
    switch (moment.type) {
      case 'paperHands':
        return `
Generate a witty, empathetic narrative for a crypto paper hands moment. 
Token: ${moment.tokenSymbol}
Sold at: $${moment.exitPrice?.toFixed(6)}
Current price: $${moment.currentPrice.toFixed(6)}
Missed gains: $${moment.impact.toFixed(2)}
Date: ${date}

Create a personalized story that:
- Is humorous but empathetic
- Captures the regret of selling early
- Includes actual numbers
- Is 1-2 sentences max
- Ends with a memorable quote about the pain

Return JSON: { "narrative": "your narrative here" }
        `;

      case 'dust':
        return `
Generate a narrative for a crypto dust collector moment.
Token: ${moment.tokenSymbol}
Entry price: $${moment.entryPrice.toFixed(6)}
Current price: $${moment.currentPrice.toFixed(6)}
Loss: $${Math.abs(moment.impact).toFixed(2)}
Date: ${date}

Create a story about holding a token that went to near zero:
- Acknowledge the loss with dark humor
- Reference the specific token and numbers
- Keep it 1-2 sentences
- End with a quote about collecting "digital dust"

Return JSON: { "narrative": "your narrative here" }
        `;

      case 'bigGains':
        return `
Generate a celebratory narrative for a big crypto gains moment.
Token: ${moment.tokenSymbol}
Entry price: $${moment.entryPrice.toFixed(6)}
Current price: $${moment.currentPrice.toFixed(6)}
Total gains: $${moment.impact.toFixed(2)}
Date: ${date}

Create an inspiring success story:
- Celebrate the diamond hands mentality
- Include the impressive numbers
- 1-2 sentences max
- End with a motivational quote about patience

Return JSON: { "narrative": "your narrative here" }
        `;

      default:
        return '';
    }
  }

  private getFallbackNarrative(moment: OOFMoment): string {
    switch (moment.type) {
      case 'paperHands':
        return `Sold ${moment.tokenSymbol} too early, missing out on $${moment.impact.toFixed(2)} in gains. "Paper hands lead to paper profits."`;
      
      case 'dust':
        return `Watched ${moment.tokenSymbol} crumble from $${moment.entryPrice.toFixed(6)} to $${moment.currentPrice.toFixed(6)}. "Sometimes you collect tokens, sometimes you collect dust."`;
      
      case 'bigGains':
        return `Diamond handed ${moment.tokenSymbol} from $${moment.entryPrice.toFixed(6)} to $${moment.currentPrice.toFixed(6)} for $${moment.impact.toFixed(2)} gains. "Patience pays in crypto."`;
      
      default:
        return 'Another day in the crypto markets.';
    }
  }

  private async getCurrentTokenPrice(tokenAddress: string): Promise<number> {
    // In production, this would query a price API like Jupiter or CoinGecko
    // For now, return a mock price based on the token address hash
    const hash = tokenAddress.slice(-8);
    const basePrice = parseInt(hash, 16) / 1e16;
    return Math.max(0.000001, basePrice); // Ensure minimum price
  }
}