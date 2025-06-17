import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Wallet, 
  TrendingUp, 
  Target, 
  Clock, 
  Search,
  Sparkles,
  Trophy,
  Users,
  ArrowRight,
  BarChart3,
  Flame,
  Timer,
  Rocket
} from "lucide-react";
import OOFCounter from "@/components/OOFCounter";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-purple-900/80 backdrop-blur-lg border-b border-purple-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-xl sm:text-2xl font-bold gradient-text">OOF</div>
              <span className="text-purple-300 text-xs sm:text-sm hidden sm:inline">The Meme Coin for Missed Opportunities</span>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Button 
                onClick={handleLogin}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm px-3 sm:px-4"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-black mb-3 sm:mb-4">
              <span className="gradient-text">OOF</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-purple-200 mb-4 sm:mb-6 px-2">
              The Meme Coin for Life's Missed Opportunities 🤦‍♂️
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-purple-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
              Turn your crypto regrets into rewards. Track missed gains, predict the next moon, and earn $OOF tokens for your trading insights!
            </p>
          </div>
          
          {/* OOF Counter */}
          <div className="mb-8">
            <OOFCounter />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:from-yellow-500 hover:to-yellow-600"
            >
              <Zap className="w-5 h-5 mr-2" />
              Calculate My OOFs
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline" 
              className="border-purple-400 text-purple-200 hover:bg-purple-700"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Analyze Wallet
            </Button>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Buy $OOF
            </Button>
          </div>

          {/* Mascot */}
          <div className="animate-float">
            <div className="text-8xl mb-4">🤦‍♂️</div>
            <div className="text-purple-300">Meet OOF Bot - Your Regret Companion</div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <BarChart3 className="w-8 h-8 inline mr-3 text-purple-400" />
            Platform Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Real-time Dashboard */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Flame className="w-8 h-8 text-orange-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Live Dashboard</h3>
                </div>
                <p className="text-purple-300 mb-4">
                  Monitor hottest Solana memecoins in real-time with risk analysis and instant alerts.
                </p>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Trader's Arena */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Trader's Arena</h3>
                </div>
                <p className="text-purple-300 mb-4">
                  Make price predictions and earn $OOF tokens for accurate calls. Compete on the leaderboard!
                </p>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200"
                >
                  Start Predicting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Time Machine */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-8 h-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Time Machine</h3>
                </div>
                <p className="text-purple-300 mb-4">
                  Travel back in time to see what could have been. Calculate your biggest missed gains!
                </p>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200"
                >
                  Time Travel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Analyzer */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Search className="w-8 h-8 text-blue-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Wallet Analyzer</h3>
                </div>
                <p className="text-purple-300 mb-4">
                  Analyze any Solana wallet to discover epic missed opportunities and create shareable OOF moments.
                </p>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200"
                >
                  Analyze Wallet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* OOF Slots */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">OOF Multiverse Slots</h3>
                </div>
                <p className="text-purple-300 mb-4">
                  Spin through legendary memecoin moments! Collect rare NFTs and win massive $OOF rewards.
                </p>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200"
                >
                  Spin to Win
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="bg-purple-800/30 border-purple-700 glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-green-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Join Community</h3>
                </div>
                <p className="text-purple-300 mb-4">
                  Connect with fellow traders, share OOF moments, and learn from the community's mistakes.
                </p>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200"
                >
                  Join Revolution
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Turn Your OOFs into Wins?
          </h2>
          <p className="text-xl text-purple-300 mb-8">
            Join thousands of traders who are already earning $OOF tokens by sharing their trading insights and missed opportunities.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
          >
            <Rocket className="w-6 h-6 mr-2" />
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-purple-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold gradient-text mb-4">OOF</div>
              <p className="text-purple-300 text-sm">The meme coin for life's missed opportunities. Join the revolution and turn your OOFs into wins!</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Features</h4>
              <ul className="space-y-2 text-purple-300 text-sm">
                <li>Missed Opportunity Calculator</li>
                <li>Wallet Analyzer</li>
                <li>Trading Arena</li>
                <li>Time Machine</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Community</h4>
              <ul className="space-y-2 text-purple-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DexScreener</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-purple-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Whitepaper</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-700 pt-8 text-center text-purple-400 text-sm">
            <p>&copy; 2024 OOF Token. All rights reserved. Built on Solana ⚡</p>
            <div className="mt-2">
              <span className="font-mono text-xs bg-purple-800 px-2 py-1 rounded cursor-pointer">
                Contract: OOF123...ABC
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
