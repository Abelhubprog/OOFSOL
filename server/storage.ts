import {
  users,
  tokens,
  predictions,
  missedOpportunities,
  slotSpins,
  userAchievements,
  tokenAds,
  adInteractions,
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
    const now = new Date();
    const ads = await db.select().from(tokenAds).where(
      and(
        eq(tokenAds.isActive, true),
        gt(tokenAds.endTime, now)
      )
    ).orderBy(tokenAds.slotNumber);
    return ads;
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
}

export const storage = new DatabaseStorage();
