import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { Lock, Shield, ArrowLeft, Phone } from "lucide-react";

export default function AdminLoginPage() {
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
        throw new Error(data.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Check if user is admin
      if (data.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setError("Access denied. Admin privileges required.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="pt-16 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="flex items-center justify-center">
      
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-200/50 relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-serif text-gray-900 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            Admin Access
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium text-lg">
            Secure administrator login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm uppercase tracking-wider">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@goodnessglamour.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white text-gray-900 placeholder:text-gray-500 h-12"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white text-gray-900 placeholder:text-gray-500 h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 text-white font-semibold py-4 rounded-lg shadow-2xl shadow-blue-600/25 transition-all duration-300 transform hover:scale-[1.02] uppercase tracking-wider"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Access Admin Panel"}
            </Button>

            <div className="text-center">
              <div className="w-full h-px bg-gray-300 my-4"></div>
              <a 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Customer Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Blue Gradient Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Admin Access - Salon Management
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Access your admin dashboard to manage services, bookings, and customer interactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="btn-primary"
            >
              <a href="/">
                View Public Site
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
            >
              <a href="tel:9036626642">
                <Phone className="h-4 w-4 mr-2" />
                Call Us: 9036626642
              </a>
            </Button>
          </div>
        </div>
      </section>
          </div>
        </div>
      </section>
    </div>
  );
}
