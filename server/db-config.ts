import { MongoClient, Db, ObjectId } from 'mongodb';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://virtualsalon:Salon%40123@virtualsalon.hgej3ip.mongodb.net/?retryWrites=true&w=majority&appName=VirtualSalon';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'VirtualSalon_db';

// Global connection variables
let client: MongoClient;
let db: Db;

/**
 * Initialize MongoDB connection
 */
export async function connectToDatabase(): Promise<Db> {
  try {
    if (db) {
      return db;
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    
    // Test the connection
    await db.admin().ping();
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📊 Database: ${MONGODB_DB_NAME}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

/**
 * Get a collection from the database
 */
export function getCollection<T = any>(collectionName: string) {
  const database = getDatabase();
  return database.collection<T>(collectionName);
}

/**
 * Close the database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
}

/**
 * Convert string ID to ObjectId
 */
export function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
}

/**
 * Convert ObjectId to string
 */
export function fromObjectId(objectId: ObjectId): string {
  return objectId.toString();
}

/**
 * Check if a string is a valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Closing MongoDB connection...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Closing MongoDB connection...');
  await closeDatabaseConnection();
  process.exit(0);
});
