import { db } from '../db';
import { eq, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { users, oofMoments, campaigns, tokenAds, walletAnalysis } from '@shared/schema';

export class DatabaseUtils {
  
  // 👤 User Operations
  static async createOrUpdateUser(walletAddress: string, userData?: Partial<typeof users.$inferInsert>) {
    try {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.walletAddress, walletAddress)
      });

      if (existingUser) {
        // Update existing user
        if (userData) {
          const [updatedUser] = await db
            .update(users)
            .set({ ...userData, updatedAt: new Date() })
            .where(eq(users.walletAddress, walletAddress))
            .returning();
          return updatedUser;
        }
        return existingUser;
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            walletAddress,
            username: `user_${walletAddress.slice(-8)}`,
            oofScore: 0,
            totalMoments: 0,
            isVerified: false,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        return newUser;
      }
    } catch (error) {
      console.error('Database error creating/updating user:', error);
      throw error;
    }
  }

  // 🎯 OOF Moments Operations
  static async createOOFMoment(momentData: typeof oofMoments.$inferInsert) {
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

  static async getUserMoments(userId: string, limit = 20, offset = 0) {
    try {
      return await db.query.oofMoments.findMany({
        where: eq(oofMoments.userId, userId),
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
    } catch (error) {
      console.error('Database error fetching user moments:', error);
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
  static async getActiveTokenAds() {
    try {
      const now = new Date();
      return await db.query.tokenAds.findMany({
        where: and(
          eq(tokenAds.isActive, true),
          sql`${tokenAds.startTime} <= ${now}`,
          sql`${tokenAds.endTime} > ${now}`
        ),
        orderBy: asc(tokenAds.slotPosition),
        limit: 6
      });
    } catch (error) {
      console.error('Database error fetching active token ads:', error);
      throw error;
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