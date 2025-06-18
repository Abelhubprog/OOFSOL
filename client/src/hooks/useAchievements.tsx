import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'social' | 'trading' | 'prediction' | 'milestone' | 'engagement';
  points: number;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  confettiType: 'firstLogin' | 'firstPrediction' | 'tokenTradeSuccess' | 'levelUp' | 'milestone';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_login',
    title: 'Welcome to OOF!',
    description: 'Complete your first login to the platform',
    type: 'social',
    points: 10,
    icon: '🎉',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    confettiType: 'firstLogin'
  },
  {
    id: 'first_prediction',
    title: 'Crystal Ball',
    description: 'Make your first token prediction',
    type: 'prediction',
    points: 25,
    icon: '🔮',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    confettiType: 'firstPrediction'
  },
  {
    id: 'first_trade',
    title: 'Trader Initiate',
    description: 'Execute your first token trade',
    type: 'trading',
    points: 50,
    icon: '💎',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    confettiType: 'tokenTradeSuccess'
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Share 5 achievements on social media',
    type: 'social',
    points: 75,
    icon: '🦋',
    isUnlocked: false,
    progress: 0,
    maxProgress: 5,
    confettiType: 'milestone'
  },
  {
    id: 'prediction_master',
    title: 'Prediction Master',
    description: 'Make 10 successful predictions',
    type: 'prediction',
    points: 100,
    icon: '🏆',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    confettiType: 'levelUp'
  },
  {
    id: 'whale_trader',
    title: 'Whale Trader',
    description: 'Complete trades worth over 100 SOL',
    type: 'trading',
    points: 200,
    icon: '🐋',
    isUnlocked: false,
    progress: 0,
    maxProgress: 100,
    confettiType: 'milestone'
  },
  {
    id: 'oof_legend',
    title: 'OOF Legend',
    description: 'Reach 1000 total points',
    type: 'milestone',
    points: 500,
    icon: '👑',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000,
    confettiType: 'levelUp'
  }
];

export function useAchievements() {
  const { user } = useDynamicContext();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeConfetti, setActiveConfetti] = useState<string | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);

  // Load achievements from localStorage
  useEffect(() => {
    if (user?.userId) {
      const saved = localStorage.getItem(`achievements_${user.userId}`);
      if (saved) {
        try {
          const savedAchievements = JSON.parse(saved);
          setAchievements(savedAchievements);
          
          // Calculate total points
          const points = savedAchievements
            .filter((a: Achievement) => a.isUnlocked)
            .reduce((sum: number, a: Achievement) => sum + a.points, 0);
          setTotalPoints(points);
        } catch (error) {
          console.error('Error loading achievements:', error);
        }
      }
    }
  }, [user?.userId]);

  // Save achievements to localStorage
  const saveAchievements = useCallback((updatedAchievements: Achievement[]) => {
    if (user?.userId) {
      localStorage.setItem(`achievements_${user.userId}`, JSON.stringify(updatedAchievements));
    }
  }, [user?.userId]);

  // Trigger achievement unlock
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.isUnlocked) {
          const unlockedAchievement = {
            ...achievement,
            isUnlocked: true,
            unlockedAt: new Date(),
            progress: achievement.maxProgress
          };
          
          // Trigger confetti
          setActiveConfetti(achievement.confettiType);
          
          // Add to recent unlocks
          setRecentUnlocks(recent => [unlockedAchievement, ...recent.slice(0, 4)]);
          
          // Update total points
          setTotalPoints(current => current + achievement.points);
          
          return unlockedAchievement;
        }
        return achievement;
      });
      
      saveAchievements(updated);
      return updated;
    });
  }, [saveAchievements]);

  // Update achievement progress
  const updateProgress = useCallback((achievementId: string, progress: number) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.isUnlocked) {
          const newProgress = Math.min(progress, achievement.maxProgress);
          const shouldUnlock = newProgress >= achievement.maxProgress;
          
          if (shouldUnlock) {
            const unlockedAchievement = {
              ...achievement,
              isUnlocked: true,
              unlockedAt: new Date(),
              progress: newProgress
            };
            
            // Trigger confetti
            setActiveConfetti(achievement.confettiType);
            
            // Add to recent unlocks
            setRecentUnlocks(recent => [unlockedAchievement, ...recent.slice(0, 4)]);
            
            // Update total points
            setTotalPoints(current => current + achievement.points);
            
            return unlockedAchievement;
          }
          
          return { ...achievement, progress: newProgress };
        }
        return achievement;
      });
      
      saveAchievements(updated);
      return updated;
    });
  }, [saveAchievements]);

  // Convenience methods for common actions
  const trackLogin = useCallback(() => {
    unlockAchievement('first_login');
  }, [unlockAchievement]);

  const trackPrediction = useCallback(() => {
    updateProgress('first_prediction', 1);
    updateProgress('prediction_master', 
      achievements.find(a => a.id === 'prediction_master')?.progress + 1 || 1
    );
  }, [updateProgress, achievements]);

  const trackTrade = useCallback((amount: number = 1) => {
    updateProgress('first_trade', 1);
    updateProgress('whale_trader', 
      achievements.find(a => a.id === 'whale_trader')?.progress + amount || amount
    );
  }, [updateProgress, achievements]);

  const trackSocialShare = useCallback(() => {
    updateProgress('social_butterfly',
      achievements.find(a => a.id === 'social_butterfly')?.progress + 1 || 1
    );
  }, [updateProgress, achievements]);

  // Clear active confetti
  const clearConfetti = useCallback(() => {
    setActiveConfetti(null);
  }, []);

  // Get achievements by type
  const getAchievementsByType = useCallback((type: Achievement['type']) => {
    return achievements.filter(a => a.type === type);
  }, [achievements]);

  // Get unlocked achievements
  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => a.isUnlocked);
  }, [achievements]);

  // Get achievement progress percentage
  const getProgressPercentage = useCallback((achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    return (achievement.progress / achievement.maxProgress) * 100;
  }, [achievements]);

  return {
    achievements,
    totalPoints,
    activeConfetti,
    recentUnlocks,
    unlockAchievement,
    updateProgress,
    trackLogin,
    trackPrediction,
    trackTrade,
    trackSocialShare,
    clearConfetti,
    getAchievementsByType,
    getUnlockedAchievements,
    getProgressPercentage
  };
}