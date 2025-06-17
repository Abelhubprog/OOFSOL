import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, MessageCircle, Share2, TrendingUp, 
  Star, Crown, Zap, Trophy, Flame,
  ThumbsUp, Eye, Clock, Target
} from "lucide-react";

interface SocialPost {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    rank: string;
    verified: boolean;
  };
  content: string;
  type: 'prediction' | 'trade' | 'meme' | 'achievement';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  tradingData?: {
    token: string;
    action: 'buy' | 'sell';
    amount: string;
    price: string;
    profit?: string;
  };
  predictionData?: {
    token: string;
    targetPrice: string;
    timeframe: string;
    confidence: number;
  };
}

interface TrendingTopic {
  id: string;
  name: string;
  posts: number;
  growth: string;
  icon: string;
}

export default function OOFSocial() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'leaderboard'>('feed');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following' | 'predictions' | 'trades'>('all');

  const socialPosts: SocialPost[] = [
    {
      id: 'post-1',
      user: {
        id: 'user-1',
        username: 'DiamondHands_Pro',
        avatar: '/api/placeholder/40/40',
        rank: 'Elite Trader',
        verified: true
      },
      content: 'Just made a 500% gain on $PEPE! Sometimes you gotta HODL through the FUD 💎🙌',
      type: 'trade',
      timestamp: '2 hours ago',
      likes: 1247,
      comments: 89,
      shares: 156,
      tags: ['#DiamondHands', '#PEPE', '#ToTheMoon'],
      tradingData: {
        token: '$PEPE',
        action: 'sell',
        amount: '1,000,000',
        price: '$0.00024',
        profit: '+$12,000'
      }
    },
    {
      id: 'post-2',
      user: {
        id: 'user-2',
        username: 'CryptoDetective',
        avatar: '/api/placeholder/40/40',
        rank: 'Rug Detector',
        verified: true
      },
      content: 'Warning: $SCAMCOIN showing all the red flags. 90% tokens held by top 10 wallets. Stay away!',
      type: 'prediction',
      timestamp: '4 hours ago',
      likes: 2156,
      comments: 234,
      shares: 445,
      tags: ['#RugPull', '#Warning', '#DYOR'],
      predictionData: {
        token: '$SCAMCOIN',
        targetPrice: '$0.00001',
        timeframe: '24h',
        confidence: 95
      }
    },
    {
      id: 'post-3',
      user: {
        id: 'user-3',
        username: 'MemeKing2024',
        avatar: '/api/placeholder/40/40',
        rank: 'Meme Legend',
        verified: false
      },
      content: 'When you buy the dip but it keeps dipping... 😭 Paper hands activated!',
      type: 'meme',
      timestamp: '6 hours ago',
      likes: 892,
      comments: 167,
      shares: 203,
      tags: ['#PaperHands', '#Meme', '#RelateableContent']
    }
  ];

  const trendingTopics: TrendingTopic[] = [
    { id: '1', name: '#DiamondHands', posts: 15420, growth: '+245%', icon: '💎' },
    { id: '2', name: '#RugPull', posts: 8934, growth: '+189%', icon: '🚨' },
    { id: '3', name: '#ToTheMoon', posts: 12567, growth: '+156%', icon: '🚀' },
    { id: '4', name: '#PaperHands', posts: 6789, growth: '+134%', icon: '📰' },
    { id: '5', name: '#HODL', posts: 9876, growth: '+98%', icon: '🔒' }
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Target className="h-4 w-4 text-blue-500" />;
      case 'trade': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      default: return <MessageCircle className="h-4 w-4 text-purple-500" />;
    }
  };

  const PostCard = ({ post }: { post: SocialPost }) => (
    <Card className="mb-6 card-hover">
      <CardContent className="p-6">
        {/* User Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{post.user.username.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-purple-900">{post.user.username}</span>
                {post.user.verified && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-600">
                <Badge variant="outline" className="text-xs">{post.user.rank}</Badge>
                <span>•</span>
                <span>{post.timestamp}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getPostTypeIcon(post.type)}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-purple-900 mb-3">{post.content}</p>
          
          {/* Trading Data */}
          {post.tradingData && (
            <div className="bg-green-50 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-green-600">Token</div>
                  <div className="font-bold text-green-900">{post.tradingData.token}</div>
                </div>
                <div>
                  <div className="text-sm text-green-600">Action</div>
                  <div className="font-bold text-green-900 capitalize">{post.tradingData.action}</div>
                </div>
                <div>
                  <div className="text-sm text-green-600">Amount</div>
                  <div className="font-bold text-green-900">{post.tradingData.amount}</div>
                </div>
                <div>
                  <div className="text-sm text-green-600">Profit</div>
                  <div className="font-bold text-green-900">{post.tradingData.profit || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Data */}
          {post.predictionData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-600">Token</div>
                  <div className="font-bold text-blue-900">{post.predictionData.token}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Target Price</div>
                  <div className="font-bold text-blue-900">{post.predictionData.targetPrice}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Timeframe</div>
                  <div className="font-bold text-blue-900">{post.predictionData.timeframe}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Confidence</div>
                  <div className="font-bold text-blue-900">{post.predictionData.confidence}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors">
              <Share2 className="h-4 w-4" />
              <span className="text-sm">{post.shares}</span>
            </button>
          </div>
          <Button size="sm" variant="outline" className="text-purple-600 border-purple-200">
            Follow Trade
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2 gradient-text">
            OOF Social Hub
          </h1>
          <p className="text-purple-600">
            Connect with traders, share insights, and follow the best performers
          </p>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="col-span-3">
            {/* Filter Tabs */}
            <div className="flex space-x-4 mb-6">
              {[
                { key: 'all', label: 'All Posts' },
                { key: 'following', label: 'Following' },
                { key: 'predictions', label: 'Predictions' },
                { key: 'trades', label: 'Trades' }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={selectedFilter === filter.key ? "default" : "outline"}
                  className={selectedFilter === filter.key 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'text-purple-600 border-purple-200 hover:bg-purple-50'
                  }
                  onClick={() => setSelectedFilter(filter.key as any)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Posts Feed */}
            <div>
              {socialPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Load More Posts
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-900 flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-orange-500" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map(topic => (
                    <div key={topic.id} 
                         className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{topic.icon}</span>
                        <div>
                          <div className="font-bold text-purple-900">{topic.name}</div>
                          <div className="text-sm text-purple-600">
                            {topic.posts.toLocaleString()} posts
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {topic.growth}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                  <Button variant="outline" className="w-full text-purple-600 border-purple-200">
                    <Target className="mr-2 h-4 w-4" />
                    Share Prediction
                  </Button>
                  <Button variant="outline" className="w-full text-purple-600 border-purple-200">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Share Trade
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-900 flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'DiamondHands_Pro', profit: '+2,456%', followers: '45.2K' },
                    { name: 'CryptoWhale', profit: '+1,789%', followers: '32.1K' },
                    { name: 'MoonHunter', profit: '+1,234%', followers: '28.7K' }
                  ].map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-bold text-purple-900">{performer.name}</div>
                          <div className="text-sm text-purple-600">{performer.followers} followers</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{performer.profit}</div>
                        <Button size="sm" variant="outline" className="text-xs mt-1">
                          Follow
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}