# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 OOF Platform - Production-Ready Development Guide

The OOF Platform is a revolutionary Solana-based social media engagement platform that transforms crypto trading failures into shareable, monetizable content through AI-powered "OOF Moments" and cross-chain NFT integration.

## 📋 Quick Commands

**Development:**
```bash
npm run dev       # Start development server on port 5000 with hot reload
npm run check     # TypeScript type checking
npm run db:push   # Push database schema changes using Drizzle
```

**Production:**
```bash
npm run build     # Build both client (Vite) and server (esbuild)
npm run start     # Run production build
```

## 🏗️ Architecture Overview

### **Current Implementation Status: 75% Complete**

**✅ Production-Ready Components:**
- Complete React frontend with 25+ pages and 30+ components
- Comprehensive database schema (20+ tables) with Drizzle ORM
- Wallet integration via Dynamic Labs (Solana + multi-chain)
- Professional UI system (shadcn/ui + Tailwind CSS)
- Complete routing and navigation system

**⚠️ Partially Implemented:**
- Basic Express.js API with mock endpoints
- AI service integration (structure exists, needs implementation)
- Blockchain service layer (connections ready, logic partial)

**❌ Missing for Production:**
- Database implementation (currently file-based storage)
- AI agent orchestrator (LangGraph integration needed)
- Real-time WebSocket system
- Payment processing integration
- Comprehensive error handling and monitoring

## 🧠 Core Features & Business Model

### **Primary Features:**

1. **OOF Moments (85% Complete)**
   - AI-powered wallet analysis generating personalized trading stories
   - Visual card creation with rarity system (Legendary, Epic, Rare)
   - Cross-chain NFT minting via Zora Protocol integration
   - Social interactions: likes, shares, comments, viral mechanics

2. **Token Advertising Marketplace (95% Complete)**
   - 30-minute rotating ad slots for Solana tokens
   - $10 USDC fee structure with revenue sharing
   - Performance analytics and click tracking
   - 6-slot rotating display system

3. **Campaign Management System (90% Complete)**
   - Multi-platform social media engagement (Twitter, Farcaster, TikTok)
   - Verification system for completed actions
   - USDC rewards with OOF point multipliers
   - Analytics dashboard for campaign performance

4. **Advanced Gaming Features (70% Complete)**
   - Slot machine with NFT generation
   - Battle Royale trading competitions
   - Achievement system with unlockable content
   - Time Machine for historical "what-if" analysis

### **Revenue Streams:**
- Token advertising fees ($10 per 30-min slot)
- Premium AI features and advanced analytics
- Cross-chain token launch fees via Zora integration
- Social media campaign management fees

## 🔧 Technical Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Wouter (routing) + TanStack Query (state)
- Tailwind CSS + shadcn/ui components
- Framer Motion (animations) + Radix UI (primitives)

**Backend:**
- Express.js + TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- OpenAI + Perplexity AI integration
- WebSocket support for real-time features

**Blockchain:**
- Solana Web3.js for primary blockchain operations
- Dynamic Labs for wallet connections (multi-chain support)
- Zora Protocol for cross-chain NFT minting
- Jupiter/Raydium integration for token data

**AI Infrastructure:**
- Multi-agent architecture using LangGraph
- Cost-optimized model routing (Claude, GPT-4, Gemini, DeepSeek)
- Perplexity API for real-time analysis
- Progressive enhancement with fallback systems

## 📊 Database Schema (Production-Ready)

**Key Tables:**
- `users` - Wallet-based user management with OOF scores
- `oof_moments` - AI-generated moments with social stats
- `token_ads` - Advertising marketplace with payment tracking
- `campaigns` - Social media campaign management
- `wallet_analysis` - Cached wallet transaction analysis
- `moment_interactions` - Social engagement tracking

**File Path Aliases:**
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

## 🚀 Production Deployment Roadmap

### **Phase 1: Core Infrastructure (Weeks 1-2)**

**Critical Blockers:**
1. **Database Migration** - Convert from file storage to PostgreSQL
   ```bash
   # Create production database
   npm run db:migrate
   npm run db:seed
   ```

2. **AI Agent Implementation** - LangGraph multi-agent system
   - Implement wallet analysis agent
   - Add narrative generation agent
   - Create visual design agent
   - Build publisher agent for cross-chain minting

3. **Authentication & Security**
   - JWT token validation middleware
   - Rate limiting (Redis-based)
   - CORS configuration
   - Input sanitization

