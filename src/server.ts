import './config/env.ts';
import './config/redis.ts';
import app from './app.ts';
import { connectDB, disconnectDB } from './config/database.ts';
import { env } from './config/env.ts';
import { logger } from './utils/logger.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (env.NODE_ENV !== 'production') {
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
}

const start = async (): Promise<void> => {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Swagger docs at http://localhost:${env.PORT}/api/v1/docs`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err: unknown) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
