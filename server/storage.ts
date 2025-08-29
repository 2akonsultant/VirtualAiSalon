import { type Service, type Customer, type Booking, type AiConversation, type InsertService, type InsertCustomer, type InsertBooking, type InsertAiConversation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // AI Conversations
  getConversation(id: string): Promise<AiConversation | undefined>;
  getConversationBySession(sessionId: string): Promise<AiConversation | undefined>;
  createConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateConversation(id: string, messages: any[]): Promise<AiConversation | undefined>;
}

export class MemStorage implements IStorage {
  private services: Map<string, Service> = new Map();
  private customers: Map<string, Customer> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private aiConversations: Map<string, AiConversation> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    const defaultServices: InsertService[] = [
      // Women's Hair Services
      {
        name: "Hair Cut & Styling",
        description: "Professional haircuts, blowdry, and styling at your doorstep for all hair types.",
        category: "women",
        priceMin: 400,
        priceMax: 1200,
        duration: 60,
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Coloring & Highlights",
        description: "Professional hair coloring, highlights, balayage, and ombre treatments at home.",
        category: "women",
        priceMin: 1200,
        priceMax: 3500,
        duration: 120,
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Treatment & Conditioning",
        description: "Deep conditioning, keratin treatment, and nourishing hair masks delivered to your home.",
        category: "women",
        priceMin: 600,
        priceMax: 2000,
        duration: 90,
        imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Bridal & Party Hair Styling",
        description: "Elegant updos, braids, and special occasion hair styling for weddings and events.",
        category: "women",
        priceMin: 800,
        priceMax: 2500,
        duration: 90,
        imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Professional Blowdry & Styling",
        description: "Smooth, voluminous blowdry with heat protection and professional styling.",
        category: "women",
        priceMin: 250,
        priceMax: 600,
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Wash & Basic Styling",
        description: "Professional hair washing, conditioning, and basic styling service.",
        category: "women",
        priceMin: 200,
        priceMax: 450,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Hair Consultation & Advice",
        description: "Expert hair analysis, styling tips, and personalized care recommendations.",
        category: "women",
        priceMin: 150,
        priceMax: 300,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      // Kids Hair Services
      {
        name: "Kids Haircuts & Styling",
        description: "Fun and comfortable haircuts for children with patient, child-friendly stylists.",
        category: "kids",
        priceMin: 150,
        priceMax: 500,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Kids Party & Special Occasion Styling",
        description: "Special occasion hairstyles with fun braids, curls, and accessories for parties.",
        category: "kids",
        priceMin: 200,
        priceMax: 600,
        duration: 45,
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Kids Hair Wash & Conditioning",
        description: "Gentle hair washing and conditioning service specifically for children's delicate hair.",
        category: "kids",
        priceMin: 100,
        priceMax: 300,
        duration: 20,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      },
      {
        name: "Creative Braiding & Fun Styles",
        description: "Creative braids, ponytails, and fun hairstyles perfect for school and daily wear.",
        category: "kids",
        priceMin: 150,
        priceMax: 400,
        duration: 30,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
      }
    ];

    defaultServices.forEach(service => {
      const id = randomUUID();
      this.services.set(id, { ...service, id, isActive: true, imageUrl: service.imageUrl || null });
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.isActive);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.category === category && s.isActive);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { ...insertService, id, isActive: true, imageUrl: insertService.imageUrl || null };
    this.services.set(id, service);
    return service;
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.phone === phone);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      email: insertCustomer.email || null,
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.customerId === customerId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: "pending",
      totalAmount: insertBooking.totalAmount || null,
      notes: insertBooking.notes || null,
      createdAt: new Date() 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  // AI Conversations
  async getConversation(id: string): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async getConversationBySession(sessionId: string): Promise<AiConversation | undefined> {
    return Array.from(this.aiConversations.values()).find(c => c.sessionId === sessionId);
  }

  async createConversation(insertConversation: InsertAiConversation): Promise<AiConversation> {
    const id = randomUUID();
    const conversation: AiConversation = { 
      ...insertConversation, 
      id, 
      customerId: insertConversation.customerId || null,
      bookingId: insertConversation.bookingId || null,
      createdAt: new Date() 
    };
    this.aiConversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, messages: any[]): Promise<AiConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (conversation) {
      conversation.messages = messages;
      this.aiConversations.set(id, conversation);
      return conversation;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
