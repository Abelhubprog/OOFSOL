import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

interface OOFMomentCard {
  id: string;
  type: 'paper_hands' | 'dust_collector' | 'gains_master';
  title: string;
  description: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  narrative: string;
  quote: string;
  rarity: string;
  walletAddress: string;
  metadata: {
    attributes: Array<{ trait_type: string; value: string }>;
    momentType: string;
    emoji: string;
    colors: string[];
  };
}

interface ZoraLaunchRequest {
  cards: OOFMomentCard[];
  oofInvestmentAmount: number; // $1-100
  distribution: [number, number, number]; // Percentage split
  userWalletAddress: string;
}

interface ZoraLaunchResult {
  success: boolean;
  launchedTokens: Array<{
    cardId: string;
    tokenAddress: string;
    contractAddress: string;
    zoraUrl: string;
    initialTokens: number;
    allocation: number;
  }>;
  bridgeDetails: {
    oofUsed: number;
    ethReceived: number;
    bridgeFee: number;
  };
  error?: string;
}

export class ZoraCoinLauncher {
  private baseClient;
  private solanaConnection: Connection;
  private oofToEthRate: number = 0.0025;
  
  // Zora Protocol Contracts on Base
  private readonly ZORA_1155_FACTORY = '0x777777C338d93e2C7adf08D102d45CA7CC4Ed021';
  private readonly ZORA_COINS_PROTOCOL = '0x32D419E1d0Bd5A877C2F8B69EB7F9A1B6F5BdDfF';