### **Phase 2: Core Features (Weeks 3-4)**

1. **OOF Moments Generation**
   - Real-time wallet transaction analysis
   - AI-powered story generation with multiple personas
   - Dynamic SVG/image generation system
   - Zora Protocol NFT minting workflow

2. **Token Advertising System**
   - Payment processing (Stripe + crypto payments)
   - Real-time ad rotation system
   - Analytics dashboard
   - Revenue sharing automation

### **Phase 3: Advanced Features (Weeks 5-8)**

1. **Social Media Campaign Platform**
   - Twitter/X API integration
   - Farcaster protocol integration
   - Verification system with proof-of-completion
   - Automated reward distribution

2. **Real-time Gaming Features**
   - WebSocket implementation for live interactions
   - Battle Royale trading game mechanics
   - Achievement system with NFT rewards
   - Leaderboard and ranking system

### **Phase 4: Scale & Optimize (Weeks 9-12)**

1. **Performance & Monitoring**
   - Redis caching layer
   - API response optimization
   - Error tracking (Sentry)
   - Performance monitoring (DataDog)

2. **Mobile & PWA**
   - Progressive Web App features
   - Mobile-optimized interface
   - Push notifications
   - Offline functionality

## 🔥 Competitive Advantages

1. **First-Mover in "Regret Economy"** - No direct competitors turning trading failures into social content
2. **AI-Powered Personalization** - Each user gets truly unique, generated content
3. **Cross-Chain Innovation** - Seamless bridge from Solana social content to Base NFTs
4. **Viral Social Mechanics** - Built-in shareability with crypto reward incentives

## 📈 Market Opportunity

**Target Addressable Market:**
- 50M+ crypto traders globally experiencing "OOF moments"
- $2B+ social media crypto content market
- Growing demand for AI-generated personalized content
- Cross-chain DeFi user base expanding rapidly

## 🛠️ Development Guidelines

### **Code Standards:**
- TypeScript throughout (strict mode enabled)
- Comprehensive error boundaries and handling
- Performance monitoring on all critical paths
- Security-first approach (no private keys in code)

### **Feature Development Process:**
1. Database schema updates in `shared/schema.ts`
2. API endpoint creation in `server/routes.ts`
3. Service layer implementation in `server/services/`
4. Frontend integration in `client/src/`
5. Testing and validation

### **AI Integration Pattern:**
```typescript
// Multi-agent orchestrator pattern
const orchestrator = new AIOrchestrator({
  scout: new WalletAnalysisAgent(),
  director: new StoryGenerationAgent(), 
  artist: new VisualDesignAgent(),
  publisher: new CrossChainAgent()
});
```

### **Error Handling:**
All API endpoints must include comprehensive error handling with proper HTTP status codes and user-friendly messages.

## 🔧 Reference Implementations

**Solana App Kit Integration:**
- The `solana-app-kit-main/` directory contains a production-ready React Native reference
- Use transaction handling patterns from `src/shared/services/transactions/`
- Wallet provider patterns in `src/modules/wallet-providers/`

**AI Agent Architecture:**
- The `gemini-fullstack-langgraph-quickstart/` shows LangGraph implementation patterns
- Multi-agent coordination using Send/Receive patterns
- Structured output with retry logic and error handling

## 🎯 Success Metrics

**Technical KPIs:**
- API response time < 200ms (95th percentile)
- AI generation success rate > 95%
- Cross-chain transaction success rate > 98%
- Zero-downtime deployment capability

**Business KPIs:**
- User engagement: Time on platform, shares per moment
- Revenue: Ad slot utilization, campaign booking rate
- Growth: Viral coefficient, user acquisition cost
- Retention: Daily/Monthly active users, moment creation rate

## 🚨 Critical Production Requirements

1. **Security:** All private keys in environment variables, rate limiting on all endpoints
2. **Monitoring:** Real-time error tracking, performance metrics, uptime monitoring  
3. **Scalability:** Database read replicas, CDN for static assets, horizontal API scaling
4. **Compliance:** GDPR compliance for user data, crypto regulation compliance

---

**The OOF Platform represents a unique convergence of AI, social media, DeFi, and emotional technology that can capture significant market share in the growing crypto social space. The vision is sound, the architecture is well-planned, and the UI is production-ready. Focus on systematic completion of the backend infrastructure to match the ambitious frontend implementation.**