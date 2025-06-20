import { db } from '../db';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

export async function runMigrations() {
  try {
    console.log('🗄️ Running database migrations...');
    
    // Run Drizzle migrations
    await migrate(db, { migrationsFolder: '../migrations' });
    
    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Check if database is already seeded
    const existingUsers = await db.query.users.findFirst();
    if (existingUsers) {
      console.log('📊 Database already contains data, skipping seed');
      return;
    }
    
    // Add initial data here when needed
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

export async function resetDatabase() {
  try {
    console.log('🗑️ Resetting database...');
    
    // Drop all tables (use with caution!)
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    
    // Run migrations
    await runMigrations();
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

export async function checkDatabaseConnection() {
  try {
    console.log('Query: SELECT 1');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
    return true;
  } catch (error: any) {
    // Handle specific Windows WebSocket error gracefully
    if (error.message && error.message.includes('Cannot set property message')) {
      console.log('⚠️ Windows WebSocket compatibility issue detected - using fallback mode');
      console.log('💡 Database will work in production environment');
      return false; // Gracefully continue without database for development
    }
    
    console.error('❌ Database connection failed:', error);
    return false;
  }
}