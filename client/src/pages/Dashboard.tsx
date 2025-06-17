import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Coins, 
  TrendingUp, 
  Zap, 
  Rocket, 
  Flame,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react";
import TokenCard from "@/components/TokenCard";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: tokens = [], isLoading: tokensLoading } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["/api/predictions"],
  });

  const hotTokens = tokens.slice(0, 6);
  const recentPredictions = predictions.slice(0, 5);

  const mockStats = [
    {
      name: "$OOF",
      symbol: "OOF",
      price: 0.000420,
      change: 15.2,
      volume: "2.4M",
      icon: "💎"
    },
    {
      name: "BONK",
      symbol: "BONK", 
      price: 0.000001234,
      change: -5.8,
      volume: "89.2M",
      icon: "🐕"
    },
    {
      name: "WIF",
      symbol: "WIF",
      price: 0.00234,
      change: 23.7,
      volume: "45.6M", 
      icon: "🐶"
    },
    {
      name: "MYRO",
      symbol: "MYRO",
      price: 0.00067,
      change: 89.1,
      volume: "12.3M",
      icon: "🐱"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-purple-400" />
            Live Memecoin Dashboard
          </h1>
          <p className="text-purple-300">
            Monitor the hottest Solana memecoins in real-time with 60-second precision insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {mockStats.map((token, index) => (
            <Card key={index} className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-xl sm:text-2xl">{token.icon}</div>
                    <div>
                      <div className="font-bold text-white text-sm sm:text-base">{token.symbol}</div>
                      <div className="text-xs sm:text-sm text-purple-300">{token.name}</div>
                    </div>
                  </div>
                  <Badge 
                    variant={token.change > 0 ? "secondary" : "destructive"}
                    className={token.change > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                  >
                    {token.change > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                    {Math.abs(token.change)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-white">${token.price}</div>
                  <div className="text-sm text-purple-300">Vol: ${token.volume}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hot Tokens Table */}
        <Card className="bg-purple-800/30 border-purple-700 glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Flame className="w-6 h-6 text-orange-400 mr-2" />
              Hottest Memecoins (Last 60 seconds)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tokensLoading ? (
              <div className="text-center py-8 text-purple-300">Loading tokens...</div>
            ) : hotTokens.length === 0 ? (
              <div className="text-center py-8 text-purple-300">
                No tokens available. Check your API connection.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-700">
                      <th className="text-left py-3 text-purple-300">Token</th>
                      <th className="text-left py-3 text-purple-300">Price</th>
                      <th className="text-left py-3 text-purple-300">24h Change</th>
                      <th className="text-left py-3 text-purple-300">Volume</th>
                      <th className="text-left py-3 text-purple-300">Risk Score</th>
                      <th className="text-left py-3 text-purple-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotTokens.map((token, index) => (
                      <tr key={token.id || index} className="border-b border-purple-700/50 hover:bg-purple-700/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{token.icon || "🪙"}</div>
                            <div>
                              <div className="font-medium text-white">{token.symbol}</div>
                              <div className="text-sm text-purple-400">{token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-white">
                          ${token.price ? parseFloat(token.price).toFixed(9) : "0.000000000"}
                        </td>
                        <td className="py-4">
                          <span className={`font-medium ${
                            token.change24h && parseFloat(token.change24h) > 0 ? "text-green-400" : "text-red-400"
                          }`}>
                            {token.change24h ? `${parseFloat(token.change24h) > 0 ? "+" : ""}${parseFloat(token.change24h).toFixed(2)}%` : "0%"}
                          </span>
                        </td>
                        <td className="py-4 text-white">
                          ${token.volume24h ? parseFloat(token.volume24h).toLocaleString() : "0"}
                        </td>
                        <td className="py-4">
                          <Badge 
                            variant={token.riskScore && token.riskScore > 70 ? "secondary" : token.riskScore && token.riskScore > 40 ? "outline" : "destructive"}
                            className={
                              token.riskScore && token.riskScore > 70 ? "bg-green-500/20 text-green-400" :
                              token.riskScore && token.riskScore > 40 ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }
                          >
                            {token.riskScore && token.riskScore > 70 ? "Safe" :
                             token.riskScore && token.riskScore > 40 ? "Medium" : "High Risk"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Quick Buy
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Latest Predictions */}
          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="w-6 h-6 text-purple-400 mr-2" />
                Latest Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPredictions.length === 0 ? (
                <div className="text-center py-8 text-purple-300">
                  No predictions yet. Visit the Arena to make your first prediction!
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPredictions.map((prediction) => (
                    <div key={prediction.id} className="border border-purple-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-white">Token #{prediction.tokenId}</div>
                          <div className="text-sm text-purple-300">{prediction.direction} prediction</div>
                        </div>
                        <Badge variant="outline" className="border-purple-500 text-purple-300">
                          {prediction.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-purple-400">
                        Target: ${prediction.targetPrice} | Timeframe: {prediction.timeframe}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="w-6 h-6 text-yellow-400 mr-2" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-purple-700/30">
                  <div className="text-2xl font-bold text-purple-400">{user?.oofTokens || 0}</div>
                  <div className="text-sm text-purple-300">$OOF Tokens</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-700/30">
                  <div className="text-2xl font-bold text-purple-400">{user?.predictionAccuracy || 0}%</div>
                  <div className="text-sm text-purple-300">Accuracy</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-700/30">
                  <div className="text-2xl font-bold text-purple-400">#{user?.ranking || 0}</div>
                  <div className="text-sm text-purple-300">Ranking</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-700/30">
                  <div className="text-2xl font-bold text-purple-400">{user?.oofScore || 0}</div>
                  <div className="text-sm text-purple-300">OOF Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
