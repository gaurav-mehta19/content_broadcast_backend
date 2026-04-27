import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { ApiError } from '../utils/ApiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { db } from '../config/database.ts';

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw ApiError.unauthorized();

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

export const authorize = (...roles: string[]) => (req: Request, _res: Response, next: NextFunction): void => {
  if (!roles.includes(req.user?.role)) throw ApiError.forbidden();
  next();
};
