import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services/:category" component={Services} />
        <Route path="/booking" component={Booking} />
        <Route path="/ai-chat" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
