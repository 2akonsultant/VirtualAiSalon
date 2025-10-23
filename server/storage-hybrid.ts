import { type Service, type Customer, type Booking, type AiConversation, type ContactMessage, type User, type InsertService, type InsertCustomer, type InsertBooking, type InsertAiConversation, type InsertContactMessage, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { connectToDatabase, getCollection, toObjectId, fromObjectId, isValidObjectId } from "./db-config";

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
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // AI Conversations
  getConversation(id: string): Promise<AiConversation | undefined>;
  getConversationBySession(sessionId: string): Promise<AiConversation | undefined>;
  createConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateConversation(id: string, messages: any[]): Promise<AiConversation | undefined>;
  
  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: string, emailSent: boolean, excelUpdated: boolean): Promise<ContactMessage | undefined>;
  
  // Users (Authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  createUserWithOTP(userData: InsertUser & { otp: string; otpExpiry: Date }): Promise<User>;
  verifyUserOTP(userId: string): Promise<User | undefined>;
  incrementOTPAttempts(userId: string): Promise<void>;
  updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
}

export class HybridStorage implements IStorage {
  private services: Map<string, Service> = new Map();
  private customers: Map<string, Customer> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private aiConversations: Map<string, AiConversation> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();
  private users: Map<string, User> = new Map();
  private dbConnected = false;

  constructor() {
    this.initializeServices();
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await connectToDatabase();
      this.dbConnected = true;
      console.log('✅ MongoDB connected for hybrid storage');
      await this.loadDataFromMongoDB();
    } catch (error) {
      console.log('⚠️ MongoDB not available, using in-memory storage only');
      this.dbConnected = false;
    }
  }

  private async loadDataFromMongoDB() {
    if (!this.dbConnected) return;

    try {
      // Load services from MongoDB
      const servicesCollection = getCollection('services');
      const mongoServices = await servicesCollection.find({}).toArray();
      if (mongoServices.length > 0) {
        this.services.clear();
        mongoServices.forEach(service => {
          this.services.set(fromObjectId(service._id), {
            ...service,
            id: fromObjectId(service._id),
            _id: undefined
          } as Service);
        });
        console.log(`📋 Loaded ${mongoServices.length} services from MongoDB`);
      }

      // Load users from MongoDB
      const usersCollection = getCollection('users');
      const mongoUsers = await usersCollection.find({}).toArray();
      if (mongoUsers.length > 0) {
        this.users.clear();
        mongoUsers.forEach(user => {
          this.users.set(fromObjectId(user._id), {
            ...user,
            id: fromObjectId(user._id),
            _id: undefined
          } as User);
        });
        console.log(`👤 Loaded ${mongoUsers.length} users from MongoDB`);
      }

      // Load contact messages from MongoDB
      const messagesCollection = getCollection('contactMessages');
      const mongoMessages = await messagesCollection.find({}).toArray();
      if (mongoMessages.length > 0) {
        this.contactMessages.clear();
        mongoMessages.forEach(message => {
          this.contactMessages.set(fromObjectId(message._id), {
            ...message,
            id: fromObjectId(message._id),
            _id: undefined
          } as ContactMessage);
        });
        console.log(`💬 Loaded ${mongoMessages.length} messages from MongoDB`);
      }

      // Load bookings from MongoDB
      const bookingsCollection = getCollection('bookings');
      const mongoBookings = await bookingsCollection.find({}).toArray();
      if (mongoBookings.length > 0) {
        this.bookings.clear();
        mongoBookings.forEach(booking => {
          this.bookings.set(fromObjectId(booking._id), {
            ...booking,
            id: fromObjectId(booking._id),
            _id: undefined
          } as Booking);
        });
        console.log(`📅 Loaded ${mongoBookings.length} bookings from MongoDB`);
      }

    } catch (error) {
      console.error('❌ Error loading data from MongoDB:', error);
    }
  }

  private async saveToMongoDB(collectionName: string, data: any) {
    if (!this.dbConnected) return;

    try {
      const collection = getCollection(collectionName);
      await collection.insertOne(data);
    } catch (error) {
      console.error(`❌ Error saving to MongoDB ${collectionName}:`, error);
    }
  }

  async initializeAdminUser() {
    // Check if admin user already exists
    const existingAdmin = await this.getUserByEmail("admin@goodnessglamour.com");
    if (existingAdmin) {
      return;
    }

    // Create default admin user
    const adminUser: User = {
      id: "admin-user-001",
      email: "admin@goodnessglamour.com",
      password: "$2b$10$tB9vRCweJPklU7eRtyoDTeLEs1cRu/bdkpd.VcqyfyIb5p5rUlDfG", // "admin123" hashed
      name: "Admin User",
      phone: "9036626642",
      role: "admin",
      isVerified: true,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('users', {
        ...adminUser,
        _id: toObjectId(adminUser.id)
      });
    }
    
    console.log("✅ Default admin user created: admin@goodnessglamour.com / admin123");
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
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('services', {
        ...service,
        _id: toObjectId(id)
      });
    }
    
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
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('customers', {
        ...customer,
        _id: toObjectId(id)
      });
    }
    
    return customer;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.customerId === customerId);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
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
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('bookings', {
        ...booking,
        _id: toObjectId(id)
      });
    }
    
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
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('aiConversations', {
        ...conversation,
        _id: toObjectId(id)
      });
    }
    
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

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const contactMessage: ContactMessage = { 
      ...insertMessage, 
      id, 
      emailSent: false,
      excelUpdated: false,
      createdAt: new Date() 
    };
    this.contactMessages.set(id, contactMessage);
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('contactMessages', {
        ...contactMessage,
        _id: toObjectId(id)
      });
    }
    
    return contactMessage;
  }

  async updateContactMessageStatus(id: string, emailSent: boolean, excelUpdated: boolean): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (message) {
      message.emailSent = emailSent;
      message.excelUpdated = excelUpdated;
      this.contactMessages.set(id, message);
      return message;
    }
    return undefined;
  }

  // User methods for authentication
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: true, // Google users are pre-verified
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('users', {
        ...user,
        _id: toObjectId(id)
      });
    }
    
    return user;
  }

  async createUserWithOTP(userData: InsertUser & { otp: string; otpExpiry: Date }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: false,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    
    // Save to MongoDB if connected
    if (this.dbConnected) {
      await this.saveToMongoDB('users', {
        ...user,
        _id: toObjectId(id)
      });
    }
    
    return user;
  }

  async verifyUserOTP(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      user.updatedAt = new Date();
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async incrementOTPAttempts(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      this.users.set(userId, user);
    }
  }

  async updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.otpAttempts = 0;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates);
      user.updatedAt = new Date();
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }
}

export const storage = new HybridStorage();

// Initialize admin user after storage is created
storage.initializeAdminUser().catch(console.error);
