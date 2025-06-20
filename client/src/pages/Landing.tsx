import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
  Rocket,
  Star,
  Crown,
  DollarSign,
  Brain,
  Shield,
  Globe,
  Palette,
  Network,
  Eye,
  Heart,
  Gift,
  Coins,
  ChevronDown,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  RefreshCw,
  PartyPopper,
  Gem,
  Lightbulb,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Infinity
} from "lucide-react";
import OOFCounter from "@/components/OOFCounter";
import TokenAdvertisingSpaces from "@/components/TokenAdvertisingSpaces";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Link } from "wouter";
import ConfettiBurst from "@/components/ConfettiBurst";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  
  // Animation and gamification states
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentMoment, setCurrentMoment] = useState(0);
  const [isHeroPlaying, setIsHeroPlaying] = useState(false);
  const [heroStats, setHeroStats] = useState({
    liveOOFs: 1337588,
    activeTraders: 47293,
    totalRewards: 8947234,
    momentsMinted: 293847
  });

  // Epic moments carousel
  const epicMoments = [
    {
      title: "The BONK Awakening",
      subtitle: "When diamond hands became legendary",
      impact: "+500,000 $OOF",
      rarity: "Legendary",
      emotion: "💎"
    },
    {
      title: "WIF Explosion",
      subtitle: "The hat revolution begins",
      impact: "+1,200,000 $OOF", 
      rarity: "Mythic",
      emotion: "🧢"
    },
    {
      title: "PEPE Prophecy",
      subtitle: "When memes ruled the market",
      impact: "+750,000 $OOF",
      rarity: "Epic", 
      emotion: "🐸"
    }
  ];

  // Live counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroStats(prev => ({
        ...prev,
        liveOOFs: prev.liveOOFs + Math.floor(Math.random() * 50) + 10,
        activeTraders: prev.activeTraders + Math.floor(Math.random() * 5),
        totalRewards: prev.totalRewards + Math.floor(Math.random() * 1000) + 100
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoment((prev) => (prev + 1) % epicMoments.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    if (isAuthenticated && primaryWallet) {
      // User is authenticated, redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      // Show Dynamic.xyz authentication flow
      setShowAuthFlow(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-xl"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 -right-20 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-xl"
        />
        <motion.div 
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-xl"
        />
      </div>

      {/* Floating OOF Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-purple-300/20 font-bold text-xl"
            initial={{ y: "100vh", x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ 
              y: "-10vh", 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          >
            OOF
          </motion.div>
        ))}
      </div>

      {/* Confetti Component */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      {/* Enhanced Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-purple-900/90 backdrop-blur-xl border-b border-purple-700/50 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  OOF
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="hidden sm:block">
                <Badge variant="outline" className="border-purple-400 text-purple-300 bg-purple-900/50">
                  Live
                </Badge>
                <span className="text-purple-300 text-sm ml-2">Regret Economy Platform</span>
              </div>
            </motion.div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Button 
                onClick={handleConnectWallet}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm px-3 sm:px-4"
              >
                {isAuthenticated && primaryWallet ? "Dashboard" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Revolutionary Hero Section */}
      <section className="pt-20 pb-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Epic Title with Animated Background */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center mb-12 relative"
          >
            {/* Glowing Background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 blur-3xl rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="relative z-10">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-4"
              >
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-bold border-0 mb-6">
                  <Infinity className="w-4 h-4 mr-2" />
                  THE REGRET ECONOMY IS HERE
                </Badge>
              </motion.div>

              <motion.h1 
                className="text-6xl sm:text-7xl lg:text-9xl font-black mb-8 leading-none"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
                  OOF
                </span>
                <motion.span 
                  className="text-4xl sm:text-5xl lg:text-6xl ml-4 text-yellow-400"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🤦‍♂️
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-2xl sm:text-3xl lg:text-4xl text-purple-200 mb-6 font-bold"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Turn Your Crypto Regrets Into
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Legendary Wealth</span>
              </motion.p>

              <motion.p 
                className="text-lg sm:text-xl text-purple-300 max-w-4xl mx-auto mb-10 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                The world's first platform to monetize trading psychology. Transform every missed pump, failed prediction, and FOMO moment into shareable AI-generated content that earns you real money.
              </motion.p>
            </div>
          </motion.div>

          {/* Live Statistics Dashboard */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {[
              { label: "Live OOF Moments", value: heroStats.liveOOFs.toLocaleString(), icon: PartyPopper, color: "from-purple-500 to-pink-500" },
              { label: "Active Traders", value: heroStats.activeTraders.toLocaleString(), icon: Users, color: "from-cyan-500 to-blue-500" },
              { label: "Total Rewards", value: `$${(heroStats.totalRewards / 1000000).toFixed(1)}M`, icon: DollarSign, color: "from-green-500 to-emerald-500" },
              { label: "Moments Minted", value: heroStats.momentsMinted.toLocaleString(), icon: Gem, color: "from-yellow-500 to-orange-500" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-xl border border-purple-700/50 rounded-2xl p-6 text-center relative overflow-hidden group"
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-300" />
                <motion.div 
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  key={stat.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-purple-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Epic Moments Carousel */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="relative h-64 mb-12 overflow-hidden rounded-3xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMoment}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-gradient-to-br from-yellow-600/90 to-orange-600/90 backdrop-blur-xl rounded-3xl flex items-center justify-center text-center border border-yellow-500/50"
              >
                <div className="max-w-2xl mx-auto px-8">
                  <motion.div 
                    className="text-6xl mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {epicMoments[currentMoment].emotion}
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {epicMoments[currentMoment].title}
                  </h3>
                  <p className="text-xl text-yellow-100 mb-4">
                    {epicMoments[currentMoment].subtitle}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Badge className="bg-yellow-500 text-yellow-900 font-bold px-3 py-1">
                      {epicMoments[currentMoment].rarity}
                    </Badge>
                    <div className="text-2xl font-bold text-green-300">
                      {epicMoments[currentMoment].impact}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Action Buttons */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/oof-moments">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-yellow-900 font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl border-0 relative overflow-hidden group"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <Zap className="w-6 h-6 mr-3" />
                  Generate My OOF Moments
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleConnectWallet}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl border-0 relative overflow-hidden group"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-pink-300/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <Rocket className="w-6 h-6 mr-3" />
                Connect & Start Earning
                <Crown className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/traders-arena">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl backdrop-blur-xl"
                >
                  <Trophy className="w-6 h-6 mr-3" />
                  Join Trading Arena
                  <Target className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Revolutionary Feature Showcase */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              The Ultimate Regret Economy Platform
            </h2>
            <p className="text-xl text-purple-300 max-w-3xl mx-auto">
              Powered by multi-agent AI, cross-chain technology, and social gamification
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "AI-Powered OOF Generator",
                subtitle: "Multi-Agent Analysis",
                description: "Our Scout, Director, Artist, and Publisher agents analyze your wallet and create personalized trading stories with stunning visuals.",
                icon: Brain,
                color: "from-purple-500 to-pink-500",
                features: ["Real-time wallet analysis", "Emotional AI storytelling", "Dynamic visual generation", "Cross-chain NFT minting"]
              },
              {
                title: "Social Trading Arena", 
                subtitle: "Competitive Predictions",
                description: "Compete with thousands of traders, make predictions, and climb the leaderboards while earning $OOF rewards.",
                icon: Trophy,
                color: "from-cyan-500 to-blue-500",
                features: ["Live predictions", "Global leaderboards", "Achievement system", "Reward multipliers"]
              },
              {
                title: "Token Advertising Engine",
                subtitle: "Revenue Generation",
                description: "Monetize your platform with rotating token ads, performance analytics, and revenue sharing for all participants.",
                icon: DollarSign,
                color: "from-green-500 to-emerald-500",
                features: ["30-minute ad slots", "$10 USDC pricing", "Performance tracking", "Revenue sharing"]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <Card className="relative bg-gradient-to-br from-purple-900/80 to-purple-800/80 backdrop-blur-xl border border-purple-700/50 rounded-3xl p-8 h-full overflow-hidden">
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />
                  <CardContent className="relative z-10 p-0">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                    <Badge className="mb-4 bg-purple-700/50 text-purple-200 border-0">
                      {feature.subtitle}
                    </Badge>
                    <p className="text-purple-300 mb-6 leading-relaxed">{feature.description}</p>
                    <div className="space-y-3">
                      {feature.features.map((feat, i) => (
                        <motion.div 
                          key={feat}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.2) + (i * 0.1) }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-purple-200">{feat}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Token Advertising Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <TokenAdvertisingSpaces />
      </motion.div>

      {/* Revolutionary Platform Explorer */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/50 to-purple-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Explore the OOF Universe
            </h2>
            <p className="text-xl text-purple-300">
              15+ innovative features designed to monetize every aspect of crypto trading psychology
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: "OOF Moments", icon: Sparkles, color: "from-purple-500 to-pink-500", href: "/oof-moments" },
              { name: "Traders Arena", icon: Trophy, color: "from-cyan-500 to-blue-500", href: "/traders-arena" },
              { name: "Detective AI", icon: Shield, color: "from-green-500 to-emerald-500", href: "/detective-advanced" },
              { name: "Time Machine", icon: Clock, color: "from-yellow-500 to-orange-500", href: "/time-machine" },
              { name: "Multiverse", icon: Globe, color: "from-indigo-500 to-purple-500", href: "/multiverse" },
              { name: "Battle Royale", icon: Crown, color: "from-red-500 to-pink-500", href: "/battle-royale" },
              { name: "OOF Staking", icon: Coins, color: "from-emerald-500 to-green-500", href: "/staking" },
              { name: "Campaigns", icon: Target, color: "from-blue-500 to-cyan-500", href: "/campaigns" },
              { name: "Wallet Analyzer", icon: Search, color: "from-purple-500 to-indigo-500", href: "/wallet-analyzer" },
              { name: "Token Explorer", icon: Network, color: "from-orange-500 to-red-500", href: "/token-explorer" }
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={feature.href}>
                  <Card className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-xl border border-purple-700/50 rounded-2xl p-6 text-center cursor-pointer group overflow-hidden relative h-full">
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />
                    <CardContent className="relative z-10 p-0">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="text-sm font-bold text-white">{feature.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Epic Call to Action */}
      <section className="py-24 px-4 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              Ready to Monetize Your Regrets?
            </h2>
            <p className="text-2xl text-purple-200 mb-12 leading-relaxed">
              Join the revolution that transforms crypto FOMO into financial opportunity. 
              <br />Every missed pump becomes a legendary moment.
            </p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleConnectWallet}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-yellow-900 font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl border-0 relative overflow-hidden group"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-orange-300/30"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8 }}
                  />
                  <PartyPopper className="w-7 h-7 mr-4" />
                  Start Your OOF Journey
                  <Rocket className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {[
                { number: "1M+", label: "Potential OOF Moments", icon: Gem },
                { number: "$10M+", label: "Trading Volume Analyzed", icon: BarChart3 },
                { number: "50k+", label: "Future Early Adopters", icon: Users }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-700/30"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-300" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-purple-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
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
