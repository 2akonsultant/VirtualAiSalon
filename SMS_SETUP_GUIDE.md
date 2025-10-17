# 📱 SMS Notification Setup Guide

## 🎉 **SMS Integration Complete!**

Your salon booking system now supports **SMS notifications** in addition to email confirmations! Customers will receive both email and SMS confirmations when they book appointments.

---

## 🚀 **Quick Setup (5 Minutes)**

### **Option 1: TextLocal (Recommended for India - Very Cheap)**

1. **Sign up at TextLocal:**
   - Go to: https://www.textlocal.in/
   - Create a free account
   - Verify your mobile number

2. **Get API Key:**
   - Login to your TextLocal dashboard
   - Go to "API" section
   - Copy your API key

3. **Configure .env file:**
   ```env
   # Add these lines to your .env file
   TEXTLOCAL_API_KEY=your_textlocal_api_key_here
   TEXTLOCAL_SENDER=GLAMOR
   ```

4. **Test SMS:**
   ```bash
   npm run dev
   # Make a test booking and check the logs
   ```

---

### **Option 2: MSG91 (Alternative for India)**

1. **Sign up at MSG91:**
   - Go to: https://msg91.com/
   - Create account and verify

2. **Get API Key:**
   - Login to dashboard
   - Go to "API" section
   - Copy your auth key

3. **Configure .env file:**
   ```env
   MSG91_API_KEY=your_msg91_api_key_here
   MSG91_SENDER_ID=GLAMOR
   ```

---

### **Option 3: Twilio (Global, More Expensive)**

1. **Sign up at Twilio:**
   - Go to: https://www.twilio.com/
   - Create account and verify

2. **Get Credentials:**
   - Account SID (from dashboard)
   - Auth Token (from dashboard)
   - Buy a phone number

3. **Configure .env file:**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_FROM_NUMBER=+1234567890
   ```

---

## 📋 **Complete .env Configuration**

Add these lines to your `.env` file:

```env
# ==================== EMAIL CONFIGURATION ====================
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# ==================== SMS CONFIGURATION ====================
# TextLocal (Recommended - Very cheap for India)
TEXTLOCAL_API_KEY=your_textlocal_api_key
TEXTLOCAL_SENDER=GLAMOR

# MSG91 (Alternative for India)
MSG91_API_KEY=your_msg91_api_key
MSG91_SENDER_ID=GLAMOR

# Twilio (Global but more expensive)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Generic SMS Gateway (if you have another provider)
SMS_GATEWAY_URL=https://your-gateway.com/api/send
SMS_GATEWAY_API_KEY=your_gateway_api_key
SMS_GATEWAY_SENDER=GLAMOR
```

---

## 💰 **SMS Provider Pricing Comparison**

| Provider | Cost per SMS | India Coverage | Setup |
|----------|-------------|----------------|-------|
| **TextLocal** | ₹0.15-0.20 | Excellent | Easy |
| **MSG91** | ₹0.20-0.25 | Excellent | Easy |
| **Twilio** | $0.0075 (₹0.63) | Global | Medium |
| **Generic Gateway** | Varies | Varies | Hard |

**Recommendation:** Start with TextLocal for India-based customers.

---

## 🧪 **Testing SMS Functionality**

### **Test 1: Make a Booking**
1. Open your website: http://localhost:5000
2. Go to "Book Appointment"
3. Fill out the form with a real phone number
4. Submit the booking
5. Check your phone for SMS confirmation

### **Test 2: Check Server Logs**
Look for these messages in your terminal:
```
📱 Attempting to send SMS to: +91xxxxxxxxxx
📱 Trying TextLocal...
✅ SMS sent successfully via TextLocal
✅ Booking processed: Admin Email=true, Customer Email=true, SMS=true (TextLocal), Excel=true
```

### **Test 3: Manual SMS Test**
```bash
# Install dependencies first
npm install

# Test SMS configuration
node -e "
import { testSMSConfiguration } from './server/sms-service.ts';
testSMSConfiguration('+91xxxxxxxxxx').then(result => {
  console.log('SMS Test Result:', result);
});
"
```

---

## 📱 **SMS Message Format**

Your customers will receive beautifully formatted SMS messages like this:

```
💐 Goodness Glamour Salon

Hi Priya!

✅ Your booking is confirmed!
📅 Mon, 15 Jan at 2:00 PM
💇‍♀️ Hair Cut, Hair Color
💰 ₹1500
📍 123 Main Street, Mumbai

🆔 Booking ID: BK-2024-001

📞 Need help? Call: 9036626642

Thank you for choosing us! 🌸
```

---

## 🔧 **Troubleshooting**

### **SMS Not Sending?**

1. **Check .env file:**
   ```bash
   # Make sure these are set
   echo $TEXTLOCAL_API_KEY
   echo $TEXTLOCAL_SENDER
   ```

2. **Check phone number format:**
   - Use: `+91xxxxxxxxxx` (with country code)
   - Avoid: `xxxxxxxxxx` (without country code)

3. **Check provider logs:**
   - TextLocal: Check dashboard for delivery status
   - MSG91: Check API logs
   - Twilio: Check console logs

4. **Test with different providers:**
   - The system tries multiple providers automatically
   - Check which provider worked in the logs

### **Common Issues:**

| Issue | Solution |
|-------|----------|
| "Provider not configured" | Add API keys to .env file |
| "Invalid phone number" | Use +91xxxxxxxxxx format |
| "API quota exceeded" | Check provider dashboard |
| "SMS not delivered" | Check provider delivery logs |

---

## 📊 **SMS Analytics**

The system logs all SMS activities:

```bash
# Check SMS success rate
grep "SMS result" logs/app.log

# Check provider usage
grep "SMS sent successfully via" logs/app.log
```

---

## 🎯 **Features Included**

✅ **Multi-provider support** - TextLocal, MSG91, Twilio  
✅ **Automatic fallback** - If one provider fails, tries others  
✅ **Beautiful SMS formatting** - Professional message templates  
✅ **Booking confirmations** - Automatic SMS on booking  
✅ **Appointment reminders** - Ready for future use  
✅ **Error handling** - Graceful failure handling  
✅ **Logging** - Complete SMS activity tracking  

---

## 🚀 **Next Steps**

1. **Choose a provider** (TextLocal recommended for India)
2. **Add API keys** to your .env file
3. **Restart your server** (`npm run dev`)
4. **Test with a real booking**
5. **Monitor SMS delivery** in provider dashboard

---

## 📞 **Support**

If you need help:
- Check the troubleshooting section above
- Review server logs for error messages
- Test with different phone numbers
- Try different SMS providers

**Your SMS notification system is now ready! 🎉**

Customers will receive both email and SMS confirmations for every booking.
