import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import type { Token } from "@shared/schema";

interface TokenCardProps {
  token: Token;
  onQuickBuy?: (token: Token) => void;
}

export default function TokenCard({ token, onQuickBuy }: TokenCardProps) {
  const change24h = token.change24h ? parseFloat(token.change24h) : 0;
  const isPositive = change24h > 0;
  const riskScore = token.riskScore || 50;

  const getRiskBadgeStyle = (score: number) => {
    if (score > 70) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score > 40) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getRiskLabel = (score: number) => {
    if (score > 70) return "Safe";
    if (score > 40) return "Medium";
    return "High Risk";
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "$0.000000000";
    const numPrice = parseFloat(price);
    if (numPrice < 0.001) {
      return `$${numPrice.toFixed(9)}`;
    }
    return `$${numPrice.toFixed(6)}`;
  };

  const formatVolume = (volume: string | null) => {
    if (!volume) return "$0";
    const numVolume = parseFloat(volume);
    if (numVolume >= 1000000) {
      return `$${(numVolume / 1000000).toFixed(1)}M`;
    }
    if (numVolume >= 1000) {
      return `$${(numVolume / 1000).toFixed(1)}K`;
    }
    return `$${numVolume.toFixed(0)}`;
  };

  return (
    <Card className="bg-purple-800/30 border-purple-700 glass-card hover:bg-purple-700/40 transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {token.icon || "🪙"}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{token.symbol}</h3>
              <p className="text-purple-300 text-sm">{token.name}</p>
            </div>
          </div>
          <Badge className={getRiskBadgeStyle(riskScore)}>
            {getRiskLabel(riskScore)}
          </Badge>
        </div>

        {/* Price and Change */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm">Price</span>
            <span className="font-bold text-white">
              {formatPrice(token.price)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm">24h Change</span>
            <div className={`flex items-center space-x-1 ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {Math.abs(change24h).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm">Volume</span>
            <span className="text-white">
              {formatVolume(token.volume24h)}
            </span>
          </div>

          {token.marketCap && (
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-sm">Market Cap</span>
              <span className="text-white">
                {formatVolume(token.marketCap)}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {onQuickBuy && (
          <Button
            onClick={() => onQuickBuy(token)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Quick Buy
          </Button>
        )}

        {/* Launch Date */}
        {token.launchDate && (
          <div className="mt-3 text-xs text-purple-400 text-center">
            Launched: {new Date(token.launchDate).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
