import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { solanaService } from "./services/solanaService";
import { rugDetectionService } from "./services/rugDetectionService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple wallet-based authentication - no middleware needed
  
  // Token routes (public)
  app.get('/api/tokens', async (req, res) => {
    try {
      const tokens = await storage.getTokens();
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  // Token ads routes (public)
  app.get('/api/token-ads/current', async (req, res) => {
    try {
      const ads = await storage.getActiveTokenAds();
      res.json(ads);
    } catch (error) {
      console.error("Error fetching token ads:", error);
      res.status(500).json({ message: "Failed to fetch token ads" });
    }
  });

  // Campaign routes (public)
  app.get('/api/campaigns', async (req, res) => {
    try {
      // Mock campaigns for now
      const campaigns = [
        {
          id: "camp_001",
          name: "OOF Token Launch Campaign",
          description: "Engage with our launch posts across social media platforms",
          platforms: ["twitter", "farcaster", "tiktok", "arena"],
          budget: 10000,
          spentBudget: 2500,
          rewardPerAction: 5,
          targetActions: ["like", "retweet", "follow"],
          status: "active",
          participants: 234,
          maxParticipants: 1000,
          createdAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ];
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/participations', async (req, res) => {
    try {
      // Mock participations for now
      const participations = [
        {
          id: "part_001",
          campaignId: "camp_001",
          userId: "user_001",
          action: "like",
          platform: "twitter",
          reward: 5,
          status: "verified",
          createdAt: new Date()
        }
      ];
      res.json(participations);
    } catch (error) {
      console.error("Error fetching participations:", error);
      res.status(500).json({ message: "Failed to fetch participations" });
    }
  });

  // Rug detection routes (public)
  app.get('/api/rug-detection/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const analysis = await rugDetectionService.analyzeToken(address);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing token:", error);
      res.status(500).json({ message: "Failed to analyze token" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}