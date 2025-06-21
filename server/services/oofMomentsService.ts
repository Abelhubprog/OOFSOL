import { aiOrchestrator } from '../ai/orchestrator';
import { walletAnalysisService } from './walletAnalysisService';
import { DatabaseUtils } from '../db/utils';
import { db } from '../db';
import { OOFMomentData } from '../ai/types';
import { oofMoments, users } from '@shared/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

export interface OOFMomentRequest {
  walletAddress?: string;
  userId: string;
  momentType?: 'PAPER_HANDS' | 'DIAMOND_HANDS' | 'RUGPULL_SURVIVOR' | 'WHALE_WATCHER' | 'DUST_COLLECTOR';
  customPrompt?: string;
  isPublic?: boolean;
}

export interface OOFMomentResponse {
  id: string;
  moment: OOFMomentData;
  analysisData: any;
  generationTime: number;
  cost: number;
  shareUrl: string;
}

export class OOFMomentsService {
  private readonly MAX_GENERATIONS_PER_HOUR = 5;
  private readonly MAX_GENERATIONS_PER_DAY = 20;

  // Main OOF moment generation endpoint
  async generateOOFMoment(request: OOFMomentRequest): Promise<OOFMomentResponse> {
    const startTime = Date.now();

    try {
      console.log(`🎯 Starting OOF moment generation for user ${request.userId}`);

      // Validate rate limits
      await this.validateRateLimit(request.userId);

      // Get or validate wallet address
      const walletAddress = await this.resolveWalletAddress(request);

      // Generate the OOF moment using AI orchestrator
      const oofMoment = await aiOrchestrator.generateOOFMoment(walletAddress, {
        momentType: request.momentType,
        customPrompt: request.customPrompt,
        userId: request.userId
      });

      // Get the analysis data for storage
      const analysisData = await walletAnalysisService.analyzeWallet(walletAddress);

      // Save to database
      const savedMoment = await this.saveOOFMoment({
        ...request,
        walletAddress,
        moment: oofMoment,
        analysisData
      });

      // Update user statistics
      await this.updateUserStats(request.userId);

      const generationTime = Date.now() - startTime;
      console.log(`✅ OOF moment generated successfully in ${generationTime}ms`);

      return {
        id: savedMoment.id,
        moment: oofMoment,
        analysisData,
        generationTime,
        cost: 0.05, // Estimated cost
        shareUrl: this.generateShareUrl(savedMoment.id)
      };

    } catch (error) {
      console.error(`❌ OOF moment generation failed:`, error);
      throw new Error(`Failed to generate OOF moment: ${error.message}`);
    }
  }

  // Validate rate limiting
  private async validateRateLimit(userId: string): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check hourly limit
    const hourlyCount = await db.query.oofMoments.findMany({
      where: and(
        eq(oofMoments.userId, userId),
        sql`${oofMoments.createdAt} >= ${oneHourAgo}`
      )
    });

    if (hourlyCount.length >= this.MAX_GENERATIONS_PER_HOUR) {
      throw new Error('Hourly generation limit exceeded. Please wait before creating more OOF moments.');
    }

    // Check daily limit
    const dailyCount = await db.query.oofMoments.findMany({
      where: and(
        eq(oofMoments.userId, userId),
        sql`${oofMoments.createdAt} >= ${oneDayAgo}`
      )
    });

