import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItem {
  path: string;
  label: string;
  icon: any;
  category: string;
}

interface GlobalStats {
  totalOOFMoments: number;
  totalUsers: number;
  totalRewards: number;
  recentActivity: string;
}

export default function MainDashboard() {
  const { user, logout } = useAuth();
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalOOFMoments: 1337575,
    totalUsers: 12450,
    totalRewards: 245780,
    recentActivity: "Tracking every lost chance from the depths of missed opportunities"
  });

  const sidebarItems: SidebarItem[] = [
    { path: "/dashboard", label: "Home", icon: Home, category: "main" },
    { path: "/dashboard/overview", label: "Dashboard", icon: BarChart3, category: "main" },
    { path: "/tokens", label: "Token Explorer", icon: Search, category: "trading" },
    { path: "/moments", label: "OOF Moments", icon: Star, category: "features" },
    { path: "/multiverse", label: "OOF Multiverse", icon: Layers, category: "features" },
    { path: "/detective", label: "OOF Detective", icon: Shield, category: "analysis" },
    { path: "/detective-advanced", label: "Advanced AI", icon: Brain, category: "analysis" },
    { path: "/origins", label: "OOF Origins", icon: BookOpen, category: "games" },
    { path: "/battle-royale", label: "Battle Royale", icon: Crown, category: "games" },
    { path: "/staking", label: "OOF Staking", icon: Coins, category: "defi" },
    { path: "/time-machine", label: "Time Machine", icon: Clock, category: "tools" },
    { path: "/traders-arena", label: "Traders Arena", icon: TrendingUp, category: "trading" },
    { path: "/wallet-analyzer", label: "Wallet Analyzer", icon: Wallet, category: "tools" },
    { path: "/campaigns", label: "Campaigns", icon: Target, category: "earn" }
  ];

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/stats');
      if (!response.ok) return { oofTokens: 0, totalEarned: 0, rank: 0 };
      return response.json();
    }
  });

  useEffect(() => {
    // Simulate real-time counter updates
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        ...prev,
        totalOOFMoments: prev.totalOOFMoments + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const categoryGroups = {
    main: "Main",
    trading: "Trading",
    features: "Features", 
    analysis: "Analysis",
    games: "Games",
    defi: "DeFi",
    tools: "Tools",
    earn: "Earn"
  };

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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <div className="text-white font-medium">
                  {user?.email?.split('@')[0].toUpperCase() || 'ABEL'}
                </div>
                <div className="text-purple-300 text-sm">
                  {userStats?.oofTokens || 0} OOF Tokens
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-6">
            {Object.entries(categoryGroups).map(([category, label]) => {
              const items = sidebarItems.filter(item => item.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                    {label}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors group"
                        >
                          <Icon className="w-5 h-5 text-purple-300 group-hover:text-white" />
                          <span className="text-purple-200 group-hover:text-white text-sm">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Sign Out */}
            <div className="pt-4 border-t border-purple-500/30">
              <button
                onClick={logout}
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

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
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

          {/* OOF Bot Section */}
          <div className="max-w-2xl mx-auto">
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

          {/* Quick Stats */}
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
        </div>
      </div>
    </div>
  );
}