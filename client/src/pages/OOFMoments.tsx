import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain,
  Palette,
  Network,
  CheckCircle,
  Clock,
  Heart, 
  MessageCircle, 
  Share2, 
  Download, 
  Trophy,
  Zap,
  Star,
  ExternalLink,
  Crown,
  Rocket,
  Target,
  DollarSign,
  Loader2,
  Send,
  ArrowUp,
  ArrowDown,
  Eye,
  Users,
  Gem,
  Coins,
  Reply,
  MoreHorizontal,
  Copy,
  X,
  RefreshCw
} from 'lucide-react';

// Types for the OOF Moments system
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
    background: string;
    emoji: string;
    textColor: string;
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  socialStats: {
    upvotes: number;
    downvotes: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  hashtags: string[];
  zoraAddress?: string;
  isPublic: boolean;
  createdAt: Date;
}

interface Comment {
  id: number;
  momentId: number;
  userId: string;
  username: string;
  content: string;
  replies: Comment[];
  likes: number;
  createdAt: Date;
}

interface GenerationProgress {
  stage: 'analyzing' | 'detecting' | 'designing' | 'posting' | 'complete';
  progress: number;
  message: string;
  agentActive: string;
}

// AI Agent Status Component
const AIAgentStatus: React.FC<{ progress: GenerationProgress }> = ({ progress }) => {
  const agents = [
    { id: 'scout', name: 'Scout Agent', icon: Brain, description: 'Scanning wallet history' },
    { id: 'director', name: 'Director Agent', icon: Target, description: 'Crafting narratives' },
    { id: 'artist', name: 'Art Agent', icon: Palette, description: 'Designing visuals' },
    { id: 'publisher', name: 'Zora Agent', icon: Network, description: 'Publishing to Zora' }
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-700">
      <div className="flex items-center mb-4">
        <Sparkles className="text-yellow-400 mr-2 animate-pulse" />
        <h3 className="text-xl font-bold">AI Agents Working</h3>
      </div>
      
      <Progress value={progress.progress} className="mb-4" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = progress.agentActive === agent.id;
          const isComplete = progress.progress > (agents.indexOf(agent) + 1) * 25;
          
          return (
            <div
              key={agent.id}
              className={`p-4 rounded-lg border transition-all ${
                isActive 
                  ? 'border-yellow-400 bg-yellow-400/10 animate-pulse' 
                  : isComplete
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-600 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center mb-2">
                <Icon className={`mr-2 ${isActive ? 'text-yellow-400' : isComplete ? 'text-green-400' : 'text-gray-400'}`} />
                {isComplete && <CheckCircle className="text-green-400 ml-auto" size={16} />}
                {isActive && <Clock className="text-yellow-400 ml-auto animate-spin" size={16} />}
              </div>
              <h4 className="font-semibold text-sm">{agent.name}</h4>
              <p className="text-xs text-gray-400">{agent.description}</p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-purple-300">{progress.message}</p>
      </div>
    </div>
  );
};

// Enhanced OOF Card Component with unique voting system
const OOFCard: React.FC<{ 
  moment: OOFMoment; 
  isOwner: boolean; 
  onInteraction: (type: string, momentId: number) => void;
}> = ({ moment, isOwner, onInteraction }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-2xl shadow-yellow-500/50';
      case 'epic': return 'shadow-xl shadow-purple-500/50';
      case 'rare': return 'shadow-lg shadow-blue-500/50';
      default: return '';
    }
  };

  const handleVote = (voteType: 'up' | 'down') => {
    setUserVote(userVote === voteType ? null : voteType);
    onInteraction(voteType === 'up' ? 'upvote' : 'downvote', moment.id);
  };

  const handleDownloadOrZora = () => {
    if (isOwner) {
      // Trigger HD PNG download
      onInteraction('download', moment.id);
    } else {
      // Redirect to Zora token purchase
      if (moment.zoraAddress) {
        window.open(`https://zora.co/collect/base:${moment.zoraAddress}`, '_blank');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${moment.cardMetadata.gradientFrom} ${moment.cardMetadata.gradientTo} rounded-xl p-6 text-white ${getRarityGlow(moment.rarity)} border border-white/20`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{moment.cardMetadata.emoji}</span>
          <div>
            <h3 className="text-xl font-bold flex items-center">
              {moment.title}
              {moment.rarity === 'legendary' && <Crown className="ml-2 text-yellow-400" size={20} />}
            </h3>
            <p className="text-white/70 text-sm">{moment.description}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-white/20">
          {moment.rarity}
        </Badge>
      </div>

      {/* AI-Generated Quote */}
      <div className="mb-4 p-4 bg-black/20 rounded-lg border-l-4 border-white/50">
        <p className="text-lg italic">"{moment.quote}"</p>
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {moment.hashtags.map((tag) => (
          <span
            key={tag}
            className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Unique Social Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex items-center space-x-4">
          {/* Unique Rocket/Target Voting System */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('up')}
            className={`flex items-center space-x-1 transition-colors ${
              userVote === 'up' ? 'text-green-400' : 'text-white/60 hover:text-green-400'
            }`}
          >
            <Rocket size={20} />
            <span>{moment.socialStats.upvotes}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('down')}
            className={`flex items-center space-x-1 transition-colors ${
              userVote === 'down' ? 'text-red-400' : 'text-white/60 hover:text-red-400'
            }`}
          >
            <Target size={20} />
            <span>{moment.socialStats.downvotes}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-white/60 hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={20} />
            <span>{moment.socialStats.comments}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => onInteraction('like', moment.id)}
            className="flex items-center space-x-1 text-white/60 hover:text-pink-400 transition-colors"
          >
            <Heart size={20} />
            <span>{moment.socialStats.likes}</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => onInteraction('share', moment.id)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Share2 size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleDownloadOrZora}
            className={`transition-colors ${
              isOwner 
                ? 'text-white/60 hover:text-green-400' 
                : 'text-white/60 hover:text-yellow-400'
            }`}
            title={isOwner ? 'Download HD PNG' : 'Buy on Zora'}
          >
            {isOwner ? <Download size={20} /> : <Coins size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/20"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                onClick={() => {
                  if (newComment.trim()) {
                    onInteraction('comment', moment.id);
                    setNewComment('');
                  }
                }}
                size="sm"
                className="bg-white/20 hover:bg-white/30"
              >
                <Send size={16} />
              </Button>
            </div>
            
            {/* Comment list would go here */}
            <div className="space-y-3">
              {/* Placeholder for comments */}
              <div className="text-white/60 text-sm text-center py-4">
                Be the first to comment on this OOF Moment!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Real-time Community Feed Component
const CommunityFeed: React.FC = () => {
  const { data: publicMoments = [], isLoading } = useQuery({
    queryKey: ['/api/oof-moments/public'],
    queryFn: async () => {
      const response = await fetch('/api/oof-moments/public');
      if (!response.ok) throw new Error('Failed to fetch public moments');
      return response.json();
    },
    refetchInterval: 5000 // Refresh every 5 seconds for real-time updates
  });

  const handleInteraction = (type: string, momentId: number) => {
    console.log(`${type} interaction on moment ${momentId}`);
    // Handle social interactions
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading community moments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community OOF Moments</h2>
        <div className="flex items-center space-x-2 text-sm text-purple-300">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Feed</span>
        </div>
      </div>
      
      {publicMoments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicMoments.map((moment: OOFMoment) => (
            <OOFCard
              key={moment.id}
              moment={moment}
              isOwner={false}
              onInteraction={handleInteraction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-purple-900/30 rounded-xl border border-purple-700">
          <Trophy className="mx-auto text-yellow-400 h-16 w-16 mb-4" />
          <h3 className="text-2xl font-bold mb-2">No OOF Moments Yet</h3>
          <p className="text-purple-300">Be the first to analyze a wallet and create legendary OOF Moments!</p>
        </div>
      )}
    </div>
  );
};

// Main OOF Moments Page Component
export default function OOFMomentsPage() {
  const { user } = useDynamicContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'analyzing',
    progress: 0,
    message: 'Initializing AI agents...',
    agentActive: 'scout'
  });
  const [generatedMoments, setGeneratedMoments] = useState<OOFMoment[]>([]);

  // Fetch user's OOF Moments
  const { data: userMoments = [], isLoading: loadingUser } = useQuery({
    queryKey: ['/api/oof-moments/user', user?.userId],
    queryFn: async () => {
      const response = await fetch(`/api/oof-moments/user/${user?.userId}`);
      if (!response.ok) throw new Error('Failed to fetch user moments');
      return response.json();
    },
    enabled: !!user?.userId
  });

  // AI Analysis Mutation
  const analyzeWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest('POST', '/api/ai/analyze-wallet', { walletAddress: address });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedMoments(data);
      setActiveTab('my_moments');
      toast({
        title: 'Analysis Complete!',
        description: `Generated ${data.length} legendary OOF Moments`
      });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze wallet. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: 'Wallet Required',
        description: 'Please enter a Solana wallet address',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({
      stage: 'analyzing',
      progress: 10,
      message: 'Scout Agent scanning wallet history...',
      agentActive: 'scout'
    });

    // Simulate multi-agent workflow
    const progressSteps = [
      { stage: 'analyzing', progress: 25, message: 'Analyzing transaction patterns...', agentActive: 'scout' },
      { stage: 'detecting', progress: 50, message: 'Director Agent crafting narratives...', agentActive: 'director' },
      { stage: 'designing', progress: 75, message: 'Art Agent designing visual themes...', agentActive: 'artist' },
      { stage: 'posting', progress: 90, message: 'Zora Agent preparing token launch...', agentActive: 'publisher' },
      { stage: 'complete', progress: 100, message: 'OOF Moments ready!', agentActive: 'publisher' }
    ] as const;

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationProgress(progressSteps[i]);
    }

    // Execute the actual analysis
    analyzeWalletMutation.mutate(walletAddress);
    setIsGenerating(false);
  };

  const handleInteraction = (type: string, momentId: number) => {
    console.log(`${type} interaction on moment ${momentId}`);
    // Handle social interactions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent mb-4"
          >
            OOF Moments
          </motion.h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Transform your crypto trading stories into shareable social media moments and launch them as tokens on Zora
          </p>
        </div>

        {/* AI Generator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-700">
            <div className="flex items-center mb-6">
              <Sparkles className="text-yellow-400 mr-3 text-2xl" />
              <h2 className="text-2xl font-bold">AI-Powered OOF Moments Generator</h2>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter Solana wallet address here"
                className="flex-1 bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-300"
                disabled={isGenerating}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isGenerating || !walletAddress.trim()}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-8 py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" />
                    AI Analyze
                  </>
                )}
              </Button>
            </div>

            {/* AI Agent Status */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <AIAgentStatus progress={generationProgress} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-purple-900/50 border border-purple-700">
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-700">
              <Users className="mr-2" size={20} />
              Discover
            </TabsTrigger>
            <TabsTrigger value="my_moments" className="data-[state=active]:bg-purple-700">
              <Star className="mr-2" size={20} />
              My Moments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <CommunityFeed />
          </TabsContent>

          <TabsContent value="my_moments">
            {loadingUser ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin mr-2" />
                <span>Loading your moments...</span>
              </div>
            ) : userMoments.length > 0 || generatedMoments.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Your OOF Moments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...generatedMoments, ...userMoments].map((moment: OOFMoment) => (
                    <OOFCard
                      key={moment.id}
                      moment={moment}
                      isOwner={true}
                      onInteraction={handleInteraction}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-purple-900/30 rounded-xl border border-purple-700">
                <Trophy className="mx-auto text-yellow-400 h-16 w-16 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Analyze a Wallet to See Your Moments!</h3>
                <p className="text-purple-300">Enter a Solana wallet address above to generate your legendary OOF Moments</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}