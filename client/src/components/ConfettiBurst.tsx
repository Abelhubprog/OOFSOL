import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

interface ConfettiBurstProps {
  isActive: boolean;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
  onComplete?: () => void;
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function ConfettiBurst({ 
  isActive, 
  duration = 3000, 
  intensity = 'medium',
  colors = defaultColors,
  onComplete 
}: ConfettiBurstProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getIntensitySettings = () => {
    switch (intensity) {
      case 'low':
        return { count: 30, spread: 60 };
      case 'medium':
        return { count: 60, spread: 80 };
      case 'high':
        return { count: 100, spread: 100 };
      default:
        return { count: 60, spread: 80 };
    }
  };

  const createConfetti = () => {
    const { count, spread } = getIntensitySettings();
    const pieces: ConfettiPiece[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = Math.random() * 15 + 10;
      const shapes: ('circle' | 'square' | 'triangle' | 'diamond')[] = ['circle', 'square', 'triangle', 'diamond'];

      pieces.push({
        id: i,
        x: 50, // Start from center
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity * (spread / 100),
        velocityY: Math.sin(angle) * velocity * (spread / 100) - Math.random() * 10,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }

    setConfetti(pieces);
    setIsAnimating(true);

    // Clear confetti after duration
    setTimeout(() => {
      setIsAnimating(false);
      setConfetti([]);
      onComplete?.();
    }, duration);
  };

  useEffect(() => {
    if (isActive && !isAnimating) {
      createConfetti();
    }
  }, [isActive]);

  const renderShape = (piece: ConfettiPiece) => {
    const style = {
      width: piece.size,
      height: piece.size,
      backgroundColor: piece.color,
    };

    switch (piece.shape) {
      case 'circle':
        return <div className="rounded-full" style={style} />;
      case 'square':
        return <div style={style} />;
      case 'triangle':
        return (
          <div 
            style={{
              width: 0,
              height: 0,
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
            }}
          />
        );
      case 'diamond':
        return (
          <div 
            className="transform rotate-45"
            style={style}
          />
        );
      default:
        return <div className="rounded-full" style={style} />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {isAnimating && confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            initial={{
              x: `${piece.x}vw`,
              y: `${piece.y}vh`,
              rotate: piece.rotation,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: `${piece.x + piece.velocityX * 5}vw`,
              y: `${piece.y + piece.velocityY * 5 + 100}vh`,
              rotate: piece.rotation + 720,
              scale: 0,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {renderShape(piece)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Achievement-specific confetti variants
export const AchievementConfetti = {
  firstLogin: (isActive: boolean, onComplete?: () => void) => (
    <ConfettiBurst
      isActive={isActive}
      intensity="medium"
      colors={['#9333ea', '#a855f7', '#c084fc', '#e879f9']}
      onComplete={onComplete}
    />
  ),
  
  firstPrediction: (isActive: boolean, onComplete?: () => void) => (
    <ConfettiBurst
      isActive={isActive}
      intensity="high"
      colors={['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']}
      onComplete={onComplete}
    />
  ),
  
  tokenTradeSuccess: (isActive: boolean, onComplete?: () => void) => (
    <ConfettiBurst
      isActive={isActive}
      intensity="high"
      colors={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']}
      duration={2000}
      onComplete={onComplete}
    />
  ),
  
  levelUp: (isActive: boolean, onComplete?: () => void) => (
    <ConfettiBurst
      isActive={isActive}
      intensity="high"
      colors={['#ef4444', '#f87171', '#fca5a5', '#fecaca']}
      duration={4000}
      onComplete={onComplete}
    />
  ),
  
  milestone: (isActive: boolean, onComplete?: () => void) => (
    <ConfettiBurst
      isActive={isActive}
      intensity="high"
      colors={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']}
      duration={5000}
      onComplete={onComplete}
    />
  ),
};