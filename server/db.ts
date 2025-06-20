import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from './config/env';

// Configure Neon for better Windows compatibility
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;

// Windows-specific WebSocket error handler
const originalConsoleError = console.error;
const suppressWebSocketErrors = (message: any, ...args: any[]) => {
  // Suppress specific WebSocket error messages that are causing crashes
  if (typeof message === 'string' && 
      (message.includes('Cannot set property message') || 
       message.includes('ErrorEvent') ||
       message.includes('_connectionCallback'))) {
    return; // Silently ignore these Windows-specific errors
  }
  originalConsoleError(message, ...args);
};

// Temporarily override console.error during database initialization
console.error = suppressWebSocketErrors;

// Add error handling for Windows environment
let pool: Pool;
let db: any;

try {
  pool = new Pool({ 
    connectionString: config.database.url,
    max: 3, // Reduced for stability
    idleTimeoutMillis: 30000, // Increased timeout
    connectionTimeoutMillis: 15000, // Increased timeout
    // Add retry configuration
    acquireTimeoutMillis: 10000,
    createRetryIntervalMillis: 2000,
    createTimeoutMillis: 30000,
  });

  db = drizzle({ 
    client: pool, 
    schema,
    logger: false // Disable logging to reduce issues
  });

  console.log('🔗 Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error);
  
  // Fallback configuration with minimal settings
  pool = new Pool({ 
    connectionString: config.database.url,
    max: 1,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 15000,
    acquireTimeoutMillis: 8000,
  });

  db = drizzle({ 
    client: pool, 
    schema,
    logger: false
  });
  
  console.log('⚠️ Using fallback database configuration');
}

// Restore original console.error after initialization
setTimeout(() => {
  console.error = originalConsoleError;
}, 2000); // Give enough time for initial connection attempts

export { pool, db };

export * from "@shared/schema";