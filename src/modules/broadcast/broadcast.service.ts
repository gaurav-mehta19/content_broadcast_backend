import { db } from '../../config/database.ts';
import { presignUrl } from '../../utils/s3Presign.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getCurrentlyActiveContent = async (teacherId: string, subject?: string) => {
  if (!UUID_RE.test(teacherId)) return null;

  const now = new Date();

  const where: Record<string, unknown> = {
    uploadedById: teacherId,
    status: 'APPROVED',
    schedule: { isNot: null },
    startTime: { lte: now },
    endTime: { gte: now },
  };

  if (subject) where.subject = subject.toLowerCase();

  const contentList = await db.content.findMany({
    where,
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      schedule: { include: { slot: true } },
    },
  });

  if (!contentList.length) return null;

  type ContentWithSchedule = (typeof contentList)[number] & {
    schedule: { rotationOrder: number; duration: number };
  };

  const sorted = (contentList as ContentWithSchedule[]).sort(
    (a, b) => a.schedule.rotationOrder - b.schedule.rotationOrder,
  );

  const totalCycleSec = sorted.reduce((sum, c) => sum + c.schedule.duration * 60, 0);
  if (totalCycleSec === 0) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const cyclePos = nowSec % totalCycleSec;

  let accumulated = 0;
  let currentIndex = 0;
  let active = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    const itemDurSec = sorted[i].schedule.duration * 60;
    if (cyclePos < accumulated + itemDurSec) {
      active = sorted[i];
      currentIndex = i;
      break;
    }
    accumulated += itemDurSec;
  }

  const secondsRemaining = accumulated + active.schedule.duration * 60 - cyclePos;

  return {
    content: { ...active, fileUrl: await presignUrl(active.filePath) },
    secondsRemaining,
    totalInRotation: sorted.length,
    currentIndex,
  };
};
