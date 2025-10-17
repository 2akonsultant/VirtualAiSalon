# AI Voice Booking Assistant - Deployment Guide

## 🚀 Complete Deployment Setup for Goodness Glamour Salon

This guide provides step-by-step instructions for deploying the AI Voice Booking Assistant system with QR code integration.

## 📋 Prerequisites

### Required Services
- **Twilio Account** with Voice API enabled
- **OpenAI API Key** (optional, for enhanced conversations)
- **Python 3.8+** installed
- **Flask** and other dependencies
- **Domain/Server** for webhooks

### Required Environment Variables
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
WEBHOOK_BASE_URL=https://your-domain.com
SALONBOOKER_API_URL=http://localhost:5000
PORT=7001
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   QR Code       │───▶│  QR Trigger      │───▶│  Voice Assistant│
│   Scanner       │    │  System          │    │  (Port 7001)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Enhanced AI     │    │  Booking        │
                       │  Assistant       │    │  Integration    │
                       │  (Port 7002)     │    │  (Port 7004)    │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Existing       │
                                               │  SalonBooker    │
                                               │  System         │
                                               └─────────────────┘
```

## 📦 Installation Steps

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install flask twilio openai qrcode pandas sqlite3 requests

# Or install from requirements file
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACd8941e7d6933a9e031879bc28d7af7e8
TWILIO_AUTH_TOKEN=815e90983ed99b02e52943cc14602d56
TWILIO_PHONE_NUMBER=+917019035686

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
WEBHOOK_BASE_URL=https://your-domain.com
SALONBOOKER_API_URL=http://localhost:5000
VOICE_ASSISTANT_URL=http://localhost:7001
```

### 3. Configure Twilio Webhooks

In your Twilio Console:
1. Go to Phone Numbers → Manage → Active Numbers
2. Click on your Twilio phone number
3. Set Voice webhook URL to: `https://your-domain.com/voice/incoming`
4. Set HTTP method to POST

### 4. Deploy Services

#### Option A: Local Development
```bash
# Terminal 1 - Basic Voice Assistant
python ai_voice_booking_assistant.py

# Terminal 2 - Enhanced Voice Assistant (with OpenAI)
python enhanced_voice_assistant.py

# Terminal 3 - QR Trigger System
python qr_voice_trigger_system.py

# Terminal 4 - Booking Integration
python voice_booking_integration.py
```

