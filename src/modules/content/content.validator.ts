import { z } from 'zod';

export const uploadContentSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  subject: z.string().min(1).max(100).toLowerCase().trim(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).refine((d) => {
  if (d.startTime && d.endTime) return new Date(d.startTime) < new Date(d.endTime);
  return true;
}, { message: 'startTime must be before endTime', path: ['startTime'] });

export const listContentQuerySchema = z.object({
  status: z.enum(['UPLOADED', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  subject: z.string().toLowerCase().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type UploadContentInput = z.infer<typeof uploadContentSchema>;
export type ListContentQuery = z.infer<typeof listContentQuerySchema>;
