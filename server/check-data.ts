import 'dotenv/config';
import { connectToDatabase, getCollection, closeDatabaseConnection } from './db-config';

async function checkData() {
  try {
    console.log('🔍 Checking MongoDB data...');
    
    // Connect to database
    await connectToDatabase();
    
    // Check services collection
    const servicesCollection = getCollection('services');
    const services = await servicesCollection.find({}).toArray();
    console.log(`📋 Services in MongoDB: ${services.length}`);
    if (services.length > 0) {
      console.log('Sample service:', services[0].name);
    }
    
    // Check contact messages collection
    const messagesCollection = getCollection('contactMessages');
    const messages = await messagesCollection.find({}).toArray();
    console.log(`💬 Contact messages in MongoDB: ${messages.length}`);
    if (messages.length > 0) {
      console.log('Sample message:', messages[0].name);
    }
    
    // Check bookings collection
    const bookingsCollection = getCollection('bookings');
    const bookings = await bookingsCollection.find({}).toArray();
    console.log(`📅 Bookings in MongoDB: ${bookings.length}`);
    if (bookings.length > 0) {
      console.log('Sample booking:', bookings[0]);
    }
    
    // Check users collection
    const usersCollection = getCollection('users');
    const users = await usersCollection.find({}).toArray();
    console.log(`👤 Users in MongoDB: ${users.length}`);
    if (users.length > 0) {
      console.log('Sample user:', users[0].name);
    }
    
    console.log('🎉 Data check completed!');
    
  } catch (error) {
    console.error('❌ Data check failed:', error);
  } finally {
    await closeDatabaseConnection();
  }
}

checkData();
