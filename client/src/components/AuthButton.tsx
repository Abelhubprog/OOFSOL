import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { LogOut, User, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAchievements } from '@/hooks/useAchievements';

export default function AuthButton() {
  const { user, primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const { trackLogin } = useAchievements();

  const isAuthenticated = !!user;

  // Track login achievement when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      trackLogin();
    }
  }, [isAuthenticated, user, trackLogin]);

  const handleLogin = () => {
    setIsLoading(true);
    setShowAuthFlow(true);
    // Reset loading state after a brief delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await handleLogOut();
    setIsLoading(false);
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 bg-purple-800/50 rounded-lg px-3 py-2">
          <User className="w-4 h-4 text-purple-300" />
          <div className="text-sm">
            <div className="text-white font-medium">
              {user.email || 'Anonymous User'}
            </div>
            {primaryWallet && (
              <div className="text-purple-300 text-xs flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                {`${primaryWallet.address.slice(0, 4)}...${primaryWallet.address.slice(-4)}`}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Custom Login/Signup Button */}
      <Button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </>
        ) : (
          <>
            <User className="w-4 h-4 mr-2" />
            Login / Signup
          </>
        )}
      </Button>

      {/* Hidden Dynamic Widget for authentication flow */}
      <div className="hidden">
        <DynamicWidget />
      </div>
    </div>
  );
}