import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Award, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "👑";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}`;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-yellow-200";
      case 1:
        return "bg-gray-50 border-gray-200";
      case 2:
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-purple-800/20 border-purple-700";
    }
  };

  const isCurrentUser = (userId: string) => {
    return currentUser?.id === userId;
  };

  if (isLoading) {
    return (
      <Card className="bg-purple-800/30 border-purple-700 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
            Top Predictors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-purple-300">
            Loading leaderboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-purple-800/30 border-purple-700 glass-card">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
          Top Predictors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-purple-300">
            No rankings yet. Start making predictions to appear on the leaderboard!
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.slice(0, 10).map((user: UserType, index: number) => (
              <div 
                key={user.id} 
                className={`flex items-center p-4 rounded-lg border transition-colors ${
                  getRankBg(index)
                } ${
                  isCurrentUser(user.id) 
                    ? "ring-2 ring-purple-400 bg-purple-700/30" 
                    : ""
                }`}
              >
                <div className="flex-shrink-0 w-8 text-2xl text-center">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1 ml-4">
                  <div className="flex items-center space-x-2">
                    <div className="font-bold text-gray-900">
                      {user.firstName || user.email || `User ${user.id.slice(0, 8)}`}
                    </div>
                    {isCurrentUser(user.id) && (
                      <Badge className="bg-purple-500 text-white text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Accuracy: {user.predictionAccuracy || 0}% • 
                    Predictions: {user.totalPredictions || 0}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-purple-600 flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {user.oofScore || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.oofTokens || 0} $OOF
                  </div>
                </div>
              </div>
            ))}

            {/* Show current user if not in top 10 */}
            {currentUser && !leaderboard.slice(0, 10).some((user: UserType) => user.id === currentUser.id) && (
              <>
                <div className="border-t border-purple-700 pt-4 mt-4">
                  <div className="text-center text-purple-400 text-sm mb-2">
                    Your Position
                  </div>
                  <div className="flex items-center p-4 rounded-lg bg-purple-700/30 border border-purple-600">
                    <div className="flex-shrink-0 w-8 text-lg text-center text-white">
                      #{currentUser.ranking || "—"}
                    </div>
                    
                    <div className="flex-1 ml-4">
                      <div className="font-bold text-white flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {currentUser.firstName || "You"}
                      </div>
                      <div className="text-sm text-purple-300">
                        Accuracy: {currentUser.predictionAccuracy || 0}% • 
                        Predictions: {currentUser.totalPredictions || 0}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-purple-400 flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        {currentUser.oofScore || 0}
                      </div>
                      <div className="text-sm text-purple-300">
                        {currentUser.oofTokens || 0} $OOF
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
