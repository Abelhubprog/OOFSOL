import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, Sparkles, Star, Clock, 
  Trophy, Crown, Target, Share2,
  CheckCircle, ArrowRight, Zap
} from "lucide-react";

interface AirdropCampaign {
  id: string;
  name: string;
  description: string;
  totalTokens: string;
  tokensPerUser: string;
  startDate: string;
  endDate: string;
  requirements: string[];
  status: 'active' | 'upcoming' | 'ended';
  claimed: boolean;
  participants: number;
  maxParticipants: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function OOFAirdrop() {
  const { user } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<AirdropCampaign | null>(null);
  const [userProgress, setUserProgress] = useState({
    totalClaimed: 125000,
    weeklyStreak: 7,
    referrals: 12
  });

  const campaigns: AirdropCampaign[] = [
    {
      id: 'paper-hands-special',
      name: 'Paper Hands Redemption',
      description: 'Exclusive airdrop for traders who need redemption',
      totalTokens: '10,000,000',
      tokensPerUser: '2,500',
      startDate: '2024-03-15',
      endDate: '2024-03-30',
      requirements: [
        'Complete 5 trades in Trader\'s Arena',
        'Use Time Machine once',
        'Share one prediction'
      ],
      status: 'active',
      claimed: false,
      participants: 8432,
      maxParticipants: 10000,
      rarity: 'epic'
    },
    {
      id: 'diamond-hands-elite',
      name: 'Diamond Hands Elite',
      description: 'For the ultimate diamond hands holders',
      totalTokens: '50,000,000',
      tokensPerUser: '10,000',
      startDate: '2024-03-20',
      endDate: '2024-04-20',
      requirements: [
        'Hold position for 30+ days',
        'Zero paper hands incidents',
        'Stake minimum 1000 $OOF'
      ],
      status: 'active',
      claimed: true,
      participants: 2156,
      maxParticipants: 5000,
      rarity: 'legendary'
    },
    {
      id: 'detective-bounty',
      name: 'Detective Bounty Hunter',
      description: 'Reward for successful rug detections',
      totalTokens: '5,000,000',
      tokensPerUser: '1,000',
      startDate: '2024-03-25',
      endDate: '2024-04-10',
      requirements: [
        'Detect 3 potential rugs',
        'Help 10 users avoid scams',
        'Maintain 80%+ accuracy'
      ],
      status: 'upcoming',
      claimed: false,
      participants: 0,
      maxParticipants: 5000,
      rarity: 'rare'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const claimAirdrop = async (campaignId: string) => {
    // Implementation for claiming airdrop
    console.log(`Claiming airdrop: ${campaignId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 rounded-full p-4 animate-glow-purple">
              <Gift className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-purple-900 mb-2 gradient-text">
            OOF Airdrop Central
          </h1>
          <p className="text-purple-600">
            Claim your $OOF tokens and join the elite trading community!
          </p>
        </div>

        {/* User Stats */}
        <Card className="mb-8 oof-shadow">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {userProgress.totalClaimed.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600">Total Claimed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {userProgress.weeklyStreak}
                </div>
                <div className="text-sm text-purple-600">Weekly Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {userProgress.referrals}
                </div>
                <div className="text-sm text-purple-600">Referrals</div>
              </div>
              <div className="text-center">
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                  Elite Trader
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <div className="grid grid-cols-3 gap-8">
          {campaigns.map(campaign => (
            <Card key={campaign.id} 
                  className={`card-hover cursor-pointer transition-all duration-300
                             ${selectedCampaign?.id === campaign.id ? 'ring-4 ring-purple-300' : ''}`}
                  onClick={() => setSelectedCampaign(campaign)}>
              <div className={`h-2 ${getRarityColor(campaign.rarity)} rounded-t-lg`} />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg font-bold text-purple-900">
                    {campaign.name}
                  </CardTitle>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-purple-600 text-sm">
                  {campaign.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Token Rewards */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-600 text-sm">Reward per user</span>
                      <span className="font-bold text-purple-900">
                        {campaign.tokensPerUser} $OOF
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 text-sm">Total pool</span>
                      <span className="font-bold text-purple-900">
                        {campaign.totalTokens} $OOF
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-600 text-sm">Participants</span>
                      <span className="text-purple-900 font-bold">
                        {campaign.participants.toLocaleString()}/{campaign.maxParticipants.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(campaign.participants / campaign.maxParticipants) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <div className="text-purple-600 text-sm mb-2">Requirements:</div>
                    <div className="space-y-1">
                      {campaign.requirements.slice(0, 2).map((req, index) => (
                        <div key={index} className="flex items-center text-xs text-purple-700">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {req}
                        </div>
                      ))}
                      {campaign.requirements.length > 2 && (
                        <div className="text-xs text-purple-500">
                          +{campaign.requirements.length - 2} more requirements
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full ${
                      campaign.claimed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : campaign.status === 'active'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={campaign.status !== 'active' || campaign.claimed}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!campaign.claimed && campaign.status === 'active') {
                        claimAirdrop(campaign.id);
                      }
                    }}
                  >
                    {campaign.claimed ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Claimed
                      </>
                    ) : campaign.status === 'active' ? (
                      <>
                        <Gift className="mr-2 h-4 w-4" />
                        Claim Airdrop
                      </>
                    ) : campaign.status === 'upcoming' ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Coming Soon
                      </>
                    ) : (
                      'Ended'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Campaign Details */}
        {selectedCampaign && (
          <Card className="mt-8 oof-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-purple-900">
                  {selectedCampaign.name} - Details
                </CardTitle>
                <Badge className={`${getRarityColor(selectedCampaign.rarity)} text-white px-4 py-2`}>
                  {selectedCampaign.rarity.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-purple-900 mb-4">All Requirements:</h3>
                  <div className="space-y-3">
                    {selectedCampaign.requirements.map((req, index) => (
                      <div key={index} className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                        <span className="text-purple-900">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-purple-900 mb-4">Campaign Timeline:</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600">Start Date</span>
                      <span className="font-bold text-purple-900">{selectedCampaign.startDate}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600">End Date</span>
                      <span className="font-bold text-purple-900">{selectedCampaign.endDate}</span>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-white">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">
                          {selectedCampaign.tokensPerUser} $OOF
                        </div>
                        <div className="text-purple-200">Reward per qualified user</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Program */}
        <Card className="mt-8 oof-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-900">
              Referral Bonus Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900 mb-2">500 $OOF</div>
                <div className="text-purple-600 text-sm">Per successful referral</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900 mb-2">10%</div>
                <div className="text-purple-600 text-sm">Of their airdrop claims</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Referral Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}