import type { Request, Response } from 'express';
import * as contentService from './content.service.ts';
import { ApiResponse } from '../../utils/ApiResponse.ts';
import { asyncHandler } from '../../utils/asyncHandler.ts';

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const content = await contentService.uploadContent(req.user.id, req.body, req.file);
  ApiResponse.created(res, content, 'Content uploaded successfully');
});

export const myContent = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await contentService.getMyContent(req.user.id, req.query);
  ApiResponse.paginated(res, items, pagination);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const content = await contentService.getContentById(req.params.id as string, req.user);
  ApiResponse.ok(res, content);
});

export const deleteContent = asyncHandler(async (req: Request, res: Response) => {
  await contentService.deleteContent(req.params.id as string, req.user.id);
  ApiResponse.ok(res, null, 'Content deleted');
});
