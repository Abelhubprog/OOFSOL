import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/useAchievements";
import ConfettiBurst, { AchievementConfetti } from "@/components/ConfettiBurst";
import AchievementToast from "@/components/AchievementToast";
import { 
  Home,
  BarChart3,
  Search,
  Star,
  Layers,
  Shield,
  Brain,
  BookOpen,
  Crown,
  Coins,
  Zap,
  Sparkles,
  Clock,
  TrendingUp,
  Wallet,
  Users,
  LogOut,
  Calculator,
  Target,
  Bot,
  ShoppingCart,
  MessageCircle,
  Activity,
  Trophy,
  DollarSign,
  ChevronRight,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface GlobalStats {
  totalOOFMoments: number;
  totalUsers: number;
  totalRewards: number;
  recentActivity: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { 
    unlockAchievement, 
    trackPrediction, 
    trackTrade, 
    activeConfetti, 
    clearConfetti,
    recentUnlocks,
    totalPoints
  } = useAchievements();
  
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalOOFMoments: 1337575,
    totalUsers: 12450,
    totalRewards: 245780,
    recentActivity: "Tracking every lost chance from the depths of missed opportunities"
  });
  
  const [showToast, setShowToast] = useState(false);
  const [demoConfetti, setDemoConfetti] = useState<string | null>(null);

  const { data: tokens } = useQuery({ queryKey: ['/api/tokens'] });
  const { data: predictions } = useQuery({ queryKey: ['/api/predictions'] });
  const { data: userPredictions } = useQuery({ queryKey: ['/api/predictions/user'] });
  const { data: leaderboard } = useQuery({ queryKey: ['/api/leaderboard'] });

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/stats');
      if (!response.ok) return { oofTokens: 0, totalEarned: 0, rank: 0 };
      return response.json();
    }
  });

  useEffect(() => {
    // Real-time counter updates
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        ...prev,
        totalOOFMoments: prev.totalOOFMoments + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-purple-900/50 backdrop-blur-lg border-r border-purple-500/30">
          {/* Logo */}
          <div className="p-6 border-b border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OOF</span>
              </div>
              <span className="text-white font-semibold">Platform</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {user?.walletAddress ? 
                      `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` 
                      : 'Connected'
                    }
                  </div>
                  <div className="text-purple-300 text-xs">
                    {userStats?.oofTokens || 0} OOF Tokens
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="text-center text-purple-300 text-xs">
                Wallet connected
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Main
              </h3>
              <div className="space-y-1">
                <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-purple-500/20 text-white">
                  <Home className="w-5 h-5" />
                  <span className="text-sm">Home</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Trading
              </h3>
              <div className="space-y-1">
                <Link href="/tokens" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Search className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">Token Explorer</span>
                </Link>
                <Link href="/traders-arena" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <TrendingUp className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">Traders Arena</span>
                </Link>
                <Link href="/campaigns" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-white group">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm font-medium">OOF Campaigns</span>
                  <Badge className="ml-auto bg-green-500 text-white text-xs">NEW</Badge>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Features
              </h3>
              <div className="space-y-1">
                <Link href="/moments" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Star className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">OOF Moments</span>
                </Link>
                <Link href="/multiverse" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Layers className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">OOF Multiverse</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Analysis
              </h3>
              <div className="space-y-1">
                <Link href="/detective" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Shield className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">OOF Detective</span>
                </Link>
                <Link href="/detective-advanced" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Brain className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">Advanced AI</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Games
              </h3>
              <div className="space-y-1">
                <Link href="/origins" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <BookOpen className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">OOF Origins</span>
                </Link>
                <Link href="/battle-royale" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Crown className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">Battle Royale</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                DeFi
              </h3>
              <div className="space-y-1">
                <Link href="/staking" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Coins className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">OOF Staking</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Tools
              </h3>
              <div className="space-y-1">
                <Link href="/time-machine" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Clock className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">Time Machine</span>
                </Link>
                <Link href="/wallet-analyzer" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group">
                  <Wallet className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  <span className="text-purple-200 group-hover:text-white text-sm">Wallet Analyzer</span>
                </Link>
              </div>
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t border-purple-500/30">
              <button
                onClick={() => window.location.href = "/api/logout"}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors group w-full"
              >
                <LogOut className="w-5 h-5 text-purple-300 group-hover:text-red-400" />
                <span className="text-purple-200 group-hover:text-red-400 text-sm">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              OOF
            </h1>
            <h2 className="text-2xl text-purple-200 mb-2">
              The Meme Coin for Missed Opportunities 🔍
            </h2>
            <p className="text-purple-300 max-w-2xl mx-auto">
              Turn your crypto regrets into rewards. Track missed gains, predict the next moon, and earn 
              $OOF tokens for your trading insights!
            </p>
          </div>

          {/* Global OOF Moments Counter */}
          <div className="max-w-md mx-auto mb-8">
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Global OOF Moments</h3>
                <div className="text-4xl font-bold text-yellow-300 mb-2">
                  {globalStats.totalOOFMoments.toLocaleString()}
                </div>
                <div className="text-purple-200 text-sm">And counting</div>
                <div className="text-xs text-purple-300 mt-2">
                  {globalStats.recentActivity}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Achievement Demo Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    🎉 Social Achievement Confetti Burst Demo
                  </h3>
                  <p className="text-purple-200">
                    Experience our celebration system - click buttons to trigger different achievement confetti bursts!
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => {
                      unlockAchievement('first_login');
                      setDemoConfetti('first_login');
                      setTimeout(() => setDemoConfetti(null), 3000);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 h-auto flex flex-col items-center"
                  >
                    <Star className="w-6 h-6 mb-2" />
                    <span className="font-semibold">First Login</span>
                    <span className="text-xs opacity-80">Welcome celebration</span>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      trackTrade(100);
                      setDemoConfetti('trading');
                      setTimeout(() => setDemoConfetti(null), 3000);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 h-auto flex flex-col items-center"
                  >
                    <TrendingUp className="w-6 h-6 mb-2" />
                    <span className="font-semibold">Trade Success</span>
                    <span className="text-xs opacity-80">Trading milestone</span>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      trackPrediction(true, 500);
                      setDemoConfetti('prediction');
                      setTimeout(() => setDemoConfetti(null), 3000);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-4 h-auto flex flex-col items-center"
                  >
                    <Crown className="w-6 h-6 mb-2" />
                    <span className="font-semibold">Perfect Prediction</span>
                    <span className="text-xs opacity-80">Oracle achievement</span>
                  </Button>
                </div>

                {totalPoints > 0 && (
                  <div className="mt-4 text-center">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Total Achievement Points: {totalPoints}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3 mb-8 flex-wrap gap-3">
            <Link href="/campaigns">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3">
                <Target className="w-5 h-5 mr-2" />
                Launch Campaign
              </Button>
            </Link>
            <Link href="/wallet-analyzer">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3">
                <Calculator className="w-5 h-5 mr-2" />
                Calculate My OOFs
              </Button>
            </Link>
            <Link href="/tokens">
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/20 px-6 py-3">
                <Search className="w-5 h-5 mr-2" />
                Analyze Wallet
              </Button>
            </Link>
            <Link href="/staking">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy $OOF
              </Button>
            </Link>
          </div>

          {/* OOF Campaigns Feature Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30 backdrop-blur-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    OOF Campaigns - Social Media Engagement Platform
                  </h3>
                  <p className="text-purple-200 text-lg mb-6">
                    Create viral social media campaigns with crypto rewards. Engage audiences across Twitter, 
                    Farcaster, TikTok, and Arena with automated USDC payouts and OOF token rewards.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-purple-700/30 p-6 rounded-lg text-center">
                    <MessageCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">Multi-Platform</h4>
                    <p className="text-sm text-purple-300">Support for Twitter, Farcaster, TikTok, and Arena platforms</p>
                  </div>
                  <div className="bg-purple-700/30 p-6 rounded-lg text-center">
                    <Coins className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">Crypto Rewards</h4>
                    <p className="text-sm text-purple-300">Automated USDC payments and OOF token distribution</p>
                  </div>
                  <div className="bg-purple-700/30 p-6 rounded-lg text-center">
                    <BarChart3 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">Real-time Analytics</h4>
                    <p className="text-sm text-purple-300">Track engagement, conversions, and campaign performance</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Link href="/campaigns">
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg">
                      <Target className="w-6 h-6 mr-2" />
                      Launch Campaigns
                    </Button>
                  </Link>
                  <Link href="/campaigns">
                    <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-500/20 px-8 py-3 text-lg">
                      <Activity className="w-6 h-6 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* OOF Bot Section */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-purple-800/50 border-purple-500/30 backdrop-blur-lg">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Meet OOF Bot - Your Regret Companion
                </h3>
                <p className="text-purple-200 mb-6">
                  Your AI-powered trading companion that helps you learn from missed opportunities 
                  and spot the next big move before it's too late.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-700/30 p-4 rounded-lg">
                    <MessageCircle className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Smart Alerts</h4>
                    <p className="text-sm text-purple-300">Get notified of potential opportunities</p>
                  </div>
                  <div className="bg-purple-700/30 p-4 rounded-lg">
                    <Activity className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Market Analysis</h4>
                    <p className="text-sm text-purple-300">Real-time market insights and predictions</p>
                  </div>
                  <div className="bg-purple-700/30 p-4 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Trend Tracking</h4>
                    <p className="text-sm text-purple-300">Never miss the next big trend</p>
                  </div>
                </div>

                <Link href="/detective">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3">
                    <Brain className="w-5 h-5 mr-2" />
                    Activate OOF Bot
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <Card className="bg-purple-800/30 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {globalStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-purple-300">Active Users</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-800/30 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <Coins className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  ${globalStats.totalRewards.toLocaleString()}
                </div>
                <div className="text-purple-300">Total Rewards Paid</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-800/30 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {userStats?.rank || '---'}
                </div>
                <div className="text-purple-300">Your Rank</div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-6xl mx-auto">
            <Link href="/campaigns">
              <Card className="bg-purple-800/30 border-purple-500/30 hover:bg-purple-700/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Target className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">OOF Campaigns</h4>
                  <p className="text-sm text-purple-300">Create viral social media campaigns with crypto rewards</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/detective">
              <Card className="bg-purple-800/30 border-purple-500/30 hover:bg-purple-700/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">OOF Detective</h4>
                  <p className="text-sm text-purple-300">AI-powered rug detection and token analysis</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/moments">
              <Card className="bg-purple-800/30 border-purple-500/30 hover:bg-purple-700/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Star className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">OOF Moments</h4>
                  <p className="text-sm text-purple-300">Track and monetize your missed opportunities</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/staking">
              <Card className="bg-purple-800/30 border-purple-500/30 hover:bg-purple-700/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Coins className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">OOF Staking</h4>
                  <p className="text-sm text-purple-300">Stake OOF tokens and earn passive rewards</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}