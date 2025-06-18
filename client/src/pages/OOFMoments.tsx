import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Wallet, 
  Heart, 
  Share2, 
  Download, 
  Crown, 
  Trophy,
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Loader2
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
  cardMetadata: {
    background: string;
    emoji: string;
    textColor: string;
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  socialStats: {
    likes: number;
    shares: number;
    comments: number;
  };
  tags: string[];
  nftMinted: boolean;
  zoraUrl?: string;
  createdAt: string;
}

interface WalletAnalysis {
  walletAddress: string;
  totalTransactions: number;
  totalTokensTraded: number;
  dustTokensCount: number;
  paperHandsCount: number;
  profitableTokensCount: number;
  lastAnalyzed: string;
}

const OOFMoments: React.FC = () => {
  const { user, primaryWallet } = useDynamicContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [walletInput, setWalletInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<OOFMoment | null>(null);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [useAI, setUseAI] = useState(true);
  const [oofAmount, setOofAmount] = useState(10);
  const [cardDistribution, setCardDistribution] = useState({
    paperHands: 33,
    dustCollector: 33,
    gainsMaster: 34
  });
  const [exchangeRate, setExchangeRate] = useState(0.001);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [generatedMoments, setGeneratedMoments] = useState<any[]>([]);

  // Fetch public OOF Moments
  const { data: publicMoments, isLoading: loadingPublic } = useQuery({
    queryKey: ['/api/oof-moments/public'],
    enabled: activeTab === 'discover'
  });

  // Fetch user's OOF Moments
  const { data: userMoments, isLoading: loadingUser } = useQuery({
    queryKey: ['/api/oof-moments/user', user?.userId],
    enabled: activeTab === 'my-moments' && !!user?.userId
  });

  // AI-powered wallet analysis mutation
  const aiAnalyzeMutation = useMutation({
    mutationFn: async ({ walletAddress, useAI }: { walletAddress: string; useAI: boolean }) => {
      const endpoint = useAI ? '/api/oof-moments/ai-analyze' : '/api/oof-moments/analyze';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress,
          userId: user?.userId || null
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const moments = data.moments || [];
      setGeneratedMoments(moments);
      toast({
        title: data.aiGenerated ? "AI Analysis Complete!" : "Analysis Complete!",
        description: `Generated ${moments.length} unique OOF moment cards${data.aiGenerated ? ' using AI analysis' : ''}.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
      setActiveTab('discover');
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze wallet",
        variant: "destructive"
      });
    }
  });

  // Cross-chain purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ oofAmount, cardDistribution }: { oofAmount: number; cardDistribution: any }) => {
      const response = await fetch('/api/oof-moments/cross-chain-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: primaryWallet?.address,
          oofAmount,
          cardDistribution
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Initiated!",
        description: `Cross-chain purchase of $${oofAmount} OOF tokens initiated successfully.`
      });
      setShowPurchaseDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
        variant: "destructive"
      });
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ momentId, action }: { momentId: number; action: 'like' | 'unlike' }) => {
      return apiRequest(`/api/oof-moments/${momentId}/like`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.userId || 'anonymous',
          action
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ momentId, platform }: { momentId: number; platform: string }) => {
      return apiRequest(`/api/oof-moments/${momentId}/share`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.userId || 'anonymous',
          platform
        })
      });
    },
    onSuccess: (data) => {
      // Copy share URL to clipboard
      navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "Share Link Copied!",
        description: "Share URL copied to clipboard"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
    }
  });

  // Mint NFT mutation
  const mintMutation = useMutation({
    mutationFn: async (momentId: number) => {
      return apiRequest(`/api/oof-moments/${momentId}/mint`, {
        method: 'POST',
        body: JSON.stringify({
          userWalletAddress: primaryWallet?.address
        })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "NFT Minted Successfully!",
        description: "Your OOF Moment has been minted on Zora"
      });
      setShowMintDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive"
      });
    }
  });

  const handleAnalyzeWallet = async () => {
    if (!walletInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid Solana wallet address",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await analyzeMutation.mutateAsync(walletInput.trim());
      setWalletInput('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLike = (momentId: number, isLiked: boolean) => {
    likeMutation.mutate({
      momentId,
      action: isLiked ? 'unlike' : 'like'
    });
  };

  const handleShare = (momentId: number, platform: string) => {
    shareMutation.mutate({ momentId, platform });
  };

  const handleMint = (moment: OOFMoment) => {
    if (!primaryWallet?.address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive"
      });
      return;
    }
    setSelectedMoment(moment);
    setShowMintDialog(true);
  };

  const confirmMint = () => {
    if (selectedMoment) {
      mintMutation.mutate(selectedMoment.id);
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'epic': return <Trophy className="w-4 h-4 text-purple-500" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-500" />;
      default: return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper_hands': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'dust_collector': return <Wallet className="w-4 h-4 text-gray-500" />;
      case 'gains_master': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const OOFMomentCard: React.FC<{ moment: OOFMoment; showActions?: boolean }> = ({ 
    moment, 
    showActions = true 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        {/* Card Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${moment.cardMetadata.gradientFrom}, ${moment.cardMetadata.gradientTo})`
          }}
        />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRarityIcon(moment.rarity)}
              <Badge variant="outline" className="capitalize">
                {moment.rarity}
              </Badge>
              {getTypeIcon(moment.momentType)}
              <Badge variant="secondary" className="capitalize">
                {moment.momentType.replace('_', ' ')}
              </Badge>
            </div>
            {moment.nftMinted && (
              <Badge className="bg-purple-500 hover:bg-purple-600">
                <ExternalLink className="w-3 h-3 mr-1" />
                NFT
              </Badge>
            )}
          </div>
          
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{moment.cardMetadata.emoji}</span>
            {moment.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <p className="text-sm text-muted-foreground">{moment.description}</p>
          
          <blockquote className="border-l-4 border-primary pl-4 italic">
            "{moment.quote}"
          </blockquote>

          <div className="flex flex-wrap gap-2">
            {moment.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Token: {moment.tokenSymbol}</span>
            <span>
              {moment.walletAddress.slice(0, 4)}...{moment.walletAddress.slice(-4)}
            </span>
          </div>

          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(moment.id, false)}
                  className="flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" />
                  {moment.socialStats.likes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(moment.id, 'twitter')}
                  className="flex items-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
                  {moment.socialStats.shares}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {!moment.nftMinted && primaryWallet && (
                  <Button
                    size="sm"
                    onClick={() => handleMint(moment)}
                    disabled={mintMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Mint NFT
                  </Button>
                )}
                
                {moment.zoraUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(moment.zoraUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Zora
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Legendary OOF Moments
        </motion.h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Immortalize your trading triumphs and failures. Analyze any Solana wallet to generate 
          shareable OOF Moment cards and mint them as NFTs on Zora.
        </p>
      </div>

      {/* Wallet Analysis Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analyze Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Toggle */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-medium">AI-Powered Analysis</span>
                <span className="text-sm text-muted-foreground">(Using Perplexity AI)</span>
              </div>
              <Button
                variant={useAI ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAI(!useAI)}
              >
                {useAI ? "AI Mode" : "Standard"}
              </Button>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Enter Solana wallet address..."
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => aiAnalyzeMutation.mutate({ walletAddress: walletInput.trim(), useAI })}
                disabled={!walletInput.trim() || aiAnalyzeMutation.isPending}
                className="min-w-[120px]"
              >
                {aiAnalyzeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {useAI ? "AI Analyze" : "Analyze"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              {primaryWallet && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWalletInput(primaryWallet.address)}
                >
                  Use My Wallet
                </Button>
              )}
              
              {generatedMoments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPurchaseDialog(true)}
                  className="ml-auto"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Purchase with $OOF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-moments">My Moments</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Public OOF Moments</h2>
            <p className="text-sm text-muted-foreground">
              Latest trading fails and wins from the community
            </p>
          </div>

          {loadingPublic ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicMoments?.map((moment: OOFMoment) => (
                  <OOFMomentCard key={moment.id} moment={moment} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {!loadingPublic && (!publicMoments || publicMoments.length === 0) && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No OOF Moments Yet</h3>
              <p className="text-muted-foreground">
                Be the first to analyze a wallet and create legendary OOF Moments!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-moments" className="space-y-6">
          {!user ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Wallet Required</h3>
              <p className="text-muted-foreground">
                Connect your wallet to view and manage your OOF Moments
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">My OOF Moments</h2>
                <p className="text-sm text-muted-foreground">
                  Your personal collection of trading moments
                </p>
              </div>

              {loadingUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-6 bg-muted rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded"></div>
                          <div className="h-4 bg-muted rounded w-5/6"></div>
                          <div className="h-16 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userMoments?.map((moment: OOFMoment) => (
                    <OOFMomentCard key={moment.id} moment={moment} />
                  ))}
                </div>
              )}

              {!loadingUser && (!userMoments || userMoments.length === 0) && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Moments Created</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze a wallet to generate your first OOF Moments
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>
                    Start Analyzing
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Mint NFT Dialog */}
      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint OOF Moment as NFT</DialogTitle>
          </DialogHeader>
          
          {selectedMoment && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedMoment.cardMetadata.emoji}</div>
                <h3 className="font-semibold">{selectedMoment.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedMoment.description}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Minting Details:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Free minting on Base network via Zora</li>
                  <li>• Permanent ownership of your OOF Moment</li>
                  <li>• Tradeable on OpenSea and other NFT marketplaces</li>
                  <li>• Includes all original analysis metadata</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMintDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmMint} 
                  disabled={mintMutation.isPending}
                >
                  {mintMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Mint NFT
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cross-chain Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Purchase with $OOF Tokens
            </DialogTitle>
            <DialogDescription>
              Use $OOF tokens (Solana) to buy initial token percentages on Zora for your AI-generated OOF moment cards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* OOF Amount Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                OOF Amount ($1-100)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={oofAmount}
                onChange={(e) => setOofAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {(oofAmount * exchangeRate).toFixed(4)} USD
              </p>
            </div>

            {/* Card Distribution */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Card Distribution (%)
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">📄 Paper Hands</span>
                  <Input
                    type="number"
                    className="w-20"
                    value={cardDistribution.paperHands}
                    onChange={(e) => setCardDistribution(prev => ({
                      ...prev,
                      paperHands: Number(e.target.value)
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🗑️ Dust Collector</span>
                  <Input
                    type="number"
                    className="w-20"
                    value={cardDistribution.dustCollector}
                    onChange={(e) => setCardDistribution(prev => ({
                      ...prev,
                      dustCollector: Number(e.target.value)
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">💎 Gains Master</span>
                  <Input
                    type="number"
                    className="w-20"
                    value={cardDistribution.gainsMaster}
                    onChange={(e) => setCardDistribution(prev => ({
                      ...prev,
                      gainsMaster: Number(e.target.value)
                    }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {cardDistribution.paperHands + cardDistribution.dustCollector + cardDistribution.gainsMaster}%
              </p>
            </div>

            {/* Purchase Summary */}
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Purchase Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total $OOF:</span>
                  <span>${oofAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bridge Fee (3%):</span>
                  <span>${(oofAmount * 0.03).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Est. Zora Tokens:</span>
                  <span>{((oofAmount * 0.97) * 1000).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPurchaseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => purchaseMutation.mutate({ oofAmount, cardDistribution })}
              disabled={purchaseMutation.isPending || Math.abs((cardDistribution.paperHands + cardDistribution.dustCollector + cardDistribution.gainsMaster) - 100) > 0.01}
            >
              {purchaseMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OOFMoments;