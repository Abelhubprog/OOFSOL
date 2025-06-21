# AGENTS.md - OOF Platform Development Guide for AI

This document provides essential guidance, context, and directives for AI agents working on the OOF Platform codebase. Its content is derived and consolidated from `CLAUDE.md` and `Todo.md`.

## Agent Directives

*   **Top Priority (User Mandate):** Focus on making the app frontend and blockchain aspects work with **real data**. This involves replacing mock data and ensuring end-to-end functionality for key features, particularly OOF Moment generation using actual Solana wallet data and displaying it on the frontend.
*   **Production Readiness:** All code must be production quality: robust error handling, security best practices, and performance considerations are paramount.
*   **Follow Established Patterns:** Adhere to coding conventions, architectural patterns (e.g., service layer for business logic, `DatabaseUtils` for DB interaction), and development processes outlined herein.
*   **Test Your Code:** Implement relevant tests (unit, integration) for new features and bug fixes. Ensure existing tests pass. For integration tests requiring a server, ensure the server is started within the same execution context if possible (refer to `tests/integration/` for examples).
*   **Windows Compatibility:** The primary development and testing environment for AI agents might not be Windows. However, be aware of potential issues noted in `WINDOWS_FIX.md` if logs indicate Windows-specific problems. Use cross-platform solutions.
*   **Incremental Changes:** Submit changes in logical, manageable units with clear, conventional commit messages.
*   **Consult `Todo.md`:** For a detailed, human-readable task list and broader project status, refer to `Todo.md`. This `AGENTS.md` reflects its high-level priorities.
*   **Strategic Alignment:** Ensure development aligns with the "Regret Economy" vision detailed in `STRATEGIC_ANALYSIS.md` and `BREAKTHROUGH_FEATURES.md`.

## Project Context

*   **Project Goal:** OOF Platform is a Solana-based social media engagement platform transforming crypto trading failures ("OOF Moments") into shareable, monetizable, and gamified content. It aims to create a "Regret Economy" by leveraging AI for personalized experiences and cross-chain technology (Zora Protocol on Base) for NFT minting.
*   **Core User Journey (Current Development Focus):**
    1.  User connects wallet (via Dynamic.xyz on frontend).
    2.  User submits their Solana wallet address for analysis via the frontend (e.g., `OOFMomentsPage.tsx`).
    3.  Backend (`POST /api/oof-moments/ai-analyze`) receives the request.
    4.  `WalletAnalysisService` (or `ProductionSolanaService`) fetches and processes **real** Solana transaction data.
    5.  `AIOrchestrator` (via `OOFMomentsService`) uses this data for a **simplified AI processing** step to generate basic OOF Moment details (title, description, rarity). Full LangGraph multi-agent system is a future step.
    6.  The generated OOF Moment is saved to the PostgreSQL database via `DatabaseUtils`.
    7.  Frontend displays the generated Moment, including a dynamically generated SVG card image (from `GET /api/oof-moments/card-image/:id`).
    8.  User can (optionally) mint this Moment as an NFT on Zora (Base network) via `POST /api/zora/mint-moment`.
*   **Technical Stack Overview:**
    *   **Frontend (`client/`):** React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui, Framer Motion.
    *   **Backend (`server/`):** Express.js, TypeScript, Drizzle ORM with PostgreSQL (Neon).
    *   **AI (`server/ai/`):** Target: LangGraph multi-agent system (Scout, Director, Artist, Publisher). Current: Simplified AI calls via `AIOrchestrator`. Models: OpenAI, Perplexity API, etc. (see `server/ai/config.ts`).
    *   **Blockchain:** Solana Web3.js, Dynamic Labs (wallets), Zora Protocol (NFTs).
*   **Database:** Schema in `shared/schema.ts`. Key tables: `users`, `oofMoments`, `tokenAds`, `campaigns`, `walletAnalysis`, `momentInteractions`.

## Key Development Tasks & Priorities (Summary from `Todo.md`)

*   **Immediate Top Priority (User Mandate):** Implement the "Core User Journey" described above with real Solana data and simplified AI, ensuring frontend display and Zora minting functionality.
*   **Overall Phased Approach (High-Level):**
    1.  **Core Backend & API Solidification:** Fully implement and validate all backend APIs, ensure robust database integration, and enhance security.
    2.  **AI & Blockchain Powerhouse:** Implement the full AI agent system (LangGraph) and complete end-to-end blockchain features (Solana data, Zora minting).
    3.  **Frontend "Stunning Product" Overhaul:** Elevate UI/UX across all pages to be mobile-first, highly engaging, and visually polished. Implement gamification.
    4.  **Feature Completion & Revenue:** Finalize all advanced features (Token Ads, Campaigns, Gaming) and implement payment processing for revenue streams.
    5.  **Production Hardening & Launch:** Comprehensive testing, monitoring, security audits, and deployment.

