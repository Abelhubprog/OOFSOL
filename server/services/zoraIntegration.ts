import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import type { OOFMoment } from '@shared/schema';

interface ZoraMintRequest {
  momentId: number;
  walletAddress: string;
  cardImageUrl: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
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

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
    
    this.baseUrl = 'https://api.zora.co/v1';
    this.apiKey = process.env.ZORA_API_KEY || '';
  }

  async mintOOFMoment(moment: OOFMoment, userWalletAddress: string): Promise<ZoraMintResponse> {
    try {
      // Generate card image
      const cardImageUrl = await this.generateCardImage(moment);
      
      // Prepare metadata
      const metadata = this.createNFTMetadata(moment, cardImageUrl);
      
      // Create collection if it doesn't exist
      const collectionAddress = await this.ensureOOFMomentsCollection();
      
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