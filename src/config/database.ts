import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { logger } from '../utils/logger.ts';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

export const db: PrismaClient = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

export const connectDB = async (): Promise<void> => {
  await db.$connect();
  logger.info('Database connected');
};

export const disconnectDB = async (): Promise<void> => {
  await db.$disconnect();
  logger.info('Database disconnected');
};
