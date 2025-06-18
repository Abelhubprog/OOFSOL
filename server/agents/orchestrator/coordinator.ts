import { ModelRoutingAgent } from '../routing/model_router';
import { WalletDataAgent } from '../data/wallet_fetcher';
import { OOFMomentAgent, TradingPattern, MarketInsight, RiskProfile, TradingBehavior } from '../oof_detection/pattern_detector';
import { TokenTransaction } from '../data/wallet_fetcher';

export interface OOFGenerationState {
  walletAddress: string;
  rawData?: BlockchainData;
  analyzedData?: AnalysisResult;
  oofMoments?: OOFMoment[];
  designedCards?: OOFCard[];
  validatedOutput?: ValidatedCards;
  errors?: string[];
  metadata: {
    modelUsage: ModelUsageTracker;
    costs: CostBreakdown;
    performance: PerformanceMetrics;
  };
}

export interface BlockchainData {
  transactions: any[];
  tokenHistory: TokenTransaction[];
  performanceMetrics: {
    totalPnL: number;
    winRate: number;
    biggestWin: number;
    biggestLoss: number;
    averageHoldTime: number;
  };
}

export interface AnalysisResult {
  patterns: TradingPattern[];
  insights: MarketInsight[];
  riskProfile: RiskProfile;
  tradingBehavior: TradingBehavior;
}

export interface OOFMoment {
  type: 'paperHands' | 'dust' | 'bigGains';
  tokenAddress: string;
  tokenSymbol: string;
  entryPrice: number;
  exitPrice?: number;
  currentPrice: number;
  amount: number;
  timestamp: number;
  narrative: string;
  impact: number;
}

export interface OOFCard {
  id: string;
  type: 'paperHands' | 'dust' | 'bigGains';
  title: string;
  narrative: string;
  quote: string;
  tokenData: {
    symbol: string;
    name: string;
    address: string;
    entryPrice: number;
    exitPrice?: number;
    currentPrice: number;
    amount: number;
  };
  stats: {
    missedGains?: number;
    lossAmount?: number;
    gainAmount?: number;
    percentage: number;
  };
  visualElements: {
    background: string;
    emoji: string;
    colors: string[];
    pattern: string;
  };
  metadata: {
    rarity: string;
    traits: string[];
    generatedAt: number;
    walletAddress: string;
  };
}

export interface ValidatedCards {
  cards: OOFCard[];
  quality: QualityMetrics;
  recommendations: string[];
}

export interface QualityMetrics {
  uniqueness: number;
  accuracy: number;
  creativity: number;
  overall: number;
}

export class ModelUsageTracker {
  private usage: Map<string, number> = new Map();

  track(model: string, tokens: number): void {
    const current = this.usage.get(model) || 0;
    this.usage.set(model, current + tokens);
  }

  getUsage(): Record<string, number> {
    return Object.fromEntries(this.usage);
  }
}

export class CostBreakdown {
  private costs: Map<string, number> = new Map();

  addCost(model: string, cost: number): void {
    const current = this.costs.get(model) || 0;
    this.costs.set(model, current + cost);
  }

  getTotalCost(): number {
    return Array.from(this.costs.values()).reduce((sum, cost) => sum + cost, 0);
  }

  getBreakdown(): Record<string, number> {
    return Object.fromEntries(this.costs);
  }
}

export class PerformanceMetrics {
  private startTime: number = Date.now();
  private stages: Map<string, number> = new Map();

  markStage(stage: string): void {
    this.stages.set(stage, Date.now() - this.startTime);
  }

  getTotalTime(): number {
    return Date.now() - this.startTime;
  }

  getStages(): Record<string, number> {
    return Object.fromEntries(this.stages);
  }
}

export class OOFOrchestrator {
  private modelRouter: ModelRoutingAgent;

  constructor() {
    this.modelRouter = new ModelRoutingAgent();
  }

  async generateOOFMoments(walletAddress: string): Promise<ValidatedCards> {
    const state: OOFGenerationState = {
      walletAddress,
      metadata: {
        modelUsage: new ModelUsageTracker(),
        costs: new CostBreakdown(),
        performance: new PerformanceMetrics()
      }
    };

    try {
      // 1. Validate input
      await this.validateInput(state);
      state.metadata.performance.markStage('validation');

      // 2. Fetch wallet data
      const rawData = await this.fetchWalletData(state);
      state.rawData = rawData;
      state.metadata.performance.markStage('data_fetch');

      // 3. Analyze transactions
      const analyzedData = await this.analyzeTransactions(state);
      state.analyzedData = analyzedData;
      state.metadata.performance.markStage('analysis');

      // 4. Detect OOF moments
      const oofMoments = await this.detectOOFMoments(state);
      state.oofMoments = oofMoments;
      state.metadata.performance.markStage('oof_detection');

      // 5. Design cards
      const designedCards = await this.designCards(state);
      state.designedCards = designedCards;
      state.metadata.performance.markStage('card_design');

      // 6. Validate output
      const validatedOutput = await this.validateOutput(state);
      state.validatedOutput = validatedOutput;
      state.metadata.performance.markStage('validation_complete');

      return validatedOutput;

    } catch (error) {
      console.error('OOF generation failed:', error);
      throw new Error(`Failed to generate OOF moments: ${error.message}`);
    }
  }

