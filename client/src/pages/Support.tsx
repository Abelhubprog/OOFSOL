import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, MessageCircle, Mail, Phone, Clock, Search, ExternalLink, FileText, Video, Users } from "lucide-react";
import { SiDiscord, SiTelegram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Support() {
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    category: "",
    priority: "",
    subject: "",
    description: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const submitSupportMutation = useMutation({
    mutationFn: async (data: typeof supportForm) => {
      return fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Support ticket created!",
        description: `Ticket #${data.ticketId} has been created. We'll respond within 24 hours.`,
      });
      setSupportForm({
        name: "",
        email: "",
        category: "",
        priority: "",
        subject: "",
        description: ""
      });
    },
  });

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    submitSupportMutation.mutate(supportForm);
  };

  const faqItems = [
    {
      question: "How do I connect my Solana wallet?",
      answer: "Click the 'Connect Wallet' button in the top right corner and select your preferred wallet provider. We support Phantom, Solflare, and other popular Solana wallets through Dynamic.xyz integration."
    },
    {
      question: "What is the OOF Detective and how does it work?",
      answer: "OOF Detective is our AI-powered rug detection system that analyzes tokens for potential risks. It examines liquidity, holder distribution, contract verification, and social signals to provide a comprehensive risk assessment."
    },
    {
      question: "How accurate are the price predictions?",
      answer: "Our AI predictions are based on historical data and market analysis. While we strive for high accuracy, all predictions should be considered as educational content and not financial advice. Past performance doesn't guarantee future results."
    },
    {
      question: "How do I earn OOF tokens?",
      answer: "You can earn OOF tokens by making accurate predictions, participating in community events, referring new users, and engaging with various platform features. Check your profile for detailed earning opportunities."
    },
    {
      question: "What are the fees for using the platform?",
      answer: "Basic features are free to use. Premium features like advanced analytics and API access require a subscription. Token advertising costs $10 per 30-minute slot with revenue sharing for token holders."
    },
    {
      question: "How do I list my token for advertising?",
      answer: "Visit the main page where token advertising slots are displayed. Click on an empty slot, fill out the required information, and submit payment. Your ad will be activated after verification."
    },
    {
      question: "Is my wallet information secure?",
      answer: "Yes, we use industry-standard security practices. We never store your private keys and all wallet interactions are handled through secure, audited smart contracts and Dynamic.xyz infrastructure."
    },
    {
      question: "How do I report a bug or technical issue?",
      answer: "Use the support form below or join our Discord community. For critical issues, contact us directly at support@oof.app with detailed steps to reproduce the problem."
    }
  ];

  const supportChannels = [
    {
      name: "Live Chat",
      icon: <MessageCircle className="w-6 h-6 text-green-400" />,
      description: "Get instant help from our support team",
      availability: "24/7",
      responseTime: "< 5 minutes",
      action: "Start Chat",
      url: "#"
    },
    {
      name: "Email Support",
      icon: <Mail className="w-6 h-6 text-blue-400" />,
      description: "Send detailed questions and get comprehensive answers",
      availability: "24/7",
      responseTime: "< 24 hours",
      action: "Send Email",
      url: "mailto:support@oof.app"
    },
    {
      name: "Discord Community",
      icon: <SiDiscord className="w-6 h-6 text-indigo-400" />,
      description: "Join our community for peer support and discussions",
      availability: "24/7",
      responseTime: "Community driven",
      action: "Join Discord",
      url: "https://discord.gg/oof-community"
    },
    {
      name: "Telegram Support",
      icon: <SiTelegram className="w-6 h-6 text-blue-500" />,
      description: "Quick support and community updates",
      availability: "24/7",
      responseTime: "< 2 hours",
      action: "Join Telegram",
      url: "https://t.me/oof_support"
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users",
      icon: <FileText className="w-6 h-6 text-purple-400" />,
      url: "/documentation"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: <Video className="w-6 h-6 text-red-400" />,
      url: "https://youtube.com/oof-tutorials"
    },
    {
      title: "API Documentation",
      description: "Technical reference for developers",
      icon: <FileText className="w-6 h-6 text-green-400" />,
      url: "/api"
    },
    {
      title: "Community Forum",
      description: "User discussions and tips",
      icon: <Users className="w-6 h-6 text-blue-400" />,
      url: "https://forum.oof.app"
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Support Center
            </h1>
          </div>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Get help, find answers, and connect with our community. 
            We're here to ensure you have the best experience with OOF.
          </p>
        </div>

        {/* Support Channels */}
        <Card className="bg-purple-800/50 border-purple-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl">How Can We Help?</CardTitle>
            <p className="text-purple-300">
              Choose the best way to get support based on your needs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportChannels.map((channel, index) => (
                <Card key={index} className="bg-purple-700/30 border-purple-600 hover:border-purple-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {channel.icon}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{channel.name}</h3>
                    <p className="text-purple-300 text-sm mb-4">{channel.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-xs">{channel.availability}</span>
                      </div>
                      <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                        {channel.responseTime}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                      onClick={() => window.open(channel.url, channel.url.startsWith('#') ? '_self' : '_blank')}
                    >
                      {channel.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-purple-800/50">
            <TabsTrigger value="faq" className="data-[state=active]:bg-purple-600">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-purple-600">
              Contact Support
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600">
              Resources
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Frequently Asked Questions</CardTitle>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-purple-900/50 border-purple-700 text-white placeholder-purple-400"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQ.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-purple-600">
                      <AccordionTrigger className="text-white hover:text-purple-300">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-purple-200">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Submit a Support Ticket</CardTitle>
                <p className="text-purple-300">
                  Can't find what you're looking for? Send us a detailed message and we'll help you out.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSupport} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white font-medium mb-2 block">Full Name *</label>
                      <Input
                        required
                        value={supportForm.name}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-purple-900/50 border-purple-700 text-white"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-white font-medium mb-2 block">Email Address *</label>
                      <Input
                        type="email"
                        required
                        value={supportForm.email}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-purple-900/50 border-purple-700 text-white"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-white font-medium mb-2 block">Category *</label>
                      <select
                        required
                        value={supportForm.category}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-purple-900/50 border border-purple-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="">Select category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account & Wallet</option>
                        <option value="trading">Trading & Predictions</option>
                        <option value="payments">Payments & Billing</option>
                        <option value="api">API & Development</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white font-medium mb-2 block">Priority *</label>
                      <select
                        required
                        value={supportForm.priority}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full bg-purple-900/50 border border-purple-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="">Select priority</option>
                        <option value="low">Low - General question</option>
                        <option value="medium">Medium - Feature not working</option>
                        <option value="high">High - Can't access account</option>
                        <option value="urgent">Urgent - Security issue</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-white font-medium mb-2 block">Subject *</label>
                    <Input
                      required
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="bg-purple-900/50 border-purple-700 text-white"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white font-medium mb-2 block">Description *</label>
                    <Textarea
                      required
                      value={supportForm.description}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-purple-900/50 border-purple-700 text-white min-h-[120px]"
                      placeholder="Please provide as much detail as possible, including steps to reproduce the issue if applicable..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={submitSupportMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    {submitSupportMutation.isPending ? "Submitting..." : "Submit Support Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Help Resources</CardTitle>
                <p className="text-purple-300">
                  Explore our comprehensive resources to get the most out of OOF
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resources.map((resource, index) => (
                    <Card key={index} className="bg-purple-700/30 border-purple-600 hover:border-purple-500 transition-colors cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {resource.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                              {resource.title}
                            </h3>
                            <p className="text-purple-300 text-sm mb-4">{resource.description}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                              onClick={() => window.open(resource.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open Resource
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-600 mt-8">
          <CardContent className="py-8 text-center">
            <h3 className="text-white text-2xl font-bold mb-4">Still Need Help?</h3>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Our support team is standing by to help you with any questions or issues you might have. 
              We're committed to providing excellent customer service.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                className="border-purple-400 text-purple-200 hover:bg-purple-700"
                onClick={() => window.open('https://calendly.com/oof-support', '_blank')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Schedule a Call
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-400 text-purple-200 hover:bg-purple-700"
                onClick={() => window.open('https://status.oof.app', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                System Status
              </Button>
              <Button className="bg-white text-purple-900 hover:bg-purple-100">
                support@oof.app
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}