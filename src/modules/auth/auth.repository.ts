import { BaseRepository } from '../../utils/BaseRepository.ts';

export class AuthRepository extends BaseRepository {
  constructor() {
    super('user');
  }

  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } }) as Promise<{
      id: string;
      name: string;
      email: string;
      passwordHash: string;
      role: string;
      createdAt: Date;
    } | null>;
  }

  async createUser(data: { name: string; email: string; passwordHash: string; role: string }) {
    return this.model.create({ data }) as Promise<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
    }>;
  }
}
