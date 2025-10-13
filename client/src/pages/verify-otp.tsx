import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { Mail, Clock, RefreshCw } from "lucide-react";

export default function VerifyOTPPage() {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const userId = localStorage.getItem("pendingUserId");
  const userEmail = localStorage.getItem("pendingUserEmail");

  // Redirect if no pending verification
  useEffect(() => {
    if (!userId || !userEmail) {
      setLocation("/signup");
    }
  }, [userId, userEmail, setLocation]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const verifyMutation = useMutation({
    mutationFn: async (otpCode: string) => {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otpCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store token and user data
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Clear pending verification data
      localStorage.removeItem("pendingUserId");
      localStorage.removeItem("pendingUserEmail");
      
      setSuccess("Email verified! Redirecting...");
      
      // Redirect to homepage after 2 seconds
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend OTP");
      }

      return response.json();
    },
    onSuccess: () => {
      setSuccess("New verification code sent to your email!");
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setError("");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    verifyMutation.mutate(otp);
  };

  const handleResend = () => {
    resendMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-lavender-50 p-4 relative overflow-hidden">
      {/* Floral background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-200 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-rose-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-lavender-200 rounded-full blur-xl"></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-pink-100/50 relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif text-gray-800 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            We've sent a 6-digit code to <strong className="text-pink-600">{userEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 bg-white/50 backdrop-blur-sm"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {timeLeft > 0 ? (
                  <>Code expires in {formatTime(timeLeft)}</>
                ) : (
                  <span className="text-red-500">Code expired</span>
                )}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg shadow-lg shadow-pink-200/50 transition-all duration-300"
              disabled={verifyMutation.isPending || otp.length !== 6}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={!canResend || resendMutation.isPending}
                className="text-sm text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${resendMutation.isPending ? "animate-spin" : ""}`} />
                {resendMutation.isPending ? "Sending..." : "Resend Code"}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code? Check your spam folder
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

