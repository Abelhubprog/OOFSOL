import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Twitter, 
  MessageSquare, 
  Heart, 
  Repeat, 
  Share, 
  Users, 
  DollarSign, 
  Clock, 
  Target, 
  TrendingUp,
  Eye,
  Zap,
  Shield,
  Play,
  Pause,
  Edit,
  Copy,
  BarChart3,
  Award,
  CheckCircle,
  AlertCircle,
  Wallet
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  budget: number;
  spentBudget: number;
  rewardPerAction: number;
  targetActions: CampaignAction[];
  status: 'active' | 'paused' | 'completed' | 'draft';
  participants: number;
  maxParticipants: number;
  createdAt: string;
  endsAt: string;
  verificationLevel: 'basic' | 'standard' | 'premium';
  contentUrls: Record<string, string>;
  analytics: CampaignAnalytics;
}

interface Platform {
  id: 'twitter' | 'farcaster' | 'tiktok' | 'arena';
  name: string;
  enabled: boolean;
  verificationDelay: number;
  costMultiplier: number;
}

interface CampaignAction {
  platform: string;
  type: 'like' | 'repost' | 'comment' | 'follow' | 'share' | 'recast';
  targetUrl: string;
  reward: number;
}

interface CampaignAnalytics {
  totalEngagements: number;
  uniqueParticipants: number;
  conversionRate: number;
  averageReward: number;
  platformBreakdown: Record<string, number>;
}

interface Participation {
  id: string;
  campaignId: string;
  participantWallet: string;
  actionsCompleted: CampaignAction[];
  totalReward: number;
  oofPointsEarned: number;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    enabled: true,
    verificationDelay: 5,
    costMultiplier: 1.0
  },
  {
    id: 'farcaster',
    name: 'Farcaster',
    enabled: true,
    verificationDelay: 2,
    costMultiplier: 1.2
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    enabled: false,
    verificationDelay: 15,
    costMultiplier: 1.5
  },
  {
    id: 'arena',
    name: 'Arena',
    enabled: true,
    verificationDelay: 3,
    costMultiplier: 0.8
  }
];

const ACTION_TYPES = [
  { id: 'like', name: 'Like', icon: Heart, baseReward: 0.10 },
  { id: 'repost', name: 'Repost/Share', icon: Repeat, baseReward: 0.25 },
  { id: 'comment', name: 'Comment', icon: MessageSquare, baseReward: 0.50 },
  { id: 'follow', name: 'Follow', icon: Users, baseReward: 1.00 },
  { id: 'share', name: 'Share', icon: Share, baseReward: 0.30 }
];

