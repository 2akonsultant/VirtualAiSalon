import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Password check (you can change this password)
    const ADMIN_PASSWORD = "admin123"; // Change this to your desired password
    
    if (password === ADMIN_PASSWORD) {
      // Clear any old session first
      sessionStorage.clear();
      // Set new session
      sessionStorage.setItem("isAdminAuthenticated", "true");
      toast({
        title: "Login Successful",
        description: "Welcome to the dashboard!",
      });
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <Card className="w-full max-w-md mx-4 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-serif">Dashboard Access</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Enter admin password to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/")}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

