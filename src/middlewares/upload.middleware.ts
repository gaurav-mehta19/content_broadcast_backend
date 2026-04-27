import type { Request, Response, NextFunction } from 'express';
import { upload } from '../config/multer.ts';
import { ApiError } from '../utils/ApiError.ts';

export const uploadSingle = (fieldName: string) => (req: Request, res: Response, next: NextFunction): void => {
  upload.single(fieldName)(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof ApiError) return next(err);
      if ((err as Record<string, unknown>).code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest(`File too large. Max ${process.env.MAX_FILE_SIZE_MB ?? 10}MB`));
      }
      return next(ApiError.badRequest((err as Error).message));
    }
    next();
  });
};
