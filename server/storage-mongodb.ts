import { type Service, type Customer, type Booking, type AiConversation, type ContactMessage, type User, type InsertService, type InsertCustomer, type InsertBooking, type InsertAiConversation, type InsertContactMessage, type InsertUser } from "@shared/schema";
import { getCollection, toObjectId, fromObjectId, isValidObjectId } from "./db-config";
import { ObjectId } from "mongodb";

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

export class MongoStorage implements IStorage {
  private get servicesCollection() { return getCollection<Service>('services'); }
  private get customersCollection() { return getCollection<Customer>('customers'); }
  private get bookingsCollection() { return getCollection<Booking>('bookings'); }
  private get aiConversationsCollection() { return getCollection<AiConversation>('aiConversations'); }
  private get contactMessagesCollection() { return getCollection<ContactMessage>('contactMessages'); }
  private get usersCollection() { return getCollection<User>('users'); }

  async initializeAdminUser() {
    // Check if admin user already exists
    const existingAdmin = await this.getUserByEmail("admin@goodnessglamour.com");
    if (existingAdmin) {
      return;
    }

    // Create default admin user
    const adminUser: InsertUser = {
      email: "admin@goodnessglamour.com",
      password: "$2b$10$tB9vRCweJPklU7eRtyoDTeLEs1cRu/bdkpd.VcqyfyIb5p5rUlDfG", // "admin123" hashed
      name: "Admin User",
      phone: "9036626642",
      role: "admin",
    };

    await this.createUser(adminUser);
    console.log("✅ Default admin user created: admin@goodnessglamour.com / admin123");
  }

  // Services
  async getServices(): Promise<Service[]> {
    const services = await this.servicesCollection.find({ isActive: true }).toArray();
    return services.map(service => ({
      ...service,
      id: fromObjectId(service._id),
      _id: undefined
    } as Service));
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const services = await this.servicesCollection.find({ 
      category, 
      isActive: true 
    }).toArray();
    return services.map(service => ({
      ...service,
      id: fromObjectId(service._id),
      _id: undefined
    } as Service));
  }

  async getService(id: string): Promise<Service | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const service = await this.servicesCollection.findOne({ _id: toObjectId(id) });
    if (!service) {
      return undefined;
    }
    
    return {
      ...service,
      id: fromObjectId(service._id),
      _id: undefined
    } as Service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const result = await this.servicesCollection.insertOne({
      ...insertService,
      isActive: true,
      imageUrl: insertService.imageUrl || null
    });
    
