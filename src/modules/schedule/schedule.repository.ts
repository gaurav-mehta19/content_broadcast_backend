import { BaseRepository } from '../../utils/BaseRepository.ts';
import { db } from '../../config/database.ts';

export class ScheduleRepository extends BaseRepository {
  constructor() {
    super('contentSchedule');
  }

  async findSlotBySubject(subject: string) {
    return db.contentSlot.findUnique({ where: { subject } });
  }

  async createSlot(subject: string) {
    return db.contentSlot.create({ data: { subject } });
  }

  async getOrCreateSlot(subject: string) {
    const existing = await this.findSlotBySubject(subject);
    if (existing) return existing;
    return this.createSlot(subject);
  }

  async getMaxRotationOrder(slotId: string): Promise<number> {
    const result = await this.model.aggregate({
      where: { slotId },
      _max: { rotationOrder: true },
    });
    return (result._max.rotationOrder as number | null) ?? -1;
  }

  async getSlotSchedules(slotId: string) {
    return this.model.findMany({
      where: { slotId },
      include: { content: { include: { uploadedBy: { select: { id: true, name: true } } } } },
      orderBy: { rotationOrder: 'asc' },
    });
  }

  async findByContentId(contentId: string) {
    return this.model.findUnique({ where: { contentId } });
  }
}
