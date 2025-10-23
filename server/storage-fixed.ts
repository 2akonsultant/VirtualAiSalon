// Import MongoDB storage implementation
import { MongoStorage, storage } from './storage-mongodb';

// Define the interface locally
export interface IStorage {
  // Services
  getServices(): Promise<any[]>;
  getServicesByCategory(category: string): Promise<any[]>;
  getService(id: string): Promise<any | undefined>;
  createService(service: any): Promise<any>;
  
  // Customers
  getCustomer(id: string): Promise<any | undefined>;
  getCustomerByPhone(phone: string): Promise<any | undefined>;
  createCustomer(customer: any): Promise<any>;
  
  // Bookings
  getBooking(id: string): Promise<any | undefined>;
  getBookingsByCustomer(customerId: string): Promise<any[]>;
  getBookingsByUser(userId: string): Promise<any[]>;
  createBooking(booking: any): Promise<any>;
  updateBookingStatus(id: string, status: string): Promise<any | undefined>;
  
  // AI Conversations
  getConversation(id: string): Promise<any | undefined>;
  getConversationBySession(sessionId: string): Promise<any | undefined>;
  createConversation(conversation: any): Promise<any>;
  updateConversation(id: string, messages: any[]): Promise<any | undefined>;
  
  // Contact Messages
  getContactMessages(): Promise<any[]>;
  getContactMessage(id: string): Promise<any | undefined>;
  createContactMessage(message: any): Promise<any>;
  updateContactMessageStatus(id: string, emailSent: boolean, excelUpdated: boolean): Promise<any | undefined>;
  
  // Users (Authentication)
  getUser(id: string): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(userData: any): Promise<any>;
  createUserWithOTP(userData: any): Promise<any>;
  verifyUserOTP(userId: string): Promise<any | undefined>;
  incrementOTPAttempts(userId: string): Promise<void>;
  updateUserOTP(userId: string, otp: string, otpExpiry: Date): Promise<void>;
  updateUser(id: string, updates: any): Promise<any | undefined>;
}

// Re-export with proper names
export { MongoStorage as MemStorage };
export { storage };
