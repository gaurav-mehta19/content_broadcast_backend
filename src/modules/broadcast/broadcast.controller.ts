import type { Request, Response } from 'express';
import * as broadcastService from './broadcast.service.ts';
import { asyncHandler } from '../../utils/asyncHandler.ts';
import { redis } from '../../config/redis.ts';

const cacheKey = (teacherId: string, subject?: string) =>
  subject ? `live:${teacherId}:${subject}` : `live:${teacherId}`;

export const live = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = req.params.teacherId as string;
  const subject = req.params.subject as string | undefined;
  const key = cacheKey(teacherId, subject);

  // Cache-aside: check Redis first
  if (redis) {
    const cached = await redis.get(key).catch(() => null);
    if (cached !== null) {
      return res.status(200).json(JSON.parse(cached));
    }
  }

  const result = await broadcastService.getCurrentlyActiveContent(teacherId, subject);

  const body = {
    success: true,
    data: result,
    message: result ? undefined : 'No content available',
  };

  // Store in Redis with TTL = secondsRemaining so cache expires exactly at next rotation
  if (redis && result) {
    // Cap TTL at 3500s so the cached presigned fileUrl (valid 3600s) never expires while cached
    const ttl = Math.min(Math.max(1, result.secondsRemaining), 3500);
    redis.set(key, JSON.stringify(body), 'EX', ttl).catch(() => null);
  }

  res.status(200).json(body);
});
