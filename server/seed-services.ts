import { connectToDatabase, getCollection } from './db-config';
import { ObjectId } from 'mongodb';

interface ServiceData {
  name: string;
  description: string;
  category: 'women' | 'men' | 'kids';
  priceMin: number;
  priceMax: number;
  duration: number;
  imageUrl: string;
  popular?: boolean;
  isActive?: boolean;
}

const allServices: ServiceData[] = [
  // Women's Services (8 services)
  {
    name: "Hair Cut & Styling",
    description: "Professional haircuts, blowdry, and styling at your doorstep for all hair types.",
    category: "women",
    priceMin: 400,
    priceMax: 1200,
    duration: 60,
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    popular: true
  },
  {
    name: "Hair Coloring & Highlights",
    description: "Professional hair coloring, highlights, balayage, and ombre treatments at home.",
    category: "women",
    priceMin: 1200,
    priceMax: 3500,
    duration: 120,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    popular: true
  },
  {
    name: "Facial & Cleanup",
    description: "Deep cleansing facials, blackhead removal, and skin rejuvenation treatments.",
    category: "women",
    priceMin: 800,
    priceMax: 2000,
    duration: 90,
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    popular: true
  },
  {
    name: "Makeup & Styling",
    description: "Professional makeup application for special occasions, parties, and events.",
    category: "women",
    priceMin: 1000,
    priceMax: 3000,
    duration: 120,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    popular: true
  },
  {
    name: "Waxing & Threading",
    description: "Full body waxing, eyebrow threading, and hair removal services at home.",
    category: "women",
    priceMin: 300,
    priceMax: 1500,
    duration: 60,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Manicure & Pedicure",
    description: "Professional nail care, cuticle treatment, and nail art services.",
    category: "women",
    priceMin: 500,
    priceMax: 1200,
    duration: 90,
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Bridal Makeup",
    description: "Complete bridal makeup package with trial sessions and special occasion styling.",
    category: "women",
    priceMin: 3000,
    priceMax: 8000,
    duration: 180,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    popular: true
  },
  {
    name: "Hair Spa Treatment",
    description: "Deep conditioning, keratin treatment, and nourishing hair masks for healthy hair.",
    category: "women",
    priceMin: 800,
    priceMax: 2500,
    duration: 120,
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  
  // Kids Services (3 services)
  {
    name: "Kids Haircuts & Styling",
    description: "Fun and comfortable haircuts for children with patient, child-friendly stylists.",
    category: "kids",
    priceMin: 150,
    priceMax: 500,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    popular: true
  },
  {
    name: "Kids Party Makeup",
    description: "Special occasion makeup for kids' parties, school events, and celebrations.",
    category: "kids",
    priceMin: 300,
    priceMax: 800,
    duration: 60,
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
  }
];

async function seedServices() {
  try {
    console.log('🌱 Starting services seeding...');
    
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    
    // Get services collection
    const servicesCollection = getCollection('services');
    
    // Clear existing services
    console.log('🗑️ Clearing existing services...');
    await servicesCollection.deleteMany({});
    console.log('✅ Existing services cleared');
    
    // Insert all services
    console.log('📝 Inserting services...');
    const servicesToInsert = allServices.map(service => ({
      ...service,
      _id: new ObjectId(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await servicesCollection.insertMany(servicesToInsert);
    console.log(`✅ Successfully inserted ${result.insertedCount} services`);
    
    // Verify insertion
    const totalServices = await servicesCollection.countDocuments();
    console.log(`📊 Total services in database: ${totalServices}`);
    
    // Show services by category
    const womenServices = await servicesCollection.countDocuments({ category: 'women' });
    const menServices = await servicesCollection.countDocuments({ category: 'men' });
    const kidsServices = await servicesCollection.countDocuments({ category: 'kids' });
    
    console.log('📋 Services by category:');
    console.log(`   👩 Women: ${womenServices} services`);
    console.log(`   👨 Men: ${menServices} services`);
    console.log(`   👶 Kids: ${kidsServices} services`);
    
    // List all service names
    const allServicesInDb = await servicesCollection.find({}, { projection: { name: 1, category: 1 } }).toArray();
    console.log('\n📝 All services in database:');
    allServicesInDb.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} (${service.category})`);
    });
    
    console.log('\n🎉 Services seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedServices()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedServices, allServices };
