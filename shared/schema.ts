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
  serial,
  bigint
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
  walletAddress: varchar("wallet_address").unique(),
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
  emoji: varchar("emoji"),
  price: decimal("price", { precision: 20, scale: 10 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  change24h: decimal("change_24h", { precision: 8, scale: 4 }),
  riskScore: integer("risk_score").default(50), // 0-100 scale
  rugPullRisk: integer("rug_pull_risk").default(0), // 0-100 scale
  socialScore: integer("social_score").default(0), // 0-100 scale
  whaleActivity: varchar("whale_activity").default("Low"), // Low, Medium, High, Extreme
  holderCount: integer("holder_count").default(0),
  liquidityUSD: decimal("liquidity_usd", { precision: 20, scale: 2 }),
  description: text("description"),
  launchDate: timestamp("launch_date"),
  peakPrice: decimal("peak_price", { precision: 20, scale: 10 }),
  peakDate: timestamp("peak_date"),
  isActive: boolean("is_active").default(true),
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
  missedGains: varchar("missed_gains"),
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

// Enhanced OOF Moments for wallet analysis
export const oofMoments = pgTable("oof_moments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  walletAddress: varchar("wallet_address").notNull(),
  momentType: varchar("moment_type").notNull(), // "paper_hands", "dust_collector", "gains_master"
  title: varchar("title").notNull(),
  description: text("description"),
  quote: text("quote"),
  rarity: varchar("rarity").notNull(), // "legendary", "epic", "rare"
  tokenAddress: varchar("token_address").notNull(),
  tokenSymbol: varchar("token_symbol").notNull(),
  tokenName: varchar("token_name").notNull(),
  analysis: jsonb("analysis").notNull(), // Detailed trading analysis
  cardMetadata: jsonb("card_metadata").notNull(), // Card design and styling
  socialStats: jsonb("social_stats").default({}),
  tags: text("tags").array().default([]),
  mintedOnPhantom: boolean("minted_on_phantom").default(false),
  mintedOnZora: boolean("minted_on_zora").default(false),
  phantomMintHash: varchar("phantom_mint_hash"),
  zoraMintUrl: varchar("zora_mint_url"),
  zoraTokenId: varchar("zora_token_id"),
  imageUrl: varchar("image_url"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletAnalysis = pgTable("wallet_analysis", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address").notNull().unique(),
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
  totalTransactions: integer("total_transactions").default(0),
  totalTokensTraded: integer("total_tokens_traded").default(0),
  biggestGain: jsonb("biggest_gain"), // Token and amount data
  biggestLoss: jsonb("biggest_loss"), // Token and amount data
  dustTokens: jsonb("dust_tokens").default([]), // Array of dust token data
  paperHandsMoments: jsonb("paper_hands_moments").default([]), // Array of missed opportunities
  profitableTokens: jsonb("profitable_tokens").default([]), // Array of profitable trades
  analysisMetrics: jsonb("analysis_metrics").default({}),
  status: varchar("status").default("pending"), // "pending", "analyzing", "completed", "error"
  errorMessage: text("error_message"),
});

export const momentInteractions = pgTable("moment_interactions", {
  id: serial("id").primaryKey(),
  momentId: integer("moment_id").references(() => oofMoments.id),
  userId: varchar("user_id").references(() => users.id),
  interactionType: varchar("interaction_type").notNull(), // "like", "share", "comment"
  comment: text("comment"), // For comment interactions
  createdAt: timestamp("created_at").defaultNow(),
});

export const splTokenData = pgTable("spl_token_data", {
  id: serial("id").primaryKey(),
  tokenAddress: varchar("token_address").notNull().unique(),
  symbol: varchar("symbol"),
  name: varchar("name"),
  decimals: integer("decimals"),
  supply: bigint("supply", { mode: "bigint" }),
  currentPrice: decimal("current_price", { precision: 20, scale: 10 }),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 4 }),
  marketCap: bigint("market_cap", { mode: "bigint" }),
  volume24h: bigint("volume_24h", { mode: "bigint" }),
  holders: integer("holders"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address").notNull(),
  signature: varchar("signature").notNull().unique(),
  tokenAddress: varchar("token_address").notNull(),
  transactionType: varchar("transaction_type").notNull(), // "buy", "sell", "transfer"
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  price: decimal("price", { precision: 20, scale: 10 }),
  solAmount: bigint("sol_amount", { mode: "bigint" }),
  timestamp: timestamp("timestamp").notNull(),
  blockHeight: integer("block_height"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// NFT Collections for rare slot moments (keeping original for backward compatibility)
export const nftMoments = pgTable("nft_moments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenId: varchar("token_id").unique().notNull(),
  momentName: varchar("moment_name").notNull(),
  momentDescription: text("moment_description"),
  rarity: varchar("rarity").notNull(), // legendary, epic, rare, uncommon, common
  mintDate: timestamp("mint_date").defaultNow(),
  slotResult: jsonb("slot_result"), // Store the winning combination
  imageUrl: varchar("image_url"),
  metadataUrl: varchar("metadata_url"),
});

// Detective reports for community validation
export const detectiveReports = pgTable("detective_reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenAddress: varchar("token_address").notNull(),
  reportType: varchar("report_type").notNull(), // safe, warning, rug, honeypot
  description: text("description"),
  confidence: integer("confidence").default(50), // 0-100
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Time machine simulations history
export const timeMachineRuns = pgTable("time_machine_runs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenSymbol: varchar("token_symbol").notNull(),
  investmentAmount: decimal("investment_amount", { precision: 20, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  missedGains: decimal("missed_gains", { precision: 20, scale: 2 }),
  oofPotential: decimal("oof_potential", { precision: 20, scale: 2 }),
  multiplier: decimal("multiplier", { precision: 10, scale: 2 }),
  shared: boolean("shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time token monitoring alerts
export const tokenAlerts = pgTable("token_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenAddress: varchar("token_address").notNull(),
  alertType: varchar("alert_type").notNull(), // price, volume, whale_movement, rug_detected
  condition: jsonb("condition"), // Store alert conditions
  isActive: boolean("is_active").default(true),
  triggered: boolean("triggered").default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Token advertising listings
export const tokenAds = pgTable("token_ads", {
  id: serial("id").primaryKey(),
  tokenAddress: varchar("token_address").notNull(),
  tokenName: varchar("token_name").notNull(),
  tokenSymbol: varchar("token_symbol").notNull(),
  advertiserWallet: varchar("advertiser_wallet").notNull(),
  buyLink: text("buy_link").notNull(),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type").default("image"), // image, video, gif
  telegram: varchar("telegram"),
  twitter: varchar("twitter"),
  website: varchar("website"),
  description: text("description"),
  paymentTxId: varchar("payment_tx_id").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 20, scale: 8 }).notNull(),
  paymentTokenSymbol: varchar("payment_token_symbol").notNull(),
  slotNumber: integer("slot_number").notNull(), // 0-5 for 6 slots
  cycleNumber: bigint("cycle_number", { mode: "number" }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  isActive: boolean("is_active").default(true),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ad interaction tracking
export const adInteractions = pgTable("ad_interactions", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").notNull().references(() => tokenAds.id),
  userWallet: varchar("user_wallet"),
  interactionType: varchar("interaction_type").notNull(), // view, click, purchase
  metadata: jsonb("metadata"), // Additional interaction data
  timestamp: timestamp("timestamp").defaultNow(),
});

// Revenue sharing pools
export const revenuePools = pgTable("revenue_pools", {
  id: serial("id").primaryKey(),
  cycleNumber: bigint("cycle_number", { mode: "number" }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 20, scale: 8 }).default("0"),
  totalPurchases: decimal("total_purchases", { precision: 20, scale: 8 }).default("0"),
  participantCount: integer("participant_count").default(0),
  distributed: boolean("distributed").default(false),
  distributedAt: timestamp("distributed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User purchases for revenue sharing
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userWallet: varchar("user_wallet").notNull(),
  tokenAddress: varchar("token_address").notNull(),
  purchaseAmount: decimal("purchase_amount", { precision: 20, scale: 8 }).notNull(),
  cycleNumber: bigint("cycle_number", { mode: "number" }).notNull(),
  txId: varchar("tx_id").notNull(),
  revenueShare: decimal("revenue_share", { precision: 20, scale: 8 }).default("0"),
  claimed: boolean("claimed").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
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
export type TokenAd = typeof tokenAds.$inferSelect;
export type InsertTokenAd = typeof tokenAds.$inferInsert;
export type AdInteraction = typeof adInteractions.$inferSelect;
export type InsertAdInteraction = typeof adInteractions.$inferInsert;
export type RevenuePool = typeof revenuePools.$inferSelect;
export type InsertRevenuePool = typeof revenuePools.$inferInsert;
export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertUserPurchase = typeof userPurchases.$inferInsert;

// Enhanced OOF Moments types
export type OOFMoment = typeof oofMoments.$inferSelect;
export type InsertOOFMoment = typeof oofMoments.$inferInsert;
export type WalletAnalysis = typeof walletAnalysis.$inferSelect;
export type InsertWalletAnalysis = typeof walletAnalysis.$inferInsert;
export type MomentInteraction = typeof momentInteractions.$inferSelect;
export type InsertMomentInteraction = typeof momentInteractions.$inferInsert;
export type SPLTokenData = typeof splTokenData.$inferSelect;
export type InsertSPLTokenData = typeof splTokenData.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

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

// Campaign System Tables
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  platforms: text("platforms").array().notNull(), // ['twitter', 'farcaster', 'tiktok', 'arena']
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  spentBudget: decimal("spent_budget", { precision: 10, scale: 2 }).default("0").notNull(),
  rewardPerAction: decimal("reward_per_action", { precision: 10, scale: 4 }).notNull(),
  maxParticipants: integer("max_participants").default(1000).notNull(),
  participants: integer("participants").default(0).notNull(),
  status: text("status").notNull().default("draft"), // draft, active, paused, completed, cancelled
  verificationLevel: text("verification_level").notNull().default("standard"), // basic, standard, premium
  contentUrls: jsonb("content_urls").notNull(), // { platform: url }
  targetActions: jsonb("target_actions").notNull(), // [{ platform, type, targetUrl, reward }]
  analytics: jsonb("analytics").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaignParticipations = pgTable("campaign_participations", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id),
  participantWallet: text("participant_wallet").notNull(),
  participantUserId: text("participant_user_id"),
  actionsCompleted: jsonb("actions_completed").notNull(), // [{ platform, type, proofUrl, verified }]
  totalReward: decimal("total_reward", { precision: 10, scale: 4 }).default("0").notNull(),
  oofPointsEarned: integer("oof_points_earned").default(0).notNull(),
  status: text("status").notNull().default("pending"), // pending, verified, rejected, paid
  proofData: jsonb("proof_data").notNull(), // verification proofs
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
  paidAt: timestamp("paid_at"),
});

export const campaignVerifications = pgTable("campaign_verifications", {
  id: text("id").primaryKey(),
  participationId: text("participation_id").notNull().references(() => campaignParticipations.id),
  platform: text("platform").notNull(),
  actionType: text("action_type").notNull(),
  targetUrl: text("target_url").notNull(),
  proofUrl: text("proof_url"),
  verificationMethod: text("verification_method").notNull(), // api, manual, community
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: text("verified_by"), // oracle address or user id
  verificationData: jsonb("verification_data"), // additional verification data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

// Campaign type exports
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type CampaignParticipation = typeof campaignParticipations.$inferSelect;
export type InsertCampaignParticipation = typeof campaignParticipations.$inferInsert;
export type CampaignVerification = typeof campaignVerifications.$inferSelect;
export type InsertCampaignVerification = typeof campaignVerifications.$inferInsert;

// Campaign Zod schemas
export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  createdAt: true,
  updatedAt: true,
  spentBudget: true,
  participants: true,
});

export const insertCampaignParticipationSchema = createInsertSchema(campaignParticipations).omit({
  submittedAt: true,
  verifiedAt: true,
  paidAt: true,
  totalReward: true,
  oofPointsEarned: true,
});
