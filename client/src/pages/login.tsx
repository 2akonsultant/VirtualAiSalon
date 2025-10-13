import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";

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
        setLocation("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 relative overflow-hidden">
      {/* Luxurious background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-32 w-72 h-72 bg-gradient-to-r from-rose-500/10 to-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50 relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-amber-400 via-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25">
            <span className="text-3xl">👑</span>
          </div>
          <CardTitle className="text-4xl font-serif text-white bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-300 font-medium text-lg">
            Login to your Goodness Glamour account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-200 font-medium text-sm uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-600 focus:border-amber-400 focus:ring-amber-400/20 bg-gray-800/50 backdrop-blur-sm text-white placeholder:text-gray-400 h-12"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-200 font-medium text-sm uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-600 focus:border-amber-400 focus:ring-amber-400/20 bg-gray-800/50 backdrop-blur-sm text-white placeholder:text-gray-400 h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-semibold py-4 rounded-lg shadow-2xl shadow-amber-500/25 transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wider"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <a href="/signup" className="text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
