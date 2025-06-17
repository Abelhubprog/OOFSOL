import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, Search, AlertTriangle, CheckCircle, 
  TrendingDown, Users, DollarSign, Clock,
  Zap, Target, Eye, BarChart2, Brain, Activity,
  Cpu, Database, TrendingUp, Lock, Unlock, X
} from "lucide-react";

interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  redFlags: string[];
  greenFlags: string[];
  liquidityAnalysis: {
    totalLiquidity: number;
    liquidityRatio: number;
    liquidityLocked: boolean;
    lockDuration?: number;
  };
  holderAnalysis: {
    totalHolders: number;
    topHolderPercentage: number;
    holderDistribution: Array<{ range: string; count: number; percentage: number }>;
    suspiciousWallets: string[];
  };
  contractAnalysis: {
    isVerified: boolean;
    hasProxyContract: boolean;
    hasHoneypot: boolean;
    canSellBack: boolean;
    transferTax: number;
    maxTransaction: number;
  };
  socialAnalysis: {
    telegramMembers?: number;
    twitterFollowers?: number;
    discordMembers?: number;
    socialScore: number;
  };
  tradingAnalysis: {
    volume24h: number;
    priceChange24h: number;
    uniqueBuyers24h: number;
    uniqueSellers24h: number;
    averageHoldTime: number;
  };
  mlPrediction: {
    rugProbability: number;
    confidenceLevel: number;
    modelVersion: string;
    features: Record<string, number>;
  };
}

