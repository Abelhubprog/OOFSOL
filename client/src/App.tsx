import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TradersArena from "@/pages/TradersArena";
import TimeMachine from "@/pages/TimeMachine";
import WalletAnalyzer from "@/pages/WalletAnalyzer";
import Slots from "@/pages/Slots";
import OOFDetective from "@/pages/OOFDetective";
import OOFDetectiveAdvanced from "@/pages/OOFDetectiveAdvanced";
import OOFOrigins from "@/pages/OOFOrigins";
import OOFLegends from "@/pages/OOFLegends";
import OOFStaking from "@/pages/OOFStaking";
import OOFBattleRoyale from "@/pages/OOFBattleRoyale";
import OOFRealityBender from "@/pages/OOFRealityBender";
import OOFAirdrop from "@/pages/OOFAirdrop";
import OOFSocial from "@/pages/OOFSocial";
import OOFMoments from "@/pages/OOFMoments";
import OOFMultiverse from "@/pages/OOFMultiverse";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import BottomSlider from "@/components/BottomSlider";



function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-3 sm:p-6 pb-20 overflow-auto">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tokens" component={TradersArena} />
          <Route path="/moments" component={OOFMoments} />
          <Route path="/multiverse" component={OOFMultiverse} />
          <Route path="/profile" component={Profile} />
          <Route path="/time-machine" component={TimeMachine} />
          <Route path="/wallet-analyzer" component={WalletAnalyzer} />
          <Route path="/slots" component={Slots} />
          <Route path="/detective" component={OOFDetective} />
          <Route path="/detective-advanced" component={OOFDetectiveAdvanced} />
          <Route path="/origins" component={OOFOrigins} />
          <Route path="/legends" component={OOFLegends} />
          <Route path="/staking" component={OOFStaking} />
          <Route path="/battle-royale" component={OOFBattleRoyale} />
          <Route path="/reality-bender" component={OOFRealityBender} />
          <Route path="/airdrop" component={OOFAirdrop} />
          <Route path="/social" component={OOFSocial} />
          <Route path="/traders-arena" component={TradersArena} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomSlider />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;