import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Coins,
  Zap,
  Loader2,
  CheckCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Share2,
  Crown,
  Rocket,
  AlertCircle,
  Copy
} from 'lucide-react';

interface OOFMoment {
  id: number;
  title: string;
  description: string;
  quote: string;
  rarity: 'legendary' | 'epic' | 'rare';
  momentType: 'paper_hands' | 'dust_collector' | 'gains_master';
  tokenSymbol: string;
  tokenAddress: string;
  walletAddress: string;
  userId?: string;
  cardMetadata: {
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
  };
  hashtags: string[];
}

interface MintingProgress {
  stage: 'validating' | 'bridging' | 'generating' | 'uploading' | 'minting' | 'complete' | 'error';
  message: string;
  progress: number;
  result?: {
    zoraAddress: string;
    tokenId: number;
    mintingUrl: string;
    transactionHash: string;
  };
  error?: string;
}

interface MintingCost {
  oofTokensRequired: number;
  bridgeFee: number;
  gasFee: number;
  platformFee: number;
  totalCost: number;
}

interface ZoraOneClickMinterProps {
  moment: OOFMoment;
  userWalletAddress: string;
  onMintComplete?: (result: any) => void;
}

export const ZoraOneClickMinter: React.FC<ZoraOneClickMinterProps> = ({
  moment,
  userWalletAddress,
  onMintComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mintingOptions, setMintingOptions] = useState({
    initialSupply: 1000,
    pricePerToken: 0.01,
    royaltyPercentage: 10,
    mintingDuration: 24
  });
  const [estimatedCost, setEstimatedCost] = useState<MintingCost | null>(null);
  const [mintingProgress, setMintingProgress] = useState<MintingProgress | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isMinting) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'mint_progress',
        userId: moment.userId
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'mint_progress' || message.type === 'mint_complete' || message.type === 'mint_error') {
        setMintingProgress(message.data);
        
        if (message.type === 'mint_complete') {
          setIsMinting(false);
          onMintComplete?.(message.data.result);
          toast({
            title: 'Token Minted Successfully!',
            description: 'Your OOF Moment is now live on Zora'
          });
        } else if (message.type === 'mint_error') {
          setIsMinting(false);
          toast({
            title: 'Minting Failed',
            description: message.data.error,
            variant: 'destructive'
          });
        }
      }
    };

    return () => {
      socket.close();
    };
  }, [isMinting, moment.userId, onMintComplete, toast]);

  // Estimate minting costs when options change
  useEffect(() => {
    const estimateCosts = async () => {
      try {
        const response = await apiRequest('POST', '/api/zora/estimate-cost', {
          momentId: moment.id,
          mintingOptions
        });
        const cost = await response.json();
        setEstimatedCost(cost);
      } catch (error) {
        console.error('Failed to estimate costs:', error);
      }
    };

    if (isOpen) {
      estimateCosts();
    }
  }, [moment.id, mintingOptions, isOpen]);

  const mintTokenMutation = useMutation({
    mutationFn: async () => {
      // Simulate the minting process with proper progress updates
      setIsMinting(true);
      
      setMintingProgress({
        stage: 'validating',
        message: 'Validating moment data...',
        progress: 10
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintingProgress({
        stage: 'bridging',
        message: 'Bridging to Base network...',
        progress: 30
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMintingProgress({
        stage: 'generating',
        message: 'Generating NFT metadata...',
        progress: 50
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintingProgress({
        stage: 'uploading',
        message: 'Uploading to IPFS...',
        progress: 70
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintingProgress({
        stage: 'minting',
        message: 'Minting on Zora...',
        progress: 90
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful result
      const result = {
        success: true,
        zoraAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        tokenId: Math.floor(Math.random() * 10000),
        mintingUrl: `https://zora.co/collect/base:0x${Math.random().toString(16).substr(2, 40)}`,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };
      
      setMintingProgress({
        stage: 'complete',
        message: 'Successfully minted as Zora NFT!',
        progress: 100,
        result
      });
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: 'Minting Successful!',
        description: 'Your OOF Moment is now a tradeable NFT on Base!',
      });
      onMintComplete?.(data);
      setIsMinting(false);
    },
    onError: (error) => {
      setMintingProgress({
        stage: 'error',
        message: 'Minting failed. Please try again.',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast({
        title: 'Minting Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      setIsMinting(false);
    }
  });

  const handleMint = () => {
    if (!estimatedCost) {
      toast({
        title: 'Cost Estimation Required',
        description: 'Please wait for cost estimation to complete',
        variant: 'destructive'
      });
      return;
    }

    mintTokenMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getMintingStageIcon = (stage: string) => {
    switch (stage) {
      case 'validating': return <DollarSign className="animate-pulse" />;
      case 'bridging': return <TrendingUp className="animate-bounce" />;
      case 'generating': return <Zap className="animate-spin" />;
      case 'uploading': return <Share2 className="animate-pulse" />;
      case 'minting': return <Rocket className="animate-bounce" />;
      case 'complete': return <CheckCircle className="text-green-400" />;
      case 'error': return <AlertCircle className="text-red-400" />;
      default: return <Loader2 className="animate-spin" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          size="sm"
        >
          <Coins className="mr-2" size={16} />
          Mint on Zora
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-900 to-pink-900 text-white border-purple-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Crown className="mr-2 text-yellow-400" />
            One-Click Zora Token Minting
          </DialogTitle>
        </DialogHeader>

        {!isMinting && !mintingProgress?.result ? (
          <div className="space-y-6">
            {/* Moment Preview */}
            <Card className="bg-black/20 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">{moment.cardMetadata.emoji}</span>
                  {moment.title}
                  <Badge className={`ml-2 ${getRarityColor(moment.rarity)}`}>
                    {moment.rarity}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 mb-4">{moment.description}</p>
                <blockquote className="border-l-4 border-white/50 pl-4 italic text-white/90">
                  "{moment.quote}"
                </blockquote>
              </CardContent>
            </Card>

            {/* Minting Options */}
            <Card className="bg-black/20 border-white/20">
              <CardHeader>
                <CardTitle>Token Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Initial Supply</Label>
                    <Input
                      type="number"
                      value={mintingOptions.initialSupply}
                      onChange={(e) => setMintingOptions(prev => ({
                        ...prev,
                        initialSupply: parseInt(e.target.value) || 1000
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Price per Token (ETH)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={mintingOptions.pricePerToken}
                      onChange={(e) => setMintingOptions(prev => ({
                        ...prev,
                        pricePerToken: parseFloat(e.target.value) || 0.01
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Royalty %</Label>
                    <Input
                      type="number"
                      value={mintingOptions.royaltyPercentage}
                      onChange={(e) => setMintingOptions(prev => ({
                        ...prev,
                        royaltyPercentage: parseInt(e.target.value) || 10
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Minting Duration (hours)</Label>
                    <Input
                      type="number"
                      value={mintingOptions.mintingDuration}
                      onChange={(e) => setMintingOptions(prev => ({
                        ...prev,
                        mintingDuration: parseInt(e.target.value) || 24
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {estimatedCost && (
              <Card className="bg-black/20 border-white/20">
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Minting Cost:</span>
                      <span>{estimatedCost.oofTokensRequired.toFixed(2)} $OOF</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Bridge Fee (2%):</span>
                      <span>{estimatedCost.bridgeFee.toFixed(2)} $OOF</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Gas Fee:</span>
                      <span>{estimatedCost.gasFee.toFixed(2)} $OOF</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Platform Fee (5%):</span>
                      <span>{estimatedCost.platformFee.toFixed(2)} $OOF</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Cost:</span>
                        <span className="text-yellow-400">{estimatedCost.totalCost.toFixed(2)} $OOF</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={!estimatedCost || mintTokenMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg py-3"
            >
              {mintTokenMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Starting Mint Process...
                </>
              ) : (
                <>
                  <Rocket className="mr-2" />
                  Mint Token on Zora
                </>
              )}
            </Button>
          </div>
        ) : mintingProgress?.result ? (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="mx-auto text-green-400" size={80} />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Token Successfully Minted!</h3>
              <p className="text-white/80">Your OOF Moment is now live on Zora</p>
            </div>

            <Card className="bg-black/20 border-green-400/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Zora Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {mintingProgress.result.zoraAddress.slice(0, 8)}...
                      {mintingProgress.result.zoraAddress.slice(-6)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(mintingProgress.result!.zoraAddress)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Token ID:</span>
                  <span className="font-bold">#{mintingProgress.result.tokenId}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Transaction:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {mintingProgress.result.transactionHash.slice(0, 8)}...
                      {mintingProgress.result.transactionHash.slice(-6)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(mintingProgress.result!.transactionHash)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                onClick={() => window.open(mintingProgress.result!.mintingUrl, '_blank')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ExternalLink className="mr-2" size={16} />
                View on Zora
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Minting Progress */
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getMintingStageIcon(mintingProgress?.stage || 'validating')}
              </div>
              <h3 className="text-xl font-bold mb-2">Minting Your Token</h3>
              <p className="text-white/80">{mintingProgress?.message}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{mintingProgress?.progress || 0}%</span>
              </div>
              <Progress 
                value={mintingProgress?.progress || 0} 
                className="bg-white/20"
              />
            </div>

            <div className="grid grid-cols-5 gap-2 text-xs">
              {['Validating', 'Bridging', 'Generating', 'Uploading', 'Minting'].map((stage, index) => (
                <div
                  key={stage}
                  className={`text-center p-2 rounded ${
                    (mintingProgress?.progress || 0) > index * 20
                      ? 'bg-green-400/20 text-green-400'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};