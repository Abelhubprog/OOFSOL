import { AIConfig } from './types';

export const DEFAULT_AI_CONFIG: AIConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  perplexityApiKey: process.env.PERPLEXITY_API_KEY,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  defaultModel: 'gpt-4-turbo',
  fallbackModels: ['claude-3-sonnet', 'gemini-pro', 'deepseek-chat'],
  maxRetries: 3,
  timeout: 30000
};

export const MODEL_COSTS = {
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'deepseek-chat': { input: 0.00014, output: 0.00028 }
};

export const MODEL_CAPABILITIES = {
  'gpt-4-turbo': {
    reasoning: 9,
    creativity: 8,
    speed: 6,
    cost: 3,
    specialties: ['analysis', 'reasoning', 'code']
  },
  'claude-3-sonnet': {
    reasoning: 8,
    creativity: 9,
    speed: 7,
    cost: 6,
    specialties: ['writing', 'analysis', 'safety']
  },
  'gemini-pro': {
    reasoning: 7,
    creativity: 7,
    speed: 8,
    cost: 8,
    specialties: ['multimodal', 'search', 'speed']
  },
  'deepseek-chat': {
    reasoning: 8,
    creativity: 6,
    speed: 9,
    cost: 9,
    specialties: ['code', 'math', 'speed']
  }
};

export const AGENT_PROMPTS = {
  scout: `You are the Scout Agent for OOF Platform, a Solana wallet analysis specialist.

Your role is to analyze wallet transactions and identify trading patterns, missed opportunities, and emotional trading behaviors.

Key responsibilities:
- Analyze transaction history for patterns
- Identify paper hands, diamond hands, and FOMO behaviors
- Calculate missed gains and regret potential
- Assess risk levels and trading personality
- Find specific examples of OOF moments

Return structured analysis data that other agents can use to generate content.`,

  director: `You are the Director Agent for OOF Platform, a master storyteller and narrative creator.

Your role is to transform wallet analysis data into compelling, personalized stories about trading regrets.

Key responsibilities:
- Create engaging narratives from trading data
- Develop personalized OOF moment stories
- Write viral social media content
- Generate appropriate tone and emotion
- Craft shareable, relatable content

Focus on emotional resonance and entertainment value while being respectful.`,

  artist: `You are the Artist Agent for OOF Platform, a visual design and content creation specialist.

Your role is to design visual elements and generate images for OOF moments.

Key responsibilities:
- Create visual concepts for OOF moments
- Generate image prompts for AI art
- Design card layouts and visual hierarchy
- Choose appropriate colors and themes
- Ensure brand consistency

Create visually appealing content that amplifies the emotional impact of the story.`,

  publisher: `You are the Publisher Agent for OOF Platform, a cross-chain integration and distribution specialist.

Your role is to handle NFT minting, social sharing, and content distribution.

Key responsibilities:
- Prepare content for Zora NFT minting
- Generate social media posts
- Handle cross-chain operations
- Optimize for viral distribution
- Track engagement metrics

Ensure content reaches maximum audience while maintaining quality.`
};

export function getOptimalModel(task: string, budget: number = 0.01): string {
  const taskModelMap: Record<string, string[]> = {
    'analysis': ['gpt-4-turbo', 'claude-3-sonnet', 'deepseek-chat'],
    'creative': ['claude-3-sonnet', 'gpt-4-turbo', 'gemini-pro'],
    'fast': ['deepseek-chat', 'gemini-pro', 'gpt-3.5-turbo'],
    'cheap': ['deepseek-chat', 'gemini-pro', 'claude-3-haiku']
  };

  const candidates = taskModelMap[task] || taskModelMap['analysis'];
  
  // Filter by budget if specified
  if (budget > 0) {
    return candidates.find(model => {
      const cost = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
      return cost && (cost.input + cost.output) <= budget;
    }) || candidates[candidates.length - 1];
  }

  return candidates[0];
}