## Development Environment & Commands

*   **Recommended Dev Start (esp. Windows):** `dev-win.bat` (uses `SKIP_DB_CHECK=true`) or `npm run dev:safe`.
*   **Standard Start:** `npm run dev`.
*   **API Only (no Vite):** `npm run dev:simple`.
*   **Type Check:** `npm run check`.
*   **DB Migrations:** `npm run db:generate`, `npm run db:migrate`, `npm run db:push` (dev only).
*   **DB Studio:** `npm run db:studio`.
*   **Build & Start Prod:** `npm run build && npm run start`.

## Coding Conventions & Standards

*   **TypeScript:** Strict mode. Use types/schemas from `shared/schema.ts`. Follow ESLint rules.
*   **Error Handling:** Use `asyncHandler` for routes. Structured errors via `server/middleware/errorHandler.ts`.
*   **Database:** Use `DatabaseUtils` in `server/db/utils.ts`.
*   **Services:** Business logic in `server/services/`.
*   **API Validation:** Use Zod schemas from `shared/schema.ts` with `validateRequest` middleware.
*   **AI Integration:** Target: LangGraph multi-agent system (`server/ai/orchestrator.ts`).
    ```typescript
    // Target AI Integration Pattern:
    // const oofOrchestrator = new AIOrchestrator({
    //   scout: new WalletAnalysisAgent(db, solanaService),
    //   director: new StoryGenerationAgent(aiModels),
    //   artist: new VisualDesignAgent(templateEngine),
    //   publisher: new CrossChainAgent(zoraService)
    // });
    ```
*   **Frontend:** Follow `FRONTEND_OPTIMIZATION.md`. Use `shadcn/ui`, Tailwind CSS. Adhere to mobile-first principles.

## How to Test

*   **Integration Tests:** `tests/integration/`. Run with `node tests/integration/<test_file>.mjs`.
    *   The dev server must be running. Start it in the background of the *same* `run_in_bash_session` execution if possible, ensuring it's healthy before tests run. Avoid `exit` in server start-up scripts for background execution.
    *   `api_helpers.mjs` contains request utilities.
*   **Unit Tests:** (Vitest TBD). Focus on testing complex service logic and utilities.
*   **Manual E2E Testing:** Critical for verifying the real-data OOF Moment flow.

## Known Issues & Workarounds

*   **Neon DB on Windows:** Potential WebSocket issues. `dev-win.bat` or `npm run dev:safe` (with `SKIP_DB_CHECK=true`) are workarounds for local dev. Production/Linux environments should be fine.
*   **Vite Initial Load:** Can be slow in dev; subsequent HMR is fast.

## Key File Locations

*   **Shared Schemas/Types:** `shared/schema.ts`
*   **Backend Entry / Main Server:** `server/index.ts`
*   **API Route Definitions:** `server/routes.ts`
*   **Business Logic Services:** `server/services/` (e.g., `oofMomentsService.ts`, `walletAnalysisService.ts`, `tokenAdvertisingService.ts`, `authService.ts`, `zoraIntegration.ts`)
*   **AI Core:** `server/ai/` (especially `orchestrator.ts`, `config.ts`, `types.ts`)
*   **Database Logic:** `server/db.ts` (connection), `server/db/utils.ts` (queries)
*   **Middleware:** `server/middleware/` (auth, error handling, validation)
*   **Frontend Main:** `client/src/main.tsx`, `client/src/App.tsx`
*   **Frontend Pages:** `client/src/pages/` (e.g., `OOFMomentsPage.tsx`, `Landing.tsx`)
*   **Frontend Components:** `client/src/components/`
*   **Path Aliases:** `@/` (client/src), `@shared/` (shared), `@assets/` (client/public/assets)
*   **Reference Implementations:** `solana-app-kit-main/`, `gemini-fullstack-langgraph-quickstart/`
*   **Strategic Guidance:** `STRATEGIC_ANALYSIS.md`, `BREAKTHROUGH_FEATURES.md`
*   **Detailed Task List:** `Todo.md`

## Critical Production Requirements (Agent Awareness)

*   **Security:** No hardcoded secrets (use env vars). Robust input validation. Secure JWT handling.
*   **Scalability & Performance:** Write efficient queries. Be mindful of AI model call costs/latency.
*   **Reliability:** Ensure comprehensive error handling and logging.
*   **Data Integrity:** Adhere to database schema and use transactional operations where appropriate.

This `AGENTS.md` is the primary source of truth for AI development on this project.
