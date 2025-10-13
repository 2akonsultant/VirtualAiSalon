# 🔐 Complete Guide: Signup with Email OTP Verification & Auto Login

## 📋 OVERVIEW

This guide implements a secure signup flow with email OTP verification:

```
User Signup → OTP Sent to Email → User Verifies OTP → Auto Login → Homepage
```

---

## 🎯 COMPLETE FLOW

```
Step 1: Signup Form
├─ User enters: Name, Email, Phone, Password
└─ Clicks "Sign Up"

Step 2: Account Creation
├─ Create user account (unverified)
├─ Generate 6-digit OTP
├─ Store OTP with expiry (10 minutes)
└─ Send OTP email

Step 3: OTP Verification Page
├─ User enters 6-digit OTP
├─ Clicks "Verify"
└─ Backend validates OTP

Step 4: Verification Success
├─ Mark account as verified
├─ Generate JWT token
├─ Auto login user
└─ Redirect to homepage

Step 5: User Experience
├─ Sees "Hi, [Name]" in navigation
├─ Can book appointments
└─ Full access to all features
```

---

## 📦 STEP 1: INSTALL DEPENDENCIES

```bash
npm install jsonwebtoken bcryptjs cookie-parser nodemailer
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/cookie-parser @types/nodemailer
```

