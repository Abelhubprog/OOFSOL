CREATE TABLE "ad_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ad_id" integer NOT NULL,
	"user_wallet" varchar,
	"interaction_type" varchar NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaign_participations" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"participant_wallet" text NOT NULL,
	"participant_user_id" text,
	"actions_completed" jsonb NOT NULL,
	"total_reward" numeric(10, 4) DEFAULT '0' NOT NULL,
	"oof_points_earned" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"proof_data" jsonb NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaign_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"participation_id" text NOT NULL,
	"platform" text NOT NULL,
	"action_type" text NOT NULL,
	"target_url" text NOT NULL,
	"proof_url" text,
	"verification_method" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_by" text,
	"verification_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"platforms" text[] NOT NULL,
	"budget" numeric(10, 2) NOT NULL,
	"spent_budget" numeric(10, 2) DEFAULT '0' NOT NULL,
	"reward_per_action" numeric(10, 4) NOT NULL,
	"max_participants" integer DEFAULT 1000 NOT NULL,
	"participants" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"verification_level" text DEFAULT 'standard' NOT NULL,
	"content_urls" jsonb NOT NULL,
	"target_actions" jsonb NOT NULL,
	"analytics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ends_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "detective_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"report_type" varchar NOT NULL,
	"description" text,
	"confidence" integer DEFAULT 50,
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "missed_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"token_name" varchar NOT NULL,
	"token_symbol" varchar NOT NULL,
	"transaction_hash" varchar,
	"sold_price" numeric(20, 10),
	"peak_price" numeric(20, 10),
	"missed_gains" varchar,
	"amount" numeric(20, 2),
	"sell_date" timestamp,
	"peak_date" timestamp,
	"description" text,
	"oof_factor" integer DEFAULT 1,
	"nft_minted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "moment_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"moment_id" integer,
	"user_id" varchar,
	"interaction_type" varchar NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nft_moments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_id" varchar NOT NULL,
	"moment_name" varchar NOT NULL,
	"moment_description" text,
	"rarity" varchar NOT NULL,
	"mint_date" timestamp DEFAULT now(),
	"slot_result" jsonb,
	"image_url" varchar,
	"metadata_url" varchar,
	CONSTRAINT "nft_moments_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "oof_moments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"wallet_address" varchar NOT NULL,
	"moment_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"quote" text,
	"rarity" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"token_symbol" varchar NOT NULL,
	"token_name" varchar NOT NULL,
	"analysis" jsonb NOT NULL,
	"card_metadata" jsonb NOT NULL,
	"social_stats" jsonb DEFAULT '{}'::jsonb,
	"tags" text[] DEFAULT '{}',
	"minted_on_phantom" boolean DEFAULT false,
	"minted_on_zora" boolean DEFAULT false,
	"phantom_mint_hash" varchar,
	"zora_mint_url" varchar,
	"zora_token_id" varchar,
	"image_url" varchar,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_id" integer NOT NULL,
	"direction" varchar NOT NULL,
	"target_price" numeric(20, 10) NOT NULL,
	"current_price" numeric(20, 10) NOT NULL,
	"timeframe" varchar NOT NULL,
	"potential_reward" integer DEFAULT 0,
	"status" varchar DEFAULT 'pending',
	"expires_at" timestamp NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_number" bigint NOT NULL,
	"total_revenue" numeric(20, 8) DEFAULT '0',
	"total_purchases" numeric(20, 8) DEFAULT '0',
	"participant_count" integer DEFAULT 0,
	"distributed" boolean DEFAULT false,
	"distributed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slot_spins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"result" jsonb NOT NULL,
	"reward" integer DEFAULT 0,
	"nft_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spl_token_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_address" varchar NOT NULL,
	"symbol" varchar,
	"name" varchar,
	"decimals" integer,
	"supply" bigint,
	"current_price" numeric(20, 10),
	"price_change_24h" numeric(10, 4),
	"market_cap" bigint,
	"volume_24h" bigint,
	"holders" integer,
	"last_updated" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "spl_token_data_token_address_unique" UNIQUE("token_address")
);
--> statement-breakpoint
CREATE TABLE "time_machine_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_symbol" varchar NOT NULL,
	"investment_amount" numeric(20, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"missed_gains" numeric(20, 2),
	"oof_potential" numeric(20, 2),
	"multiplier" numeric(10, 2),
	"shared" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_address" varchar NOT NULL,
	"token_name" varchar NOT NULL,
	"token_symbol" varchar NOT NULL,
	"advertiser_wallet" varchar NOT NULL,
	"buy_link" text NOT NULL,
	"media_url" text,
	"media_type" varchar DEFAULT 'image',
	"telegram" varchar,
	"twitter" varchar,
	"website" varchar,
	"description" text,
	"payment_tx_id" varchar NOT NULL,
	"payment_amount" numeric(20, 8) NOT NULL,
	"payment_token_symbol" varchar NOT NULL,
	"slot_number" integer NOT NULL,
	"cycle_number" bigint NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"views" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"alert_type" varchar NOT NULL,
	"condition" jsonb,
	"is_active" boolean DEFAULT true,
	"triggered" boolean DEFAULT false,
	"triggered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" varchar NOT NULL,
	"name" varchar NOT NULL,
	"symbol" varchar NOT NULL,
	"icon" varchar,
	"emoji" varchar,
	"price" numeric(20, 10),
	"market_cap" numeric(20, 2),
	"volume_24h" numeric(20, 2),
	"change_24h" numeric(8, 4),
	"risk_score" integer DEFAULT 50,
	"rug_pull_risk" integer DEFAULT 0,
	"social_score" integer DEFAULT 0,
	"whale_activity" varchar DEFAULT 'Low',
	"holder_count" integer DEFAULT 0,
	"liquidity_usd" numeric(20, 2),
	"description" text,
	"launch_date" timestamp,
	"peak_price" numeric(20, 10),
	"peak_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tokens_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_type" varchar NOT NULL,
	"achievement_name" varchar NOT NULL,
	"description" text,
	"unlocked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_wallet" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"purchase_amount" numeric(20, 8) NOT NULL,
	"cycle_number" bigint NOT NULL,
	"tx_id" varchar NOT NULL,
	"revenue_share" numeric(20, 8) DEFAULT '0',
	"claimed" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"wallet_address" varchar,
	"oof_tokens" integer DEFAULT 0,
	"prediction_accuracy" numeric(5, 2) DEFAULT '0',
	"total_predictions" integer DEFAULT 0,
	"correct_predictions" integer DEFAULT 0,
	"ranking" integer DEFAULT 0,
	"oof_score" integer DEFAULT 0,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "wallet_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar NOT NULL,
	"last_analyzed" timestamp DEFAULT now(),
	"total_transactions" integer DEFAULT 0,
	"total_tokens_traded" integer DEFAULT 0,
	"biggest_gain" jsonb,
	"biggest_loss" jsonb,
	"dust_tokens" jsonb DEFAULT '[]'::jsonb,
	"paper_hands_moments" jsonb DEFAULT '[]'::jsonb,
	"profitable_tokens" jsonb DEFAULT '[]'::jsonb,
	"analysis_metrics" jsonb DEFAULT '{}'::jsonb,
	"status" varchar DEFAULT 'pending',
	"error_message" text,
	CONSTRAINT "wallet_analysis_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar NOT NULL,
	"signature" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"transaction_type" varchar NOT NULL,
	"amount" bigint NOT NULL,
	"price" numeric(20, 10),
	"sol_amount" bigint,
	"timestamp" timestamp NOT NULL,
	"block_height" integer,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "wallet_transactions_signature_unique" UNIQUE("signature")
);
--> statement-breakpoint
ALTER TABLE "ad_interactions" ADD CONSTRAINT "ad_interactions_ad_id_token_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."token_ads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_participations" ADD CONSTRAINT "campaign_participations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_verifications" ADD CONSTRAINT "campaign_verifications_participation_id_campaign_participations_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."campaign_participations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detective_reports" ADD CONSTRAINT "detective_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missed_opportunities" ADD CONSTRAINT "missed_opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moment_interactions" ADD CONSTRAINT "moment_interactions_moment_id_oof_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."oof_moments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moment_interactions" ADD CONSTRAINT "moment_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_moments" ADD CONSTRAINT "nft_moments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oof_moments" ADD CONSTRAINT "oof_moments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_spins" ADD CONSTRAINT "slot_spins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_machine_runs" ADD CONSTRAINT "time_machine_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_alerts" ADD CONSTRAINT "token_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");