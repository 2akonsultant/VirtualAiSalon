# Agentic AI Salon Booking System - Setup Guide

## Overview

This system transforms your simple Gemini chatbot into a sophisticated agentic AI system with:

- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **RAG System**: Local vector database with Chroma for intelligent information retrieval
- **Multi-Agent Architecture**: Specialized agents for different tasks
- **Twilio Integration**: QR code triggered voice calls
- **Booking Management**: Complete appointment booking flow

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   QR Code       │    │   Twilio Voice   │    │   Voice Agent   │
│   Scanner       │───▶│   Integration    │───▶│   (STT/TTS)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Notification   │◀───│   Orchestration  │───▶│   RAG Agent     │
│   Agent         │    │     System       │    │ (Vector Search) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Booking Agent  │
                       │ (Appointment    │
                       │  Management)    │
                       └─────────────────┘
```

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. System Requirements

**For Windows:**
```bash
# Install PyAudio dependencies
pip install pipwin
pipwin install pyaudio
```

**For macOS:**
```bash
brew install portaudio
pip install pyaudio
```

**For Linux:**
```bash
sudo apt-get install python3-pyaudio
```

### 3. API Keys Setup

Create a `.env` file in your project root:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: For production deployment
FLASK_ENV=production
```

## Usage

### 1. Basic Testing

Run the main voice agent system:

```bash
python voice_agent.py
```

Choose from the following modes:
- **Text Conversation**: Interactive text-based chat
- **Voice Conversation**: Full voice interaction with microphone
- **RAG System Test**: Test the vector database retrieval
- **Booking Flow Test**: Test the complete booking process

### 2. Voice Conversation Example

```python
from voice_agent import AgenticSalonAI

# Initialize the system
salon_ai = AgenticSalonAI()

# Start voice conversation
salon_ai.start_voice_conversation()
```

### 3. Twilio Integration

Start the Twilio webhook server:

```bash
python twilio_voice_integration.py
```

The server will run on `http://localhost:5000` and handle:
- Incoming voice calls
- Speech processing
- Booking confirmations
- SMS notifications

## Agent System Details

### Voice Agent
- **Speech-to-Text**: Uses Google Speech Recognition
- **Text-to-Speech**: Uses pyttsx3 with configurable voice settings
- **Microphone Management**: Automatic ambient noise adjustment

### RAG Agent
- **Vector Database**: Chroma with cosine similarity
- **Knowledge Base**: Pre-loaded salon information
- **Semantic Search**: Intelligent context retrieval
- **Expandable**: Easy to add new knowledge

### Booking Agent
- **Conversation Flow**: Step-by-step booking process
- **Data Validation**: Phone numbers, dates, addresses
- **Booking ID Generation**: Unique identifiers for each appointment
- **Context Management**: Maintains conversation state

### Notification Agent
- **SMS Integration**: Customer confirmations
- **Email Support**: Detailed booking information
- **WhatsApp Ready**: Framework for WhatsApp integration
- **Multi-channel**: Simultaneous notifications

## QR Code Integration

### Web Integration

Add this to your website's QR code scanner:

```javascript
// When QR code is scanned
fetch('/web/qr_scan', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        phone_number: '+1234567890'
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Voice call initiated:', data.call_sid);
    }
});
```

### Mobile Integration

For mobile apps, trigger voice calls directly:

```python
import requests

def trigger_voice_call(phone_number):
    response = requests.post('http://your-server.com/qr/trigger_call', 
                           json={'phone_number': phone_number})
    return response.json()
```

## Configuration

### Voice Settings

Modify voice settings in `VoiceAgent` class:

```python
def _setup_voice(self):
    voices = self.tts_engine.getProperty('voices')
    if voices:
        self.tts_engine.setProperty('voice', voices[1].id)  # Female voice
    self.tts_engine.setProperty('rate', 150)  # Speed of speech
    self.tts_engine.setProperty('volume', 0.8)  # Volume level
```

### RAG System Customization

Add new salon information:

```python
# In RAGSystem._initialize_salon_data()
new_document = {
    "text": "New service: Manicure and pedicure starting from ₹800",
    "metadata": {"type": "pricing", "category": "nail_services"}
}
```

