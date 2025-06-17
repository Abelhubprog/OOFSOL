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

  const httpServer = createServer(app);
  return httpServer;
}
