import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Clock, 
  Eye, 
  MousePointer, 
  ExternalLink, 
  Twitter, 
  MessageCircle,
  Globe,
  DollarSign,
  Timer,
  Wallet
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TokenAd {
  id: number;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  advertiserWallet: string;
  buyLink: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'gif';
  telegram?: string;
  twitter?: string;
  website?: string;
  description?: string;
  slotNumber: number;
  views: number;
  clicks: number;
  timeRemaining: number;
}

interface ListingFormData {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  buyLink: string;
  description: string;
  telegram: string;
  twitter: string;
  website: string;
  mediaFile: File | null;
}

const ADMIN_WALLET = "ADMINWALLETaddressHERE123456789";
const SLOT_DURATION = 30 * 60 * 1000; // 30 minutes
const LISTING_FEE_USD = 10;

export default function TokenAdvertisingSpaces() {
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeUntilRotation, setTimeUntilRotation] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({
    tokenAddress: '',
    tokenName: '',
    tokenSymbol: '',
    buyLink: '',
    description: '',
    telegram: '',
    twitter: '',
    website: '',
    mediaFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current active ads
  const { data: activeAds = [], isLoading } = useQuery({
    queryKey: ['/api/token-ads/current'],
    queryFn: async () => {
      const response = await fetch('/api/token-ads/current');
      if (!response.ok) throw new Error('Failed to fetch ads');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate current cycle and time remaining
  useEffect(() => {
    const updateCycleInfo = () => {
      const now = Date.now();
      const cycleStart = Math.floor(now / SLOT_DURATION) * SLOT_DURATION;
      const cycle = Math.floor(now / (SLOT_DURATION * 6));
      const timeRemaining = SLOT_DURATION - (now % SLOT_DURATION);
      
      setCurrentCycle(cycle);
      setTimeUntilRotation(timeRemaining);
    };

    updateCycleInfo();
    const interval = setInterval(updateCycleInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  // Submit listing mutation
  const submitListingMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formDataObj: any = {};
      data.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      return fetch('/api/token-ads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataObj),
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your token has been listed successfully. Payment confirmation pending.",
      });
      setIsListingModalOpen(false);
      setFormData({
        tokenAddress: '',
        tokenName: '',
        tokenSymbol: '',
        buyLink: '',
        description: '',
        telegram: '',
        twitter: '',
        website: '',
        mediaFile: null
      });
      queryClient.invalidateQueries({ queryKey: ['/api/token-ads/current'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit listing",
        variant: "destructive",
      });
    },
  });

  // Track ad interaction
  const trackInteraction = useMutation({
    mutationFn: async ({ adId, type }: { adId: number; type: 'view' | 'click' }) => {
      return fetch('/api/token-ads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, interactionType: type }),
      }).then(res => res.json());
    },
  });

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSlotClick = (slotIndex: number) => {
    const ad = Array.isArray(activeAds) ? activeAds.find((ad: any) => ad.slotNumber === slotIndex) : null;
    
    if (ad) {
      // Track click and redirect to buy link
      trackInteraction.mutate({ adId: ad.id, type: 'click' });
      window.open(ad.buyLink, '_blank');
    } else {
      // Open listing modal for this slot
      setSelectedSlot(slotIndex);
      setIsListingModalOpen(true);
    }
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tokenAddress || !formData.buyLink) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tokenAddress', formData.tokenAddress);
      formDataToSend.append('tokenName', formData.tokenName);
      formDataToSend.append('tokenSymbol', formData.tokenSymbol);
      formDataToSend.append('buyLink', formData.buyLink);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('telegram', formData.telegram);
      formDataToSend.append('twitter', formData.twitter);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('slotNumber', selectedSlot?.toString() || '0');
      formDataToSend.append('adminWallet', ADMIN_WALLET);
      
      if (formData.mediaFile) {
        formDataToSend.append('mediaFile', formData.mediaFile);
      }

      await submitListingMutation.mutateAsync(formDataToSend);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image (JPG, PNG, GIF) or video (MP4)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, mediaFile: file }));
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
            🚀 Featured Solana Tokens
          </h2>
          <p className="text-purple-300 mb-6">
            Advertise your token for only $10 • 30-minute slots • Revenue sharing for buyers
          </p>
          
          {/* Rotation Timer */}
          <div className="inline-flex items-center space-x-2 bg-purple-800/50 rounded-full px-4 py-2 mb-8">
            <Timer className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-200">
              Next rotation in: {formatTimeRemaining(timeUntilRotation)}
            </span>
          </div>
        </div>

        {/* Advertising Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => {
            const ad = Array.isArray(activeAds) ? activeAds.find((ad: any) => ad.slotNumber === index) : null;
            
            return (
              <Card 
                key={index}
                className="group bg-gradient-to-br from-purple-800/50 to-purple-900/50 border-purple-700 hover:border-purple-500 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => handleSlotClick(index)}
              >
                <CardContent className="p-6">
                  {ad ? (
                    <TokenAdCard ad={ad} />
                  ) : (
                    <EmptySlotCard slotNumber={index + 1} />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="bg-purple-800/30 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-center mb-4">💡 How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-200">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p><strong>Pay $10</strong> in any token to advertise for 30 minutes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <p><strong>Revenue sharing:</strong> Buyers get rewards from ad revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p><strong>Track performance:</strong> Views, clicks, and purchases</p>
            </div>
          </div>
        </div>

        {/* Listing Modal */}
        <Dialog open={isListingModalOpen} onOpenChange={setIsListingModalOpen}>
          <DialogContent className="max-w-2xl bg-purple-900 border-purple-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                List Your Token - Slot #{selectedSlot !== null ? selectedSlot + 1 : ''}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmitListing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tokenAddress" className="text-purple-200">Token Address *</Label>
                  <Input
                    id="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenAddress: e.target.value }))}
                    placeholder="Enter Solana token address"
                    className="bg-purple-800 border-purple-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tokenSymbol" className="text-purple-200">Token Symbol *</Label>
                  <Input
                    id="tokenSymbol"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="e.g., $MYTOKEN"
                    className="bg-purple-800 border-purple-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tokenName" className="text-purple-200">Token Name *</Label>
                <Input
                  id="tokenName"
                  value={formData.tokenName}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                  placeholder="Full token name"
                  className="bg-purple-800 border-purple-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyLink" className="text-purple-200">Buy Link *</Label>
                <Input
                  id="buyLink"
                  value={formData.buyLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyLink: e.target.value }))}
                  placeholder="https://pump.fun/token/..."
                  className="bg-purple-800 border-purple-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-purple-200">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your token"
                  className="bg-purple-800 border-purple-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="twitter" className="text-purple-200">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    placeholder="https://twitter.com/..."
                    className="bg-purple-800 border-purple-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telegram" className="text-purple-200">Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                    placeholder="https://t.me/..."
                    className="bg-purple-800 border-purple-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website" className="text-purple-200">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                    className="bg-purple-800 border-purple-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mediaFile" className="text-purple-200">Media File (Optional)</Label>
                <Input
                  id="mediaFile"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/mp4"
                  className="bg-purple-800 border-purple-600 text-white"
                />
                <p className="text-xs text-purple-400 mt-1">
                  Upload an image or video (max 10MB). Supports JPG, PNG, GIF, MP4
                </p>
              </div>

              <div className="bg-purple-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Payment Instructions:</h4>
                <p className="text-purple-200 text-sm mb-2">
                  Send $10 worth of any token to: <br />
                  <code className="bg-purple-700 px-2 py-1 rounded text-xs">{ADMIN_WALLET}</code>
                </p>
                <p className="text-purple-300 text-xs">
                  Your listing will be activated once payment is confirmed. Slots are first-come, first-served.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsListingModalOpen(false)}
                  className="flex-1 border-purple-600 text-purple-200 hover:bg-purple-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function TokenAdCard({ ad }: { ad: TokenAd }) {
  return (
    <div className="h-full flex flex-col">
      {/* Media Section */}
      {ad.mediaUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          {ad.mediaType === 'video' ? (
            <video
              src={ad.mediaUrl}
              autoPlay
              loop
              muted
              className="w-full h-32 object-cover"
            />
          ) : (
            <img
              src={ad.mediaUrl}
              alt={ad.tokenName}
              className="w-full h-32 object-cover"
            />
          )}
        </div>
      )}

      {/* Token Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">${ad.tokenSymbol}</h3>
          <div className="flex space-x-2">
            {ad.twitter && (
              <a href={ad.twitter} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {ad.telegram && (
              <a href={ad.telegram} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {ad.website && (
              <a href={ad.website} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <p className="text-purple-200 text-sm mb-3">{ad.tokenName}</p>
        
        {ad.description && (
          <p className="text-purple-300 text-xs mb-3 line-clamp-2">{ad.description}</p>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center text-xs text-purple-400 mb-3">
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {ad.views}
          </span>
          <span className="flex items-center">
            <MousePointer className="w-3 h-3 mr-1" />
            {ad.clicks}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(ad.timeRemaining / 60000)}m
          </span>
        </div>

        {/* Buy Button */}
        <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
          <ExternalLink className="w-4 h-4 mr-2" />
          Buy ${ad.tokenSymbol}
        </Button>
      </div>
    </div>
  );
}

function EmptySlotCard({ slotNumber }: { slotNumber: number }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-8">
      <div className="w-16 h-16 bg-purple-700/50 rounded-full flex items-center justify-center mb-4">
        <DollarSign className="w-8 h-8 text-purple-300" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">Slot #{slotNumber}</h3>
      <p className="text-purple-300 text-sm mb-4">Available for advertising</p>
      
      <div className="space-y-2 text-xs text-purple-400">
        <p>• 30-minute exposure</p>
        <p>• Only $10 in any token</p>
        <p>• Revenue sharing rewards</p>
      </div>
      
      <Button 
        size="sm" 
        className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        List Your Token
      </Button>
    </div>
  );
}