**Already installed:** `nodemailer` (you're using it for booking emails)

---

## 🗄️ STEP 2: UPDATE DATABASE SCHEMA

### Update `shared/schema.ts`

```typescript
// shared/schema.ts
import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Add users table with OTP fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").default("customer"), // "customer" or "admin"
  
  // OTP Verification fields
  isVerified: boolean("is_verified").default(false),
  otp: text("otp"), // 6-digit OTP
  otpExpiry: timestamp("otp_expiry"), // When OTP expires
  otpAttempts: integer("otp_attempts").default(0), // Track failed attempts
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  otp: true,
  otpExpiry: true,
  otpAttempts: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
```

**Important:** This adds OTP fields WITHOUT touching existing tables!

---

## 🔧 STEP 3: CREATE OTP SERVICE

### Create `server/otp-service.ts`

```typescript
// server/otp-service.ts
import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Get OTP expiry time (10 minutes from now)
 */
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes
  return expiry;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(otpExpiry: Date | null): boolean {
  if (!otpExpiry) return true;
  return new Date() > otpExpiry;
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if too many OTP attempts (prevent brute force)
 */
export function isTooManyAttempts(attempts: number): boolean {
  return attempts >= 5; // Max 5 attempts
}
```

---

## 📧 STEP 4: CREATE OTP EMAIL SERVICE

### Update `server/email-service.ts` (add OTP email function)

```typescript
// server/email-service.ts
// Add this function to your existing email-service.ts

import nodemailer from 'nodemailer';

// ... existing email functions ...

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    console.log(`📧 Sending OTP to: ${email}`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '2akonsultant@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || '2akonsultant@gmail.com',
      to: email,
      subject: '🔐 Verify Your Email - Goodness Glamour Salon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef5f1 0%, #fef9f5 50%, #f5f3f9 100%); font-family: 'Georgia', 'Times New Roman', serif;">
          
          <!-- Main Container -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef5f1 0%, #fef9f5 50%, #f5f3f9 100%); padding: 40px 20px;">
            <tr>
              <td align="center">
                
                <!-- Email Content -->
                <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ffeef5 0%, #fff0f3 50%, #f9f0ff 100%); padding: 50px 40px 40px 40px; text-align: center; position: relative;">
                      <div style="position: absolute; top: 15px; right: 15px; opacity: 0.15; font-size: 40px;">🌸</div>
                      <div style="position: absolute; bottom: 15px; left: 15px; opacity: 0.15; font-size: 40px;">🌿</div>
                      
                      <h1 style="margin: 0; color: #d4a5a5; font-size: 36px; font-weight: 300; letter-spacing: 3px; font-family: 'Georgia', serif;">
                        Goodness Glamour
                      </h1>
                      <p style="margin: 8px 0 0 0; color: #b8a0a0; font-size: 15px; font-weight: 400; letter-spacing: 2px; font-family: 'Georgia', serif;">
                        Ladies & Kids Salon
                      </p>
                      <div style="margin-top: 25px; padding: 10px 30px; background-color: rgba(255,255,255,0.7); border-radius: 20px; display: inline-block; border: 1px solid rgba(212,165,165,0.2);">
                        <p style="margin: 0; color: #c9a0a0; font-size: 13px; font-weight: 500; letter-spacing: 1px;">
                          🔐 Email Verification
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <!-- Welcome Message -->
                      <div style="background: linear-gradient(135deg, #fff5f0 0%, #fff8f5 100%); padding: 25px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #ffe8e0; box-shadow: 0 4px 16px rgba(255,200,180,0.1); text-align: center;">
                        <h2 style="margin: 0 0 10px 0; color: #c88080; font-size: 24px; font-weight: 400; font-family: 'Georgia', serif;">Welcome, ${name}! 💐</h2>
                        <p style="margin: 0; color: #d4a5a5; font-size: 16px; font-weight: 400; line-height: 1.6;">
                          Thank you for signing up! Please verify your email address to complete your registration.
                        </p>
                      </div>
                      
                      <!-- OTP Box -->
                      <div style="background: linear-gradient(135deg, #f8f5ff 0%, #faf7ff 100%); padding: 40px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #f0e8ff; box-shadow: 0 4px 16px rgba(200,180,220,0.08); text-align: center;">
                        <p style="margin: 0 0 20px 0; color: #a88cb8; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                          Your Verification Code
                        </p>
                        
                        <!-- OTP Display -->
                        <div style="background-color: #ffffff; padding: 25px; border-radius: 14px; border: 2px solid #d4b5d4; box-shadow: 0 4px 16px rgba(0,0,0,0.05); margin-bottom: 20px;">
                          <p style="margin: 0; font-size: 48px; font-weight: 700; color: #8080c0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${otp}
                          </p>
                        </div>
                        
                        <p style="margin: 0; color: #b8a0b8; font-size: 14px; line-height: 1.6;">
                          This code will expire in <strong style="color: #8080c0;">10 minutes</strong>
                        </p>
                      </div>
                      
                      <!-- Instructions -->
                      <div style="background: linear-gradient(135deg, #fff0f5 0%, #fff5f0 100%); padding: 25px 30px; border-radius: 18px; margin-bottom: 30px; border: 1px solid #ffe0e8; box-shadow: 0 4px 16px rgba(255,180,200,0.08);">
                        <h3 style="margin: 0 0 15px 0; color: #c880a0; font-size: 16px; font-weight: 500; letter-spacing: 1px; font-family: 'Georgia', serif;">
                          📝 How to Verify
                        </h3>
                        <ol style="margin: 0; padding-left: 20px; color: #b880a0; font-size: 14px; line-height: 1.8;">
                          <li>Enter the 6-digit code on the verification page</li>
                          <li>Click "Verify Email" button</li>
                          <li>You'll be automatically logged in</li>
                          <li>Start booking your favorite salon services!</li>
                        </ol>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="background: linear-gradient(135deg, #f0f8ff 0%, #f5faff 100%); padding: 20px 25px; border-radius: 18px; border: 1px solid #e0e8ff; box-shadow: 0 4px 16px rgba(180,200,255,0.08);">
                        <p style="margin: 0; color: #8080c0; font-size: 13px; line-height: 1.6; text-align: center;">
                          🔒 <strong>Security Tip:</strong> Never share this code with anyone. We'll never ask for it via phone or email.
                        </p>
                      </div>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f8f5f0 0%, #faf7f5 100%); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(212,165,165,0.1);">
                      <p style="margin: 0; color: #d4a5a5; font-size: 14px; font-weight: 400; line-height: 1.6; font-family: 'Georgia', serif;">
                        If you didn't sign up for <strong style="color: #c88080;">Goodness Glamour Salon</strong>,<br>
                        please ignore this email.
                      </p>
                      <p style="margin: 20px 0 0 0; color: #c0c0c0; font-size: 11px; letter-spacing: 0.5px;">
                        Need help? Contact us: 9036626642 | 2akonsultant@gmail.com
                      </p>
                      <p style="margin: 15px 0 0 0; opacity: 0.2; font-size: 20px;">🌸 🌿 🌸</p>
                    </td>
                  </tr>
                  
                </table>
                
              </td>
            </tr>
          </table>
          
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
}
```

---

## 🗃️ STEP 5: UPDATE STORAGE SERVICE

### Update `server/storage.ts`

```typescript
// server/storage.ts
// Add these methods to your storage service

import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Create user with OTP
 */
async createUserWithOTP(userData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  otp: string;
  otpExpiry: Date;
}): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      ...userData,
      role: "customer",
      isVerified: false,
      otpAttempts: 0,
    })
    .returning();
  return user;
}

/**
 * Get user by email
 */
async getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return user;
}

/**
 * Get user by ID
 */
async getUserById(id: number): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
  return user;
}

/**
 * Verify user OTP and mark as verified
 */
async verifyUserOTP(userId: number): Promise<User> {
  const [user] = await db
    .update(users)
    .set({
      isVerified: true,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

/**
 * Increment OTP attempts
 */
async incrementOTPAttempts(userId: number): Promise<void> {
  await db
    .update(users)
    .set({
      otpAttempts: sql`${users.otpAttempts} + 1`,
    })
    .where(eq(users.id, userId));
}

/**
 * Resend OTP (update OTP and expiry)
 */
async updateUserOTP(userId: number, otp: string, otpExpiry: Date): Promise<void> {
  await db
    .update(users)
    .set({
      otp,
      otpExpiry,
      otpAttempts: 0,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
```

---

## 🚀 STEP 6: CREATE AUTHENTICATION SERVICE

### Create `server/auth-service.ts`

```typescript
// server/auth-service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: number, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

---

## 🛡️ STEP 7: CREATE AUTHENTICATION MIDDLEWARE

### Create `server/middleware/auth-middleware.ts`

```typescript
// server/middleware/auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth-service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login.' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Authentication failed.' 
    });
  }
}

