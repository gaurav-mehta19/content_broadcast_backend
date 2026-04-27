import { ContentRepository } from '../content/content.repository.ts';
import { addFileUrl } from '../content/content.service.ts';
import { ApiError } from '../../utils/ApiError.ts';
import { redis } from '../../config/redis.ts';

const repo = new ContentRepository();

const invalidateLiveCache = async (teacherId: string) => {
  if (!redis) return;
  // Delete all live cache keys for this teacher (with and without subject filter)
  const keys = await redis.keys(`live:${teacherId}*`).catch(() => [] as string[]);
  if (keys.length) await redis.del(...keys).catch(() => null);
};

export const getPendingContent = async ({ page, limit }: { page?: number; limit?: number }) => {
  const { items, pagination } = await repo.paginateWithFilters({ where: { status: 'PENDING' }, page, limit });
  return { items: await Promise.all(items.map(addFileUrl)), pagination };
};

export const getAllContent = async ({ status, subject, teacherId, page, limit }: { status?: string; subject?: string; teacherId?: string; page?: number; limit?: number }) => {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (subject) where.subject = subject;
  if (teacherId) where.uploadedById = teacherId;

  const { items, pagination } = await repo.paginateWithFilters({ where, page, limit });
  return { items: await Promise.all(items.map(addFileUrl)), pagination };
};

export const approveContent = async (id: string, principalId: string) => {
  const content = await repo.findById(id);
  if (!content) throw ApiError.notFound('Content not found');
  if (content.status === 'APPROVED') throw ApiError.badRequest('Content is already approved');

  const updated = await repo.update(id, {
    status: 'APPROVED',
    approvedById: principalId,
    approvedAt: new Date(),
    rejectionReason: null,
  });

  await invalidateLiveCache(content.uploadedById);
  return updated;
};

export const rejectContent = async (id: string, principalId: string, rejectionReason: string) => {
  const content = await repo.findById(id);
  if (!content) throw ApiError.notFound('Content not found');

  const updated = await repo.update(id, {
    status: 'REJECTED',
    approvedById: principalId,
    rejectionReason,
  });

  await invalidateLiveCache(content.uploadedById);
  return updated;
};
