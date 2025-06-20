# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 OOF Platform - Production-Ready Development Guide (Updated)

The OOF Platform is a revolutionary Solana-based social media engagement platform that transforms crypto trading failures ("OOF Moments") into shareable, monetizable, and gamified content. It leverages AI for personalized experiences and cross-chain technology (Zora Protocol on Base) for NFT minting, aiming to create a "Regret Economy".

## 📋 Quick Commands

**Development (Windows):**
```bash
dev-win.bat         # Recommended: Starts full dev server (API + Vite) with DB skip for Windows
npm run dev:safe    # Cross-platform safe mode, skips DB check
npm run dev:win     # PowerShell alternative, skips DB check
npm run dev         # Standard cross-platform, may have DB WebSocket issues on Windows
npm run dev:simple  # API only with basic HTML serving (no Vite)
```

**General Development:**
```bash
npm run check       # TypeScript type checking
npm run db:generate # Generate Drizzle migration (after schema changes)
npm run db:migrate  # Apply database migrations
npm run db:push     # Push schema changes (dev only, careful)
npm run db:studio   # Open Drizzle Studio (database admin)
```

**Production:**
```bash
npm run build       # Build client (Vite) and server (esbuild)
npm run start       # Run production build (after building)
```

## 🏗️ Architecture Overview

### **Current Implementation Status: ~60% to Production-Ready Vision**

**✅ Strong Foundations & Partially Implemented Frontend:**
- **Frontend (`client/`):** React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui. Many pages (25+) and components (30+) exist, with some recent UI/UX overhaul (e.g., `Landing.tsx`, `OOFMoments.tsx`). Dynamic Labs for wallet connections.
- **Backend (`server/`):** Express.js, TypeScript. Structures for services, AI, middleware are present. WebSocket manager (`server/websocket/websocketManager.ts`) exists.
- **Database (`shared/schema.ts`, `server/db.ts`):** Comprehensive Drizzle ORM schema for PostgreSQL (Neon). Database connection and basic utility functions (`server/db/utils.ts`) are set up. Windows compatibility for Neon driver addressed.
- **AI Concepts:** Multi-agent (Scout, Director, Artist, Publisher) architecture conceptualized (`server/ai/orchestrator.ts`, `server/ai/config.ts`).
- **Strategic Vision:** Strong "Regret Economy" concept outlined in `STRATEGIC_ANALYSIS.md` and `BREAKTHROUGH_FEATURES.md`.

**⚠️ Partially Implemented & Needs Significant Work:**
- **Backend Services & APIs:** Many API endpoints in `server/routes.ts` are placeholders, use mock data, or are incomplete. `server/routes-clean.ts` and `server/routes/simple.ts` reflect ongoing refactoring. Critical services like `oofMomentsService.ts`, `walletAnalysisService.ts`, `tokenAdvertisingService.ts` need full implementation and connection to live data/AI.
- **AI Agent System:** LangGraph integration and the actual logic for each AI agent (analysis, narrative, visual, publishing) are not implemented. Current AI generation is basic.
- **Blockchain Integration:** Solana on-chain data fetching (`server/services/solanaService.ts`, `productionSolanaService.ts`) and Zora NFT minting (`server/services/zoraIntegration.ts`) logic needs to be robust, fully tested, and integrated end-to-end.
- **Core Features:** While UI for many features exists, the backend logic, data flow, and AI integration are often missing or incomplete for OOF Moments, Token Ads, Campaigns, Gaming elements.
- **Mobile-First UI/UX:** Initial UI overhaul on some pages, but a consistent, polished, mobile-first experience across all 25+ pages is needed. Many pages still have MVP-level UI.

**❌ Critical Missing Pieces for Production:**
- **Fully Functional APIs:** Most APIs are not production-ready and need data validation, error handling, and connection to real services.
- **Complete AI Pipeline:** The AI agent orchestrator and individual agent logic for generating high-quality OOF moments.
- **Payment Processing:** Stripe/crypto payments for Token Advertising and other potential revenue streams.
- **Comprehensive Testing:** Unit, integration, and E2E tests are largely absent.
- **Data Integrity & Seeding:** Production data seeding and robust data management practices.
- **Security Hardening:** Thorough security review, CSP, advanced rate limiting, etc.
- **Performance Optimization:** Bundle optimization, lazy loading, caching across the application.

