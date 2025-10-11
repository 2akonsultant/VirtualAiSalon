# 🚀 Local Setup Guide - Goodness Glamour Salon Booking App

## ✅ Setup Completed Successfully!

Your salon booking application is now running locally on your machine.

---

## 📋 What's Installed & Running

### **Application Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Express.js + TypeScript (Node.js v22.17.0)
- **Database**: In-memory storage (MemStorage) with 11 pre-loaded services
- **AI**: OpenAI GPT-5 integration for chatbot
- **Port**: 5000 (serves both frontend and backend)

### **Pre-loaded Services:**
✅ **Women's Hair Services** (7 services):
- Hair Cut & Styling
- Hair Coloring & Highlights
- Hair Treatment & Conditioning
- Bridal & Party Hair Styling
- Professional Blowdry & Styling
- Hair Wash & Basic Styling
- Hair Consultation & Advice

✅ **Kids Hair Services** (4 services):
- Kids Haircuts & Styling
- Kids Party & Special Occasion Styling
- Kids Hair Wash & Conditioning
- Creative Braiding & Fun Styles

---

## 🌐 Access Your Application

### **URLs:**
- **Website Homepage**: http://localhost:5000
- **Services Page**: http://localhost:5000/services
- **Booking Page**: http://localhost:5000/booking
- **AI Chat**: http://localhost:5000/ai-chat

### **API Endpoints:**
- **All Services**: http://localhost:5000/api/services
- **Women's Services**: http://localhost:5000/api/services/category/women
- **Kids Services**: http://localhost:5000/api/services/category/kids
- **AI Chat**: POST http://localhost:5000/api/ai/chat
- **Create Booking**: POST http://localhost:5000/api/bookings
- **Create Customer**: POST http://localhost:5000/api/customers

---

## ⚙️ Configuration

### **Environment Variables (.env file)**

Located at: `/Users/varunpatil/Downloads/SalonBooker/.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration (REQUIRED for AI chatbot)
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (OPTIONAL - currently using in-memory storage)
# DATABASE_URL=postgresql://user:password@localhost:5432/salonbooker
```

### **⚠️ IMPORTANT: Configure OpenAI API Key**

The AI chatbot feature requires an OpenAI API key to work.

**Steps to get your API key:**
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key
5. Update `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
6. Restart the server (see commands below)

**Without the API key:**
- The app will run fine
- Services and booking features will work
- AI chatbot will return a fallback error message

---

## 🔧 Common Commands

### **Start the Development Server:**
```bash
cd /Users/varunpatil/Downloads/SalonBooker
npm run dev
```

### **Stop the Server:**
```bash
# Find the process
lsof -ti:5000

# Kill the process (replace PID with the number from above)
kill -9 PID
```

Or simply press `Ctrl+C` if running in foreground.

### **Check if Server is Running:**
```bash
curl http://localhost:5000/api/services
```

### **View Server Logs:**
```bash
# If running in background with log file
tail -f /tmp/server.log
```

### **Install Dependencies (if needed):**
```bash
npm install
```

### **Build for Production:**
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
SalonBooker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components (UI, navigation, QR scanner, AI chat)
│   │   ├── pages/         # Page components (home, services, booking)
│   │   ├── lib/           # Utilities (AI service, query client, QR utils)
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML template
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Data storage layer (in-memory)
│   └── vite.ts           # Vite dev server setup
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema definitions (Drizzle ORM)
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── drizzle.config.ts     # Database configuration
```

---

## ✨ Features & Functionality

