import type { Request, Response } from 'express';
import * as authService from './auth.service.ts';
import { ApiResponse } from '../../utils/ApiResponse.ts';
import { asyncHandler } from '../../utils/asyncHandler.ts';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  ApiResponse.created(res, data, 'Registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  ApiResponse.ok(res, data, 'Login successful');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  ApiResponse.ok(res, authService.getMe(req.user));
});