export default function OOFsCampaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    }
  });

  // Fetch user participations
  const { data: participations = [] } = useQuery({
    queryKey: ['/api/campaigns/participations'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns/participations');
      if (!response.ok) throw new Error('Failed to fetch participations');
      return response.json();
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setShowCreateForm(false);
      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully!"
      });
    }
  });

  const participateMutation = useMutation({
    mutationFn: async ({ campaignId, proofData }: { campaignId: string, proofData: any }) => {
      const response = await fetch(`/api/campaigns/${campaignId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proofData)
      });
      if (!response.ok) throw new Error('Failed to participate in campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/participations'] });
      toast({
        title: "Participation Submitted",
        description: "Your participation is being verified!"
      });
    }
  });

  const CampaignOverview = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">OOFs Campaigns</h1>
          <p className="text-xl mb-6 opacity-90">
            Create viral social media campaigns with crypto rewards. Boost engagement across multiple platforms 
            while rewarding your community with USDC and OOF points.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm opacity-80">Platforms Supported</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">$10</div>
                  <div className="text-sm opacity-80">Minimum Budget</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">2-15min</div>
                  <div className="text-sm opacity-80">Verification Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Supported Platforms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => (
              <div 
                key={platform.id}
                className={`p-4 rounded-xl border-2 ${
                  platform.enabled 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{platform.name}</h3>
                  {platform.enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Verification: {platform.verificationDelay}min</div>
                  <div>Cost multiplier: {platform.costMultiplier}x</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How OOFs Campaigns Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Create Campaign</h3>
              <p className="text-sm text-gray-600">
                Set up your campaign with target platforms, actions, and budget. 
                Choose verification level and reward structure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Community Engages</h3>
              <p className="text-sm text-gray-600">
                Users discover your campaign and complete requested actions 
                like likes, shares, comments, and follows.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Automatic Rewards</h3>
              <p className="text-sm text-gray-600">
                Smart contracts verify actions and automatically distribute 
                USDC rewards and OOF points to participants.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CampaignCreator = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      platforms: [] as string[],
      budget: 10,
      duration: 24,
      contentUrls: {} as Record<string, string>,
      targetActions: [] as any[],
      verificationLevel: "standard"
    });

    const calculateRewardPerAction = () => {
      const totalActions = formData.targetActions.length || 1;
      const platformMultiplier = formData.platforms.length > 0 
        ? formData.platforms.reduce((acc, platformId) => {
            const platform = PLATFORMS.find(p => p.id === platformId);
            return acc + (platform?.costMultiplier || 1);
          }, 0) / formData.platforms.length
        : 1;
      
      const baseReward = (formData.budget * 0.95) / totalActions; // 5% platform fee
      return (baseReward * platformMultiplier).toFixed(4);
    };

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Create New Campaign</h2>
          <p className="text-gray-600">Launch a viral social media campaign with crypto rewards</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label htmlFor="verification">Verification Level</Label>
                <Select 
                  value={formData.verificationLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, verificationLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Fast verification</SelectItem>
                    <SelectItem value="standard">Standard - Balanced security</SelectItem>
                    <SelectItem value="premium">Premium - Maximum security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your campaign goals and requirements"
                rows={3}
              />
            </div>

            <div>
              <Label>Platform Selection</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {PLATFORMS.filter(p => p.enabled).map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Switch
                      checked={formData.platforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          platforms: checked
                            ? [...prev.platforms, platform.id]
                            : prev.platforms.filter(p => p !== platform.id)
                        }));
                      }}
                    />
                    <Label className="text-sm">{platform.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="budget">Budget (USDC)</Label>
                <div className="space-y-2">
                  <Input
                    id="budget"
                    type="number"
                    min="10"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 10 }))}
                  />
                  <div className="text-sm text-gray-600">
                    Platform fee: $2 | Available for rewards: ${(formData.budget - 2).toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Select 
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Reward Calculation</h4>
              <div className="text-sm space-y-1">
                <div>Estimated reward per action: ${calculateRewardPerAction()} USDC</div>
                <div>Plus OOF points based on action type and user tier</div>
                <div className="text-xs text-gray-600 mt-2">
                  * Final rewards may vary based on verification results and platform multipliers
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => createCampaignMutation.mutate(formData)}
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ActiveCampaigns = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Campaigns</h2>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {campaigns.filter((campaign: Campaign) => campaign.status === 'active').map((campaign: Campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 mb-3">{campaign.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{campaign.participants}/{campaign.maxParticipants} participants</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${campaign.spentBudget}/${campaign.budget} spent</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Ends {new Date(campaign.endsAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Target Actions</h4>
                  <div className="space-y-2">
                    {campaign.targetActions.map((action, index) => {
                      const ActionIcon = ACTION_TYPES.find(a => a.id === action.type)?.icon || Heart;
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <ActionIcon className="w-4 h-4" />
                            <span>{action.type} on {action.platform}</span>
                          </div>
                          <span className="font-medium">${action.reward} USDC</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Analytics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Engagements:</span>
                      <span className="font-medium">{campaign.analytics.totalEngagements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate:</span>
                      <span className="font-medium">{campaign.analytics.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Reward:</span>
                      <span className="font-medium">${campaign.analytics.averageReward}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.filter((campaign: Campaign) => campaign.status === 'active').length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Campaigns</h3>
          <p className="text-gray-500 mb-6">Create your first campaign to start boosting engagement</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      )}
    </div>
  );

  const ParticipationHub = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Available Campaigns</h2>
      
      <div className="grid gap-6">
        {campaigns.filter((campaign: Campaign) => campaign.status === 'active').map((campaign: Campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 mb-3">{campaign.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${campaign.rewardPerAction} per action</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{campaign.participants} participants</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Ends {new Date(campaign.endsAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${campaign.rewardPerAction}</div>
                  <div className="text-sm text-gray-500">+ OOF points</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Required Actions</h4>
                  <div className="space-y-2">
                    {campaign.targetActions.map((action, index) => {
                      const ActionIcon = ACTION_TYPES.find(a => a.id === action.type)?.icon || Heart;
                      return (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <ActionIcon className="w-4 h-4" />
                          <span>{action.type} on {action.platform}</span>
                          <Badge variant="secondary">${action.reward}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Content Links</h4>
                  <div className="space-y-2">
                    {Object.entries(campaign.contentUrls).map(([platform, url]) => (
                      <div key={platform} className="flex items-center space-x-2 text-sm">
                        <span className="capitalize font-medium">{platform}:</span>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    // Open participation modal or navigate to participation flow
                    toast({
                      title: "Participation Started",
                      description: "Complete the required actions and submit proof for verification."
                    });
                  }}
                  className="flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Participate & Earn</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Campaigns Available</h3>
          <p className="text-gray-500">Check back later for new earning opportunities</p>
        </div>
      )}
    </div>
  );

  if (showCreateForm) {
    return <CampaignCreator />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="participate">Participate</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview">
              <CampaignOverview />
            </TabsContent>

            <TabsContent value="campaigns">
              <ActiveCampaigns />
            </TabsContent>

            <TabsContent value="participate">
              <ParticipationHub />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}