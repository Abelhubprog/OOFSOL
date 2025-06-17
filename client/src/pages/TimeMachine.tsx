import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Calendar, 
  Trophy, 
  Timer, 
  Download, 
  Share2,
  ArrowRight,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function TimeMachine() {
  const [investmentAmount, setInvestmentAmount] = useState("1000");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMemecoin, setSelectedMemecoin] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  const memecoins = [
    {
      id: "bonk",
      name: "🐕 BONK - The Solana Dog that went 100x",
      launchPrice: 0.000000001,
      peakPrice: 0.0000001,
      peakDate: "January 2024",
      multiplier: 100
    },
    {
      id: "myro", 
      name: "🐱 MYRO - The cat that caught everyone by surprise",
      launchPrice: 0.001,
      peakPrice: 0.05,
      peakDate: "February 2024",
      multiplier: 50
    },
    {
      id: "wif",
      name: "🐶 WIF - The dog with a hat that mooned",
      launchPrice: 0.0001,
      peakPrice: 0.005,
      peakDate: "March 2024", 
      multiplier: 50
    }
  ];

  const dates = [
    { value: "2023-12", label: "December 2023" },
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" }
  ];

  const handleTimeTravel = () => {
    if (!investmentAmount || !selectedDate || !selectedMemecoin) {
      return;
    }

    setSimulationProgress(0);
    setShowResults(false);

    // Simulate time travel animation
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowResults(true);
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const selectedCoin = memecoins.find(coin => coin.id === selectedMemecoin);
  const missedGains = selectedCoin ? 
    (parseFloat(investmentAmount) * selectedCoin.multiplier) - parseFloat(investmentAmount) : 0;
  const oofPotential = parseFloat(investmentAmount) * 15; // Assume 15x potential with $OOF

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-purple-800/30 border-purple-700 glass-card shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 mr-3 text-purple-400" />
                <span className="text-4xl font-bold text-white">OOF Time Machine 🚀</span>
              </div>
              <p className="text-purple-300 text-lg">
                Travel back in time and see what could have been... or what could be with $OOF!
              </p>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Time Machine Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Investment Amount */}
              <Card className="bg-purple-700/30 border-purple-600">
                <CardContent className="p-6">
                  <Label className="text-purple-200 font-bold mb-2 block">Investment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="pl-10 bg-purple-600/50 border-purple-500 text-white"
                      placeholder="1000"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Date Selector */}
              <Card className="bg-purple-700/30 border-purple-600">
                <CardContent className="p-6">
                  <Label className="text-purple-200 font-bold mb-2 block">Travel Back To</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="bg-purple-600/50 border-purple-500 text-white">
                      <SelectValue placeholder="Select a date..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dates.map((date) => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Memecoin Selector */}
              <Card className="bg-purple-700/30 border-purple-600">
                <CardContent className="p-6">
                  <Label className="text-purple-200 font-bold mb-2 block">Choose Your (Missed) Destiny</Label>
                  <Select value={selectedMemecoin} onValueChange={setSelectedMemecoin}>
                    <SelectTrigger className="bg-purple-600/50 border-purple-500 text-white">
                      <SelectValue placeholder="Select a memecoin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {memecoins.map((coin) => (
                        <SelectItem key={coin.id} value={coin.id}>
                          {coin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Simulation Button */}
            <div className="text-center mb-12">
              <Button
                onClick={handleTimeTravel}
                disabled={!investmentAmount || !selectedDate || !selectedMemecoin}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-lg font-bold px-8 py-4"
              >
                Start Time Travel! ⚡
              </Button>
            </div>

            {/* Progress Animation */}
            {simulationProgress > 0 && !showResults && (
              <div className="mb-12">
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-purple-300">
                    Traveling through time... {simulationProgress}%
                  </div>
                </div>
                <Progress value={simulationProgress} className="w-full h-4" />
              </div>
            )}

            {/* Results Display */}
            {showResults && selectedCoin && (
              <div className="space-y-8">
                {/* Timeline Visualization */}
                <div className="relative">
                  <div className="h-2 bg-purple-600/30 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000" 
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <div className="bg-purple-700/50 p-2 rounded-full mb-2 w-fit mx-auto">
                        <Calendar className="w-5 h-5 text-purple-300" />
                      </div>
                      <div className="text-sm text-purple-300">Start Date</div>
                      <div className="font-bold text-white">{dates.find(d => d.value === selectedDate)?.label}</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-700/50 p-2 rounded-full mb-2 w-fit mx-auto">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="text-sm text-purple-300">Peak</div>
                      <div className="font-bold text-yellow-400">+{selectedCoin.multiplier * 100}%</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-700/50 p-2 rounded-full mb-2 w-fit mx-auto">
                        <Timer className="w-5 h-5 text-purple-300" />
                      </div>
                      <div className="text-sm text-purple-300">Peak Date</div>
                      <div className="font-bold text-white">{selectedCoin.peakDate}</div>
                    </div>
                  </div>
                </div>

                {/* Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Missed Opportunity */}
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-red-900">Missed Gains on {selectedCoin.name.split(' ')[1]}</h3>
                          <p className="text-red-600">If you had invested...</p>
                        </div>
                        <div className="text-4xl">{selectedCoin.name.split(' ')[0]}</div>
                      </div>
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        ${missedGains.toLocaleString()}
                      </div>
                      <div className="text-sm text-red-600">That's a lot of OOFs! 🤦‍♂️</div>
                      <div className="mt-4 space-y-2 text-sm text-red-700">
                        <div className="flex justify-between">
                          <span>Investment:</span>
                          <span>${parseFloat(investmentAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Peak Value:</span>
                          <span>${(parseFloat(investmentAmount) * selectedCoin.multiplier).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Multiplier:</span>
                          <span>{selectedCoin.multiplier}x</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* OOF Potential */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-green-900">$OOF Future Potential</h3>
                          <p className="text-green-600">But you can still...</p>
                        </div>
                        <div className="text-4xl">💎</div>
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${oofPotential.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        It's not too late to join the $OOF revolution! 🚀
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-green-700">
                        <div className="flex justify-between">
                          <span>Current Investment:</span>
                          <span>${parseFloat(investmentAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Potential Value:</span>
                          <span>${oofPotential.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Projected Multiplier:</span>
                          <span>15x</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Share Section */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Time Travel Results
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Download className="w-5 h-5 mr-2" />
                    Download Journey
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Invest in $OOF Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