  private async validateInput(state: OOFGenerationState): Promise<void> {
    if (!state.walletAddress || !this.isValidSolanaAddress(state.walletAddress)) {
      throw new Error('Invalid Solana wallet address');
    }
  }

  private async fetchWalletData(state: OOFGenerationState): Promise<BlockchainData> {
    const dataAgent = new WalletDataAgent();
    return await dataAgent.fetchComprehensiveData(state.walletAddress);
  }

  private async analyzeTransactions(state: OOFGenerationState): Promise<AnalysisResult> {
    // AI-powered transaction analysis using the model router
    const modelSelection = await this.modelRouter.selectBestModel(
      'analyze transaction patterns',
      {
        complexity: 'high',
        creativity: 'low',
        accuracy: 'high',
        speed: 'medium',
        maxCost: 0.02,
        fallbackRequired: true
      }
    );

    const analysisPrompt = this.buildAnalysisPrompt(state.rawData!);
    
    const analysis = await this.modelRouter.executeWithModel<AnalysisResult>(
      modelSelection.primary,
      analysisPrompt
    );

    return analysis;
  }

  private async detectOOFMoments(state: OOFGenerationState): Promise<OOFMoment[]> {
    const detectionAgent = new OOFMomentAgent(this.modelRouter);
    return await detectionAgent.identifyOOFMoments(state.analyzedData!);
  }

  private async designCards(state: OOFGenerationState): Promise<OOFCard[]> {
    const cards: OOFCard[] = [];

    for (const moment of state.oofMoments!) {
      const card = await this.createCardFromMoment(moment, state.walletAddress);
      cards.push(card);
    }

    return cards;
  }

  private async validateOutput(state: OOFGenerationState): Promise<ValidatedCards> {
    const qualityMetrics: QualityMetrics = {
      uniqueness: this.calculateUniqueness(state.designedCards!),
      accuracy: this.calculateAccuracy(state.designedCards!, state.rawData!),
      creativity: this.calculateCreativity(state.designedCards!),
      overall: 0
    };

    qualityMetrics.overall = (qualityMetrics.uniqueness + qualityMetrics.accuracy + qualityMetrics.creativity) / 3;

    const recommendations = this.generateRecommendations(qualityMetrics);

    return {
      cards: state.designedCards!,
      quality: qualityMetrics,
      recommendations
    };
  }

  private buildAnalysisPrompt(data: BlockchainData): string {
    const tokenHistory = data.tokenHistory.slice(0, 50); // Limit for prompt size
    const metrics = data.performanceMetrics;

    return `
Analyze this Solana wallet's trading patterns and behavior:

Performance Metrics:
- Total P&L: ${metrics.totalPnL}
- Win Rate: ${(metrics.winRate * 100).toFixed(1)}%
- Biggest Win: ${metrics.biggestWin}
- Biggest Loss: ${metrics.biggestLoss}
- Average Hold Time: ${metrics.averageHoldTime.toFixed(1)} days

Recent Transactions: ${JSON.stringify(tokenHistory, null, 2)}

Identify trading patterns and provide analysis in this exact JSON format:
{
  "patterns": [
    {
      "type": "paperHands" | "dustCollector" | "diamondHands" | "fomo" | "rugPull",
      "frequency": number,
      "avgImpact": number,
      "examples": [transaction_objects]
    }
  ],
  "insights": [
    {
      "insight": "string",
      "confidence": number,
      "supportingData": []
    }
  ],
  "riskProfile": {
    "riskTolerance": "low" | "medium" | "high",
    "diversification": number,
    "leverageUsage": number,
    "stopLossUsage": number
  },
  "tradingBehavior": {
    "tradingFrequency": "low" | "medium" | "high",
    "averagePositionSize": number,
    "preferredTokenTypes": ["string"],
    "emotionalTrading": number
  }
}
    `;
  }

  private async createCardFromMoment(moment: OOFMoment, walletAddress: string): Promise<OOFCard> {
    const cardId = `${moment.type}_${moment.tokenAddress}_${moment.timestamp}`;
    
    // Generate unique visual elements based on moment data
    const visualElements = this.generateVisualElements(moment, walletAddress);
    
    // Calculate stats
    const stats = this.calculateMomentStats(moment);
    
    // Generate quote using AI
    const quote = await this.generateQuote(moment);

    return {
      id: cardId,
      type: moment.type,
      title: this.generateTitle(moment),
      narrative: moment.narrative,
      quote,
      tokenData: {
        symbol: moment.tokenSymbol,
        name: moment.tokenSymbol, // Would need token metadata in production
        address: moment.tokenAddress,
        entryPrice: moment.entryPrice,
        exitPrice: moment.exitPrice,
        currentPrice: moment.currentPrice,
        amount: moment.amount
      },
      stats,
      visualElements,
      metadata: {
        rarity: this.calculateRarity(moment),
        traits: this.generateTraits(moment),
        generatedAt: Date.now(),
        walletAddress
      }
    };
  }

