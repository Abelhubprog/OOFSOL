import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Clock, Star,
  TrendingUp, Shield, Zap, Gift, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  lockPeriod: number; // days
  minStake: number;
  maxStake: number;
  totalStaked: number;
  stakersCount: number;
  rewards: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  features: string[];
}

interface UserStake {
  id: string;
  poolId: string;
  amount: number;
  startDate: Date;
  unlockDate: Date;
  rewardsEarned: number;
  status: 'active' | 'unlocking' | 'unlocked';
}

export default function OOFStaking() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');

  // Mock user balance - in real app would come from wallet
  const [userBalance] = useState({
    oof: 10000,
    sol: 5.5,
    stakedOof: 25000,
    pendingRewards: 1250
  });

  // Staking Pools Configuration
  const stakingPools: StakingPool[] = [
    {
      id: 'bronze',
      name: 'Bronze Pool',
      apy: 15,
      lockPeriod: 7,
      minStake: 100,
      maxStake: 10000,
      totalStaked: 500000,
      stakersCount: 234,
      rewards: ['$OOF Tokens', 'Bronze NFT Badge'],
      tier: 'bronze',
      features: ['7-day lock', 'Basic rewards', 'Community access']
    },
    {
      id: 'silver',
      name: 'Silver Pool',
      apy: 25,
      lockPeriod: 14,
      minStake: 1000,
      maxStake: 50000,
      totalStaked: 1200000,
      stakersCount: 156,
      rewards: ['$OOF Tokens', 'Silver NFT Badge', 'Exclusive Discord'],
      tier: 'silver',
      features: ['14-day lock', 'Enhanced rewards', 'Priority support', 'Alpha calls']
    },
    {
      id: 'gold',
      name: 'Gold Pool',
      apy: 40,
      lockPeriod: 30,
      minStake: 10000,
      maxStake: 100000,
      totalStaked: 2500000,
      stakersCount: 89,
      rewards: ['$OOF Tokens', 'Gold NFT Badge', 'Exclusive Discord', 'Revenue Share'],
      tier: 'gold',
      features: ['30-day lock', 'Premium rewards', 'VIP support', 'Private alpha group', 'Governance voting']
    },
    {
      id: 'diamond',
      name: 'Diamond Pool',
      apy: 75,
      lockPeriod: 90,
      minStake: 50000,
      maxStake: 1000000,
      totalStaked: 5000000,
      stakersCount: 23,
      rewards: ['$OOF Tokens', 'Diamond NFT Badge', 'Revenue Share', 'Personal Advisor'],
      tier: 'diamond',
      features: ['90-day lock', 'Maximum rewards', 'White-glove service', 'Direct founder access', 'Investment opportunities']
    }
  ];

  // Mock user stakes
  const userStakes: UserStake[] = [
    {
      id: '1',
      poolId: 'silver',
      amount: 5000,
      startDate: new Date('2024-01-15'),
      unlockDate: new Date('2024-01-29'),
      rewardsEarned: 125,
      status: 'active'
    },
    {
      id: '2',
      poolId: 'gold',
      amount: 20000,
      startDate: new Date('2024-01-10'),
      unlockDate: new Date('2024-02-09'),
      rewardsEarned: 890,
      status: 'active'
    }
  ];

  // Stake Mutation
  const stakeMutation = useMutation({
    mutationFn: async (data: { poolId: string; amount: number }) => {
      return apiRequest('/api/staking/stake', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staking/user-stakes'] });
      setStakeAmount('');
    }
  });

  // Unstake Mutation
  const unstakeMutation = useMutation({
    mutationFn: async (data: { stakeId: string; amount: number }) => {
      return apiRequest('/api/staking/unstake', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staking/user-stakes'] });
      setUnstakeAmount('');
    }
  });

  // Claim Rewards Mutation
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/staking/claim-rewards', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staking/user-stakes'] });
    }
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-400 to-amber-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'diamond': return 'from-blue-400 to-purple-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'diamond': return '💎';
      default: return '⭐';
    }
  };

  const calculateDaysRemaining = (unlockDate: Date) => {
    const now = new Date();
    const diffTime = unlockDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateAPR = (amount: number, apy: number, days: number) => {
    return (amount * (apy / 100) * (days / 365));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            $OOF Staking Hub
          </h1>
          <p className="text-purple-600">
            Stake your $OOF tokens and earn passive rewards
          </p>
        </div>

        {/* User Balance Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Your Portfolio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Available $OOF</div>
                <div className="text-2xl font-bold text-purple-900">
                  {userBalance.oof.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Staked $OOF</div>
                <div className="text-2xl font-bold text-green-600">
                  {userBalance.stakedOof.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Pending Rewards</div>
                <div className="text-2xl font-bold text-blue-600">
                  {userBalance.pendingRewards.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <Button 
                  onClick={() => claimRewardsMutation.mutate()}
                  disabled={claimRewardsMutation.isPending || userBalance.pendingRewards === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Rewards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stake">Staking Pools</TabsTrigger>
            <TabsTrigger value="mystakes">My Stakes</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          {/* Staking Pools Tab */}
          <TabsContent value="stake">
            <div className="grid grid-cols-2 gap-8">
              {stakingPools.map((pool) => (
                <Card 
                  key={pool.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedPool?.id === pool.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedPool(pool)}
                >
                  <CardHeader>
                    <div className={`bg-gradient-to-r ${getTierColor(pool.tier)} rounded-lg p-4 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getTierIcon(pool.tier)}</span>
                          <div>
                            <CardTitle className="text-white">{pool.name}</CardTitle>
                            <p className="text-white text-opacity-80 capitalize">{pool.tier} Tier</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{pool.apy}%</div>
                          <div className="text-sm text-opacity-80">APY</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-opacity-80">Lock Period</div>
                          <div className="font-bold">{pool.lockPeriod} days</div>
                        </div>
                        <div>
                          <div className="text-sm text-opacity-80">Min Stake</div>
                          <div className="font-bold">{pool.minStake.toLocaleString()} $OOF</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Pool Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Total Staked</div>
                          <div className="font-bold">{(pool.totalStaked / 1000000).toFixed(1)}M $OOF</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Stakers</div>
                          <div className="font-bold">{pool.stakersCount}</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Features</div>
                        <div className="flex flex-wrap gap-2">
                          {pool.features.map((feature, index) => (
                            <Badge key={index} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Rewards */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Rewards</div>
                        <div className="space-y-1">
                          {pool.rewards.map((reward, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stake Form */}
                      {selectedPool?.id === pool.id && (
                        <div className="border-t pt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stake Amount ($OOF)
                            </label>
                            <Input
                              type="number"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              placeholder={`Min: ${pool.minStake}`}
                              min={pool.minStake}
                              max={Math.min(pool.maxStake, userBalance.oof)}
                            />
                          </div>
                          
                          {stakeAmount && (
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Estimated Rewards:</span>
                                  <div className="font-bold text-purple-900">
                                    {calculateAPR(parseFloat(stakeAmount), pool.apy, pool.lockPeriod).toFixed(2)} $OOF
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Unlock Date:</span>
                                  <div className="font-bold text-purple-900">
                                    {new Date(Date.now() + pool.lockPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={() => {
                              if (stakeAmount && parseFloat(stakeAmount) >= pool.minStake) {
                                stakeMutation.mutate({
                                  poolId: pool.id,
                                  amount: parseFloat(stakeAmount)
                                });
                              }
                            }}
                            disabled={
                              !stakeAmount || 
                              parseFloat(stakeAmount) < pool.minStake || 
                              parseFloat(stakeAmount) > userBalance.oof ||
                              stakeMutation.isPending
                            }
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <ArrowUpCircle className="w-4 h-4 mr-2" />
                            Stake $OOF
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Stakes Tab */}
          <TabsContent value="mystakes">
            <div className="space-y-6">
              {userStakes.map((stake) => {
                const pool = stakingPools.find(p => p.id === stake.poolId);
                const daysRemaining = calculateDaysRemaining(stake.unlockDate);
                const progress = ((pool!.lockPeriod - daysRemaining) / pool!.lockPeriod) * 100;
                
                return (
                  <Card key={stake.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">{getTierIcon(pool!.tier)}</span>
                          <div>
                            <h3 className="text-xl font-bold text-purple-900">{pool!.name}</h3>
                            <p className="text-purple-600">
                              {stake.amount.toLocaleString()} $OOF staked
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={stake.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {stake.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-6 mb-6">
                        <div>
                          <div className="text-sm text-gray-600">Staked Amount</div>
                          <div className="text-lg font-bold">{stake.amount.toLocaleString()} $OOF</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Rewards Earned</div>
                          <div className="text-lg font-bold text-green-600">
                            {stake.rewardsEarned.toLocaleString()} $OOF
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">APY</div>
                          <div className="text-lg font-bold">{pool!.apy}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Days Remaining</div>
                          <div className="text-lg font-bold">
                            {daysRemaining > 0 ? `${daysRemaining} days` : 'Unlocked'}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Lock Progress</span>
                          <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-4">
                        {stake.status === 'active' && daysRemaining === 0 && (
                          <>
                            <div className="flex-1">
                              <Input
                                type="number"
                                value={unstakeAmount}
                                onChange={(e) => setUnstakeAmount(e.target.value)}
                                placeholder="Amount to unstake"
                                max={stake.amount}
                              />
                            </div>
                            <Button
                              onClick={() => {
                                if (unstakeAmount) {
                                  unstakeMutation.mutate({
                                    stakeId: stake.id,
                                    amount: parseFloat(unstakeAmount)
                                  });
                                }
                              }}
                              disabled={!unstakeAmount || unstakeMutation.isPending}
                              variant="outline"
                            >
                              <ArrowDownCircle className="w-4 h-4 mr-2" />
                              Unstake
                            </Button>
                          </>
                        )}
                        {daysRemaining > 0 && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Unlock in {daysRemaining} days</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Staking Rewards Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {userBalance.pendingRewards.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">Pending Rewards</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(userStakes.reduce((sum, stake) => sum + stake.rewardsEarned, 0)).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Total Earned</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => claimRewardsMutation.mutate()}
                      disabled={claimRewardsMutation.isPending || userBalance.pendingRewards === 0}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Claim All Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievement Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {stakingPools.map((pool) => {
                      const hasStake = userStakes.some(stake => stake.poolId === pool.id);
                      return (
                        <div 
                          key={pool.id}
                          className={`text-center p-4 rounded-lg border-2 ${
                            hasStake 
                              ? 'border-purple-300 bg-purple-50' 
                              : 'border-gray-200 bg-gray-50 opacity-50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{getTierIcon(pool.tier)}</div>
                          <div className="font-bold text-sm">{pool.name}</div>
                          <div className="text-xs text-gray-600 capitalize">{pool.tier} Badge</div>
                          {hasStake && (
                            <Badge variant="secondary" className="mt-2">
                              <Trophy className="w-3 h-3 mr-1" />
                              Earned
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}