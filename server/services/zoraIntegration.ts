import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import type { OOFMoment } from '@shared/schema';

interface ZoraTokenLaunchRequest {
  momentId: number;
  walletAddress: string;
  cardData: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    animationUrl?: string;
  };
  initialPurchaseAmount: number; // in $OOF tokens
  metadata: {
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
    rarity: string;
    momentType: string;
  };
}

interface ZoraTokenResponse {
  success: boolean;
  tokenAddress?: string;
  contractAddress?: string;
  transactionHash?: string;
  zoraUrl?: string;
  initialTokens?: number;
  error?: string;
  bridgeDetails?: {
    oofAmount: number;
    ethAmount: number;
    bridgeFee: number;
  };
}

interface CrossChainBridgeResult {
  success: boolean;
  ethReceived: number;
  bridgeFee: number;
  transactionHash: string;
}

interface ZoraMintRequest {
  momentId: number;
  walletAddress: string;
  cardImageUrl: string;
  metadata: any;
}

interface ZoraMintResponse {
  success: boolean;
  tokenId?: string;
  contractAddress?: string;
  transactionHash?: string;
  zoraUrl?: string;
  error?: string;
}

export class ZoraIntegrationService {
  private publicClient;
  private baseUrl: string;
  private apiKey: string;
  private zoraCoinContractAddress: string;
  private oofTokenExchangeRate: number;

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    this.baseUrl = 'https://api.zora.co/v1';
    this.apiKey = process.env.ZORA_API_KEY || '';
    this.zoraCoinContractAddress = '0xa6b280b42cb0b7c4a4f789ec6ccc3a7609a1bc99'; // Zora coin contract on Base
    this.oofTokenExchangeRate = 0.0025; // $OOF to ETH exchange rate
  }

  async launchOOFMomentToken(request: ZoraTokenLaunchRequest): Promise<ZoraTokenResponse> {
    try {
      // Step 1: Bridge $OOF tokens to Base network ETH
      const bridgeResult = await this.bridgeOOFToBase(
        request.initialPurchaseAmount,
        request.walletAddress
      );

      if (!bridgeResult.success) {
        throw new Error('Failed to bridge $OOF tokens to Base network');
      }

      // Step 2: Generate card image and animation
      const cardImageUrl = await this.generateOOFMomentCard(request);
      const animationUrl = await this.generateCardAnimation(request);
      
      // Step 3: Upload metadata to IPFS
      const metadataUri = await this.uploadMetadataToIPFS({
        name: request.cardData.name,
        description: request.cardData.description,
        image: cardImageUrl,
        animation_url: animationUrl,
        attributes: request.metadata.attributes,
        properties: {
          moment_type: request.metadata.momentType,
          rarity: request.metadata.rarity,
          creator: request.walletAddress
        }
      });

      // Step 4: Create token on Zora Protocol
      const tokenResult = await this.createZoraToken(
        request,
        metadataUri,
        bridgeResult.ethReceived
      );

      return {
        success: true,
        tokenAddress: tokenResult.tokenAddress,
        contractAddress: tokenResult.contractAddress,
        transactionHash: tokenResult.transactionHash,
        zoraUrl: `https://zora.co/collect/base:${tokenResult.contractAddress}`,
        initialTokens: tokenResult.initialTokens,
        bridgeDetails: {
          oofAmount: request.initialPurchaseAmount,
          ethAmount: bridgeResult.ethReceived,
          bridgeFee: bridgeResult.bridgeFee
        }
      };
    } catch (error) {
      console.error('Failed to launch OOF moment token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async bridgeOOFToBase(
    oofAmount: number,
    userWallet: string
  ): Promise<CrossChainBridgeResult> {
    try {
      // Calculate bridge parameters
      const bridgeFee = oofAmount * 0.03; // 3% bridge fee
      const netOofAmount = oofAmount - bridgeFee;
      const ethReceived = netOofAmount * this.oofTokenExchangeRate;

      // In production, this would integrate with Wormhole, LayerZero, or similar
      // For now, simulate the bridge process
      
      // Step 1: Lock $OOF tokens on Solana
      const lockTxHash = await this.lockOOFTokens(oofAmount, userWallet);
      
      // Step 2: Mint equivalent ETH on Base
      const mintTxHash = await this.mintETHOnBase(ethReceived, userWallet);

      return {
        success: true,
        ethReceived,
        bridgeFee,
        transactionHash: mintTxHash
      };
    } catch (error) {
      console.error('Bridge failed:', error);
      return {
        success: false,
        ethReceived: 0,
        bridgeFee: 0,
        transactionHash: ''
      };
    }
  }

  private async createZoraToken(
    request: ZoraTokenLaunchRequest,
    metadataUri: string,
    ethAmount: number
  ): Promise<{
    tokenAddress: string;
    contractAddress: string;
    transactionHash: string;
    initialTokens: number;
  }> {
    // Zora Protocol contract addresses on Base
    const ZORA_CREATOR_1155_IMPL = '0x1f7e4d2c6f8b6c0e91b6a3c1e9f8e3d2c1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5';
    const ZORA_DROP_FACTORY = '0x2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8';

    try {
      // Create ERC-1155 contract for the OOF moment
      const contractCreationData = encodeFunctionData({
        abi: [
          {
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
          }
        ],
        functionName: 'setupNewTokenWithCreateReferral',
        args: [
          metadataUri,
          BigInt(1000000), // 1M max supply
          request.walletAddress,
          500, // 5% royalty
          request.walletAddress,
          {
            publicSalePrice: parseEther((ethAmount / 100000).toString()), // Price per token
            maxSalePurchasePerAddress: BigInt(10000),
            publicSaleStart: BigInt(Math.floor(Date.now() / 1000)),
            publicSaleEnd: BigInt(Math.floor(Date.now() / 1000) + 86400 * 365),
            presaleStart: BigInt(0),
            presaleEnd: BigInt(0),
            presaleMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
          },
          '0x0000000000000000000000000000000000000000' // No create referral
        ]
      });

      // Calculate initial token purchase amount
      const tokenPrice = ethAmount / 100000;
      const initialTokens = Math.floor(ethAmount / tokenPrice);

      // Return simulated result for now
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockContractAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      return {
        tokenAddress: mockContractAddress,
        contractAddress: mockContractAddress,
        transactionHash: mockTxHash,
        initialTokens
      };
    } catch (error) {
      console.error('Failed to create Zora token:', error);
      throw error;
    }
  }

  private async generateOOFMomentCard(request: ZoraTokenLaunchRequest): Promise<string> {
    // Generate SVG card based on OOF moment data
    const { cardData, metadata } = request;
    
    const colors = this.getCardColors(metadata.momentType);
    const svg = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="600" fill="url(#bg)" rx="20"/>
        <text x="200" y="50" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${cardData.name}</text>
        <text x="200" y="300" text-anchor="middle" fill="white" font-size="48">${this.getEmojiForType(metadata.momentType)}</text>
        <text x="200" y="400" text-anchor="middle" fill="white" font-size="16" opacity="0.9">${cardData.symbol}</text>
        <text x="200" y="450" text-anchor="middle" fill="white" font-size="14" opacity="0.8">${metadata.rarity}</text>
        <text x="200" y="550" text-anchor="middle" fill="white" font-size="12" opacity="0.7">OOF Moment #${request.momentId}</text>
      </svg>
    `;

    // Convert SVG to base64 data URL
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  private async generateCardAnimation(request: ZoraTokenLaunchRequest): Promise<string> {
    // Generate animated GIF or video for the card
    // For now, return the static image
    return await this.generateOOFMomentCard(request);
  }

  private getCardColors(momentType: string): { primary: string; secondary: string } {
    switch (momentType) {
      case 'paper_hands':
        return { primary: '#ff6b6b', secondary: '#ffa8a8' };
      case 'dust_collector':
        return { primary: '#868e96', secondary: '#adb5bd' };
      case 'gains_master':
        return { primary: '#51cf66', secondary: '#69db7c' };
      default:
        return { primary: '#748ffc', secondary: '#91a7ff' };
    }
  }

  private getEmojiForType(momentType: string): string {
    switch (momentType) {
      case 'paper_hands':
        return '📄';
      case 'dust_collector':
        return '🗑️';
      case 'gains_master':
        return '💎';
      default:
        return '🚀';
    }
  }

  private async uploadMetadataToIPFS(metadata: any): Promise<string> {
    // In production, upload to IPFS via Pinata or similar
    // For now, return a mock IPFS URL
    const mockHash = `Qm${Array.from({length: 44}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    return `ipfs://${mockHash}`;
  }

  private async lockOOFTokens(amount: number, userWallet: string): Promise<string> {
    // Simulate locking $OOF tokens on Solana
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `${Array.from({length: 88}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
  }

  private async mintETHOnBase(ethAmount: number, userWallet: string): Promise<string> {
    // Simulate minting ETH on Base network
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  }

  // Social features for OOF Moments cards
  async shareToSocial(momentId: number, platform: string): Promise<{ shareUrl: string; success: boolean }> {
    try {
      const baseUrl = 'https://oof-moments.app';
      const shareUrl = `${baseUrl}/moment/${momentId}`;
      
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=Check out my OOF Moment!&url=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Check out my OOF Moment!`,
        discord: shareUrl // Discord uses embed
      };

      return {
        shareUrl: shareUrls[platform] || shareUrl,
        success: true
      };
    } catch (error) {
      return { shareUrl: '', success: false };
    }
  }

  async getZoraCollectionStats(contractAddress: string): Promise<{
    totalSupply: number;
    owners: number;
    floorPrice: number;
    volume: number;
  }> {
    try {
      // Query Zora API for collection stats
      const response = await fetch(`${this.baseUrl}/collections/${contractAddress}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collection stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get collection stats:', error);
      return { totalSupply: 0, owners: 0, floorPrice: 0, volume: 0 };
    }
  }

  // Main function to mint OOF Moment as NFT on Zora
  async mintOOFMoment(moment: OOFMoment, userWalletAddress: string): Promise<ZoraMintResponse> {
    try {
      // Generate card image
      const cardImageUrl = await this.generateCardImage(moment);
      
      // Create metadata
      const metadata = this.createNFTMetadata(moment, cardImageUrl);
      
      // Mint on Zora
      const mintResult = await this.createZoraMint({
        momentId: moment.id,
        walletAddress: userWalletAddress,
        cardImageUrl,
        metadata
      });

      return mintResult;

    } catch (error) {
      console.error('Error minting OOF Moment on Zora:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async generateCardImage(moment: OOFMoment): Promise<string> {
    // Generate OOF Moment card image using canvas or external service
    const cardData = {
      title: moment.title,
      description: moment.description,
      quote: moment.quote,
      rarity: moment.rarity,
      tokenSymbol: moment.tokenSymbol,
      cardMetadata: moment.cardMetadata,
      analysis: moment.analysis
    };

    // For now, create a simple image URL - in production, implement proper card generation
    const imageParams = new URLSearchParams({
      title: encodeURIComponent(moment.title),
      description: encodeURIComponent(moment.description),
      rarity: moment.rarity,
      type: moment.momentType,
      token: moment.tokenSymbol
    });

    return `${process.env.APP_URL || 'http://localhost:5000'}/api/oof-moments/card-image/${moment.id}?${imageParams}`;
  }

  private createNFTMetadata(moment: OOFMoment, imageUrl: string) {
    const analysis = moment.analysis as any;
    
    return {
      name: moment.title,
      description: `${moment.description}\n\n"${moment.quote}"\n\nGenerated from real Solana wallet analysis of ${moment.walletAddress}`,
      image: imageUrl,
      external_url: `${process.env.APP_URL || 'http://localhost:5000'}/moments/${moment.id}`,
      attributes: [
        {
          trait_type: "Moment Type",
          value: moment.momentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
        },
        {
          trait_type: "Rarity",
          value: moment.rarity.charAt(0).toUpperCase() + moment.rarity.slice(1)
        },
        {
          trait_type: "Token Symbol",
          value: moment.tokenSymbol || "UNKNOWN"
        },
        {
          trait_type: "Token Address",
          value: moment.tokenAddress
        },
        {
          trait_type: "Wallet Address",
          value: `${moment.walletAddress.slice(0, 6)}...${moment.walletAddress.slice(-4)}`
        },
        {
          trait_type: "Analysis Date",
          value: moment.createdAt ? new Date(moment.createdAt.toString()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        },
        ...this.generateAnalysisAttributes(analysis)
      ]
    };
  }

  private generateAnalysisAttributes(analysis: any): Array<{ trait_type: string; value: string }> {
    const attributes = [];
    
    if (analysis.metrics) {
      const metrics = analysis.metrics;
      
      if (metrics.lossMultiplier) {
        attributes.push({
          trait_type: "Loss Multiplier",
          value: `${metrics.lossMultiplier.toFixed(1)}x`
        });
      }
      
      if (metrics.gainMultiplier) {
        attributes.push({
          trait_type: "Gain Multiplier",
          value: `${metrics.gainMultiplier.toFixed(1)}x`
        });
      }
      
      if (metrics.totalDustTokens) {
        attributes.push({
          trait_type: "Dust Tokens Collected",
          value: metrics.totalDustTokens.toString()
        });
      }
    }
    
    return attributes;
  }

  private async ensureOOFMomentsCollection(): Promise<string> {
    // Check if OOF Moments collection exists on Zora
    const collectionName = "OOF Moments";
    const collectionDescription = "Legendary trading moments turned into immortal memes. Each OOF Moment is generated from real Solana wallet analysis, capturing paper hands, dust collecting, and gains mastery for posterity.";
    
    try {
      // First, try to find existing collection
      const existingCollection = await this.findExistingCollection(collectionName);
      if (existingCollection) {
        return existingCollection;
      }

      // Create new collection if it doesn't exist
      return await this.createCollection(collectionName, collectionDescription);
      
    } catch (error) {
      console.error('Error managing collection:', error);
      throw error;
    }
  }

  private async findExistingCollection(name: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const collection = data.collections?.find((c: any) => c.name === name);
      
      return collection?.address || null;
    } catch (error) {
      console.error('Error finding collection:', error);
      return null;
    }
  }

  private async createCollection(name: string, description: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          symbol: 'OOF',
          chain: 'base',
          royalty_percentage: 500, // 5% royalty
          royalty_recipient: process.env.ROYALTY_WALLET || '0x0000000000000000000000000000000000000000'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create collection: ${response.statusText}`);
      }

      const data = await response.json();
      return data.address;
      
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  private async createZoraMint(request: ZoraMintRequest): Promise<ZoraMintResponse> {
    try {
      // Upload metadata to IPFS via Zora
      const metadataResponse = await fetch(`${this.baseUrl}/metadata`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request.metadata)
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata');
      }

      const metadataData = await metadataResponse.json();
      const metadataUri = metadataData.uri;

      // Create the mint
      const mintResponse = await fetch(`${this.baseUrl}/mints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chain: 'base',
          to: request.walletAddress,
          metadata_uri: metadataUri,
          quantity: 1,
          mint_fee: '0', // Free minting on Zora
          collection_address: await this.ensureOOFMomentsCollection()
        })
      });

      if (!mintResponse.ok) {
        throw new Error(`Failed to create mint: ${mintResponse.statusText}`);
      }

      const mintData = await mintResponse.json();
      
      return {
        success: true,
        tokenId: mintData.token_id,
        contractAddress: mintData.contract_address,
        transactionHash: mintData.transaction_hash,
        zoraUrl: `https://zora.co/collections/${mintData.contract_address}/${mintData.token_id}`
      };

    } catch (error) {
      console.error('Error creating Zora mint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mint creation failed'
      };
    }
  }

  // Generate collection link for sharing
  getCollectionUrl(): string {
    return `https://zora.co/collections/base/oof-moments`;
  }

  // Get individual moment URL
  getMomentUrl(contractAddress: string, tokenId: string): string {
    return `https://zora.co/collections/${contractAddress}/${tokenId}`;
  }

  // Check mint status
  async getMintStatus(transactionHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    tokenId?: string;
    contractAddress?: string;
  }> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`
      });

      if (receipt.status === 'success') {
        // Extract token ID from logs if available
        const tokenId = this.extractTokenIdFromLogs(receipt.logs);
        
        return {
          status: 'confirmed',
          tokenId,
          contractAddress: receipt.to || undefined
        };
      } else {
        return { status: 'failed' };
      }
    } catch (error) {
      console.error('Error checking mint status:', error);
      return { status: 'pending' };
    }
  }

  private extractTokenIdFromLogs(logs: any[]): string | undefined {
    // Look for Transfer event logs to extract token ID
    for (const log of logs) {
      if (log.topics && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        // This is a Transfer event, token ID should be in topics[3]
        return log.topics[3] || undefined;
      }
    }
    return undefined;
  }

  // Batch mint multiple moments
  async batchMintMoments(moments: OOFMoment[], userWalletAddress: string): Promise<ZoraMintResponse[]> {
    const results: ZoraMintResponse[] = [];
    
    // Process in smaller batches to avoid rate limits
    for (let i = 0; i < moments.length; i += 3) {
      const batch = moments.slice(i, i + 3);
      const batchPromises = batch.map(moment => this.mintOOFMoment(moment, userWalletAddress));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Batch mint failed'
          });
        }
      }
      
      // Rate limiting between batches
      if (i + 3 < moments.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

export const zoraIntegration = new ZoraIntegrationService();