#### Option B: Production Deployment

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  voice-assistant:
    build: .
    ports:
      - "7001:7001"
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
      - WEBHOOK_BASE_URL=${WEBHOOK_BASE_URL}
    command: python ai_voice_booking_assistant.py

  enhanced-assistant:
    build: .
    ports:
      - "7002:7002"
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
      - WEBHOOK_BASE_URL=${WEBHOOK_BASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    command: python enhanced_voice_assistant.py

  qr-trigger:
    build: .
    ports:
      - "7003:7003"
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
      - WEBHOOK_BASE_URL=${WEBHOOK_BASE_URL}
      - VOICE_ASSISTANT_URL=${VOICE_ASSISTANT_URL}
    command: python qr_voice_trigger_system.py

  booking-integration:
    build: .
    ports:
      - "7004:7004"
    environment:
      - SALONBOOKER_API_URL=${SALONBOOKER_API_URL}
      - BOOKINGS_EXCEL_PATH=/app/data/bookings.xlsx
      - DATABASE_PATH=/app/data/salon_bookings.db
    command: python voice_booking_integration.py
    volumes:
      - ./data:/app/data
```

## 🔧 Configuration

### 1. Update Your Existing SalonBooker Routes

Add these routes to your existing `server/routes.ts`:

```typescript
// Voice booking integration endpoint
app.post("/api/voice-booking", async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Process voice booking
    const booking = await storage.createBooking({
      ...bookingData,
      source: "voice_call"
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create voice booking" });
  }
});

// QR code trigger endpoint
app.post("/api/qr/trigger-call", async (req, res) => {
  try {
    const { phone_number } = req.body;
    
    // Trigger voice call
    const response = await fetch(`${VOICE_ASSISTANT_URL}/trigger-voice-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number })
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to trigger voice call" });
  }
});
```

### 2. Update Frontend Components

Add QR code scanner component to your React app:

```typescript
// client/src/components/qr-voice-scanner.tsx
import React, { useState } from 'react';

export const QRVoiceScanner: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const triggerVoiceCall = async () => {
    setIsCalling(true);
    try {
      const response = await fetch('/api/qr/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Call initiated! We\'ll be calling you shortly.');
      }
    } catch (error) {
      alert('Failed to initiate call. Please try again.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="qr-voice-scanner">
      <h3>📞 Voice Booking</h3>
      <p>Enter your phone number for instant AI voice booking:</p>
      
      <input
        type="tel"
        placeholder="+919876543210"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="phone-input"
      />
      
      <button
        onClick={triggerVoiceCall}
        disabled={isCalling || !phoneNumber}
        className="call-button"
      >
        {isCalling ? 'Calling...' : '📞 Call Me Now'}
      </button>
    </div>
  );
};
```

## 🧪 Testing

### 1. Run Test Suite
```bash
python voice_assistant_test.py
```

### 2. Test Individual Components
```bash
# Test voice assistant
curl -X POST http://localhost:7001/trigger-voice-call \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210"}'

# Test QR system
curl -X GET http://localhost:7003/api/qr/generate

# Test booking integration
curl -X POST http://localhost:7004/api/voice-bookings \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Test", "phone": "+919876543210", "service": "haircut"}'
```

### 3. Health Checks
```bash
# Check all services
curl http://localhost:7001/health  # Voice Assistant
curl http://localhost:7002/health  # Enhanced Assistant
curl http://localhost:7003/health  # QR Trigger
curl http://localhost:7004/health  # Booking Integration
```

## 📱 QR Code Generation

### 1. Generate QR Codes for Marketing Materials
```python
from qr_voice_trigger_system import QRVoiceTriggerSystem

qr_system = QRVoiceTriggerSystem()

# Generate QR code for website
website_qr = qr_system.generate_qr_code("website", "website")

# Generate QR code for specific service
haircut_qr = qr_system.generate_qr_code("haircut", "brochure")

# Save QR code image
import base64
with open("qr_code.png", "wb") as f:
    f.write(base64.b64decode(website_qr["qr_image"]))
```

### 2. Embed QR Codes in Marketing Materials
- **Business Cards**: Include QR code for instant voice booking
- **Flyers**: Add QR code with "Scan to Book" text
- **Website**: Add QR code scanner component
- **Social Media**: Share QR code images

## 🔒 Security Considerations

### 1. Webhook Security
```python
# Add webhook signature verification
from twilio.request_validator import RequestValidator

validator = RequestValidator(TWILIO_AUTH_TOKEN)

@app.route('/voice/incoming', methods=['POST'])
def handle_incoming_call():
    # Verify Twilio signature
    if not validator.validate(request.url, request.form, request.headers.get('X-Twilio-Signature')):
        return Response('Unauthorized', status=403)
    
    # Process call
    # ...
```

### 2. Rate Limiting
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/trigger-voice-call', methods=['POST'])
@limiter.limit("10 per minute")
def trigger_voice_call():
    # ...
```

## 📊 Monitoring and Analytics

### 1. Add Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/voice_assistant.log'),
        logging.StreamHandler()
    ]
)
```

### 2. Track Metrics
- Voice call success rate
- Booking completion rate
- Average call duration
- QR code scan rates
- Customer satisfaction

## 🚀 Production Deployment

### 1. Using PM2 (Node.js style process manager)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'voice-assistant',
      script: 'ai_voice_booking_assistant.py',
      interpreter: 'python3',
      port: 7001
    },
    {
      name: 'enhanced-assistant',
      script: 'enhanced_voice_assistant.py',
      interpreter: 'python3',
      port: 7002
    },
    {
      name: 'qr-trigger',
      script: 'qr_voice_trigger_system.py',
      interpreter: 'python3',
      port: 7003
    },
    {
      name: 'booking-integration',
      script: 'voice_booking_integration.py',
      interpreter: 'python3',
      port: 7004
    }
  ]
};
EOF

# Start all services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Using Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/voice-assistant
server {
    listen 80;
    server_name your-domain.com;

    location /voice/ {
        proxy_pass http://localhost:7001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /qr/ {
        proxy_pass http://localhost:7003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/voice-bookings {
        proxy_pass http://localhost:7004/api/voice-bookings;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🎯 Success Metrics

Track these KPIs to measure success:

1. **Voice Call Metrics**
   - Call success rate: >90%
   - Average call duration: <3 minutes
   - Booking completion rate: >70%

2. **QR Code Metrics**
   - Scan rate: >50% of distributed codes
   - Conversion rate: >30% scans to bookings

3. **Customer Experience**
   - Customer satisfaction: >4.5/5
   - Booking time reduction: >60%
   - Repeat booking rate: >40%

## 🆘 Troubleshooting

### Common Issues

1. **Twilio Webhook Not Receiving Calls**
   - Check webhook URL in Twilio console
   - Verify SSL certificate
   - Check firewall settings

2. **OpenAI API Errors**
   - Verify API key
   - Check rate limits
   - Monitor usage costs

3. **Database Connection Issues**
   - Check file permissions
   - Verify database path
   - Ensure data directory exists

4. **QR Code Not Working**
   - Test QR code URL directly
   - Check mobile browser compatibility
   - Verify phone number format

### Support Contacts
- **Twilio Support**: support@twilio.com
- **OpenAI Support**: help@openai.com
- **Technical Issues**: Check logs in `/logs/` directory

## 🎉 Congratulations!

Your AI Voice Booking Assistant is now ready for production! 

**Next Steps:**
1. Test with real phone numbers
2. Generate QR codes for marketing materials
3. Train staff on the new system
4. Monitor performance and optimize
5. Gather customer feedback

**Remember:** This system provides 24/7 AI-powered booking assistance, making it easier for customers to book appointments while freeing up your staff for other tasks.
