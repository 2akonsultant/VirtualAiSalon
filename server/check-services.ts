import { connectToDatabase, getCollection } from './db-config';

async function checkServices() {
  try {
    console.log('🔍 Checking services in MongoDB...');
    
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    
    // Get services collection
    const servicesCollection = getCollection('services');
    
    // Count total services
    const totalServices = await servicesCollection.countDocuments();
    console.log(`📊 Total services in database: ${totalServices}`);
    
    if (totalServices === 0) {
      console.log('❌ No services found in database!');
      return;
    }
    
    // Count by category
    const womenServices = await servicesCollection.countDocuments({ category: 'women' });
    const menServices = await servicesCollection.countDocuments({ category: 'men' });
    const kidsServices = await servicesCollection.countDocuments({ category: 'kids' });
    
    console.log('\n📋 Services by category:');
    console.log(`   👩 Women: ${womenServices} services`);
    console.log(`   👨 Men: ${menServices} services`);
    console.log(`   👶 Kids: ${kidsServices} services`);
    
    // List all services
    const allServices = await servicesCollection.find({}, { 
      projection: { name: 1, category: 1, priceMin: 1, priceMax: 1, isActive: 1 } 
    }).toArray();
    
    console.log('\n📝 All services in database:');
    allServices.forEach((service, index) => {
      const status = service.isActive ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${service.name} (${service.category}) - ₹${service.priceMin}-₹${service.priceMax}`);
    });
    
    // Test API endpoints
    console.log('\n🧪 Testing API endpoints...');
    
    // Test GET /api/services
    try {
      const response = await fetch('http://localhost:5000/api/services');
      if (response.ok) {
        const services = await response.json();
        console.log(`✅ GET /api/services returned ${services.length} services`);
      } else {
        console.log(`❌ GET /api/services failed with status ${response.status}`);
      }
    } catch (error) {
      console.log('❌ GET /api/services failed:', error.message);
    }
    
    // Test GET /api/services/category/women
    try {
      const response = await fetch('http://localhost:5000/api/services/category/women');
      if (response.ok) {
        const services = await response.json();
        console.log(`✅ GET /api/services/category/women returned ${services.length} services`);
      } else {
        console.log(`❌ GET /api/services/category/women failed with status ${response.status}`);
      }
    } catch (error) {
      console.log('❌ GET /api/services/category/women failed:', error.message);
    }
    
    // Test GET /api/services/category/men
    try {
      const response = await fetch('http://localhost:5000/api/services/category/men');
      if (response.ok) {
        const services = await response.json();
        console.log(`✅ GET /api/services/category/men returned ${services.length} services`);
      } else {
        console.log(`❌ GET /api/services/category/men failed with status ${response.status}`);
      }
    } catch (error) {
      console.log('❌ GET /api/services/category/men failed:', error.message);
    }
    
    // Test GET /api/services/category/kids
    try {
      const response = await fetch('http://localhost:5000/api/services/category/kids');
      if (response.ok) {
        const services = await response.json();
        console.log(`✅ GET /api/services/category/kids returned ${services.length} services`);
      } else {
        console.log(`❌ GET /api/services/category/kids failed with status ${response.status}`);
      }
    } catch (error) {
      console.log('❌ GET /api/services/category/kids failed:', error.message);
    }
    
    console.log('\n🎉 Services check completed!');
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
    throw error;
  }
}

// Run the check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkServices()
    .then(() => {
      console.log('✅ Check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

export { checkServices };
