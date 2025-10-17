import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertBookingSchema, insertAiConversationSchema, insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { processContactMessage, processBooking, sendOTPEmail } from "./email-service";
import { chatWithGemini, resetChatSession, testGeminiConnection } from "./gemini-service";
import { hashPassword, comparePassword, generateToken } from "./auth-service";
import { generateOTP, getOTPExpiry, isOTPExpired, isValidOTPFormat, isTooManyAttempts } from "./otp-service";
import { processDashboardData } from "./utils/dashboard-analytics";
import { requireAuth, requireAdmin } from "./middleware/auth-middleware";
import { 
  readBookingsExcel, 
  readContactMessagesExcel, 
  filterByTimeRange, 
  calculateTotalRevenue, 
  getPopularServices, 
  calculateAverageValue,
  getBookingTrends 
} from "./dashboard-service";
import { googleAuth, logout } from "./google-auth";

// Log API key for debugging (first 10 chars only for security)
const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key";
console.log("🔑 OpenAI API Key loaded:", apiKey.substring(0, 20) + "...");

const openai = new OpenAI({
  apiKey: apiKey
});

// Intelligent fallback response generator when OpenAI API is unavailable
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();
  
  // Greetings - warm and welcoming
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|namaste)/i)) {
    return "Hello! Welcome to Goodness Glamour 💐\n\nI'm your personal salon assistant. We bring premium hair services right to your doorstep!\n\nHow can I help you today? You can ask me about:\n• Our services and prices\n• Booking an appointment\n• Timings and availability\n• Special occasions (bridal, parties)";
  }
  
  // Services inquiry - comprehensive
  if (lowerMessage.includes('service') || lowerMessage.includes('what do you') || lowerMessage.includes('offer') || lowerMessage.includes('available')) {
    return "We offer professional doorstep hair services for women and kids! 💇‍♀️\n\n**Women's Services:**\n• Haircuts & Styling (₹400-1,200)\n• Hair Coloring & Highlights (₹1,200-3,500)\n• Hair Treatments & Spa (₹600-2,000)\n• Bridal & Party Styling (₹800-2,500)\n• Blowdry & Styling (₹250-600)\n• Hair Wash (₹200-450)\n• Expert Consultation (₹150-300)\n\n**Kids Services:**\n• Haircuts (₹150-500)\n• Party Styling (₹200-600)\n• Hair Wash (₹100-300)\n• Creative Braiding (₹150-400)\n\nAll services include professional equipment and products. Which service interests you?";
  }
  
  // Price inquiries - specific and helpful
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('rate') || lowerMessage.includes('charge')) {
    if (lowerMessage.includes('haircut') || lowerMessage.includes('cut')) {
      return "**Haircut Pricing:**\n\n• Women's Haircut & Styling: ₹400-1,200 (60 min)\n• Kids Haircut: ₹150-500 (30 min)\n\nPrices vary based on hair length and style complexity. All services include professional styling and products.\n\nWould you like to book an appointment?";
    }
    if (lowerMessage.includes('color') || lowerMessage.includes('highlight') || lowerMessage.includes('dye')) {
      return "**Hair Coloring Services:**\n\nHair Coloring & Highlights: ₹1,200-3,500 (2 hours)\n\nIncludes:\n• Professional color consultation\n• Premium color products\n• Highlights, balayage, or ombre\n• Complete styling\n\nAll done at your doorstep! Ready to transform your look?";
    }
    if (lowerMessage.includes('bridal') || lowerMessage.includes('wedding') || lowerMessage.includes('party')) {
      return "**Bridal & Party Styling:**\n\nPrice: ₹800-2,500 (90 min)\n\nPerfect for:\n• Weddings & receptions\n• Engagement ceremonies\n• Birthday parties\n• Special occasions\n\nWe offer trial sessions before your big day! Our stylists create elegant updos, braids, and customized looks.\n\nShall I help you book?";
    }
    if (lowerMessage.includes('kid') || lowerMessage.includes('child') || lowerMessage.includes('children')) {
      return "**Kids Services Pricing:**\n\n• Haircuts & Styling: ₹150-500 (30 min)\n• Party Styling: ₹200-600 (45 min)\n• Hair Wash: ₹100-300 (20 min)\n• Creative Braiding: ₹150-400 (30 min)\n\nOur child-friendly stylists make haircuts fun and comfortable! All services at your home.\n\nInterested in booking?";
    }
    return "**Our Price Range:**\n\n• Women's Services: ₹150 - ₹3,500\n• Kids Services: ₹100 - ₹600\n\nPrices vary by service type and complexity. All services include professional products and equipment brought to your doorstep.\n\nWhich service would you like to know more about?";
  }
  
  // Timing inquiries - clear and helpful
  if (lowerMessage.includes('timing') || lowerMessage.includes('time') || lowerMessage.includes('hour') || lowerMessage.includes('when') || lowerMessage.includes('open') || lowerMessage.includes('available')) {
    return "**Service Hours:**\n\n📅 Monday - Sunday\n⏰ 9:00 AM - 8:00 PM\n\nWe offer flexible scheduling at your convenience! Our stylists come to your home at your preferred time.\n\nWhen would you like to schedule your appointment?";
  }
  
  // Location/Area - emphasize doorstep service
  if (lowerMessage.includes('area') || lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('come')) {
    return "**We Come to You! 🏠**\n\nGoodness Glamour provides citywide doorstep service. We bring the salon experience to your home!\n\nBenefits:\n• No travel needed\n• Comfortable home environment\n• Professional equipment brought to you\n• Safe and hygienic service\n\nJust provide your address when booking. What area are you in?";
  }
  
  // Booking inquiries - clear process
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('reserve')) {
    return "**Easy Booking Process:**\n\n1. Choose your service(s)\n2. Select date & time (9 AM - 8 PM)\n3. Provide your details (name, phone, address)\n4. Get instant confirmation!\n\n**Book Now:**\n• Website: Use our booking page\n• Call: 9036626642\n• Chat: I can help you here!\n\nWhat service would you like to book?";
  }
  
  // Contact information - multiple options
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call') || lowerMessage.includes('number') || lowerMessage.includes('reach')) {
    return "**Contact Goodness Glamour:**\n\n📞 Phone: 9036626642\n⏰ Available: Mon-Sun, 9 AM - 8 PM\n💬 Chat: Right here, anytime!\n\nCall us for:\n• Immediate booking\n• Urgent queries\n• Special requests\n• Custom packages\n\nHow can I assist you today?";
  }
  
  // Women's services - detailed
  if (lowerMessage.includes('women') || lowerMessage.includes('ladies') || lowerMessage.includes('female')) {
    return "**Women's Hair Services:**\n\n1. **Hair Cut & Styling** - ₹400-1,200 (60 min)\n   Professional cuts for all hair types\n\n2. **Hair Coloring** - ₹1,200-3,500 (120 min)\n   Colors, highlights, balayage, ombre\n\n3. **Hair Treatment** - ₹600-2,000 (90 min)\n   Deep conditioning, keratin, hair spa\n\n4. **Bridal Styling** - ₹800-2,500 (90 min)\n   Elegant updos for special occasions\n\n5. **Blowdry** - ₹250-600 (45 min)\n   Smooth, voluminous styling\n\n6. **Hair Wash** - ₹200-450 (30 min)\n   Professional wash & basic styling\n\n7. **Consultation** - ₹150-300 (30 min)\n   Expert hair analysis & advice\n\nWhich service interests you?";
  }
  
  // Kids services - friendly
  if (lowerMessage.includes('kid') || lowerMessage.includes('child') || lowerMessage.includes('baby') || lowerMessage.includes('children')) {
    return "**Kids Hair Services:**\n\n1. **Haircuts & Styling** - ₹150-500 (30 min)\n   Fun, comfortable cuts by patient stylists\n\n2. **Party Styling** - ₹200-600 (45 min)\n   Special styles with braids, curls & accessories\n\n3. **Hair Wash** - ₹100-300 (20 min)\n   Gentle wash for delicate hair\n\n4. **Creative Braiding** - ₹150-400 (30 min)\n   Fun braids & ponytails for school or play\n\n✨ All services are child-friendly and done at your home!\n\nWhich service would your child enjoy?";
  }
  
  // Treatment services - detailed
  if (lowerMessage.includes('treatment') || lowerMessage.includes('spa') || lowerMessage.includes('keratin') || lowerMessage.includes('condition') || lowerMessage.includes('therapy')) {
    return "**Hair Treatment & Spa:**\n\nPrice: ₹600-2,000 (90 min)\n\n**Treatments Include:**\n• Deep conditioning therapy\n• Keratin treatment\n• Hair spa with massage\n• Nourishing hair masks\n• Protein treatment\n• Damage repair\n\n**Benefits:**\n• Restores shine & softness\n• Repairs damaged hair\n• Reduces frizz\n• Strengthens hair\n\nAll done with professional salon products at your home! Interested?";
  }
  
  // Thank you responses
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're very welcome! 😊\n\nI'm here anytime you need help with:\n• Booking appointments\n• Service information\n• Pricing details\n• Special requests\n\nFeel free to call us at 9036626642 or continue chatting here. Have a beautiful day! 💐";
  }
  
  // Default response - helpful and inviting
  return "I'm here to help you with Goodness Glamour's doorstep salon services! 💇‍♀️\n\n**Quick Info:**\n• 11 professional hair services\n• Women & kids services\n• Prices: ₹100 - ₹3,500\n• Available 7 days, 9 AM - 8 PM\n• Citywide doorstep service\n\n**I can help you with:**\n• Service details & pricing\n• Booking appointments\n• Special occasion styling\n• General inquiries\n\nWhat would you like to know?";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple in-memory SSE clients registry
  const sseClients: Set<any> = new Set();

  function sendSseEvent(event: { type: string; payload?: any }) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const res of sseClients) {
      try {
        res.write(data);
      } catch (_) {
        // Ignore broken pipes
      }
    }
  }

  // Server-Sent Events endpoint for realtime dashboard updates
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // Initial ping to keep connection alive
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    sseClients.add(res);
    req.on("close", () => {
      sseClients.delete(res);
    });
  });
  
  // ============================================
  // AUTHENTICATION ROUTES WITH OTP
  // ============================================

  /**
   * POST /api/auth/signup
   * Register new user and send OTP
   */
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;

      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({ 
          message: "Email, password, and name are required" 
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: "Invalid email format" 
        });
      }

      // Password strength validation
      if (password.length < 6) {
        return res.status(400).json({ 
          message: "Password must be at least 6 characters long" 
        });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // If user exists but not verified, allow resending OTP
        if (!existingUser.isVerified) {
          // Generate new OTP
          const otp = generateOTP();
          const otpExpiry = getOTPExpiry();
          
          // Update OTP
          await storage.updateUserOTP(existingUser.id, otp, otpExpiry);
          
          // Send OTP email
          await sendOTPEmail(email, name, otp);
          
          return res.status(200).json({
            message: "Account already exists but not verified. New OTP sent to your email.",
            userId: existingUser.id,
            email: existingUser.email,
            requiresVerification: true,
          });
        }
        
        return res.status(400).json({ 
          message: "Email already registered. Please login instead." 
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();

      // Create user (unverified)
      const newUser = await storage.createUserWithOTP({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: "customer",
        otp,
        otpExpiry,
      });

      // Send OTP email
      const emailSent = await sendOTPEmail(email, name, otp);

      if (!emailSent) {
        return res.status(500).json({
          message: "Account created but failed to send verification email. Please contact support.",
        });
      }

      console.log(`✅ User created: ${email}, OTP: ${otp}`);

      res.status(201).json({
        message: "Account created! Please check your email for verification code.",
        userId: newUser.id,
        email: newUser.email,
        requiresVerification: true,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ 
        message: "Failed to create account. Please try again." 
      });
    }
  });

  /**
   * POST /api/auth/verify-otp
   * Verify OTP and auto-login user
   */
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { userId, otp } = req.body;

      // Validation
      if (!userId || !otp) {
        return res.status(400).json({ 
          message: "User ID and OTP are required" 
        });
      }

      // Validate OTP format
      if (!isValidOTPFormat(otp)) {
        return res.status(400).json({ 
          message: "Invalid OTP format. Please enter 6 digits." 
        });
      }

      // Get user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).json({ 
          message: "Email already verified. Please login." 
        });
      }

      // Check too many attempts
      if (isTooManyAttempts(user.otpAttempts || 0)) {
        return res.status(429).json({ 
          message: "Too many failed attempts. Please request a new OTP." 
        });
      }

      // Check OTP expiry
      if (isOTPExpired(user.otpExpiry)) {
        return res.status(400).json({ 
          message: "OTP has expired. Please request a new one." 
        });
      }

      // Verify OTP
      if (user.otp !== otp) {
        // Increment failed attempts
        await storage.incrementOTPAttempts(userId);
        
        return res.status(400).json({ 
          message: "Invalid OTP. Please try again.",
          attemptsLeft: 5 - (user.otpAttempts || 0) - 1,
        });
      }

      // OTP is correct - verify user
      const verifiedUser = await storage.verifyUserOTP(userId);

      if (!verifiedUser) {
        return res.status(500).json({ message: "Failed to verify user" });
      }

      // Generate JWT token for auto-login
      const token = generateToken(verifiedUser.id, verifiedUser.email, verifiedUser.role || "customer");

      console.log(`✅ User verified and logged in: ${verifiedUser.email}`);

      res.json({
        message: "Email verified successfully! You're now logged in.",
        token,
        user: {
          id: verifiedUser.id,
          email: verifiedUser.email,
          name: verifiedUser.name,
          phone: verifiedUser.phone,
          role: verifiedUser.role,
          isVerified: true,
        },
      });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      res.status(500).json({ 
        message: "Verification failed. Please try again." 
      });
    }
  });

  /**
   * POST /api/auth/resend-otp
   * Resend OTP to user's email
   */
  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).json({ 
          message: "Email already verified. Please login." 
        });
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();

      // Update OTP in database
      await storage.updateUserOTP(userId, otp, otpExpiry);

      // Send OTP email
      const emailSent = await sendOTPEmail(user.email, user.name, otp);

      if (!emailSent) {
        return res.status(500).json({
          message: "Failed to send OTP email. Please try again.",
        });
      }

      console.log(`✅ OTP resent to: ${user.email}, New OTP: ${otp}`);

      res.json({
        message: "New verification code sent to your email!",
      });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ 
        message: "Failed to resend OTP. Please try again." 
      });
    }
  });

  /**
   * POST /api/auth/login
   * Login existing user (must be verified)
   */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: "Please verify your email before logging in.",
          userId: user.id,
          requiresVerification: true,
        });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.role || "customer");

      res.json({
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Login failed. Please try again." 
      });
    }
  });

  /**
   * GET /api/auth/me
   * Get current user (protected)
   */
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Expose selected runtime config to the client (used when serving UI from port 5000)
  app.get("/config.js", (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
    const payload = `window.__GOOGLE_CLIENT_ID__ = '${googleClientId.replace(/'/g, "\\'")}';`;
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.send(payload);
  });

  /**
   * POST /api/auth/google
   * Google OAuth authentication
   */
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: 'Google token is required' 
        });
      }

      // Import Google OAuth verification
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      
      if (!payload.email_verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Google email not verified' 
        });
      }

      // Check if user exists in database
      let user = await storage.getUserByEmail(payload.email);

      if (!user) {
        // Create new user with Google credentials
        const newUser = {
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          profilePicture: payload.picture,
          isVerified: true,
          provider: 'google',
          createdAt: new Date().toISOString()
        };

        user = await storage.createUser(newUser);
        console.log('New user created via Google OAuth:', user.email);
      } else {
        // Update existing user with Google ID if not already set
        if (!user.googleId) {
          await storage.updateUser(user.id, {
            googleId: payload.sub,
            profilePicture: payload.picture,
            provider: 'google'
          });
        }
      }

      // Generate JWT token
      const jwtToken = generateToken(user);

      // Return success response
      res.json({
        success: true,
        message: 'Google authentication successful',
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        }
      });

    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Google authentication failed',
        error: error.message 
      });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout endpoint
   */
  app.post("/api/auth/logout", async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
  });

  // ============================================
  // USER-SPECIFIC ROUTES
  // ============================================

  /**
   * GET /api/user/bookings
   * Get current user's bookings (protected)
   */
  app.get("/api/user/bookings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.userId;
      
      // Fetch user's bookings from database
      const bookings = await storage.getBookingsByUser(userId);
      
      // Transform bookings to include service names and user-friendly format
      const transformedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const serviceNames: string[] = [];
          const serviceIds = booking.serviceIds as string[];
          
          for (const serviceId of serviceIds) {
            const service = await storage.getService(serviceId);
            if (service) {
              serviceNames.push(service.name);
            }
          }
          
          return {
            id: booking.id,
            services: serviceNames.join(", "),
            appointmentDate: booking.appointmentDate.toISOString(),
            status: booking.status,
            totalAmount: booking.totalAmount,
            notes: booking.notes,
            location: "Your Home"
          };
        })
      );

      res.json(transformedBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  /**
   * POST /api/user/bookings
   * Create booking for authenticated user (protected)
   */
  app.post("/api/user/bookings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.userId;
      const { serviceIds, appointmentDate, notes } = req.body;
      
      // Validate required fields
      if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
        return res.status(400).json({ message: "At least one service must be selected" });
      }
      
      if (!appointmentDate) {
        return res.status(400).json({ message: "Appointment date is required" });
      }
      
      // Calculate total amount and validate services
      let totalAmount = 0;
      const serviceNames: string[] = [];
      
      for (const serviceId of serviceIds) {
        const service = await storage.getService(serviceId);
        if (!service) {
          return res.status(400).json({ message: `Service with ID ${serviceId} not found` });
        }
        if (!service.isActive) {
          return res.status(400).json({ message: `Service ${service.name} is not available` });
        }
        totalAmount += service.priceMin; // Use minimum price for calculation
        serviceNames.push(service.name);
      }
      
      // Create booking linked to user
      const booking = await storage.createBooking({
        userId,
        serviceIds,
        appointmentDate: new Date(appointmentDate),
        totalAmount,
        notes: notes || null,
      });
      
      console.log(`📅 User booking created - User: ${userId}, Services: ${serviceNames.join(", ")}, Amount: ₹${totalAmount}`);

      // Best-effort: update Excel + send emails for admin/customer
      try {
        const user = await storage.getUser(userId);
        await processBooking({
          id: booking.id,
          customerName: user?.name || "Customer",
          customerEmail: user?.email || "",
          customerPhone: user?.phone || "",
          customerAddress: "",
          appointmentDate: new Date(appointmentDate).toISOString(),
          appointmentTime: new Date(appointmentDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
          services: serviceNames,
          totalAmount: totalAmount,
          notes: notes || "",
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error("❌ Error processing booking post-create:", e);
      }

      // Notify dashboards in real-time
      sendSseEvent({ type: "booking_created", payload: { id: booking.id } });
      
      res.status(201).json({
        id: booking.id,
        services: serviceNames.join(", "),
        appointmentDate: booking.appointmentDate.toISOString(),
        status: booking.status,
        totalAmount: booking.totalAmount,
        notes: booking.notes,
        location: "Your Home"
      });
    } catch (error) {
      console.error("Error creating user booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  /**
   * GET /api/admin/dashboard/analytics
   * Get comprehensive dashboard analytics (admin only)
   */
  app.get("/api/admin/dashboard/analytics", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { timeRange = "all" } = req.query;
      
      console.log(`📊 Fetching dashboard analytics for timeRange: ${timeRange}`);
      
      const analytics = await processDashboardData(timeRange as string);
      
      console.log(`✅ Dashboard analytics generated successfully`);
      
      // Add cache-busting headers
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  // ============================================
  // ADMIN-SPECIFIC ROUTES
  // ============================================

  /**
   * GET /api/admin/services
   * Get all services (admin only)
   */
  app.get("/api/admin/services", requireAuth, requireAdmin, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  /**
   * POST /api/admin/services
   * Create new service (admin only)
   */
  app.post("/api/admin/services", requireAuth, requireAdmin, async (req, res) => {
    try {
      const serviceData = req.body;
      
      // Validate required fields
      if (!serviceData.name || !serviceData.description || !serviceData.category) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newService = await storage.createService(serviceData);
      res.status(201).json(newService);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  /**
   * PUT /api/admin/services/:id
   * Update service (admin only)
   */
  app.put("/api/admin/services/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if service exists
      const existingService = await storage.getService(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Update service - you'll need to implement updateService in storage
      const updatedService = { ...existingService, ...updateData };
      
      // For now, return the updated service
      // In real implementation, you'd call storage.updateService(id, updateData)
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  /**
   * DELETE /api/admin/services/:id
   * Delete service (admin only)
   */
  app.delete("/api/admin/services/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if service exists
      const existingService = await storage.getService(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }

      // For now, return success
      // In real implementation, you'd call storage.deleteService(id)
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // ============================================
  // EXISTING ROUTES
  // ============================================
  
  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get services by category
  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const services = await storage.getServicesByCategory(category);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services by category" });
    }
  });

  // Get single service
  app.get("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Create customer
  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists by phone
      const existingCustomer = await storage.getCustomerByPhone(customerData.phone);
      if (existingCustomer) {
        return res.json(existingCustomer);
      }
      
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Validate customer exists
      const customer = await storage.getCustomer(bookingData.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Calculate total amount and get service names
      let totalAmount = 0;
      const serviceNames: string[] = [];
      const serviceIds = bookingData.serviceIds as string[];
      for (const serviceId of serviceIds) {
        const service = await storage.getService(serviceId);
        if (service) {
          totalAmount += service.priceMin; // Use minimum price for calculation
          serviceNames.push(service.name);
        }
      }
      
      const booking = await storage.createBooking({
        ...bookingData,
        totalAmount
      });
      
      // Process booking (send email and update Excel) in background
      console.log(`📧 Booking details - Name: ${customer.name}, Email: "${customer.email || ''}"`);
      processBooking({
        id: booking.id,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.phone,
        customerAddress: customer.address,
        appointmentDate: booking.appointmentDate.toISOString(),
        appointmentTime: new Date(booking.appointmentDate).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        services: serviceNames,
        totalAmount: totalAmount,
        notes: booking.notes || '',
        timestamp: booking.createdAt?.toISOString() || new Date().toISOString()
      }).then(({ emailSent, excelUpdated, customerEmailSent }) => {
        console.log(`✅ Booking processed: Admin Email=${emailSent}, Customer Email=${customerEmailSent}, Excel=${excelUpdated}`);
      }).catch(err => {
        console.error('❌ Error processing booking:', err);
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get customer bookings
  app.get("/api/bookings/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const bookings = await storage.getBookingsByCustomer(customerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, sessionId, conversationId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and sessionId are required" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
      } else {
        conversation = await storage.getConversationBySession(sessionId);
      }

      let messages = conversation ? conversation.messages as any[] : [];
      
      // Add user message
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
      messages.push(userMessage);

      // Prepare OpenAI messages
      const systemPrompt = `You are a friendly and professional salon assistant for Goodness Glamour - a premium doorstep salon service. You help customers discover services, answer questions, and guide them through booking.

BRAND VOICE: Warm, professional, helpful, and conversational. Like a knowledgeable friend who works at a high-end salon.

CONTACT & HOURS:
• Phone: 9036626642
• Hours: Mon-Sun, 9 AM - 8 PM
• Service: Citywide doorstep (we come to customer's home)

WOMEN'S SERVICES (7 services):
1. Hair Cut & Styling: ₹400-1,200 (60 min) - All hair types, professional cuts & styling
2. Hair Coloring & Highlights: ₹1,200-3,500 (120 min) - Colors, highlights, balayage, ombre
3. Hair Treatment & Spa: ₹600-2,000 (90 min) - Deep conditioning, keratin, hair masks
4. Bridal & Party Styling: ₹800-2,500 (90 min) - Elegant updos, braids, special occasions
5. Professional Blowdry: ₹250-600 (45 min) - Smooth, voluminous styling
6. Hair Wash & Styling: ₹200-450 (30 min) - Professional wash & basic styling
7. Hair Consultation: ₹150-300 (30 min) - Expert analysis & personalized advice

KIDS SERVICES (4 services):
1. Kids Haircuts: ₹150-500 (30 min) - Fun, comfortable cuts by patient stylists
2. Party Styling: ₹200-600 (45 min) - Special styles with braids, curls & accessories
3. Hair Wash: ₹100-300 (20 min) - Gentle wash for delicate hair
4. Creative Braiding: ₹150-400 (30 min) - Fun braids & ponytails for school/play

KEY SELLING POINTS:
• Doorstep convenience - no travel needed
• Professional equipment & products brought to you
• Experienced, trained stylists
• Safe, hygienic practices
• Flexible scheduling
• Trial sessions available for bridal services

CONVERSATION GUIDELINES:
1. Be conversational and natural - like chatting with a helpful salon receptionist
2. Keep responses concise (2-4 sentences) unless detailed info is requested
3. When asked about services, mention 2-3 relevant options with prices
4. For booking inquiries, ask: name, phone, address, preferred date/time
5. Emphasize convenience and quality
6. Use light emojis (💇‍♀️ 💐 ✨) sparingly for warmth
7. If customer seems ready to book, guide them to booking page or phone number
8. For complex questions or urgent needs, suggest calling 9036626642
9. Be enthusiastic about special occasions (weddings, parties)
10. Highlight that all equipment and products are provided

RESPONSE STYLE EXAMPLES:
❌ "Our Hair Cut & Styling service costs ₹400-1,200 and takes 60 minutes. It includes professional haircuts, blowdry, and styling at your doorstep for all hair types."
✅ "Our haircuts range from ₹400-1,200 depending on length and style. Takes about an hour, and we bring everything to you! What kind of style are you thinking?"

❌ "We provide citywide doorstep service across the entire city area."
✅ "We come to you anywhere in the city! Just let us know your area and we'll be there."

❌ "For urgent queries, please call 9036626642."
✅ "Need to book urgently? Give us a call at 9036626642 - we're here till 8 PM!"

Remember: You're helping someone feel pampered and excited about their salon experience - be warm, professional, and genuinely helpful!`;


      const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })) // Last 10 messages for context
      ];

      // Get AI response using Gemini
      let aiResponse: string;
      
      try {
        console.log(`🤖 Using Gemini AI for chat response...`);
        aiResponse = await chatWithGemini(message, sessionId);
        console.log(`✅ Gemini response received: ${aiResponse.substring(0, 100)}...`);
      } catch (geminiError: any) {
        console.error("❌ Gemini AI Error:", geminiError.message);
        
        // Fallback to rule-based responses if Gemini fails
        aiResponse = generateFallbackResponse(message);
      }
      
      // Add AI response
      const aiMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      messages.push(aiMessage);

      // Save conversation
      if (conversation) {
        await storage.updateConversation(conversation.id, messages);
      } else {
        conversation = await storage.createConversation({
          sessionId,
          messages,
          customerId: null,
          bookingId: null
        });
      }

      res.json({
        response: aiResponse,
        conversationId: conversation.id,
        sessionId
      });
      
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        message: "Failed to process AI chat request",
        response: "I apologize, but I'm having trouble responding right now. Please call us at 9036626642 for immediate assistance."
      });
    }
  });

  // Generate QR Code data
  app.get("/api/qr/generate", async (req, res) => {
    try {
      const { serviceId, source } = req.query;
      
      const qrData = {
        url: `${process.env.REPLIT_DOMAINS || 'localhost:5000'}/ai-chat`,
        serviceId: serviceId || null,
        source: source || 'website',
        timestamp: new Date().toISOString()
      };
      
      res.json(qrData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR data" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      
      // Save contact message
      const contactMessage = await storage.createContactMessage(contactData);
      
      // Process contact message (send email and update Excel) in background
      processContactMessage({
        name: contactData.name,
        phone: contactData.phone,
        serviceInterest: contactData.serviceInterest,
        address: contactData.address,
        message: contactData.message,
        timestamp: new Date().toISOString()
      }).then(({ emailSent, excelUpdated }) => {
        console.log(`✅ Contact message processed: Email=${emailSent}, Excel=${excelUpdated}`);
        // Notify dashboards in real-time
        sendSseEvent({ type: "message_created", payload: { id: contactMessage.id } });
      }).catch(err => {
        console.error('❌ Error processing contact message:', err);
      });
      
      res.status(201).json({ 
        success: true,
        message: "Thank you! We'll contact you soon.",
        messageId: contactMessage.id 
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid form data", 
          errors: error.errors 
        });
      }
      console.error("❌ Contact form error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to submit form. Please try again." 
      });
    }
  });

  // Get all contact messages
  app.get("/api/contact/messages", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Get single contact message
  app.get("/api/contact/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const message = await storage.getContactMessage(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  // Dashboard API endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const timeRange = (req.query.timeRange as string) || "all";
      
      const bookingsData = readBookingsExcel();
      const messagesData = readContactMessagesExcel();
      
      const filteredBookings = filterByTimeRange(bookingsData, timeRange);
      const filteredMessages = filterByTimeRange(messagesData, timeRange);
      
      const stats = {
        totalBookings: filteredBookings.length,
        totalMessages: filteredMessages.length,
        totalRevenue: calculateTotalRevenue(filteredBookings),
        popularServices: getPopularServices(filteredBookings),
        averageBookingValue: calculateAverageValue(filteredBookings),
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/bookings", async (req, res) => {
    try {
      const timeRange = (req.query.timeRange as string) || "all";
      const bookingsData = readBookingsExcel();
      const filtered = filterByTimeRange(bookingsData, timeRange);
      const trends = getBookingTrends(filtered);
      
      res.json({ bookings: filtered, trends });
    } catch (error) {
      console.error("Dashboard bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings data" });
    }
  });

app.get("/api/dashboard/messages", async (req, res) => {
  try {
    const timeRange = (req.query.timeRange as string) || "all";
    const messagesData = readContactMessagesExcel();
    const filtered = filterByTimeRange(messagesData, timeRange);
    
    // Sort by submission date (most recent first) - SIMPLIFIED APPROACH
    console.log('🔄 Starting sort process...');
    console.log('📋 All messages before sorting:', filtered.map(m => ({ name: m.Name, date: m['Submission Date'] })));
    
    const sorted = filtered.sort((a: any, b: any) => {
      const dateStrA = a['Submission Date'] || '';
      const dateStrB = b['Submission Date'] || '';
      
      // For newest first: if dateStrA is later than dateStrB, return negative (A comes first)
      // String comparison works for "MM/DD/YYYY, HH:MM AM/PM" format
      if (dateStrA > dateStrB) {
        console.log(`✅ "${dateStrA}" is newer than "${dateStrB}" - A comes first`);
        return -1; // A comes first (newest)
      } else if (dateStrA < dateStrB) {
        console.log(`✅ "${dateStrB}" is newer than "${dateStrA}" - B comes first`);
        return 1; // B comes first (newest)
      } else {
        console.log(`✅ Same date: "${dateStrA}"`);
        return 0; // Same date
      }
    });
    
    console.log('📋 All messages after sorting:', sorted.map(m => ({ name: m.Name, date: m['Submission Date'] })));
    
    // Reverse to get newest first (if sorting went wrong)
    const finalSorted = sorted.reverse();
    console.log('📋 All messages after reversing:', finalSorted.map(m => ({ name: m.Name, date: m['Submission Date'] })));
    
    console.log('🚀 Sending messages to frontend:', finalSorted.length);
    console.log('📋 First message sample:', finalSorted[0]);
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(finalSorted);
  } catch (error) {
    console.error("Dashboard messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages data" });
  }
});

  // Test Gemini AI connection on startup
  console.log("\n🤖 Testing Gemini AI connection...");
  testGeminiConnection().then(success => {
    if (success) {
      console.log("✅ Gemini AI is ready to chat!\n");
    } else {
      console.log("⚠️ Gemini AI connection failed - using fallback responses\n");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
