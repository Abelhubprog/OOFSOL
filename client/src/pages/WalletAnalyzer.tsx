import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, TrendingDown, Clock, AlertTriangle, Wallet } from "lucide-react";

interface MissedOpportunity {
  id: number;
  tokenName: string;
  tokenSymbol: string;
  description: string;
  missedGains: number;
  oofFactor: number;
  sellDate: string;
  peakDate: string;
}

export default function WalletAnalyzer() {
  const [walletAddress, setWalletAddress] = useState("");
  const [opportunities, setOpportunities] = useState<MissedOpportunity[]>([]);
  const { toast } = useToast();
  const { publicKey, connect, disconnect, connected } = useSolana();

  const analyzeWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/analyze-wallet", {
        walletAddress: address,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setOpportunities(data);
      toast({
        title: "Wallet Analyzed!",
        description: `Found ${data.length} epic OOF moments in your wallet.`,
      });
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
        title: "Analysis Failed",
        description: "Failed to analyze wallet. Please check the address and try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
      let address = walletAddress;
      if (!walletAddress.trim() && publicKey) {
          address = publicKey.toString();
      }

    if (!address.trim()) {
      toast({
        title: "Missing Wallet Address",
        description: "Please enter a valid Solana wallet address.",
        variant: "destructive",
      });
      return;
    }
    analyzeWalletMutation.mutate(address);
  };

  const getOofFactorColor = (factor: number) => {
    if (factor >= 8) return "text-red-600 bg-red-50";
    if (factor >= 6) return "text-orange-600 bg-orange-50";
    if (factor >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-blue-600 bg-blue-50";
  };

  const getOofFactorLabel = (factor: number) => {
    if (factor >= 8) return "LEGENDARY OOF";
    if (factor >= 6) return "EPIC OOF";
    if (factor >= 4) return "BIG OOF";
    return "SMALL OOF";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 mr-3 text-purple-400" />
            OOF Wallet Analyzer
          </h1>
          <p className="text-purple-300">Discover your most epic missed opportunities 🕵️‍♂️</p>
        </div>

        {/* Analyzer Interface */}
        <Card className="bg-purple-800/30 border-purple-700 glass-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input
                type="text"
                placeholder="Enter Solana wallet address..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1 bg-purple-700/50 border-purple-600 text-white placeholder:text-purple-400"
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzeWalletMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-bold"
              >
                {analyzeWalletMutation.isPending ? "Analyzing..." : "Analyze Wallet"}
              </Button>
            </div>

            {analyzeWalletMutation.isPending && (
              <div className="text-center py-4">
                <div className="text-purple-300">🔍 Scanning blockchain for your biggest OOFs...</div>
              </div>
            )}
             {!connected ? (
                <Button onClick={connect}>Connect Wallet</Button>
            ) : (
                <Button onClick={disconnect}>Disconnect Wallet</Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {opportunities.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Your Top OOF Moments 💔</h3>
              <div className="text-sm text-purple-300">
                Total Missed Gains: ${opportunities.reduce((sum, opp) => sum + opp.missedGains, 0).toLocaleString()}
              </div>
            </div>

            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">
                        {opportunity.tokenSymbol === "BONK" && "🐕"}
                        {opportunity.tokenSymbol === "MYRO" && "🐱"}
                        {opportunity.tokenSymbol === "WIF" && "🐶"}
                        {!["BONK", "MYRO", "WIF"].includes(opportunity.tokenSymbol) && "🪙"}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-red-900">
                          {opportunity.tokenName} {getOofFactorLabel(opportunity.oofFactor)}
                        </h4>
                        <p className="text-red-600">{opportunity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        -${opportunity.missedGains.toLocaleString()}
                      </div>
                      <div className="text-sm text-red-500">Missed Gains</div>
                      <Badge className={`mt-2 ${getOofFactorColor(opportunity.oofFactor)}`}>
                        OOF Factor: {opportunity.oofFactor}/10
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-red-100 p-3 rounded-lg mb-4">
                    <div className="text-sm text-red-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Sell Date:</span>{" "}
                          {new Date(opportunity.sellDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Peak Date:</span>{" "}
                          {new Date(opportunity.peakDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-bold">
                          {opportunity.oofFactor >= 8 ? "This is the stuff of legends! 🏆" :
                           opportunity.oofFactor >= 6 ? "Epic paper hands move! 🤦‍♂️" :
                           opportunity.oofFactor >= 4 ? "Weak hands syndrome! 😅" :
                           "Small oofs happen to everyone! 🤷‍♂️"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Mint OOF NFT
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Share OOF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Share All Results */}
            <div className="text-center pt-6">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-bold px-8 py-4">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Share My Complete OOF Story 📱
              </Button>
              <div className="mt-4 text-sm text-purple-300">
                Turn your pain into gains! Share your OOFs and earn $OOF tokens from the community.
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analyzeWalletMutation.isPending && opportunities.length === 0 && walletAddress && (
          <Card className="bg-purple-800/30 border-purple-700 glass-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">No Major OOFs Found!</h3>
              <p className="text-purple-300">
                Either you're a diamond-handed legend, or you haven't started trading memecoins yet!
              </p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                Start Your Memecoin Journey
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
       <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet Analyzer</h1>
        <p className="text-muted-foreground">
          Powered by Solana App Kit - Connect your wallet to explore advanced features
        </p>
      </div>

      <SolanaAppKitDemo />
    </div>
    </div>
  );
}