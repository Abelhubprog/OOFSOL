import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { DatabaseUtils } from '../db/utils';
import { db } from '../db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface User extends Omit<User, 'password'> {}
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const generateToken = (userId: string, walletAddress?: string): string => {
  return jwt.sign(
    { 
      userId, 
      walletAddress,
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token: string): { userId: string; walletAddress?: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      walletAddress: decoded.walletAddress
    };
  } catch (error) {
    return null;
  }
};

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
      return;
    }

    // Verify user exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    });
    if (!user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not found' 
      });
      return;
    }

    req.user = {
      id: user.id,
      walletAddress: user.walletAddress || undefined,
      email: user.email || undefined
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication failed' 
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, decoded.userId)
        });
        if (user) {
          req.user = {
            id: user.id,
            walletAddress: user.walletAddress || undefined,
            email: user.email || undefined
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

export const requireWallet = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.walletAddress) {
    res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Wallet connection required' 
    });
    return;
  }
  next();
};

// Rate limiting middleware
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: 'Too Many Requests',
      message: options.message || 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || 'Rate limit exceeded. Please try again later.'
      });
    }
  });
};

// Specific rate limiters for different endpoints
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP'
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth attempts per 15 minutes
  message: 'Too many authentication attempts'
});

export const oofMomentsRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OOF moment generations per hour
  message: 'Too many OOF moment generations. Please wait before creating more.'
});

export const walletAnalysisRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 wallet analyses per 5 minutes
  message: 'Too many wallet analysis requests. Please wait before analyzing more wallets.'
});

export const validateWalletAddress = (address: string): boolean => {
  // Basic Solana address validation
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};