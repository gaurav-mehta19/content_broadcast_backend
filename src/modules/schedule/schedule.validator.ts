import { z } from 'zod';

export const createScheduleSchema = z.object({
  contentId: z.string().uuid(),
  duration: z.number().int().min(1).max(1440),
  rotationOrder: z.number().int().min(0).optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
