import { DatabaseUtils } from '../db/utils';
import { tokenAds } from '@shared/schema';
import { eq, and, gte, lt, desc, sql } from 'drizzle-orm';
import Stripe from 'stripe';

export interface TokenAdRequest {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  description: string;
  logoUrl: string;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  slotDuration: number; // minutes
  paymentAmount: number; // USDC
  creatorWallet: string;
}

export interface AdSlot {
  id: string;
  position: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  token: TokenAdRequest;
  clicks: number;
  impressions: number;
}

export class TokenAdvertisingService {
  private stripe: Stripe;
  private readonly SLOT_COUNT = 6;
  private readonly BASE_PRICE = 10; // $10 USDC per 30 minutes
  private readonly REVENUE_SHARE = 0.15; // 15% platform fee

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20',
    });
  }

  // 🎯 Create Ad Campaign
  async createAdCampaign(adRequest: TokenAdRequest): Promise<{
    campaignId: string;
    paymentIntentId?: string;
    totalCost: number;
    estimatedSlots: AdSlot[];
  }> {
    try {
      // Calculate pricing based on demand and slot availability
      const pricing = await this.calculatePricing(adRequest.slotDuration);
      
      // Find available slots
      const availableSlots = await this.findAvailableSlots(
        adRequest.slotDuration,
        new Date()
      );

      if (availableSlots.length === 0) {
        throw new Error('No available ad slots for requested duration');
      }

      // Create campaign record
      const campaign = await DatabaseUtils.createTokenAd({
        tokenAddress: adRequest.tokenAddress,
        tokenName: adRequest.tokenName,
        tokenSymbol: adRequest.tokenSymbol,
        description: adRequest.description,
        logoUrl: adRequest.logoUrl,
        websiteUrl: adRequest.websiteUrl,
        twitterUrl: adRequest.twitterUrl,
        telegramUrl: adRequest.telegramUrl,
        creatorWallet: adRequest.creatorWallet,
        slotDuration: adRequest.slotDuration,
        paymentAmount: pricing.totalCost,
        startTime: availableSlots[0].startTime,
        endTime: availableSlots[availableSlots.length - 1].endTime,
        status: 'pending_payment',
        clicks: 0,
        impressions: 0,
        isActive: false
      });

      // Create Stripe payment intent for USDC payment
      let paymentIntentId: string | undefined;
      if (pricing.totalCost > 0) {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(pricing.totalCost * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            campaignId: campaign.id,
            tokenAddress: adRequest.tokenAddress,
            slotDuration: adRequest.slotDuration.toString()
          }
        });
        paymentIntentId = paymentIntent.id;
      }

      return {
        campaignId: campaign.id,
        paymentIntentId,
        totalCost: pricing.totalCost,
        estimatedSlots: availableSlots
      };
    } catch (error) {
      console.error('Error creating ad campaign:', error);
      throw error;
    }
  }

  // 💰 Calculate Dynamic Pricing
  private async calculatePricing(duration: number): Promise<{
    baseCost: number;
    demandMultiplier: number;
    totalCost: number;
  }> {
    // Base cost per 30-minute slot
    const slotsNeeded = Math.ceil(duration / 30);
    const baseCost = this.BASE_PRICE * slotsNeeded;

    // Calculate demand multiplier based on upcoming slots
    const currentHour = new Date().getHours();
    const demandMultiplier = this.getDemandMultiplier(currentHour);

    // Check current booking rate
    const bookedSlots = await this.getBookedSlotsCount(
      new Date(),
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
    const demandFactor = Math.min(2.0, 1 + (bookedSlots / (this.SLOT_COUNT * 48))); // Max 2x multiplier

    const totalMultiplier = demandMultiplier * demandFactor;
    const totalCost = baseCost * totalMultiplier;

    return {
      baseCost,
      demandMultiplier: totalMultiplier,
      totalCost: Math.round(totalCost * 100) / 100 // Round to 2 decimals
    };
  }

  // 📅 Find Available Slots
  private async findAvailableSlots(duration: number, startTime: Date): Promise<AdSlot[]> {
    const slotsNeeded = Math.ceil(duration / 30);
    const slots: AdSlot[] = [];
    
    // Get all booked slots for the next 7 days
    const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    const bookedSlots = await DatabaseUtils.getActiveTokenAds(startTime, endTime);

    // Generate time slots and check availability
    let currentTime = new Date(startTime);
    currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 30) * 30, 0, 0); // Round to 30-min intervals

    while (slots.length < slotsNeeded && currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000);
      
      // Check if slot is available
      const isBooked = bookedSlots.some(ad => 
        (currentTime >= new Date(ad.startTime) && currentTime < new Date(ad.endTime)) ||
        (slotEnd > new Date(ad.startTime) && slotEnd <= new Date(ad.endTime))
      );

      if (!isBooked) {
        slots.push({
          id: `slot-${currentTime.getTime()}`,
          position: slots.length + 1,
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          isActive: false,
          token: {} as TokenAdRequest,
          clicks: 0,
          impressions: 0
        });
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  // 🎯 Get Current Active Ads
  async getCurrentActiveAds(): Promise<AdSlot[]> {
    const now = new Date();
    const activeAds = await DatabaseUtils.getActiveTokenAds(
      new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes buffer
      new Date(now.getTime() + 5 * 60 * 1000)
    );

    return activeAds.map((ad, index) => ({
      id: ad.id,
      position: (index % this.SLOT_COUNT) + 1,
      startTime: new Date(ad.startTime),
      endTime: new Date(ad.endTime),
      isActive: ad.isActive,
      token: {
        tokenAddress: ad.tokenAddress,
        tokenName: ad.tokenName,
        tokenSymbol: ad.tokenSymbol,
        description: ad.description,
        logoUrl: ad.logoUrl,
        websiteUrl: ad.websiteUrl || undefined,
        twitterUrl: ad.twitterUrl || undefined,
        telegramUrl: ad.telegramUrl || undefined,
        slotDuration: ad.slotDuration,
        paymentAmount: ad.paymentAmount,
        creatorWallet: ad.creatorWallet
      },
      clicks: ad.clicks,
      impressions: ad.impressions
    }));
  }

  // 📊 Track Ad Interaction
  async trackAdInteraction(adId: string, type: 'impression' | 'click', userWallet?: string): Promise<void> {
    try {
      if (type === 'impression') {
        await DatabaseUtils.incrementAdImpressions(adId);
      } else if (type === 'click') {
        await DatabaseUtils.incrementAdClicks(adId);
        
        // Track click for analytics
        if (userWallet) {
          await DatabaseUtils.trackAdClick(adId, userWallet);
        }
      }
    } catch (error) {
      console.error('Error tracking ad interaction:', error);
    }
  }

  // 💳 Process Payment Confirmation
  async processPaymentConfirmation(paymentIntentId: string): Promise<{
    success: boolean;
    campaignId?: string;
    activatedSlots?: AdSlot[];
  }> {
    try {
      // Verify payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return { success: false };
      }

      const campaignId = paymentIntent.metadata.campaignId;
      if (!campaignId) {
        throw new Error('Campaign ID not found in payment metadata');
      }

      // Update campaign status
      await DatabaseUtils.updateTokenAdStatus(campaignId, 'active');

      // Get activated slots
      const activatedSlots = await this.getCurrentActiveAds();

      return {
        success: true,
        campaignId,
        activatedSlots: activatedSlots.filter(slot => slot.id === campaignId)
      };
    } catch (error) {
      console.error('Error processing payment confirmation:', error);
      return { success: false };
    }
  }

  // 📈 Get Analytics
  async getAdAnalytics(campaignId: string): Promise<{
    totalImpressions: number;
    totalClicks: number;
    clickThroughRate: number;
    costPerClick: number;
    isActive: boolean;
    remainingTime: number; // minutes
  }> {
    const ad = await DatabaseUtils.getTokenAdById(campaignId);
    if (!ad) {
      throw new Error('Campaign not found');
    }

    const clickThroughRate = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
    const costPerClick = ad.clicks > 0 ? ad.paymentAmount / ad.clicks : 0;
    
    const now = Date.now();
    const endTime = new Date(ad.endTime).getTime();
    const remainingTime = Math.max(0, Math.floor((endTime - now) / (1000 * 60)));

    return {
      totalImpressions: ad.impressions,
      totalClicks: ad.clicks,
      clickThroughRate: Math.round(clickThroughRate * 100) / 100,
      costPerClick: Math.round(costPerClick * 100) / 100,
      isActive: ad.isActive && now < endTime,
      remainingTime
    };
  }

  // 🕐 Get Demand Multiplier by Hour
  private getDemandMultiplier(hour: number): number {
    // Higher prices during peak trading hours (9-16 UTC)
    if (hour >= 9 && hour <= 16) {
      return 1.5; // 50% premium during peak hours
    } else if (hour >= 6 && hour <= 9 || hour >= 16 && hour <= 20) {
      return 1.2; // 20% premium during active hours
    }
    return 1.0; // Base price during off-peak hours
  }

  // 📊 Get Booked Slots Count
  private async getBookedSlotsCount(startTime: Date, endTime: Date): Promise<number> {
    const bookedAds = await DatabaseUtils.getActiveTokenAds(startTime, endTime);
    return bookedAds.length;
  }

  // 🔄 Rotate Ad Slots (called by cron job)
  async rotateAdSlots(): Promise<void> {
    try {
      const now = new Date();
      
      // Deactivate expired ads
      await DatabaseUtils.deactivateExpiredAds(now);
      
      // Activate upcoming ads
      await DatabaseUtils.activateUpcomingAds(now);
      
      console.log('Ad slots rotated successfully');
    } catch (error) {
      console.error('Error rotating ad slots:', error);
    }
  }

  // 💼 Get Revenue Analytics
  async getRevenueAnalytics(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    platformFee: number;
    creatorPayouts: number;
    totalAds: number;
    averageClickRate: number;
  }> {
    const ads = await DatabaseUtils.getTokenAdsByDateRange(startDate, endDate);
    
    const totalRevenue = ads.reduce((sum, ad) => sum + ad.paymentAmount, 0);
    const platformFee = totalRevenue * this.REVENUE_SHARE;
    const creatorPayouts = totalRevenue - platformFee;
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const averageClickRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      creatorPayouts: Math.round(creatorPayouts * 100) / 100,
      totalAds: ads.length,
      averageClickRate: Math.round(averageClickRate * 100) / 100
    };
  }
}

export const tokenAdvertisingService = new TokenAdvertisingService();