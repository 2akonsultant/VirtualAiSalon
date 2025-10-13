// Test Gemini Integration
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDEw4nW0xV_FQKf1SUX9fFJwnEY5n8_Jwc";

async function testGemini() {
  console.log("🧪 Testing Gemini AI Integration...\n");
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are a helpful salon assistant for Goodness Glamour Salon."
    });
    
    const chat = model.startChat({ history: [] });
    
    // Test 1
    console.log("📝 Test 1: Service Inquiry");
    console.log("User: What services do you offer?");
    const result1 = await chat.sendMessage("What services do you offer?");
    console.log("Bot:", result1.response.text().substring(0, 150) + "...\n");
    
    // Test 2
    console.log("📝 Test 2: Pricing");
    console.log("User: How much does hair coloring cost?");
    const result2 = await chat.sendMessage("How much does hair coloring cost?");
    console.log("Bot:", result2.response.text().substring(0, 150) + "...\n");
    
    // Test 3
    console.log("📝 Test 3: Doorstep Service");
    console.log("User: Do you provide doorstep services?");
    const result3 = await chat.sendMessage("Do you provide doorstep services?");
    console.log("Bot:", result3.response.text().substring(0, 150) + "...\n");
    
    console.log("✅ All tests passed! Gemini integration is working!\n");
    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

testGemini();

