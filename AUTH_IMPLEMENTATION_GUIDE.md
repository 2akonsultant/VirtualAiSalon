# 🔐 Complete Authentication Implementation Guide

## Step-by-Step Guide to Add Login/Signup Without Breaking Existing Features

---

## 📦 STEP 1: INSTALL DEPENDENCIES

### Backend Dependencies:
```bash
npm install jsonwebtoken bcryptjs cookie-parser
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/cookie-parser
```

**What each package does:**
- `jsonwebtoken` - Create and verify JWT tokens for authentication
- `bcryptjs` - Hash passwords securely (never store plain text passwords)
- `cookie-parser` - Parse cookies for session management

---

## 🗄️ STEP 2: UPDATE DATABASE SCHEMA

### Add Users Table to `shared/schema.ts`

```typescript
// shared/schema.ts
import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

// Add this new table (don't remove existing tables!)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Will store hashed password
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").default("customer"), // "customer" or "admin"
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add relation to existing customers table (optional)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
```

**Important:** This adds a NEW table without touching existing ones!

---

## 🔧 STEP 3: CREATE AUTHENTICATION SERVICE

### Create `server/auth-service.ts`

```typescript
// server/auth-service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate JWT token for a user
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

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}
```

---

## 🛡️ STEP 4: CREATE AUTHENTICATION MIDDLEWARE

### Create `server/middleware/auth-middleware.ts`

```typescript
// server/middleware/auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../auth-service';

// Extend Express Request type to include user
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
 * Middleware to protect routes - requires valid JWT token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login.' 
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.' 
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Authentication failed.' 
    });
  }
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required.' 
    });
  }
  next();
}

/**
 * Optional auth - doesn't block if no token, but attaches user if token exists
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next(); // Continue even if auth fails
  }
}
```

---

## 🚀 STEP 5: ADD AUTHENTICATION ROUTES

### Update `server/routes.ts` (add these routes)

```typescript
// server/routes.ts
import { hashPassword, comparePassword, generateToken } from './auth-service';
import { requireAuth, requireAdmin, optionalAuth } from './middleware/auth-middleware';
import cookieParser from 'cookie-parser';

// Add cookie parser middleware (add this near the top with other middleware)
app.use(cookieParser());

// ============================================
// AUTHENTICATION ROUTES (ADD THESE)
// ============================================

/**
 * POST /api/auth/signup
 * Register a new user
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

    // Check if email already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already registered. Please login instead." 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role: "customer",
    });

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // Return user data (without password) and token
    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Failed to create account. Please try again." 
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
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

    // Return user data (without password) and token
    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
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
 * Get current user info (protected route)
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
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side will remove token)
 */
app.post("/api/auth/logout", (req, res) => {
  // In JWT, logout is handled client-side by removing the token
  res.json({ message: "Logged out successfully" });
});

/**
 * PUT /api/auth/change-password
 * Change user password (protected route)
 */
app.put("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current and new password are required" 
      });
    }

    // Get user
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await storage.updateUserPassword(userId, hashedPassword);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      message: "Failed to change password" 
    });
  }
});
```

---

## 🗃️ STEP 6: UPDATE STORAGE SERVICE

### Update `server/storage.ts` (add these methods)

```typescript
// server/storage.ts

// Add these methods to your storage class/object

/**
 * Create a new user
 */
async createUser(userData: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

/**
 * Get user by email
 */
async getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

/**
 * Get user by ID
 */
async getUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

/**
 * Update user password
 */
async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Update user profile
 */
async updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
  const [updatedUser] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
}
```

---

## 🎨 STEP 7: CREATE FRONTEND COMPONENTS

### 7.1: Create Login Page `client/src/pages/login.tsx`

```typescript
// client/src/pages/login.tsx
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
        throw new Error(data.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Welcome Back</CardTitle>
          <CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 7.2: Create Signup Page `client/src/pages/signup.tsx`

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
      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to home
      setLocation("/");
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

### 7.3: Create Protected Route Component

```typescript
// client/src/components/auth/protected-route.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      setLocation("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      if (requireAdmin && user.role !== "admin") {
        setLocation("/");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setLocation("/login");
    }
  }, [setLocation, requireAdmin]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

---

## 🔗 STEP 8: UPDATE APP ROUTING

### Update `client/src/App.tsx`

```typescript
// client/src/App.tsx
import { Route, Switch } from "wouter";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import DashboardPage from "./pages/dashboard";
import BookingPage from "./pages/booking";
import { ProtectedRoute } from "./components/auth/protected-route";

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute requireAdmin={true}>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/booking">
        <ProtectedRoute>
          <BookingPage />
        </ProtectedRoute>
      </Route>
      
      {/* ... other routes */}
    </Switch>
  );
}
```

