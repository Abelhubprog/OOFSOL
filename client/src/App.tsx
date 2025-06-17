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
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";

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
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
