import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.ts';

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const BASE_URL = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/`;

export async function presignUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const key = filePath.startsWith(BASE_URL) ? filePath.slice(BASE_URL.length) : filePath;
  const command = new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}
