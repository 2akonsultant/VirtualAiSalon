# 🚀 Quick Start: Add Login/Signup in 30 Minutes

## Step 1: Install Dependencies (2 minutes)
```bash
npm install jsonwebtoken bcryptjs cookie-parser
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/cookie-parser
```

## Step 2: Add Environment Variable (1 minute)
Add to `.env`:
```env
JWT_SECRET=your-super-secret-key-change-this
```

## Step 3: Copy Files (10 minutes)
Copy these files from `AUTH_IMPLEMENTATION_GUIDE.md`:
1. `server/auth-service.ts` - Authentication logic
2. `server/middleware/auth-middleware.ts` - Route protection
3. `client/src/pages/login.tsx` - Login page
4. `client/src/pages/signup.tsx` - Signup page
5. `client/src/components/auth/protected-route.tsx` - Protected routes

## Step 4: Update Existing Files (10 minutes)

### Update `shared/schema.ts`:
Add users table (copy from guide)

### Update `server/storage.ts`:
Add user methods (copy from guide)

### Update `server/routes.ts`:
1. Import auth service and middleware
2. Add auth routes (signup, login, logout)
3. Protect dashboard routes

### Update `client/src/App.tsx`:
Add login/signup routes

### Update `client/src/components/navigation.tsx`:
Add login/logout button

## Step 5: Test (7 minutes)
1. Start server: `npm run dev`
2. Go to http://localhost:5000/signup
3. Create account
4. Login
5. Test protected routes

## Done! 🎉

**Total Time: ~30 minutes**

---

## Quick Reference

### Backend Auth Routes:
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Frontend Routes:
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Protected admin page

### Protect a Route:
```typescript
// Backend
app.get("/api/protected", requireAuth, (req, res) => {
  // Only authenticated users can access
});

// Frontend
<Route path="/protected">
  <ProtectedRoute>
    <ProtectedPage />
  </ProtectedRoute>
</Route>
```

### Check if User is Logged In:
```typescript
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user") || "{}");
```

---

## Troubleshooting

**Problem:** "Authentication required" error
**Solution:** Make sure token is in localStorage and valid

**Problem:** Dashboard not accessible
**Solution:** Check if user role is "admin"

**Problem:** Existing features broken
**Solution:** Make sure you only ADDED code, didn't REMOVE anything

---

For full details, see `AUTH_IMPLEMENTATION_GUIDE.md`

