import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // OOF specific fields
  oofTokens: integer("oof_tokens").default(0),
  predictionAccuracy: decimal("prediction_accuracy", { precision: 5, scale: 2 }).default("0"),
  totalPredictions: integer("total_predictions").default(0),
  correctPredictions: integer("correct_predictions").default(0),
  ranking: integer("ranking").default(0),
  oofScore: integer("oof_score").default(0),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  address: varchar("address").unique().notNull(),
  name: varchar("name").notNull(),
  symbol: varchar("symbol").notNull(),
  icon: varchar("icon"),
  price: decimal("price", { precision: 20, scale: 10 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  change24h: decimal("change_24h", { precision: 8, scale: 4 }),
  riskScore: integer("risk_score").default(50), // 0-100 scale
  launchDate: timestamp("launch_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenId: integer("token_id").notNull().references(() => tokens.id),
  direction: varchar("direction").notNull(), // 'up' or 'down'
  targetPrice: decimal("target_price", { precision: 20, scale: 10 }).notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 10 }).notNull(),
  timeframe: varchar("timeframe").notNull(), // '1h', '4h', '24h', '7d'
  potentialReward: integer("potential_reward").default(0),
  status: varchar("status").default("pending"), // 'pending', 'success', 'failed', 'expired'
  expiresAt: timestamp("expires_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const missedOpportunities = pgTable("missed_opportunities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenAddress: varchar("token_address").notNull(),
  tokenName: varchar("token_name").notNull(),
  tokenSymbol: varchar("token_symbol").notNull(),
  transactionHash: varchar("transaction_hash"),
  soldPrice: decimal("sold_price", { precision: 20, scale: 10 }),
  peakPrice: decimal("peak_price", { precision: 20, scale: 10 }),
  missedGains: decimal("missed_gains", { precision: 20, scale: 2 }),
  amount: decimal("amount", { precision: 20, scale: 2 }),
  sellDate: timestamp("sell_date"),
  peakDate: timestamp("peak_date"),
  description: text("description"),
  oofFactor: integer("oof_factor").default(1), // 1-10 scale
  nftMinted: boolean("nft_minted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const slotSpins = pgTable("slot_spins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  result: jsonb("result").notNull(), // Store spin results
  reward: integer("reward").default(0),
  nftGenerated: boolean("nft_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementType: varchar("achievement_type").notNull(),
  achievementName: varchar("achievement_name").notNull(),
  description: text("description"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;
export type MissedOpportunity = typeof missedOpportunities.$inferSelect;
export type InsertMissedOpportunity = typeof missedOpportunities.$inferInsert;
export type SlotSpin = typeof slotSpins.$inferSelect;
export type InsertSlotSpin = typeof slotSpins.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

// Zod schemas
export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertMissedOpportunitySchema = createInsertSchema(missedOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertSlotSpinSchema = createInsertSchema(slotSpins).omit({
  id: true,
  createdAt: true,
});