## 🧠 Core Features & Business Model (Target Vision)

Reference `STRATEGIC_ANALYSIS.md` for the "Regret Economy" vision.
1.  **AI-Powered OOF Moments:**
    *   Personalized trading stories from wallet analysis (Solana, potentially multi-chain).
    *   Visually stunning cards with rarity, gamification, and emotional AI.
    *   Cross-chain NFT minting (Zora on Base).
    *   Advanced social interactions, viral mechanics, "shared trauma bonds".
2.  **Token Advertising Marketplace:**
    *   Automated, rotating ad slots for Solana tokens ($10 USDC/30-min).
    *   Payment processing, performance analytics, revenue sharing.
3.  **Campaign Management System:**
    *   Multi-platform social engagement (Twitter, Farcaster, etc.).
    *   Automated verification and reward distribution (USDC, OOF points).
4.  **Advanced Gaming & Gamified Therapy:**
    *   Slots, Battle Royale, Time Machine, Achievements.
    *   Leaderboards, OOF Score, "Achievement Therapy" mechanics.
5.  **Revenue Streams:** Ad fees, premium AI, NFT minting fees, campaign fees, data licensing.

## 🔧 Technical Stack

Identical to the previous version of this file, but verify all integrations are complete.
**Frontend:** React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion.
**Backend:** Express.js, TypeScript, Drizzle ORM, PostgreSQL (Neon), WebSocket.
**AI:** LangGraph, OpenAI, Perplexity API, other models as per `server/ai/config.ts`.
**Blockchain:** Solana Web3.js, Dynamic Labs, Zora Protocol, Jupiter/Raydium.

## 📊 Database Schema

Located at `shared/schema.ts`. Key tables: `users`, `oofMoments`, `tokenAds`, `campaigns`, `walletAnalysis`, `momentInteractions`, etc. Schema is comprehensive and largely production-ready but ensure all services utilize it correctly.

**File Path Aliases:**
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `client/public/assets/` (updated after cleanup)

## 🚀 Production Deployment Roadmap (High-Level Focus Areas)

This replaces the previous phased roadmap with a focus on current gaps. See `Todo.md` for detailed tasks.

### **Focus Area 1: Stabilize & Complete Backend Core**
1.  **Solidify APIs:** Implement all API endpoints in `server/routes.ts` with proper data validation (Zod), error handling, and connection to services. Remove mock logic.
2.  **Full Database Integration:** Ensure all services use PostgreSQL via Drizzle and `DatabaseUtils`. Complete any pending data migrations and ensure data integrity.
3.  **Robust Authentication & Security:** Enhance JWT validation, implement CSRF protection if applicable, refine rate limiting, ensure all inputs are sanitized.

### **Focus Area 2: Implement Breakthrough AI & Blockchain Features**
1.  **AI Agent System (LangGraph):**
    *   Implement `WalletAnalysisAgent` (Scout) for deep psychological insights.
    *   Implement `StoryGenerationAgent` (Director) for compelling narratives.
    *   Implement `VisualDesignAgent` (Artist) for dynamic, high-quality card visuals.
    *   Implement `CrossChainAgent` (Publisher) for seamless Zora minting.
2.  **End-to-End OOF Moments Flow:** From wallet input to AI generation, card display, social interaction, and Zora NFT minting.
3.  **Solana Data Integration:** Ensure `walletAnalysisService.ts` uses real-time, accurate Solana on-chain data.
4.  **Zora Minting Workflow:** Complete and test the NFT minting process on Base via Zora, including potential fee structures.

### **Focus Area 3: Elevate Frontend to "1000x Stunning Product"**
1.  **Mobile-First UI/UX Overhaul:** Apply the new design language (seen in `Landing.tsx` overhaul) consistently across all 25+ pages. Ensure responsiveness and excellent mobile experience.
2.  **Gamification & Viral Mechanics:** Integrate achievements, leaderboards, OOF score, social sharing incentives, and "shared trauma bond" features.
3.  **Performance Optimization:** Implement lazy loading, bundle splitting, image optimization, and caching as per `FRONTEND_OPTIMIZATION.md`.
4.  **Complete Feature Pages:** Ensure all pages listed in `client/src/pages/` are fully functional, visually polished, and connected to backend services.

