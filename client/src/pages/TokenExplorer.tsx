import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, ArrowUp, ArrowDown, Star, Eye, Wallet, ShoppingCart } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { solanaTokenService } from '@/services/solanaTokenService';
import { solanaOnChainService } from '@/services/solanaOnChainService';
import type { TokenInfo } from '@/services/solanaTokenService';
import AuthButton from '@/components/AuthButton';

export default function TokenExplorer() {
  const { user, primaryWallet } = useDynamicContext();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [tradingAmount, setTradingAmount] = useState('');

  useEffect(() => {
    loadTrendingTokens();
  }, []);

  const loadTrendingTokens = async () => {
    try {
      setLoading(true);
      const trendingTokens = await solanaTokenService.getTrendingTokens();
      setTokens(trendingTokens);
    } catch (error) {
      console.error('Error loading trending tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTrendingTokens();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await solanaTokenService.searchTokens(searchQuery);
      setTokens(searchResults);
    } catch (error) {
      console.error('Error searching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyToken = async (token: TokenInfo) => {
    if (!primaryWallet || !tradingAmount) return;

    try {
      const result = await solanaOnChainService.buyPumpFunToken(
        token.mint,
        parseFloat(tradingAmount),
        primaryWallet.address
      );

      if (result.success) {
        alert(`Buy order successful! Transaction: ${result.signature}`);
      } else {
        alert(`Buy failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error buying token:', error);
      alert('Failed to execute buy order');
    }
  };

  const handleSellToken = async (token: TokenInfo) => {
    if (!primaryWallet || !tradingAmount) return;

    try {
      const result = await solanaOnChainService.sellPumpFunToken(
        token.mint,
        parseFloat(tradingAmount),
        primaryWallet.address
      );

      if (result.success) {
        alert(`Sell order successful! Transaction: ${result.signature}`);
      } else {
        alert(`Sell failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error selling token:', error);
      alert('Failed to execute sell order');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Token Explorer</h1>
            <p className="text-purple-300">Discover and trade Solana tokens with real-time data</p>
          </div>
          <AuthButton />
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-purple-800/50 border-purple-700">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <Input
                  placeholder="Search tokens by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-purple-900/50 border-purple-600 text-white placeholder-purple-400"
                />
              </div>
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button onClick={loadTrendingTokens} variant="outline" className="border-purple-600 text-purple-300">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Token Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-purple-800/50 border-purple-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-purple-700 rounded mb-4"></div>
                  <div className="h-4 bg-purple-700 rounded mb-2"></div>
                  <div className="h-4 bg-purple-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <Card key={token.mint} className="bg-purple-800/50 border-purple-700 hover:bg-purple-800/70 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {token.imageUrl ? (
                      <img 
                        src={token.imageUrl} 
                        alt={token.name}
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23a855f7"/><text x="24" y="28" text-anchor="middle" fill="white" font-size="16">?</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{token.symbol[0]}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{token.name}</CardTitle>
                      <p className="text-purple-300 text-sm">${token.symbol}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-300">
                      {token.bondingCurveProgress.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price and Market Cap */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-400 text-xs">Price</p>
                      <p className="text-white font-semibold">{formatPrice(token.price)}</p>
                    </div>
                    <div>
                      <p className="text-purple-400 text-xs">Market Cap</p>
                      <p className="text-white font-semibold">${formatNumber(token.marketCap)}</p>
                    </div>
                  </div>

                  {/* Bonding Curve Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-purple-400 mb-1">
                      <span>Bonding Curve</span>
                      <span>{token.bondingCurveProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-purple-900 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(token.bondingCurveProgress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Trading Actions */}
                  {primaryWallet ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Amount in SOL"
                        value={tradingAmount}
                        onChange={(e) => setTradingAmount(e.target.value)}
                        className="bg-purple-900/50 border-purple-600 text-white"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleBuyToken(token)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={!tradingAmount}
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Buy
                        </Button>
                        <Button 
                          onClick={() => handleSellToken(token)}
                          variant="outline"
                          className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20"
                          disabled={!tradingAmount}
                        >
                          <ArrowDown className="w-4 h-4 mr-1" />
                          Sell
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-purple-400 text-sm mb-2">Connect wallet to trade</p>
                      <AuthButton />
                    </div>
                  )}

                  {/* Token Info */}
                  <div className="flex justify-between text-xs text-purple-400">
                    <span>Liquidity: ${formatNumber(token.liquidity)}</span>
                    <span>Created: {token.createdAt.toLocaleDateString()}</span>
                  </div>

                  {/* Social Links */}
                  {(token.websiteUrl || token.twitterUrl || token.telegramUrl) && (
                    <div className="flex gap-2 pt-2 border-t border-purple-700">
                      {token.websiteUrl && (
                        <Button size="sm" variant="ghost" className="text-purple-400 hover:text-white">
                          Website
                        </Button>
                      )}
                      {token.twitterUrl && (
                        <Button size="sm" variant="ghost" className="text-purple-400 hover:text-white">
                          Twitter
                        </Button>
                      )}
                      {token.telegramUrl && (
                        <Button size="sm" variant="ghost" className="text-purple-400 hover:text-white">
                          Telegram
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && tokens.length === 0 && (
          <Card className="bg-purple-800/50 border-purple-700">
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No tokens found</h3>
              <p className="text-purple-400">Try adjusting your search terms or browse trending tokens</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}