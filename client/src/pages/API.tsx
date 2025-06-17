import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Zap, Shield, Copy, CheckCircle, ExternalLink, Play, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function API() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
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

  const generateApiKey = () => {
    const newKey = `oof_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    toast({
      title: "API Key Generated",
      description: "Your new API key has been generated. Store it securely.",
    });
  };

  const endpoints = [
    {
      category: "Authentication",
      items: [
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Authenticate user and receive access token",
          parameters: [
            { name: "wallet", type: "string", required: true, description: "Solana wallet address" },
            { name: "signature", type: "string", required: true, description: "Signed message" }
          ],
          response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHLrGVk",
    "oofTokens": 1500,
    "level": 5
  }
}`,
          example: `curl -X POST 'https://api.oof.app/auth/login' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHLrGVk",
    "signature": "4f8c2..."
  }'`
        }
      ]
    },
    {
      category: "Tokens",
      items: [
        {
          method: "GET",
          path: "/api/tokens",
          description: "Retrieve all available tokens with current market data",
          parameters: [
            { name: "limit", type: "number", required: false, description: "Number of tokens to return (default: 100)" },
            { name: "offset", type: "number", required: false, description: "Pagination offset (default: 0)" },
            { name: "sort", type: "string", required: false, description: "Sort by: 'volume', 'price', 'marketCap' (default: 'volume')" }
          ],
          response: `{
  "tokens": [
    {
      "id": 1,
      "address": "So11111111111111111111111111111111111111112",
      "name": "Wrapped SOL",
      "symbol": "SOL",
      "price": 102.45,
      "volume24h": 1250000,
      "marketCap": 45000000000,
      "change24h": 5.2,
      "riskScore": 0.1
    }
  ],
  "total": 1247,
  "page": 1
}`,
          example: `curl -X GET 'https://api.oof.app/tokens?limit=10&sort=volume' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`
        },
        {
          method: "GET",
          path: "/api/tokens/{address}",
          description: "Get detailed information about a specific token",
          parameters: [
            { name: "address", type: "string", required: true, description: "Token contract address" }
          ],
          response: `{
  "token": {
    "id": 1,
    "address": "So11111111111111111111111111111111111111112",
    "name": "Wrapped SOL",
    "symbol": "SOL",
    "price": 102.45,
    "volume24h": 1250000,
    "marketCap": 45000000000,
    "change24h": 5.2,
    "riskScore": 0.1,
    "analysis": {
      "rugProbability": 0.05,
      "liquidityScore": 0.95,
      "holderDistribution": 0.85
    }
  }
}`,
          example: `curl -X GET 'https://api.oof.app/tokens/So11111111111111111111111111111111111111112' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`
        }
      ]
    },
    {
      category: "Predictions",
      items: [
        {
          method: "POST",
          path: "/api/predictions",
          description: "Create a new price prediction",
          parameters: [
            { name: "tokenId", type: "number", required: true, description: "Token ID to predict" },
            { name: "prediction", type: "string", required: true, description: "'bullish' or 'bearish'" },
            { name: "targetPrice", type: "number", required: true, description: "Predicted price target" },
            { name: "timeframe", type: "string", required: true, description: "'1h', '24h', '7d', '30d'" }
          ],
          response: `{
  "prediction": {
    "id": 456,
    "tokenId": 1,
    "userId": "123",
    "prediction": "bullish",
    "targetPrice": 120.00,
    "timeframe": "24h",
    "confidence": 0.75,
    "createdAt": "2025-06-17T22:45:00Z"
  }
}`,
          example: `curl -X POST 'https://api.oof.app/predictions' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{
    "tokenId": 1,
    "prediction": "bullish",
    "targetPrice": 120.00,
    "timeframe": "24h"
  }'`
        },
        {
          method: "GET",
          path: "/api/predictions/user",
          description: "Get user's prediction history",
          parameters: [
            { name: "limit", type: "number", required: false, description: "Number of predictions to return" },
            { name: "status", type: "string", required: false, description: "'pending', 'resolved', 'expired'" }
          ],
          response: `{
  "predictions": [
    {
      "id": 456,
      "tokenId": 1,
      "prediction": "bullish",
      "targetPrice": 120.00,
      "currentPrice": 115.30,
      "status": "pending",
      "accuracy": null,
      "payout": null
    }
  ],
  "stats": {
    "total": 25,
    "accuracy": 0.68,
    "totalPayout": 2450
  }
}`,
          example: `curl -X GET 'https://api.oof.app/predictions/user?limit=20' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`
        }
      ]
    },
    {
      category: "Analytics",
      items: [
        {
          method: "POST",
          path: "/api/analyze/token",
          description: "Run AI analysis on a token for rug detection",
          parameters: [
            { name: "address", type: "string", required: true, description: "Token contract address" },
            { name: "deep", type: "boolean", required: false, description: "Run deep analysis (costs more)" }
          ],
          response: `{
  "analysis": {
    "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHLrGVk",
    "riskScore": 0.25,
    "riskLevel": "LOW",
    "rugProbability": 0.15,
    "redFlags": [],
    "greenFlags": [
      "Liquidity locked for 6 months",
      "Verified contract",
      "Active community"
    ],
    "liquidityAnalysis": {
      "totalLiquidity": 50000,
      "liquidityRatio": 0.85,
      "liquidityLocked": true
    },
    "confidence": 0.92
  }
}`,
          example: `curl -X POST 'https://api.oof.app/analyze/token' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{
    "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHLrGVk",
    "deep": true
  }'`
        },
        {
          method: "GET",
          path: "/api/analytics/missed-opportunities",
          description: "Calculate missed opportunities for a wallet",
          parameters: [
            { name: "wallet", type: "string", required: true, description: "Wallet address to analyze" },
            { name: "timeframe", type: "string", required: false, description: "'24h', '7d', '30d' (default: '30d')" }
          ],
          response: `{
  "missedOpportunities": [
    {
      "token": {
        "name": "Bonk",
        "symbol": "BONK",
        "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
      },
      "potentialGains": 15000,
      "investmentAmount": 100,
      "missedAt": "2025-06-10T15:30:00Z",
      "currentValue": 15100,
      "reason": "Sold too early"
    }
  ],
  "totalMissedValue": 45000,
  "oofScore": 750
}`,
          example: `curl -X GET 'https://api.oof.app/analytics/missed-opportunities?wallet=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHLrGVk' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`
        }
      ]
    },
    {
      category: "Advertising",
      items: [
        {
          method: "GET",
          path: "/api/token-ads/current",
          description: "Get currently active token advertisements",
          parameters: [],
          response: `{
  "ads": [
    {
      "id": 1,
      "tokenName": "PepeCoin",
      "tokenSymbol": "PEPE",
      "tokenAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      "buyLink": "https://dexscreener.com/solana/...",
      "slotNumber": 1,
      "timeRemaining": 1800000,
      "views": 1250,
      "clicks": 45
    }
  ]
}`,
          example: `curl -X GET 'https://api.oof.app/token-ads/current'`
        },
        {
          method: "POST",
          path: "/api/token-ads/submit",
          description: "Submit a new token advertisement",
          parameters: [
            { name: "tokenAddress", type: "string", required: true, description: "Token contract address" },
            { name: "tokenName", type: "string", required: true, description: "Token name" },
            { name: "tokenSymbol", type: "string", required: true, description: "Token symbol" },
            { name: "buyLink", type: "string", required: true, description: "Where users can buy the token" },
            { name: "slotNumber", type: "number", required: true, description: "Preferred slot (1-6)" },
            { name: "description", type: "string", required: false, description: "Token description" }
          ],
          response: `{
  "message": "Ad listing submitted successfully",
  "adId": 123,
  "paymentInstructions": {
    "amount": "$10 USD equivalent",
    "wallet": "admin_wallet_address",
    "note": "Send payment confirmation to activate your listing"
  }
}`,
          example: `curl -X POST 'https://api.oof.app/token-ads/submit' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{
    "tokenAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "tokenName": "PepeCoin",
    "tokenSymbol": "PEPE",
    "buyLink": "https://dexscreener.com/solana/...",
    "slotNumber": 1,
    "description": "The ultimate meme coin"
  }'`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Code className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              API Reference
            </h1>
          </div>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Comprehensive API documentation for integrating with the OOF platform. 
            Access real-time market data, AI analytics, and trading features programmatically.
          </p>
          
          {/* API Key Generation */}
          <Card className="max-w-2xl mx-auto bg-purple-800/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Your API key will appear here"
                  value={apiKey}
                  readOnly
                  className="bg-purple-900/50 border-purple-700 text-white"
                />
                <Button 
                  onClick={generateApiKey}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Generate Key
                </Button>
              </div>
              <p className="text-purple-300 text-sm mt-2">
                Keep your API key secure. Rate limit: 1000 requests/hour for free tier.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card className="bg-purple-800/50 border-purple-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Base URL</h4>
                <div className="bg-purple-900/50 p-3 rounded-lg">
                  <code className="text-purple-300">https://api.oof.app</code>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Authentication</h4>
                <div className="bg-purple-900/50 p-3 rounded-lg">
                  <code className="text-purple-300">Authorization: Bearer YOUR_API_KEY</code>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Example Request</h4>
              <div className="relative">
                <pre className="bg-purple-900/50 p-4 rounded-lg text-sm text-purple-300 overflow-x-auto">
{`curl -X GET 'https://api.oof.app/tokens' \\
  -H 'Authorization: Bearer oof_your_api_key_here' \\
  -H 'Content-Type: application/json'`}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 px-2"
                  onClick={() => copyToClipboard(`curl -X GET 'https://api.oof.app/tokens' \\
  -H 'Authorization: Bearer oof_your_api_key_here' \\
  -H 'Content-Type: application/json'`, 'quick-start')}
                >
                  {copiedCode === 'quick-start' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Free Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-purple-200">
                <p>• 1,000 requests/hour</p>
                <p>• Basic token data</p>
                <p>• Standard analytics</p>
                <p>• Community support</p>
              </div>
              <Badge className="mt-4 bg-green-600 text-white">$0/month</Badge>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Pro Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-purple-200">
                <p>• 10,000 requests/hour</p>
                <p>• Real-time data</p>
                <p>• AI analytics</p>
                <p>• Priority support</p>
              </div>
              <Badge className="mt-4 bg-yellow-600 text-white">$29/month</Badge>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-purple-200">
                <p>• Unlimited requests</p>
                <p>• Custom endpoints</p>
                <p>• Dedicated support</p>
                <p>• SLA guarantee</p>
              </div>
              <Badge className="mt-4 bg-purple-600 text-white">Custom</Badge>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <Card className="bg-purple-800/50 border-purple-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={endpoints[0].category.toLowerCase()} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-purple-700/50">
                {endpoints.map((category) => (
                  <TabsTrigger 
                    key={category.category.toLowerCase()} 
                    value={category.category.toLowerCase()}
                    className="data-[state=active]:bg-purple-600"
                  >
                    {category.category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {endpoints.map((category) => (
                <TabsContent key={category.category.toLowerCase()} value={category.category.toLowerCase()}>
                  <div className="space-y-8">
                    {category.items.map((endpoint, index) => (
                      <div key={index} className="border border-purple-600 rounded-lg p-6 bg-purple-900/20">
                        {/* Method and Path */}
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className={`${
                            endpoint.method === 'GET' ? 'bg-green-600' : 
                            endpoint.method === 'POST' ? 'bg-blue-600' : 
                            endpoint.method === 'PUT' ? 'bg-yellow-600' : 'bg-red-600'
                          } text-white font-mono`}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-purple-300 text-lg">{endpoint.path}</code>
                        </div>

                        {/* Description */}
                        <p className="text-purple-200 mb-6">{endpoint.description}</p>

                        {/* Parameters */}
                        {endpoint.parameters.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-white font-semibold mb-3">Parameters</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-purple-600">
                                    <th className="text-left text-purple-300 py-2">Name</th>
                                    <th className="text-left text-purple-300 py-2">Type</th>
                                    <th className="text-left text-purple-300 py-2">Required</th>
                                    <th className="text-left text-purple-300 py-2">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param, paramIndex) => (
                                    <tr key={paramIndex} className="border-b border-purple-700/50">
                                      <td className="text-purple-200 py-2">
                                        <code>{param.name}</code>
                                      </td>
                                      <td className="text-purple-300 py-2">{param.type}</td>
                                      <td className="py-2">
                                        <Badge variant={param.required ? "destructive" : "secondary"}>
                                          {param.required ? "Required" : "Optional"}
                                        </Badge>
                                      </td>
                                      <td className="text-purple-200 py-2">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Example Request */}
                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-3">Example Request</h4>
                          <div className="relative">
                            <pre className="bg-purple-900/50 p-4 rounded-lg text-sm text-purple-300 overflow-x-auto">
                              {endpoint.example}
                            </pre>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 px-2"
                              onClick={() => copyToClipboard(endpoint.example, `request-${category.category}-${index}`)}
                            >
                              {copiedCode === `request-${category.category}-${index}` ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Example Response */}
                        <div>
                          <h4 className="text-white font-semibold mb-3">Example Response</h4>
                          <div className="relative">
                            <pre className="bg-purple-900/50 p-4 rounded-lg text-sm text-purple-300 overflow-x-auto">
                              {endpoint.response}
                            </pre>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 px-2"
                              onClick={() => copyToClipboard(endpoint.response, `response-${category.category}-${index}`)}
                            >
                              {copiedCode === `response-${category.category}-${index}` ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* SDKs and Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                SDKs & Libraries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "JavaScript/TypeScript", description: "npm install @oof/sdk", status: "Available" },
                  { name: "Python", description: "pip install oof-python", status: "Available" },
                  { name: "Rust", description: "cargo add oof-rust", status: "Coming Soon" },
                  { name: "Go", description: "go get github.com/oof/go-sdk", status: "Coming Soon" }
                ].map((sdk, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-semibold">{sdk.name}</h4>
                      <code className="text-purple-300 text-sm">{sdk.description}</code>
                    </div>
                    <Badge variant={sdk.status === "Available" ? "default" : "secondary"}>
                      {sdk.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-800/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-green-400" />
                Interactive Playground
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-200 mb-4">
                Test API endpoints directly in your browser with our interactive playground.
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400">
                  <Play className="w-4 h-4 mr-2" />
                  Launch API Playground
                </Button>
                <Button variant="outline" className="w-full border-purple-600 text-purple-300 hover:bg-purple-700">
                  <FileText className="w-4 h-4 mr-2" />
                  View OpenAPI Spec
                </Button>
                <Button variant="outline" className="w-full border-purple-600 text-purple-300 hover:bg-purple-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Postman Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <Card className="bg-gradient-to-r from-purple-800 to-pink-800 border-purple-600 mt-8">
          <CardContent className="py-8 text-center">
            <h3 className="text-white text-2xl font-bold mb-4">Need Help with Integration?</h3>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Our developer support team is here to help you integrate with the OOF API. 
              Get assistance with implementation, troubleshooting, and optimization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Developer Discord
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-700">
                <FileText className="w-4 h-4 mr-2" />
                View Tutorials
              </Button>
              <Button className="bg-white text-purple-900 hover:bg-purple-100">
                Contact Developer Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}