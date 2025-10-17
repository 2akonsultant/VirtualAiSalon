# 🆓 FREE SMS Setup Guide

## 🎯 **Zero Cost SMS for Trial**

This guide will help you set up **completely FREE** SMS notifications for your salon booking system.

---

## 🚀 **Option 1: Twilio Free Trial (Recommended)**

### **Why Twilio?**
- ✅ **$15 FREE credits** (enough for 2000+ SMS)
- ✅ **No credit card required** for trial
- ✅ **Global coverage** - works everywhere
- ✅ **Most reliable** service
- ✅ **Easy setup** - 5 minutes

### **Setup Steps:**

1. **Sign up for FREE:**
   - Go to: https://www.twilio.com/try-twilio
   - Click "Start Free Trial"
   - Enter your details (no credit card needed)

2. **Get your credentials:**
   - After signup, you'll see your dashboard
   - Copy your **Account SID** and **Auth Token**
   - Buy a FREE trial phone number (included in trial)

3. **Add to your .env file:**
   ```env
   # Twilio Free Trial Configuration
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_FROM_NUMBER=+1234567890
   ```

4. **Test it:**
   ```bash
   npm run dev
   # Make a test booking
   ```

---

## 🇮🇳 **Option 2: TextLocal Free Credits (India Focus)**

### **Why TextLocal?**
- ✅ **₹100 FREE credits** (enough for 500+ SMS)
- ✅ **Perfect for Indian customers**
- ✅ **Very cheap** after trial
- ✅ **Fast setup** - 3 minutes

### **Setup Steps:**

1. **Sign up for FREE:**
   - Go to: https://www.textlocal.in/
   - Click "Sign Up Free"
   - Verify your mobile number

2. **Get API Key:**
   - Login to dashboard
   - Go to "API" → "View API Key"
   - Copy your API key

3. **Add to your .env file:**
   ```env
   # TextLocal Free Trial Configuration
   TEXTLOCAL_API_KEY=your_api_key_here
   TEXTLOCAL_SENDER=GLAMOR
   ```

4. **Test it:**
   ```bash
   npm run dev
   # Make a test booking
   ```

---

## 🧪 **Quick Test (2 Minutes)**

### **Step 1: Choose a Provider**
Pick either Twilio or TextLocal (both are free)

### **Step 2: Configure**
Add the credentials to your `.env` file (see examples above)

### **Step 3: Restart Server**
```bash
npm run dev
```

### **Step 4: Test Booking**
1. Open: http://localhost:5000
2. Go to "Book Appointment"
3. Fill form with your real phone number
4. Submit booking
5. Check your phone for SMS!

---

## 📱 **Expected SMS Message**

You'll receive a beautiful SMS like this:

```
💐 Goodness Glamour Salon

Hi [Your Name]!

✅ Your booking is confirmed!
📅 [Date] at [Time]
💇‍♀️ [Services]
💰 ₹[Amount]
📍 [Address]

🆔 Booking ID: BK-2024-001

📞 Need help? Call: 9036626642

Thank you for choosing us! 🌸
```

---

## 🔧 **Troubleshooting**

### **SMS Not Received?**

1. **Check server logs:**
   ```bash
   # Look for these messages in terminal:
   📱 Attempting to send SMS to: +91xxxxxxxxxx
   ✅ SMS sent successfully via Twilio
   ```

2. **Check phone number format:**
   - ✅ Correct: `+919876543210`
   - ❌ Wrong: `9876543210`

3. **Check provider dashboard:**
   - Twilio: Check message logs in console
   - TextLocal: Check delivery reports

### **Common Issues:**

| Problem | Solution |
|---------|----------|
| "Invalid credentials" | Double-check API keys in .env |
| "Phone number invalid" | Use +91xxxxxxxxxx format |
| "No credits" | Check provider dashboard |
| "SMS not delivered" | Check spam folder, try different number |

---

## 💰 **After Trial Period**

### **Twilio:**
- $15 credits usually last 30 days
- After trial: ~₹0.63 per SMS
- Buy more credits as needed

### **TextLocal:**
- ₹100 credits last longer
- After trial: ~₹0.20 per SMS
- Very cheap for Indian numbers

### **MSG91:**
- 100 free SMS
- After trial: ~₹0.25 per SMS
- Good alternative

---

## 🎯 **Complete .env Example**

```env
# ==================== EMAIL CONFIGURATION ====================
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# ==================== FREE SMS CONFIGURATION ====================
# Choose ONE option below:

# Option 1: Twilio Free Trial (Recommended)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Option 2: TextLocal Free Credits (India)
# TEXTLOCAL_API_KEY=your_textlocal_api_key
# TEXTLOCAL_SENDER=GLAMOR

# Option 3: MSG91 Free Trial
# MSG91_API_KEY=your_msg91_api_key
# MSG91_SENDER_ID=GLAMOR
```

---

## 🚀 **Ready to Start?**

1. **Choose Twilio** (easiest, most reliable)
2. **Sign up** at https://www.twilio.com/try-twilio
3. **Copy credentials** to .env file
4. **Restart server:** `npm run dev`
5. **Test booking** with your phone number
6. **Check SMS** delivery!

---

## 📞 **Need Help?**

- Check server logs for error messages
- Verify API keys are correct
- Test with different phone numbers
- Try both Twilio and TextLocal if one fails

**Your FREE SMS system is ready in 5 minutes! 🎉**
