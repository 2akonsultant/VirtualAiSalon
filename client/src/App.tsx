import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import ScanQR from "@/pages/scan-qr";
import AboutService from "@/pages/about-service";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyOTP from "@/pages/verify-otp";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import AuthGuard from "@/components/auth-guard";

function Router() {
  return (
    <>
      <Switch>
        {/* Authentication pages - accessible without login */}
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-otp" component={VerifyOTP} />
        
        {/* Protected routes - require authentication */}
        <Route path="/">
          <AuthGuard>
            <Navigation />
            <Home />
          </AuthGuard>
        </Route>
        <Route path="/services">
          <AuthGuard>
            <Navigation />
            <Services />
          </AuthGuard>
        </Route>
        <Route path="/services/:category">
          <AuthGuard>
            <Navigation />
            <Services />
          </AuthGuard>
        </Route>
        <Route path="/booking">
          <AuthGuard>
            <Navigation />
            <Booking />
          </AuthGuard>
        </Route>
        <Route path="/scan-qr">
          <AuthGuard>
            <Navigation />
            <ScanQR />
          </AuthGuard>
        </Route>
        <Route path="/about-service">
          <AuthGuard>
            <Navigation />
            <AboutService />
          </AuthGuard>
        </Route>
        <Route path="/dashboard">
          <AuthGuard>
            <Navigation />
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/ai-chat">
          <AuthGuard>
            <Navigation />
            <Home />
          </AuthGuard>
        </Route>
        
        {/* 404 page */}
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
