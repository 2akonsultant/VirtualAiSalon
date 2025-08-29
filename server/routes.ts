import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertBookingSchema, insertAiConversationSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get services by category
  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const services = await storage.getServicesByCategory(category);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services by category" });
    }
  });

  // Get single service
  app.get("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Create customer
  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists by phone
      const existingCustomer = await storage.getCustomerByPhone(customerData.phone);
      if (existingCustomer) {
        return res.json(existingCustomer);
      }
      
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Validate customer exists
      const customer = await storage.getCustomer(bookingData.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Calculate total amount based on services
      let totalAmount = 0;
      const serviceIds = bookingData.serviceIds as string[];
      for (const serviceId of serviceIds) {
        const service = await storage.getService(serviceId);
        if (service) {
          totalAmount += service.priceMin; // Use minimum price for calculation
        }
      }
      
      const booking = await storage.createBooking({
        ...bookingData,
        totalAmount
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get customer bookings
  app.get("/api/bookings/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const bookings = await storage.getBookingsByCustomer(customerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, sessionId, conversationId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and sessionId are required" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
      } else {
        conversation = await storage.getConversationBySession(sessionId);
      }

      let messages = conversation ? conversation.messages as any[] : [];
      
      // Add user message
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
      messages.push(userMessage);

      // Prepare OpenAI messages
      const systemPrompt = `You are an AI assistant for Goodness Glamour Ladies & Kids Salon. 
      We are a virtual salon specializing in premium doorstep hair services for women and children.
      
      Our services include:
      - Women's hair services: cuts & styling, coloring & highlights, treatments & conditioning, bridal & party styling, blowdry, hair wash, consultations
      - Kids hair services: haircuts & styling, party styling, hair wash & conditioning, creative braiding
      - All services are performed at the customer's home by our professional stylists
      
      Contact: 9036626642
      
      Price ranges:
      - Women's services: ₹150-₹3500 depending on service
      - Kids services: ₹100-₹600
      
      Key features:
      - Virtual salon - we come to your doorstep
      - Professional equipment and products
      - Experienced stylists
      - Convenient home service
      - Safe and hygienic practices
      
      Always be helpful, professional, and encourage booking. Ask for customer details when they want to book.
      Respond in a friendly, conversational tone. Keep responses concise but informative.`;

      const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })) // Last 10 messages for context
      ];

      // Get AI response
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: openaiMessages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Add AI response
      const aiMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      messages.push(aiMessage);

      // Save conversation
      if (conversation) {
        await storage.updateConversation(conversation.id, messages);
      } else {
        conversation = await storage.createConversation({
          sessionId,
          messages,
          customerId: null,
          bookingId: null
        });
      }

      res.json({
        response: aiResponse,
        conversationId: conversation.id,
        sessionId
      });
      
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        message: "Failed to process AI chat request",
        response: "I apologize, but I'm having trouble responding right now. Please call us at 9036626642 for immediate assistance."
      });
    }
  });

  // Generate QR Code data
  app.get("/api/qr/generate", async (req, res) => {
    try {
      const { serviceId, source } = req.query;
      
      const qrData = {
        url: `${process.env.REPLIT_DOMAINS || 'localhost:5000'}/ai-chat`,
        serviceId: serviceId || null,
        source: source || 'website',
        timestamp: new Date().toISOString()
      };
      
      res.json(qrData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
