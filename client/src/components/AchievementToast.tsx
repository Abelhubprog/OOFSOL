import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/hooks/useAchievements';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Share2, Twitter, Copy } from 'lucide-react';
import { useState } from 'react';

interface AchievementToastProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  onShare?: (platform: 'twitter' | 'copy') => void;
}

export default function AchievementToast({ 
  achievement, 
  isVisible, 
  onClose,
  onShare 
}: AchievementToastProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform: 'twitter' | 'copy') => {
    setIsSharing(true);
    
    const text = `🎉 Just unlocked "${achievement.title}" on OOF Platform! ${achievement.description} #OOFPlatform #Solana #Achievement`;
    
    if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    
    onShare?.(platform);
    setTimeout(() => setIsSharing(false), 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="bg-gradient-to-r from-purple-900 to-purple-800 border-purple-600 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Achievement Icon */}
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                >
                  {achievement.icon}
                </motion.div>

                {/* Achievement Content */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-sm truncate">
                        Achievement Unlocked!
                      </h3>
                      <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                        +{achievement.points}
                      </span>
                    </div>
                    <h4 className="text-purple-200 font-semibold text-sm mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-purple-300 text-xs leading-relaxed">
                      {achievement.description}
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex items-center gap-2 mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500 text-purple-300 hover:bg-purple-700 h-7 px-2"
                      onClick={() => handleShare('twitter')}
                      disabled={isSharing}
                    >
                      <Twitter className="w-3 h-3 mr-1" />
                      Tweet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500 text-purple-300 hover:bg-purple-700 h-7 px-2"
                      onClick={() => handleShare('copy')}
                      disabled={isSharing}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </motion.div>
                </div>

                {/* Close Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0 w-6 h-6 p-0 text-purple-400 hover:text-white hover:bg-purple-700"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Quick achievement notification for bulk displays
export function QuickAchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full px-3 py-1 text-xs"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-lg">{achievement.icon}</span>
      <span className="text-white font-medium">{achievement.title}</span>
      <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold text-xs">
        +{achievement.points}
      </span>
    </motion.div>
  );
}