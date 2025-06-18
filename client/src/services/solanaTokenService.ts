import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';

export interface TokenLaunchParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  initialSolAmount: number;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
}

export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  marketCap: number;
  price: number;
  volume24h: number;
  holders: number;
  liquidity: number;
  bondingCurveProgress: number;
  createdAt: Date;
  creator: string;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
}

export interface PumpFunApiResponse {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter: string;
  telegram: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website: string;
  show_name: boolean;
  king_of_the_hill_timestamp: number;
  market_cap: number;
  reply_count: number;
  last_reply: number;
  nsfw: boolean;
  market_id: string;
  inverted: boolean;
  is_currently_live: boolean;
  username: string;
  profile_image: string;
  usd_market_cap: number;
}

export class SolanaTokenService {
  private connection: Connection;
  private pumpFunApiBase = 'https://frontend-api.pump.fun';

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  }

  // Fetch trending tokens from pump.fun
  async getTrendingTokens(): Promise<TokenInfo[]> {
    try {
      const response = await fetch(`${this.pumpFunApiBase}/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PumpFunApiResponse[] = await response.json();
      
      return data.map(coin => ({
        mint: coin.mint,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description,
        imageUrl: coin.image_uri,
        marketCap: coin.usd_market_cap,
        price: this.calculatePrice(coin.virtual_sol_reserves, coin.virtual_token_reserves),
        volume24h: 0, // Would need additional API call
        holders: 0, // Would need additional API call
        liquidity: coin.virtual_sol_reserves,
        bondingCurveProgress: coin.complete ? 100 : this.calculateBondingProgress(coin.virtual_sol_reserves),
        createdAt: new Date(coin.created_timestamp * 1000),
        creator: coin.creator,
        websiteUrl: coin.website,
        twitterUrl: coin.twitter,
        telegramUrl: coin.telegram
      }));
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  // Get specific token information
  async getTokenInfo(mintAddress: string): Promise<TokenInfo | null> {
    try {
      const response = await fetch(`${this.pumpFunApiBase}/coins/${mintAddress}`);
      
      if (!response.ok) {
        return null;
      }
      
      const coin: PumpFunApiResponse = await response.json();
      
      return {
        mint: coin.mint,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description,
        imageUrl: coin.image_uri,
        marketCap: coin.usd_market_cap,
        price: this.calculatePrice(coin.virtual_sol_reserves, coin.virtual_token_reserves),
        volume24h: 0,
        holders: 0,
        liquidity: coin.virtual_sol_reserves,
        bondingCurveProgress: coin.complete ? 100 : this.calculateBondingProgress(coin.virtual_sol_reserves),
        createdAt: new Date(coin.created_timestamp * 1000),
        creator: coin.creator,
        websiteUrl: coin.website,
        twitterUrl: coin.twitter,
        telegramUrl: coin.telegram
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  // Calculate token price based on bonding curve
  private calculatePrice(solReserves: number, tokenReserves: number): number {
    if (tokenReserves === 0) return 0;
    return (solReserves / LAMPORTS_PER_SOL) / (tokenReserves / 1000000); // Assuming 6 decimals
  }

  // Calculate bonding curve progress
  private calculateBondingProgress(solReserves: number): number {
    const maxSol = 85; // Typical pump.fun graduation threshold
    return Math.min((solReserves / LAMPORTS_PER_SOL / maxSol) * 100, 100);
  }

  // Get token trades
  async getTokenTrades(mintAddress: string, limit = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.pumpFunApiBase}/trades/${mintAddress}?limit=${limit}&offset=0`);
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching token trades:', error);
      return [];
    }
  }

  // Get wallet's SOL balance
  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  }

  // Search tokens by name or symbol
  async searchTokens(query: string): Promise<TokenInfo[]> {
    try {
      const response = await fetch(`${this.pumpFunApiBase}/search/coins?q=${encodeURIComponent(query)}&limit=20`);
      
      if (!response.ok) {
        return [];
      }
      
      const data: PumpFunApiResponse[] = await response.json();
      
      return data.map(coin => ({
        mint: coin.mint,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description,
        imageUrl: coin.image_uri,
        marketCap: coin.usd_market_cap,
        price: this.calculatePrice(coin.virtual_sol_reserves, coin.virtual_token_reserves),
        volume24h: 0,
        holders: 0,
        liquidity: coin.virtual_sol_reserves,
        bondingCurveProgress: coin.complete ? 100 : this.calculateBondingProgress(coin.virtual_sol_reserves),
        createdAt: new Date(coin.created_timestamp * 1000),
        creator: coin.creator,
        websiteUrl: coin.website,
        twitterUrl: coin.twitter,
        telegramUrl: coin.telegram
      }));
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  // Get king of the hill token
  async getKingOfTheHill(): Promise<TokenInfo | null> {
    try {
      const response = await fetch(`${this.pumpFunApiBase}/coins/king-of-the-hill`);
      
      if (!response.ok) {
        return null;
      }
      
      const coin: PumpFunApiResponse = await response.json();
      
      return {
        mint: coin.mint,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description,
        imageUrl: coin.image_uri,
        marketCap: coin.usd_market_cap,
        price: this.calculatePrice(coin.virtual_sol_reserves, coin.virtual_token_reserves),
        volume24h: 0,
        holders: 0,
        liquidity: coin.virtual_sol_reserves,
        bondingCurveProgress: coin.complete ? 100 : this.calculateBondingProgress(coin.virtual_sol_reserves),
        createdAt: new Date(coin.created_timestamp * 1000),
        creator: coin.creator,
        websiteUrl: coin.website,
        twitterUrl: coin.twitter,
        telegramUrl: coin.telegram
      };
    } catch (error) {
      console.error('Error fetching king of the hill:', error);
      return null;
    }
  }
}

export const solanaTokenService = new SolanaTokenService();