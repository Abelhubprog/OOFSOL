import dotenv from "dotenv";

// Load environment variables at the very beginning
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Export validated environment variables
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  server: {
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    sessionSecret: process.env.SESSION_SECRET || 'fallback-session-secret',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  },
  blockchain: {
    solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    solanaNetwork: process.env.SOLANA_NETWORK || 'devnet',
  },
  zora: {
    apiKey: process.env.ZORA_API_KEY,
    network: process.env.ZORA_NETWORK || 'base',
    contractAddress: process.env.ZORA_CONTRACT_ADDRESS,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  features: {
    enableAIGeneration: process.env.ENABLE_AI_GENERATION === 'true',
    enableZoraMinting: process.env.ENABLE_ZORA_MINTING === 'true',
    enableTokenAds: process.env.ENABLE_TOKEN_ADS !== 'false',
    enableCampaigns: process.env.ENABLE_CAMPAIGNS !== 'false',
  },
  debug: {
    debugMode: process.env.DEBUG_MODE === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
  }
};

console.log('✅ Environment configuration loaded successfully');