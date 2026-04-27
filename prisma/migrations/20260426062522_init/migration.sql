-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRINCIPAL', 'TEACHER');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('UPLOADED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_slots" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_schedules" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "rotation_order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "content_subject_status_idx" ON "content"("subject", "status");

-- CreateIndex
CREATE INDEX "content_uploaded_by_status_idx" ON "content"("uploaded_by", "status");

-- CreateIndex
CREATE UNIQUE INDEX "content_slots_subject_key" ON "content_slots"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "content_schedules_content_id_key" ON "content_schedules"("content_id");

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_schedules" ADD CONSTRAINT "content_schedules_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_schedules" ADD CONSTRAINT "content_schedules_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "content_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
