import { z } from 'zod';

export const rejectSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(500).trim(),
});

export const allContentQuerySchema = z.object({
  status: z.enum(['UPLOADED', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  subject: z.string().toLowerCase().optional(),
  teacherId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