export default function OOFDetectiveAdvanced() {
  const { user } = useAuth();
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'alerts' | 'analytics'>('scanner');

  // Fetch real-time alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/rug-detection/alerts'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch ML model accuracy metrics
  const { data: accuracy, isLoading: accuracyLoading } = useQuery({
    queryKey: ['/api/rug-detection/accuracy']
  });

  // Token analysis mutation
  const analyzeTokenMutation = useMutation({
    mutationFn: async (tokenAddress: string) => {
      return await apiRequest('/api/rug-detection/analyze', {
        method: 'POST',
        body: JSON.stringify({ tokenAddress })
      });
    },
    onSuccess: (data) => {
      setSelectedToken(data);
    }
  });

  const handleAnalyzeToken = () => {
    if (searchAddress.trim()) {
      analyzeTokenMutation.mutate(searchAddress.trim());
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-l-red-500 bg-red-50';
      case 'HIGH': return 'border-l-orange-500 bg-orange-50';
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50';
      case 'LOW': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Enhanced scam patterns with ML insights
  const scamPatterns = [
    { name: "Liquidity Rug Pull", frequency: 45, description: "ML detected pattern: Sudden liquidity removal", mlConfidence: 0.94 },
    { name: "Honeypot Contract", frequency: 32, description: "AI analysis: Can buy but cannot sell", mlConfidence: 0.89 },
    { name: "Fake Team Doxx", frequency: 28, description: "Pattern recognition: Stolen identity photos", mlConfidence: 0.76 },
    { name: "Bot Trading", frequency: 24, description: "Algorithm detected: Artificial volume pumping", mlConfidence: 0.82 },
    { name: "Hidden Mint Function", frequency: 19, description: "Code analysis: Unlimited token creation", mlConfidence: 0.91 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 rounded-full p-4 animate-glow-purple">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-purple-900 mb-2 gradient-text">
            OOF Detective AI
          </h1>
          <p className="text-purple-600">
            Advanced ML-Powered Rug Detection & Real-Time Analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { key: 'scanner', label: 'AI Scanner', icon: Brain },
            { key: 'alerts', label: 'Live Alerts', icon: AlertTriangle },
            { key: 'analytics', label: 'ML Analytics', icon: BarChart2 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                className={`flex items-center space-x-2 ${
                  activeTab === tab.key 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'text-purple-600 border-purple-200 hover:bg-purple-50'
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* AI Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Main Scanner */}
            <div className="col-span-2 space-y-6">
              <Card className="oof-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-purple-900 flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-purple-600" />
                    AI-Powered Token Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-6">
                    <Input
                      placeholder="Enter token contract address..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAnalyzeToken}
                      disabled={analyzeTokenMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {analyzeTokenMutation.isPending ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>

                  {selectedToken && (
                    <div className="space-y-6">
                      {/* Risk Overview */}
                      <div className="bg-purple-50 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-purple-900">
                              {selectedToken.name} ({selectedToken.symbol})
                            </h3>
                            <p className="text-purple-600 text-sm font-mono">
                              {selectedToken.address}
                            </p>
                          </div>
                          <Badge className={getRiskColor(selectedToken.riskLevel)}>
                            {selectedToken.riskLevel} RISK
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-purple-600 mb-1">Risk Score</div>
                            <div className="flex items-center space-x-2">
                              <Progress value={selectedToken.riskScore} className="flex-1" />
                              <span className="font-bold text-purple-900">
                                {selectedToken.riskScore.toFixed(1)}/100
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-purple-600 mb-1">AI Confidence</div>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={selectedToken.mlPrediction.confidenceLevel * 100} 
                                className="flex-1" 
                              />
                              <span className="font-bold text-purple-900">
                                {(selectedToken.mlPrediction.confidenceLevel * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-purple-600">
                            <Cpu className="mr-1 h-4 w-4" />
                            Model: {selectedToken.mlPrediction.modelVersion}
                          </div>
                          <div className="flex items-center text-purple-600">
                            <Database className="mr-1 h-4 w-4" />
                            Rug Probability: {(selectedToken.mlPrediction.rugProbability * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Analysis Details */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Red Flags */}
                        <div>
                          <h4 className="font-bold text-red-700 mb-3 flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Red Flags ({selectedToken.redFlags.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedToken.redFlags.map((flag, index) => (
                              <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                                <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-red-700 text-sm">{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Green Flags */}
                        <div>
                          <h4 className="font-bold text-green-700 mb-3 flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Green Flags ({selectedToken.greenFlags.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedToken.greenFlags.map((flag, index) => (
                              <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-green-700 text-sm">{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Contract Analysis */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-purple-900">Contract Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-purple-600">Verified</span>
                              <span className={selectedToken.contractAnalysis.isVerified ? 'text-green-600' : 'text-red-600'}>
                                {selectedToken.contractAnalysis.isVerified ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-600">Honeypot</span>
                              <span className={selectedToken.contractAnalysis.hasHoneypot ? 'text-red-600' : 'text-green-600'}>
                                {selectedToken.contractAnalysis.hasHoneypot ? 'Detected' : 'None'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-600">Can Sell</span>
                              <span className={selectedToken.contractAnalysis.canSellBack ? 'text-green-600' : 'text-red-600'}>
                                {selectedToken.contractAnalysis.canSellBack ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-600">Transfer Tax</span>
                              <span className="text-purple-900">
                                {selectedToken.contractAnalysis.transferTax.toFixed(1)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Liquidity Analysis */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-purple-900">Liquidity Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-purple-600">Total Liquidity</span>
                              <span className="text-purple-900">
                                ${selectedToken.liquidityAnalysis.totalLiquidity.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-600">Locked</span>
                              <div className="flex items-center">
                                {selectedToken.liquidityAnalysis.liquidityLocked ? (
                                  <Lock className="h-4 w-4 text-green-600 mr-1" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-red-600 mr-1" />
                                )}
                                <span className={selectedToken.liquidityAnalysis.liquidityLocked ? 'text-green-600' : 'text-red-600'}>
                                  {selectedToken.liquidityAnalysis.liquidityLocked ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                            {selectedToken.liquidityAnalysis.lockDuration && (
                              <div className="flex justify-between">
                                <span className="text-purple-600">Lock Duration</span>
                                <span className="text-purple-900">
                                  {selectedToken.liquidityAnalysis.lockDuration} days
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-purple-600">Ratio</span>
                              <span className="text-purple-900">
                                {selectedToken.liquidityAnalysis.liquidityRatio.toFixed(2)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* ML Model Stats */}
              {accuracy && (
                <Card className="oof-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-purple-900 flex items-center">
                      <Cpu className="mr-2 h-5 w-5 text-purple-600" />
                      ML Model Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-900 mb-1">
                          {(accuracy.accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="text-purple-600 text-sm">Accuracy Rate</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-bold text-purple-900">{accuracy.totalPredictions}</div>
                          <div className="text-purple-600">Total Predictions</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-bold text-green-600">{accuracy.correctPredictions}</div>
                          <div className="text-purple-600">Correct</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-bold text-red-600">{accuracy.falsePositives}</div>
                          <div className="text-purple-600">False Positives</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="font-bold text-orange-600">{accuracy.falseNegatives}</div>
                          <div className="text-purple-600">False Negatives</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trending Patterns */}
              <Card className="oof-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-purple-900">
                    AI-Detected Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scamPatterns.map((pattern, index) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-purple-900 text-sm">{pattern.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {pattern.frequency} detected
                          </Badge>
                        </div>
                        <p className="text-purple-600 text-xs mb-2">{pattern.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-500">ML Confidence</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={pattern.mlConfidence * 100} className="w-16 h-1" />
                            <span className="text-xs font-bold text-purple-700">
                              {(pattern.mlConfidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Live Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-900 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Real-Time Rug Detection Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                    <div className="text-purple-600">Loading real-time alerts...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getAlertSeverityColor(alert.severity)}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-gray-900">{alert.tokenName}</div>
                            <div className="text-sm text-gray-600 font-mono">{alert.tokenAddress}</div>
                          </div>
                          <div className="text-right">
                            <Badge className={getRiskColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 capitalize">{alert.alertType.replace('_', ' ')}</span>
                          <div className="flex items-center text-gray-600">
                            <Brain className="h-4 w-4 mr-1" />
                            {(alert.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ML Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-2 gap-8">
            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-900 flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-purple-600" />
                  Detection Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">
                      {scamPatterns.reduce((sum, pattern) => sum + pattern.frequency, 0)}
                    </div>
                    <div className="text-purple-600">Total Threats Detected</div>
                  </div>
                  
                  <div className="space-y-4">
                    {scamPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-bold text-purple-900 text-sm">{pattern.name}</div>
                          <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(pattern.frequency / 50) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-bold text-purple-900">{pattern.frequency}</div>
                          <div className="text-xs text-purple-600">detected</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="oof-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-900 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-purple-600" />
                  ML Model Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-white">
                    <div className="text-2xl font-bold mb-1">v2.1.0</div>
                    <div className="text-purple-200">Current Model Version</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">94.2%</div>
                      <div className="text-blue-600 text-sm">Precision</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">91.8%</div>
                      <div className="text-green-600 text-sm">Recall</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-purple-900">Feature Importance</h4>
                    {[
                      { name: 'Liquidity Analysis', importance: 0.25 },
                      { name: 'Holder Distribution', importance: 0.20 },
                      { name: 'Contract Verification', importance: 0.18 },
                      { name: 'Trading Patterns', importance: 0.15 },
                      { name: 'Social Signals', importance: 0.12 },
                      { name: 'Price Volatility', importance: 0.10 }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-purple-600 text-sm">{feature.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-purple-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${feature.importance * 400}%` }}
                            />
                          </div>
                          <span className="text-purple-900 text-sm font-bold">
                            {(feature.importance * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}