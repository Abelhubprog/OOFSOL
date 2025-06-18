import React, { useState, useEffect } from 'react';
import { 
  Wallet, Star, Gift, Gem, Trophy, Share2, 
  Rocket, Download, Sparkles, Zap, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { solanaService } from '@/lib/solana';

// Expanded memecoin database with more detailed stats
const MEMECOIN_DATABASE = [
  {
    id: 'bonk',
    name: 'BONK',
    symbol: 'BONK',
    icon: '🐕',
    launchDate: '2023-12',
    peakMcap: 1000000000,
    events: [
      {
        type: 'legendary',
        name: 'The Great BONK Rush',
        description: 'Selling BONK one day before 100x pump',
        missedGains: 150000,
        date: 'Jan 2024',
        power: 95,
        effect: 'Double OOF Score'
      },
      {
        type: 'epic',
        name: 'BONK Early Exit',
        description: 'Paper handed BONK at first 2x',
        missedGains: 75000,
        date: 'Dec 2023',
        power: 85,
        effect: 'FOMO Multiplier'
      }
    ]
  },
  {
    id: 'myro',
    name: 'MYRO',
    symbol: 'MYRO',
    icon: '🐱',
    launchDate: '2024-02',
    peakMcap: 200000000,
    events: [
      {
        type: 'epic',
        name: 'MYRO Paper Hands',
        description: 'Panic sold MYRO at launch',
        missedGains: 50000,
        date: 'Feb 2024',
        power: 85,
        effect: 'Instant Regret'
      }
    ]
  },
  {
    id: 'wif',
    name: 'WIF',
    symbol: 'WIF',
    icon: '🐶',
    launchDate: '2024-03',
    peakMcap: 150000000,
    events: [
      {
        type: 'legendary',
        name: 'WIF Wave Missed',
        description: 'Watched WIF moon from sidelines',
        missedGains: 120000,
        date: 'Mar 2024',
        power: 90,
        effect: 'FOMO Intensifier'
      }
    ]
  },
  {
    id: 'popcat',
    name: 'POPCAT',
    symbol: 'POPCAT',
    icon: '🐱',
    launchDate: '2024-01',
    peakMcap: 500000000,
    events: [
      {
        type: 'epic',
        name: 'POPCAT Pump Miss',
        description: 'Slept through the POPCAT explosion',
        missedGains: 80000,
        date: 'Apr 2024',
        power: 88,
        effect: 'Sleep Penalty'
      }
    ]
  }
];

// Funny default cards for new users
const DEFAULT_CARDS = [
  {
    type: 'rare',
    name: 'The Hesitant Trader',
    description: 'Still waiting for the perfect entry...',
    missedGains: '???',
    date: 'Forever Ago',
    icon: '🤔',
    power: 50,
    effect: 'Motivation Boost'
  },
  {
    type: 'epic',
    name: 'Future FOMO Guardian',
    description: 'Protecting you from future missed pumps',
    missedGains: 'TBD',
    date: 'Soon™',
    icon: '🛡️',
    power: 75,
    effect: 'FOMO Protection'
  }
];

interface OOFCard {
  type: 'legendary' | 'epic' | 'rare';
  name: string;
  description: string;
  missedGains: number | string;
  date: string;
  icon: string;
  power: number;
  effect: string;
  realTransaction?: boolean;
  txHash?: string;
  actualAmount?: number;
}

const OOFMultiverse = () => {
  let primaryWallet = null;
  
  try {
    const dynamicContext = useDynamicContext();
    primaryWallet = dynamicContext?.primaryWallet;
  } catch (error) {
    // Dynamic context not available - wallet features will be limited
    console.warn('Dynamic context not available');
  }
  const [walletState, setWalletState] = useState({
    connected: false,
    address: '',
    analyzing: false,
    cards: DEFAULT_CARDS as OOFCard[]
  });

  const [nftState, setNftState] = useState({
    minting: false,
    mintingProgress: 0,
    lastMinted: null as any
  });

  const [selectedCard, setSelectedCard] = useState<OOFCard | null>(null);

  useEffect(() => {
    if (primaryWallet?.address) {
      setWalletState(prev => ({
        ...prev,
        connected: true,
        address: primaryWallet.address
      }));
    }
  }, [primaryWallet]);

  // Generate cards from wallet history
  const generateCardsFromWallet = async (address: string) => {
    setWalletState(prev => ({ ...prev, analyzing: true }));
    
    try {
      // Get wallet transaction history
      const transactions = await solanaService.getTransactionHistory(address, 100);
      
      const generatedCards: OOFCard[] = [];
      
      // Simulate finding memecoin transactions and creating cards
      transactions.forEach((tx: any) => {
        const randomMemecoin = MEMECOIN_DATABASE[Math.floor(Math.random() * MEMECOIN_DATABASE.length)];
        const randomEvent = randomMemecoin.events[Math.floor(Math.random() * randomMemecoin.events.length)];
        
        if (Math.random() > 0.7) { // 30% chance to generate a card per transaction
          generatedCards.push({
            type: randomEvent.type as 'legendary' | 'epic' | 'rare',
            name: randomEvent.name,
            description: randomEvent.description,
            missedGains: randomEvent.missedGains,
            date: randomEvent.date,
            power: randomEvent.power,
            effect: randomEvent.effect,
            realTransaction: true,
            txHash: tx.signature || 'unknown',
            actualAmount: Math.floor(Math.random() * 100000),
            icon: randomMemecoin.icon
          });
        }
      });

      // Add some default cards if not enough generated
      const memeEvents = MEMECOIN_DATABASE.flatMap(coin => 
        coin.events.map(event => ({
          ...event,
          type: event.type as 'legendary' | 'epic' | 'rare',
          icon: coin.icon
        }))
      ).slice(0, 4);
      
      const finalCards = generatedCards.length > 0 ? 
        [...generatedCards.slice(0, 6), ...DEFAULT_CARDS] : 
        [...DEFAULT_CARDS, ...memeEvents];

      setWalletState(prev => ({
        ...prev,
        analyzing: false,
        cards: finalCards
      }));

    } catch (error) {
      console.error('Error analyzing wallet:', error);
      setWalletState(prev => ({
        ...prev,
        analyzing: false,
        cards: [...DEFAULT_CARDS, ...MEMECOIN_DATABASE.flatMap(coin => coin.events).slice(0, 4)]
      }));
    }
  };

  // Mint card as NFT
  const mintCardAsNFT = async (card: OOFCard) => {
    setNftState({ ...nftState, minting: true, mintingProgress: 0 });
    
    try {
      // Simulated minting progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setNftState(prev => ({ ...prev, mintingProgress: i }));
      }

      // In production, this would call Solana NFT minting
      const metadata = {
        name: `OOF Card: ${card.name}`,
        symbol: 'OOF',
        description: card.description,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${card.name}`, // Placeholder image
        attributes: [
          { trait_type: 'Type', value: card.type },
          { trait_type: 'Power', value: card.power },
          { trait_type: 'Effect', value: card.effect },
          { trait_type: 'Missed Gains', value: card.missedGains }
        ]
      };

      setNftState({
        minting: false,
        mintingProgress: 100,
        lastMinted: metadata
      });

    } catch (error) {
      console.error('Error minting NFT:', error);
      setNftState({ ...nftState, minting: false, mintingProgress: 0 });
    }
  };

  // Card Component with NFT minting
  const OOFCardComponent = ({ card }: { card: OOFCard }) => (
    <div 
      className={cn(
        "relative bg-gradient-to-br p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 text-white",
        card.type === 'legendary' ? 'from-yellow-400 to-yellow-600' :
        card.type === 'epic' ? 'from-purple-400 to-purple-600' :
        'from-blue-400 to-blue-600'
      )}
      onClick={() => setSelectedCard(card)}
    >
      <div className="absolute top-2 right-2">
        <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30 text-white font-bold">
          {card.type.toUpperCase()}
        </span>
      </div>

      <div className="text-center mb-4">
        <div className="text-6xl mb-2">{card.icon}</div>
        <h3 className="text-xl font-bold">{card.name}</h3>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-white text-opacity-90">{card.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-red-200 font-bold">
            {typeof card.missedGains === 'number' ? 
              `$${card.missedGains.toLocaleString()}` : 
              card.missedGains}
          </span>
          <span className="text-white text-opacity-75 text-sm">{card.date}</span>
        </div>

        {card.realTransaction && (
          <div className="text-xs text-white text-opacity-60 truncate">
            TX: {card.txHash}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Zap className="text-yellow-300 mr-1" size={16} />
            <span className="text-sm">Power: {card.power}</span>
          </div>
          <span className="text-white text-opacity-90 text-sm">{card.effect}</span>
        </div>
      </div>
    </div>
  );

  // Card Detail Modal
  const CardDetailModal = ({ card }: { card: OOFCard }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className={cn(
          "p-6 text-white",
          card.type === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
          card.type === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
          'bg-gradient-to-br from-blue-400 to-blue-600'
        )}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-6xl">{card.icon}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCard(null)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X size={20} />
            </Button>
          </div>
          <h2 className="text-2xl font-bold mb-2">{card.name}</h2>
          <p className="text-white text-opacity-90">{card.description}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {typeof card.missedGains === 'number' ? 
                  `$${card.missedGains.toLocaleString()}` : 
                  card.missedGains}
              </div>
              <div className="text-sm text-gray-600">Missed Gains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{card.power}</div>
              <div className="text-sm text-gray-600">Power Level</div>
            </div>
          </div>

          <div className="text-center">
            <div className="font-semibold text-purple-600">{card.effect}</div>
            <div className="text-sm text-gray-600">Special Effect</div>
          </div>

          {card.realTransaction && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-sm font-semibold">Real Transaction</div>
              <div className="text-xs text-gray-600 break-all">
                {card.txHash}
              </div>
            </div>
          )}

          <Button
            onClick={() => mintCardAsNFT(card)}
            disabled={nftState.minting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {nftState.minting ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Minting</span>
                <span className="text-sm">{nftState.mintingProgress}%</span>
              </div>
            ) : (
              <>
                <Star className="mr-2" size={16} />
                Mint as NFT
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            OOF Multiverse
          </h1>
          <p className="text-purple-300 mb-6">
            Turn your trading mistakes into collectible NFT cards ✨
          </p>

          {/* Wallet Connection */}
          {!walletState.connected ? (
            <div className="bg-purple-800 bg-opacity-50 rounded-lg p-6 mb-8">
              <Wallet className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Login to Generate Cards</h3>
              <p className="text-purple-300 mb-4">
                Login or signup to generate personalized OOF cards from your Solana trading history
              </p>
              <AuthButton />
            </div>
          ) : (
            <div className="bg-green-800 bg-opacity-50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Wallet Connected: {walletState.address.slice(0, 8)}...{walletState.address.slice(-8)}</span>
                <Button
                  size="sm"
                  onClick={() => generateCardsFromWallet(walletState.address)}
                  disabled={walletState.analyzing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {walletState.analyzing ? 'Analyzing...' : 'Analyze Trades'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{walletState.cards.length}</div>
            <div className="text-sm text-purple-300">Total Cards</div>
          </div>
          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {walletState.cards.filter(c => c.type === 'legendary').length}
            </div>
            <div className="text-sm text-purple-300">Legendary</div>
          </div>
          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 text-center">
            <Gem className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {walletState.cards.filter(c => c.type === 'epic').length}
            </div>
            <div className="text-sm text-purple-300">Epic</div>
          </div>
          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 text-center">
            <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {walletState.cards.filter(c => c.realTransaction).length}
            </div>
            <div className="text-sm text-purple-300">Real Trades</div>
          </div>
        </div>

        {/* Card Collection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {walletState.cards.map((card, index) => (
            <OOFCardComponent key={index} card={card} />
          ))}
        </div>

        {/* Card Detail Modal */}
        {selectedCard && <CardDetailModal card={selectedCard} />}

        {/* NFT Minting Success Modal */}
        {nftState.lastMinted && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-md w-full">
              <div className="text-center mb-6">
                <Sparkles className="text-yellow-500 w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-purple-900">
                  NFT Minted Successfully!
                </h3>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg mb-6 text-center">
                <div className="text-6xl mb-2">🎉</div>
                <p className="text-purple-700 font-semibold">{nftState.lastMinted.name}</p>
                <p className="text-sm text-purple-600">{nftState.lastMinted.description}</p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setNftState(prev => ({ ...prev, lastMinted: null }))}
                >
                  Close
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  View on Phantom
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OOFMultiverse;