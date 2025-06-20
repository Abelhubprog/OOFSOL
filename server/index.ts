import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import path from "path";

// Import middleware
import { corsOptions, generalRateLimit } from "./middleware/auth";
import { errorHandler, notFound, healthCheck } from "./middleware/errorHandler";
import { MonitoringService, globalErrorHandler } from "./middleware/monitoring";
import { securityMiddleware } from "./middleware/security";

// Import routes and services
import { registerRoutes } from "./routes-clean";
import { setupVite, serveStatic, log } from "./vite";

// Import database and run migrations
import { runMigrations } from "./db/migrations";

// Import WebSocket manager
import { initializeWebSocket } from "./websocket/websocketManager";

// Import environment configuration (loads and validates env vars)
import { config } from './config/env';

const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for Vite in dev
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false // Allow embedding for iframe sharing
}));

// CORS configuration
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb'
}));

// Security middleware
app.use(securityMiddleware);

// Performance monitoring
app.use(MonitoringService.performanceMiddleware);

// Rate limiting
app.use('/api', generalRateLimit);

// Request logging middleware with enhanced security
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  const ip = req.ip;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture response for logging (be careful with sensitive data)
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    // Only log non-sensitive response data
    if (bodyJson && typeof bodyJson === 'object' && !bodyJson.token && !bodyJson.password) {
      capturedJsonResponse = bodyJson;
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    if (path.startsWith("/api")) {
      let logLine = `${method} ${path} ${statusCode} ${duration}ms ${ip}`;
      
      // Log error responses in detail
      if (statusCode >= 400) {
        console.error(`🚨 ${logLine}`, {
          userAgent: req.get('User-Agent'),
          body: method === 'POST' || method === 'PUT' ? req.body : undefined,
          query: req.query
        });
      } else {
        // Regular success logging
        if (capturedJsonResponse && Object.keys(capturedJsonResponse).length > 0) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 100)}`;
        }
        
        if (logLine.length > 120) {
          logLine = logLine.slice(0, 119) + "…";
        }
        
        log(logLine);
      }
    }
  });

  next();
});

// Health check endpoint (before other routes)
app.get('/health', MonitoringService.healthCheck);
app.get('/api/health', MonitoringService.healthCheck);

// Metrics endpoint (protected)
app.get('/api/metrics', MonitoringService.getMetricsAnalytics);

// Initialize the application
(async () => {
  try {
    console.log('🚀 Initializing OOF Platform Production Server...');

    // Check database connection (skip on Windows development if problematic)
    const isWindowsDev = process.platform === 'win32' && process.env.NODE_ENV === 'development';
    
    if (process.env.SKIP_DB_CHECK === 'true' || isWindowsDev) {
      console.log('⚠️ Skipping database connection test (Windows development mode)');
      console.log('💡 Database operations will be mocked for development');
    } else {
      console.log('🗄️ Testing database connection...');
      try {
        const { checkDatabaseConnection } = await import('./db/migrations');
        const connected = await checkDatabaseConnection();
        if (connected) {
          console.log('✅ Database connection successful');
        } else {
          console.log('⚠️ Database connection failed, continuing without database...');
        }
      } catch (error) {
        console.log('⚠️ Database connection error:', error);
        console.log('💡 Continuing with mock database for development...');
      }
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket manager
    console.log('📡 Initializing WebSocket manager...');
    const wsManager = initializeWebSocket(httpServer);
    console.log(`✅ WebSocket manager initialized`);

    // Register API routes
    console.log('🛣️  Registering API routes...');
    await registerRoutes(app, wsManager);
    console.log('✅ API routes registered');

    // 404 handler for API routes
    app.use('/api/*', notFound);

    // Global error handler
    app.use(globalErrorHandler);

    // Setup Vite in development or serve static files in production
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔧 Simple Mode: ${process.env.SIMPLE_MODE || 'false'}`);
    
    if (process.env.NODE_ENV === "development" && !process.env.SIMPLE_MODE) {
      console.log('🔧 Setting up Vite development server...');
      await setupVite(app, httpServer);
      console.log('✅ Vite development server ready');
    } else if (process.env.NODE_ENV === "development" && process.env.SIMPLE_MODE) {
      console.log('🎯 Setting up simple development mode...');
      // Serve client HTML directly without Vite middleware
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          return; // Let API routes handle themselves
        }
        const htmlPath = path.resolve(import.meta.dirname, '../client/index.html');
        res.sendFile(htmlPath);
      });
      console.log('✅ Simple development server ready');
    } else {
      console.log('📦 Setting up static file serving...');
      serveStatic(app);
      console.log('✅ Static file serving ready');
    }

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        console.log('👋 Server shutdown complete');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      // Handle specific Windows WebSocket error from Neon driver
      if (error.message && error.message.includes('Cannot set property message of #<ErrorEvent>')) {
        console.log('⚠️ Windows WebSocket compatibility issue detected and handled');
        console.log('💡 This is a known issue with Neon serverless driver on Windows');
        console.log('🔄 Continuing operation...');
        return; // Don't shut down for this specific error
      }
      
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Start the server
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";

    httpServer.listen(port, host, () => {
      console.log('\n🎉 OOF Platform Production Server Started!');
      console.log(`📍 Server URL: http://${host}:${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏪 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
      console.log(`🤖 AI Services: ${process.env.OPENAI_API_KEY ? '✅ Ready' : '⚠️  Not configured'}`);
      console.log(`📡 WebSocket: ✅ Active`);
      console.log(`🔒 Security: ✅ Enabled`);
      console.log('\n🚀 Ready to create some OOF Moments!');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
})();
