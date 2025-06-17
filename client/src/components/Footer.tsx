import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Mail, ExternalLink, Twitter, MessageCircle } from "lucide-react";
import { SiDiscord, SiTelegram, SiFarcaster, SiSolana } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeToNewsletter = useMutation({
    mutationFn: async (email: string) => {
      return fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive updates about new features and platform news.",
      });
      setEmail("");
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeToNewsletter.mutate(email);
    }
  };

  const socialLinks = [
    {
      name: "Discord",
      icon: <SiDiscord className="w-5 h-5" />,
      url: "https://discord.gg/oof-community",
      color: "hover:text-indigo-400"
    },
    {
      name: "Telegram",
      icon: <SiTelegram className="w-5 h-5" />,
      url: "https://t.me/oof_community",
      color: "hover:text-blue-400"
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      url: "https://twitter.com/oof_platform",
      color: "hover:text-gray-400"
    },
    {
      name: "Farcaster",
      icon: <SiFarcaster className="w-5 h-5" />,
      url: "https://warpcast.com/oof",
      color: "hover:text-purple-400"
    }
  ];

  return (
    <footer className="bg-gradient-to-t from-purple-950 to-purple-900 border-t border-purple-700">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-2xl font-bold text-white">OOF</span>
            </div>
            <p className="text-purple-300 mb-6 max-w-md">
              The meme coin for life's missed opportunities. Join the revolution and 
              turn your OOFs into wins with AI-powered Solana trading analytics.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-purple-800/50 border-purple-600 text-white placeholder-purple-400 flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={subscribeToNewsletter.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={`text-purple-400 ${social.color} p-2`}
                  onClick={() => window.open(social.url, '_blank')}
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Features Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <nav className="space-y-3">
              <Link href="/detective" className="block text-purple-300 hover:text-white transition-colors">
                Missed Opportunity Calculator
              </Link>
              <Link href="/wallet-analyzer" className="block text-purple-300 hover:text-white transition-colors">
                Wallet Analyzer
              </Link>
              <Link href="/tokens" className="block text-purple-300 hover:text-white transition-colors">
                Trading Arena
              </Link>
              <Link href="/time-machine" className="block text-purple-300 hover:text-white transition-colors">
                Time Machine
              </Link>
            </nav>
          </div>

          {/* Community Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <nav className="space-y-3">
              <a 
                href="https://t.me/oof_community" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-purple-300 hover:text-white transition-colors"
              >
                Telegram
              </a>
              <a 
                href="https://discord.gg/oof-community" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-purple-300 hover:text-white transition-colors"
              >
                Discord
              </a>
              <a 
                href="https://twitter.com/oof_platform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-purple-300 hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a 
                href="https://warpcast.com/oof" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-purple-300 hover:text-white transition-colors"
              >
                DevScreener
              </a>
            </nav>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <nav className="space-y-3">
              <Link href="/whitepaper" className="block text-purple-300 hover:text-white transition-colors">
                Whitepaper
              </Link>
              <Link href="/documentation" className="block text-purple-300 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/api" className="block text-purple-300 hover:text-white transition-colors">
                API
              </Link>
              <Link href="/support" className="block text-purple-300 hover:text-white transition-colors">
                Support
              </Link>
            </nav>
          </div>
        </div>

        {/* Partnership Banner */}
        <Card className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-600 mb-8">
          <div className="p-6 text-center">
            <h3 className="text-white text-lg font-semibold mb-2 flex items-center justify-center gap-2">
              <SiSolana className="w-5 h-5 text-purple-400" />
              Built on Solana
            </h3>
            <p className="text-purple-200 mb-4">
              Powered by the fastest blockchain for high-frequency memecoin trading
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-purple-700 text-purple-100">
                Lightning Fast
              </Badge>
              <Badge variant="secondary" className="bg-purple-700 text-purple-100">
                Low Fees
              </Badge>
              <Badge variant="secondary" className="bg-purple-700 text-purple-100">
                Secure
              </Badge>
            </div>
          </div>
        </Card>

        {/* Bottom Section */}
        <div className="border-t border-purple-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-purple-400 text-sm text-center md:text-left">
            © 2024 OOF Token. All rights reserved. Built on Solana ⚡
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link href="/partnerships" className="text-purple-300 hover:text-white transition-colors">
              Partnerships
            </Link>
            <a 
              href="/privacy" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-purple-300">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}