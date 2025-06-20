import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentState, AgentResponse, WalletAnalysisResult, OOFMomentData, AIConfig, Message } from './types';
import { DEFAULT_AI_CONFIG, getOptimalModel, AGENT_PROMPTS } from './config';
import { DatabaseUtils } from '../db/utils';

export class AIOrchestrator {
  private config: AIConfig;
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private gemini?: GoogleGenerativeAI;
  private currentCosts: Record<string, number> = {};

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
    this.initializeClients();
  }

  private initializeClients() {
    if (this.config.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: this.config.openaiApiKey });
    }
    
    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic({ apiKey: this.config.anthropicApiKey });
    }
    
    if (this.config.geminiApiKey) {
      this.gemini = new GoogleGenerativeAI(this.config.geminiApiKey);
    }
  }

  // Main orchestration method
  async generateOOFMoment(
    walletAddress: string, 
    options: {
      momentType?: string;
      customPrompt?: string;
      userId?: string;
    } = {}
  ): Promise<OOFMomentData> {
    const state: AgentState = {
      messages: [],
      walletAddress,
      retryCount: 0,
      metadata: {
        startTime: Date.now(),
        userId: options.userId,
        momentType: options.momentType,
        customPrompt: options.customPrompt
      }
    };

    try {
      // Phase 1: Scout Agent - Wallet Analysis
      const scoutResult = await this.executeAgent('scout', state);
      if (!scoutResult.success) {
        throw new Error(`Scout agent failed: ${scoutResult.error}`);
      }
      state.analysisData = scoutResult.data;

      // Phase 2: Director Agent - Narrative Generation
      const directorResult = await this.executeAgent('director', state);
      if (!directorResult.success) {
        throw new Error(`Director agent failed: ${directorResult.error}`);
      }
      state.generatedContent = directorResult.data;

      // Phase 3: Artist Agent - Visual Design
      const artistResult = await this.executeAgent('artist', state);
      if (!artistResult.success) {
        throw new Error(`Artist agent failed: ${artistResult.error}`);
      }

      // Phase 4: Publisher Agent - Final Assembly
      const publisherResult = await this.executeAgent('publisher', state);
      if (!publisherResult.success) {
        throw new Error(`Publisher agent failed: ${publisherResult.error}`);
      }

      const oofMoment: OOFMomentData = publisherResult.data;

      // Cache result in database
      if (options.userId) {
        await DatabaseUtils.cacheWalletAnalysis(walletAddress, {
          analysis: state.analysisData,
          moment: oofMoment,
          generatedAt: new Date(),
          cost: this.calculateTotalCost()
        });
      }

      return oofMoment;

    } catch (error) {
      console.error('OOF moment generation failed:', error);
      throw error;
    }
  }

  // Individual agent execution
  private async executeAgent(agentType: string, state: AgentState): Promise<AgentResponse> {
    try {
      switch (agentType) {
        case 'scout':
          return await this.scoutAgent(state);
        case 'director':
          return await this.directorAgent(state);
        case 'artist':
          return await this.artistAgent(state);
        case 'publisher':
          return await this.publisherAgent(state);
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }
    } catch (error) {
      if (state.retryCount < this.config.maxRetries) {
        state.retryCount++;
        console.log(`Retrying ${agentType} agent (attempt ${state.retryCount})`);
        return await this.executeAgent(agentType, state);
      }
      
      return {
        success: false,
        error: error.message,
        shouldContinue: false
      };
    }
  }

  // Scout Agent: Wallet Analysis
  private async scoutAgent(state: AgentState): Promise<AgentResponse> {
    const prompt = `${AGENT_PROMPTS.scout}

Analyze this Solana wallet: ${state.walletAddress}

Focus on:
1. Transaction patterns and volume
2. Token holdings and performance
3. Paper hands moments (sold too early)
4. Diamond hands moments (held too long)
5. Risk-taking behavior
6. Overall trading personality

Provide structured analysis data that can be used to generate personalized content.`;

    const model = getOptimalModel('analysis', 0.005);
    const response = await this.callAI(model, prompt, state);

    // Here we would integrate with the actual Solana analysis service
    // For now, using mock data structure
    const analysisData: WalletAnalysisResult = {
      address: state.walletAddress,
      balance: 1.2,
      transactions: [],
      tokens: [],
      nfts: [],
      riskScore: 75,
      patterns: [
        {
          type: 'PAPER_HANDS',
          confidence: 0.8,
          description: 'Tends to sell tokens during early price increases',
          examples: []
        }
      ],
      opportunities: ['Early exit from $BONK before 900% pump'],
      regrets: ['Bought $SAFEMOON at peak'],
      personality: {
        type: 'SWING_TRADER',
        traits: ['risk-taker', 'FOMO-prone', 'profit-focused'],
        riskTolerance: 7,
        emotionalState: 'optimistic but impatient'
      }
    };

    return {
      success: true,
      data: analysisData,
      shouldContinue: true,
      metadata: { cost: this.estimateCost(model, prompt.length) }
    };
  }

  // Director Agent: Narrative Generation
  private async directorAgent(state: AgentState): Promise<AgentResponse> {
    if (!state.analysisData) {
      throw new Error('No analysis data available for narrative generation');
    }

    const prompt = `${AGENT_PROMPTS.director}

Create a compelling OOF Moment narrative based on this wallet analysis:

Wallet: ${state.walletAddress}
Risk Score: ${state.analysisData.riskScore}
Trading Personality: ${state.analysisData.personality.type}
Key Patterns: ${state.analysisData.patterns.map(p => p.type).join(', ')}
Missed Opportunities: ${state.analysisData.opportunities.join(', ')}
Regrets: ${state.analysisData.regrets.join(', ')}

${state.metadata.customPrompt ? `Custom Request: ${state.metadata.customPrompt}` : ''}

Generate:
1. Catchy title (max 60 chars)
2. Engaging description (max 200 chars)
3. Personal narrative story (max 500 chars)
4. Viral social media text
5. Relevant hashtags
6. Rarity level (COMMON, RARE, EPIC, LEGENDARY)

Make it relatable, slightly humorous, and emotionally resonant with the crypto community.`;

    const model = getOptimalModel('creative', 0.01);
    const response = await this.callAI(model, prompt, state);

    // Parse AI response into structured format
    const narrativeData = this.parseNarrativeResponse(response);

    return {
      success: true,
      data: narrativeData,
      shouldContinue: true,
      metadata: { cost: this.estimateCost(model, prompt.length) }
    };
  }

  // Artist Agent: Visual Design
  private async artistAgent(state: AgentState): Promise<AgentResponse> {
    if (!state.generatedContent) {
      throw new Error('No narrative content available for visual design');
    }

    const prompt = `${AGENT_PROMPTS.artist}

Create visual design concepts for this OOF Moment:

Title: ${state.generatedContent.title}
Rarity: ${state.generatedContent.rarity}
Theme: ${state.generatedContent.narrative}

Generate:
1. Color scheme based on rarity and emotion
2. Visual layout suggestions
3. Typography recommendations
4. Background design concept
5. Icon/symbol suggestions
6. Animation ideas

Focus on making it visually striking and shareable on social media.`;

    const model = getOptimalModel('creative', 0.005);
    const response = await this.callAI(model, prompt, state);

    const visualData = this.parseVisualResponse(response);

    return {
      success: true,
      data: visualData,
      shouldContinue: true,
      metadata: { cost: this.estimateCost(model, prompt.length) }
    };
  }

  // Publisher Agent: Final Assembly and Distribution
  private async publisherAgent(state: AgentState): Promise<AgentResponse> {
    const oofMoment: OOFMomentData = {
      id: crypto.randomUUID(),
      type: state.metadata.momentType || 'GENERAL',
      title: state.generatedContent.title,
      description: state.generatedContent.description,
      narrative: state.generatedContent.narrative,
      rarity: state.generatedContent.rarity,
      metrics: {
        missedGains: state.analysisData.opportunities.length * 1000,
        timeframe: '30d',
        regretLevel: state.analysisData.riskScore
      },
      socialText: state.generatedContent.socialText,
      hashtags: state.generatedContent.hashtags
    };

    return {
      success: true,
      data: oofMoment,
      shouldContinue: false,
      metadata: { finalMoment: true }
    };
  }

  // AI Model Communication
  private async callAI(model: string, prompt: string, state: AgentState): Promise<string> {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    state.messages.push(message);

    try {
      let response: string;

      if (model.startsWith('gpt-') && this.openai) {
        const completion = await this.openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
          timeout: this.config.timeout
        });
        response = completion.choices[0]?.message?.content || '';

      } else if (model.startsWith('claude-') && this.anthropic) {
        const completion = await this.anthropic.messages.create({
          model,
          max_tokens: 1000,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        });
        response = completion.content[0]?.type === 'text' ? completion.content[0].text : '';

      } else if (model.startsWith('gemini-') && this.gemini) {
        const geminiModel = this.gemini.getGenerativeModel({ model });
        const result = await geminiModel.generateContent(prompt);
        response = result.response.text();

      } else {
        throw new Error(`No client available for model: ${model}`);
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: state.currentAgent
      };

      state.messages.push(aiMessage);
      return response;

    } catch (error) {
      console.error(`AI call failed for model ${model}:`, error);
      throw error;
    }
  }

  // Response parsing utilities
  private parseNarrativeResponse(response: string): any {
    // Parse AI response into structured narrative data
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      title: this.extractField(lines, 'title') || 'Your OOF Moment',
      description: this.extractField(lines, 'description') || 'A tale of crypto regret',
      narrative: this.extractField(lines, 'narrative') || response.substring(0, 500),
      socialText: this.extractField(lines, 'social') || 'Just generated my OOF Moment!',
      hashtags: this.extractHashtags(response),
      rarity: this.extractRarity(response)
    };
  }

  private parseVisualResponse(response: string): any {
    return {
      colorScheme: this.extractField(response.split('\n'), 'color') || 'gradient-purple',
      layout: this.extractField(response.split('\n'), 'layout') || 'card-modern',
      animations: ['fade-in', 'pulse-glow']
    };
  }

  private extractField(lines: string[], fieldName: string): string | null {
    const field = lines.find(line => 
      line.toLowerCase().includes(fieldName.toLowerCase() + ':')
    );
    return field ? field.split(':')[1]?.trim() : null;
  }

  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.slice(0, 5);
  }

  private extractRarity(text: string): 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' {
    const rarities = ['LEGENDARY', 'EPIC', 'RARE', 'COMMON'];
    for (const rarity of rarities) {
      if (text.toLowerCase().includes(rarity.toLowerCase())) {
        return rarity as any;
      }
    }
    return 'COMMON';
  }

  // Cost tracking
  private estimateCost(model: string, promptLength: number): number {
    // Rough cost estimation - would be more precise in production
    return promptLength * 0.00001;
  }

  private calculateTotalCost(): number {
    return Object.values(this.currentCosts).reduce((sum, cost) => sum + cost, 0);
  }

  // Progress tracking for real-time updates
  async getProgress(sessionId: string): Promise<{ progress: number; currentStep: string }> {
    // This would integrate with Redis for real-time progress tracking
    return {
      progress: 0,
      currentStep: 'Initializing...'
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();