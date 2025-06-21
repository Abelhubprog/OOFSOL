import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod'; // Import AnyZodObject
import { badRequest } from './errorHandler';

// Generic validation middleware that can parse specific parts of the request
export const validateRequest = (schema: AnyZodObject, part: 'body' | 'query' | 'params') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate;
      switch (part) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          // This should not happen if used correctly
          return next(badRequest('Invalid validation part specified by server configuration.'));
      }

      const parsedData = await schema.parseAsync(dataToValidate);

      // Assign parsed (and potentially transformed) data back to the correct request part
      if (part === 'body') req.body = parsedData;
      else if (part === 'query') req.query = parsedData as any; // Cast needed as req.query is ParsedQs
      else if (part === 'params') req.params = parsedData as any; // Cast needed as req.params is core.ParamsDictionary

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map(err => `${err.path.join('.') || part}: ${err.message}`) // Clarify path
          .join(', ');
        return next(badRequest(`Validation error: ${errorMessage}`)); // Use error handler
      }
      // Handle unexpected errors during validation
      console.error(`Unexpected validation error for request ${part}:`, error);
      return next(badRequest(`Internal server error during ${part} validation.`));
    }
};

// Re-exporting schemas from shared/schema.ts for use in routes.ts might be cleaner,
// but if they are defined here, ensure they are correctly structured.
// The existing schemas (userRegistrationSchema, etc.) are structured to parse req.body, req.query, req.params directly.
// The new `validateRequest` function expects a schema for a *specific part* of the request.
// So, we'll adapt or use the schemas from `shared/schema.ts` directly in routes.

// Example (if you want to keep specific exported validators):
// import {
//   paginationSchema as sharedPaginationSchema, // from shared/schema
//   oofMomentAnalysisRequestSchema as sharedOofMomentAnalysisRequestSchema
// } from '@shared/schema';

// export const validatePaginationQuery = validateRequest(sharedPaginationSchema.shape.query, 'query');
// export const validateOofMomentAnalysisBody = validateRequest(sharedOofMomentAnalysisRequestSchema, 'body');


// The existing asyncHandler seems fine.
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};