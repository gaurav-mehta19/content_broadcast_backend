import { ContentRepository } from './content.repository.ts';
import { ApiError } from '../../utils/ApiError.ts';
import { env } from '../../config/env.ts';
import { db } from '../../config/database.ts';
import { presignUrl } from '../../utils/s3Presign.ts';
import type { User } from '../../../generated/prisma/client.ts';

const repo = new ContentRepository();

interface UploadBody {
  title: string;
  description?: string;
  subject: string;
  startTime?: string;
  endTime?: string;
}

export const uploadContent = async (userId: string, body: UploadBody, file: Express.Multer.File | undefined) => {
  if (!file) throw ApiError.badRequest('File is required');

  return repo.create({
    title: body.title,
    description: body.description,
    subject: body.subject,
    filePath: (file as Express.MulterS3.File).location,
    fileType: file.mimetype,
    fileSize: file.size,
    uploadedById: userId,
    status: 'PENDING',
    startTime: body.startTime ? new Date(body.startTime) : undefined,
    endTime: body.endTime ? new Date(body.endTime) : undefined,
  });
};

export const getMyContent = async (userId: string, { status, subject, page, limit }: { status?: string; subject?: string; page?: number; limit?: number }) => {
  const where: Record<string, unknown> = { uploadedById: userId };
  if (status) where.status = status;
  if (subject) where.subject = subject;
  const { items, pagination } = await repo.paginateWithFilters({ where, page, limit });
  return { items: await Promise.all(items.map(addFileUrl)), pagination };
};

export const getContentById = async (id: string, user: Pick<User, 'id' | 'role'>) => {
  const content = await repo.findByIdWithRelations(id);
  if (!content) throw ApiError.notFound('Content not found');

  if (user.role === 'TEACHER' && content.uploadedById !== user.id) {
    throw ApiError.forbidden('You do not own this content');
  }

  return addFileUrl(content as Record<string, unknown>);
};

export const deleteContent = async (id: string, userId: string): Promise<void> => {
  const content = await repo.findById(id);
  if (!content) throw ApiError.notFound('Content not found');
  if (content.uploadedById !== userId) throw ApiError.forbidden('You do not own this content');

  await db.contentSchedule.deleteMany({ where: { contentId: id } });
  await repo.delete(id);
};

export const addFileUrl = async (content: Record<string, unknown>) => ({
  ...content,
  fileUrl: await presignUrl(content.filePath as string),
});
