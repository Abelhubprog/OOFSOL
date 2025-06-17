import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Sparkles, Rocket, Crown, 
  Zap, Trophy, Star, Share2,
  BarChart2, Users, ArrowUpCircle, Heart
} from "lucide-react";

interface Universe {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  background: string;
  icon: string;
  anomalyLevel: number;
  currentPrice: string;
  holdings: string;
}

interface Power {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  reward: number;
  difficulty: string;
  timeLeft: string;
}

export default function OOFRealityBender() {
  const { user } = useAuth();
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [timelineState, setTimelineState] = useState({
    currentDate: "2024-03-20",
    timeSpeed: "1x",
    anomalyLevel: 0
  });

  const [playerPowers, setPlayerPowers] = useState({
    timeCredits: 1000,
    realityShards: 5,
    powerLevel: 3
  });

  // Available parallel universes
  const universes: Universe[] = [
    {
      id: "diamond-realm",
      name: "Diamond Hands Dimension",
      description: "A reality where paper hands don't exist",
      difficulty: "Legendary",
      background: "bg-gradient-to-br from-blue-400 to-blue-600",
      icon: "💎",
      anomalyLevel: 8,
      currentPrice: "$1.25",
      holdings: "1,000,000 $OOF"
    },
    {
      id: "fomo-verse",
      name: "FOMO Nexus",
      description: "Every missed pump happens simultaneously",
      difficulty: "Epic",
      background: "bg-gradient-to-br from-purple-400 to-purple-600",
      icon: "🌀",
      anomalyLevel: 6,
      currentPrice: "$0.85",
      holdings: "500,000 $OOF"
    },
    {
      id: "paper-dimension",
      name: "Paper Realm",
      description: "The ultimate paper hands testing ground",
      difficulty: "Rare",
      background: "bg-gradient-to-br from-green-400 to-green-600",
      icon: "🧻",
      anomalyLevel: 4,
      currentPrice: "$0.45",
      holdings: "250,000 $OOF"
    }
  ];

  // Reality Bending Powers
  const powers: Power[] = [
    {
      id: "time-freeze",
      name: "Time Freeze",
      description: "Pause price movement for 30 seconds",
      cost: 100,
      icon: "⏸️"
    },
    {
      id: "reality-warp",
      name: "Reality Warp",
      description: "Switch to a parallel timeline",
      cost: 250,
      icon: "🌀"
    },
    {
      id: "fomo-shield",
      name: "FOMO Shield",
      description: "Block FOMO effects for 1 minute",
      cost: 150,
      icon: "🛡️"
    }
  ];

  // Current challenges in the selected universe
  const [activeChallenges] = useState<Challenge[]>([
    {
      id: "mega-divergence",
      name: "Mega Timeline Divergence",
      description: "Trade across 3 different timelines simultaneously",
      reward: 1000,
      difficulty: "Legendary",
      timeLeft: "1:23:45"
    },
    {
      id: "reality-storm",
      name: "Reality Storm",
      description: "Survive the merging of paper hands dimensions",
      reward: 500,
      difficulty: "Epic",
      timeLeft: "45:12"
    }
  ]);

  // Universe selection card
  const UniverseCard = ({ universe }: { universe: Universe }) => (
    <div 
      className={`${universe.background} rounded-xl p-6 cursor-pointer
                transform hover:scale-105 transition-all duration-300 card-hover
                ${selectedUniverse?.id === universe.id ? 'ring-4 ring-white animate-glow-purple' : ''}`}
      onClick={() => setSelectedUniverse(universe)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl animate-float">{universe.icon}</div>
          <div>
            <h3 className="text-white text-xl font-bold">{universe.name}</h3>
            <p className="text-white text-opacity-80">{universe.description}</p>
          </div>
        </div>
        <Badge className="bg-black bg-opacity-20 text-white border-0">
          {universe.difficulty}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-lg p-3">
          <div className="text-white text-opacity-70 text-sm mb-1">$OOF Price</div>
          <div className="text-white font-bold">{universe.currentPrice}</div>
        </div>
        <div className="glass rounded-lg p-3">
          <div className="text-white text-opacity-70 text-sm mb-1">Holdings</div>
          <div className="text-white font-bold">{universe.holdings}</div>
        </div>
      </div>

      <div className="mt-4 glass rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div className="text-white text-opacity-70 text-sm">Anomaly Level</div>
          <div className="text-white font-bold">{universe.anomalyLevel}/10</div>
        </div>
        <div className="w-full bg-black bg-opacity-20 rounded-full h-2 mt-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${universe.anomalyLevel * 10}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-900 mb-2 gradient-text">
            OOF Reality Bender
          </h1>
          <p className="text-purple-600">
            Bend Time, Alter Reality, Master the Multiverse!
          </p>
        </div>

        {/* Player Stats */}
        <Card className="mb-8 oof-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-sm text-purple-600">Time Credits</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {playerPowers.timeCredits}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-purple-600">Reality Shards</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {playerPowers.realityShards}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-purple-600">Power Level</div>
                  <div className="text-2xl font-bold text-purple-900">
                    Level {playerPowers.powerLevel}
                  </div>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 hover-oof-glow">
                <Sparkles className="mr-2 h-4 w-4" />
                Buy Power-ups
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-8">
          {/* Universe Selection */}
          <div className="col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Choose Your Reality
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {universes.map(universe => (
                <UniverseCard key={universe.id} universe={universe} />
              ))}
            </div>

            {/* Active Reality Challenges */}
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-900">
                  Reality Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {activeChallenges.map(challenge => (
                    <div key={challenge.id} 
                         className="bg-purple-50 rounded-lg p-4 card-hover">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-purple-900">
                            {challenge.name}
                          </h3>
                          <p className="text-sm text-purple-600">
                            {challenge.description}
                          </p>
                        </div>
                        <Badge className={challenge.difficulty === 'Legendary' 
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : 'bg-purple-100 text-purple-700 border-purple-200'}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-purple-900 font-bold">
                          {challenge.reward} $OOF
                        </div>
                        <div className="flex items-center text-purple-600">
                          <Clock className="mr-1 h-4 w-4" />
                          {challenge.timeLeft}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reality Powers & Timeline Controls */}
          <div className="space-y-6">
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-900">
                  Reality Bending Powers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {powers.map(power => (
                    <div key={power.id} 
                         className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100
                                    transition-colors cursor-pointer card-hover">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-2xl">{power.icon}</div>
                        <div>
                          <h3 className="font-bold text-purple-900">
                            {power.name}
                          </h3>
                          <p className="text-sm text-purple-600">
                            {power.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600 text-sm">
                          Cost: {power.cost} credits
                        </span>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Activate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Controls */}
            <div className="oof-gradient rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Timeline Controls</h2>
              <div className="space-y-4">
                <div className="glass rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Current Date</span>
                    <span className="font-bold">{timelineState.currentDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time Speed</span>
                    <div className="flex space-x-2">
                      {['0.5x', '1x', '2x', '5x'].map(speed => (
                        <Button 
                          key={speed}
                          size="sm"
                          variant={timelineState.timeSpeed === speed ? "secondary" : "ghost"}
                          className={timelineState.timeSpeed === speed
                            ? 'bg-white text-purple-900'
                            : 'bg-black bg-opacity-20 text-white hover:bg-white hover:text-purple-900'}
                          onClick={() => setTimelineState(prev => ({ ...prev, timeSpeed: speed }))}
                        >
                          {speed}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="glass rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Anomaly Level</span>
                    <span className="font-bold">
                      {timelineState.anomalyLevel}/10
                    </span>
                  </div>
                  <div className="w-full bg-black bg-opacity-20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all"
                      style={{
                        width: `${timelineState.anomalyLevel * 10}%`
                      }}
                    />
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