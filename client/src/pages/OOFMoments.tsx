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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ZoraTokenLauncher } from '@/components/ZoraTokenLauncher';
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
  Loader2,
  MessageCircle,
  Rocket,
  DollarSign,
  Zap,
  Users,
  BarChart3,
  RefreshCw
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
    gradientFrom?: string;
    gradientTo?: string;
  };
  socialStats: {
    likes: number;
    shares: number;
    comments: number;
  };
  isPublic: boolean;
  createdAt: string;
  zoraUrl?: string;
  nftMinted?: boolean;
}

interface GeneratedCards {
  paperHands?: any;
  dustCollector?: any;
  gainsMaster?: any;
}

export default function OOFMomentsPage() {
  const { user, primaryWallet } = useDynamicContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCards>({});
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [showZoraLauncher, setShowZoraLauncher] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [commentText, setCommentText] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedMomentId, setSelectedMomentId] = useState<number | null>(null);

  // Fetch public OOF Moments
  const { data: publicMoments = [], isLoading: loadingPublic } = useQuery({
    queryKey: ['/api/oof-moments/public'],
    queryFn: () => apiRequest('/api/oof-moments/public')
  });

  // Fetch user's OOF Moments
  const { data: userMoments = [], isLoading: loadingUser } = useQuery({
    queryKey: ['/api/oof-moments/user', user?.userId],
    queryFn: () => apiRequest(`/api/oof-moments/user/${user?.userId}`),
    enabled: !!user?.userId
  });

  // Generate OOF Moments mutation
  const generateMutation = useMutation({
    mutationFn: async (walletAddr: string) => {
      setIsAnalyzing(true);
      const response = await fetch('/api/ai/analyze-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze wallet');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCards(data.cards || {});
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete!",
        description: "Your OOF Moments have been generated successfully."
      });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze wallet",
        variant: "destructive"
      });
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ momentId, action }: { momentId: number; action: 'like' | 'unlike' }) => {
      const response = await fetch(`/api/oof-moments/${momentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId || 'anonymous',
          action
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ momentId, platform }: { momentId: number; platform: string }) => {
      const response = await fetch(`/api/oof-moments/${momentId}/share-social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.shareUrl) {
        window.open(data.shareUrl, '_blank');
        toast({
          title: "Shared Successfully!",
          description: `Opened ${data.platform} share dialog`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ momentId, comment }: { momentId: number; comment: string }) => {
      const response = await fetch(`/api/oof-moments/${momentId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId || 'anonymous',
          comment
        })
      });
      return response.json();
    },
    onSuccess: () => {
      setCommentText('');
      setShowCommentDialog(false);
      toast({
        title: "Comment Added!",
        description: "Your comment has been posted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/oof-moments'] });
    }
  });

  const handleAnalyze = () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Wallet Required",
        description: "Please enter a Solana wallet address to analyze",
        variant: "destructive"
      });
      return;
    }
    generateMutation.mutate(walletAddress);
  };

  const handleLaunchTokens = () => {
    const cards = Object.values(generatedCards).filter(Boolean);
    if (cards.length === 0) {
      toast({
        title: "No Cards Generated",
        description: "Please generate OOF Moments first",
        variant: "destructive"
      });
      return;
    }
    setSelectedCards(cards);
    setShowZoraLauncher(true);
  };

  const handleLike = (momentId: number) => {
    likeMutation.mutate({ momentId, action: 'like' });
  };

  const handleShare = (momentId: number, platform: string) => {
    shareMutation.mutate({ momentId, platform });
  };

  const handleComment = (momentId: number) => {
    setSelectedMomentId(momentId);
    setShowCommentDialog(true);
  };

  const submitComment = () => {
    if (selectedMomentId && commentText.trim()) {
      commentMutation.mutate({ 
        momentId: selectedMomentId, 
        comment: commentText.trim() 
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getMomentTypeEmoji = (type: string) => {
    switch (type) {
      case 'paper_hands': return '📄';
      case 'dust_collector': return '🗑️';
      case 'gains_master': return '💎';
      default: return '🚀';
    }
  };

  const getMomentTypeColor = (type: string) => {
    switch (type) {
      case 'paper_hands': return 'from-red-500 to-red-600';
      case 'dust_collector': return 'from-gray-500 to-gray-600';
      case 'gains_master': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const renderMomentCard = (moment: OOFMoment) => (
    <motion.div
      key={moment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300">
        {/* Card Header */}
        <div className={`h-48 bg-gradient-to-br ${getMomentTypeColor(moment.momentType)} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-80">{getMomentTypeEmoji(moment.momentType)}</span>
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className={`${getRarityColor(moment.rarity)} text-white`}>
              {moment.rarity}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {moment.tokenSymbol}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {moment.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {moment.description}
              </p>
            </div>

            {moment.quote && (
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-700 dark:text-gray-300">
                "{moment.quote}"
              </blockquote>
            )}

            {/* Wallet Info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Wallet className="h-3 w-3" />
              <span className="font-mono">
                {moment.walletAddress.slice(0, 8)}...{moment.walletAddress.slice(-8)}
              </span>
              <span>•</span>
              <span>{new Date(moment.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Zora Link */}
            {moment.zoraUrl && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Live on Zora</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(moment.zoraUrl, '_blank')}
                  className="ml-auto"
                >
                  View Token
                </Button>
              </div>
            )}

            {/* Social Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(moment.id)}
                  className="flex items-center gap-2 hover:text-red-500"
                >
                  <Heart className="h-4 w-4" />
                  <span>{moment.socialStats.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComment(moment.id)}
                  className="flex items-center gap-2 hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{moment.socialStats.comments}</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(moment.id, 'twitter')}
                    className="hover:text-blue-400"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-500">{moment.socialStats.shares}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(moment.walletAddress);
                    toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderGeneratedCard = (card: any, type: string) => (
    <Card key={type} className="overflow-hidden border-2 hover:border-purple-300 transition-all">
      <div className={`h-32 bg-gradient-to-br ${getMomentTypeColor(type)} flex items-center justify-center`}>
        <span className="text-4xl">{getMomentTypeEmoji(type)}</span>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">{card.title}</h4>
            <Badge variant="outline" className="text-xs">{card.rarity}</Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {card.description}
          </p>
          <div className="text-xs text-gray-500">
            Token: {card.tokenSymbol}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                OOF Moments
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Transform your crypto trading stories into shareable social media moments and launch them as tokens on Zora
            </p>
          </motion.div>
        </div>

        {/* Wallet Analyzer */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              AI-Powered OOF Moments Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter Solana wallet address..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
              />
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !walletAddress.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    AI Analyze
                  </div>
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={33} className="h-2" />
                <p className="text-sm text-purple-200">
                  AI agents are analyzing your wallet history...
                </p>
              </div>
            )}

            {/* Generated Cards Preview */}
            {Object.keys(generatedCards).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Your OOF Moments</h3>
                  <Button 
                    onClick={handleLaunchTokens}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch on Zora
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedCards.paperHands && renderGeneratedCard(generatedCards.paperHands, 'paper_hands')}
                  {generatedCards.dustCollector && renderGeneratedCard(generatedCards.dustCollector, 'dust_collector')}
                  {generatedCards.gainsMaster && renderGeneratedCard(generatedCards.gainsMaster, 'gains_master')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="discover" className="text-white data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="my-moments" className="text-white data-[state=active]:bg-white/20" disabled={!user}>
              <Star className="h-4 w-4 mr-2" />
              My Moments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Community OOF Moments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/oof-moments/public'] })}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {loadingPublic ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : publicMoments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {publicMoments.map(renderMomentCard)}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-sm border-white/10">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No OOF Moments Yet</h3>
                <p className="text-purple-200">
                  Be the first to analyze a wallet and create legendary OOF Moments!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-moments" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your OOF Moments</h2>
            
            {loadingUser ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : userMoments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userMoments.map(renderMomentCard)}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white/5 backdrop-blur-sm border-white/10">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Moments Created</h3>
                <p className="text-purple-200 mb-4">
                  Analyze your wallet to generate your first OOF Moments!
                </p>
                <Button
                  onClick={() => setActiveTab('discover')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Start Analyzing
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Zora Token Launcher Modal */}
        <ZoraTokenLauncher
          isOpen={showZoraLauncher}
          onClose={() => setShowZoraLauncher(false)}
          cards={selectedCards}
          userWallet={primaryWallet?.address}
        />

        {/* Comment Dialog */}
        <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Share your thoughts on this OOF Moment
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="What do you think about this OOF moment?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-20"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitComment}
                disabled={!commentText.trim() || commentMutation.isPending}
              >
                {commentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Post Comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}