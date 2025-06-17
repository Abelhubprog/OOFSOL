import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Target, 
  Clock, 
  Search, 
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/arena", label: "Arena", icon: Target },
    { path: "/time-machine", label: "Time Machine", icon: Clock },
    { path: "/wallet-analyzer", label: "Analyzer", icon: Search },
    { path: "/slots", label: "Slots", icon: Sparkles },
    { path: "/detective", label: "Detective", icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-purple-900/90 backdrop-blur-lg border-b border-purple-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4">
            <div className="text-2xl font-bold gradient-text">OOF</div>
            <span className="text-purple-300 text-sm hidden sm:inline">
              The Meme Coin for Missed Opportunities
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-purple-700 text-white"
                      : "text-purple-200 hover:text-white hover:bg-purple-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-purple-200">
              <div className="text-sm">
                <div className="font-medium">{user?.firstName || "User"}</div>
                <div className="text-xs text-purple-400">
                  {user?.oofTokens || 0} $OOF
                </div>
              </div>
              {user?.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-purple-400 text-purple-200 hover:bg-purple-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-purple-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-700">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-purple-700 text-white"
                        : "text-purple-200 hover:text-white hover:bg-purple-800"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-purple-700 mt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="w-5 h-5 text-purple-400" />
                  <div className="text-purple-200">
                    <div className="font-medium">{user?.firstName || "User"}</div>
                    <div className="text-sm text-purple-400">
                      {user?.oofTokens || 0} $OOF Tokens
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-400 text-purple-200 hover:bg-purple-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
