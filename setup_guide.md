# 🎯 Agentic AI Voice Assistant Setup Guide

## Complete Setup Instructions for Salon AI Voice Assistant

### 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements_ai.txt
   ```

2. **Configure Environment Variables**
   ```bash
   cp config.py config_local.py
   # Edit config_local.py with your API keys
   ```

3. **Run the System**
   ```bash
   python api_server.py
   ```

4. **Access the Interface**
   - Open: `http://localhost:8000`
   - Enter phone number to trigger AI voice call

---

## 📋 Detailed Setup Instructions

### 1. Prerequisites

#### Required Accounts:
- **Google Cloud Account** (for Gemini AI)
- **Twilio Account** (for voice calls and SMS)
- **Domain with HTTPS** (for webhooks)

#### System Requirements:
- Python 3.8+
- 4GB RAM minimum
- Internet connection
- Microphone and speakers (for local testing)

### 2. API Keys Setup

#### A. Gemini AI Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your config

#### B. Twilio Setup
1. Sign up at [Twilio Console](https://console.twilio.com/)
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Configure webhooks in Twilio Console

### 3. Configuration

#### Update `config.py`:
```python
# Gemini AI
GEMINI_API_KEY = "your_actual_gemini_key"

# Twilio
TWILIO_ACCOUNT_SID = "your_twilio_sid"
TWILIO_AUTH_TOKEN = "your_twilio_token"
TWILIO_PHONE_NUMBER = "+1234567890"

# Webhook URL (your domain)
WEBHOOK_URL = "https://your-domain.com"
```

### 4. Database Setup

The system automatically creates SQLite database:
- Location: `data/salon_bookings.db`
- Tables: `bookings`, `customers`
- Fallback: Excel files in `data/` folder

### 5. Twilio Webhook Configuration

1. **In Twilio Console:**
   - Go to Phone Numbers → Manage → Active Numbers
   - Click your Twilio number
   - Set Webhook URL: `https://your-domain.com/voice/webhook`
   - HTTP Method: POST

2. **Voice Settings:**
   - Primary Handler: `https://your-domain.com/voice/webhook`
   - Fallback URL: `https://your-domain.com/voice/process`

### 6. Deployment Options

#### Option A: Local Development
```bash
# Install dependencies
pip install -r requirements_ai.txt

# Run locally
python api_server.py

# Test at http://localhost:8000
```

#### Option B: Cloud Deployment (Recommended)

**Using Railway:**
1. Connect your GitHub repo
2. Set environment variables in Railway dashboard
3. Deploy automatically

**Using Heroku:**
1. Create `Procfile`: `web: uvicorn api_server:app --host 0.0.0.0 --port $PORT`
2. Set environment variables
3. Deploy with Git

**Using DigitalOcean App Platform:**
1. Connect GitHub repo
2. Set environment variables
3. Deploy with auto-scaling

### 7. Testing the System

#### A. Test AI Responses
```bash
curl http://localhost:8000/test-ai
```

#### B. Test Voice Call
1. Go to `http://localhost:8000`
2. Enter a test phone number
3. Click "Get AI Call Now"
4. Answer the call and speak

#### C. Test Booking Flow
1. Say: "I want to book an appointment"
2. Follow the AI prompts
3. Check database for booking entry

### 8. Production Checklist

- [ ] All API keys configured
- [ ] Twilio webhooks set up
- [ ] HTTPS domain configured
- [ ] Database backups enabled
- [ ] Monitoring/logging set up
- [ ] Error handling tested
- [ ] Load testing completed

### 9. Troubleshooting

#### Common Issues:

**"Twilio not available"**
- Check API keys in config
- Verify Twilio account is active
- Ensure phone number is verified

**"Speech recognition failed"**
- Check microphone permissions
- Test with different audio devices
- Verify internet connection

**"Database error"**
- Check file permissions in `data/` folder
- Ensure SQLite is installed
- Verify disk space

**"Webhook not receiving calls"**
- Verify HTTPS is enabled
- Check Twilio webhook configuration
- Test webhook URL manually

### 10. Advanced Configuration

#### Custom Voice Settings:
```python
# In voice_agent.py
VOICE_LANGUAGE = "en-IN"  # Indian English
VOICE_NAME = "alice"      # Twilio voice
SPEECH_TIMEOUT = 10       # seconds
```

#### RAG System Tuning:
```python
# Adjust search parameters
VECTOR_SEARCH_RESULTS = 5  # More context
CHROMA_PERSIST_DIRECTORY = "./chroma_db"
```

#### Notification Settings:
```python
# Enable/disable notifications
ENABLE_SMS_NOTIFICATIONS = True
ENABLE_EMAIL_NOTIFICATIONS = False
```

### 11. Monitoring and Analytics

#### Health Check:
```bash
curl http://localhost:8000/health
```

#### View Bookings:
```bash
curl http://localhost:8000/bookings
```

#### Log Analysis:
```bash
# Check application logs
tail -f logs/salon_ai.log

# Check Twilio logs in console
# Check database for bookings
```

### 12. Scaling Considerations

#### For High Volume:
- Use Redis for session management
- Implement connection pooling
- Add load balancing
- Use CDN for static assets

#### For Multiple Salons:
- Database per salon
- Separate Twilio numbers
- Custom branding per salon
- Multi-tenant architecture

---

## 🎉 Success!

Your Agentic AI Voice Assistant is now ready! 

**Next Steps:**
1. Test with real customers
2. Monitor performance
3. Gather feedback
4. Iterate and improve

**Support:**
- Check logs for errors
- Monitor Twilio usage
- Track booking conversions
- Optimize AI responses

---

## 📞 Support

For technical support:
- Check the logs first
- Review Twilio console
- Test individual components
- Contact: 2akonsultant@gmail.com
