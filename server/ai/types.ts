export interface AIConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  perplexityApiKey?: string;
  deepseekApiKey?: string;
  defaultModel: string;
  fallbackModels: string[];
  maxRetries: number;
  timeout: number;
}

export interface AgentState {
  messages: Message[];
  currentAgent?: string;
  walletAddress?: string;
  analysisData?: any;
  generatedContent?: any;
  error?: string;
  retryCount: number;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  nextAgent?: string;
  shouldContinue: boolean;
  metadata?: Record<string, any>;
}

export interface WalletAnalysisResult {
  address: string;
  balance: number;
  transactions: Transaction[];
  tokens: TokenHolding[];
  nfts: NFTHolding[];
  riskScore: number;
  patterns: TradingPattern[];
  opportunities: string[];
  regrets: string[];
  personality: TradingPersonality;
}

export interface Transaction {
  signature: string;
  timestamp: Date;
  type: 'BUY' | 'SELL' | 'TRANSFER' | 'SWAP';
  tokenAddress: string;
  amount: number;
  priceUsd: number;
  success: boolean;
}

export interface TokenHolding {
  address: string;
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  priceChange24h: number;
}

export interface NFTHolding {
  address: string;
  name: string;
  image: string;
  floorPrice: number;
  collection: string;
}

export interface TradingPattern {
  type: 'PAPER_HANDS' | 'DIAMOND_HANDS' | 'FOMO_BUYER' | 'SWING_TRADER' | 'HODLER';
  confidence: number;
  description: string;
  examples: Transaction[];
}

export interface TradingPersonality {
  type: 'DEGENERATE' | 'CONSERVATIVE' | 'SWING_TRADER' | 'WHALE' | 'SHRIMP';
  traits: string[];
  riskTolerance: number;
  emotionalState: string;
}

export interface OOFMomentData {
  id: string;
  type: string;
  title: string;
  description: string;
  narrative: string;
  imageUrl?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  metrics: {
    missedGains: number;
    timeframe: string;
    regretLevel: number;
  };
  socialText: string;
  hashtags: string[];
}

export interface CampaignAnalysis {
  platform: string;
  tasks: CampaignTask[];
  estimatedReach: number;
  engagementRate: number;
  cost: number;
  roi: number;
}

export interface CampaignTask {
  type: string;
  description: string;
  reward: number;
  difficulty: number;
  verificationMethod: string;
}