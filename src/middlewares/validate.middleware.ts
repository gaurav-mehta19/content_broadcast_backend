import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError.ts';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    req[source] = result.data;
    next();
  };
