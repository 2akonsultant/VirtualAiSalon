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
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import MyBookings from "@/pages/my-bookings";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import AuthGuard from "@/components/auth-guard";
import WhatsAppChat from "@/components/whatsapp-chat";

function Router() {
  return (
    <>
      <Switch>
        {/* Authentication pages - accessible without login */}
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-otp" component={VerifyOTP} />
        <Route path="/admin-login" component={AdminLogin} />
        
        {/* Public routes - accessible without authentication */}
        <Route path="/">
          <Navigation />
          <Home />
        </Route>
        <Route path="/services">
          <Navigation />
          <Services />
        </Route>
        <Route path="/services/:category">
          <Navigation />
          <Services />
        </Route>
        <Route path="/about-service">
          <Navigation />
          <AboutService />
        </Route>
        
        {/* Protected routes - require authentication */}
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
        <Route path="/dashboard">
          <AuthGuard>
            <Navigation />
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/admin-dashboard">
          <AuthGuard>
            <Navigation />
            <AdminDashboard />
          </AuthGuard>
        </Route>
        <Route path="/my-bookings">
          <AuthGuard>
            <Navigation />
            <MyBookings />
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
          <WhatsAppChat 
            phoneNumber=""
            message="Hi, I would like to inquire about booking services"
          />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
