import { BaseRepository } from '../../utils/BaseRepository.ts';

const CONTENT_INCLUDE = {
  uploadedBy: { select: { id: true, name: true, email: true, role: true } },
  approvedBy: { select: { id: true, name: true, email: true, role: true } },
  schedule: { include: { slot: true } },
};

export class ContentRepository extends BaseRepository {
  constructor() {
    super('content');
  }

  async findByIdWithRelations(id: string) {
    return this.model.findUnique({ where: { id }, include: CONTENT_INCLUDE });
  }

  async paginateWithFilters({ where, page, limit }: { where: Record<string, unknown>; page?: number; limit?: number }) {
    return this.paginate({ where, page, limit, include: CONTENT_INCLUDE, orderBy: { createdAt: 'desc' } });
  }
}
