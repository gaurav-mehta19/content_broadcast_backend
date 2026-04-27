import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import bcrypt from 'bcryptjs';
import { readFileSync, statSync } from 'fs';
import path from 'path';
import os from 'os';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });
const ROUNDS = 10;

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET!;
const REGION = process.env.AWS_REGION!;

const DESKTOP = path.join(os.homedir(), 'Desktop');
const SEED_IMAGES: Record<string, string> = {
  maths:     path.join(DESKTOP, 'Screenshot 2026-04-27 at 10.53.19 PM.png'),
  science:   path.join(DESKTOP, 'Screenshot 2026-04-27 at 10.53.30 PM.png'),
  english:   path.join(DESKTOP, 'Screenshot 2026-04-27 at 10.53.42 PM.png'),
  geography: path.join(DESKTOP, 'Screenshot 2026-04-27 at 10.53.51 PM.png'),
  history:   path.join(DESKTOP, 'Screenshot 2026-04-27 at 10.54.00 PM.png'),
};

async function uploadToS3(localPath: string, s3Key: string): Promise<{ url: string; size: number }> {
  const buffer = readFileSync(localPath);
  const size = statSync(localPath).size;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: 'image/png',
  }));
  return { url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`, size };
}

async function main(): Promise<void> {
  console.log('🌱 Seeding database...\n');

  await db.contentSchedule.deleteMany();
  await db.contentSlot.deleteMany();
  await db.content.deleteMany();
  await db.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────────
  const [principalHash, teacher1Hash, teacher2Hash] = await Promise.all([
    bcrypt.hash('Principal@123', ROUNDS),
    bcrypt.hash('Teacher@123', ROUNDS),
    bcrypt.hash('Teacher@123', ROUNDS),
  ]);

  const principal = await db.user.create({
    data: { name: 'Dr. Sarah Principal', email: 'principal@school.com', passwordHash: principalHash, role: 'PRINCIPAL' },
  });
  const teacher1 = await db.user.create({
    data: { name: 'Mr. John Teacher', email: 'teacher1@school.com', passwordHash: teacher1Hash, role: 'TEACHER' },
  });
  const teacher2 = await db.user.create({
    data: { name: 'Ms. Emily Teacher', email: 'teacher2@school.com', passwordHash: teacher2Hash, role: 'TEACHER' },
  });

  // ── S3 uploads ─────────────────────────────────────────────────────────────
  console.log('📤 Uploading seed images to S3...');
  const imgs: Record<string, { url: string; size: number }> = {};
  for (const [subject, localPath] of Object.entries(SEED_IMAGES)) {
    process.stdout.write(`   ${subject}... `);
    imgs[subject] = await uploadToS3(localPath, `seed/${subject}.png`);
    console.log('✓');
  }

  const now    = new Date();
  const past   = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000); // 7 days ago
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  // ── Content ────────────────────────────────────────────────────────────────
  console.log('\n📝 Creating content records...');

  // Teacher 1 — maths (2 approved items in rotation)
  const maths1 = await db.content.create({ data: {
    title: 'Introduction to Algebra',
    description: 'Basics of algebraic expressions and equations',
    subject: 'maths',
    filePath: imgs.maths.url,
    fileType: 'image/png',
    fileSize: imgs.maths.size,
    uploadedById: teacher1.id,
    status: 'APPROVED',
    approvedById: principal.id,
    approvedAt: new Date(),
    startTime: past,
    endTime: future,
  }});

  const maths2 = await db.content.create({ data: {
    title: 'Geometry: Circles and Triangles',
    description: 'Properties of geometric shapes',
    subject: 'maths',
    filePath: imgs.maths.url,
    fileType: 'image/png',
    fileSize: imgs.maths.size,
    uploadedById: teacher1.id,
    status: 'APPROVED',
    approvedById: principal.id,
    approvedAt: new Date(),
    startTime: past,
    endTime: future,
  }});

  // Teacher 1 — science (1 approved item in rotation)
  const science1 = await db.content.create({ data: {
    title: 'Cell Biology Fundamentals',
    description: 'Understanding cell structure and function',
    subject: 'science',
    filePath: imgs.science.url,
    fileType: 'image/png',
    fileSize: imgs.science.size,
    uploadedById: teacher1.id,
    status: 'APPROVED',
    approvedById: principal.id,
    approvedAt: new Date(),
    startTime: past,
    endTime: future,
  }});

  // Teacher 1 — english (1 approved item in rotation)
  const english1 = await db.content.create({ data: {
    title: 'Grammar Essentials',
    description: 'Core grammar rules for effective written and spoken communication',
    subject: 'english',
    filePath: imgs.english.url,
    fileType: 'image/png',
    fileSize: imgs.english.size,
    uploadedById: teacher1.id,
    status: 'APPROVED',
    approvedById: principal.id,
    approvedAt: new Date(),
    startTime: past,
    endTime: future,
  }});

  // Teacher 2 — geography (1 approved item in rotation)
  const geo1 = await db.content.create({ data: {
    title: 'World Map and Continents',
    description: 'Overview of continents and major geographical features',
    subject: 'geography',
    filePath: imgs.geography.url,
    fileType: 'image/png',
    fileSize: imgs.geography.size,
    uploadedById: teacher2.id,
    status: 'APPROVED',
    approvedById: principal.id,
    approvedAt: new Date(),
    startTime: past,
    endTime: future,
  }});

  // Teacher 2 — history (PENDING — awaiting principal approval)
  await db.content.create({ data: {
    title: 'Ancient Roman History',
    description: 'Rise and fall of the Roman Empire',
    subject: 'history',
    filePath: imgs.history.url,
    fileType: 'image/png',
    fileSize: imgs.history.size,
    uploadedById: teacher2.id,
    status: 'PENDING',
  }});

  // Teacher 2 — maths (REJECTED — demonstrates rejection reason)
  await db.content.create({ data: {
    title: 'Introduction to Calculus',
    description: 'Derivatives and integration basics',
    subject: 'maths',
    filePath: imgs.maths.url,
    fileType: 'image/png',
    fileSize: imgs.maths.size,
    uploadedById: teacher2.id,
    status: 'REJECTED',
    approvedById: principal.id,
    rejectionReason: 'Content overlaps with existing approved material. Please upload unique content.',
  }});

  // ── Slots & Schedules ──────────────────────────────────────────────────────
  console.log('🗓  Creating slots and rotation schedules...');

  const mathsSlot    = await db.contentSlot.create({ data: { subject: 'maths' } });
  const scienceSlot  = await db.contentSlot.create({ data: { subject: 'science' } });
  const englishSlot  = await db.contentSlot.create({ data: { subject: 'english' } });
  const geoSlot      = await db.contentSlot.create({ data: { subject: 'geography' } });

  // Maths: maths1 (5 min) → maths2 (5 min) → loop
  await db.contentSchedule.createMany({ data: [
    { contentId: maths1.id,   slotId: mathsSlot.id,   rotationOrder: 1, duration: 5 },
    { contentId: maths2.id,   slotId: mathsSlot.id,   rotationOrder: 2, duration: 5 },
  ]});

  // Science: science1 (10 min) → loop
  await db.contentSchedule.create({
    data: { contentId: science1.id, slotId: scienceSlot.id, rotationOrder: 1, duration: 10 },
  });

  // English: english1 (5 min) → loop
  await db.contentSchedule.create({
    data: { contentId: english1.id, slotId: englishSlot.id, rotationOrder: 1, duration: 5 },
  });

  // Geography: geo1 (5 min) → loop
  await db.contentSchedule.create({
    data: { contentId: geo1.id, slotId: geoSlot.id, rotationOrder: 1, duration: 5 },
  });

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('Credentials:');
  console.log('  Principal : principal@school.com  /  Principal@123');
  console.log('  Teacher 1 : teacher1@school.com   /  Teacher@123');
  console.log('  Teacher 2 : teacher2@school.com   /  Teacher@123');
  console.log('');
  console.log(`Teacher 1 ID : ${teacher1.id}`);
  console.log(`Teacher 2 ID : ${teacher2.id}`);
  console.log('');
  console.log('Live broadcast endpoints:');
  console.log(`  GET /api/v1/content/live/${teacher1.id}           (maths + science + english)`);
  console.log(`  GET /api/v1/content/live/${teacher1.id}/maths`);
  console.log(`  GET /api/v1/content/live/${teacher1.id}/science`);
  console.log(`  GET /api/v1/content/live/${teacher1.id}/english`);
  console.log(`  GET /api/v1/content/live/${teacher2.id}           (geography only — history is pending)`);
  console.log(`  GET /api/v1/content/live/${teacher2.id}/geography`);
}

main().catch(console.error).finally(() => db.$disconnect());