    return {
      ...insertService,
      id: fromObjectId(result.insertedId),
      isActive: true,
      imageUrl: insertService.imageUrl || null
    };
  }

  // Customers
  async getCustomer(id: string): Promise<Customer | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const customer = await this.customersCollection.findOne({ _id: toObjectId(id) });
    if (!customer) {
      return undefined;
    }
    
    return {
      ...customer,
      id: fromObjectId(customer._id),
      _id: undefined
    } as Customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await this.customersCollection.findOne({ phone });
    if (!customer) {
      return undefined;
    }
    
    return {
      ...customer,
      id: fromObjectId(customer._id),
      _id: undefined
    } as Customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await this.customersCollection.insertOne({
      ...insertCustomer,
      email: insertCustomer.email || null,
      createdAt: new Date()
    });
    
    return {
      ...insertCustomer,
      id: fromObjectId(result.insertedId),
      email: insertCustomer.email || null,
      createdAt: new Date()
    };
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const booking = await this.bookingsCollection.findOne({ _id: toObjectId(id) });
    if (!booking) {
      return undefined;
    }
    
    return {
      ...booking,
      id: fromObjectId(booking._id),
      _id: undefined
    } as Booking;
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    if (!isValidObjectId(customerId)) {
      return [];
    }
    
    const bookings = await this.bookingsCollection.find({ 
      customerId: toObjectId(customerId) 
    }).toArray();
    
    return bookings.map(booking => ({
      ...booking,
      id: fromObjectId(booking._id),
      _id: undefined
    } as Booking));
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }
    
    const bookings = await this.bookingsCollection.find({ 
      userId: toObjectId(userId) 
    }).toArray();
    
    return bookings.map(booking => ({
      ...booking,
      id: fromObjectId(booking._id),
      _id: undefined
    } as Booking));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const bookingData: any = {
      ...insertBooking,
      status: "pending",
      totalAmount: insertBooking.totalAmount || null,
      notes: insertBooking.notes || null,
      createdAt: new Date()
    };

    // Convert string IDs to ObjectIds
    if (bookingData.customerId) {
      bookingData.customerId = toObjectId(bookingData.customerId);
    }
    if (bookingData.userId) {
      bookingData.userId = toObjectId(bookingData.userId);
    }

    const result = await this.bookingsCollection.insertOne(bookingData);
    
    return {
      ...insertBooking,
      id: fromObjectId(result.insertedId),
      status: "pending",
      totalAmount: insertBooking.totalAmount || null,
      notes: insertBooking.notes || null,
      createdAt: new Date()
    };
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const result = await this.bookingsCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return undefined;
    }
    
    return {
      ...result,
      id: fromObjectId(result._id),
      _id: undefined
    } as Booking;
  }

  // AI Conversations
  async getConversation(id: string): Promise<AiConversation | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const conversation = await this.aiConversationsCollection.findOne({ 
      _id: toObjectId(id) 
    });
    if (!conversation) {
      return undefined;
    }
    
    return {
      ...conversation,
      id: fromObjectId(conversation._id),
      _id: undefined
    } as AiConversation;
  }

  async getConversationBySession(sessionId: string): Promise<AiConversation | undefined> {
    const conversation = await this.aiConversationsCollection.findOne({ sessionId });
    if (!conversation) {
      return undefined;
    }
    
    return {
      ...conversation,
      id: fromObjectId(conversation._id),
      _id: undefined
    } as AiConversation;
  }

  async createConversation(insertConversation: InsertAiConversation): Promise<AiConversation> {
    const conversationData: any = {
      ...insertConversation,
      customerId: insertConversation.customerId ? toObjectId(insertConversation.customerId) : null,
      bookingId: insertConversation.bookingId ? toObjectId(insertConversation.bookingId) : null,
      createdAt: new Date()
    };

    const result = await this.aiConversationsCollection.insertOne(conversationData);
    
    return {
      ...insertConversation,
      id: fromObjectId(result.insertedId),
      customerId: insertConversation.customerId || null,
      bookingId: insertConversation.bookingId || null,
      createdAt: new Date()
    };
  }

  async updateConversation(id: string, messages: any[]): Promise<AiConversation | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const result = await this.aiConversationsCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { messages } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return undefined;
    }
    
    return {
      ...result,
      id: fromObjectId(result._id),
      _id: undefined
    } as AiConversation;
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    const messages = await this.contactMessagesCollection.find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return messages.map(message => ({
      ...message,
      id: fromObjectId(message._id),
      _id: undefined
    } as ContactMessage));
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const message = await this.contactMessagesCollection.findOne({ 
      _id: toObjectId(id) 
    });
    if (!message) {
      return undefined;
    }
    
    return {
      ...message,
      id: fromObjectId(message._id),
      _id: undefined
    } as ContactMessage;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const result = await this.contactMessagesCollection.insertOne({
      ...insertMessage,
      emailSent: false,
      excelUpdated: false,
      createdAt: new Date()
    });
    
    return {
      ...insertMessage,
      id: fromObjectId(result.insertedId),
      emailSent: false,
      excelUpdated: false,
      createdAt: new Date()
    };
  }

  async updateContactMessageStatus(id: string, emailSent: boolean, excelUpdated: boolean): Promise<ContactMessage | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const result = await this.contactMessagesCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: { emailSent, excelUpdated } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return undefined;
    }
    
    return {
      ...result,
      id: fromObjectId(result._id),
      _id: undefined
    } as ContactMessage;
  }

  // User methods for authentication
  async getUser(id: string): Promise<User | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const user = await this.usersCollection.findOne({ _id: toObjectId(id) });
    if (!user) {
      return undefined;
    }
    
    return {
      ...user,
      id: fromObjectId(user._id),
      _id: undefined
    } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersCollection.findOne({ email });
    if (!user) {
      return undefined;
    }
    
    return {
      ...user,
      id: fromObjectId(user._id),
      _id: undefined
    } as User;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const userDoc: any = {
      ...userData,
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: true, // Google users are pre-verified
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.usersCollection.insertOne(userDoc);
    
    return {
      ...userData,
      id: fromObjectId(result.insertedId),
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: true,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async createUserWithOTP(userData: InsertUser & { otp: string; otpExpiry: Date }): Promise<User> {
    const userDoc: any = {
      ...userData,
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: false,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.usersCollection.insertOne(userDoc);
    
    return {
      ...userData,
      id: fromObjectId(result.insertedId),
      role: userData.role || null,
      phone: userData.phone || null,
      isVerified: false,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async verifyUserOTP(userId: string): Promise<User | undefined> {
    if (!isValidObjectId(userId)) {
      return undefined;
    }
    
    const result = await this.usersCollection.findOneAndUpdate(
      { _id: toObjectId(userId) },
      { 
        $set: { 
          isVerified: true,
          otp: null,
          otpExpiry: null,
          otpAttempts: 0,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return undefined;
    }
    
    return {
      ...result,
      id: fromObjectId(result._id),
      _id: undefined
    } as User;
  }

  async incrementOTPAttempts(userId: string): Promise<void> {
    if (!isValidObjectId(userId)) {
      return;
    }
    
    await this.usersCollection.updateOne(
      { _id: toObjectId(userId) },
      { 
        $inc: { otpAttempts: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }

  async updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void> {
    if (!isValidObjectId(userId)) {
      return;
    }
    
    await this.usersCollection.updateOne(
      { _id: toObjectId(userId) },
      { 
        $set: { 
          otp,
          otpExpiry,
          otpAttempts: 0,
          updatedAt: new Date()
        } 
      }
    );
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (!isValidObjectId(id)) {
      return undefined;
    }
    
    const result = await this.usersCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return undefined;
    }
    
    return {
      ...result,
      id: fromObjectId(result._id),
      _id: undefined
    } as User;
  }
}

export const storage = new MongoStorage();