    if (dailyCount.length >= this.MAX_GENERATIONS_PER_DAY) {
      throw new Error('Daily generation limit exceeded. Please wait 24 hours before creating more OOF moments.');
    }
  }

  // Resolve wallet address from request or user profile
  private async resolveWalletAddress(request: OOFMomentRequest): Promise<string> {
    if (request.walletAddress) {
      return request.walletAddress;
    }

    // Get user's primary wallet address
    const user = await db.query.users.findFirst({
      where: eq(users.id, request.userId)
    });

    if (!user?.walletAddress) {
      throw new Error('No wallet address provided and user has no primary wallet');
    }

    return user.walletAddress;
  }

  // Save OOF moment to database
  private async saveOOFMoment(data: {
    userId: string;
    walletAddress: string;
    moment: OOFMomentData;
    analysisData: any;
    momentType?: string;
    customPrompt?: string;
    isPublic?: boolean;
  }): Promise<any> {
    try {
      const moment = await DatabaseUtils.createOOFMoment({
        userId: data.userId,
        walletAddress: data.walletAddress,
        momentType: data.momentType || 'GENERAL',
        title: data.moment.title,
        description: data.moment.description,
        narrative: data.moment.narrative,
        imageUrl: data.moment.imageUrl,
        rarity: data.moment.rarity,
        isPublic: data.isPublic ?? true,
        socialText: data.moment.socialText,
        hashtags: data.moment.hashtags,
        metrics: data.moment.metrics,
        analysisData: data.analysisData,
        customPrompt: data.customPrompt,
        likes: 0,
        shares: 0,
        comments: 0
      });

      return moment;
    } catch (error) {
      console.error('Error saving OOF moment:', error);
      throw error;
    }
  }

  // Update user statistics
  private async updateUserStats(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          totalMoments: sql`${users.totalMoments} + 1`,
          oofScore: sql`${users.oofScore} + 10`, // Award points for creating moments
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Generate shareable URL
  private generateShareUrl(momentId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${baseUrl}/moments/${momentId}`;
  }

  // Get user's OOF moments
  async getUserMoments(
    userId: string, 
    options: {
      limit?: number;
      offset?: number;
      // includePrivate is true by default when fetching for a specific user
    } = {}
  ): Promise<OOFMomentData[]> { // Return type updated
    const { limit = 20, offset = 0 } = options;

    try {
      // When fetching for a specific user, we assume they can see their own private moments.
      // The DatabaseUtils method should handle this logic or be specific.
      // For now, this service method implies fetching all moments for the user.
      const momentsFromDb = await DatabaseUtils.getUserMoments(userId, limit, offset, true); // Assuming true for includePrivate

      // Transform to OOFMomentData if necessary, or ensure DatabaseUtils.getUserMoments returns compatible type
      return momentsFromDb.map(moment => ({
        id: moment.id.toString(), // Ensure ID is string
        type: moment.momentType,
        title: moment.title,
        description: moment.description || "",
        narrative: (moment.analysisData as any)?.narrative || moment.description || "", // Example, adjust based on actual structure
        rarity: moment.rarity as OOFMomentData['rarity'],
        metrics: (moment.analysisData as any)?.metrics || { missedGains: 0, timeframe: 'N/A', regretLevel: 0 },
        socialText: (moment.analysisData as any)?.socialText || "",
        hashtags: (moment.analysisData as any)?.hashtags || [],
        imageUrl: moment.imageUrl || undefined,
        // Add other necessary fields from OOFMomentData
      }));
    } catch (error) {
      console.error('Error fetching user moments:', error);
      throw error;
    }
  }

  // Get public OOF moments feed
  async getPublicMoments(options: {
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'popular' | 'trending';
  } = {}): Promise<OOFMomentData[]> { // Return type updated
    const { limit = 20, offset = 0, sortBy = 'newest' } = options;

    try {
      // This method should ideally call a DatabaseUtils method
      // e.g., return await DatabaseUtils.getPublicOOFMoments(limit, offset, sortBy);
      // For now, keeping the direct DB query here as it was.
      let orderByClauses: any[] = [desc(oofMoments.createdAt)]; // Default

      switch (sortBy) {
        case 'popular':
          // Example: popularity = likes + (shares * 2) + (comments * 1.5)
          // This requires a raw SQL or more complex Drizzle query if not directly supported
          // For simplicity, using likes and shares as an approximation.
          orderByClauses = [desc(sql`(${oofMoments.likes} + ${oofMoments.shares} * 2)`), desc(oofMoments.createdAt)];
          break;
        case 'trending':
          // Trending could be recent high engagement. E.g., popular in last 7 days.
          // This might involve filtering by createdAt and then ordering by popularity.
          // For now, let's use a simple proxy for trending (e.g. recent and highly liked)
           const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
           orderByClauses = [desc(oofMoments.likes), desc(oofMoments.createdAt)]; // Simplified
          // More complex: Filter for `createdAt > sevenDaysAgo` then order by popularity.
          break;
        default: // newest
          orderByClauses = [desc(oofMoments.createdAt)];
      }

      const momentsFromDb = await db.query.oofMoments.findMany({
        where: eq(oofMoments.isPublic, true),
        orderBy: orderByClauses,
        limit,
        offset,
        with: {
          user: { // Assuming you want some user info for public moments
            columns: {
              username: true,
              profileImageUrl: true, // Changed from avatarUrl to match schema
              // id: true, // if needed for linking
            }
          }
        }
      });

      return momentsFromDb.map(moment => ({
        id: moment.id.toString(),
        type: moment.momentType,
        title: moment.title,
        description: moment.description || "",
        narrative: (moment.analysisData as any)?.narrative || moment.description || "",
        rarity: moment.rarity as OOFMomentData['rarity'],
        metrics: (moment.analysisData as any)?.metrics || { missedGains: 0, timeframe: 'N/A', regretLevel: 0 },
        socialText: (moment.analysisData as any)?.socialText || "",
        hashtags: (moment.analysisData as any)?.hashtags || [],
        imageUrl: moment.imageUrl || undefined,
        // Include user data if fetched
        user: moment.user ? { username: moment.user.username, profileImageUrl: moment.user.profileImageUrl } : undefined,
      }));
    } catch (error) {
      console.error('Error fetching public moments:', error);
      throw error;
    }
  }

  // Interact with OOF moment (like, share, comment)
  async interactWithMoment(
    momentId: string, 
    userId: string, 
    action: 'LIKE' | 'UNLIKE' | 'SHARE' | 'COMMENT',
    data?: { comment?: string }
  ): Promise<any> {
    try {
      const moment = await db.query.oofMoments.findFirst({
        where: eq(oofMoments.id, momentId)
      });

      if (!moment) {
        throw new Error('OOF moment not found');
      }

      switch (action) {
        case 'LIKE':
          await db
            .update(oofMoments)
            .set({ 
              likes: sql`${oofMoments.likes} + 1`,
              updatedAt: new Date()
            })
            .where(eq(oofMoments.id, momentId));
          
          // Award points to moment creator
          await this.awardCreatorPoints(moment.userId, 'like');
          break;

        case 'UNLIKE':
          await db
            .update(oofMoments)
            .set({ 
              likes: sql`GREATEST(${oofMoments.likes} - 1, 0)`,
              updatedAt: new Date()
            })
            .where(eq(oofMoments.id, momentId));
          break;

        case 'SHARE':
          await db
            .update(oofMoments)
            .set({ 
              shares: sql`${oofMoments.shares} + 1`,
              updatedAt: new Date()
            })
            .where(eq(oofMoments.id, momentId));
          
          // Award points to moment creator and sharer
          await this.awardCreatorPoints(moment.userId, 'share');
          await this.awardUserPoints(userId, 'share');
          break;

        case 'COMMENT':
          if (!data?.comment) {
            throw new Error('Comment text is required');
          }
          
          await db
            .update(oofMoments)
            .set({ 
              comments: sql`${oofMoments.comments} + 1`,
              updatedAt: new Date()
            })
            .where(eq(oofMoments.id, momentId));
          
          // Store comment (would need a comments table)
          // await this.createComment(momentId, userId, data.comment);
          
          await this.awardCreatorPoints(moment.userId, 'comment');
          break;
      }

      return { success: true, action };
    } catch (error) {
      console.error('Error interacting with moment:', error);
      throw error;
    }
  }

  // Award points to users
  private async awardCreatorPoints(userId: string, actionType: string): Promise<void> {
    const pointsMap = {
      like: 1,
      share: 3,
      comment: 2
    };

    const points = pointsMap[actionType] || 0;
    if (points > 0) {
      await db
        .update(users)
        .set({
          oofScore: sql`${users.oofScore} + ${points}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
  }

  private async awardUserPoints(userId: string, actionType: string): Promise<void> {
    const pointsMap = {
      share: 1,
      comment: 1
    };

    const points = pointsMap[actionType] || 0;
    if (points > 0) {
      await DatabaseUtils.db
        .update(users)
        .set({
          oofScore: sql`${users.oofScore} + ${points}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
  }

  // Get moment by ID
  async getMomentById(momentId: string): Promise<any> {
    try {
      const moment = await db.query.oofMoments.findFirst({
        where: eq(oofMoments.id, momentId),
        with: {
          user: {
            columns: {
              username: true,
              avatarUrl: true,
              isVerified: true,
              oofScore: true
            }
          }
        }
      });

      if (!moment) {
        throw new Error('OOF moment not found');
      }

      return moment;
    } catch (error) {
      console.error('Error fetching moment:', error);
      throw error;
    }
  }

  // Search OOF moments
  async searchMoments(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      userId?: string;
    } = {}
  ): Promise<any[]> {
    const { limit = 20, offset = 0, userId } = options;

    try {
      // Simple text search - in production, use full-text search
      const searchResults = await db.query.oofMoments.findMany({
        where: and(
          eq(oofMoments.isPublic, true),
          or(
            sql`${oofMoments.title} ILIKE ${`%${query}%`}`,
            sql`${oofMoments.description} ILIKE ${`%${query}%`}`,
            sql`${oofMoments.hashtags} ILIKE ${`%${query}%`}`
          ),
          userId ? eq(oofMoments.userId, userId) : undefined
        ),
        orderBy: desc(oofMoments.createdAt),
        limit,
        offset,
        with: {
          user: {
            columns: {
              username: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        }
      });

      return searchResults;
    } catch (error) {
      console.error('Error searching moments:', error);
      throw error;
    }
  }

  // Get trending hashtags
  async getTrendingHashtags(limit: number = 10): Promise<{ hashtag: string; count: number }[]> {
    try {
      // This would be more sophisticated in production with proper hashtag extraction
      const recentMoments = await db.query.oofMoments.findMany({
        where: and(
          eq(oofMoments.isPublic, true),
          sql`${oofMoments.createdAt} >= NOW() - INTERVAL '7 days'`
        ),
        columns: {
          hashtags: true
        }
      });

      const hashtagCounts = new Map<string, number>();
      
      recentMoments.forEach(moment => {
        if (moment.hashtags) {
          moment.hashtags.forEach(tag => {
            hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
          });
        }
      });

      return Array.from(hashtagCounts.entries())
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      return [];
    }
  }
}

export const oofMomentsService = new OOFMomentsService();