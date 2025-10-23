import 'dotenv/config';
import { connectToDatabase, getCollection, closeDatabaseConnection } from './db-config';

async function manualInit() {
  try {
    console.log('🚀 Manual database initialization...');
    
    // Connect to database
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    
    // Initialize services
    const servicesCollection = getCollection('services');
    const existingServices = await servicesCollection.countDocuments();
    console.log(`📋 Existing services: ${existingServices}`);
    
    if (existingServices === 0) {
      console.log('📝 Adding default services...');
      const defaultServices = [
        {
          name: "Hair Cut & Styling",
          description: "Professional haircuts, blowdry, and styling at your doorstep for all hair types.",
          category: "women",
          priceMin: 400,
          priceMax: 1200,
          duration: 60,
          imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isActive: true
        },
        {
          name: "Hair Coloring & Highlights",
          description: "Professional hair coloring, highlights, balayage, and ombre treatments at home.",
          category: "women",
          priceMin: 1200,
          priceMax: 3500,
          duration: 120,
          imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isActive: true
        },
        {
          name: "Kids Haircuts & Styling",
          description: "Fun and comfortable haircuts for children with patient, child-friendly stylists.",
          category: "kids",
          priceMin: 150,
          priceMax: 500,
          duration: 30,
          imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isActive: true
        }
      ];
      
      await servicesCollection.insertMany(defaultServices);
      console.log(`✅ Added ${defaultServices.length} services`);
    }
    
    // Initialize admin user
    const usersCollection = getCollection('users');
    const existingAdmin = await usersCollection.findOne({ email: "admin@goodnessglamour.com" });
    
    if (!existingAdmin) {
      console.log('👤 Adding admin user...');
      const adminUser = {
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
      
      await usersCollection.insertOne(adminUser);
      console.log('✅ Admin user added');
    }
    
    console.log('🎉 Manual initialization completed!');
    
  } catch (error) {
    console.error('❌ Manual initialization failed:', error);
  } finally {
    await closeDatabaseConnection();
  }
}

manualInit();
