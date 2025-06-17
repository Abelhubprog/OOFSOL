import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { solanaService } from "./services/solanaService";
import { rugDetectionService } from "./services/rugDetectionService";
import { insertPredictionSchema, insertMissedOpportunitySchema, insertSlotSpinSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Token routes
  app.get('/api/tokens', async (req, res) => {
    try {
      const tokens = await storage.getTokens();
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  app.get('/api/tokens/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const token = await storage.getToken(id);
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(500).json({ message: "Failed to fetch token" });
    }
  });

  // Prediction routes
  app.get('/api/predictions', async (req, res) => {
    try {
      const predictions = await storage.getPredictions();
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  app.get('/api/predictions/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const predictions = await storage.getUserPredictions(userId);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching user predictions:", error);
      res.status(500).json({ message: "Failed to fetch user predictions" });
    }
  });

  app.post('/api/predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPredictionSchema.parse({
        ...req.body,
        userId,
      });

      // Calculate expiration time based on timeframe
      const expiresAt = new Date();
      switch (validatedData.timeframe) {
        case '1h':
          expiresAt.setHours(expiresAt.getHours() + 1);
          break;
        case '4h':
          expiresAt.setHours(expiresAt.getHours() + 4);
          break;
        case '24h':
          expiresAt.setHours(expiresAt.getHours() + 24);
          break;
        case '7d':
          expiresAt.setDate(expiresAt.getDate() + 7);
          break;
        default:
          expiresAt.setHours(expiresAt.getHours() + 1);
      }

      const prediction = await storage.createPrediction({
        ...validatedData,
        expiresAt,
      });

      res.json(prediction);
    } catch (error) {
      console.error("Error creating prediction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prediction" });
    }
  });

  // Missed opportunities routes
  app.get('/api/missed-opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const opportunities = await storage.getUserMissedOpportunities(userId);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching missed opportunities:", error);
      res.status(500).json({ message: "Failed to fetch missed opportunities" });
    }
  });

  app.post('/api/missed-opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMissedOpportunitySchema.parse({
        ...req.body,
        userId,
      });

      const opportunity = await storage.createMissedOpportunity(validatedData);
      res.json(opportunity);
    } catch (error) {
      console.error("Error creating missed opportunity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create missed opportunity" });
    }
  });

  // Slot spin routes
  app.post('/api/slots/spin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user has enough OOF tokens (cost: 5 OOF)
      const user = await storage.getUser(userId);
      if (!user || (user.oofTokens || 0) < 5) {
        return res.status(400).json({ message: "Insufficient OOF tokens" });
      }

      // Generate random slot result
      const symbols = ['BONK', 'WIF', 'MYRO', 'MOON', '100x', 'OOF', '💎', '🚀'];
      const result = {
        reel1: symbols[Math.floor(Math.random() * symbols.length)],
        reel2: symbols[Math.floor(Math.random() * symbols.length)],
        reel3: symbols[Math.floor(Math.random() * symbols.length)],
      };

      // Calculate reward based on matching symbols
      let reward = 0;
      let nftGenerated = false;

      if (result.reel1 === result.reel2 && result.reel2 === result.reel3) {
        // Three matching symbols
        if (result.reel1 === '100x') {
          reward = 25000; // Jackpot
          nftGenerated = true;
        } else if (result.reel1 === 'MOON') {
          reward = 1000;
          nftGenerated = true;
        } else {
          reward = 500;
        }
      } else if (result.reel1 === result.reel2 || result.reel2 === result.reel3 || result.reel1 === result.reel3) {
        // Two matching symbols
        reward = 100;
      }

      const spin = await storage.createSlotSpin({
        userId,
        result,
        reward,
        nftGenerated,
      });

      // Update user tokens (deduct spin cost, add reward)
      await storage.updateUserStats(userId, {
        oofTokens: (user.oofTokens || 0) - 5 + reward,
      });

      res.json({ ...spin, newBalance: (user.oofTokens || 0) - 5 + reward });
    } catch (error) {
      console.error("Error processing slot spin:", error);
      res.status(500).json({ message: "Failed to process slot spin" });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Wallet analysis route
  app.post('/api/analyze-wallet', isAuthenticated, async (req: any, res) => {
    try {
      const { walletAddress } = req.body;
      const userId = req.user.claims.sub;

      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // In a real implementation, this would analyze the wallet's transaction history
      // For now, we'll return sample missed opportunities
      const sampleOpportunities = [
        {
          tokenName: 'BONK',
          tokenSymbol: 'BONK',
          tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          missedGains: 87420,
          description: 'Sold 1 day before 100x pump',
          oofFactor: 10,
          sellDate: new Date('2023-12-15'),
          peakDate: new Date('2023-12-16'),
        },
        {
          tokenName: 'MYRO',
          tokenSymbol: 'MYRO',
          tokenAddress: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
          missedGains: 23456,
          description: 'Panic sold during first dip',
          oofFactor: 7,
          sellDate: new Date('2024-02-10'),
          peakDate: new Date('2024-02-20'),
        }
      ];

      // Create missed opportunities in database
      const opportunities = [];
      for (const opportunity of sampleOpportunities) {
        const created = await storage.createMissedOpportunity({
          userId,
          tokenName: opportunity.tokenName,
          tokenSymbol: opportunity.tokenSymbol,
          tokenAddress: opportunity.tokenAddress,
          description: opportunity.description,
          oofFactor: opportunity.oofFactor,
          sellDate: opportunity.sellDate,
          peakDate: opportunity.peakDate,
          missedGains: opportunity.missedGains.toString(),
        });
        opportunities.push(created);
      }

      res.json(opportunities);
    } catch (error) {
      console.error("Error analyzing wallet:", error);
      res.status(500).json({ message: "Failed to analyze wallet" });
    }
  });

  // Rug Detection AI endpoints
  app.post("/api/rug-detection/analyze", isAuthenticated, async (req, res) => {
    try {
      const { tokenAddress } = req.body;
      
      if (!tokenAddress) {
        return res.status(400).json({ message: "Token address is required" });
      }

      const analysis = await rugDetectionService.analyzeToken(tokenAddress);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing token:", error);
      res.status(500).json({ message: "Failed to analyze token" });
    }
  });

  app.get("/api/rug-detection/alerts", isAuthenticated, async (req, res) => {
    try {
      const alerts = await rugDetectionService.getRealTimeAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/rug-detection/accuracy", isAuthenticated, async (req, res) => {
    try {
      const accuracy = await rugDetectionService.getHistoricalAccuracy();
      res.json(accuracy);
    } catch (error) {
      console.error("Error fetching accuracy:", error);
      res.status(500).json({ message: "Failed to fetch accuracy metrics" });
    }
  });

  app.post("/api/rug-detection/train", isAuthenticated, async (req, res) => {
    try {
      const { newData } = req.body;
      
      if (!newData || !Array.isArray(newData)) {
        return res.status(400).json({ message: "Training data array is required" });
      }

      await rugDetectionService.trainModel(newData);
      res.json({ message: "Model training completed successfully" });
    } catch (error) {
      console.error("Error training model:", error);
      res.status(500).json({ message: "Failed to train model" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
