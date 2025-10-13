# 🏗️ Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Login   │  │  Signup  │  │ Profile  │  │Dashboard │      │
│  │  Page    │  │  Page    │  │  Page    │  │  (Admin) │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │             │             │
│       └─────────────┴──────────────┴─────────────┘             │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API REQUESTS  │
                    │  (with JWT)    │
                    └───────┬────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      BACKEND SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              AUTHENTICATION ROUTES                      │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  POST /api/auth/signup    - Register new user          │   │
│  │  POST /api/auth/login     - Login user                 │   │
│  │  GET  /api/auth/me        - Get current user           │   │
│  │  POST /api/auth/logout    - Logout user                │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                         │
│  ┌───────────────────▼────────────────────────────────────┐   │
│  │           AUTHENTICATION MIDDLEWARE                     │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  requireAuth()    - Verify JWT token                   │   │
│  │  requireAdmin()   - Check admin role                   │   │
│  │  optionalAuth()   - Optional authentication            │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                         │
│  ┌───────────────────▼────────────────────────────────────┐   │
│  │           AUTHENTICATION SERVICE                        │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  hashPassword()      - Hash password with bcrypt       │   │
│  │  comparePassword()   - Verify password                 │   │
│  │  generateToken()     - Create JWT token                │   │
│  │  verifyToken()       - Validate JWT token              │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                         │
└──────────────────────┼─────────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────────┐
│                        DATABASE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    USERS TABLE                          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  id              - Primary key                          │   │
│  │  email           - Unique, not null                     │   │
│  │  password        - Hashed password                      │   │
│  │  name            - User's full name                     │   │
│  │  phone           - Phone number (optional)              │   │
│  │  role            - "customer" or "admin"                │   │
│  │  isVerified      - Email verification status            │   │
│  │  createdAt       - Registration date                    │   │
│  │  updatedAt       - Last update date                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              EXISTING TABLES (unchanged)                │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  customers       - Customer information                 │   │
│  │  bookings        - Booking records                      │   │
│  │  services        - Service catalog                      │   │
│  │  conversations   - AI chat history                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### 1. User Registration (Signup)
```
User fills form
      │
      ▼
Frontend validates
      │
      ▼
POST /api/auth/signup
      │
      ▼
Backend validates email uniqueness
      │
      ▼
Hash password with bcrypt
      │
      ▼
Store user in database
      │
      ▼
Generate JWT token
      │
      ▼
Return token + user data
      │
      ▼
Frontend stores token in localStorage
      │
      ▼
Redirect to home page
```

### 2. User Login
```
User enters credentials
      │
      ▼
Frontend validates
      │
      ▼
POST /api/auth/login
      │
      ▼
Backend finds user by email
      │
      ▼
Compare password with hash
      │
      ▼
Generate JWT token
      │
      ▼
Return token + user data
      │
      ▼
Frontend stores token in localStorage
      │
      ▼
Redirect based on role
  (admin → dashboard, customer → home)
```

### 3. Accessing Protected Routes
```
User requests protected page
      │
      ▼
Frontend checks localStorage for token
      │
      ├─ No token → Redirect to /login
      │
      ▼
Send request with Authorization header
      │
      ▼
Backend middleware extracts token
      │
      ▼
Verify JWT signature
      │
      ├─ Invalid → Return 401 Unauthorized
      │
      ▼
Check token expiration
      │
      ├─ Expired → Return 401 Unauthorized
      │
      ▼
Decode user info from token
      │
      ▼
Check role if admin required
      │
      ├─ Not admin → Return 403 Forbidden
      │
      ▼
Attach user to request object
      │
      ▼
Allow access to route
```

