import type { Request, Response } from 'express';
import * as approvalService from './approval.service.ts';
import { ApiResponse } from '../../utils/ApiResponse.ts';
import { asyncHandler } from '../../utils/asyncHandler.ts';

export const pending = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await approvalService.getPendingContent(req.query);
  ApiResponse.paginated(res, items, pagination);
});

export const all = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await approvalService.getAllContent(req.query);
  ApiResponse.paginated(res, items, pagination);
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const content = await approvalService.approveContent(req.params.id as string, req.user.id);
  ApiResponse.ok(res, content, 'Content approved');
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const content = await approvalService.rejectContent(req.params.id as string, req.user.id, req.body.rejectionReason);
  ApiResponse.ok(res, content, 'Content rejected');
});
