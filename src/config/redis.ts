import Redis from 'ioredis';
import { env } from './env.ts';
import { logger } from '../utils/logger.ts';

let redis: Redis | null = null;

if (env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });

  redis.on('connect', () => logger.info('Redis connected'));
  redis.on('error', (err) => logger.warn(`Redis error: ${err.message} — caching disabled`));

  redis.connect().catch(() => {
    redis = null;
  });
}

export { redis };
