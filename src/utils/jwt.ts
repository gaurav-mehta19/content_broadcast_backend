import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { ApiError } from './ApiError.ts';

export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err: unknown) {
    if ((err as Error).name === 'TokenExpiredError') throw ApiError.unauthorized('Token expired');
    throw ApiError.unauthorized('Invalid token');
  }
};
