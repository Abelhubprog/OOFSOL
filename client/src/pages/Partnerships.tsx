import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Handshake, Users, Globe, TrendingUp, Shield, Zap, ExternalLink, Mail, MessageCircle, Twitter } from "lucide-react";
import { SiDiscord, SiTelegram, SiFarcaster, SiSolana, SiChainlink } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Partnerships() {
  const [partnershipForm, setPartnershipForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    partnershipType: "",
    description: "",
    website: "",
    expectedVolume: ""
  });
  const { toast } = useToast();

  const submitPartnershipMutation = useMutation({
    mutationFn: async (data: typeof partnershipForm) => {
      return fetch('/api/partnerships/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Partnership application submitted!",
        description: "We'll review your application and get back to you within 48 hours.",
      });
      setPartnershipForm({
        companyName: "",
        contactName: "",
        email: "",
        partnershipType: "",
        description: "",
        website: "",
        expectedVolume: ""
      });
    },
  });

  const handleSubmitPartnership = (e: React.FormEvent) => {
    e.preventDefault();
    submitPartnershipMutation.mutate(partnershipForm);
  };

  const partners = [
    {
      name: "Solana Foundation",
      logo: <SiSolana className="w-12 h-12 text-purple-400" />,
      category: "Blockchain Infrastructure",
      description: "Official partnership providing blockchain infrastructure and validator support",
      website: "https://solana.org",
      status: "Strategic Partner"
    },
    {
      name: "Chainlink",
      logo: <SiChainlink className="w-12 h-12 text-blue-400" />,
      category: "Oracle Network",
      description: "Providing reliable price feeds and off-chain data for our AI analytics",
      website: "https://chainlink.network",
      status: "Technology Partner"
    },
    {
      name: "Uniswap Labs",
      logo: <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">U</div>,
      category: "DeFi Protocol",
      description: "Integration partner for cross-chain token swapping and liquidity",
      website: "https://uniswap.org",
      status: "Integration Partner"
    },
    {
      name: "Dynamic",
      logo: <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">D</div>,
      category: "Wallet Infrastructure",
      description: "Powering our secure multi-chain wallet connection and authentication",
      website: "https://dynamic.xyz",
      status: "Technology Partner"
    },
    {
      name: "DexScreener",
      logo: <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">DS</div>,
      category: "Market Data",
      description: "Real-time market data and trading analytics integration",
      website: "https://dexscreener.com",
      status: "Data Partner"
    },
    {
      name: "Jupiter",
      logo: <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">J</div>,
      category: "DEX Aggregator",
      description: "Best-price execution and routing for Solana token swaps",
      website: "https://jup.ag",
      status: "Integration Partner"
    }
  ];

  const partnershipTypes = [
    {
      title: "Technology Integration",
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      description: "Integrate your technology with our platform to enhance user experience",
      benefits: [
        "API access and documentation",
        "Joint marketing opportunities",
        "Revenue sharing on integrations",
        "Technical support and collaboration"
      ]
    },
    {
      title: "Strategic Alliance",
      icon: <Handshake className="w-8 h-8 text-blue-400" />,
      description: "Long-term strategic partnership for mutual growth and market expansion",
      benefits: [
        "Co-branded initiatives",
        "Shared business development",
        "Joint product development",
        "Executive partnership meetings"
      ]
    },
    {
      title: "Data Partnership",
      icon: <TrendingUp className="w-8 h-8 text-green-400" />,
      description: "Provide or consume high-quality market data and analytics",
      benefits: [
        "Real-time data feeds",
        "Custom analytics endpoints",
        "Data quality guarantees",
        "Competitive pricing models"
      ]
    },
    {
      title: "Community Partnership",
      icon: <Users className="w-8 h-8 text-purple-400" />,
      description: "Collaborate on community building and educational initiatives",
      benefits: [
        "Cross-community events",
        "Educational content sharing",
        "User growth initiatives",
        "Ambassador programs"
      ]
    }
  ];

  const socialLinks = [
    {
      name: "Discord",
      icon: <SiDiscord className="w-6 h-6" />,
      url: "https://discord.gg/oof-community",
      color: "text-indigo-400 hover:text-indigo-300",
      members: "15,000+ members"
    },
    {
      name: "Telegram",
      icon: <SiTelegram className="w-6 h-6" />,
      url: "https://t.me/oof_community",
      color: "text-blue-400 hover:text-blue-300",
      members: "8,500+ members"
    },
    {
      name: "Twitter/X",
      icon: <Twitter className="w-6 h-6" />,
      url: "https://twitter.com/oof_platform",
      color: "text-gray-400 hover:text-gray-300",
      members: "25,000+ followers"
    },
    {
      name: "Farcaster",
      icon: <SiFarcaster className="w-6 h-6" />,
      url: "https://warpcast.com/oof",
      color: "text-purple-400 hover:text-purple-300",
      members: "2,100+ followers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Handshake className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Partnerships
            </h1>
          </div>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Building the future of Solana memecoin trading through strategic partnerships, 
            technology integrations, and community collaborations.
          </p>
        </div>

        {/* Current Partners */}
        <Card className="bg-purple-800/50 border-purple-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Our Partners
            </CardTitle>
            <p className="text-purple-300">
              Trusted by leading organizations in the Web3 and DeFi ecosystem
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner, index) => (
                <Card key={index} className="bg-purple-700/30 border-purple-600 hover:border-purple-500 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {partner.logo}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{partner.name}</h3>
                        <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                          {partner.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-purple-200 text-sm mb-3">{partner.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        {partner.category}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-white"
                        onClick={() => window.open(partner.website, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partnership Types */}
        <Card className="bg-purple-800/50 border-purple-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Partnership Opportunities</CardTitle>
            <p className="text-purple-300">
              Explore different ways to collaborate and grow together
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnershipTypes.map((type, index) => (
                <Card key={index} className="bg-purple-700/30 border-purple-600">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {type.icon}
                      <CardTitle className="text-white text-xl">{type.title}</CardTitle>
                    </div>
                    <p className="text-purple-300">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-white font-semibold mb-3">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-purple-200 text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media & Community */}
        <Card className="bg-purple-800/50 border-purple-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              Connect With Our Community
            </CardTitle>
            <p className="text-purple-300">
              Join our growing community across multiple platforms
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {socialLinks.map((social, index) => (
                <Card key={index} className="bg-purple-700/30 border-purple-600 hover:border-purple-500 transition-colors cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`flex justify-center mb-4 ${social.color} transition-colors`}>
                      {social.icon}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{social.name}</h3>
                    <p className="text-purple-300 text-sm mb-4">{social.members}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white group-hover:border-purple-400"
                      onClick={() => window.open(social.url, '_blank')}
                    >
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partnership Application Form */}
        <Card className="bg-purple-800/50 border-purple-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-green-400" />
              Partnership Application
            </CardTitle>
            <p className="text-purple-300">
              Interested in partnering with OOF? Fill out the form below and we'll get back to you.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPartnership} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white font-medium mb-2 block">Company Name *</label>
                  <Input
                    required
                    value={partnershipForm.companyName}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, companyName: e.target.value }))}
                    className="bg-purple-900/50 border-purple-700 text-white"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Contact Name *</label>
                  <Input
                    required
                    value={partnershipForm.contactName}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, contactName: e.target.value }))}
                    className="bg-purple-900/50 border-purple-700 text-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={partnershipForm.email}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-purple-900/50 border-purple-700 text-white"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Website</label>
                  <Input
                    type="url"
                    value={partnershipForm.website}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-purple-900/50 border-purple-700 text-white"
                    placeholder="https://company.com"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Partnership Type *</label>
                  <select
                    required
                    value={partnershipForm.partnershipType}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, partnershipType: e.target.value }))}
                    className="w-full bg-purple-900/50 border border-purple-700 text-white rounded-md px-3 py-2"
                  >
                    <option value="">Select partnership type</option>
                    <option value="technology">Technology Integration</option>
                    <option value="strategic">Strategic Alliance</option>
                    <option value="data">Data Partnership</option>
                    <option value="community">Community Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Expected Volume</label>
                  <Input
                    value={partnershipForm.expectedVolume}
                    onChange={(e) => setPartnershipForm(prev => ({ ...prev, expectedVolume: e.target.value }))}
                    className="bg-purple-900/50 border-purple-700 text-white"
                    placeholder="$100k+ monthly"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-white font-medium mb-2 block">Partnership Description *</label>
                <Textarea
                  required
                  value={partnershipForm.description}
                  onChange={(e) => setPartnershipForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-purple-900/50 border-purple-700 text-white min-h-[120px]"
                  placeholder="Tell us about your company, what you're looking to achieve through partnership, and how we can work together..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={submitPartnershipMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 flex-1"
                >
                  {submitPartnershipMutation.isPending ? "Submitting..." : "Submit Partnership Application"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-600 text-purple-300 hover:bg-purple-700"
                  onClick={() => window.open('mailto:partnerships@oof.app', '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Directly
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-600 mt-8">
          <CardContent className="py-8 text-center">
            <h3 className="text-white text-2xl font-bold mb-4">Ready to Partner With Us?</h3>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              We're always looking for innovative partners to help revolutionize the Solana memecoin ecosystem. 
              Let's build something amazing together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                className="border-purple-400 text-purple-200 hover:bg-purple-700"
                onClick={() => window.open('https://calendly.com/oof-partnerships', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Schedule a Call
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-400 text-purple-200 hover:bg-purple-700"
                onClick={() => window.open('/whitepaper', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Our Whitepaper
              </Button>
              <Button className="bg-white text-purple-900 hover:bg-purple-100">
                partnerships@oof.app
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}