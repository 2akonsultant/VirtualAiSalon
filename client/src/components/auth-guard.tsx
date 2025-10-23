import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyOTP from "@/pages/verify-otp";
import { getAuthStatus } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const { isAuthenticated, user } = getAuthStatus();

    console.log("🔐 Auth Guard Check:", {
      isAuthenticated,
      user,
      currentPath: location
    });

    // Allow access to auth pages without authentication
    const authPages = ["/login", "/signup", "/verify-otp", "/admin-login"];
    const isOnAuthPage = authPages.includes(location);

    // Only redirect to login if not authenticated and not on auth page
    if (!isAuthenticated && !isOnAuthPage) {
      console.log("🚪 Redirecting to login - user not authenticated");
      setLocation("/login");
    }

    setIsLoading(false);
  }, [location, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication status
  const { isAuthenticated, user } = getAuthStatus();
  const authPages = ["/login", "/signup", "/verify-otp", "/admin-login"];
  const isOnAuthPage = authPages.includes(location);

  // Role-based redirect logic
  if (isAuthenticated && !isOnAuthPage) {
    // If admin tries to access regular user pages, redirect to admin dashboard
    if (user.role === "admin" && !location.startsWith("/admin")) {
      if (location === "/dashboard" || location === "/my-bookings") {
        setLocation("/admin-dashboard");
        return <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Redirecting...</p>
          </div>
        </div>;
      }
    }
    
    // If regular user tries to access admin pages, redirect to home
    if (user.role !== "admin" && location.startsWith("/admin")) {
      setLocation("/");
      return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>;
    }
  }

  // If not authenticated and not on auth page, show login
  if (!isAuthenticated && !isOnAuthPage) {
    return <Login />;
  }

  // If on auth pages, show the appropriate auth component
  if (isOnAuthPage) {
    switch (location) {
      case "/login":
        return <Login />;
      case "/signup":
        return <Signup />;
      case "/verify-otp":
        return <VerifyOTP />;
      default:
        return <Login />;
    }
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}
