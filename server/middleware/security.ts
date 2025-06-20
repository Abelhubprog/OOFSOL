import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import crypto from 'crypto';
import { validateWalletAddress } from './auth';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Request validation middleware
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check for required headers
    if (!req.headers['content-type'] && req.method !== 'GET') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type header is required'
      });
      return;
    }

    // Validate JSON payload size
    if (req.body && JSON.stringify(req.body).length > 1048576) { // 1MB limit
      res.status(413).json({
        error: 'Payload Too Large',
        message: 'Request body exceeds size limit'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid request format'
    });
  }
};

// Wallet signature verification middleware
export const verifyWalletSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing wallet verification data'
      });
      return;
    }

    if (!validateWalletAddress(walletAddress)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid wallet address format'
      });
      return;
    }

    // TODO: Implement actual signature verification using nacl or similar
    // For now, we'll accept any signature for development
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Wallet signature verification failed'
    });
  }
};

// Input sanitization middleware
export const sanitizeInputs = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .trim()
          .replace(/[<>]/g, '')
          .substring(0, 1000);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Input sanitization failed'
    });
  }
};

// API key validation middleware
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.header('X-API-Key');
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
    return;
  }

  next();
};

// Request logging middleware
export const logRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to response headers
  res.set('X-Request-ID', requestId);
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${requestId} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't leak sensitive information in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack })
  });
};

// Health check middleware
export const healthCheck = (
  req: Request,
  res: Response
): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
};

// Combined security middleware
export const securityMiddleware = [
  securityHeaders,
  validateRequest,
  sanitizeInputs,
  logRequest
];