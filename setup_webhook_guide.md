# Webhook URL Setup Guide for AI Voice Booking Assistant

## 🚀 Option 1: ngrok (Easiest - 5 minutes)

### Step 1: Install ngrok
1. Go to [https://ngrok.com/](https://ngrok.com/)
2. Click "Sign up for free"
3. Create account with email
4. Download ngrok for Windows
5. Extract the .exe file to a folder (e.g., C:\ngrok\)
6. Add ngrok to your PATH or use full path

### Step 2: Get your auth token
1. Go to [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Copy your authtoken
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

### Step 3: Start ngrok tunnel
```bash
# Open command prompt in your SalonBooker directory
cd C:\Users\asus\Downloads\SalonBooker

# Start ngrok tunnel on port 7001
ngrok http 7001
```

### Step 4: Get your webhook URL
1. ngrok will show a screen like this:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       50ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:7001
Forwarding                    http://abc123.ngrok.io -> http://localhost:7001
```

2. Copy the HTTPS URL: `https://abc123.ngrok.io` (yours will be different)

### Step 5: Update your .env file
1. Open `.env` file in your SalonBooker directory
2. Update the webhook URL:
```
WEBHOOK_BASE_URL=https://abc123.ngrok.io
```

### Step 6: Start your voice assistant
```bash
python voice_booking_simple.py
```

### Step 7: Test the webhook
```bash
# Test in another command prompt
curl https://abc123.ngrok.io/health
```

---

## ☁️ Option 2: Cloud Deployment (Professional)

### A. Heroku (Free tier available)
1. Install Heroku CLI
2. Create account at [heroku.com](https://heroku.com)
3. Run commands:
```bash
heroku create your-salon-voice-booking
git init
git add .
git commit -m "Initial commit"
git push heroku main
```
4. Your webhook URL will be: `https://your-salon-voice-booking.herokuapp.com`

### B. Railway (Modern alternative)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub account
3. Deploy from GitHub repository
4. Get webhook URL from dashboard

### C. Render (Simple deployment)
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Create new web service
4. Deploy your code

---

## 🔧 Option 3: Local Network (For testing on same network)

### Use your local IP address
1. Find your local IP:
```bash
ipconfig
```
2. Look for "IPv4 Address" (e.g., 192.168.1.100)
3. Update .env:
```
WEBHOOK_BASE_URL=http://192.168.1.100:7001
```
4. Test from another device on same network

---

## 🧪 Testing Your Webhook URL

### Test 1: Health Check
```bash
curl https://your-webhook-url.ngrok.io/health
```

### Test 2: Twilio Verification
```bash
curl https://your-webhook-url.ngrok.io/verify-twilio
```

### Test 3: QR Code Generation
```bash
curl https://your-webhook-url.ngrok.io/api/qr/generate
```

---

## 📱 Complete Setup Checklist

- [ ] Install ngrok
- [ ] Get ngrok authtoken
- [ ] Start ngrok tunnel
- [ ] Copy HTTPS webhook URL
- [ ] Update WEBHOOK_BASE_URL in .env
- [ ] Start voice assistant
- [ ] Test webhook endpoints
- [ ] Buy Twilio phone number (for real calls)
- [ ] Test voice calls

---

## 🎯 Expected Results

After setup, you should see:
```
✅ ngrok tunnel: https://abc123.ngrok.io
✅ Voice assistant: Running on port 7001
✅ Health check: Working
✅ Twilio connection: Verified
✅ Ready for voice calls!
```

---

## 🚨 Troubleshooting

### Issue: ngrok not found
**Solution:** Add ngrok to PATH or use full path
```bash
C:\ngrok\ngrok.exe http 7001
```

### Issue: Port 7001 in use
**Solution:** Use different port
```bash
ngrok http 7002
# Update PORT=7002 in .env
```

### Issue: HTTPS URL not working
**Solution:** Make sure you're using the HTTPS URL, not HTTP

### Issue: Twilio can't reach webhook
**Solution:** Ensure ngrok is running and URL is accessible
