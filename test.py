import google.generativeai as genai

# Configure API key
api_key = "AIzaSyDEw4nW0xV_FQKf1SUX9fFJwnEY5n8_Jwc"
genai.configure(api_key=api_key)

# Salon context for the AI
SALON_CONTEXT = """
You are an AI assistant for Goodness Glamour Salon, a premium ladies and kids salon offering doorstep beauty services.

SALON INFORMATION:
- Name: Goodness Glamour Salon
- Contact: 9036626642
- Email: 2akonsultant@gmail.com
- Service Hours: Monday - Sunday, 9:00 AM - 8:00 PM
- Service Type: We provide doorstep services across the city

SERVICES & PRICES:

Women's Hair Services:
- Haircut & Styling: ₹500 - ₹1,500
- Hair Coloring: ₹2,000 - ₹5,000
- Hair Spa Treatment: ₹1,500 - ₹3,000
- Keratin Treatment: ₹4,000 - ₹8,000

Kids Hair Services:
- Kids Haircut: ₹300 - ₹700
- Party Hairstyle: ₹800 - ₹1,500
- Creative Braiding: ₹500 - ₹1,200

Bridal & Party Services:
- Bridal Hair & Makeup: ₹15,000 - ₹30,000
- Party Makeup: ₹3,000 - ₹8,000

KEY FEATURES:
- Doorstep service (we come to your home)
- Professional stylists with 5+ years experience
- Premium products used
- Flexible timing (9 AM - 8 PM)

Be friendly, professional, and encourage customers to book appointments through our website.
"""

# Initialize the Gemini model with salon context
model = genai.GenerativeModel(
    "gemini-2.0-flash-exp",
    system_instruction=SALON_CONTEXT
)

# Start a chat session
chat = model.start_chat(history=[])

# Test the chatbot
def send_message(user_message):
    """Send a message to the chatbot and get a response"""
    try:
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

# Example usage
if __name__ == "__main__":
    print("🤖 Gemini Chatbot Test")
    print("=" * 50)
    
    # Test message 1
    print("\n👤 User: Hello! What services does Goodness Glamour Salon offer?")
    response1 = send_message("Hello! What services does Goodness Glamour Salon offer?")
    print(f"🤖 Bot: {response1}")
    
    # Test message 2
    print("\n👤 User: What are your prices for hair coloring?")
    response2 = send_message("What are your prices for hair coloring?")
    print(f"🤖 Bot: {response2}")
    
    # Test message 3
    print("\n👤 User: Do you provide doorstep services?")
    response3 = send_message("Do you provide doorstep services?")
    print(f"🤖 Bot: {response3}")
    
    print("\n" + "=" * 50)
    print("✅ Chatbot is working! Ready for integration.")