  constructor() {
    this.baseClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );
  }

  async launchOOFMomentsAsTokens(request: ZoraLaunchRequest): Promise<ZoraLaunchResult> {
    try {
      // Step 1: Bridge $OOF tokens to Base network ETH
      const bridgeResult = await this.bridgeOOFToETH(
        request.oofInvestmentAmount,
        request.userWalletAddress
      );

      if (!bridgeResult.success) {
        throw new Error('Failed to bridge $OOF tokens to Base network');
      }

      // Step 2: Calculate allocations for each card
      const allocations = this.calculateAllocations(
        bridgeResult.ethReceived,
        request.distribution
      );

      // Step 3: Launch each card as a separate token on Zora
      const launchedTokens = await Promise.all(
        request.cards.map((card, index) =>
          this.launchSingleOOFToken(card, allocations[index])
        )
      );

      // Step 4: Create social media posts for each launched token
      await this.createSocialPosts(launchedTokens);

      return {
        success: true,
        launchedTokens,
        bridgeDetails: {
          oofUsed: request.oofInvestmentAmount,
          ethReceived: bridgeResult.ethReceived,
          bridgeFee: bridgeResult.bridgeFee
        }
      };

    } catch (error) {
      console.error('Failed to launch OOF moments as tokens:', error);
      return {
        success: false,
        launchedTokens: [],
        bridgeDetails: { oofUsed: 0, ethReceived: 0, bridgeFee: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async bridgeOOFToETH(
    oofAmount: number,
    userWallet: string
  ): Promise<{ success: boolean; ethReceived: number; bridgeFee: number }> {
    try {
      // Calculate bridge parameters
      const bridgeFee = oofAmount * 0.03; // 3% bridge fee
      const netOofAmount = oofAmount - bridgeFee;
      const ethReceived = netOofAmount * this.oofToEthRate;

      // In production, integrate with Wormhole or LayerZero
      // For now, simulate the bridge process with Jupiter aggregator

      // Step 1: Swap $OOF to SOL on Solana
      const solAmount = await this.swapOOFToSOL(netOofAmount, userWallet);
      
      // Step 2: Bridge SOL to ETH on Base via Wormhole
      const finalEthAmount = await this.bridgeSOLToETH(solAmount, userWallet);

      return {
        success: true,
        ethReceived: finalEthAmount,
        bridgeFee
      };

    } catch (error) {
      console.error('Bridge operation failed:', error);
      return { success: false, ethReceived: 0, bridgeFee: 0 };
    }
  }

  private async swapOOFToSOL(oofAmount: number, userWallet: string): Promise<number> {
    // Simulate Jupiter aggregator swap
    // In production, use actual Jupiter API
    const mockSolReceived = oofAmount * 0.15; // Mock exchange rate
    
    console.log(`Swapped ${oofAmount} $OOF to ${mockSolReceived} SOL`);
    return mockSolReceived;
  }

  private async bridgeSOLToETH(solAmount: number, userWallet: string): Promise<number> {
    // Simulate Wormhole bridge
    // In production, use actual Wormhole SDK
    const mockEthReceived = solAmount * 0.0045; // Mock SOL to ETH rate
    
    console.log(`Bridged ${solAmount} SOL to ${mockEthReceived} ETH on Base`);
    return mockEthReceived;
  }

  private calculateAllocations(totalEth: number, distribution: [number, number, number]): number[] {
    return distribution.map(percentage => (totalEth * percentage) / 100);
  }

  private async launchSingleOOFToken(
    card: OOFMomentCard,
    ethAllocation: number
  ): Promise<{
    cardId: string;
    tokenAddress: string;
    contractAddress: string;
    zoraUrl: string;
    initialTokens: number;
    allocation: number;
  }> {
    try {
      // Generate card image and metadata
      const cardImageUrl = await this.generateCardImage(card);
      const metadataUri = await this.uploadCardMetadata(card, cardImageUrl);

      // Create token using Zora protocol
      const tokenResult = await this.createZoraToken({
        name: `${card.tokenSymbol} OOF Moment`,
        symbol: card.tokenSymbol.toUpperCase(),
        description: `${card.narrative}\n\n"${card.quote}"\n\nOriginal wallet: ${card.walletAddress}`,
        metadataUri,
        initialLiquidity: ethAllocation,
        maxSupply: 1000000, // 1M tokens
        creatorRoyalty: 500 // 5%
      });

      return {
        cardId: card.id,
        tokenAddress: tokenResult.tokenAddress,
        contractAddress: tokenResult.contractAddress,
        zoraUrl: `https://zora.co/collect/base:${tokenResult.contractAddress}`,
        initialTokens: tokenResult.initialTokens,
        allocation: ethAllocation
      };

    } catch (error) {
      console.error(`Failed to launch token for card ${card.id}:`, error);
      throw error;
    }
  }

  private async generateCardImage(card: OOFMomentCard): Promise<string> {
    const colors = this.getCardColors(card.type);
    
    // Generate SVG card
    const svg = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="600" fill="url(#cardGradient)" rx="20"/>
        
        <!-- Header -->
        <text x="200" y="60" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${card.title}</text>
        
        <!-- Main Icon -->
        <text x="200" y="200" text-anchor="middle" font-size="80" filter="url(#glow)">${card.metadata.emoji}</text>
        
        <!-- Token Symbol -->
        <text x="200" y="280" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${card.tokenSymbol}</text>
        
        <!-- Quote -->
        <text x="200" y="320" text-anchor="middle" fill="white" font-size="14" opacity="0.9">"${card.quote}"</text>
        
        <!-- Rarity Badge -->
        <rect x="150" y="380" width="100" height="30" fill="rgba(255,255,255,0.2)" rx="15"/>
        <text x="200" y="400" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${card.rarity}</text>
        
        <!-- OOF Moment ID -->
        <text x="200" y="450" text-anchor="middle" fill="white" font-size="10" opacity="0.7">OOF Moment</text>
        
        <!-- Wallet Address (truncated) -->
        <text x="200" y="520" text-anchor="middle" fill="white" font-size="10" opacity="0.6">${card.walletAddress.slice(0, 8)}...${card.walletAddress.slice(-8)}</text>
        
        <!-- Zora Branding -->
        <text x="200" y="570" text-anchor="middle" fill="white" font-size="8" opacity="0.5">Powered by Zora</text>
      </svg>
    `;

    // Convert to base64 data URL
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  private getCardColors(type: string): { primary: string; secondary: string } {
    switch (type) {
      case 'paper_hands':
        return { primary: '#ff6b6b', secondary: '#ff8787' };
      case 'dust_collector':
        return { primary: '#868e96', secondary: '#adb5bd' };
      case 'gains_master':
        return { primary: '#51cf66', secondary: '#69db7c' };
      default:
        return { primary: '#748ffc', secondary: '#91a7ff' };
    }
  }

  private async uploadCardMetadata(card: OOFMomentCard, imageUrl: string): Promise<string> {
    const metadata = {
      name: `${card.tokenSymbol} OOF Moment`,
      description: card.narrative,
      image: imageUrl,
      animation_url: imageUrl, // Could be animated version
      attributes: [
        { trait_type: 'Type', value: card.type },
        { trait_type: 'Rarity', value: card.rarity },
        { trait_type: 'Original Token', value: card.tokenName },
        { trait_type: 'Moment Type', value: card.metadata.momentType },
        { trait_type: 'Wallet', value: card.walletAddress.slice(0, 8) },
        ...card.metadata.attributes
      ],
      properties: {
        category: 'OOF Moment',
        creators: [{ address: card.walletAddress, share: 100 }]
      }
    };

    // In production, upload to IPFS via Pinata or similar
    const mockIpfsHash = `Qm${Array.from({length: 44}, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('')}`;
    
    return `ipfs://${mockIpfsHash}`;
  }

  private async createZoraToken(params: {
    name: string;
    symbol: string;
    description: string;
    metadataUri: string;
    initialLiquidity: number;
    maxSupply: number;
    creatorRoyalty: number;
  }): Promise<{
    tokenAddress: string;
    contractAddress: string;
    initialTokens: number;
  }> {
    try {
      // Calculate token parameters
      const tokenPrice = params.initialLiquidity / 100000; // Price per token
      const initialTokens = Math.floor(params.initialLiquidity / tokenPrice);

      // In production, use actual Zora Protocol SDK
      // This would involve calling the Zora 1155 factory contract
      const contractCreationData = encodeFunctionData({
        abi: [{
          name: 'setupNewTokenWithCreateReferral',
          type: 'function',
          inputs: [
            { name: 'tokenURI', type: 'string' },
            { name: 'maxSupply', type: 'uint256' },
            { name: 'recipient', type: 'address' },
            { name: 'royaltyBPS', type: 'uint16' },
            { name: 'fundsRecipient', type: 'address' },
            { name: 'salesConfig', type: 'tuple' },
            { name: 'createReferral', type: 'address' }
          ]
        }],
        functionName: 'setupNewTokenWithCreateReferral',
        args: [
          params.metadataUri,
          BigInt(params.maxSupply),
          '0x0000000000000000000000000000000000000000', // recipient
          params.creatorRoyalty,
          '0x0000000000000000000000000000000000000000', // funds recipient
          {
            publicSalePrice: parseEther(tokenPrice.toString()),
            maxSalePurchasePerAddress: BigInt(10000),
            publicSaleStart: BigInt(Math.floor(Date.now() / 1000)),
            publicSaleEnd: BigInt(Math.floor(Date.now() / 1000) + 86400 * 365),
            presaleStart: BigInt(0),
            presaleEnd: BigInt(0),
            presaleMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
          },
          '0x0000000000000000000000000000000000000000' // create referral
        ]
      });

      // Generate mock addresses for demonstration
      const mockContractAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      console.log(`Created Zora token: ${params.name} (${params.symbol})`);
      console.log(`Contract: ${mockContractAddress}`);
      console.log(`Initial tokens: ${initialTokens}`);

      return {
        tokenAddress: mockContractAddress,
        contractAddress: mockContractAddress,
        initialTokens
      };

    } catch (error) {
      console.error('Failed to create Zora token:', error);
      throw error;
    }
  }

  private async createSocialPosts(launchedTokens: any[]): Promise<void> {
    // Create shareable social media posts for each launched token
    for (const token of launchedTokens) {
      console.log(`Creating social post for token: ${token.tokenAddress}`);
      
      // In production, this would integrate with social APIs
      // For now, just log the social media content
      const socialContent = {
        twitter: `🚀 Just launched my OOF Moment as a token on @zora! ${token.zoraUrl}`,
        telegram: `Check out my crypto trading story turned into a token: ${token.zoraUrl}`,
        discord: `New OOF Moment token launched! Contract: ${token.contractAddress}`
      };
      
      console.log('Social media content generated:', socialContent);
    }
  }

  // Public method for sharing individual moments
  async shareOOFMoment(
    momentId: string, 
    platform: 'twitter' | 'telegram' | 'discord'
  ): Promise<{ shareUrl: string; success: boolean }> {
    try {
      const baseUrl = process.env.APP_URL || 'https://oof-moments.app';
      const momentUrl = `${baseUrl}/moment/${momentId}`;
      
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=Check%20out%20my%20OOF%20Moment!%20%F0%9F%92%8E&url=${encodeURIComponent(momentUrl)}&hashtags=OOFMoments,Crypto,Zora`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(momentUrl)}&text=Check%20out%20my%20crypto%20OOF%20moment!`,
        discord: momentUrl // Discord shows auto-embed
      };

      return {
        shareUrl: shareUrls[platform],
        success: true
      };
    } catch (error) {
      return { shareUrl: '', success: false };
    }
  }

  // Get token statistics from Zora
  async getTokenStats(contractAddress: string): Promise<{
    totalSupply: number;
    owners: number;
    floorPrice: number;
    volume24h: number;
  }> {
    try {
      // In production, query Zora API or contract directly
      // For now, return mock data
      return {
        totalSupply: Math.floor(Math.random() * 100000),
        owners: Math.floor(Math.random() * 1000),
        floorPrice: Math.random() * 0.01,
        volume24h: Math.random() * 10
      };
    } catch (error) {
      console.error('Failed to get token stats:', error);
      return { totalSupply: 0, owners: 0, floorPrice: 0, volume24h: 0 };
    }
  }
}