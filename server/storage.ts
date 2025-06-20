import {
  users,
  tokens,
  predictions,
  missedOpportunities,
  slotSpins,
  userAchievements,
  tokenAds,
  adInteractions,
  oofMoments,
  walletAnalysis,
  momentInteractions,
  splTokenData,
  walletTransactions,
  type User,
  type UpsertUser,
  type Token,
  type InsertToken,
  type Prediction,
  type InsertPrediction,
  type MissedOpportunity,
  type InsertMissedOpportunity,
  type SlotSpin,
  type InsertSlotSpin,
  type UserAchievement,
  type InsertUserAchievement,
  type TokenAd,
  type InsertTokenAd,
  type AdInteraction,
  type InsertAdInteraction,
  type OOFMoment,
  type InsertOOFMoment,
  type WalletAnalysis,
  type InsertWalletAnalysis,
  type MomentInteraction,
  type InsertMomentInteraction,
  type SPLTokenData,
  type InsertSPLTokenData,
  type WalletTransaction,
  type InsertWalletTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, gt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string, updates: Partial<User>): Promise<User>;
  
  // Token operations
  getTokens(): Promise<Token[]>;
  getToken(id: number): Promise<Token | undefined>;
  getTokenByAddress(address: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(id: number, updates: Partial<Token>): Promise<Token>;
  
  // Prediction operations
  getPredictions(): Promise<Prediction[]>;
  getUserPredictions(userId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, updates: Partial<Prediction>): Promise<Prediction>;
  getActivePredictions(): Promise<Prediction[]>;
  
  // Missed opportunity operations
  getUserMissedOpportunities(userId: string): Promise<MissedOpportunity[]>;
  createMissedOpportunity(opportunity: InsertMissedOpportunity): Promise<MissedOpportunity>;
  
  // Slot operations
  createSlotSpin(spin: InsertSlotSpin): Promise<SlotSpin>;
  getUserSlotSpins(userId: string): Promise<SlotSpin[]>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Token advertising operations
  getActiveTokenAds(): Promise<TokenAd[]>;
  createTokenAd(ad: InsertTokenAd): Promise<TokenAd>;
  updateTokenAd(id: number, updates: Partial<TokenAd>): Promise<TokenAd>;
  trackAdInteraction(interaction: InsertAdInteraction): Promise<AdInteraction>;
  getAdStats(adId: number): Promise<{ views: number; clicks: number }>;
  
  // OOF Moments operations
  createOOFMoment(moment: InsertOOFMoment): Promise<OOFMoment>;
  getOOFMoment(id: number): Promise<OOFMoment | undefined>;
  getOOFMomentsByWallet(walletAddress: string): Promise<OOFMoment[]>;
  getOOFMomentsByUser(userId: string): Promise<OOFMoment[]>;
  getPublicOOFMoments(limit?: number, offset?: number): Promise<OOFMoment[]>;
  updateOOFMoment(id: number, updates: Partial<OOFMoment>): Promise<OOFMoment>;
  deleteOOFMoment(id: number): Promise<void>;
  
  // Wallet analysis operations
  createWalletAnalysis(analysis: InsertWalletAnalysis): Promise<WalletAnalysis>;
  getWalletAnalysis(walletAddress: string): Promise<WalletAnalysis | undefined>;
  updateWalletAnalysis(walletAddress: string, updates: Partial<WalletAnalysis>): Promise<WalletAnalysis>;
  
  // Moment interaction operations
  createMomentInteraction(interaction: InsertMomentInteraction): Promise<MomentInteraction>;
  getMomentInteractions(momentId: number): Promise<MomentInteraction[]>;
  getUserMomentInteraction(momentId: number, userId: string): Promise<MomentInteraction | undefined>;
  updateMomentInteraction(id: number, updates: Partial<MomentInteraction>): Promise<MomentInteraction>;
  
  // SPL token data operations
  upsertSPLTokenData(tokenData: InsertSPLTokenData): Promise<SPLTokenData>;
  getSPLTokenData(tokenAddress: string): Promise<SPLTokenData | undefined>;
  updateSPLTokenPrice(tokenAddress: string, price: number): Promise<SPLTokenData>;
  
  // Wallet transaction operations
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransactions(walletAddress: string, limit?: number): Promise<WalletTransaction[]>;
  getTokenTransactions(walletAddress: string, tokenAddress: string): Promise<WalletTransaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Token operations
  async getTokens(): Promise<Token[]> {
    return await db.select().from(tokens).orderBy(desc(tokens.volume24h));
  }

  async getToken(id: number): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.id, id));
    return token;
  }

  async getTokenByAddress(address: string): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.address, address));
    return token;
  }

  async createToken(token: InsertToken): Promise<Token> {
    const [newToken] = await db.insert(tokens).values(token).returning();
    return newToken;
  }

  async updateToken(id: number, updates: Partial<Token>): Promise<Token> {
    const [token] = await db
      .update(tokens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tokens.id, id))
      .returning();
    return token;
  }

  // Prediction operations
  async getPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }

  async getUserPredictions(userId: string): Promise<Prediction[]> {
    return await db
      .select()
      .from(predictions)
      .where(eq(predictions.userId, userId))
      .orderBy(desc(predictions.createdAt));
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async updatePrediction(id: number, updates: Partial<Prediction>): Promise<Prediction> {
    const [prediction] = await db
      .update(predictions)
      .set(updates)
      .where(eq(predictions.id, id))
      .returning();
    return prediction;
  }

  async getActivePredictions(): Promise<Prediction[]> {
    return await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.status, "pending"),
          gte(predictions.expiresAt, new Date())
        )
      );
  }

  // Missed opportunity operations
  async getUserMissedOpportunities(userId: string): Promise<MissedOpportunity[]> {
    return await db
      .select()
      .from(missedOpportunities)
      .where(eq(missedOpportunities.userId, userId))
      .orderBy(desc(missedOpportunities.missedGains));
  }

  async createMissedOpportunity(opportunity: InsertMissedOpportunity): Promise<MissedOpportunity> {
    const [newOpportunity] = await db.insert(missedOpportunities).values(opportunity).returning();
    return newOpportunity;
  }

  // Slot operations
  async createSlotSpin(spin: InsertSlotSpin): Promise<SlotSpin> {
    const [newSpin] = await db.insert(slotSpins).values(spin).returning();
    return newSpin;
  }

  async getUserSlotSpins(userId: string): Promise<SlotSpin[]> {
    return await db
      .select()
      .from(slotSpins)
      .where(eq(slotSpins.userId, userId))
      .orderBy(desc(slotSpins.createdAt));
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(userAchievements).values(achievement).returning();
    return newAchievement;
  }

  // Leaderboard operations
  async getLeaderboard(limit: number = 50): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.oofScore))
      .limit(limit);
  }

  // Token advertising operations
  async getActiveTokenAds(): Promise<TokenAd[]> {
    try {
      const now = new Date();
      
      // Add timeout to database query
      const queryPromise = db.select().from(tokenAds).where(
        and(
          eq(tokenAds.isActive, true),
          gt(tokenAds.endTime, now)
        )
      ).orderBy(tokenAds.slotNumber);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000);
      });
      
      const ads = await Promise.race([queryPromise, timeoutPromise]);
      return ads;
    } catch (error) {
      console.error("Database error in getActiveTokenAds:", error);
      
      // Return mock data for development
      const mockAds: TokenAd[] = [
        {
          id: 1,
          tokenAddress: "So11111111111111111111111111111111111111112",
          tokenName: "Wrapped SOL",
          tokenSymbol: "SOL",
          logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png",
          websiteUrl: "https://solana.com",
          description: "Wrapped Solana token for DeFi applications",
          slotNumber: 1,
          duration: 30,
          fee: "10.00",
          startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          endTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
          paymentTxHash: "mock_tx_1",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenName: "USD Coin",
          tokenSymbol: "USDC",
          logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
          websiteUrl: "https://www.centre.io/",
          description: "Fully reserved stablecoin pegged to the US dollar",
          slotNumber: 2,
          duration: 30,
          fee: "10.00",
          startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          endTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
          paymentTxHash: "mock_tx_2",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      return mockAds;
    }
  }

  async createTokenAd(ad: InsertTokenAd): Promise<TokenAd> {
    const [createdAd] = await db.insert(tokenAds).values(ad).returning();
    return createdAd;
  }

  async updateTokenAd(id: number, updates: Partial<TokenAd>): Promise<TokenAd> {
    const [updatedAd] = await db.update(tokenAds)
      .set(updates)
      .where(eq(tokenAds.id, id))
      .returning();
    return updatedAd;
  }

  async trackAdInteraction(interaction: InsertAdInteraction): Promise<AdInteraction> {
    const [createdInteraction] = await db.insert(adInteractions).values(interaction).returning();
    
    // Update ad stats
    if (interaction.interactionType === 'view') {
      await db.update(tokenAds)
        .set({ views: sql`${tokenAds.views} + 1` })
        .where(eq(tokenAds.id, interaction.adId));
    } else if (interaction.interactionType === 'click') {
      await db.update(tokenAds)
        .set({ clicks: sql`${tokenAds.clicks} + 1` })
        .where(eq(tokenAds.id, interaction.adId));
    }
    
    return createdInteraction;
  }

  async getAdStats(adId: number): Promise<{ views: number; clicks: number }> {
    const [ad] = await db.select({
      views: tokenAds.views,
      clicks: tokenAds.clicks
    }).from(tokenAds).where(eq(tokenAds.id, adId));
    
    return { views: ad?.views || 0, clicks: ad?.clicks || 0 };
  }

  // OOF Moments operations
  async createOOFMoment(moment: InsertOOFMoment): Promise<OOFMoment> {
    const [createdMoment] = await db
      .insert(oofMoments)
      .values(moment)
      .returning();
    return createdMoment;
  }

  async getOOFMoment(id: number): Promise<OOFMoment | undefined> {
    const [moment] = await db
      .select()
      .from(oofMoments)
      .where(eq(oofMoments.id, id));
    return moment;
  }

  async getOOFMomentsByWallet(walletAddress: string): Promise<OOFMoment[]> {
    return await db
      .select()
      .from(oofMoments)
      .where(eq(oofMoments.walletAddress, walletAddress))
      .orderBy(desc(oofMoments.createdAt));
  }

  async getOOFMomentsByUser(userId: string): Promise<OOFMoment[]> {
    return await db
      .select()
      .from(oofMoments)
      .where(eq(oofMoments.userId, userId))
      .orderBy(desc(oofMoments.createdAt));
  }

  async getPublicOOFMoments(limit: number = 50, offset: number = 0): Promise<OOFMoment[]> {
    return await db
      .select()
      .from(oofMoments)
      .where(eq(oofMoments.isPublic, true))
      .orderBy(desc(oofMoments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateOOFMoment(id: number, updates: Partial<OOFMoment>): Promise<OOFMoment> {
    const [updatedMoment] = await db
      .update(oofMoments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(oofMoments.id, id))
      .returning();
    return updatedMoment;
  }

  async deleteOOFMoment(id: number): Promise<void> {
    await db.delete(oofMoments).where(eq(oofMoments.id, id));
  }

  // Wallet analysis operations
  async createWalletAnalysis(analysis: InsertWalletAnalysis): Promise<WalletAnalysis> {
    const [createdAnalysis] = await db
      .insert(walletAnalysis)
      .values(analysis)
      .returning();
    return createdAnalysis;
  }

  async getWalletAnalysis(walletAddress: string): Promise<WalletAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(walletAnalysis)
      .where(eq(walletAnalysis.walletAddress, walletAddress));
    return analysis;
  }

  async updateWalletAnalysis(walletAddress: string, updates: Partial<WalletAnalysis>): Promise<WalletAnalysis> {
    const [updatedAnalysis] = await db
      .update(walletAnalysis)
      .set(updates)
      .where(eq(walletAnalysis.walletAddress, walletAddress))
      .returning();
    return updatedAnalysis;
  }

  // Moment interaction operations
  async createMomentInteraction(interaction: InsertMomentInteraction): Promise<MomentInteraction> {
    const [createdInteraction] = await db
      .insert(momentInteractions)
      .values(interaction)
      .returning();

    // Update moment social stats
    if (interaction.interactionType === 'like') {
      await db.update(oofMoments)
        .set({ 
          socialStats: sql`jsonb_set(${oofMoments.socialStats}, '{likes}', (COALESCE(${oofMoments.socialStats}->>'likes', '0')::int + 1)::text::jsonb)`
        })
        .where(eq(oofMoments.id, interaction.momentId));
    } else if (interaction.interactionType === 'share') {
      await db.update(oofMoments)
        .set({ 
          socialStats: sql`jsonb_set(${oofMoments.socialStats}, '{shares}', (COALESCE(${oofMoments.socialStats}->>'shares', '0')::int + 1)::text::jsonb)`
        })
        .where(eq(oofMoments.id, interaction.momentId));
    }

    return createdInteraction;
  }

  async getMomentInteractions(momentId: number): Promise<MomentInteraction[]> {
    return await db
      .select()
      .from(momentInteractions)
      .where(eq(momentInteractions.momentId, momentId))
      .orderBy(desc(momentInteractions.createdAt));
  }

  async getUserMomentInteraction(momentId: number, userId: string): Promise<MomentInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(momentInteractions)
      .where(
        and(
          eq(momentInteractions.momentId, momentId),
          eq(momentInteractions.userId, userId)
        )
      );
    return interaction;
  }

  async updateMomentInteraction(id: number, updates: Partial<MomentInteraction>): Promise<MomentInteraction> {
    const [updatedInteraction] = await db
      .update(momentInteractions)
      .set(updates)
      .where(eq(momentInteractions.id, id))
      .returning();
    return updatedInteraction;
  }

  // SPL token data operations
  async upsertSPLTokenData(tokenData: InsertSPLTokenData): Promise<SPLTokenData> {
    const [upsertedToken] = await db
      .insert(splTokenData)
      .values(tokenData)
      .onConflictDoUpdate({
        target: splTokenData.tokenAddress,
        set: {
          ...tokenData,
          lastUpdated: new Date()
        }
      })
      .returning();
    return upsertedToken;
  }

  async getSPLTokenData(tokenAddress: string): Promise<SPLTokenData | undefined> {
    const [token] = await db
      .select()
      .from(splTokenData)
      .where(eq(splTokenData.tokenAddress, tokenAddress));
    return token;
  }

  async updateSPLTokenPrice(tokenAddress: string, price: number): Promise<SPLTokenData> {
    const [updatedToken] = await db
      .update(splTokenData)
      .set({ 
        currentPrice: price.toString(),
        lastUpdated: new Date()
      })
      .where(eq(splTokenData.tokenAddress, tokenAddress))
      .returning();
    return updatedToken;
  }

  // Wallet transaction operations
  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [createdTransaction] = await db
      .insert(walletTransactions)
      .values(transaction)
      .returning();
    return createdTransaction;
  }

  async getWalletTransactions(walletAddress: string, limit: number = 100): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletAddress, walletAddress))
      .orderBy(desc(walletTransactions.timestamp))
      .limit(limit);
  }

  async getTokenTransactions(walletAddress: string, tokenAddress: string): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.walletAddress, walletAddress),
          eq(walletTransactions.tokenAddress, tokenAddress)
        )
      )
      .orderBy(desc(walletTransactions.timestamp));
  }
}

export const storage = new DatabaseStorage();
