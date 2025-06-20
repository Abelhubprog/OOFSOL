# 🚀 OOF Platform - Local Development Guide

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **VSCode** (recommended) - [Download](https://code.visualstudio.com/)

### Recommended VSCode Extensions
```
ES7+ React/Redux/React-Native snippets
TypeScript Importer
Prettier - Code formatter
ESLint
Tailwind CSS IntelliSense
Thunder Client (for API testing)
```

## 🛠️ Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment template:
```bash
# Windows PowerShell
copy .env.example .env

# Windows Command Prompt
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database (required)
DATABASE_URL="your-postgresql-connection-string"

# Security (required) 
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# AI Services (optional for basic development)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
PERPLEXITY_API_KEY=""

# Solana (required for blockchain features)
SOLANA_RPC_URL="https://api.devnet.solana.com"
```

## 🚀 Development Commands

### **Start Full Application**
```bash
# Cross-platform (recommended)
npm run dev

# Windows alternative (if cross-env fails)
npm run dev:win
```

### **Individual Components**
```bash
# Backend only
npm run dev:backend

# Database admin panel
npm run dev:db

# Type checking
npm run typecheck

# Clean build cache
npm run clean
```

## 🌐 Development URLs

Once running, access these URLs:

- **Frontend:** http://localhost:5000/
- **API:** http://localhost:5000/api/
- **Health Check:** http://localhost:5000/api/health
- **Database Studio:** http://localhost:4983/ (when running `npm run dev:db`)

## 🏗️ Project Structure

```
OOFSOL/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── services/       # API service calls
├── server/                 # Express.js backend
│   ├── ai/                 # AI orchestrator system
│   ├── db/                 # Database utilities
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   └── websocket/          # Real-time features
├── shared/                 # Shared types and schemas
└── migrations/             # Database migrations
```

## 🛠️ Common Development Tasks

### **Database Operations**
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development only)
npm run db:push

# Open database admin panel
npm run db:studio
```

### **Code Quality**
```bash
# Type checking
npm run typecheck

# Check for TypeScript errors
npm run check

# Build production version
npm run build
```

## 🔧 Frontend Development

The frontend is a modern React application with:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Wouter** for routing
- **TanStack Query** for server state
- **Dynamic Labs** for wallet connection

### **Key Frontend Features:**
- 🎯 **OOF Moments** - AI-generated trading cards
- 🎰 **Gaming Elements** - Slots, predictions, achievements  
- 💰 **Token Advertising** - Marketplace for token ads
- 📱 **Responsive Design** - Mobile-first approach
- 🔐 **Wallet Authentication** - Solana wallet integration

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/wallet` - Wallet-based authentication
- `GET /api/auth/me` - Get current user info

### **OOF Moments**
- `GET /api/oof-moments` - List public moments
- `POST /api/oof-moments/generate` - Generate new moment
- `GET /api/oof-moments/:id` - Get specific moment

### **Token Features**
- `GET /api/tokens` - List supported tokens
- `GET /api/wallet/:address` - Analyze wallet
- `GET /api/token-ads/current` - Active token advertisements

### **Health & Monitoring**
- `GET /health` - Basic health check
- `GET /api/health` - Detailed system status
- `GET /api/metrics` - Performance metrics (admin only)

## 🐛 Troubleshooting

### **Windows Environment Issues**
If you get "NODE_ENV is not recognized":
```bash
# Use the Windows-specific command
npm run dev:win

# Or install cross-env globally
npm install -g cross-env
```

### **Database Connection Issues**
1. Verify DATABASE_URL in `.env`
2. Check if database is accessible
3. Run `npm run db:push` to sync schema

### **Port Already in Use**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### **TypeScript Errors**
```bash
# Check for type errors
npm run typecheck

# Clean and reinstall
npm run clean
npm install
```

## 🔄 Development Workflow

### **Feature Development**
1. Create feature branch: `git checkout -b feature/your-feature`
2. Update database schema in `shared/schema.ts` if needed
3. Generate migration: `npm run db:generate`
4. Implement backend services in `server/services/`
5. Add API routes in `server/routes/`
6. Create frontend components in `client/src/components/`
7. Test functionality locally
8. Commit and push changes

### **Hot Reload**
The development server includes:
- ✅ **Backend hot reload** via `tsx`
- ✅ **Frontend hot reload** via Vite HMR
- ✅ **TypeScript compilation** on save
- ✅ **Error boundaries** for graceful error handling

## 📱 Mobile Development

The platform includes responsive design and PWA features:
- Mobile-optimized interface
- Touch-friendly interactions
- Offline capabilities (planned)
- Push notifications (planned)

## 🚀 Performance Tips

### **Development Performance**
- Use `npm run dev:backend` for backend-only development
- Enable database query logging in development
- Use React DevTools for component debugging
- Use Thunder Client or Postman for API testing

### **Optimization**
- Bundle analysis: Check `dist/` after `npm run build`
- Database queries: Use `npm run db:studio` to monitor
- Memory usage: Monitor with `/api/health` endpoint

## 🎯 Next Steps

1. **Get familiar** with the codebase structure
2. **Test the core features** (OOF Moments, Token Ads)
3. **Explore the database** with `npm run db:studio`
4. **Read the API documentation** in this guide
5. **Start building** your features!

Happy coding! 🚀 Ready to create some legendary OOF Moments!