### 4. User Logout
```
User clicks logout button
      │
      ▼
Frontend removes token from localStorage
      │
      ▼
Frontend removes user data from localStorage
      │
      ▼
Redirect to home page
      │
      ▼
User is logged out
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Password Hashing                                 │
│  ├─ bcrypt with 10 salt rounds                            │
│  ├─ Never store plain text passwords                      │
│  └─ One-way hashing (can't reverse)                       │
│                                                             │
│  Layer 2: JWT Tokens                                       │
│  ├─ Signed with secret key                                │
│  ├─ Contains user ID, email, role                         │
│  ├─ Expires after 7 days                                  │
│  └─ Can't be tampered without secret                      │
│                                                             │
│  Layer 3: Middleware Protection                            │
│  ├─ Verifies token on every request                       │
│  ├─ Checks token signature                                │
│  ├─ Validates expiration                                  │
│  └─ Blocks unauthorized access                            │
│                                                             │
│  Layer 4: Role-Based Access                                │
│  ├─ Admin routes require admin role                       │
│  ├─ Customer routes require customer role                 │
│  └─ Public routes accessible to all                       │
│                                                             │
│  Layer 5: Input Validation                                 │
│  ├─ Email format validation                               │
│  ├─ Password strength requirements                        │
│  ├─ SQL injection prevention                              │
│  └─ XSS attack prevention                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Token Storage (Frontend)
```
localStorage
├─ authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
└─ user: {
     id: 1,
     email: "user@example.com",
     name: "John Doe",
     role: "customer"
   }
```

### JWT Token Structure
```
Header
├─ alg: "HS256"
└─ typ: "JWT"

Payload
├─ userId: 1
├─ email: "user@example.com"
├─ role: "customer"
├─ iat: 1234567890  (issued at)
└─ exp: 1235172690  (expires at)

Signature
└─ HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Database User Record
```
{
  id: 1,
  email: "user@example.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  name: "John Doe",
  phone: "9876543210",
  role: "customer",
  isVerified: false,
  createdAt: "2025-01-10T10:30:00Z",
  updatedAt: "2025-01-10T10:30:00Z"
}
```

---

## Route Protection Matrix

| Route | Public | Customer | Admin | Middleware |
|-------|--------|----------|-------|------------|
| `/` | ✅ | ✅ | ✅ | None |
| `/login` | ✅ | ✅ | ✅ | None |
| `/signup` | ✅ | ✅ | ✅ | None |
| `/services` | ✅ | ✅ | ✅ | None |
| `/booking` | ❌ | ✅ | ✅ | `requireAuth` |
| `/profile` | ❌ | ✅ | ✅ | `requireAuth` |
| `/dashboard` | ❌ | ❌ | ✅ | `requireAuth` + `requireAdmin` |
| `/api/auth/me` | ❌ | ✅ | ✅ | `requireAuth` |
| `/api/bookings` | ❌ | ✅ | ✅ | `requireAuth` |
| `/api/dashboard/*` | ❌ | ❌ | ✅ | `requireAuth` + `requireAdmin` |

---

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR RESPONSES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  400 Bad Request                                           │
│  └─ Missing required fields                               │
│  └─ Invalid email format                                  │
│  └─ Password too short                                    │
│                                                             │
│  401 Unauthorized                                          │
│  └─ Invalid credentials                                   │
│  └─ Token missing                                         │
│  └─ Token expired                                         │
│  └─ Token invalid                                         │
│                                                             │
│  403 Forbidden                                             │
│  └─ Admin access required                                 │
│  └─ Insufficient permissions                              │
│                                                             │
│  409 Conflict                                              │
│  └─ Email already registered                              │
│                                                             │
│  500 Internal Server Error                                 │
│  └─ Database error                                        │
│  └─ Unexpected error                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration with Existing Features

### Booking System
```
Before Authentication:
User fills booking form → Creates booking → Gets confirmation

After Authentication:
Logged in user → Pre-filled form with user data → Creates booking → Links to user account
Guest user → Manual form → Creates booking → No user link
```

### Dashboard
```
Before Authentication:
Dashboard accessible with password

After Authentication:
Dashboard requires admin JWT token → More secure → Can track admin actions
```

### Chatbot
```
Before Authentication:
Anonymous chat sessions

After Authentication:
Logged in user → Chat history saved to user account
Guest user → Anonymous chat (as before)
```

---

## Best Practices Implemented

✅ **Password Security**
- Hashed with bcrypt (10 rounds)
- Never stored in plain text
- Never sent in responses

✅ **Token Security**
- Signed with secret key
- Short expiration (7 days)
- Verified on every request

✅ **Data Privacy**
- User passwords never exposed
- Sensitive data filtered from responses
- Secure error messages (no info leakage)

✅ **Backward Compatibility**
- All existing features still work
- New tables don't affect old ones
- Optional authentication for public routes

✅ **User Experience**
- Smooth login/logout flow
- Clear error messages
- Auto-redirect after login
- Remember user session

---

**This architecture ensures security without breaking existing functionality!** 🔐

