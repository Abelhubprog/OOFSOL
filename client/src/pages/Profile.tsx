import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Twitter, 
  MessageCircle, 
  Send, 
  Play, 
  Briefcase, 
  ExternalLink,
  Zap,
  TrendingUp,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface SocialHandle {
  platform: string;
  handle: string;
  url: string;
  icon: React.ReactNode;
  verified: boolean;
}

interface ActiveBuyingStatus {
  token: string;
  tokenSymbol: string;
  contractAddress: string;
  platform: 'pump.fun' | 'dexscreener' | 'proton';
  isActive: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([
    {
      platform: 'Twitter',
      handle: '@thethreadguy',
      url: 'https://twitter.com/thethreadguy',
      icon: <Twitter size={20} />,
      verified: true
    },
    {
      platform: 'Farcaster',
      handle: '@threadguy.eth',
      url: 'https://warpcast.com/threadguy.eth',
      icon: <MessageCircle size={20} />,
      verified: true
    },
    {
      platform: 'Discord',
      handle: 'OOF Community',
      url: 'https://discord.gg/oof-community',
      icon: <MessageCircle size={20} />,
      verified: false
    },
    {
      platform: 'Telegram',
      handle: '@oof_signals',
      url: 'https://t.me/oof_signals',
      icon: <Send size={20} />,
      verified: true
    },
    {
      platform: 'TikTok',
      handle: '@oofmemecoin',
      url: 'https://tiktok.com/@oofmemecoin',
      icon: <Play size={20} />,
      verified: false
    }
  ]);

  const [projects, setProjects] = useState([
    {
      name: 'OOF Platform',
      description: 'Revolutionary memecoin trading platform with AI-powered analytics',
      status: 'Live',
      url: 'https://oof.platform'
    },
    {
      name: 'Memecoin Detective',
      description: 'Advanced rug detection and token analysis tools',
      status: 'Beta',
      url: 'https://detective.oof.platform'
    }
  ]);

  const [activeBuying, setActiveBuying] = useState<ActiveBuyingStatus>({
    token: 'OOF',
    tokenSymbol: '$OOF',
    contractAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    platform: 'pump.fun',
    isActive: true
  });

  const getPlatformUrl = (platform: string, ca: string) => {
    switch (platform) {
      case 'pump.fun':
        return `https://pump.fun/coin/${ca}`;
      case 'dexscreener':
        return `https://dexscreener.com/solana/${ca}`;
      case 'proton':
        return `https://proton.io/token/${ca}`;
      default:
        return '#';
    }
  };

  const updateSocialHandle = (index: number, newHandle: string) => {
    const updated = [...socialHandles];
    updated[index].handle = newHandle;
    setSocialHandles(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {user?.firstName || 'OOF Trader'}
              </h1>
              <p className="text-purple-300">Memecoin Enthusiast & Web3 Builder</p>
            </div>
          </div>
          <Button
            onClick={() => setEditing(!editing)}
            variant="outline"
            className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
          >
            <Edit3 size={16} className="mr-2" />
            {editing ? 'Save' : 'Edit Profile'}
          </Button>
        </div>

        {/* Active Buying Status */}
        {activeBuying.isActive && (
          <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Circle className="w-3 h-3 text-green-400 fill-current animate-pulse" />
                    <span className="text-green-400 font-semibold">ACTIVELY BUYING</span>
                  </div>
                  <div className="text-white">
                    <span className="animate-pulse">
                      I @thethreadguy am actively bullish and buying {activeBuying.tokenSymbol} on SOL
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                    CA: {activeBuying.contractAddress.slice(0, 8)}...
                  </Badge>
                  <Button 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(getPlatformUrl(activeBuying.platform, activeBuying.contractAddress), '_blank')}
                  >
                    <ExternalLink size={14} className="mr-1" />
                    {activeBuying.platform}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Handles */}
        <Card className="bg-white/5 border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageCircle className="mr-2" size={20} />
              Social Handles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialHandles.map((social, index) => (
              <div key={social.platform} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-purple-400">
                    {social.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium">{social.platform}</p>
                    {editing ? (
                      <Input
                        value={social.handle}
                        onChange={(e) => updateSocialHandle(index, e.target.value)}
                        className="bg-white/10 border-purple-400/30 text-white"
                      />
                    ) : (
                      <p className="text-purple-300">{social.handle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {social.verified && (
                    <Badge className="bg-green-600/20 text-green-400">Verified</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(social.url, '_blank')}
                    className="text-purple-400 hover:text-white"
                  >
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="bg-white/5 border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Briefcase className="mr-2" size={20} />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{project.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={project.status === 'Live' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}
                    >
                      {project.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(project.url, '_blank')}
                      className="text-purple-400 hover:text-white"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>
                {editing ? (
                  <Textarea
                    value={project.description}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[index].description = e.target.value;
                      setProjects(updated);
                    }}
                    className="bg-white/10 border-purple-400/30 text-white"
                  />
                ) : (
                  <p className="text-purple-300">{project.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-purple-400/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="mx-auto mb-2 text-green-400" size={32} />
              <p className="text-2xl font-bold text-white">847</p>
              <p className="text-purple-300">OOF Tokens</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-purple-400/20">
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-2 text-yellow-400" size={32} />
              <p className="text-2xl font-bold text-white">92.3%</p>
              <p className="text-purple-300">Prediction Accuracy</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-purple-400/20">
            <CardContent className="p-6 text-center">
              <User className="mx-auto mb-2 text-purple-400" size={32} />
              <p className="text-2xl font-bold text-white">#15</p>
              <p className="text-purple-300">Global Ranking</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}