import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Code, Palette, Users, Zap, Shield, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Code copied!",
      description: "Code snippet has been copied to clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const designSections = [
    {
      id: "colors",
      title: "Color System",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-semibold mb-4">Primary Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Purple 900", color: "#581c87", var: "--purple-900" },
                { name: "Purple 800", color: "#7c3aed", var: "--purple-800" },
                { name: "Purple 600", color: "#9333ea", var: "--purple-600" },
                { name: "Purple 400", color: "#c084fc", var: "--purple-400" },
              ].map((color) => (
                <div key={color.name} className="text-center">
                  <div 
                    className="w-full h-16 rounded-lg mb-2 border border-purple-700"
                    style={{ backgroundColor: color.color }}
                  />
                  <p className="text-white text-sm font-medium">{color.name}</p>
                  <p className="text-purple-300 text-xs">{color.color}</p>
                  <code className="text-xs text-purple-400">{color.var}</code>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Accent Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Pink 600", color: "#db2777", var: "--pink-600" },
                { name: "Green 400", color: "#4ade80", var: "--green-400" },
                { name: "Blue 400", color: "#60a5fa", var: "--blue-400" },
                { name: "Yellow 400", color: "#facc15", var: "--yellow-400" },
              ].map((color) => (
                <div key={color.name} className="text-center">
                  <div 
                    className="w-full h-16 rounded-lg mb-2 border border-purple-700"
                    style={{ backgroundColor: color.color }}
                  />
                  <p className="text-white text-sm font-medium">{color.name}</p>
                  <p className="text-purple-300 text-xs">{color.color}</p>
                  <code className="text-xs text-purple-400">{color.var}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "typography",
      title: "Typography",
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Heading 1 - 4xl Bold</h1>
            <code className="text-purple-400 text-sm">text-4xl font-bold</code>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Heading 2 - 3xl Bold</h2>
            <code className="text-purple-400 text-sm">text-3xl font-bold</code>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">Heading 3 - 2xl Semibold</h3>
            <code className="text-purple-400 text-sm">text-2xl font-semibold</code>
          </div>
          <div>
            <p className="text-lg text-white mb-2">Body Large - lg Regular</p>
            <code className="text-purple-400 text-sm">text-lg</code>
          </div>
          <div>
            <p className="text-base text-purple-200 mb-2">Body Medium - base Regular</p>
            <code className="text-purple-400 text-sm">text-base text-purple-200</code>
          </div>
          <div>
            <p className="text-sm text-purple-300 mb-2">Body Small - sm Regular</p>
            <code className="text-purple-400 text-sm">text-sm text-purple-300</code>
          </div>
        </div>
      )
    },
    {
      id: "components",
      title: "Components",
      content: (
        <div className="space-y-8">
          <div>
            <h4 className="text-white font-semibold mb-4">Buttons</h4>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Primary Button</Button>
              <Button variant="secondary" className="bg-purple-700 text-purple-100">Secondary Button</Button>
              <Button variant="outline" className="border-purple-600 text-purple-300">Outline Button</Button>
            </div>
            <div className="bg-purple-900/50 p-4 rounded-lg">
              <code className="text-purple-300 text-sm">
{`<Button className="bg-gradient-to-r from-purple-600 to-pink-600">
  Primary Button
</Button>`}
              </code>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Cards</h4>
            <Card className="bg-purple-800/50 border-purple-700 mb-4">
              <CardHeader>
                <CardTitle className="text-white">Card Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">Card content goes here with proper spacing and typography.</p>
              </CardContent>
            </Card>
            <div className="bg-purple-900/50 p-4 rounded-lg">
              <code className="text-purple-300 text-sm">
{`<Card className="bg-purple-800/50 border-purple-700">
  <CardHeader>
    <CardTitle className="text-white">Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-purple-200">Content</p>
  </CardContent>
</Card>`}
              </code>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Badges</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-purple-600 text-white">Default</Badge>
              <Badge variant="secondary" className="bg-purple-700 text-purple-100">Secondary</Badge>
              <Badge className="bg-green-600 text-white">Success</Badge>
              <Badge className="bg-red-600 text-white">Error</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "layouts",
      title: "Layout Patterns",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-semibold mb-4">Grid Systems</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-purple-700/50 p-4 rounded text-center text-white">Column 1</div>
              <div className="bg-purple-700/50 p-4 rounded text-center text-white">Column 2</div>
              <div className="bg-purple-700/50 p-4 rounded text-center text-white">Column 3</div>
            </div>
            <code className="text-purple-400 text-sm">grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4</code>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Flexbox Utilities</h4>
            <div className="flex items-center justify-between bg-purple-700/50 p-4 rounded mb-2">
              <span className="text-white">Left</span>
              <span className="text-white">Center</span>
              <span className="text-white">Right</span>
            </div>
            <code className="text-purple-400 text-sm">flex items-center justify-between</code>
          </div>
        </div>
      )
    }
  ];

  const guideSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Quick Start Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="text-white font-semibold">Connect Your Wallet</h4>
                  <p className="text-purple-300">Use Dynamic.xyz to connect your Solana wallet securely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="text-white font-semibold">Explore Features</h4>
                  <p className="text-purple-300">Navigate through various tools like Detective, Trading Arena, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="text-white font-semibold">Start Trading</h4>
                  <p className="text-purple-300">Use our AI-powered analytics to make informed decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "features",
      title: "Feature Overview",
      content: (
        <div className="space-y-6">
          {[
            {
              icon: <Shield className="w-6 h-6 text-blue-400" />,
              title: "OOF Detective",
              description: "AI-powered rug detection and token analysis"
            },
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              title: "Trading Arena",
              description: "Real-time token trading with advanced analytics"
            },
            {
              icon: <Users className="w-6 h-6 text-purple-400" />,
              title: "Community Features",
              description: "Leaderboards, achievements, and social trading"
            },
            {
              icon: <Code className="w-6 h-6 text-green-400" />,
              title: "Developer Tools",
              description: "APIs and webhooks for advanced users"
            }
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-purple-800/30 rounded-lg">
              {feature.icon}
              <div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-purple-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Documentation
            </h1>
          </div>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Comprehensive guides, design system, and technical documentation for the OOF platform
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-purple-800/50 border-purple-700 text-white placeholder-purple-400"
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="guides" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-purple-800/50">
            <TabsTrigger value="guides" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              User Guides
            </TabsTrigger>
            <TabsTrigger value="design" className="data-[state=active]:bg-purple-600">
              <Palette className="w-4 h-4 mr-2" />
              Design System
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-purple-600">
              <Code className="w-4 h-4 mr-2" />
              Technical Docs
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              API Reference
            </TabsTrigger>
          </TabsList>

          {/* User Guides */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <Card className="bg-purple-800/50 border-purple-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Navigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <nav className="space-y-2">
                        {guideSections.map((section) => (
                          <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="block text-purple-300 hover:text-white hover:bg-purple-700/30 p-2 rounded transition-colors"
                          >
                            {section.title}
                          </a>
                        ))}
                      </nav>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3 space-y-8">
                {guideSections.map((section) => (
                  <Card key={section.id} id={section.id} className="bg-purple-800/50 border-purple-700">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {section.content}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Design System */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <Card className="bg-purple-800/50 border-purple-700">
                  <CardHeader>
                    <CardTitle className="text-white">Design Elements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <nav className="space-y-2">
                        {designSections.map((section) => (
                          <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="block text-purple-300 hover:text-white hover:bg-purple-700/30 p-2 rounded transition-colors"
                          >
                            {section.title}
                          </a>
                        ))}
                      </nav>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3 space-y-8">
                {designSections.map((section) => (
                  <Card key={section.id} id={section.id} className="bg-purple-800/50 border-purple-700">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {section.content}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Technical Documentation */}
          <TabsContent value="technical" className="space-y-6">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white">Architecture Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Technology Stack</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "React.js", description: "Frontend framework", type: "Frontend" },
                      { name: "TypeScript", description: "Type safety", type: "Language" },
                      { name: "Tailwind CSS", description: "Styling framework", type: "Styling" },
                      { name: "Node.js", description: "Backend runtime", type: "Backend" },
                      { name: "Solana", description: "Blockchain integration", type: "Blockchain" },
                      { name: "Dynamic.xyz", description: "Wallet connection", type: "Web3" },
                    ].map((tech, index) => (
                      <div key={index} className="p-4 bg-purple-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{tech.name}</h4>
                          <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                            {tech.type}
                          </Badge>
                        </div>
                        <p className="text-purple-300 text-sm">{tech.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-purple-800/50 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    method: "GET",
                    endpoint: "/api/tokens",
                    description: "Retrieve all available tokens",
                    example: `curl -X GET 'https://oof.app/api/tokens' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`
                  },
                  {
                    method: "POST",
                    endpoint: "/api/predictions",
                    description: "Create a new price prediction",
                    example: `curl -X POST 'https://oof.app/api/predictions' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{"tokenId": 1, "prediction": "bullish", "targetPrice": 0.05}'`
                  },
                  {
                    method: "GET",
                    endpoint: "/api/token-ads/current",
                    description: "Get current active token advertisements",
                    example: `curl -X GET 'https://oof.app/api/token-ads/current'`
                  }
                ].map((endpoint, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${
                        endpoint.method === 'GET' ? 'bg-green-600' : 
                        endpoint.method === 'POST' ? 'bg-blue-600' : 'bg-purple-600'
                      } text-white`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-purple-300">{endpoint.endpoint}</code>
                    </div>
                    <p className="text-purple-200">{endpoint.description}</p>
                    <div className="relative">
                      <pre className="bg-purple-900/50 p-4 rounded-lg text-sm text-purple-300 overflow-x-auto">
                        {endpoint.example}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 px-2"
                        onClick={() => copyToClipboard(endpoint.example, `example-${index}`)}
                      >
                        {copiedCode === `example-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-600 mt-12">
          <CardContent className="py-8 text-center">
            <h3 className="text-white text-xl font-bold mb-4">Need Help?</h3>
            <p className="text-purple-200 mb-6">
              Can't find what you're looking for? Join our community or contact support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}