### **1. Service Browsing**
- View all services with images, descriptions, and pricing
- Filter by category (Women's / Kids)
- Responsive grid layout

### **2. AI Chatbot**
- Natural language conversations
- Service recommendations
- Booking assistance
- Powered by OpenAI GPT-5
- **Note**: Requires OpenAI API key to function

### **3. QR Code Scanning**
- Scan QR codes to access specific services
- Direct link to AI chat for service inquiries

### **4. Booking System**
- Customer information collection
- Service selection
- Date/time scheduling
- Booking confirmation

### **5. Responsive Design**
- Mobile-first approach
- Works on all screen sizes
- Modern UI with Shadcn/ui components

---

## 🧪 Testing the Application

### **Test Backend API:**
```bash
# Get all services
curl http://localhost:5000/api/services | jq

# Get women's services only
curl http://localhost:5000/api/services/category/women | jq

# Test AI chat (requires OpenAI API key)
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about your hair coloring services",
    "sessionId": "test-session-123"
  }' | jq
```

### **Test Frontend:**
1. Open browser: http://localhost:5000
2. Navigate through the pages:
   - Home page → View hero section and features
   - Services → Browse all services
   - AI Chat → Test the chatbot
   - Booking → Fill out booking form

### **Test QR Scanner:**
1. Go to http://localhost:5000
2. Click on QR scanner feature
3. Allow camera access
4. Scan a QR code or test with generated codes

---

## 🔄 Database Options

### **Current Setup: In-Memory Storage**
- Data is stored in memory (RAM)
- Perfect for development and testing
- Data resets when server restarts
- 11 services pre-loaded on startup
- No database installation required

### **Upgrade to PostgreSQL (Optional):**

If you want persistent data storage:

1. **Install PostgreSQL:**
   ```bash
   # macOS with Homebrew
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database:**
   ```bash
   createdb salonbooker
   ```

3. **Update .env:**
   ```env
   DATABASE_URL=postgresql://localhost:5432/salonbooker
   ```

4. **Run Migrations:**
   ```bash
   npm run db:push
   ```

5. **Update storage.ts** to use database instead of memory storage

---

## 🐛 Troubleshooting

### **Issue: Server won't start**
```bash
# Check if port 5000 is already in use
lsof -ti:5000
# If found, kill the process
kill -9 $(lsof -ti:5000)
```

### **Issue: AI chatbot not working**
- Verify OpenAI API key is set in `.env`
- Check API key has sufficient credits: https://platform.openai.com/usage
- Restart the server after updating `.env`

### **Issue: Module not found errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Issue: Port 5000 already in use**
Change the port in `.env`:
```env
PORT=3000
```

### **Issue: TypeScript errors**
```bash
# Run type checking
npm run check
```

---

## 📊 Monitoring & Logs

### **Server Logs:**
The server logs all API requests in the format:
```
12:10:20 PM [express] GET /api/services 200 in 5ms
```

### **Check Server Status:**
```bash
# Check if server is running
curl -I http://localhost:5000

# View recent logs (if using log file)
tail -20 /tmp/server.log
```

---

## 🚀 Next Steps

### **For Development:**
1. ✅ Server is running
2. ⚠️ **Configure OpenAI API key** for AI chatbot
3. Open http://localhost:5000 in your browser
4. Test all features
5. Make your customizations

### **For Production Deployment:**
1. Build the application: `npm run build`
2. Set up PostgreSQL database (optional but recommended)
3. Configure production environment variables
4. Deploy to your hosting platform (Vercel, Heroku, AWS, etc.)
5. Set up SSL certificate
6. Configure domain name

---

## 📝 Files Modified for Local Setup

The following files were modified to work on macOS:

1. **server/vite.ts**
   - Changed `nanoid` import to use built-in `crypto.randomBytes`
   - Reason: `nanoid` was not a direct dependency

2. **server/index.ts**
   - Removed `reusePort: true` from server.listen()
   - Reason: Not supported on macOS (Darwin)

These changes do not affect functionality and make the app more portable.

---

## 💡 Tips

- **Hot Module Replacement**: The dev server supports HMR, so your changes will reflect immediately without page refresh
- **API Testing**: Use tools like Postman or Thunder Client for testing APIs
- **Browser DevTools**: Use React DevTools extension for debugging
- **Database Inspection**: Consider using tools like Drizzle Studio or pgAdmin

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure Node.js version is compatible (v22.17.0 confirmed working)

---

## ✅ Current Status

- ✅ Dependencies installed (511 packages)
- ✅ Environment configuration created
- ✅ Server running on port 5000
- ✅ Backend API working (tested /api/services)
- ✅ Frontend accessible
- ✅ 11 services pre-loaded in memory
- ⚠️ OpenAI API key needs configuration for chatbot

**Your application is ready to use! 🎉**

Open http://localhost:5000 in your browser to get started.

