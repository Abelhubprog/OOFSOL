import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target, Zap } from "lucide-react";
import type { Prediction, Token } from "@shared/schema";

interface PredictionCardProps {
  prediction: Prediction;
  tokens?: Token[];
  showUser?: boolean;
}

export default function PredictionCard({ 
  prediction, 
  tokens = [], 
  showUser = true 
}: PredictionCardProps) {
  const token = tokens.find(t => t.id === prediction.tokenId);
  const isUp = prediction.direction === "up";
  const currentPrice = parseFloat(prediction.currentPrice || "0");
  const targetPrice = parseFloat(prediction.targetPrice || "0");
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "expired":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✅ Called It!";
      case "failed":
        return "❌ Big OOF!";
      case "expired":
        return "⏰ Expired";
      default:
        return "⏳ In Progress";
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return `$${price.toFixed(9)}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatTimeframe = (timeframe: string) => {
    const timeframes: { [key: string]: string } = {
      "1h": "1 Hour",
      "4h": "4 Hours", 
      "24h": "24 Hours",
      "7d": "7 Days"
    };
    return timeframes[timeframe] || timeframe;
  };

  return (
    <Card 
      className={`bg-purple-800/30 border-purple-700 glass-card border-l-4 ${
        isUp ? "border-l-green-500" : "border-l-red-500"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-bold text-lg text-white">
              {token ? `${token.symbol}/USD` : `Token #${prediction.tokenId}`}
            </h4>
            {showUser && (
              <p className="text-sm text-purple-300">by {prediction.userId}</p>
            )}
          </div>
          <Badge 
            className={
              isUp 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }
          >
            {isUp ? (
              <>
                <TrendingUp className="w-4 h-4 mr-1" />
                🚀 Bullish
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 mr-1" />
                🐻 Bearish
              </>
            )}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-purple-300">Current Price</span>
            <span className="font-bold text-white">{formatPrice(currentPrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-purple-300">Target Price</span>
            <span className="font-bold text-white">{formatPrice(targetPrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-purple-300">Timeframe</span>
            <span className="text-white">{formatTimeframe(prediction.timeframe)}</span>
          </div>
          
          {prediction.potentialReward && (
            <div className="flex justify-between">
              <span className="text-purple-300">Potential Reward</span>
              <span className="text-purple-400 font-bold flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                {prediction.potentialReward} $OOF
              </span>
            </div>
          )}
        </div>

        {/* Expiration Info */}
        {prediction.expiresAt && prediction.status === "pending" && (
          <div className="mt-4 p-2 bg-purple-700/30 rounded text-center">
            <div className="flex items-center justify-center text-purple-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              Expires: {new Date(prediction.expiresAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Status Badge */}
        {prediction.status && prediction.status !== "pending" && (
          <div className={`mt-4 p-2 rounded text-center border ${getStatusStyle(prediction.status)}`}>
            {getStatusIcon(prediction.status)}
          </div>
        )}

        {/* Progress indicator for current price vs target */}
        {prediction.status === "pending" && currentPrice > 0 && targetPrice > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-purple-400 mb-1">
              <span>Current</span>
              <span>Target</span>
            </div>
            <div className="w-full bg-purple-700/30 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isUp ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ 
                  width: `${Math.min(100, Math.abs((targetPrice - currentPrice) / currentPrice) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
