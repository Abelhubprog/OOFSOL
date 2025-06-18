import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Home, 
  TrendingUp, 
  Shield, 
  Calendar, 
  Gamepad2, 
  Banknote, 
  Clock, 
  BarChart3, 
  Sparkles, 
  Zap,
  User,
  Gem,
  ChevronLeft,
  ChevronRight,
  Target,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { 
    name: 'Home', 
    path: '/', 
    icon: Home,
    description: 'OOF Platform Home'
  },
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: Grid3X3,
    description: 'Live Memecoin Dashboard'
  },
  { 
    name: 'Tokens', 
    path: '/tokens', 
    icon: TrendingUp,
    description: 'Token Explorer'
  },
  { 
    name: 'Campaigns', 
    path: '/campaigns', 
    icon: Target,
    description: 'OOF Campaigns'
  },
  { 
    name: 'Moments', 
    path: '/moments', 
    icon: Calendar,
    description: 'OOF Moments'
  },
  { 
    name: 'Multiverse', 
    path: '/multiverse', 
    icon: Gem,
    description: 'OOF Multiverse'
  },
  { 
    name: 'Profile', 
    path: '/profile', 
    icon: User,
    description: 'Your Profile'
  },
  { 
    name: 'Detective', 
    path: '/detective', 
    icon: Shield,
    description: 'OOF Detective'
  },
  { 
    name: 'Advanced AI', 
    path: '/detective-advanced', 
    icon: Zap,
    description: 'Advanced AI'
  },
  { 
    name: 'Origins', 
    path: '/origins', 
    icon: Clock,
    description: 'OOF Origins'
  },
  { 
    name: 'Battle Royale', 
    path: '/battle-royale', 
    icon: Gamepad2,
    description: 'Battle Royale'
  },
  { 
    name: 'Staking', 
    path: '/staking', 
    icon: Banknote,
    description: 'OOF Staking'
  },
  { 
    name: 'Time Machine', 
    path: '/time-machine', 
    icon: Clock,
    description: 'Time Machine'
  },
  { 
    name: 'Traders Arena', 
    path: '/traders-arena', 
    icon: BarChart3,
    description: 'Traders Arena'
  }
];

export default function BottomSlider() {
  const [location, setLocation] = useLocation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollButtons);
      return () => slider.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current.offsetLeft);
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - (sliderRef.current.offsetLeft);
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 to-purple-800/95 backdrop-blur-lg border-t border-purple-400/20 z-50">
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-500/80 rounded-full p-2 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-500/80 rounded-full p-2 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        )}

        {/* Scrollable Navigation */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto scrollbar-hide px-12 py-3 space-x-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => !isDragging && setLocation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[80px] h-16 rounded-lg transition-all duration-200 select-none",
                  isActive 
                    ? "bg-purple-600 text-white shadow-lg scale-105" 
                    : "bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white"
                )}
              >
                <IconComponent size={20} className="mb-1" />
                <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-purple-900/95 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-purple-900/95 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}