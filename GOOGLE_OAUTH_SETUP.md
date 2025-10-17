# Google OAuth 2.0 Setup Guide

## 🔧 **Backend Setup**

### 1. Install Dependencies
```bash
npm install google-auth-library
```

### 2. Environment Variables
Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Secret (if not already set)
JWT_SECRET=your_jwt_secret_here
```

### 3. Frontend Environment Variables
Add to your `client/.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 🔑 **Getting Google Client ID**

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

### Step 3: Copy Credentials
- Copy the **Client ID** and **Client Secret**
- Add them to your environment variables

## 🚀 **Database Schema Updates**

Add these fields to your users table:

```sql
-- Add Google OAuth fields to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN profile_picture TEXT;
ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
```

## 📱 **Frontend Implementation**

The Google OAuth component is already implemented and includes:

- ✅ **Google Identity Services** integration
- ✅ **Automatic user registration** for new Google users
- ✅ **Profile picture** support
- ✅ **Error handling** and loading states
- ✅ **Responsive design** with nude color palette
- ✅ **JWT token management**

## 🔒 **Security Features**

- ✅ **Server-side token verification**
- ✅ **JWT token generation**
- ✅ **Email verification check**
- ✅ **Automatic user creation/update**
- ✅ **Secure session management**

## 🎨 **Styling**

The Google OAuth button matches your nude color palette:
- **Outline variant**: Rose gold border with hover effects
- **Default variant**: Deep taupe background
- **Loading states**: Smooth animations
- **Responsive design**: Works on all devices

## 🧪 **Testing**

1. **Development**: Test with `http://localhost:3000`
2. **Production**: Update authorized origins in Google Console
3. **Error handling**: Check browser console for issues
4. **Database**: Verify user creation in your database

## 📋 **Features Included**

- ✅ **One-click Google sign-in**
- ✅ **Automatic account creation**
- ✅ **Profile picture integration**
- ✅ **Seamless user experience**
- ✅ **Error handling and validation**
- ✅ **Mobile-responsive design**
- ✅ **Security best practices**

## 🔄 **User Flow**

1. User clicks "Continue with Google"
2. Google account selection popup appears
3. User selects their Google account
4. Backend verifies the Google token
5. User is created/updated in database
6. JWT token is generated
7. User is redirected to dashboard
8. Profile picture and name are displayed

## 🛠️ **Troubleshooting**

### Common Issues:
1. **"Invalid client"**: Check Google Client ID
2. **"Origin mismatch"**: Update authorized origins
3. **"Token verification failed"**: Check backend logs
4. **"User not created"**: Check database connection

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables
3. Test Google OAuth in Google Console
4. Check database logs
5. Verify JWT token generation

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Google OAuth is properly configured
4. Check database connectivity
5. Verify JWT secret is set correctly

The implementation is production-ready and follows Google's best practices for OAuth 2.0 authentication.
