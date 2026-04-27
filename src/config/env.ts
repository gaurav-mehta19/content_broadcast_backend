import 'dotenv/config';

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '5001'), 10),

  DATABASE_URL: required('DATABASE_URL'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),

  MAX_FILE_SIZE_BYTES: parseInt(optional('MAX_FILE_SIZE_MB', '10'), 10) * 1024 * 1024,
  ALLOWED_FILE_TYPES: optional('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif').split(','),

  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),

  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '10'), 10),

  BACKEND_URL: optional('BACKEND_URL', 'http://localhost:5001'),

  AWS_ACCESS_KEY_ID: required('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: required('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: required('AWS_REGION'),
  AWS_S3_BUCKET: required('AWS_S3_BUCKET'),

  REDIS_URL: process.env['REDIS_URL'] ?? '',
};
