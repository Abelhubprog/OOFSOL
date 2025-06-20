# 🚀 OOF Platform - Quick Start Guide

## ⚡ Immediate Setup (Windows)

### 1. Start Development Server
```powershell
# In PowerShell (recommended)
npm run dev

# Windows alternative methods (if above fails)
npm run dev:win
# OR run the batch file
dev-win.bat
# OR simple mode (API only)
npm run dev:simple
```

### 2. Access Your Application
- **Frontend:** http://localhost:5000/
- **API:** http://localhost:5000/api/health
- **Database Admin:** `npm run db:studio`

## 🛠️ Development Commands

### Essential Commands
```bash
npm run dev          # Start full development server
npm run typecheck    # Check TypeScript errors
npm run build        # Build for production
npm run clean        # Clean build cache
```

### Database Commands
```bash
npm run db:studio    # Open database admin panel
npm run db:push      # Push schema changes (dev only)
npm run db:migrate   # Apply migrations (production)
```

## 🎯 Key Features Ready to Test

### 1. **OOF Moments** (`/oof-moments`)
- AI-generated trading cards
- Wallet analysis integration
- Social sharing features
- Zora NFT minting

### 2. **Token Advertising** (`/tokens`)
- 30-minute rotating ad slots
- Performance analytics
- Revenue tracking
- $10 USDC fee structure

### 3. **Wallet Analysis** (`/wallet-analyzer`)
- Solana transaction analysis
- Trading pattern detection
- Portfolio insights
- Risk assessment

### 4. **Gaming Features**
- **Slots** (`/slots`) - NFT rewards
- **Battle Royale** (`/battle-royale`) - Trading competitions
- **Time Machine** (`/time-machine`) - Historical analysis

## 🔧 Configuration

### Environment Variables (.env)
```env
# Required for basic functionality
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-jwt-secret"

# Optional but recommended
OPENAI_API_KEY="your-openai-key"
PERPLEXITY_API_KEY="your-perplexity-key"
SOLANA_RPC_URL="https://api.devnet.solana.com"
```

## 🐛 Common Issues & Solutions

### "NODE_ENV is not recognized"
- ✅ **Fixed!** Use `npm run dev` (now uses cross-env)
- Alternative: `npm run dev:win` or `dev-win.bat`

### "Could not find build directory"
```bash
# This happens in development - use one of these:
npm run dev          # Full development with Vite
npm run dev:simple   # Simple mode (API + basic HTML)
dev-win.bat         # Windows batch file

# Only build for production deployment:
npm run build && npm run start
```

### Database Connection Issues
```bash
# Test database connection
npm run db:studio

# Reset database (development only)
npm run db:push
```

### Port 5000 Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### TypeScript Errors
```bash
# Check for errors
npm run typecheck

# Clean and reinstall
npm run clean && npm install
```

## 📊 Project Status

### ✅ Completed
- Windows development environment
- Database connection and migrations
- API endpoints with authentication
- Frontend with 28+ pages
- Real-time WebSocket system
- Security and monitoring
- Cross-chain NFT integration

### 🔄 Ready for Enhancement
- AI service integration (need API keys)
- Payment processing (need Stripe keys)
- Social media integrations
- Mobile PWA features

## 🚀 Next Steps

1. **Start developing:** `npm run dev`
2. **Explore the codebase:** Check `client/src/` and `server/`
3. **Test core features:** Visit `/oof-moments` and `/tokens`
4. **Read documentation:** See `DEV_GUIDE.md` and `FRONTEND_OPTIMIZATION.md`

## 📱 Mobile Development

The platform is mobile-ready with:
- Responsive design (Tailwind CSS)
- Touch-friendly interactions
- PWA capabilities (planned)
- Mobile-first approach

## 🎯 Core Business Logic

The OOF Platform transforms crypto trading failures into viral social content:
1. **AI Analysis** - Analyze wallet transactions for "OOF moments"
2. **Content Generation** - Create shareable trading cards
3. **Social Mechanics** - Likes, shares, comments with crypto rewards
4. **Monetization** - Token advertising and NFT minting revenue

## 📞 Support

If you need help:
1. Check `DEV_GUIDE.md` for detailed instructions
2. Review `FRONTEND_OPTIMIZATION.md` for enhancement ideas
3. Check the server logs for debugging info
4. Test API endpoints with `/api/health`

**Happy coding! Ready to create some legendary OOF Moments! 🎯**