import type { Request, Response } from 'express';
import * as scheduleService from './schedule.service.ts';
import { ApiResponse } from '../../utils/ApiResponse.ts';
import { asyncHandler } from '../../utils/asyncHandler.ts';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await scheduleService.createSchedule(req.user.id, req.body);
  ApiResponse.created(res, schedule, 'Schedule created');
});

export const getBySubject = asyncHandler(async (req: Request, res: Response) => {
  const schedules = await scheduleService.getSubjectSchedule(req.params.subject as string);
  ApiResponse.ok(res, schedules);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await scheduleService.deleteSchedule(req.params.id as string, req.user.id);
  ApiResponse.ok(res, null, 'Schedule removed');
});
