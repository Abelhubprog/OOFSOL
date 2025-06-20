import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, optionalAuth, authRateLimit, generalRateLimit, generateToken } from '../middleware/auth';
import { validateInput } from '../middleware/validation';
import { MonitoringService } from '../middleware/monitoring';
import { DatabaseUtils } from '../db/utils';
import { AIOrchestrator } from '../ai/orchestrator';
import { OOFMomentsService } from '../services/oofMomentsService';
import { WalletAnalysisService } from '../services/walletAnalysisService';
import { tokenAdvertisingService } from '../services/tokenAdvertisingService';
import { WebSocketManager } from '../websocket/websocketManager';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

// Schemas
const userCreateSchema = z.object({
  walletAddress: z.string().min(32).max(50),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

// Utility functions
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const validateBody = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Validation error', details: error });
  }
};

export function createProductionRoutes(wsManager: WebSocketManager): Router {
  const router = Router();

  // 🔐 Authentication Routes
  router.post('/auth/wallet', 
    authRateLimit,
    validateBody(userCreateSchema),
    asyncHandler(async (req, res) => {
      const { walletAddress, email, firstName, lastName } = req.body;
      
      // Check if user already exists
      let user = await DatabaseUtils.getUserByWallet(walletAddress);
      
      if (!user) {
        // Create new user
        user = await DatabaseUtils.createOrUpdateUser(walletAddress, {
          email: email || null,
          firstName: firstName || null,
          lastName: lastName || null,
          oofTokens: 100, // Welcome bonus
          oofScore: 0
        });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.walletAddress || undefined);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            oofTokens: user.oofTokens,
            oofScore: user.oofScore,
            createdAt: user.createdAt
          },
          token
        }
      });
    })
  );

  // 👤 User Routes
  router.get('/users/me', 
    authenticateUser,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stats = await storage.getUserStats(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            oofTokens: user.oofTokens,
            oofScore: user.oofScore,
            ranking: user.ranking,
            createdAt: user.createdAt
          },
          stats
        }
      });
    })
  );

  router.get('/users/:userId/stats',
    validateParams(walletAddressSchema.pick({ walletAddress: true }).extend({ userId: z.string() })),
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    })
  );

  // 📊 Wallet Analysis Routes
  router.post('/wallet/analyze',
    walletAnalysisRateLimit,
    optionalAuth,
    validateBody(walletAddressSchema),
    asyncHandler(async (req, res) => {
      const { walletAddress } = req.body;
      
      // Start analysis (returns immediately with job info)
      const progress = await solanaWalletAnalysis.getProgress(walletAddress);
      
      if (progress.progress === 0) {
        // Start new analysis
        solanaWalletAnalysis.analyzeWallet(walletAddress).catch(console.error);
      }

      res.json({
        success: true,
        data: {
          walletAddress,
          progress: progress.progress,
          currentStep: progress.currentStep,
          status: progress.progress === 100 ? 'completed' : 'analyzing'
        }
      });
    })
  );

  router.get('/wallet/:walletAddress/progress',
    validateParams(walletAddressSchema),
    asyncHandler(async (req, res) => {
      const { walletAddress } = req.params;
      const progress = await solanaWalletAnalysis.getProgress(walletAddress);
      
      res.json({
        success: true,
        data: progress
      });
    })
  );

  router.get('/wallet/:walletAddress/analysis',
    validateParams(walletAddressSchema),
    asyncHandler(async (req, res) => {
      const { walletAddress } = req.params;
      const analysis = await storage.getWalletAnalysis(walletAddress);
      
      if (!analysis || analysis.status !== 'completed') {
        return res.status(404).json({ 
          error: 'Analysis not found or not completed',
          message: 'Run wallet analysis first'
        });
      }

      res.json({
        success: true,
        data: analysis
      });
    })
  );

  // 🎨 OOF Moments Routes
  router.post('/oof-moments/generate',
    oofMomentsRateLimit,
    authenticateUser,
    requireWallet,
    validateBody(oofMomentCreateSchema),
    asyncHandler(async (req, res) => {
      const { walletAddress, momentType, isPublic } = req.body;
      const userId = req.user!.id;

      // Generate OOF moments using the enhanced service
      const moments = await oofMomentsGenerator.generateOOFMoments(walletAddress, userId);

      // Save all moments to database
      const savedMoments = [];
      for (const moment of moments) {
        const dbMoment = oofMomentsGenerator.convertToDBFormat(moment, walletAddress, userId);
        const saved = await storage.createOOFMoment(dbMoment);
        savedMoments.push(saved);

        // Broadcast new moment via WebSocket
        wsManager.broadcastNewOOFMoment(saved);
      }

      // Award OOF tokens for moment creation
      await storage.updateUserStats(userId, {
        oofTokens: (await storage.getUser(userId))!.oofTokens! + 50
      });

      res.json({
        success: true,
        data: {
          moments: savedMoments,
          tokensEarned: 50
        }
      });
    })
  );

  router.get('/oof-moments',
    optionalAuth,
    validateQuery(paginationSchema.extend({
      userId: z.string().optional(),
      walletAddress: z.string().optional(),
      rarity: z.enum(['legendary', 'epic', 'rare']).optional()
    })),
    asyncHandler(async (req, res) => {
      const { page = 1, limit = 20, userId, walletAddress, rarity } = req.query;
      const offset = (page - 1) * limit;

      let moments;
      if (userId) {
        moments = await storage.getOOFMomentsByUser(userId);
      } else if (walletAddress) {
        moments = await storage.getOOFMomentsByWallet(walletAddress);
      } else {
        moments = await storage.getPublicOOFMoments(limit, offset);
      }

      // Filter by rarity if specified
      if (rarity) {
        moments = moments.filter(moment => moment.rarity === rarity);
      }

      res.json({
        success: true,
        data: {
          moments,
          pagination: {
            page,
            limit,
            total: moments.length,
            hasMore: moments.length === limit
          }
        }
      });
    })
  );

  router.get('/oof-moments/:momentId',
    validateParams(z.object({ momentId: z.string().transform(Number) })),
    asyncHandler(async (req, res) => {
      const { momentId } = req.params;
      const moment = await storage.getOOFMoment(momentId);
      
      if (!moment) {
        return res.status(404).json({ error: 'OOF moment not found' });
      }

      res.json({
        success: true,
        data: moment
      });
    })
  );

  // 💖 Social Interaction Routes
  router.post('/oof-moments/:momentId/interact',
    authenticateUser,
    validateParams(z.object({ momentId: z.string().transform(Number) })),
    validateBody(momentInteractionSchema),
    asyncHandler(async (req, res) => {
      const { momentId } = req.params;
      const { interactionType, comment } = req.body;
      const userId = req.user!.id;

      // Check if moment exists
      const moment = await storage.getOOFMoment(momentId);
      if (!moment) {
        return res.status(404).json({ error: 'OOF moment not found' });
      }

      // Create interaction
      const interaction = await storage.createMomentInteraction({
        momentId,
        userId,
        interactionType,
        comment
      });

      // Award OOF tokens for interactions
      const tokensEarned = interactionType === 'like' ? 1 : interactionType === 'share' ? 5 : 2;
      await storage.updateUserStats(userId, {
        oofTokens: (await storage.getUser(userId))!.oofTokens! + tokensEarned
      });

      // Broadcast interaction via WebSocket
      wsManager.io.to('global-oof-feed').emit(`moment:${interactionType}`, {
        momentId,
        userId,
        comment,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          interaction,
          tokensEarned
        }
      });
    })
  );

  // 🏆 Leaderboard Routes
  router.get('/leaderboard',
    validateQuery(z.object({
      type: z.enum(['oof-score', 'tokens', 'moments']).default('oof-score'),
      limit: z.string().transform(Number).refine(n => n > 0 && n <= 100).default(50)
    })),
    asyncHandler(async (req, res) => {
      const { type, limit } = req.query;
      
      let leaderboard;
      switch (type) {
        case 'oof-score':
          leaderboard = await storage.getLeaderboard(limit);
          break;
        case 'tokens':
          leaderboard = await storage.getLeaderboard(limit);
          leaderboard.sort((a, b) => (b.oofTokens || 0) - (a.oofTokens || 0));
          break;
        case 'moments':
          // This would need a custom query to count moments per user
          leaderboard = await storage.getLeaderboard(limit);
          break;
        default:
          leaderboard = await storage.getLeaderboard(limit);
      }

      res.json({
        success: true,
        data: {
          leaderboard: leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            walletAddress: user.walletAddress,
            oofScore: user.oofScore,
            oofTokens: user.oofTokens,
            firstName: user.firstName,
            lastName: user.lastName
          })),
          type,
          updatedAt: new Date().toISOString()
        }
      });
    })
  );

  // 🎯 Token Advertising Routes
  router.get('/token-ads/active',
    asyncHandler(async (req, res) => {
      const ads = await storage.getActiveTokenAds();
      
      res.json({
        success: true,
        data: {
          ads,
          updatedAt: new Date().toISOString()
        }
      });
    })
  );

  router.post('/token-ads',
    authenticateUser,
    requireWallet,
    validateBody(tokenAdCreateSchema),
    asyncHandler(async (req, res) => {
      const adData = {
        ...req.body,
        advertiserWallet: req.user!.walletAddress!,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        cycleNumber: Math.floor(Date.now() / (30 * 60 * 1000)) // Current 30-min cycle
      };

      const ad = await storage.createTokenAd(adData);

      // Broadcast new ad via WebSocket
      wsManager.broadcastTokenAdUpdate(ad);

      res.json({
        success: true,
        data: ad
      });
    })
  );

  // 📈 Analytics Routes
  router.get('/analytics/platform',
    asyncHandler(async (req, res) => {
      // Platform-wide analytics
      const [tokens, moments, users] = await Promise.all([
        storage.getTokens(),
        storage.getPublicOOFMoments(1000), // Get more for counting
        storage.getLeaderboard(1000)
      ]);

      res.json({
        success: true,
        data: {
          totalTokens: tokens.length,
          totalMoments: moments.length,
          totalUsers: users.length,
          activeAds: (await storage.getActiveTokenAds()).length,
          generatedAt: new Date().toISOString()
        }
      });
    })
  );

  // 🔍 Search Routes
  router.get('/search',
    validateQuery(z.object({
      q: z.string().min(1),
      type: z.enum(['moments', 'users', 'tokens']).optional(),
      limit: z.string().transform(Number).refine(n => n > 0 && n <= 50).default(20)
    })),
    asyncHandler(async (req, res) => {
      const { q, type, limit } = req.query;
      
      // Simple search implementation
      // In production, use proper search engine like Elasticsearch
      const results = {
        moments: [],
        users: [],
        tokens: []
      };

      if (!type || type === 'moments') {
        const moments = await storage.getPublicOOFMoments(100);
        results.moments = moments.filter(moment => 
          moment.title.toLowerCase().includes(q.toLowerCase()) ||
          moment.description.toLowerCase().includes(q.toLowerCase()) ||
          moment.tags?.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
        ).slice(0, limit);
      }

      res.json({
        success: true,
        data: {
          query: q,
          results,
          total: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
        }
      });
    })
  );

  return router;
}

// Helper imports that may be missing
import { z } from 'zod';