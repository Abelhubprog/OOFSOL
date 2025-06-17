import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Trophy, Star, ArrowUpCircle, ArrowDownCircle, Users,
  BarChart2, MessageCircle, Share2, Heart, Crown, Sparkles,
  Download, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OGProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  type: 'legendary' | 'epic' | 'rare';
  background: string;
  stats: {
    influence: number;
    followers: string;
    gems: number;
    accuracy: number;
    totalCalls: number;
    successfulCalls: Array<{
      coin: string;
      return: string;
      date: string;
    }>;
  };
  specialties: string[];
  achievements: Array<{
    name: string;
    icon: string;
    description: string;
  }>;
  oofBalance: string;
  stakingRewards: string;
  level: number;
  tierBadge: string;
  exclusive: boolean;
  tradingMetrics: {
    avgReturn: string;
    winRate: string;
    timeHorizon: string;
  };
}

interface TokenData {
  price: number;
  change24h: number;
  marketCap: string;
  volume24h: string;
  ogBackers: string[];
  orderbook: {
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
  };
}

export default function OOFLegends() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOG, setSelectedOG] = useState<OGProfile | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState('1H');
  const [tradingView, setTradingView] = useState('chart');
  const [showFrameGenerator, setShowFrameGenerator] = useState(false);
  const [showProfileSubmission, setShowProfileSubmission] = useState(false);
  const [displayMode, setDisplayMode] = useState('all');

  // Trading Interface State
  const [tradingState, setTradingState] = useState({
    selectedToken: 'OOF',
    amount: '',
    slippage: 1,
    gasOption: 'normal' as 'slow' | 'normal' | 'fast',
    recentTrades: []
  });

  // Sample OG Profiles Data
  const ogProfiles: OGProfile[] = [
    {
      id: "sol-wizard",
      name: "Sol Wizard",
      handle: "@SolWizard",
      avatar: "🧙‍♂️",
      type: "legendary",
      background: "bg-gradient-to-br from-purple-500 to-blue-600",
      stats: {
        influence: 98,
        followers: "250K+",
        gems: 15,
        accuracy: 92,
        totalCalls: 234,
        successfulCalls: [
          { coin: "BONK", return: "120x", date: "Dec 2023" },
          { coin: "MYRO", return: "50x", date: "Feb 2024" },
          { coin: "WIF", return: "40x", date: "Mar 2024" }
        ]
      },
      specialties: ["Early Adopter", "Community Leader", "Trend Setter"],
      achievements: [
        { name: "Diamond Mind", icon: "💎", description: "Never sold below 100x" },
        { name: "OG Legend", icon: "🏆", description: "Top 10 influencer" },
        { name: "Community Pillar", icon: "🏛️", description: "Built 3 major communities" }
      ],
      oofBalance: "1,000,000",
      stakingRewards: "50,000",
      level: 100,
      tierBadge: "🌟",
      exclusive: true,
      tradingMetrics: {
        avgReturn: "45x",
        winRate: "87%",
        timeHorizon: "2-5 days"
      }
    },
    {
      id: "meme-oracle",
      name: "Meme Oracle",
      handle: "@MemeOracle",
      avatar: "🔮",
      type: "epic",
      background: "bg-gradient-to-br from-purple-400 via-pink-500 to-red-500",
      stats: {
        influence: 92,
        followers: "180K+",
        gems: 12,
        accuracy: 85,
        totalCalls: 189,
        successfulCalls: [
          { coin: "PEPE", return: "80x", date: "Jan 2024" },
          { coin: "DOGE", return: "25x", date: "Mar 2024" }
        ]
      },
      specialties: ["Gem Finder", "Trend Analyst", "Meme Expert"],
      achievements: [
        { name: "Prophet", icon: "🧙‍♂️", description: "Predicted 10 100x gems" },
        { name: "Meme Lord", icon: "😎", description: "Created viral memes" }
      ],
      oofBalance: "500,000",
      stakingRewards: "25,000",
      level: 85,
      tierBadge: "⭐",
      exclusive: true,
      tradingMetrics: {
        avgReturn: "35x",
        winRate: "78%",
        timeHorizon: "1-3 days"
      }
    }
  ];

  // Token Market Data
  const tokenData: Record<string, TokenData> = {
    OOF: {
      price: 0.0045,
      change24h: 12.5,
      marketCap: "4.5M",
      volume24h: "850K",
      ogBackers: ["Sol Wizard", "Meme Oracle"],
      orderbook: {
        bids: [
          { price: 0.00449, size: 1000000 },
          { price: 0.00448, size: 2000000 },
          { price: 0.00447, size: 1500000 }
        ],
        asks: [
          { price: 0.00451, size: 1500000 },
          { price: 0.00452, size: 1800000 },
          { price: 0.00453, size: 2200000 }
        ]
      }
    }
  };

  // Profile Frame Generator Component
  const FrameGenerator = ({ profile }: { profile: OGProfile }) => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-purple-900">Generate Profile Frame</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frame Preview */}
        <div className={`${profile.background} rounded-xl p-6 text-white`}>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">{profile.avatar}</span>
            <div>
              <h3 className="font-bold text-xl">{profile.name}</h3>
              <p className="text-white text-opacity-80">{profile.handle}</p>
            </div>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-opacity-80">Accuracy</div>
              <div className="font-bold">{profile.stats.accuracy}%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-opacity-80">Calls</div>
              <div className="font-bold">{profile.stats.totalCalls}</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm text-opacity-80">Avg Return</div>
              <div className="font-bold">{profile.tradingMetrics.avgReturn}</div>
            </div>
          </div>

          {/* Recent Success */}
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm mb-2">Recent Success</div>
            {profile.stats.successfulCalls.slice(0, 2).map((call, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>${call.coin}</span>
                <span className="text-green-300">{call.return}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Frame Controls */}
        <div className="flex space-x-4">
          <Button
            onClick={() => {
              // Download frame functionality
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              // Frame generation logic would go here
              console.log('Downloading frame for', profile.name);
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Frame
          </Button>
          <Button
            onClick={() => {
              // Share frame functionality
              if (navigator.share) {
                navigator.share({
                  title: `${profile.name} - OOF Legend`,
                  text: `Check out ${profile.name}'s legendary trading record!`,
                  url: window.location.href
                });
              }
            }}
            variant="outline"
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Frame
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Trading Interface Component
  const TradingInterface = ({ token }: { token: string }) => {
    const data = tokenData[token];
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-purple-900">
                ${token} Trading
              </CardTitle>
              <p className="text-purple-600">
                Current Price: ${data.price.toFixed(6)}
              </p>
            </div>
            <div className="flex space-x-2">
              {['1H', '4H', '1D'].map(tf => (
                <Button
                  key={tf}
                  variant={chartTimeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Order Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (SOL)
                </label>
                <Input
                  type="number"
                  value={tradingState.amount}
                  onChange={(e) => setTradingState({
                    ...tradingState,
                    amount: e.target.value
                  })}
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slippage Tolerance
                </label>
                <div className="flex space-x-2">
                  {[0.5, 1, 2, 5].map(slip => (
                    <Button
                      key={slip}
                      variant={tradingState.slippage === slip ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTradingState({
                        ...tradingState,
                        slippage: slip
                      })}
                      className="flex-1"
                    >
                      {slip}%
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gas Option
                </label>
                <div className="flex space-x-2">
                  {(['slow', 'normal', 'fast'] as const).map(speed => (
                    <Button
                      key={speed}
                      variant={tradingState.gasOption === speed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTradingState({
                        ...tradingState,
                        gasOption: speed
                      })}
                      className="flex-1 capitalize"
                    >
                      {speed}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Buy {token}
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Sell {token}
                </Button>
              </div>
            </div>

            {/* Orderbook */}
            <div>
              <h3 className="font-bold text-purple-900 mb-4">Orderbook</h3>
              <div className="space-y-2">
                {/* Asks */}
                <div className="space-y-1">
                  {data.orderbook.asks.map((ask, index) => (
                    <div key={index} 
                         className="flex justify-between items-center text-red-600
                                  bg-red-50 px-3 py-1 rounded text-sm">
                      <span>${ask.price.toFixed(5)}</span>
                      <span>{ask.size.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-xl font-bold text-purple-900 py-2 border-y">
                  ${data.price.toFixed(5)}
                </div>

                {/* Bids */}
                <div className="space-y-1">
                  {data.orderbook.bids.map((bid, index) => (
                    <div key={index}
                         className="flex justify-between items-center text-green-600
                                  bg-green-50 px-3 py-1 rounded text-sm">
                      <span>${bid.price.toFixed(5)}</span>
                      <span>{bid.size.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Profile Card Component
  const ProfileCard = ({ profile, showcase = false }: { profile: OGProfile; showcase?: boolean }) => (
    <div 
      className={`${showcase ? 'col-span-2' : ''} ${profile.background} 
                rounded-2xl p-1 cursor-pointer transform hover:scale-105 
                transition-all duration-300`}
      onClick={() => setSelectedOG(profile)}
    >
      <div className="bg-black bg-opacity-30 rounded-xl p-6 backdrop-blur-sm h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{profile.avatar}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white text-xl font-bold">{profile.name}</h3>
                {profile.exclusive && (
                  <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
                    EXCLUSIVE
                  </Badge>
                )}
              </div>
              <p className="text-white text-opacity-80">{profile.handle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{profile.tierBadge}</span>
            <Badge variant="secondary" className="bg-white bg-opacity-20 text-white">
              Lvl {profile.level}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
            <div className="text-white text-opacity-70 text-sm">Influence</div>
            <div className="text-white text-xl font-bold">{profile.stats.influence}</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
            <div className="text-white text-opacity-70 text-sm">Followers</div>
            <div className="text-white text-xl font-bold">{profile.stats.followers}</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
            <div className="text-white text-opacity-70 text-sm">Gems Found</div>
            <div className="text-white text-xl font-bold">{profile.stats.gems}</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="bg-white bg-opacity-10 text-white">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <div className="space-y-3">
            {profile.achievements.map((achievement, index) => (
              <div key={index}
                   className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <div className="text-white font-bold">{achievement.name}</div>
                  <div className="text-white text-opacity-70 text-sm">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* $OOF Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4">
            <div className="text-white text-opacity-70 text-sm">$OOF Balance</div>
            <div className="text-white text-xl font-bold">{profile.oofBalance}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4">
            <div className="text-white text-opacity-70 text-sm">Staking Rewards</div>
            <div className="text-white text-xl font-bold">{profile.stakingRewards}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            OOF Legends Gallery
          </h1>
          <p className="text-purple-600">
            Trade with the Legends of Solana
          </p>
        </div>

        {/* View Controls */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                {['all', 'legendary', 'epic'].map(mode => (
                  <Button
                    key={mode}
                    variant={displayMode === mode ? "default" : "outline"}
                    onClick={() => setDisplayMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowProfileSubmission(!showProfileSubmission)}
                  variant="outline"
                >
                  Submit Profile
                </Button>
                <Button onClick={() => setShowFrameGenerator(!showFrameGenerator)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Frame
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Profiles */}
          <div className="space-y-8">
            {showFrameGenerator && selectedOG && (
              <FrameGenerator profile={selectedOG} />
            )}
            
            <div className="space-y-6">
              {ogProfiles
                .filter(profile => displayMode === 'all' || profile.type === displayMode)
                .map(profile => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
            </div>
          </div>

          {/* Right Column - Trading */}
          <div>
            <TradingInterface token="OOF" />
          </div>
        </div>
      </div>
    </div>
  );
}