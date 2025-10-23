import 'dotenv/config';
import { connectToDatabase, checkDatabaseHealth, closeDatabaseConnection } from './db-config';
import { storage } from './storage-mongodb';

async function testConnection() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    // Connect to database
    await connectToDatabase();
    console.log('✅ MongoDB connected');
    
    // Test health
    const isHealthy = await checkDatabaseHealth();
    console.log(`✅ Database health: ${isHealthy}`);
    
    // Test services
    const services = await storage.getServices();
    console.log(`✅ Found ${services.length} services`);
    
    // Test contact messages
    const messages = await storage.getContactMessages();
    console.log(`✅ Found ${messages.length} contact messages`);
    
    // Test bookings
    const bookings = await storage.getBookingsByUser('test-user-id');
    console.log(`✅ Found ${bookings.length} bookings`);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await closeDatabaseConnection();
  }
}

testConnection();