  private generateVisualElements(moment: OOFMoment, walletAddress: string): any {
    const hash = walletAddress.slice(-8);
    const colorSeed = parseInt(hash, 16);

    const baseColors = {
      paperHands: ['#ff6b6b', '#ffa8a8'],
      dust: ['#868e96', '#adb5bd'],
      bigGains: ['#51cf66', '#69db7c']
    };

    return {
      background: `linear-gradient(135deg, ${baseColors[moment.type][0]}, ${baseColors[moment.type][1]})`,
      emoji: moment.type === 'paperHands' ? '📄' : moment.type === 'dust' ? '🗑️' : '💎',
      colors: baseColors[moment.type],
      pattern: `pattern-${colorSeed % 5}`
    };
  }

  private calculateMomentStats(moment: OOFMoment): any {
    switch (moment.type) {
      case 'paperHands':
        const missedGains = moment.impact;
        const percentage = ((moment.currentPrice - (moment.exitPrice || moment.entryPrice)) / (moment.exitPrice || moment.entryPrice)) * 100;
        return { missedGains, percentage };

      case 'dust':
        const lossAmount = Math.abs(moment.impact);
        const lossPercentage = ((moment.entryPrice - moment.currentPrice) / moment.entryPrice) * 100;
        return { lossAmount, percentage: lossPercentage };

      case 'bigGains':
        const gainAmount = moment.impact;
        const gainPercentage = ((moment.currentPrice - moment.entryPrice) / moment.entryPrice) * 100;
        return { gainAmount, percentage: gainPercentage };

      default:
        return { percentage: 0 };
    }
  }

  private async generateQuote(moment: OOFMoment): Promise<string> {
    const quotes = {
      paperHands: [
        "Paper hands lead to paper profits",
        "Sold the dip, bought the regret",
        "Exit strategy: activated too early"
      ],
      dust: [
        "Collecting digital dust since day one",
        "From moon to tomb in record time",
        "HODLing bags, building character"
      ],
      bigGains: [
        "Diamond hands forge diamond gains",
        "Patience pays in the crypto game",
        "HODL: Hold On for Dear Life... and profit"
      ]
    };

    const typeQuotes = quotes[moment.type] || ["Another day in crypto"];
    return typeQuotes[Math.floor(Math.random() * typeQuotes.length)];
  }

  private generateTitle(moment: OOFMoment): string {
    const titles = {
      paperHands: `Paper Hands: ${moment.tokenSymbol}`,
      dust: `Dust Collector: ${moment.tokenSymbol}`,
      bigGains: `Diamond Hands: ${moment.tokenSymbol}`
    };

    return titles[moment.type] || `OOF Moment: ${moment.tokenSymbol}`;
  }

  private calculateRarity(moment: OOFMoment): string {
    const impact = Math.abs(moment.impact);
    if (impact > 10000) return 'Legendary';
    if (impact > 1000) return 'Epic';
    if (impact > 100) return 'Rare';
    return 'Common';
  }

  private generateTraits(moment: OOFMoment): string[] {
    const traits = [];
    
    if (moment.impact > 1000) traits.push('High Impact');
    if (moment.type === 'paperHands') traits.push('Early Exit');
    if (moment.type === 'dust') traits.push('Long Hold');
    if (moment.type === 'bigGains') traits.push('Diamond Hands');
    
    return traits;
  }

  private calculateUniqueness(cards: OOFCard[]): number {
    // Simple uniqueness check - in production would be more sophisticated
    const types = new Set(cards.map(c => c.type));
    return types.size / 3; // 3 possible types
  }

  private calculateAccuracy(cards: OOFCard[], rawData: BlockchainData): number {
    // Verify cards are based on actual transaction data
    return cards.every(card => 
      rawData.tokenHistory.some(tx => tx.tokenAddress === card.tokenData.address)
    ) ? 1.0 : 0.5;
  }

  private calculateCreativity(cards: OOFCard[]): number {
    // Check narrative diversity and uniqueness
    const narratives = cards.map(c => c.narrative);
    const uniqueWords = new Set(narratives.join(' ').split(' ')).size;
    return Math.min(1.0, uniqueWords / 50); // Normalize to 0-1
  }

  private generateRecommendations(metrics: QualityMetrics): string[] {
    const recommendations = [];
    
    if (metrics.uniqueness < 0.7) {
      recommendations.push('Consider adding more diverse trading patterns');
    }
    
    if (metrics.accuracy < 0.8) {
      recommendations.push('Verify all cards are based on actual transaction data');
    }
    
    if (metrics.creativity < 0.6) {
      recommendations.push('Enhance narrative creativity and uniqueness');
    }

    if (recommendations.length === 0) {
      recommendations.push('High quality OOF moments generated successfully');
    }

    return recommendations;
  }

  private isValidSolanaAddress(address: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
}