import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, DollarSign, TrendingUp, Share2, ExternalLink } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface OOFMomentCard {
  id: string;
  type: 'paper_hands' | 'dust_collector' | 'gains_master';
  title: string;
  description: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  narrative: string;
  quote: string;
  rarity: string;
  walletAddress: string;
  metadata: {
    attributes: Array<{ trait_type: string; value: string }>;
    momentType: string;
    emoji: string;
    colors: string[];
  };
}

interface ZoraTokenLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  cards: OOFMomentCard[];
  userWallet?: string;
}

export function ZoraTokenLauncher({ isOpen, onClose, cards, userWallet }: ZoraTokenLauncherProps) {
  const [oofInvestment, setOofInvestment] = useState(25);
  const [distribution, setDistribution] = useState([40, 30, 30]);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const launchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/zora/launch-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards,
          oofInvestmentAmount: oofInvestment,
          distribution,
          userWalletAddress: userWallet
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to launch tokens');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setLaunchResult(data);
        setShowResults(true);
        toast({
          title: "Tokens Launched Successfully!",
          description: `${data.launchedTokens.length} OOF Moment tokens are now live on Zora`
        });
      } else {
        throw new Error(data.error || 'Launch failed');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Launch Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDistributionChange = (index: number, value: number) => {
    const newDistribution = [...distribution];
    const oldValue = newDistribution[index];
    const diff = value - oldValue;
    
    // Adjust other values proportionally
    const remaining = newDistribution.reduce((sum, val, i) => i === index ? sum : sum + val, 0);
    if (remaining > 0) {
      newDistribution.forEach((val, i) => {
        if (i !== index) {
          newDistribution[i] = Math.max(0, val - (diff * val) / remaining);
        }
      });
    }
    
    newDistribution[index] = value;
    
    // Normalize to 100%
    const total = newDistribution.reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      newDistribution.forEach((val, i) => {
        newDistribution[i] = (val / total) * 100;
      });
    }
    
    setDistribution(newDistribution);
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'paper_hands': return 'from-red-500 to-red-600';
      case 'dust_collector': return 'from-gray-500 to-gray-600';
      case 'gains_master': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getCardEmoji = (type: string) => {
    switch (type) {
      case 'paper_hands': return '📄';
      case 'dust_collector': return '🗑️';
      case 'gains_master': return '💎';
      default: return '🚀';
    }
  };

  if (showResults && launchResult) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-500" />
              Tokens Successfully Launched on Zora!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Launch Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Launch Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{oofInvestment}</div>
                    <div className="text-sm text-gray-600">$OOF Invested</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {launchResult.bridgeDetails.ethReceived.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600">ETH on Base</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {launchResult.launchedTokens.length}
                    </div>
                    <div className="text-sm text-gray-600">Tokens Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Launched Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {launchResult.launchedTokens.map((token: any, index: number) => {
                const card = cards.find(c => c.id === token.cardId);
                return (
                  <Card key={token.cardId} className="overflow-hidden">
                    <div className={`h-32 bg-gradient-to-br ${getCardColor(card?.type || 'default')} flex items-center justify-center`}>
                      <span className="text-4xl">{getCardEmoji(card?.type || 'default')}</span>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{card?.tokenSymbol}</CardTitle>
                      <Badge variant="outline" className="w-fit">{card?.rarity}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Initial Tokens:</span>
                          <span className="font-medium">{token.initialTokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Allocation:</span>
                          <span className="font-medium">{token.allocation.toFixed(4)} ETH</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(token.zoraUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Zora
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(token.zoraUrl);
                            toast({ title: "Copied!", description: "Zora URL copied to clipboard" });
                          }}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Your Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `Just launched my OOF Moments as tokens on @zora! 🚀 ${launchResult.launchedTokens.length} unique trading stories now live on-chain.`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `Check out my crypto trading stories turned into tokens on Zora!`;
                      const url = launchResult.launchedTokens[0]?.zoraUrl || '';
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    Share on Telegram
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Launch OOF Moments as Zora Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investment Amount */}
          <div className="space-y-2">
            <Label htmlFor="investment">Investment Amount ($OOF)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="investment"
                type="number"
                min="1"
                max="100"
                value={oofInvestment}
                onChange={(e) => setOofInvestment(Number(e.target.value))}
                className="w-24"
              />
              <Slider
                value={[oofInvestment]}
                onValueChange={(values) => setOofInvestment(values[0])}
                max={100}
                min={1}
                step={1}
                className="flex-1"
              />
            </div>
            <div className="text-sm text-gray-600">
              ≈ {(oofInvestment * 0.0025).toFixed(4)} ETH on Base network
            </div>
          </div>

          {/* Distribution Settings */}
          <div className="space-y-4">
            <Label>Token Allocation Distribution</Label>
            {cards.map((card, index) => (
              <div key={card.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCardEmoji(card.type)}</span>
                    <span className="font-medium">{card.tokenSymbol}</span>
                    <Badge variant="outline">{card.rarity}</Badge>
                  </div>
                  <span className="font-medium">{distribution[index]?.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[distribution[index] || 0]}
                  onValueChange={(values) => handleDistributionChange(index, values[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-600">
                  ≈ {((oofInvestment * (distribution[index] || 0)) / 100 * 0.0025).toFixed(4)} ETH allocation
                </div>
              </div>
            ))}
          </div>

          {/* Preview Cards */}
          <div className="space-y-2">
            <Label>Preview Your Tokens</Label>
            <div className="grid grid-cols-3 gap-2">
              {cards.map((card, index) => (
                <div key={card.id} className="text-center p-3 border rounded-lg">
                  <div className="text-2xl mb-1">{getCardEmoji(card.type)}</div>
                  <div className="text-xs font-medium">{card.tokenSymbol}</div>
                  <div className="text-xs text-gray-600">{distribution[index]?.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Chain Bridge Info */}
          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-blue-900 dark:text-blue-100">Cross-Chain Bridge</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Your $OOF tokens will be automatically bridged from Solana to Base network to fund the Zora token launches.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Launch Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => launchMutation.mutate()}
              disabled={launchMutation.isPending || !userWallet}
              className="min-w-32"
            >
              {launchMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Launching...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Launch Tokens
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}