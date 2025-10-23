import { useState } from "react";
import { useLocation } from "wouter";
import { Phone, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import GoogleAuth from "@/components/GoogleAuth";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // If user needs to verify email, redirect to verification
        if (data.requiresVerification && data.userId) {
          localStorage.setItem("pendingUserId", data.userId);
          localStorage.setItem("pendingUserEmail", credentials.email);
          setLocation("/verify-otp");
          return null;
        }
        
        throw new Error(data.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (!data) return; // Already redirected to verification
      
      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#F5F0E8] to-[#F0EBE3] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-2xl border border-[#E8DDD0] rounded-3xl overflow-hidden transform animate-fade-in-up">
          <CardHeader className="text-center pb-6 pt-10">
            <div className="mx-auto mb-6 w-20 h-20 bg-[#8B7D6B] rounded-full flex items-center justify-center shadow-xl animate-bounce-in">
              <Crown className="w-8 h-8 text-[#C9A58B]" />
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-[#6B5D52] tracking-tight mb-2">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-[#A39689] text-sm font-normal mb-8">
              Login to your Goodness Glamour account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-[#6B5D52] font-semibold text-sm uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-[#D4C4B4] focus:border-[#C9A58B] focus:ring-2 focus:ring-[#C9A58B]/20 bg-white text-[#6B5D52] placeholder:text-[#A39689] h-12 px-4 py-3 rounded-lg text-base transition-all duration-300 ease-out"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-[#6B5D52] font-semibold text-sm uppercase tracking-wide">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-[#D4C4B4] focus:border-[#C9A58B] focus:ring-2 focus:ring-[#C9A58B]/20 bg-white text-[#6B5D52] placeholder:text-[#A39689] h-12 px-4 py-3 rounded-lg text-base transition-all duration-300 ease-out"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>

              {/* Google OAuth */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D4C4B4]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#A39689]">Or continue with</span>
                  </div>
                </div>
                
                <GoogleAuth 
                  onSuccess={(user) => {
                    console.log('Google login successful:', user);
                  }}
                  onError={(error) => {
                    setError(error);
                  }}
                  className="w-full"
                />
              </div>

              <div className="text-center text-sm text-[#A39689]">
                Don't have an account?{" "}
                <a href="/signup" className="text-[#C9A58B] hover:text-[#B89479] font-semibold hover:underline transition-all duration-300">
                  Sign up
                </a>
              </div>

              {/* Admin Login Link */}
              <div className="text-center">
                <div className="w-full h-px bg-[#D4C4B4] my-4"></div>
                <p className="text-xs text-[#A39689] mb-2">Administrator Access</p>
                <a 
                  href="/admin-login" 
                  className="text-xs text-[#A39689] hover:text-[#8B7D6B] font-medium hover:underline transition-colors duration-300"
                >
                  Admin Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Virtual AI Salon Text */}
        <div className="text-center mt-8 animate-fade-in-delayed">
          <h2 className="text-xl font-serif font-light text-[#8B7D6B] tracking-widest uppercase">
            Virtual AI Salon
          </h2>
          <div className="w-16 h-0.5 bg-[#C9A58B] mx-auto mt-2 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
