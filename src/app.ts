import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.ts';
import { swaggerSpec } from './docs/swagger.ts';
import apiRouter from './routes/index.ts';
import { errorHandler, notFound } from './middlewares/error.middleware.ts';
import { globalRateLimit } from './middlewares/rateLimit.middleware.ts';
import { logger } from './utils/logger.ts';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(globalRateLimit);
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
