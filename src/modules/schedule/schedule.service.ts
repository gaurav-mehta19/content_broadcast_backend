import { ScheduleRepository } from './schedule.repository.ts';
import { ContentRepository } from '../content/content.repository.ts';
import { ApiError } from '../../utils/ApiError.ts';

const scheduleRepo = new ScheduleRepository();
const contentRepo = new ContentRepository();

export const createSchedule = async (userId: string, { contentId, duration, rotationOrder }: { contentId: string; duration: number; rotationOrder?: number }) => {
  const content = await contentRepo.findById(contentId);
  if (!content) throw ApiError.notFound('Content not found');
  if (content.uploadedById !== userId) throw ApiError.forbidden('You do not own this content');
  if (content.status !== 'APPROVED') throw ApiError.badRequest('Only approved content can be scheduled');

  const existing = await scheduleRepo.findByContentId(contentId);
  if (existing) throw ApiError.conflict('Content is already scheduled');

  const slot = await scheduleRepo.getOrCreateSlot(content.subject);

  const order = rotationOrder !== undefined
    ? rotationOrder
    : (await scheduleRepo.getMaxRotationOrder(slot.id)) + 1;

  return scheduleRepo.create({ contentId, slotId: slot.id, rotationOrder: order, duration });
};

export const getSubjectSchedule = async (subject: string) => {
  const slot = await scheduleRepo.findSlotBySubject(subject.toLowerCase());
  if (!slot) return [];
  return scheduleRepo.getSlotSchedules(slot.id);
};

export const deleteSchedule = async (scheduleId: string, userId: string) => {
  const schedule = await scheduleRepo.findById(scheduleId);
  if (!schedule) throw ApiError.notFound('Schedule not found');

  const content = await contentRepo.findById(schedule.contentId);
  if (content.uploadedById !== userId) throw ApiError.forbidden('You do not own this schedule');

  return scheduleRepo.delete(scheduleId);
};
