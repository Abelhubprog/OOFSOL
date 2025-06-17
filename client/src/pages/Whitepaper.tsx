import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Upload, Play, Pause, Volume2, VolumeX, Share2, BookOpen, TrendingUp, Shield, Users, Zap, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Whitepaper() {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      
      return fetch('/api/whitepaper/upload-video', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Video uploaded successfully!",
        description: "Your video has been added to the whitepaper.",
      });
      setUploadedVideo(data.videoUrl);
    },
  });

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo(videoUrl);
      uploadVideoMutation.mutate(file);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const downloadWhitepaper = () => {
    // Trigger PDF download
    const link = document.createElement('a');
    link.href = '/api/whitepaper/download-pdf';
    link.download = 'OOF-Whitepaper-v1.0.pdf';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              OOF Whitepaper
            </h1>
          </div>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Comprehensive technical documentation outlining OOF's revolutionary approach to Solana memecoin trading, 
            AI-powered analytics, and gamified user experiences.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-purple-700 text-purple-100 px-4 py-2">
              Version 1.0
            </Badge>
            <Badge variant="secondary" className="bg-purple-700 text-purple-100 px-4 py-2">
              Last Updated: June 2025
            </Badge>
            <Badge variant="secondary" className="bg-purple-700 text-purple-100 px-4 py-2">
              42 Pages
            </Badge>
            <Button onClick={downloadWhitepaper} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Video Section */}
        <Card className="bg-purple-800/50 border-purple-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-400" />
              Executive Summary Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedVideo ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={uploadedVideo}
                  className="w-full h-64 object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={togglePlay}
                      className="bg-purple-600 hover:bg-purple-500"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleMute}
                      className="bg-purple-600 hover:bg-purple-500"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-purple-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Upload Executive Summary Video</h3>
                <p className="text-purple-300 mb-4">Share a video explaining the key concepts of OOF</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="bg-purple-900/50 border-purple-700 text-white"
                  />
                  <Textarea
                    placeholder="Video description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    className="bg-purple-900/50 border-purple-700 text-white"
                  />
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadVideoMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  {uploadVideoMutation.isPending ? "Uploading..." : "Choose Video File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <p className="text-sm text-purple-400 mt-2">Maximum file size: 100MB</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <nav className="space-y-2">
                    {[
                      "1. Executive Summary",
                      "2. Problem Statement",
                      "3. Solution Architecture",
                      "4. Token Economics",
                      "5. Technology Stack",
                      "6. AI & Analytics",
                      "7. Gamification Layer",
                      "8. Revenue Model",
                      "9. Roadmap",
                      "10. Security & Compliance",
                      "11. Team & Advisors",
                      "12. Conclusion"
                    ].map((item, index) => (
                      <a
                        key={index}
                        href={`#section-${index + 1}`}
                        className="block text-purple-300 hover:text-white hover:bg-purple-700/30 p-2 rounded transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Key Highlights */}
          <div className="lg:col-span-2">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white">Key Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">AI-Powered Analytics</h4>
                      <p className="text-purple-300 text-sm">Advanced machine learning algorithms for rug detection and market analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Security First</h4>
                      <p className="text-purple-300 text-sm">Multi-layered security architecture with real-time risk assessment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Community Driven</h4>
                      <p className="text-purple-300 text-sm">Gamified experiences that reward community participation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Real-time Performance</h4>
                      <p className="text-purple-300 text-sm">WebSocket connections for instant market updates and notifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Solana Integration</h4>
                      <p className="text-purple-300 text-sm">Native Solana blockchain integration with Dynamic wallet support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-pink-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Revenue Sharing</h4>
                      <p className="text-purple-300 text-sm">Automated token advertising system with smart revenue distribution</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8" id="section-1">
          <CardHeader>
            <CardTitle className="text-white text-2xl">1. Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <p>
              OOF represents a paradigm shift in cryptocurrency trading platforms, specifically designed for the Solana memecoin ecosystem. 
              By combining cutting-edge AI analytics, gamified user experiences, and real-time market intelligence, OOF transforms the 
              traditionally chaotic world of memecoin trading into an engaging, educational, and profitable journey.
            </p>
            <p>
              Our platform addresses critical pain points in the memecoin space: lack of reliable analytics, high risk of rug pulls, 
              poor user experience, and limited educational resources. Through our innovative "missed opportunity calculator," 
              AI-powered rug detection, and gamified learning modules, users can make informed decisions while enjoying the process.
            </p>
            <p>
              The OOF ecosystem features multiple revenue streams including token advertising, premium analytics subscriptions, 
              NFT moment generation, and revenue sharing mechanisms that benefit both the platform and its community members.
            </p>
          </CardContent>
        </Card>

        {/* Problem Statement */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8" id="section-2">
          <CardHeader>
            <CardTitle className="text-white text-2xl">2. Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <h4 className="text-white font-semibold">Current Market Challenges:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>85% of memecoins fail within their first month due to rug pulls or abandonment</li>
              <li>Lack of comprehensive analytics tools for memecoin evaluation</li>
              <li>Poor user experience in existing trading platforms</li>
              <li>Limited educational resources for new traders</li>
              <li>No gamification elements to encourage learning and engagement</li>
              <li>Fragmented information across multiple platforms</li>
            </ul>
            <p>
              These challenges result in significant financial losses for retail investors and hinder the growth of the legitimate 
              memecoin ecosystem. OOF addresses each of these pain points through innovative technology and user-centered design.
            </p>
          </CardContent>
        </Card>

        {/* Download CTA */}
        <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-600 text-center">
          <CardContent className="py-12">
            <h3 className="text-white text-2xl font-bold mb-4">Ready to Learn More?</h3>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Download the complete whitepaper to explore our technology stack, tokenomics, roadmap, and detailed implementation plans.
            </p>
            <Button
              onClick={downloadWhitepaper}
              size="lg"
              className="bg-white text-purple-900 hover:bg-purple-100 font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Full Whitepaper (42 pages)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}