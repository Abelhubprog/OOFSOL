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
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";
import { SolanaWalletProvider } from "./components/SolanaWalletProvider";

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
    <>
      {isAuthenticated && <Navigation />}
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/arena" component={TradersArena} />
            <Route path="/time-machine" component={TimeMachine} />
            <Route path="/wallet-analyzer" component={WalletAnalyzer} />
            <Route path="/slots" component={Slots} />
            <Route path="/detective" component={OOFDetective} />
            <Route path="/detective-ai" component={OOFDetectiveAdvanced} />
            <Route path="/origins" component={OOFOrigins} />
            <Route path="/legends" component={OOFLegends} />
            <Route path="/staking" component={OOFStaking} />
            <Route path="/battle-royale" component={OOFBattleRoyale} />
            <Route path="/reality-bender" component={OOFRealityBender} />
            <Route path="/airdrop" component={OOFAirdrop} />
            <Route path="/social" component={OOFSocial} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          <TooltipProvider>
            <Navigation />
            <main className="pt-16">
              <Router />
            </main>
            <Toaster />
          </TooltipProvider>
        </SolanaWalletProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;