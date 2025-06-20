ALTER TABLE "moment_interactions" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "oof_moments" ADD COLUMN "hashtags" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "oof_moments" ADD COLUMN "likes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "oof_moments" ADD COLUMN "shares" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "oof_moments" ADD COLUMN "comments" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "token_ads" ADD COLUMN "slot_position" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "token_ads" ADD COLUMN "impressions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_moments" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_earned" numeric(20, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar;--> statement-breakpoint
ALTER TABLE "wallet_analysis" ADD COLUMN "analysis_data" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "wallet_analysis" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");