### **Focus Area 4: Implement Revenue Streams & Productionize**
1.  **Token Advertising System:** Implement payment processing (Stripe/USDC) and ad rotation logic.
2.  **Campaign Platform:** Complete multi-platform integrations and reward system.
3.  **Testing:** Implement comprehensive unit, integration, and E2E tests.
4.  **Monitoring & Logging:** Set up Sentry/DataDog for error tracking and performance monitoring.
5.  **Deployment:** Finalize Docker setup (`Dockerfile`, `docker-compose.yml`) and Nginx configuration (`nginx/nginx.conf`) for production.

## 🔥 Competitive Advantages & Strategic Goals

Refer to `STRATEGIC_ANALYSIS.md` and `BREAKTHROUGH_FEATURES.md`. Key goals:
- Establish the "Regret Economy" as a new market category.
- Leverage "Emotional AI" for deep user engagement and data monetization.
- Create viral loops through "Shared Trauma Bonds" and gamified therapy.
- Achieve market domination through unique cross-chain emotional asset bridging.

## 🛠️ Development Guidelines

### **Code Standards:**
- TypeScript throughout (strict mode). Adhere to ESLint rules.
- Follow patterns in `FRONTEND_OPTIMIZATION.md` for UI/UX.
- Use `DatabaseUtils` for all database interactions.
- Implement comprehensive error handling (see `server/middleware/errorHandler.ts`).

### **Feature Development Process (Revised):**
1. Define feature requirements based on `Todo.md` and strategic documents.
2. Update/verify database schema in `shared/schema.ts`.
3. Implement backend service logic in `server/services/`.
4. Create/update API endpoint in `server/routes.ts` with Zod validation.
5. Develop/enhance frontend components in `client/src/` (mobile-first, stunning UI).
6. Integrate frontend with API using TanStack Query.
7. Write tests (unit, integration).
8. Ensure functionality aligns with the "Regret Economy" vision.

### **AI Integration Pattern (Target):**
```typescript
// server/ai/orchestrator.ts
// Target: A fully functional LangGraph multi-agent system
const oofOrchestrator = new AIOrchestrator({
  scout: new WalletAnalysisAgent(db, solanaService), // Real dependencies
  director: new StoryGenerationAgent(aiModels),      // Configured AI models
  artist: new VisualDesignAgent(templateEngine),   // Dynamic image generation
  publisher: new CrossChainAgent(zoraService)       // Zora integration
});

// Example usage in oofMomentsService.ts
const momentData = await oofOrchestrator.generateOOFMoment(walletAddress, { /* user preferences */ });
await DatabaseUtils.saveOOFMoment(userId, momentData);
```

## 🔧 Reference Implementations

- **Solana App Kit (`solana-app-kit-main/`):** Useful for React Native mobile patterns if pursued later, but current focus is web.
- **AI Agent Architecture (`gemini-fullstack-langgraph-quickstart/`):** Key reference for building the LangGraph-based multi-agent system in `server/ai/`.

## 🎯 Success Metrics (Target)

**Technical KPIs:**
- API response time < 150ms (P95).
- AI moment generation success > 98%; average generation time < 30 seconds.
- Zora NFT minting success > 99%.
- Lighthouse scores > 90 for performance, accessibility, best practices, SEO.

**Business KPIs:**
- User Engagement: Daily Active Users (DAU), OOF moments created/shared per user, time on platform.
- Revenue: Ad slot fill rate, campaign bookings, premium feature subscriptions, NFT minting volume.
- Virality: Viral coefficient (k-factor), social media mentions, user-generated content volume.
- Market Penetration: Percentage of active crypto traders using the platform.

## 🚨 Critical Production Requirements (Reiteration)

1.  **Security:** Robust auth, input validation, rate limiting, secret management, regular audits.
2.  **Scalability:** Horizontally scalable services, database read replicas, CDN, load balancing.
3.  **Reliability:** Comprehensive monitoring, alerting, automated recovery, 99.9%+ uptime.
4.  **Data Integrity:** Transactional database operations, backups, GDPR/CCPA compliance.
5.  **Performance:** Optimized frontend/backend, efficient database queries, fast AI responses.

---

**The OOF Platform's vision of a "Regret Economy" is highly innovative. Achieving this requires diligent implementation of the backend systems, AI capabilities, and a truly exceptional UI/UX that resonates emotionally with users. This updated `CLAUDE.md` and the forthcoming `Todo.md` will guide this transformation.**