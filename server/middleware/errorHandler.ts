import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500, code?: string): CustomError => {
  return new CustomError(message, statusCode, code);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = createError(message, 404, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === '11000') {
    const message = 'Duplicate field value entered';
    error = createError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    error = createError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = createError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = createError(message, 401, 'TOKEN_EXPIRED');
  }

  // Database connection errors
  if (err.message?.includes('connect ECONNREFUSED')) {
    const message = 'Database connection error';
    error = createError(message, 503, 'DATABASE_ERROR');
  }

  // Rate limiting errors
  if (err.message?.includes('Too many requests')) {
    error.statusCode = 429;
    error.code = 'RATE_LIMIT_EXCEEDED';
  }

  const statusCode = error.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse: any = {
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_ERROR',
      statusCode
    }
  };

  // Include stack trace in development
  if (isDevelopment) {
    errorResponse.error.stack = error.stack;
    errorResponse.error.details = {
      url: req.originalUrl,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Specific error creators
export const badRequest = (message: string = 'Bad Request') => 
  createError(message, 400, 'BAD_REQUEST');

export const unauthorized = (message: string = 'Unauthorized') => 
  createError(message, 401, 'UNAUTHORIZED');

export const forbidden = (message: string = 'Forbidden') => 
  createError(message, 403, 'FORBIDDEN');

export const notFoundError = (message: string = 'Not Found') => 
  createError(message, 404, 'NOT_FOUND');

export const conflict = (message: string = 'Conflict') => 
  createError(message, 409, 'CONFLICT');

export const tooManyRequests = (message: string = 'Too Many Requests') => 
  createError(message, 429, 'RATE_LIMIT_EXCEEDED');

export const internalServerError = (message: string = 'Internal Server Error') => 
  createError(message, 500, 'INTERNAL_ERROR');

export const serviceUnavailable = (message: string = 'Service Unavailable') => 
  createError(message, 503, 'SERVICE_UNAVAILABLE');

// Health check middleware
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'OOF Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
};