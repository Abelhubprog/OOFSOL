import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Crown, 
  Award, 
  Sparkles,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Leaderboard from "@/components/Leaderboard";
import PredictionCard from "@/components/PredictionCard";

export default function TradersArena() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedToken, setSelectedToken] = useState("");
  const [direction, setDirection] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [timeframe, setTimeframe] = useState("");

  const { data: tokens = [] } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["/api/predictions"],
  });

  const { data: userPredictions = [] } = useQuery({
    queryKey: ["/api/predictions/user"],
  });

  const createPredictionMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = tokens.find(t => t.id === parseInt(selectedToken));
      return await apiRequest("POST", "/api/predictions", {
        tokenId: parseInt(selectedToken),
        direction,
        targetPrice: parseFloat(targetPrice),
        currentPrice: token?.price ? parseFloat(token.price) : 0,
        timeframe,
        potentialReward: calculateReward(direction, parseFloat(targetPrice), token?.price ? parseFloat(token.price) : 0),
      });
    },
    onSuccess: () => {
      toast({
        title: "Prediction Created!",
        description: "Your prediction has been submitted to the arena.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/user"] });
      // Reset form
      setSelectedToken("");
      setDirection("");
      setTargetPrice("");
      setTimeframe("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateReward = (direction: string, targetPrice: number, currentPrice: number) => {
    const percentChange = Math.abs((targetPrice - currentPrice) / currentPrice) * 100;
    const baseReward = Math.min(1000, Math.max(50, percentChange * 10));
    return Math.round(baseReward);
  };

  const handleSubmitPrediction = () => {
    if (!selectedToken || !direction || !targetPrice || !timeframe) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    createPredictionMutation.mutate({});
  };

  const selectedTokenData = tokens.find(t => t.id === parseInt(selectedToken));
  const potentialReward = selectedTokenData && targetPrice ? 
    calculateReward(direction, parseFloat(targetPrice), parseFloat(selectedTokenData.price || "0")) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 mr-3 text-yellow-400" />
            OOF Trader's Arena
          </h1>
          <p className="text-purple-300">Make Your Calls, Avoid OOFs, Earn Rewards! 🎯</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm">Prediction Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {user?.predictionAccuracy || 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Crown className="w-5 h-5" />
                <span className="text-sm">Global Ranking</span>
              </div>
              <div className="text-2xl font-bold text-white">
                #{user?.ranking || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">OOF Score</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {user?.oofScore || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">Earned $OOF</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {user?.oofTokens || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Interface */}
          <div className="lg:col-span-2 space-y-8">
            {/* Make Prediction */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-white">
                  <span>Make Your Call</span>
                  <span className="text-sm text-purple-400">
                    Earn up to 1000 $OOF for correct predictions!
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Token Selection */}
                  <div>
                    <Label className="text-purple-300 mb-2">Select Token</Label>
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                      <SelectTrigger className="bg-purple-700/50 border-purple-600 text-white">
                        <SelectValue placeholder="Choose a token..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.id} value={token.id.toString()}>
                            {token.symbol}/USD (${token.price ? parseFloat(token.price).toFixed(9) : "0"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Direction */}
                  <div>
                    <Label className="text-purple-300 mb-2">Direction</Label>
                    <div className="flex space-x-4">
                      <Button
                        variant={direction === "up" ? "default" : "outline"}
                        className={`flex-1 ${direction === "up" ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-400 hover:bg-green-500/20"}`}
                        onClick={() => setDirection("up")}
                      >
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Bullish
                      </Button>
                      <Button
                        variant={direction === "down" ? "default" : "outline"}
                        className={`flex-1 ${direction === "down" ? "bg-red-600 hover:bg-red-700" : "border-red-500 text-red-400 hover:bg-red-500/20"}`}
                        onClick={() => setDirection("down")}
                      >
                        <TrendingDown className="w-5 h-5 mr-2" />
                        Bearish
                      </Button>
                    </div>
                  </div>

                  {/* Target Price */}
                  <div>
                    <Label className="text-purple-300 mb-2">Target Price</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="bg-purple-700/50 border-purple-600 text-white"
                      placeholder="Enter target price..."
                    />
                  </div>

                  {/* Timeframe */}
                  <div>
                    <Label className="text-purple-300 mb-2">Timeframe</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="bg-purple-700/50 border-purple-600 text-white">
                        <SelectValue placeholder="Select timeframe..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Potential Reward Display */}
                {potentialReward > 0 && (
                  <div className="mt-4 p-3 bg-purple-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300">Potential Reward:</span>
                      <span className="text-yellow-400 font-bold flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        {potentialReward} $OOF
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmitPrediction}
                  disabled={createPredictionMutation.isPending}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Target className="w-5 h-5 mr-2" />
                  {createPredictionMutation.isPending ? "Submitting..." : "Submit Prediction"}
                </Button>
              </CardContent>
            </Card>

            {/* Latest Predictions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Latest Predictions</h3>
              {predictions.length === 0 ? (
                <Card className="bg-purple-800/30 border-purple-700 glass-card">
                  <CardContent className="p-8 text-center">
                    <div className="text-purple-300">
                      No predictions yet. Be the first to make a prediction!
                    </div>
                  </CardContent>
                </Card>
              ) : (
                predictions.slice(0, 5).map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} tokens={tokens} />
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