/**
 * Require verified email
 */
export async function requireVerified(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUserById(req.user.userId);
    
    if (!user || !user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before accessing this feature.' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Verification check failed' });
  }
}
```

---

## 📡 STEP 8: ADD AUTHENTICATION ROUTES

### Update `server/routes.ts`

```typescript
// server/routes.ts
import { hashPassword, generateToken } from './auth-service';
import { generateOTP, getOTPExpiry, isOTPExpired, isValidOTPFormat, isTooManyAttempts } from './otp-service';
import { sendOTPEmail } from './email-service';
import { requireAuth, requireVerified } from './middleware/auth-middleware';

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

    console.log(`✅ User created: ${email}, OTP: ${otp}`); // Remove in production

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
    const user = await storage.getUserById(userId);
    
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

    // Generate JWT token for auto-login
    const token = generateToken(verifiedUser.id, verifiedUser.email, verifiedUser.role);

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
    const user = await storage.getUserById(userId);
    
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

    console.log(`✅ OTP resent to: ${user.email}, New OTP: ${otp}`); // Remove in production

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
    const token = generateToken(user.id, user.email, user.role);

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
    const user = await storage.getUserById(req.user!.userId);
    
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
```

---

## 🎨 STEP 9: CREATE FRONTEND COMPONENTS

### 9.1: Create Signup Page `client/src/pages/signup.tsx`

```typescript
// client/src/pages/signup.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store userId for OTP verification
      localStorage.setItem("pendingUserId", data.userId.toString());
      localStorage.setItem("pendingUserEmail", data.email);
      
      // Redirect to OTP verification page
      setLocation("/verify-otp");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    signupMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Create Account</CardTitle>
          <CardDescription>
            Join Goodness Glamour today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 9.2: Create OTP Verification Page `client/src/pages/verify-otp.tsx`

```typescript
// client/src/pages/verify-otp.tsx
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
        body: JSON.stringify({ userId: parseInt(userId!), otp: otpCode }),
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
        body: JSON.stringify({ userId: parseInt(userId!) }),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit code to <strong>{userEmail}</strong>
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
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
              className="w-full"
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
                className="text-sm"
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
```

### 9.3: Update App Routing `client/src/App.tsx`

