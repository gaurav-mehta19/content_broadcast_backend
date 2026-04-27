import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.ts';
import contentRoutes from '../modules/content/content.routes.ts';
import broadcastRoutes from '../modules/broadcast/broadcast.routes.ts';
import approvalRoutes from '../modules/approval/approval.routes.ts';
import scheduleRoutes from '../modules/schedule/schedule.routes.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/content', broadcastRoutes);
router.use('/approval', approvalRoutes);
router.use('/schedule', scheduleRoutes);

export default router;
