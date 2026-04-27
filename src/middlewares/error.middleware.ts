import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.ts';
import { logger } from '../utils/logger.ts';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(`${req.method} ${req.path} — ${(err as Error).message}`, { stack: (err as Error).stack });

  if ((err as Record<string, unknown>).code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ success: false, message: `File too large. Max size: ${process.env.MAX_FILE_SIZE_MB ?? 10}MB` });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors?.length ? err.errors : undefined,
    });
    return;
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
};