### Booking Flow Customization

Modify booking steps in `BookingAgent.process_booking_request()`:

```python
# Add new step
elif current_step == "get_service":
    # Custom logic for service selection
    context.booking_data["service"] = user_input
    context.current_step = "get_preferences"  # New step
```

## Deployment

### 1. Local Development

```bash
# Run voice agent
python voice_agent.py

# Run Twilio server (in another terminal)
python twilio_voice_integration.py
```

### 2. Production Deployment

**Using ngrok for local testing:**
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5000

# Update Twilio webhook URL to ngrok URL
```

**Using cloud platforms:**
- **Heroku**: Deploy with Procfile
- **Railway**: Direct deployment
- **AWS**: EC2 or Lambda deployment
- **Google Cloud**: Cloud Run deployment

### 3. Environment Variables

Set these in your production environment:

```bash
export GEMINI_API_KEY="your_key"
export OPENAI_API_KEY="your_key"
export TWILIO_ACCOUNT_SID="your_sid"
export TWILIO_AUTH_TOKEN="your_token"
export TWILIO_PHONE_NUMBER="+1234567890"
```

## Testing

### 1. Unit Tests

```python
# Test individual agents
from voice_agent import RAGAgent, BookingAgent

rag_agent = RAGAgent(rag_system)
context = rag_agent.get_relevant_context("hair coloring prices")
assert "₹2,000" in context
```

### 2. Integration Tests

```python
# Test complete booking flow
salon_ai = AgenticSalonAI()
response = salon_ai.process_user_input("I want to book an appointment")
assert "name" in response.lower()
```

### 3. Voice Testing

```python
# Test voice recognition
voice_agent = VoiceAgent()
text = voice_agent.listen_to_customer()
print(f"Recognized: {text}")
```

## Troubleshooting

### Common Issues

1. **PyAudio Installation Error**
   ```bash
   # Windows
   pip install pipwin
   pipwin install pyaudio
   
   # macOS
   brew install portaudio
   pip install pyaudio
   ```

2. **Chroma Database Error**
   ```bash
   # Delete and recreate database
   rm -rf ./chroma_db
   python voice_agent.py
   ```

3. **Twilio Webhook Not Receiving Calls**
   - Check ngrok is running
   - Verify webhook URL in Twilio console
   - Check firewall settings

4. **Voice Recognition Issues**
   - Check microphone permissions
   - Test with different microphones
   - Adjust ambient noise settings

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Advanced Features

### 1. Multi-language Support

```python
# Add language detection and TTS
from langdetect import detect

def detect_language(text):
    return detect(text)

# Configure TTS for different languages
response.say(text, voice='Polly.Joanna', language='hi-IN')  # Hindi
```

### 2. Custom Knowledge Base

```python
# Add custom documents
rag_system.add_new_knowledge(
    "We offer 10% discount on first booking",
    {"type": "promotion", "category": "discount"}
)
```

### 3. Analytics and Monitoring

```python
# Track conversation metrics
class AnalyticsAgent:
    def track_conversation(self, session_id, user_input, response):
        # Log to database or analytics service
        pass
```

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Implement rate limiting for voice calls
4. **Data Privacy**: Encrypt sensitive customer data
5. **Webhook Security**: Verify Twilio webhook signatures

## Performance Optimization

1. **Caching**: Cache frequently accessed RAG results
2. **Connection Pooling**: Reuse database connections
3. **Async Processing**: Use async/await for I/O operations
4. **Memory Management**: Clean up inactive call sessions

## Support

For issues and questions:
- Check the troubleshooting section
- Review logs for error messages
- Test individual components separately
- Verify API keys and configurations

## Future Enhancements

1. **WhatsApp Integration**: Direct WhatsApp messaging
2. **Video Calls**: Face-to-face consultations
3. **Calendar Integration**: Real-time availability checking
4. **Payment Processing**: Integrated payment collection
5. **Multi-language**: Support for regional languages
6. **AI Analytics**: Conversation insights and optimization
