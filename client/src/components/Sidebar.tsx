import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ChevronLeft, 
  ChevronRight, 
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
  LogOut,
  Star,
  Gem,
  LayoutDashboard,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  { path: '/', icon: Home, label: 'Home', color: 'text-purple-400' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
  { path: '/tokens', icon: TrendingUp, label: 'Token Explorer', color: 'text-green-400' },
  { path: '/traders-arena', icon: BarChart3, label: 'Traders Arena', color: 'text-indigo-400' },
  { path: '/campaigns', icon: Target, label: 'OOF Campaigns', color: 'text-green-400' },
  { path: '/moments', icon: Star, label: 'OOF Moments', color: 'text-yellow-400' },
  { path: '/multiverse', icon: Sparkles, label: 'OOF Multiverse', color: 'text-pink-400' },
  { path: '/detective', icon: Shield, label: 'OOF Detective', color: 'text-red-400' },
  { path: '/detective-advanced', icon: Zap, label: 'Advanced AI', color: 'text-cyan-400' },
  { path: '/origins', icon: Calendar, label: 'OOF Origins', color: 'text-amber-400' },
  { path: '/battle-royale', icon: Gamepad2, label: 'Battle Royale', color: 'text-orange-400' },
  { path: '/staking', icon: Banknote, label: 'OOF Staking', color: 'text-purple-400' },
  { path: '/time-machine', icon: Clock, label: 'Time Machine', color: 'text-cyan-400' },
  { path: '/wallet-analyzer', icon: Gem, label: 'Wallet Analyzer', color: 'text-emerald-400' },
];

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 border-r border-purple-700/50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2 hover:bg-purple-700/30 rounded-lg p-2 -m-2 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OOF</span>
            </div>
            <span className="text-white font-semibold text-lg">Platform</span>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-purple-300 hover:text-white hover:bg-purple-700/50"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b border-purple-700/50">
          {isAuthenticated ? (
            <div className="space-y-3">
              <Link href="/profile" className="flex items-center space-x-3 hover:bg-purple-700/30 rounded-lg p-2 -m-2 transition-colors">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.walletAddress ? 
                      `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` 
                      : 'Connected'
                    }
                  </p>
                  <p className="text-purple-300 text-xs truncate">
                    0 OOF Tokens
                  </p>
                </div>
              </Link>
              <div className="w-full">
                <DynamicWidget />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-full">
                <DynamicWidget />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-700/50 group",
                  isActive 
                    ? "bg-purple-700/70 text-white shadow-lg" 
                    : "text-purple-200 hover:text-white"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-white" : item.color,
                    "group-hover:text-white"
                  )}
                />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-700/50">
        <div className={cn(
          "flex items-center justify-center text-purple-400 text-xs",
          isCollapsed && "px-3"
        )}>
          {!isCollapsed && <span>Powered by Solana ⚡</span>}
        </div>
      </div>
    </div>
  );
}