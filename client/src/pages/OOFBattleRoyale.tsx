import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Trophy, Sword, Shield, Timer, Crown, Star, Rocket, Target, 
  Users, Heart, Award, Gift, Zap, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GameState {
  seasonNumber: number;
  timeRemaining: string;
  activePlayers: number;
  prizePool: number;
}

interface PlayerStats {
  rank: number;
  score: number;
  paperHandsRating: number;
  tradesMade: number;
  worstExit: string;
  badgesEarned: string[];
}

interface LeaderboardPlayer {
  rank: number;
  username: string;
  score: number;
  badge: string;
  signatureMove: string;
}

interface Challenge {
  type: string;
  description: string;
  reward: number;
  timeLeft: string;
  participants: number;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: string;
}

export default function OOFBattleRoyale() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [gameState] = useState<GameState>({
    seasonNumber: 1,
    timeRemaining: "23:45:12",
    activePlayers: 1234,
    prizePool: 100000
  });

  const [playerStats] = useState<PlayerStats>({
    rank: 42,
    score: 7500,
    paperHandsRating: 85,
    tradesMade: 23,
    worstExit: "-95%",
    badgesEarned: ["Panic Seller", "FOMO Master", "Diamond Hands Betrayer"]
  });

  const [leaderboard] = useState<LeaderboardPlayer[]>([
    {
      rank: 1,
      username: "PaperHandsKing",
      score: 25000,
      badge: "👑",
      signatureMove: "The FOMO Master"
    },
    {
      rank: 2,
      username: "FOMOlord",
      score: 22000,
      badge: "🥈",
      signatureMove: "Peak Buyer"
    },
    {
      rank: 3,
      username: "PanicSeller",
      score: 19500,
      badge: "🥉",
      signatureMove: "Bottom Seller"
    }
  ]);

  const [activeChallenge] = useState<Challenge>({
    type: "MEGA_DUMP",
    description: "Sell within 5% of the absolute bottom",
    reward: 1000,
    timeLeft: "5:00",
    participants: 156
  });

  const [powerups] = useState<PowerUp[]>([
    {
      id: "double_paper",
      name: "Double Paper Hands",
      description: "2x points for panic sells",
      cost: 100,
      duration: "30 seconds"
    },
    {
      id: "fomo_shield",
      name: "FOMO Shield",
      description: "Immune to pump FOMO for 1 minute",
      cost: 250,
      duration: "1 minute"
    },
    {
      id: "panic_amplifier",
      name: "Panic Amplifier",
      description: "Triple points for selling at the worst possible time",
      cost: 500,
      duration: "2 minutes"
    },
    {
      id: "whale_sense",
      name: "Whale Sense",
      description: "See whale movements 10 seconds early",
      cost: 750,
      duration: "5 minutes"
    }
  ]);

  // Achievement tracking
  const [achievements] = useState([
    {
      name: "Master FOMO",
      description: "Buy at the absolute peak 10 times",
      progress: 75,
      maxProgress: 100,
      reward: "1000 $OOF + FOMO Master Badge"
    },
    {
      name: "Panic Sell Expert", 
      description: "Sell at the bottom 15 times",
      progress: 90,
      maxProgress: 100,
      reward: "2000 $OOF + Paper Hands NFT"
    },
    {
      name: "Diamond Hands Betrayer",
      description: "Hold for 24h then panic sell",
      progress: 60,
      maxProgress: 100,
      reward: "5000 $OOF + Betrayer Trophy"
    }
  ]);

  // Join Battle Mutation
  const joinBattleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/battle-royale/join', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/battle-royale/stats'] });
    }
  });

  // Use PowerUp Mutation
  const usePowerUpMutation = useMutation({
    mutationFn: async (powerUpId: string) => {
      return apiRequest('/api/battle-royale/use-powerup', {
        method: 'POST',
        body: JSON.stringify({ powerUpId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/battle-royale/stats'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Season Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-purple-900">
                  OOF Battle Royale
                </h1>
                <p className="text-purple-600">
                  Season {gameState.seasonNumber} - The Great Paper Hands Tournament
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-purple-600">Time Remaining</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {gameState.timeRemaining}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-purple-600">Active Players</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {gameState.activePlayers.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-purple-600">Prize Pool</div>
                  <div className="text-2xl font-bold text-green-600">
                    {gameState.prizePool.toLocaleString()} $OOF
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-8">
          {/* Live Trading Arena */}
          <div className="col-span-2 space-y-6">
            {/* Active Challenge */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
                    <Target className="w-6 h-6" />
                    <span>Live Challenge</span>
                  </h2>
                  <p className="text-lg">{activeChallenge.description}</p>
                </div>
                <div className="bg-white text-purple-900 px-4 py-2 rounded-full font-bold">
                  <Gift className="w-4 h-4 inline mr-2" />
                  {activeChallenge.reward} $OOF
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Timer className="animate-pulse" />
                  <span className="font-bold">{activeChallenge.timeLeft}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={18} />
                  <span>{activeChallenge.participants} participating</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-white text-purple-900 hover:bg-gray-100"
                onClick={() => joinBattleMutation.mutate()}
                disabled={joinBattleMutation.isPending}
              >
                <Sword className="w-4 h-4 mr-2" />
                Join Challenge
              </Button>
            </div>

            {/* PowerUps Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Battle PowerUps</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {powerups.map(powerup => (
                    <div key={powerup.id} className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-purple-900">{powerup.name}</h3>
                        <Button
                          size="sm"
                          onClick={() => usePowerUpMutation.mutate(powerup.id)}
                          disabled={usePowerUpMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {powerup.cost} $OOF
                        </Button>
                      </div>
                      <p className="text-sm text-purple-600 mb-2">
                        {powerup.description}
                      </p>
                      <div className="text-xs text-purple-500">
                        Duration: {powerup.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Paper Hands Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {achievements.map((achievement, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-purple-900">{achievement.name}</h3>
                          <p className="text-sm text-purple-600">{achievement.description}</p>
                        </div>
                        <span className="text-purple-900 font-bold">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="mb-2" />
                      <div className="text-xs text-purple-500">
                        Reward: {achievement.reward}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Player Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Battle Stats</CardTitle>
                  <Badge variant="secondary" className="text-lg">
                    Rank #{playerStats.rank}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-purple-600">Score</div>
                    <div className="text-xl font-bold text-purple-900">
                      {playerStats.score.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-purple-600">Paper Hands Rating</div>
                    <div className="text-xl font-bold text-purple-900">
                      {playerStats.paperHandsRating}%
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-purple-600">Trades Made</div>
                    <div className="text-xl font-bold text-purple-900">
                      {playerStats.tradesMade}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-purple-600">Worst Exit</div>
                    <div className="text-xl font-bold text-red-600">
                      {playerStats.worstExit}
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="mt-4">
                  <div className="text-sm text-purple-600 mb-2">Earned Badges</div>
                  <div className="flex flex-wrap gap-2">
                    {playerStats.badgesEarned.map((badge, index) => (
                      <Badge key={index} variant="outline">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Top Paper Hands</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((player) => (
                    <div 
                      key={player.rank}
                      className="bg-purple-50 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{player.badge}</div>
                        <div>
                          <div className="font-bold text-purple-900">
                            {player.username}
                          </div>
                          <div className="text-sm text-purple-600">
                            {player.signatureMove}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-purple-900">
                        {player.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Season Rewards */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Season Rewards</span>
              </h2>
              <div className="space-y-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5" />
                      <span>1st Place</span>
                    </div>
                    <div className="font-bold">50,000 $OOF</div>
                  </div>
                  <div className="text-sm opacity-75">
                    + Legendary Paper Hands NFT
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Top 10</span>
                    </div>
                    <div className="font-bold">10,000 $OOF</div>
                  </div>
                  <div className="text-sm opacity-75">
                    + Epic Paper Hands NFT
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5" />
                      <span>Top 100</span>
                    </div>
                    <div className="font-bold">1,000 $OOF</div>
                  </div>
                  <div className="text-sm opacity-75">
                    + Rare Paper Hands Badge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}