---

## 🔄 STEP 9: UPDATE NAVIGATION

### Update `client/src/components/navigation.tsx`

```typescript
// Add login/logout button to navigation
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { LogIn, LogOut, User } from "lucide-react";

export function Navigation() {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setLocation("/");
  };

  return (
    <nav className="flex items-center gap-4">
      {/* ... existing navigation items ... */}
      
      {token && user ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">Hi, {user.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setLocation("/login")}>
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      )}
    </nav>
  );
}
```

---

## 🛡️ STEP 10: PROTECT EXISTING ROUTES

### Update Dashboard Route Protection

```typescript
// server/routes.ts

// Protect dashboard route (add requireAuth middleware)
app.get("/api/dashboard/stats", requireAuth, requireAdmin, async (req, res) => {
  // ... existing dashboard code
});

// Protect booking routes (optional - only if you want login required for booking)
app.post("/api/bookings", optionalAuth, async (req, res) => {
  // If user is logged in, use their info
  if (req.user) {
    const user = await storage.getUserById(req.user.userId);
    // Pre-fill customer info from user account
  }
  // ... existing booking code
});
```

---

## ⚠️ COMMON MISTAKES TO AVOID

### 1. **Storing Passwords in Plain Text**
❌ **NEVER DO THIS:**
```typescript
await storage.createUser({ password: plainPassword });
```

✅ **ALWAYS DO THIS:**
```typescript
const hashedPassword = await hashPassword(plainPassword);
await storage.createUser({ password: hashedPassword });
```

### 2. **Not Validating Tokens on Protected Routes**
❌ **NEVER DO THIS:**
```typescript
app.get("/api/dashboard", (req, res) => {
  // Anyone can access!
});
```

✅ **ALWAYS DO THIS:**
```typescript
app.get("/api/dashboard", requireAuth, requireAdmin, (req, res) => {
  // Only authenticated admins can access
});
```

### 3. **Exposing Sensitive Data**
❌ **NEVER DO THIS:**
```typescript
res.json({ user }); // Includes password hash!
```

✅ **ALWAYS DO THIS:**
```typescript
res.json({
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    // Never send password, even hashed!
  }
});
```

### 4. **Not Handling Token Expiration**
❌ **NEVER DO THIS:**
```typescript
// Token expires but user stays logged in
```

✅ **ALWAYS DO THIS:**
```typescript
// Check token validity on each request
// Redirect to login if expired
```

### 5. **Breaking Existing Features**
❌ **NEVER DO THIS:**
```typescript
// Remove or modify existing tables/routes
```

✅ **ALWAYS DO THIS:**
```typescript
// Add NEW tables, keep existing ones
// Add NEW routes, keep existing ones
// Use middleware to protect routes without changing them
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Install dependencies (jwt, bcrypt, cookie-parser)
- [ ] Add users table to schema
- [ ] Create auth-service.ts
- [ ] Create auth-middleware.ts
- [ ] Add auth routes to routes.ts
- [ ] Update storage.ts with user methods
- [ ] Create login page
- [ ] Create signup page
- [ ] Create protected route component
- [ ] Update App.tsx routing
- [ ] Update navigation with login/logout
- [ ] Protect dashboard routes
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test protected routes
- [ ] Test logout flow
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test existing features still work

---

## 🧪 TESTING PLAN

### Test 1: Signup
1. Go to /signup
2. Fill form with valid data
3. Submit
4. Should redirect to home
5. Should see "Hi, [name]" in navigation

### Test 2: Login
1. Go to /login
2. Enter credentials
3. Submit
4. Should redirect based on role
5. Should see user info in navigation

### Test 3: Protected Routes
1. Logout
2. Try to access /dashboard
3. Should redirect to /login
4. Login as admin
5. Should access dashboard

### Test 4: Existing Features
1. Test booking without login (if allowed)
2. Test chatbot
3. Test contact form
4. Test services page
5. All should work as before!

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables for Production:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Vercel Deployment:
Add these environment variables in Vercel dashboard:
- `JWT_SECRET` = (generate a random string)
- Keep all existing environment variables

---

## 📚 SUMMARY

**What We Added:**
- ✅ User registration & login
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ Role-based access (admin/customer)
- ✅ Session management
- ✅ Login/logout UI

**What We Didn't Break:**
- ✅ Existing booking system
- ✅ Chatbot
- ✅ Contact form
- ✅ Dashboard (now protected)
- ✅ All existing features

**Security Features:**
- ✅ Passwords hashed (never stored plain text)
- ✅ JWT tokens for authentication
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Token expiration
- ✅ Secure error messages

---

**Ready to implement? Let me know and I'll help you step by step!** 🚀

