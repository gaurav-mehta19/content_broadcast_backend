import { AuthRepository } from './auth.repository.ts';
import { hashPassword, comparePassword } from '../../utils/bcrypt.ts';
import { signToken } from '../../utils/jwt.ts';
import { ApiError } from '../../utils/ApiError.ts';
import type { User } from '../../../generated/prisma/client.ts';

const repo = new AuthRepository();

interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

const toPublicUser = (user: { id: string; name: string; email: string; role: string; createdAt: Date }): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async ({ name, email, password, role }: { name: string; email: string; password: string; role: string }) => {
  const existing = await repo.findByEmail(email);
  if (existing) throw ApiError.conflict('Email already in use');

  const passwordHash = await hashPassword(password);
  const user = await repo.createUser({ name, email, passwordHash, role });
  const token = signToken({ sub: user.id, role: user.role });

  return { user: toPublicUser(user), token };
};

export const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await repo.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const token = signToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
};

export const getMe = (user: User): PublicUser => toPublicUser(user);
