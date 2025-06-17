import { useState, useEffect } from "react";
import { 
  Shield, AlertTriangle, TrendingUp, Eye, Users, 
  Clock, Zap, Search, Filter, RefreshCw, Star
} from 'lucide-react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function OOFDetective() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);

  // Real-time token monitoring data
  const [liveTokens, setLiveTokens] = useState([
    {
      id: 1,
      address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      name: 'BONK',
      symbol: 'BONK',
      emoji: '🐕',
      deployTime: '2 minutes ago',
      riskScore: 25,
      liquidityUSD: 145000,
      holderCount: 1247,
      whaleActivity: 'High',
      socialBuzz: 78,
      rugRisk: 'Low',
      status: 'safe'
    },
    {
      id: 2,
      address: '8FU95xFJhUUkyyCLU13HSzDLs7oC4QZdXQHL6SCeab36',
      name: 'SUS Token',
      symbol: 'SUS',
      emoji: '🤨',
      deployTime: '1 minute ago',
      riskScore: 85,
      liquidityUSD: 500,
      holderCount: 5,
      whaleActivity: 'Extreme',
      socialBuzz: 2,
      rugRisk: 'Very High',
      status: 'danger'
    },
    {
      id: 3,
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      name: 'MYRO',
      symbol: 'MYRO',
      emoji: '🐱',
      deployTime: '5 minutes ago',
      riskScore: 35,
      liquidityUSD: 89000,
      holderCount: 892,
      whaleActivity: 'Medium',
      socialBuzz: 65,
      rugRisk: 'Low',
      status: 'safe'
    }
  ]);

  const DetectionRadar = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Eye className="text-purple-600 mr-2" />
          Live Detection Radar
        </h2>
        <div className="flex items-center space-x-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {liveTokens.map(token => (
          <TokenDetectionCard key={token.id} token={token} onSelect={setSelectedToken} />
        ))}
      </div>
    </div>
  );

  const TokenDetectionCard = ({ token, onSelect }) => (
    <div 
      onClick={() => onSelect(token)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        token.status === 'danger' ? 'border-red-200 bg-red-50' :
        token.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-green-200 bg-green-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{token.emoji}</div>
          <div>
            <div className="font-bold text-lg">{token.name}</div>
            <div className="text-sm text-gray-600">{token.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            token.riskScore < 30 ? 'bg-green-100 text-green-700' :
            token.riskScore < 70 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Risk: {token.riskScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">{token.deployTime}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-sm">
        <div className="bg-white p-2 rounded">
          <div className="text-gray-600">Liquidity</div>
          <div className="font-bold">${token.liquidityUSD.toLocaleString()}</div>
        </div>
        <div className="bg-white p-2 rounded">
          <div className="text-gray-600">Holders</div>
          <div className="font-bold">{token.holderCount}</div>
        </div>
        <div className="bg-white p-2 rounded">
          <div className="text-gray-600">Whale Activity</div>
          <div className="font-bold">{token.whaleActivity}</div>
        </div>
        <div className="bg-white p-2 rounded">
          <div className="text-gray-600">Social</div>
          <div className="font-bold">{token.socialBuzz}/100</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className={`text-sm font-bold ${
          token.rugRisk === 'Low' ? 'text-green-600' :
          token.rugRisk === 'Medium' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          Rug Risk: {token.rugRisk}
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-purple-600 hover:text-purple-700">
            <Star size={16} />
          </button>
          <button className="text-blue-600 hover:text-blue-700">
            <TrendingUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const TokenAnalysisPanel = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Deep Analysis</h2>
      
      {selectedToken ? (
        <div className="space-y-6">
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-4xl mb-2">{selectedToken.emoji}</div>
            <div className="font-bold text-xl">{selectedToken.name}</div>
            <div className="text-purple-600">{selectedToken.symbol}</div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Contract Address</span>
              <span className="font-mono text-sm">{selectedToken.address.slice(0, 8)}...</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Liquidity Pool</div>
                <div className="font-bold">${selectedToken.liquidityUSD.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Holder Count</div>
                <div className="font-bold">{selectedToken.holderCount}</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm font-bold mb-2">AI Risk Assessment</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    selectedToken.riskScore < 30 ? 'bg-green-500' :
                    selectedToken.riskScore < 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${selectedToken.riskScore}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {selectedToken.riskScore < 30 ? 'Safe to trade' :
                 selectedToken.riskScore < 70 ? 'Proceed with caution' :
                 'High risk - avoid trading'}
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Mark as Safe
              </Button>
              <Button variant="outline" className="w-full">
                Add to Watchlist
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-200">
                Report Suspicious
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          Select a token for detailed analysis
        </div>
      )}
    </div>
  );

  const CommunityValidation = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Users className="text-purple-600 mr-2" />
        Community Validation
      </h2>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold">Recent Reports</div>
            <div className="text-sm text-gray-600">Last 24h</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-gray-600">Safe Marks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-gray-600">Rug Reports</div>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="font-bold mb-3">Top Detectives</div>
          <div className="space-y-2">
            {['CryptoSherlock', 'RugHunter', 'SafetyFirst'].map((name, index) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="text-sm text-purple-600">
                  {100 - index * 15} Reports
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-800">
            <Zap className="inline mr-1" size={16} />
            Earn $OOF tokens for accurate detections and community contributions!
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">
            OOF Detective
          </h1>
          <p className="text-purple-600 mb-8">
            Please log in to access the detection radar and protect the community.
          </p>
          <a 
            href="/api/login"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Login to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">
          OOF Detective
        </h1>
        <p className="text-purple-600">
          Real-time monitoring of new memecoin deployments and whale movements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Shield size={20} />
            <span>Tokens Scanned</span>
          </div>
          <div className="text-2xl font-bold">1,247</div>
          <div className="text-sm text-green-600">+23 today</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <AlertTriangle size={20} />
            <span>Rugs Detected</span>
          </div>
          <div className="text-2xl font-bold">43</div>
          <div className="text-sm text-red-600">+2 today</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Users size={20} />
            <span>Community Score</span>
          </div>
          <div className="text-2xl font-bold">892</div>
          <div className="text-sm text-green-600">Top 5%</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Star size={20} />
            <span>Earned $OOF</span>
          </div>
          <div className="text-2xl font-bold">{user?.oofTokens || 0}</div>
          <div className="text-sm text-purple-600">from detections</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
          <input
            type="text"
            placeholder="Search by token name, symbol, or contract address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Tokens</option>
          <option value="safe">Safe</option>
          <option value="warning">Warning</option>
          <option value="danger">High Risk</option>
        </select>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <RefreshCw size={20} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Detection Radar */}
        <div className="col-span-2">
          <DetectionRadar />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TokenAnalysisPanel />
          <CommunityValidation />
        </div>
      </div>
    </div>
  );
}