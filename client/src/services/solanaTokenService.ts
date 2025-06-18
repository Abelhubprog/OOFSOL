export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  price: number;
  marketCap: number;
  liquidity: number;
  bondingCurveProgress: number;
  createdAt: Date;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  volume24h: number;
  priceChange24h: number;
}

class SolanaTokenService {
  private baseUrl = 'https://api.pump.fun';

  async getTrendingTokens(): Promise<TokenInfo[]> {
    // Mock trending tokens for demo - replace with real API
    return [
      {
        mint: 'So11111111111111111111111111111111111111112',
        name: 'Wrapped SOL',
        symbol: 'SOL',
        description: 'Wrapped Solana for trading',
        price: 23.45,
        marketCap: 12500000,
        liquidity: 850000,
        bondingCurveProgress: 75.3,
        createdAt: new Date('2024-01-15'),
        volume24h: 2500000,
        priceChange24h: 5.2,
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        description: 'Digital dollar stablecoin',
        price: 1.00,
        marketCap: 45000000,
        liquidity: 1200000,
        bondingCurveProgress: 100,
        createdAt: new Date('2024-01-10'),
        volume24h: 8500000,
        priceChange24h: 0.1,
      },
      {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        description: 'The first Solana dog coin for the people',
        price: 0.000012,
        marketCap: 780000,
        liquidity: 125000,
        bondingCurveProgress: 45.8,
        createdAt: new Date('2024-02-01'),
        volume24h: 450000,
        priceChange24h: -2.3,
      },
      {
        mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        name: 'Marinade SOL',
        symbol: 'mSOL',
        description: 'Liquid staking token for Solana',
        price: 25.12,
        marketCap: 2100000,
        liquidity: 320000,
        bondingCurveProgress: 62.4,
        createdAt: new Date('2024-01-20'),
        volume24h: 680000,
        priceChange24h: 3.7,
      },
      {
        mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
        name: 'Ethereum',
        symbol: 'ETH',
        description: 'Wrapped Ethereum on Solana',
        price: 1834.56,
        marketCap: 8900000,
        liquidity: 550000,
        bondingCurveProgress: 88.9,
        createdAt: new Date('2024-01-12'),
        volume24h: 3200000,
        priceChange24h: 1.8,
      },
      {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'Tether',
        symbol: 'USDT',
        description: 'Tether USD stablecoin',
        price: 0.999,
        marketCap: 3400000,
        liquidity: 890000,
        bondingCurveProgress: 100,
        createdAt: new Date('2024-01-08'),
        volume24h: 5600000,
        priceChange24h: -0.05,
      }
    ];
  }

  async searchTokens(query: string): Promise<TokenInfo[]> {
    const allTokens = await this.getTrendingTokens();
    return allTokens.filter(token => 
      token.name.toLowerCase().includes(query.toLowerCase()) ||
      token.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getTokenByMint(mint: string): Promise<TokenInfo | null> {
    const allTokens = await this.getTrendingTokens();
    return allTokens.find(token => token.mint === mint) || null;
  }

  async getTokenPrice(mint: string): Promise<number> {
    const token = await this.getTokenByMint(mint);
    return token?.price || 0;
  }
}

export const solanaTokenService = new SolanaTokenService();