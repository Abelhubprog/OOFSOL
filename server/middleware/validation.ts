import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { badRequest } from './errorHandler';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        next(badRequest(`Validation error: ${errorMessage}`));
      } else {
        next(badRequest('Invalid request format'));
      }
    }
  };
};

// Wallet address validation
export const walletAddressSchema = z.string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana wallet address');

// User registration/update schemas
export const userRegistrationSchema = z.object({
  body: z.object({
    walletAddress: walletAddressSchema,
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    signature: z.string().min(1),
    message: z.string().min(1)
  })
});

export const userUpdateSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    email: z.string().email().optional()
  })
});

// OOF Moments schemas
export const createOOFMomentSchema = z.object({
  body: z.object({
    walletAddress: walletAddressSchema.optional(),
    momentType: z.enum(['PAPER_HANDS', 'DIAMOND_HANDS', 'RUGPULL_SURVIVOR', 'WHALE_WATCHER', 'DUST_COLLECTOR']),
    customPrompt: z.string().max(500).optional()
  })
});

export const oofMomentInteractionSchema = z.object({
  params: z.object({
    momentId: z.string().uuid()
  }),
  body: z.object({
    action: z.enum(['LIKE', 'UNLIKE', 'SHARE', 'COMMENT']),
    comment: z.string().max(500).optional()
  })
});

// Token advertising schemas
export const createTokenAdSchema = z.object({
  body: z.object({
    tokenAddress: walletAddressSchema,
    tokenName: z.string().min(1).max(100),
    tokenSymbol: z.string().min(1).max(20),
    description: z.string().min(10).max(500),
    websiteUrl: z.string().url().optional(),
    twitterUrl: z.string().url().optional(),
    telegramUrl: z.string().url().optional(),
    logoUrl: z.string().url(),
    duration: z.number().min(30).max(1440),
    paymentTxHash: z.string().min(1)
  })
});

// Generic pagination schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    sort: z.enum(['newest', 'oldest', 'popular', 'trending']).default('newest')
  })
});

// Export validation middleware for common use cases
export const validateUserRegistration = validate(userRegistrationSchema);
export const validateUserUpdate = validate(userUpdateSchema);
export const validateCreateOOFMoment = validate(createOOFMomentSchema);
export const validateOOFMomentInteraction = validate(oofMomentInteractionSchema);
export const validateCreateTokenAd = validate(createTokenAdSchema);

// Additional validation helpers for production routes
export const validateInput = validate;
export const validateBody = (schema: z.ZodSchema) => validate(z.object({ body: schema }));
export const validateQuery = (schema: z.ZodSchema) => validate(z.object({ query: schema }));
export const validateParams = (schema: z.ZodSchema) => validate(z.object({ params: schema }));

// Async error handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
export const validatePagination = validate(paginationSchema);