import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp, Users, Crown, Share2 } from 'lucide-react';
import { useAchievements, Achievement } from '@/hooks/useAchievements';
import { QuickAchievementBadge } from '@/components/AchievementToast';
import { motion } from 'framer-motion';

export default function Achievements() {
  const { 
    achievements, 
    totalPoints, 
    getAchievementsByType, 
    getUnlockedAchievements,
    getProgressPercentage,
    trackSocialShare
  } = useAchievements();
  
  const [selectedType, setSelectedType] = useState<'all' | Achievement['type']>('all');

  const achievementTypes = [
    { type: 'all' as const, label: 'All', icon: Star, color: 'text-purple-400' },
    { type: 'social' as const, label: 'Social', icon: Users, color: 'text-blue-400' },
    { type: 'trading' as const, label: 'Trading', icon: TrendingUp, color: 'text-green-400' },
    { type: 'prediction' as const, label: 'Prediction', icon: Target, color: 'text-yellow-400' },
    { type: 'milestone' as const, label: 'Milestone', icon: Crown, color: 'text-purple-400' },
    { type: 'engagement' as const, label: 'Engagement', icon: Trophy, color: 'text-orange-400' }
  ];

  const filteredAchievements = selectedType === 'all' 
    ? achievements 
    : getAchievementsByType(selectedType);

  const unlockedCount = getUnlockedAchievements().length;
  const totalCount = achievements.length;
  const completionRate = Math.round((unlockedCount / totalCount) * 100);

  const handleShare = () => {
    const text = `🏆 I've unlocked ${unlockedCount}/${totalCount} achievements on OOF Platform! Total points: ${totalPoints} #OOFPlatform #Achievements`;
    navigator.clipboard.writeText(text);
    trackSocialShare();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
              <p className="text-purple-300">Track your progress and unlock rewards</p>
            </div>
            <Button
              onClick={handleShare}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-purple-300 text-sm">Total Points</p>
                    <p className="text-white text-2xl font-bold">{totalPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-800/50 border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-purple-300 text-sm">Unlocked</p>
                    <p className="text-white text-2xl font-bold">{unlockedCount}/{totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-800/50 border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-purple-300 text-sm">Completion</p>
                    <p className="text-white text-2xl font-bold">{completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-800/50 border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-purple-300 text-sm">Rank</p>
                    <p className="text-white text-2xl font-bold">
                      {totalPoints < 100 ? 'Novice' : 
                       totalPoints < 500 ? 'Explorer' : 
                       totalPoints < 1000 ? 'Expert' : 'Legend'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="bg-purple-800/50 border-purple-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Overall Progress</span>
                <span className="text-purple-300 text-sm">{unlockedCount}/{totalCount}</span>
              </div>
              <Progress value={completionRate} className="h-3" />
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {achievementTypes.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.type;
            
            return (
              <Button
                key={type.type}
                variant={isActive ? "default" : "outline"}
                className={`${isActive 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-purple-600 text-purple-300 hover:bg-purple-700'
                }`}
                onClick={() => setSelectedType(type.type)}
              >
                <Icon className={`w-4 h-4 mr-2 ${type.color}`} />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${
                achievement.isUnlocked 
                  ? 'bg-gradient-to-br from-purple-700 to-purple-800 border-purple-500' 
                  : 'bg-purple-800/30 border-purple-700/50'
              } hover:scale-105 transition-transform duration-200`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      achievement.isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gray-600'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${
                        achievement.isUnlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${
                          achievement.isUnlocked 
                            ? 'border-purple-400 text-purple-200' 
                            : 'border-gray-600 text-gray-400'
                        }`}>
                          {achievement.type}
                        </Badge>
                        <span className={`text-sm font-bold ${
                          achievement.isUnlocked ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          +{achievement.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className={`text-sm ${
                    achievement.isUnlocked ? 'text-purple-200' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!achievement.isUnlocked && achievement.maxProgress > 1 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(achievement.id)} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Unlock Status */}
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="text-xs text-purple-300">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Achievements */}
        {getUnlockedAchievements().length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Achievements</h2>
            <div className="flex flex-wrap gap-3">
              {getUnlockedAchievements()
                .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
                .slice(0, 5)
                .map((achievement) => (
                  <QuickAchievementBadge key={achievement.id} achievement={achievement} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}