```typescript
// client/src/App.tsx
import { Route, Switch } from "wouter";
import HomePage from "./pages/home";
import SignupPage from "./pages/signup";
import VerifyOTPPage from "./pages/verify-otp";
import LoginPage from "./pages/login";
// ... other imports

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify-otp" component={VerifyOTPPage} />
      <Route path="/login" component={LoginPage} />
      {/* ... other routes */}
    </Switch>
  );
}

export default App;
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue 1: Duplicate Signup
**Problem:** User tries to signup with same email twice

**Solution:**
```typescript
// Already handled in signup route
if (existingUser && !existingUser.isVerified) {
  // Resend OTP instead of error
  await storage.updateUserOTP(existingUser.id, newOTP, newExpiry);
  await sendOTPEmail(email, name, newOTP);
  return res.json({ message: "New OTP sent" });
}
```

### Issue 2: OTP Expiry
**Problem:** User enters OTP after 10 minutes

**Solution:**
```typescript
// Check expiry before validation
if (isOTPExpired(user.otpExpiry)) {
  return res.status(400).json({ 
    message: "OTP expired. Please request a new one." 
  });
}
```

### Issue 3: Wrong OTP (Brute Force)
**Problem:** User tries many wrong OTPs

**Solution:**
```typescript
// Limit attempts to 5
if (isTooManyAttempts(user.otpAttempts)) {
  return res.status(429).json({ 
    message: "Too many attempts. Request new OTP." 
  });
}
```

### Issue 4: Email Not Sent
**Problem:** OTP email fails to send

**Solution:**
```typescript
// Check email send result
const emailSent = await sendOTPEmail(email, name, otp);
if (!emailSent) {
  return res.status(500).json({
    message: "Failed to send email. Please try again.",
  });
}
```

### Issue 5: User Tries to Login Before Verification
**Problem:** Unverified user tries to login

**Solution:**
```typescript
// Check verification status in login
if (!user.isVerified) {
  return res.status(403).json({ 
    message: "Please verify your email first.",
    userId: user.id,
    requiresVerification: true,
  });
}
```

---

## 🧪 TESTING CHECKLIST

- [ ] User can signup with valid email
- [ ] OTP email is received
- [ ] OTP is 6 digits
- [ ] OTP expires after 10 minutes
- [ ] Can't use expired OTP
- [ ] Can't use wrong OTP (max 5 attempts)
- [ ] Can resend OTP
- [ ] After verification, auto-login works
- [ ] Redirects to homepage after verification
- [ ] Can't signup with same email twice (if verified)
- [ ] Can resend OTP if signup with unverified email
- [ ] Can't login without verification
- [ ] Existing features still work (booking, chatbot, etc.)

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Variables:
```env
JWT_SECRET=your-super-secret-key-change-this
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Vercel Deployment:
1. Add environment variables in Vercel dashboard
2. Push code to GitHub
3. Deploy automatically
4. Test signup flow in production

---

## 📊 DATABASE SCHEMA SUMMARY

```sql
users table:
├─ id (serial, primary key)
├─ email (text, unique, not null)
├─ password (text, not null) -- Hashed
├─ name (text, not null)
├─ phone (text, nullable)
├─ role (text, default: "customer")
├─ isVerified (boolean, default: false) -- NEW
├─ otp (text, nullable) -- NEW
├─ otpExpiry (timestamp, nullable) -- NEW
├─ otpAttempts (integer, default: 0) -- NEW
├─ createdAt (timestamp, default: now())
└─ updatedAt (timestamp, default: now())
```

---

## ✅ SUMMARY

**What You Get:**
- ✅ Secure signup with email verification
- ✅ 6-digit OTP sent via email
- ✅ OTP expires in 10 minutes
- ✅ Max 5 OTP attempts (prevent brute force)
- ✅ Resend OTP functionality
- ✅ Auto-login after verification
- ✅ Beautiful email template
- ✅ No breaking changes to existing features

**Security Features:**
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ OTP expiration
- ✅ Attempt limiting
- ✅ Email verification required

**User Experience:**
- ✅ Smooth signup flow
- ✅ Clear error messages
- ✅ Countdown timer
- ✅ Resend option
- ✅ Auto-redirect after success

---

**Ready to implement? Follow this guide step-by-step!** 🚀

**Estimated Time:** 2-3 hours for complete implementation

