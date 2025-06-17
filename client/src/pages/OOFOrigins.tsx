import { useState } from "react";
import { 
  BookOpen, Clock, Star, Map, Sparkles, Crown, 
  Share2, Heart, MessageCircle, Trophy, Zap, Gift,
  Rocket, Target
} from 'lucide-react';
import { Button } from "@/components/ui/button";

// Expanded Memecoin Stories
const MEMECOIN_STORIES = {
  bonkSaga: {
    title: "The BONK Awakening",
    era: "December 2023",
    icon: "🐕",
    background: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    difficulty: "Legendary",
    type: "Origin Story",
    stats: {
      potentialGains: "100x",
      timeframe: "1 week",
      significance: "Solana's Revival"
    },
    chapters: [
      {
        title: "The Airdrop",
        content: "December 25th, 2023. Christmas morning. While the world was opening presents, BONK was being distributed to millions of Solana wallets...",
        choices: [
          { text: "Check your wallet immediately", consequence: "early_adopter" },
          { text: "Ignore the airdrop", consequence: "missed_opportunity" }
        ]
      },
      {
        title: "The Pump Begins",
        content: "Within hours, BONK started pumping. Social media exploded with dog memes and Solana celebration...",
        choices: [
          { text: "HODL for the long term", consequence: "diamond_hands" },
          { text: "Take quick profits", consequence: "paper_hands" }
        ]
      }
    ]
  },
  
  myroTales: {
    title: "MYRO Mania",
    era: "February 2024",
    icon: "🐱",
    background: "bg-gradient-to-br from-purple-400 to-purple-600",
    difficulty: "Epic",
    type: "Viral Surge",
    stats: {
      potentialGains: "50x",
      timeframe: "3 days",
      significance: "Cat Season"
    },
    chapters: [
      {
        title: "The Cat Awakens",
        content: "MYRO emerged as the first major cat coin on Solana, challenging the dog dominance...",
        choices: [
          { text: "Ape in immediately", consequence: "early_entry" },
          { text: "Wait for confirmation", consequence: "late_entry" }
        ]
      }
    ]
  },
  
  wifChronicles: {
    title: "WIF Explosion",
    era: "March 2024",
    icon: "🐶",
    background: "bg-gradient-to-br from-blue-400 to-blue-600",
    difficulty: "Epic",
    type: "Market Shift",
    stats: {
      potentialGains: "70x",
      timeframe: "5 days",
      significance: "Dog Wars"
    },
    chapters: [
      {
        title: "The Hat Revolution",
        content: "A simple dog with a hat became the symbol of a new era in memecoin culture...",
        choices: [
          { text: "Embrace the meme", consequence: "meme_lord" },
          { text: "Stay traditional", consequence: "boomer_move" }
        ]
      }
    ]
  }
};

export default function OOFOrigins() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [userChoices, setUserChoices] = useState([]);
  const [earnedMoments, setEarnedMoments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const StorySelector = () => (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {['all', 'legendary', 'epic', 'rare'].map(type => (
            <Button
              key={type}
              onClick={() => setFilter(type)}
              variant={filter === type ? "default" : "outline"}
              className={`rounded-full transition-all ${
                filter === type 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full"
        >
          <option value="date">Latest First</option>
          <option value="gains">Highest Gains</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(MEMECOIN_STORIES)
          .filter(([_, story]) => 
            filter === 'all' || story.difficulty.toLowerCase() === filter
          )
          .map(([key, story]) => (
            <StoryCard 
              key={key} 
              story={story} 
              onSelect={() => setSelectedStory(story)} 
            />
          ))}
      </div>
    </div>
  );

  const StoryCard = ({ story, onSelect }) => (
    <div 
      onClick={onSelect}
      className={`${story.background} rounded-xl p-6 cursor-pointer
                transform hover:scale-105 transition-all duration-300 text-white`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{story.icon}</div>
          <div>
            <h3 className="text-white text-xl font-bold">{story.title}</h3>
            <p className="text-white text-opacity-80">{story.era}</p>
          </div>
        </div>
        <span className="bg-black bg-opacity-20 px-3 py-1 rounded-full text-white text-sm">
          {story.difficulty}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-white text-opacity-70 text-sm mb-1">Potential</div>
          <div className="text-white font-bold">{story.stats.potentialGains}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-white text-opacity-70 text-sm mb-1">Timeframe</div>
          <div className="text-white font-bold">{story.stats.timeframe}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-white text-opacity-70 text-sm mb-1">Type</div>
          <div className="text-white font-bold">{story.type}</div>
        </div>
      </div>

      {/* Significance */}
      <div className="bg-black bg-opacity-20 rounded-lg p-4 mb-6">
        <div className="text-white text-opacity-70 text-sm mb-1">Historical Impact</div>
        <div className="text-white">{story.stats.significance}</div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <Button 
          variant="secondary" 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 
                    transition-all text-white border-none"
        >
          <BookOpen size={18} className="mr-2" />
          Experience Story
        </Button>
      </div>
    </div>
  );

  const StoryExperience = ({ story }) => {
    const currentChapterData = story.chapters[currentChapter];
    
    const handleChoice = (choice) => {
      setUserChoices([...userChoices, choice]);
      
      // Generate reward based on choice
      if (choice.consequence === 'early_adopter' || choice.consequence === 'diamond_hands') {
        setEarnedMoments([...earnedMoments, {
          name: `${story.title} - ${choice.consequence}`,
          rarity: 'legendary',
          reward: 100
        }]);
      }

      // Move to next chapter or complete story
      if (currentChapter < story.chapters.length - 1) {
        setCurrentChapter(currentChapter + 1);
      } else {
        // Story completed
        setSelectedStory(null);
        setCurrentChapter(0);
        setUserChoices([]);
      }
    };

    return (
      <div className={`${story.background} rounded-xl p-8 text-white`}>
        {/* Story Progress */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">{story.title}</h2>
            <p className="text-white text-opacity-80">{story.era}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-black bg-opacity-20 px-4 py-2 rounded-full">
              Chapter {currentChapter + 1}/{story.chapters.length}
            </div>
            <div className="bg-black bg-opacity-20 px-4 py-2 rounded-full flex items-center">
              <Trophy size={18} className="mr-2" />
              <span>{earnedMoments.length} Moments</span>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="bg-black bg-opacity-20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">{currentChapterData.title}</h3>
          <p className="text-lg leading-relaxed">{currentChapterData.content}</p>
        </div>

        {/* Choices */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold">What do you do?</h4>
          <div className="grid grid-cols-1 gap-4">
            {currentChapterData.choices.map((choice, index) => (
              <Button
                key={index}
                onClick={() => handleChoice(choice)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 
                          text-white border-none p-4 text-left justify-start"
                variant="secondary"
              >
                <Target size={20} className="mr-3" />
                {choice.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">
          OOF Origins: Memecoin Time Machine
        </h1>
        <p className="text-purple-600">
          Relive the greatest moments in Solana memecoin history!
        </p>
      </div>

      {/* Earned Moments Display */}
      {earnedMoments.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
            <Sparkles className="mr-2" />
            Your Collected Moments
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {earnedMoments.map((moment, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <div className="font-bold text-sm">{moment.name}</div>
                <div className="text-purple-600 text-xs">{moment.rarity}</div>
                <div className="text-green-600 font-bold">+{moment.reward} $OOF</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedStory ? (
        <StoryExperience story={selectedStory} />
      ) : (
        <StorySelector />
      )}
    </div>
  );
}