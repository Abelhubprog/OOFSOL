import { db } from '../db';
import { eq, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { users, oofMoments, campaigns, tokenAds, walletAnalysis, type User } from '@shared/schema'; // Added User type

export class DatabaseUtils {
  
  // 👤 User Operations
  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    if (!walletAddress) return null;
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.walletAddress, walletAddress)
      });
      return user || null;
    } catch (error) {
      console.error('Database error fetching user by wallet:', error);
      return null;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      return user || null;
    } catch (error) {
      console.error('Database error fetching user by ID:', error);
      return null;
    }
  }

  static async createOrUpdateUser(walletAddress: string, userData?: Partial<typeof users.$inferInsert>): Promise<User | null> {
    try {
      const existingUser = await this.getUserByWallet(walletAddress);

      if (existingUser) {
        // Update existing user only if there's new data to update
        if (userData && Object.keys(userData).length > 0) {
          const [updatedUser] = await db
            .update(users)
            .set({ ...userData, updatedAt: new Date() })
            .where(eq(users.id, existingUser.id)) // Update by ID for consistency
            .returning();
          return updatedUser;
        }
        return existingUser;
      } else {
        // Create new user
        const newUserId = userData?.id || crypto.randomUUID(); // Use provided ID or generate one
        const [newUser] = await db
          .insert(users)
          .values({
            id: newUserId,
            walletAddress,
            username: userData?.username || `user_${walletAddress.slice(-6)}`, // Use provided username or generate
            email: userData?.email,
            profileImageUrl: userData?.profileImageUrl,
            oofScore: userData?.oofScore || 0,
            totalMoments: userData?.totalMoments || 0,
            // isVerified: userData?.isVerified || false, // Schema doesn't have isVerified
            createdAt: new Date(),
            updatedAt: new Date(),
            ...userData // Spread other valid fields from UserData
          })
          .returning();
        return newUser;
      }
    } catch (error) {
      console.error('Database error creating/updating user:', error);
      throw error; // Re-throw to be handled by service layer
    }
  }

  // 🎯 OOF Moments Operations
  static async createOOFMoment(momentData: typeof oofMoments.$inferInsert): Promise<typeof oofMoments.$inferSelect | null> {
    try {
      const [newMoment] = await db
        .insert(oofMoments)
        .values({
          id: crypto.randomUUID(),
          ...momentData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Update user's total moments count
      await db
        .update(users)
        .set({ 
          totalMoments: sql`${users.totalMoments} + 1`,
          updatedAt: new Date()
        })
        .where(eq(users.id, momentData.userId));

      return newMoment;
    } catch (error) {
      console.error('Database error creating OOF moment:', error);
      throw error;
    }
  }

  static async getUserMoments(userId: string, limit = 20, offset = 0, includePrivate = true) {
    try {
      const queryOptions = {
        where: includePrivate
          ? eq(oofMoments.userId, userId)
          : and(eq(oofMoments.userId, userId), eq(oofMoments.isPublic, true)),
        orderBy: desc(oofMoments.createdAt),
        limit,
        offset,
        with: {
          user: { // User who created the moment
            columns: {
              id: true,
              username: true,
              profileImageUrl: true,
            }
          }
        }
      };
      return await db.query.oofMoments.findMany(queryOptions);
    } catch (error) {
      console.error('Database error fetching user moments:', error);
      throw error;
    }
  }

  static async getPublicOOFMoments(limit = 20, offset = 0, sortBy: 'newest' | 'popular' | 'trending' = 'newest') {
    try {
      let orderByClauses: any[] = [desc(oofMoments.createdAt)]; // Default

      // Define how popularity or trending is calculated, e.g., likes, shares, recent activity
      // This is a simplified example. Real trending might need a dedicated score or time-decay function.
      if (sortBy === 'popular') {
        orderByClauses = [desc(sql`(${oofMoments.likes} + ${oofMoments.shares} * 2 + ${oofMoments.comments})`), desc(oofMoments.createdAt)];
      } else if (sortBy === 'trending') {
        // Example: Moments created in the last 7 days, ordered by popularity
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return await db.query.oofMoments.findMany({
          where: and(
            eq(oofMoments.isPublic, true),
            sql`${oofMoments.createdAt} >= ${sevenDaysAgo}`
          ),
          orderBy: [desc(sql`(${oofMoments.likes} + ${oofMoments.shares} * 2 + ${oofMoments.comments})`), desc(oofMoments.createdAt)],
          limit,
          offset,
          with: {
            user: { columns: { id: true, username: true, profileImageUrl: true } }
          }
        });
      }

      return await db.query.oofMoments.findMany({
        where: eq(oofMoments.isPublic, true),
        orderBy: orderByClauses,
        limit,
        offset,
        with: {
          user: { // User who created the moment
            columns: {
              id: true,
              username: true,
              profileImageUrl: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('Database error fetching public OOF moments:', error);
      throw error;
    }
  }

  static async getOOFMomentById(momentId: string | number): Promise<(typeof oofMoments.$inferSelect & { user?: Partial<User> }) | null> {
    try {
      // Ensure momentId is treated as number if your DB schema for id is serial (integer)
      const numMomentId = typeof momentId === 'string' ? parseInt(momentId, 10) : momentId;
      if (isNaN(numMomentId)) {
        console.error('Invalid momentId format:', momentId);
        return null;
      }
      const moment = await db.query.oofMoments.findFirst({
        where: eq(oofMoments.id, numMomentId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              profileImageUrl: true,
            }
          }
        }
      });
      return moment || null;
    } catch (error) {
      console.error('Database error fetching OOF moment by ID:', error);
      throw error;
    }
  }


  // 🏆 Leaderboard Operations
  static async getTopUsers(limit = 50) {
    try {
      return await db.query.users.findMany({
        orderBy: [desc(users.oofScore), desc(users.totalMoments)],
        limit,
        columns: {
          id: true,
          username: true,
          avatarUrl: true,
          oofScore: true,
          totalMoments: true,
          isVerified: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Database error fetching leaderboard:', error);
      throw error;
    }
  }

  // 📊 Analytics Operations
  static async getUserStats(userId: string) {
    try {
      const userMomentsCount = await db
        .select({ count: count() })
        .from(oofMoments)
        .where(eq(oofMoments.userId, userId));

      const totalLikes = await db
        .select({ total: sql<number>`sum(${oofMoments.likes})` })
        .from(oofMoments)
        .where(eq(oofMoments.userId, userId));

      const totalShares = await db
        .select({ total: sql<number>`sum(${oofMoments.shares})` })
        .from(oofMoments)
        .where(eq(oofMoments.userId, userId));

      return {
        momentsCount: userMomentsCount[0]?.count || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalShares: totalShares[0]?.total || 0
      };
    } catch (error) {
      console.error('Database error fetching user stats:', error);
      throw error;
    }
  }

  // 💰 Token Advertising Operations
  static async getActiveTokenAds(startTime?: Date, endTime?: Date) {
    try {
      const now = new Date();
      const start = startTime || now;
      const end = endTime || new Date(now.getTime() + 30 * 60 * 1000); // Default to next 30 mins if no endTime

      return await db.query.tokenAds.findMany({
        where: and(
          eq(tokenAds.isActive, true),
          sql`${tokenAds.startTime} < ${end}`, // Ad starts before the period ends
          sql`${tokenAds.endTime} > ${start}`   // Ad ends after the period starts
        ),
        orderBy: asc(tokenAds.slotPosition), // Or asc(tokenAds.startTime)
        // limit: 6 // Limiting might be better done by the service after fetching all relevant ads for a time window
      });
    } catch (error) {
      console.error('Database error fetching active token ads:', error);
      throw error;
    }
  }

  static async createTokenAd(adData: Partial<typeof tokenAds.$inferInsert>): Promise<typeof tokenAds.$inferSelect> {
    try {
      const [newAd] = await db
        .insert(tokenAds)
        .values({
          // Provide all required fields, using defaults or data from adData
          tokenAddress: adData.tokenAddress!,
          tokenName: adData.tokenName!,
          tokenSymbol: adData.tokenSymbol!,
          advertiserWallet: adData.advertiserWallet!,
          buyLink: adData.buyLink!,
          paymentTxId: adData.paymentTxId || 'PENDING_PAYMENT',
          paymentAmount: adData.paymentAmount || '0', // Ensure string or use decimal
          paymentTokenSymbol: adData.paymentTokenSymbol || 'USDC',
          slotNumber: adData.slotNumber!,
          cycleNumber: adData.cycleNumber!,
          startTime: adData.startTime!,
          endTime: adData.endTime!,
          isActive: adData.isActive || false,
          verified: adData.verified || false,
          description: adData.description,
          mediaUrl: adData.mediaUrl,
          mediaType: adData.mediaType,
          telegram: adData.telegram,
          twitter: adData.twitter,
          website: adData.website,
          views: 0,
          clicks: 0,
          impressions: 0,
          slotPosition: adData.slotPosition,
          createdAt: new Date(),
          ...adData // Spread to override defaults if provided
        })
        .returning();
      return newAd;
    } catch (error) {
      console.error('Database error creating token ad:', error);
      throw error;
    }
  }

  static async getTokenAdById(adId: string | number): Promise<typeof tokenAds.$inferSelect | null> {
    const numAdId = typeof adId === 'string' ? parseInt(adId, 10) : adId;
    if (isNaN(numAdId)) return null;
    try {
      const ad = await db.query.tokenAds.findFirst({ where: eq(tokenAds.id, numAdId) });
      return ad || null;
    } catch (error) {
      console.error('Database error fetching token ad by ID:', error);
      return null;
    }
  }

  static async updateTokenAdStatus(adId: string | number, status: 'active' | 'inactive' | 'pending_payment' | 'expired'): Promise<boolean> {
    const numAdId = typeof adId === 'string' ? parseInt(adId, 10) : adId;
    if (isNaN(numAdId)) return false;
    try {
      await db.update(tokenAds).set({ isActive: status === 'active', /* you might need a status field */ updatedAt: new Date() }).where(eq(tokenAds.id, numAdId));
      return true;
    } catch (error) {
      console.error('Database error updating token ad status:', error);
      return false;
    }
  }

  static async incrementAdImpressions(adId: string | number): Promise<void> {
    const numAdId = typeof adId === 'string' ? parseInt(adId, 10) : adId;
    if (isNaN(numAdId)) return;
    try {
      await db.update(tokenAds).set({ impressions: sql`${tokenAds.impressions} + 1` }).where(eq(tokenAds.id, numAdId));
    } catch (error) {
      console.error('Database error incrementing ad impressions:', error);
    }
  }

  static async incrementAdClicks(adId: string | number): Promise<void> {
    const numAdId = typeof adId === 'string' ? parseInt(adId, 10) : adId;
    if (isNaN(numAdId)) return;
    try {
      await db.update(tokenAds).set({ clicks: sql`${tokenAds.clicks} + 1` }).where(eq(tokenAds.id, numAdId));
    } catch (error) {
      console.error('Database error incrementing ad clicks:', error);
    }
  }

  static async trackAdClick(adId: string | number, userWallet: string): Promise<void> {
    // This would typically insert into an adInteractions table
    // For now, we can log it or extend functionality later
    console.log(`Ad click tracked: Ad ID ${adId}, User Wallet: ${userWallet}`);
  }

  static async deactivateExpiredAds(currentTime: Date): Promise<void> {
    try {
      await db.update(tokenAds)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(tokenAds.isActive, true), sql`${tokenAds.endTime} <= ${currentTime}`));
    } catch (error) {
      console.error('Database error deactivating expired ads:', error);
    }
  }

  static async activateUpcomingAds(currentTime: Date): Promise<void> {
    try {
      await db.update(tokenAds)
        .set({ isActive: true, updatedAt: new Date() })
        .where(and(eq(tokenAds.isActive, false), sql`${tokenAds.verified} = true`, sql`${tokenAds.startTime} <= ${currentTime}`, sql`${tokenAds.endTime} > ${currentTime}`));
    } catch (error) {
      console.error('Database error activating upcoming ads:', error);
    }
  }

  static async getTokenAdsByDateRange(startDate: Date, endDate: Date): Promise<(typeof tokenAds.$inferSelect)[]> {
    try {
      return await db.query.tokenAds.findMany({
        where: and(
          sql`${tokenAds.startTime} >= ${startDate}`,
          sql`${tokenAds.endTime} <= ${endDate}`,
          eq(tokenAds.verified, true) // Only consider verified/paid ads for revenue
        ),
      });
    } catch (error) {
      console.error('Database error fetching token ads by date range:', error);
      return [];
    }
  }


  // 🔍 Wallet Analysis Operations
  static async cacheWalletAnalysis(walletAddress: string, analysisData: any) {
    try {
      const [cachedAnalysis] = await db
        .insert(walletAnalysis)
        .values({
          id: crypto.randomUUID(),
          walletAddress,
          analysisData,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        })
        .onConflictDoUpdate({
          target: walletAnalysis.walletAddress,
          set: {
            analysisData,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        })
        .returning();

      return cachedAnalysis;
    } catch (error) {
      console.error('Database error caching wallet analysis:', error);
      throw error;
    }
  }

  static async getCachedWalletAnalysis(walletAddress: string) {
    try {
      const cached = await db.query.walletAnalysis.findFirst({
        where: and(
          eq(walletAnalysis.walletAddress, walletAddress),
          sql`${walletAnalysis.expiresAt} > NOW()`
        )
      });

      return cached?.analysisData || null;
    } catch (error) {
      console.error('Database error fetching cached analysis:', error);
      return null;
    }
  }

  // 🧹 Cleanup Operations
  static async cleanupExpiredData() {
    try {
      const now = new Date();
      
      // Remove expired wallet analysis
      await db
        .delete(walletAnalysis)
        .where(sql`${walletAnalysis.expiresAt} <= ${now}`);

      // Remove expired token ads
      await db
        .update(tokenAds)
        .set({ isActive: false })
        .where(sql`${tokenAds.endTime} <= ${now}`);

      console.log('✅ Expired data cleanup completed');
    } catch (error) {
      console.error('Database cleanup error:', error);
      throw error;
    }
  }
}