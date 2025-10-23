import { connectToDatabase, getCollection } from './db-config';
import { ObjectId } from 'mongodb';

/**
 * Initialize database with indexes and default data
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing MongoDB database...');
    
    // Connect to database
    await connectToDatabase();
    
    // Create indexes for better performance
    await createIndexes();
    
    // Initialize default data
    await initializeDefaultData();
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create database indexes for optimal performance
 */
async function createIndexes(): Promise<void> {
  try {
    console.log('📊 Creating database indexes...');
    
    // Bookings collection indexes
    const bookingsCollection = getCollection('bookings');
    await bookingsCollection.createIndex({ email: 1 });
    await bookingsCollection.createIndex({ appointmentDate: 1 });
    await bookingsCollection.createIndex({ status: 1 });
    await bookingsCollection.createIndex({ userId: 1 });
    await bookingsCollection.createIndex({ customerId: 1 });
    await bookingsCollection.createIndex({ createdAt: -1 });
    
    // Users collection indexes
    const usersCollection = getCollection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ googleId: 1 });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ isVerified: 1 });
    
    // Services collection indexes
    const servicesCollection = getCollection('services');
    await servicesCollection.createIndex({ category: 1 });
    await servicesCollection.createIndex({ isActive: 1 });
    await servicesCollection.createIndex({ name: 1 });
    
    // Contact messages collection indexes
    const contactMessagesCollection = getCollection('contactMessages');
    await contactMessagesCollection.createIndex({ createdAt: -1 });
    await contactMessagesCollection.createIndex({ emailSent: 1 });
    await contactMessagesCollection.createIndex({ excelUpdated: 1 });
    
    // AI conversations collection indexes
    const aiConversationsCollection = getCollection('aiConversations');
    await aiConversationsCollection.createIndex({ sessionId: 1 });
    await aiConversationsCollection.createIndex({ customerId: 1 });
    await aiConversationsCollection.createIndex({ bookingId: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

/**
 * Initialize default data (services and admin user)
 */
async function initializeDefaultData(): Promise<void> {
  try {
    console.log('📝 Initializing default data...');
    
    // Initialize default services
    await initializeDefaultServices();
    
    // Initialize admin user
    await initializeAdminUser();
    
    console.log('✅ Default data initialized');
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
    throw error;
  }
}

/**
 * Initialize default services
 */
async function initializeDefaultServices(): Promise<void> {
  const servicesCollection = getCollection('services');
  
  // Check if services already exist
  const existingServices = await servicesCollection.countDocuments();
  if (existingServices > 0) {
    console.log('📋 Services already exist, skipping initialization');
    return;
  }
  
  const defaultServices = [
    // Women's Hair Services
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
      name: "Hair Treatment & Conditioning",
      description: "Deep conditioning, keratin treatment, and nourishing hair masks delivered to your home.",
      category: "women",
      priceMin: 600,
      priceMax: 2000,
      duration: 90,
      imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Bridal & Party Hair Styling",
      description: "Elegant updos, braids, and special occasion hair styling for weddings and events.",
      category: "women",
      priceMin: 800,
      priceMax: 2500,
      duration: 90,
      imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Professional Blowdry & Styling",
      description: "Smooth, voluminous blowdry with heat protection and professional styling.",
      category: "women",
      priceMin: 250,
      priceMax: 600,
      duration: 45,
      imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Hair Wash & Basic Styling",
      description: "Professional hair washing, conditioning, and basic styling service.",
      category: "women",
      priceMin: 200,
      priceMax: 450,
      duration: 30,
      imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Hair Consultation & Advice",
      description: "Expert hair analysis, styling tips, and personalized care recommendations.",
      category: "women",
      priceMin: 150,
      priceMax: 300,
      duration: 30,
      imageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    // Kids Hair Services
    {
      name: "Kids Haircuts & Styling",
      description: "Fun and comfortable haircuts for children with patient, child-friendly stylists.",
      category: "kids",
      priceMin: 150,
      priceMax: 500,
      duration: 30,
      imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Kids Party & Special Occasion Styling",
      description: "Special occasion hairstyles with fun braids, curls, and accessories for parties.",
      category: "kids",
      priceMin: 200,
      priceMax: 600,
      duration: 45,
      imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Kids Hair Wash & Conditioning",
      description: "Gentle hair washing and conditioning service specifically for children's delicate hair.",
      category: "kids",
      priceMin: 100,
      priceMax: 300,
      duration: 20,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    },
    {
      name: "Creative Braiding & Fun Styles",
      description: "Creative braids, ponytails, and fun hairstyles perfect for school and daily wear.",
      category: "kids",
      priceMin: 150,
      priceMax: 400,
      duration: 30,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      isActive: true
    }
  ];
  
  await servicesCollection.insertMany(defaultServices);
  console.log(`✅ Inserted ${defaultServices.length} default services`);
}

/**
 * Initialize admin user
 */
async function initializeAdminUser(): Promise<void> {
  const usersCollection = getCollection('users');
  
  // Check if admin user already exists
  const existingAdmin = await usersCollection.findOne({ email: "admin@goodnessglamour.com" });
  if (existingAdmin) {
    console.log('👤 Admin user already exists');
    return;
  }
  
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
  console.log('✅ Default admin user created: admin@goodnessglamour.com / admin123');
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}
