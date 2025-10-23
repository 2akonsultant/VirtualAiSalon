import 'dotenv/config';
import { connectToDatabase, getCollection, checkDatabaseHealth, closeDatabaseConnection } from './db-config';
import { storage } from './storage-mongodb';

/**
 * Test MongoDB connection and basic operations
 */
async function testDatabaseConnection(): Promise<void> {
  console.log('🧪 Testing MongoDB Atlas connection...');
  
  try {
    // Test connection
    await connectToDatabase();
    console.log('✅ MongoDB connection successful');
    
    // Test health check
    const isHealthy = await checkDatabaseHealth();
    if (isHealthy) {
      console.log('✅ Database health check passed');
    } else {
      throw new Error('Database health check failed');
    }
    
    // Test collections exist
    const db = getCollection('services').db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`, collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
}

/**
 * Test storage operations
 */
async function testStorageOperations(): Promise<void> {
  console.log('\n🧪 Testing storage operations...');
  
  try {
    // Test services
    console.log('📋 Testing services...');
    const services = await storage.getServices();
    console.log(`✅ Found ${services.length} services`);
    
    if (services.length > 0) {
      const firstService = services[0];
      console.log(`📝 Sample service: ${firstService.name} (${firstService.category})`);
    }
    
    // Test services by category
    const womenServices = await storage.getServicesByCategory('women');
    const kidsServices = await storage.getServicesByCategory('kids');
    console.log(`👩 Women's services: ${womenServices.length}`);
    console.log(`👶 Kids services: ${kidsServices.length}`);
    
    // Test user operations
    console.log('\n👤 Testing user operations...');
    const adminUser = await storage.getUserByEmail('admin@goodnessglamour.com');
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.name} (${adminUser.email})`);
    } else {
      console.log('⚠️ Admin user not found - will be created on first run');
    }
    
    // Test contact messages
    console.log('\n📧 Testing contact messages...');
    const messages = await storage.getContactMessages();
    console.log(`✅ Found ${messages.length} contact messages`);
    
    // Test bookings
    console.log('\n📅 Testing bookings...');
    const bookings = await storage.getBookingsByUser('test-user-id');
    console.log(`✅ Found ${bookings.length} bookings for test user`);
    
    console.log('\n✅ All storage operations completed successfully');
    
  } catch (error) {
    console.error('❌ Storage operations test failed:', error);
    throw error;
  }
}

/**
 * Test creating sample data
 */
async function testCreateSampleData(): Promise<void> {
  console.log('\n🧪 Testing sample data creation...');
  
  try {
    // Test creating a customer
    const customerData = {
      name: 'Test Customer',
      phone: '+1234567890',
      email: 'test@example.com',
      address: '123 Test Street, Test City'
    };
    
    const customer = await storage.createCustomer(customerData);
    console.log(`✅ Created customer: ${customer.name} (ID: ${customer.id})`);
    
    // Test creating a contact message
    const messageData = {
      name: 'Test User',
      phone: '+1234567890',
      serviceInterest: 'Hair Cut & Styling',
      address: '123 Test Street',
      message: 'This is a test message'
    };
    
    const message = await storage.createContactMessage(messageData);
    console.log(`✅ Created contact message: ${message.name} (ID: ${message.id})`);
    
    // Test creating a booking
    const services = await storage.getServices();
    if (services.length > 0) {
      const bookingData = {
        customerId: customer.id,
        serviceIds: [services[0].id],
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        totalAmount: services[0].priceMin,
        notes: 'Test booking'
      };
      
      const booking = await storage.createBooking(bookingData);
      console.log(`✅ Created booking: ${booking.id} for ${customer.name}`);
    }
    
    console.log('✅ Sample data creation completed successfully');
    
  } catch (error) {
    console.error('❌ Sample data creation test failed:', error);
    throw error;
  }
}

/**
 * Test database indexes
 */
async function testDatabaseIndexes(): Promise<void> {
  console.log('\n🧪 Testing database indexes...');
  
  try {
    const db = getCollection('services').db;
    
    // Check indexes on different collections
    const collections = ['services', 'users', 'bookings', 'contactMessages', 'aiConversations'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`📊 ${collectionName}: ${indexes.length} indexes`);
      
      // Log index details
      indexes.forEach(index => {
        const keys = Object.keys(index.key).join(', ');
        console.log(`  - ${index.name}: ${keys} (unique: ${index.unique || false})`);
      });
    }
    
    console.log('✅ Database indexes test completed');
    
  } catch (error) {
    console.error('❌ Database indexes test failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting MongoDB Atlas integration tests...\n');
  
  try {
    // Test 1: Database connection
    await testDatabaseConnection();
    
    // Test 2: Storage operations
    await testStorageOperations();
    
    // Test 3: Sample data creation
    await testCreateSampleData();
    
    // Test 4: Database indexes
    await testDatabaseIndexes();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ MongoDB Atlas integration is working correctly');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabaseConnection();
    console.log('\n🔌 Database connection closed');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      console.log('\n✨ Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { runAllTests, testDatabaseConnection, testStorageOperations, testCreateSampleData, testDatabaseIndexes };
