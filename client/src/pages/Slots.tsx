import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Sparkles, 
  Zap, 
  Star, 
  Trophy, 
  Crown, 
  Gift, 
  Timer,
  Rocket,
  Coins
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SlotResult {
  reel1: string;
  reel2: string; 
  reel3: string;
}

interface SpinResult {
  id: number;
  result: SlotResult;
  reward: number;
  nftGenerated: boolean;
  newBalance: number;
}

export default function Slots() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [spinAnimation, setSpinAnimation] = useState(false);

  const { data: userSlotSpins = [] } = useQuery({
    queryKey: ["/api/slots/user"],
    enabled: false, // We'll implement this endpoint if needed
  });

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/slots/spin", {});
      return await response.json();
    },
    onSuccess: (data: SpinResult) => {
      setLastResult(data);
      setIsSpinning(false);
      setSpinAnimation(false);
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (data.reward > 0) {
        toast({
          title: data.nftGenerated ? "🎉 JACKPOT! NFT Generated!" : "🎉 You Won!",
          description: `You earned ${data.reward} $OOF tokens!`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Keep spinning for legendary moments!",
        });
      }
    },
    onError: (error) => {
      setIsSpinning(false);
      setSpinAnimation(false);
      
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
        title: "Spin Failed",
        description: error.message.includes("Insufficient") ? 
          "You need at least 5 $OOF tokens to spin!" : 
          "Failed to spin. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSpin = () => {
    if ((user?.oofTokens || 0) < 5) {
      toast({
        title: "Insufficient Tokens",
        description: "You need at least 5 $OOF tokens to spin!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setSpinAnimation(true);
    setLastResult(null);
    
    // Delay the API call to show spinning animation
    setTimeout(() => {
      spinMutation.mutate();
    }, 2000);
  };

  const symbols = ['BONK', 'WIF', 'MYRO', 'MOON', '100x', 'OOF', '💎', '🚀'];
  const displayReels = isSpinning ? ['🎰', '🎰', '🎰'] : 
    lastResult ? [lastResult.result.reel1, lastResult.result.reel2, lastResult.result.reel3] :
    ['BONK', 'MOON', '100x'];

  const getSymbolColor = (symbol: string) => {
    switch (symbol) {
      case '100x': return 'text-yellow-400';
      case 'MOON': return 'text-blue-400';
      case '💎': return 'text-purple-400';
      case '🚀': return 'text-green-400';
      default: return 'text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
            OOF Multiverse Slots
          </h1>
          <p className="text-purple-300">Spin through time, collect legendary moments! 🎰</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slot Machine */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">OOF Multiverse Slots</h3>
                  <div className="text-purple-200">Spin to unlock legendary memecoin moments!</div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8">
                {/* Jackpot Display */}
                <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold animate-pulse mb-6 w-fit mx-auto">
                  <Trophy className="w-5 h-5 inline mr-2" />
                  25,000 $OOF JACKPOT
                </div>

                {/* Reels */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {displayReels.map((symbol, index) => (
                    <div 
                      key={index}
                      className={`bg-white rounded-lg p-4 h-32 flex items-center justify-center text-2xl font-bold ${getSymbolColor(symbol)} ${
                        spinAnimation ? 'animate-spin' : ''
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4 mb-6">
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning || (user?.oofTokens || 0) < 5}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:from-yellow-500 hover:to-yellow-600 font-bold px-8 py-4"
                  >
                    <Zap className="w-6 h-6 mr-2" />
                    {isSpinning ? "SPINNING..." : "SPIN (5 $OOF)"}
                  </Button>
                </div>

                {/* Current Balance */}
                <div className="text-center text-purple-300">
                  Your Balance: <span className="font-bold text-yellow-400">{user?.oofTokens || 0} $OOF</span>
                </div>
              </CardContent>
            </Card>

            {/* Result Display */}
            {lastResult && (
              <Card className="mt-8 bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">
                      {lastResult.reward >= 1000 ? '🏆' : lastResult.reward > 100 ? '🎉' : lastResult.reward > 0 ? '✨' : '😅'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {lastResult.reward >= 1000 ? 'LEGENDARY WIN!' :
                       lastResult.reward > 100 ? 'Big Win!' :
                       lastResult.reward > 0 ? 'Nice Win!' : 'Better Luck Next Time!'}
                    </h3>
                    <p className="text-gray-600">
                      {lastResult.nftGenerated ? 'You unlocked a rare NFT moment!' : 
                       lastResult.reward > 0 ? 'You earned some $OOF tokens!' : 'Keep spinning for epic rewards!'}
                    </p>
                  </div>

                  {lastResult.reward > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Reward</div>
                        <div className="text-2xl font-bold text-purple-600">{lastResult.reward} $OOF</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Rarity</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {lastResult.reward >= 1000 ? 'LEGENDARY' :
                           lastResult.reward > 100 ? 'EPIC' : 'COMMON'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4">
                    {lastResult.nftGenerated && (
                      <Button className="bg-purple-600 text-white hover:bg-purple-700">
                        <Star className="w-5 h-5 mr-2" />
                        Mint as NFT
                      </Button>
                    )}
                    <Button 
                      onClick={handleSpin}
                      disabled={(user?.oofTokens || 0) < 5}
                      className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Spin Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-purple-800/30 border-purple-700 glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-purple-400 mb-2">
                    <Coins className="w-5 h-5" />
                    <span className="text-sm">$OOF Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{user?.oofTokens || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/30 border-purple-700 glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-purple-400 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm">Total Spins</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{userSlotSpins.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/30 border-purple-700 glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-purple-400 mb-2">
                    <Star className="w-5 h-5" />
                    <span className="text-sm">NFTs Earned</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {userSlotSpins.filter(spin => spin.nftGenerated).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-800/30 border-purple-700 glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-purple-400 mb-2">
                    <Gift className="w-5 h-5" />
                    <span className="text-sm">Next Free</span>
                  </div>
                  <div className="text-lg font-bold text-white">2:45:30</div>
                </CardContent>
              </Card>
            </div>

            {/* Paytable */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                  Paytable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">🎰 🎰 🎰</span>
                    <Badge className="bg-yellow-500 text-yellow-900">25,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">100x 100x 100x</span>
                    <Badge className="bg-yellow-500 text-yellow-900">25,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">MOON MOON MOON</span>
                    <Badge className="bg-purple-500 text-white">1,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">💎 💎 💎</span>
                    <Badge className="bg-blue-500 text-white">500</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Any Pair</span>
                    <Badge className="bg-green-500 text-white">100</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Rewards */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardHeader>
                <CardTitle className="text-white">Daily Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300">Next Free Spin</span>
                    </div>
                    <div className="font-bold text-white">2:45:30</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Rocket className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300">Streak Bonus</span>
                    </div>
                    <div className="font-bold text-green-400">+50%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
