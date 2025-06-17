import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Share2, Download, Crown, 
  Trophy, Star, Heart, MessageCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Moment {
  id: string;
  title: string;
  description: string;
  quote: string;
  rarity: 'legendary' | 'epic' | 'rare';
  background: string;
  emoji: string;
  socialStats: {
    likes: number;
    shares: number;
    comments: number;
  };
  tags: string[];
}

const OOFMomentsCollection = () => {
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filter, setFilter] = useState('All');

  // Hilarious OOF Moment Templates
  const OOF_MOMENTS: Record<string, Moment[]> = {
    legendary: [
      {
        id: 'paper-hands-king',
        title: "The Paper Hands King 👑",
        description: "Sold 1M BONK one day before 100x. Now writes tragic poetry about diamond hands.",
        quote: "My hands were paper, my heart now torn, a simple hodl would've made me reborn...",
        rarity: "legendary",
        background: "bg-gradient-to-br from-yellow-300 to-yellow-600",
        emoji: "🧻👑",
        socialStats: {
          likes: 1234,
          shares: 456,
          comments: 789
        },
        tags: ["#PaperHandsProblems", "#CouldaWouldaShoulda", "#BONKregrets"]
      },
      {
        id: 'fomo-master',
        title: "The FOMO Master 🎭",
        description: "Bought the top of every memecoin pump in 2024. A true collector of local maximas.",
        quote: "They say timing the market is impossible. I proved them right - every single time.",
        rarity: "legendary",
        background: "bg-gradient-to-br from-purple-400 to-purple-700",
        emoji: "📈😱",
        socialStats: {
          likes: 2345,
          shares: 567,
          comments: 890
        },
        tags: ["#FOMOlife", "#BuyHighSellLow", "#ProfessionalTopBuyer"]
      }
    ],
    epic: [
      {
        id: 'sleeping-trader',
        title: "The Sleeping Trader 😴",
        description: "Slept through the MYRO launch. Dreams now have price charts.",
        quote: "I don't always sleep through pumps, but when I do, it's always a 100x.",
        rarity: "epic",
        background: "bg-gradient-to-br from-indigo-400 to-indigo-700",
        emoji: "💤📱",
        socialStats: {
          likes: 876,
          shares: 234,
          comments: 567
        },
        tags: ["#SleepIsCostly", "#MYROmissed", "#NappingOnGains"]
      },
      {
        id: 'gas-fee-warrior',
        title: "The Gas Fee Warrior ⛽",
        description: "Spent more on gas fees than actual token purchases. A true DeFi philanthropist.",
        quote: "I don't trade tokens, I donate to miners with style.",
        rarity: "epic",
        background: "bg-gradient-to-br from-orange-400 to-red-600",
        emoji: "⛽💸",
        socialStats: {
          likes: 654,
          shares: 321,
          comments: 432
        },
        tags: ["#GasGuzzler", "#MinerSupport", "#ExpensiveClicks"]
      }
    ],
    rare: [
      {
        id: 'chart-whisperer',
        title: "The Chart Whisperer 🔮",
        description: "Called 17 dips in a row... to buy. Still waiting for all 17 recoveries.",
        quote: "They say the trend is your friend. Mine just has a weird sense of humor.",
        rarity: "rare",
        background: "bg-gradient-to-br from-blue-400 to-blue-700",
        emoji: "📊🤔",
        socialStats: {
          likes: 543,
          shares: 123,
          comments: 345
        },
        tags: ["#ChartLife", "#DiplyDipDip", "#TechnicalAnalyst"]
      },
      {
        id: 'wallet-hoarder',
        title: "The Wallet Hoarder 💼",
        description: "Has 47 different wallets but can't remember which one has the good stuff.",
        quote: "Security through confusion - if I can't find my tokens, neither can hackers.",
        rarity: "rare",
        background: "bg-gradient-to-br from-green-400 to-teal-600",
        emoji: "💼🤯",
        socialStats: {
          likes: 432,
          shares: 234,
          comments: 123
        },
        tags: ["#WalletMaze", "#SecurityExpert", "#LostTokens"]
      }
    ]
  };

  const allMoments = Object.values(OOF_MOMENTS).flat();
  const filteredMoments = filter === 'All' ? allMoments : 
    allMoments.filter(moment => moment.rarity === filter.toLowerCase());

  const momentsPerSlide = 3;
  const totalSlides = Math.ceil(filteredMoments.length / momentsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentMoments = () => {
    const start = currentSlide * momentsPerSlide;
    return filteredMoments.slice(start, start + momentsPerSlide);
  };

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Reset slide when filter changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [filter]);

  // Moment Card Component
  const MomentCard = ({ moment }: { moment: Moment }) => (
    <div 
      className={`rounded-xl overflow-hidden shadow-lg transform transition-all 
                  hover:scale-105 cursor-pointer ${moment.background} text-white p-6 h-full`}
      onClick={() => setSelectedMoment(moment)}
    >
      {/* Rarity Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-4xl">{moment.emoji}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                         ${moment.rarity === 'legendary' ? 'bg-yellow-300 text-yellow-900' :
                           moment.rarity === 'epic' ? 'bg-purple-300 text-purple-900' :
                           'bg-blue-300 text-blue-900'}`}>
          {moment.rarity.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold mb-2">{moment.title}</h3>
      <p className="text-sm opacity-90 mb-4 line-clamp-3">{moment.description}</p>
      
      {/* Quote */}
      <div className="bg-black bg-opacity-20 rounded-lg p-4 mb-4">
        <p className="italic text-sm line-clamp-2">"{moment.quote}"</p>
      </div>

      {/* Social Stats */}
      <div className="flex justify-between text-sm opacity-75">
        <div className="flex items-center space-x-2">
          <Heart size={16} />
          <span>{moment.socialStats.likes}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Share2 size={16} />
          <span>{moment.socialStats.shares}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MessageCircle size={16} />
          <span>{moment.socialStats.comments}</span>
        </div>
      </div>
    </div>
  );

  // Expanded View Component
  const ExpandedMoment = ({ moment }: { moment: Moment }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className={`${moment.background} p-8 text-white`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-6xl">{moment.emoji}</span>
            <button 
              onClick={() => setSelectedMoment(null)}
              className="text-white opacity-75 hover:opacity-100 text-2xl"
            >
              ✕
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-2">{moment.title}</h2>
          <p className="opacity-90">{moment.description}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Quote Section */}
          <div className="text-center space-y-4">
            <span className="text-4xl">💭</span>
            <p className="text-xl italic text-gray-700">"{moment.quote}"</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {moment.tags.map(tag => (
              <span key={tag} className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          {/* Mint Options */}
          <div className="space-y-4">
            <Button 
              className="w-full bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <Star size={20} />
              <span>Mint on Phantom</span>
            </Button>
            <Button 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Crown size={20} />
              <span>Mint on Zora</span>
            </Button>
          </div>

          {/* Share Options */}
          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
              <Share2 size={24} />
            </Button>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
              <Download size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Legendary OOF Moments
          </h1>
          <p className="text-purple-300">
            Where paper hands become immortal memes ✨
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center space-x-2 sm:space-x-4 mb-8 flex-wrap gap-2">
          {['All', 'Legendary', 'Epic', 'Rare'].map(filterOption => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption)}
              className={cn(
                "px-4 py-2 rounded-full transition-colors",
                filter === filterOption 
                  ? "bg-purple-600 text-white" 
                  : "bg-purple-100 text-purple-600 hover:bg-purple-200"
              )}
            >
              {filterOption}
            </Button>
          ))}
        </div>

        {/* Slider Container */}
        <div className="relative mb-8">
          {/* Moments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[500px]">
            {getCurrentMoments().map(moment => (
              <MomentCard key={moment.id} moment={moment} />
            ))}
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}
        </div>

        {/* Slider Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  currentSlide === index ? "bg-purple-400" : "bg-purple-200"
                )}
              />
            ))}
          </div>
        )}

        {/* Create Your Own */}
        <div className="text-center">
          <Button 
            className="bg-purple-600 text-white hover:bg-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl inline-flex items-center space-x-2"
          >
            <Sparkles size={20} />
            <span>Create Your OOF Moment</span>
          </Button>
        </div>

        {/* Expanded Moment Modal */}
        {selectedMoment && <ExpandedMoment moment={selectedMoment} />}
      </div>
    </div>
  );
};

export default OOFMomentsCollection;