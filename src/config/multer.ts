import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { randomUUID } from 'crypto';
import type { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { env } from './env.ts';
import { ApiError } from '../utils/ApiError.ts';

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3,
  bucket: env.AWS_S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `uploads/${randomUUID()}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (env.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type. Allowed: ${env.ALLOWED_FILE_TYPES.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE_BYTES },
});
