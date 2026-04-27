import { db } from '../config/database.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaModel = any;

interface PaginateOptions {
  where?: Record<string, unknown>;
  page?: number;
  limit?: number;
  orderBy?: Record<string, unknown>;
  include?: Record<string, unknown>;
}

export class BaseRepository {
  protected model: PrismaModel;

  constructor(model: string) {
    this.model = (db as Record<string, PrismaModel>)[model];
  }

  async create(data: Record<string, unknown>) {
    return this.model.create({ data });
  }

  async findById(id: string, include?: Record<string, unknown>) {
    return this.model.findUnique({ where: { id }, include });
  }

  async findOne(where: Record<string, unknown>, include?: Record<string, unknown>) {
    return this.model.findFirst({ where, include });
  }

  async findMany(where: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
    return this.model.findMany({ where, ...options });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.model.delete({ where: { id } });
  }

  async count(where: Record<string, unknown> = {}) {
    return this.model.count({ where });
  }

  async paginate({ where = {}, page = 1, limit = 10, orderBy = { createdAt: 'desc' }, include }: PaginateOptions = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit, orderBy, include }),
      this.model.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
