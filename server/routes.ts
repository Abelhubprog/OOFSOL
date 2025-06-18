import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed Replit auth - using Dynamic.xyz for wallet authentication
import { solanaService } from "./services/solanaService";
import { rugDetectionService } from "./services/rugDetectionService";
import { solanaWalletAnalysis } from "./services/solanaWalletAnalysis";
import { oofMomentsGenerator } from "./services/oofMomentsGenerator";
import { aiOOFGenerator } from "./services/aiOOFMomentsGenerator";
import { crossChainBridge } from "./services/crossChainBridge";
import { zoraIntegration } from "./services/zoraIntegration";
import { 
  insertPredictionSchema, 
  insertMissedOpportunitySchema, 
  insertSlotSpinSchema,
  insertOOFMomentSchema,
  insertMomentInteractionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // No auth middleware needed - Dynamic.xyz handles authentication client-side

  // User routes (no authentication required - using Dynamic.xyz wallet addresses)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return empty user for now - wallet authentication handled by Dynamic.xyz
      res.json({ message: "Using Dynamic.xyz wallet authentication" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error" });
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

  app.get('/api/predictions/user', async (req: any, res) => {
    try {
      const walletAddress = req.query.walletAddress;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
      }
      const predictions = await storage.getUserPredictions(walletAddress);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching user predictions:", error);
      res.status(500).json({ message: "Failed to fetch user predictions" });
    }
  });

  app.post('/api/predictions', async (req: any, res) => {
    try {
      const walletAddress = req.body.walletAddress;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
      }
      const validatedData = insertPredictionSchema.parse({
        ...req.body,
        userId: walletAddress,
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

  // Token Advertising API Routes
  app.get('/api/token-ads/current', async (req, res) => {
    try {
      const ads = await storage.getActiveTokenAds();
      // Add time remaining for each ad
      const now = Date.now();
      const adsWithTimeRemaining = ads.map(ad => ({
        ...ad,
        timeRemaining: Math.max(0, new Date(ad.endTime).getTime() - now)
      }));
      res.json(adsWithTimeRemaining);
    } catch (error) {
      console.error("Error fetching active token ads:", error);
      res.status(500).json({ message: "Failed to fetch token ads" });
    }
  });

  app.post('/api/token-ads/submit', async (req, res) => {
    try {
      const {
        tokenAddress,
        tokenName,
        tokenSymbol,
        buyLink,
        description,
        telegram,
        twitter,
        website,
        slotNumber,
        adminWallet
      } = req.body;

      if (!tokenAddress || !tokenName || !tokenSymbol || !buyLink || !slotNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Calculate slot timing
      const now = new Date();
      const SLOT_DURATION = 30 * 60 * 1000; // 30 minutes
      const cycleNumber = Math.floor(now.getTime() / (SLOT_DURATION * 6));
      const startTime = new Date(now.getTime() + 60000); // Start 1 minute from now
      const endTime = new Date(startTime.getTime() + SLOT_DURATION);

      // Create the ad entry (pending payment verification)
      const adData = {
        tokenAddress,
        tokenName,
        tokenSymbol,
        advertiserWallet: adminWallet || 'PENDING',
        buyLink,
        description: description || '',
        telegram: telegram || null,
        twitter: twitter || null,
        website: website || null,
        paymentTxId: 'PENDING',
        paymentAmount: '10.00',
        paymentTokenSymbol: 'USD',
        slotNumber: parseInt(slotNumber),
        cycleNumber,
        startTime,
        endTime,
        verified: false,
        isActive: false // Will be activated after payment confirmation
      };

      const createdAd = await storage.createTokenAd(adData);
      res.json({ 
        message: "Ad listing submitted successfully. Payment verification pending.",
        adId: createdAd.id,
        paymentInstructions: {
          amount: "$10 USD equivalent",
          wallet: adminWallet,
          note: "Send payment confirmation to activate your listing"
        }
      });
    } catch (error) {
      console.error("Error submitting token ad:", error);
      res.status(500).json({ message: "Failed to submit token ad" });
    }
  });

  app.post('/api/token-ads/track', async (req, res) => {
    try {
      const { adId, interactionType } = req.body;

      if (!adId || !interactionType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const interaction = await storage.trackAdInteraction({
        adId: parseInt(adId),
        interactionType,
        userWallet: null, // Could be populated with user wallet if available
        metadata: {}
      });

      res.json(interaction);
    } catch (error) {
      console.error("Error tracking ad interaction:", error);
      res.status(500).json({ message: "Failed to track interaction" });
    }
  });

  app.get('/api/token-ads/:id/stats', async (req, res) => {
    try {
      const adId = parseInt(req.params.id);
      const stats = await storage.getAdStats(adId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching ad stats:", error);
      res.status(500).json({ message: "Failed to fetch ad stats" });
    }
  });

  // Newsletter and Support API Routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email address required" });
      }

      // Store newsletter subscription (in production, integrate with email service)
      console.log(`Newsletter subscription: ${email}`);
      
      res.json({ 
        message: "Successfully subscribed to newsletter",
        email 
      });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.post('/api/partnerships/submit', async (req, res) => {
    try {
      const {
        companyName,
        contactName,
        email,
        partnershipType,
        description,
        website,
        expectedVolume
      } = req.body;

      if (!companyName || !contactName || !email || !partnershipType || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Store partnership application (in production, integrate with CRM)
      const partnershipId = `PART-${Date.now()}`;
      console.log(`Partnership application received: ${partnershipId}`, {
        companyName,
        contactName,
        email,
        partnershipType,
        description,
        website,
        expectedVolume
      });

      res.json({ 
        message: "Partnership application submitted successfully",
        partnershipId,
        status: "under_review"
      });
    } catch (error) {
      console.error("Error submitting partnership application:", error);
      res.status(500).json({ message: "Failed to submit partnership application" });
    }
  });

  app.post('/api/support/ticket', async (req, res) => {
    try {
      const {
        name,
        email,
        category,
        priority,
        subject,
        description
      } = req.body;

      if (!name || !email || !category || !priority || !subject || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate support ticket (in production, integrate with support system)
      const ticketId = `TICK-${Date.now()}`;
      console.log(`Support ticket created: ${ticketId}`, {
        name,
        email,
        category,
        priority,
        subject,
        description
      });

      res.json({ 
        message: "Support ticket created successfully",
        ticketId,
        status: "open",
        expectedResponse: priority === 'urgent' ? '2 hours' : '24 hours'
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.post('/api/whitepaper/upload-video', async (req, res) => {
    try {
      // In production, handle file upload to cloud storage
      const videoId = `VID-${Date.now()}`;
      console.log(`Video upload request received: ${videoId}`);
      
      res.json({ 
        message: "Video uploaded successfully",
        videoId,
        videoUrl: `/uploads/videos/${videoId}.mp4`
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  app.get('/api/whitepaper/download-pdf', async (req, res) => {
    try {
      // In production, serve actual PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="OOF-Whitepaper-v1.0.pdf"');
      res.send(Buffer.from('PDF content would be here'));
    } catch (error) {
      console.error("Error downloading whitepaper:", error);
      res.status(500).json({ message: "Failed to download whitepaper" });
    }
  });

  // Campaigns API Routes
  app.get('/api/campaigns', async (req, res) => {
    try {
      // Mock campaign data for development
      const mockCampaigns = [
        {
          id: 'camp_001',
          name: 'OOF Token Launch Campaign',
          description: 'Help us spread the word about OOF Token across social media platforms',
          platforms: ['twitter', 'farcaster'],
          budget: 500,
          spentBudget: 125.50,
          rewardPerAction: 2.50,
          targetActions: [
            { platform: 'twitter', type: 'like', targetUrl: 'https://twitter.com/ooftoken/status/123', reward: 0.50 },
            { platform: 'twitter', type: 'repost', targetUrl: 'https://twitter.com/ooftoken/status/123', reward: 1.00 },
            { platform: 'farcaster', type: 'like', targetUrl: 'https://warpcast.com/ooftoken/123', reward: 0.75 },
            { platform: 'farcaster', type: 'recast', targetUrl: 'https://warpcast.com/ooftoken/123', reward: 1.25 }
          ],
          status: 'active',
          participants: 50,
          maxParticipants: 200,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          verificationLevel: 'standard',
          contentUrls: {
            twitter: 'https://twitter.com/ooftoken/status/123',
            farcaster: 'https://warpcast.com/ooftoken/123'
          },
          analytics: {
            totalEngagements: 245,
            uniqueParticipants: 50,
            conversionRate: 25.2,
            averageReward: 2.51,
            platformBreakdown: { twitter: 145, farcaster: 100 }
          }
        },
        {
          id: 'camp_002',
          name: 'Community Growth Initiative',
          description: 'Growing our community across multiple platforms with engaging content',
          platforms: ['twitter', 'arena'],
          budget: 250,
          spentBudget: 75.25,
          rewardPerAction: 1.50,
          targetActions: [
            { platform: 'twitter', type: 'follow', targetUrl: 'https://twitter.com/ooftoken', reward: 2.00 },
            { platform: 'arena', type: 'like', targetUrl: 'https://arena.social/ooftoken/123', reward: 1.00 }
          ],
          status: 'active',
          participants: 30,
          maxParticipants: 150,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          verificationLevel: 'basic',
          contentUrls: {
            twitter: 'https://twitter.com/ooftoken',
            arena: 'https://arena.social/ooftoken/123'
          },
          analytics: {
            totalEngagements: 85,
            uniqueParticipants: 30,
            conversionRate: 20.1,
            averageReward: 1.50,
            platformBreakdown: { twitter: 60, arena: 25 }
          }
        }
      ];

      res.json(mockCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/campaigns', async (req, res) => {
    try {
      const {
        name,
        description,
        platforms,
        budget,
        duration,
        contentUrls,
        targetActions,
        verificationLevel
      } = req.body;

      if (!name || !description || !platforms?.length || !budget || budget < 10) {
        return res.status(400).json({ message: "Missing required fields or budget too low" });
      }

      // Generate campaign ID
      const campaignId = `camp_${Date.now()}`;
      
      // Calculate reward per action
      const totalActions = targetActions?.length || 1;
      const rewardPerAction = (budget * 0.95) / totalActions; // 5% platform fee

      // Calculate end date
      const endsAt = new Date(Date.now() + (duration * 60 * 60 * 1000)); // duration in hours

      const newCampaign = {
        id: campaignId,
        creatorId: req.user?.id || 'anonymous',
        name,
        description,
        platforms,
        budget: parseFloat(budget),
        spentBudget: 0,
        rewardPerAction: parseFloat(rewardPerAction.toFixed(4)),
        targetActions: targetActions || [],
        status: 'active',
        participants: 0,
        maxParticipants: 1000,
        createdAt: new Date().toISOString(),
        endsAt: endsAt.toISOString(),
        verificationLevel: verificationLevel || 'standard',
        contentUrls: contentUrls || {},
        analytics: {
          totalEngagements: 0,
          uniqueParticipants: 0,
          conversionRate: 0,
          averageReward: rewardPerAction,
          platformBreakdown: {}
        }
      };

      console.log(`Campaign created: ${campaignId}`, newCampaign);

      res.json({
        message: "Campaign created successfully",
        campaign: newCampaign
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.get('/api/campaigns/participations', async (req, res) => {
    try {
      // Mock participation data for development
      const mockParticipations = [
        {
          id: 'part_001',
          campaignId: 'camp_001',
          participantWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRueJuD5up',
          actionsCompleted: [
            { platform: 'twitter', type: 'like', proofUrl: 'https://twitter.com/user/status/456', verified: true },
            { platform: 'twitter', type: 'repost', proofUrl: 'https://twitter.com/user/status/456', verified: true }
          ],
          totalReward: 1.50,
          oofPointsEarned: 25,
          status: 'verified',
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          verifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      res.json(mockParticipations);
    } catch (error) {
      console.error("Error fetching participations:", error);
      res.status(500).json({ message: "Failed to fetch participations" });
    }
  });

  app.post('/api/campaigns/:campaignId/participate', async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { actionsCompleted, proofData } = req.body;

      if (!actionsCompleted?.length || !proofData) {
        return res.status(400).json({ message: "Missing required participation data" });
      }

      // Generate participation ID
      const participationId = `part_${Date.now()}`;

      const participation = {
        id: participationId,
        campaignId,
        participantWallet: req.user?.walletAddress || 'anonymous_wallet',
        participantUserId: req.user?.id,
        actionsCompleted,
        totalReward: 0,
        oofPointsEarned: 0,
        status: 'pending',
        proofData,
        submittedAt: new Date().toISOString()
      };

      console.log(`Participation submitted: ${participationId}`, participation);

      res.json({
        message: "Participation submitted successfully",
        participation,
        estimatedVerificationTime: "5-15 minutes"
      });
    } catch (error) {
      console.error("Error submitting participation:", error);
      res.status(500).json({ message: "Failed to submit participation" });
    }
  });

  app.post('/api/campaigns/:campaignId/verify', async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { participationId, verificationResults } = req.body;

      if (!participationId || !verificationResults) {
        return res.status(400).json({ message: "Missing verification data" });
      }

      // Calculate rewards based on verification results
      let totalReward = 0;
      let oofPointsEarned = 0;

      for (const result of verificationResults) {
        if (result.verified) {
          totalReward += parseFloat(result.reward || 0);
          oofPointsEarned += parseInt(result.oofPoints || 10);
        }
      }

      console.log(`Verification completed for ${participationId}:`, {
        totalReward,
        oofPointsEarned,
        verificationResults
      });

      res.json({
        message: "Verification completed",
        participationId,
        totalReward,
        oofPointsEarned,
        status: totalReward > 0 ? 'verified' : 'rejected'
      });
    } catch (error) {
      console.error("Error processing verification:", error);
      res.status(500).json({ message: "Failed to process verification" });
    }
  });

  app.get('/api/campaigns/:campaignId/analytics', async (req, res) => {
    try {
      const { campaignId } = req.params;

      // Mock analytics data
      const analytics = {
        campaignId,
        totalEngagements: 245,
        uniqueParticipants: 50,
        conversionRate: 25.2,
        averageReward: 2.51,
        platformBreakdown: {
          twitter: { engagements: 145, participants: 30 },
          farcaster: { engagements: 100, participants: 25 }
        },
        actionBreakdown: {
          like: { count: 120, totalReward: 60.00 },
          repost: { count: 80, totalReward: 80.00 },
          comment: { count: 45, totalReward: 90.00 }
        },
        timelineData: [
          { date: '2024-01-15', engagements: 25, rewards: 62.50 },
          { date: '2024-01-16', engagements: 45, rewards: 112.50 },
          { date: '2024-01-17', engagements: 60, rewards: 150.00 },
          { date: '2024-01-18', engagements: 55, rewards: 137.50 },
          { date: '2024-01-19', engagements: 60, rewards: 150.00 }
        ]
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      res.status(500).json({ message: "Failed to fetch campaign analytics" });
    }
  });

  // User Stats API Route
  app.get('/api/user/stats', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user stats from storage
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate user ranking
      const leaderboard = await storage.getLeaderboard(1000);
      const userRank = leaderboard.findIndex(u => u.id === req.user.id) + 1;

      const stats = {
        oofTokens: user.oofTokens || 0,
        totalEarned: user.totalEarned || 0,
        predictionAccuracy: user.predictionAccuracy || 0,
        rank: userRank || 999,
        oofScore: user.oofScore || 0,
        campaignsCompleted: 0, // TODO: calculate from campaigns participation
        achievementsUnlocked: 0 // TODO: calculate from user achievements
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // ========================
  // OOF MOMENTS API ROUTES
  // ========================

  // AI-Powered OOF Moments Analysis
  app.post('/api/oof-moments/ai-analyze', async (req, res) => {
    try {
      const { walletAddress, userId } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // Check if AI analysis already exists and is recent (cache for 1 hour)
      const existingAnalysis = await storage.getWalletAnalysis(walletAddress);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (existingAnalysis && existingAnalysis.lastAnalyzed && existingAnalysis.lastAnalyzed > oneHourAgo) {
        const moments = await storage.getOOFMomentsByWallet(walletAddress);
        return res.json({
          analysis: existingAnalysis,
          moments,
          fromCache: true,
          aiGenerated: true
        });
      }

      // Generate AI-powered OOF Moments using Perplexity
      const aiMoments = await aiOOFGenerator.generateOOFMoments(walletAddress);
      
      // Store AI-generated moments in database
      const savedMoments = [];
      for (const card of aiMoments) {
        const momentData = {
          walletAddress,
          userId: userId || null,
          title: card.title,
          description: card.description,
          tokenAddress: card.tokenAddress,
          tokenName: card.tokenName,
          tokenSymbol: card.tokenSymbol,
          cardType: card.type,
          amount: card.amount,
          currentValue: card.currentValue,
          percentage: card.percentage,
          story: card.story,
          isPublic: true,
          aiGenerated: true,
          uniqueHash: card.uniqueHash
        };

        const savedMoment = await storage.createOOFMoment(momentData);
        savedMoments.push(savedMoment);
      }

      res.json({
        success: true,
        moments: savedMoments,
        aiGenerated: true,
        walletAddress,
        totalCards: aiMoments.length
      });

    } catch (error) {
      console.error("AI OOF Moments generation error:", error);
      res.status(500).json({ message: "Failed to generate AI OOF moments" });
    }
  });

  // Cross-chain bridge for purchasing with OOF tokens
  app.post('/api/oof-moments/cross-chain-purchase', async (req, res) => {
    try {
      const { walletAddress, oofAmount, cardDistribution } = req.body;

      if (!walletAddress || !oofAmount || !cardDistribution) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      if (oofAmount < 1 || oofAmount > 100) {
        return res.status(400).json({ message: "OOF amount must be between $1-100" });
      }

      // Validate distribution adds up to 100%
      const totalDistribution = cardDistribution.paperHands + cardDistribution.dustCollector + cardDistribution.gainsMaster;
      if (Math.abs(totalDistribution - 100) > 0.01) {
        return res.status(400).json({ message: "Card distribution must total 100%" });
      }

      // Process cross-chain purchase
      const purchaseResult = await crossChainBridge.processCrossChainPurchase({
        walletAddress,
        oofAmount,
        cardDistribution
      });

      if (purchaseResult.success) {
        res.json({
          success: true,
          transactions: purchaseResult.transactions,
          message: "Cross-chain purchase initiated successfully"
        });
      } else {
        res.status(400).json({
          success: false,
          message: purchaseResult.errorMessage || "Purchase failed"
        });
      }

    } catch (error) {
      console.error("Cross-chain purchase error:", error);
      res.status(500).json({ message: "Failed to process cross-chain purchase" });
    }
  });

  // Get exchange rate for OOF tokens
  app.get('/api/oof-moments/exchange-rate', async (req, res) => {
    try {
      const rate = await crossChainBridge.getExchangeRate();
      res.json({ oofToUsd: rate });
    } catch (error) {
      console.error("Exchange rate error:", error);
      res.status(500).json({ message: "Failed to get exchange rate" });
    }
  });

  // Estimate purchase with OOF tokens
  app.post('/api/oof-moments/estimate-purchase', async (req, res) => {
    try {
      const { oofAmount } = req.body;

      if (!oofAmount || oofAmount <= 0) {
        return res.status(400).json({ message: "Valid OOF amount required" });
      }

      const estimate = await crossChainBridge.estimatePurchase(oofAmount);
      res.json(estimate);

    } catch (error) {
      console.error("Purchase estimation error:", error);
      res.status(500).json({ message: "Failed to estimate purchase" });
    }
  });

  // Legacy analyze route (preserving existing functionality)
  app.post('/api/oof-moments/analyze', async (req, res) => {
    try {
      const { walletAddress, userId } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // Check if analysis already exists and is recent
      const existingAnalysis = await storage.getWalletAnalysis(walletAddress);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (existingAnalysis && existingAnalysis.lastAnalyzed && existingAnalysis.lastAnalyzed > oneHourAgo) {
        const moments = await storage.getOOFMomentsByWallet(walletAddress);
        return res.json({
          analysis: existingAnalysis,
          moments,
          fromCache: true
        });
      }

      // Perform fresh wallet analysis
      const analysis = await solanaWalletAnalysis.analyzeWallet(walletAddress);
      
      // Generate OOF Moment cards
      const momentCards = await oofMomentsGenerator.generateOOFMoments(walletAddress, userId);
      
      // Store analysis in database
      const analysisData = {
        walletAddress,
        totalTransactions: analysis.totalTransactions,
        totalTokensTraded: analysis.totalTokensTraded,
        biggestGain: analysis.biggestGain,
        biggestLoss: analysis.biggestLoss,
        dustTokensCount: analysis.dustTokens.length,
        paperHandsCount: analysis.paperHandsMoments.length,
        profitableTokensCount: analysis.profitableTokens.length,
        lastAnalyzed: new Date(),
        oofScore: analysis.oofScore || 0
      };

      const savedAnalysis = await storage.createWalletAnalysis(analysisData);

      // Store OOF Moment cards
      const savedMoments = [];
      for (const card of momentCards) {
        const momentData = oofMomentsGenerator.convertToDBFormat(card, walletAddress, userId);
        const savedMoment = await storage.createOOFMoment(momentData);
        savedMoments.push(savedMoment);
      }

      res.json({
        analysis: savedAnalysis,
        moments: savedMoments,
        fromCache: false
      });

    } catch (error) {
      console.error("Error analyzing wallet for OOF Moments:", error);
      res.status(500).json({ 
        message: "Failed to analyze wallet",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get public OOF Moments feed
  app.get('/api/oof-moments/public', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const moments = await storage.getPublicOOFMoments(limit, offset);
      res.json(moments);
    } catch (error) {
      console.error("Error fetching public OOF Moments:", error);
      res.status(500).json({ message: "Failed to fetch OOF Moments" });
    }
  });

  // Get specific OOF Moment
  app.get('/api/oof-moments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const moment = await storage.getOOFMoment(id);
      
      if (!moment) {
        return res.status(404).json({ message: "OOF Moment not found" });
      }

      // Get interactions for this moment
      const interactions = await storage.getMomentInteractions(id);
      
      res.json({
        moment,
        interactions
      });
    } catch (error) {
      console.error("Error fetching OOF Moment:", error);
      res.status(500).json({ message: "Failed to fetch OOF Moment" });
    }
  });

  // Social interactions - Like/Unlike
  app.post('/api/oof-moments/:id/like', async (req, res) => {
    try {
      const momentId = parseInt(req.params.id);
      const { userId, action } = req.body; // action: 'like' or 'unlike'

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Check if user already interacted
      const existingInteraction = await storage.getUserMomentInteraction(momentId, userId);
      
      if (action === 'like') {
        if (existingInteraction?.interactionType === 'like') {
          return res.status(400).json({ message: "Already liked" });
        }

        // Create or update like interaction
        if (existingInteraction) {
          await storage.updateMomentInteraction(existingInteraction.id, {
            interactionType: 'like'
          });
        } else {
          await storage.createMomentInteraction({
            momentId,
            userId,
            interactionType: 'like',
            metadata: { timestamp: new Date().toISOString() }
          });
        }
      } else if (action === 'unlike') {
        if (existingInteraction?.interactionType === 'like') {
          await storage.updateMomentInteraction(existingInteraction.id, {
            interactionType: 'view'
          });
        }
      }

      // Get updated moment
      const moment = await storage.getOOFMoment(momentId);
      res.json({ moment });

    } catch (error) {
      console.error("Error processing like interaction:", error);
      res.status(500).json({ message: "Failed to process like" });
    }
  });

  // Share OOF Moment
  app.post('/api/oof-moments/:id/share', async (req, res) => {
    try {
      const momentId = parseInt(req.params.id);
      const { userId, platform } = req.body; // platform: 'twitter', 'telegram', 'discord'

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Record share interaction
      await storage.createMomentInteraction({
        momentId,
        userId,
        interactionType: 'share',
        metadata: { 
          platform,
          timestamp: new Date().toISOString()
        }
      });

      // Generate share content
      const moment = await storage.getOOFMoment(momentId);
      if (!moment) {
        return res.status(404).json({ message: "OOF Moment not found" });
      }

      const shareUrl = `${process.env.APP_URL || 'http://localhost:5000'}/moments/${momentId}`;
      const shareText = `Check out this legendary OOF moment: "${moment.quote}" - ${shareUrl}`;

      res.json({
        shareUrl,
        shareText,
        platform,
        moment
      });

    } catch (error) {
      console.error("Error processing share:", error);
      res.status(500).json({ message: "Failed to process share" });
    }
  });

  // Mint OOF Moment as NFT on Zora
  app.post('/api/oof-moments/:id/mint', async (req, res) => {
    try {
      const momentId = parseInt(req.params.id);
      const { userWalletAddress } = req.body;

      if (!userWalletAddress) {
        return res.status(400).json({ message: "User wallet address required" });
      }

      const moment = await storage.getOOFMoment(momentId);
      if (!moment) {
        return res.status(404).json({ message: "OOF Moment not found" });
      }

      // Mint on Zora
      const mintResult = await zoraIntegration.mintOOFMoment(moment, userWalletAddress);

      if (mintResult.success) {
        // Update moment with NFT information
        await storage.updateOOFMoment(momentId, {
          nftMinted: true,
          nftContractAddress: mintResult.contractAddress,
          nftTokenId: mintResult.tokenId,
          nftTransactionHash: mintResult.transactionHash,
          zoraUrl: mintResult.zoraUrl
        });

        res.json({
          message: "OOF Moment minted successfully",
          mintResult,
          zoraUrl: mintResult.zoraUrl
        });
      } else {
        res.status(500).json({
          message: "Failed to mint OOF Moment",
          error: mintResult.error
        });
      }

    } catch (error) {
      console.error("Error minting OOF Moment:", error);
      res.status(500).json({ message: "Failed to mint OOF Moment" });
    }
  });

  // Get user's OOF Moments
  app.get('/api/oof-moments/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const moments = await storage.getOOFMomentsByUser(userId);
      res.json(moments);
    } catch (error) {
      console.error("Error fetching user OOF Moments:", error);
      res.status(500).json({ message: "Failed to fetch user OOF Moments" });
    }
  });

  // Get wallet's OOF Moments
  app.get('/api/oof-moments/wallet/:walletAddress', async (req, res) => {
    try {
      const walletAddress = req.params.walletAddress;
      const moments = await storage.getOOFMomentsByWallet(walletAddress);
      res.json(moments);
    } catch (error) {
      console.error("Error fetching wallet OOF Moments:", error);
      res.status(500).json({ message: "Failed to fetch wallet OOF Moments" });
    }
  });

  // Generate card image for OOF Moment
  app.get('/api/oof-moments/card-image/:id', async (req, res) => {
    try {
      const momentId = parseInt(req.params.id);
      const moment = await storage.getOOFMoment(momentId);
      
      if (!moment) {
        return res.status(404).json({ message: "OOF Moment not found" });
      }

      // In production, generate actual card image
      // For now, return a placeholder SVG
      const cardSvg = `
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${moment.cardMetadata?.gradientFrom || '#FFD700'};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${moment.cardMetadata?.gradientTo || '#FFA500'};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="400" height="600" fill="url(#grad1)" rx="20"/>
          <text x="200" y="100" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${moment.title}</text>
          <text x="200" y="300" text-anchor="middle" fill="white" font-size="48">${moment.cardMetadata?.emoji || '🏆'}</text>
          <text x="200" y="400" text-anchor="middle" fill="white" font-size="14" text-wrap="wrap">"${moment.quote}"</text>
          <text x="200" y="550" text-anchor="middle" fill="white" font-size="12">OOF Moments</text>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(cardSvg);

    } catch (error) {
      console.error("Error generating card image:", error);
      res.status(500).json({ message: "Failed to generate card image" });
    }
  });

  // Update OOF Moment privacy settings
  app.patch('/api/oof-moments/:id/privacy', async (req, res) => {
    try {
      const momentId = parseInt(req.params.id);
      const { isPublic, userId } = req.body;

      const moment = await storage.getOOFMoment(momentId);
      if (!moment) {
        return res.status(404).json({ message: "OOF Moment not found" });
      }

      // Check if user owns this moment
      if (moment.userId && moment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this moment" });
      }

      const updatedMoment = await storage.updateOOFMoment(momentId, { isPublic });
      res.json(updatedMoment);

    } catch (error) {
      console.error("Error updating OOF Moment privacy:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
