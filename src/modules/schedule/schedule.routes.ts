import { Router } from 'express';
import * as scheduleController from './schedule.controller.ts';
import { authenticate, authorize } from '../../middlewares/auth.middleware.ts';
import { validate } from '../../middlewares/validate.middleware.ts';
import { createScheduleSchema } from './schedule.validator.ts';

const router = Router();

/**
 * @swagger
 * /schedule:
 *   post:
 *     summary: Add approved content to rotation schedule (Teacher only)
 *     tags: [Schedule]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentId, duration]
 *             properties:
 *               contentId: { type: string }
 *               duration: { type: integer, description: Duration in minutes }
 *               rotationOrder: { type: integer }
 *     responses:
 *       201: { description: Schedule created }
 *       400: { description: Content not approved or already scheduled }
 */
router.post('/', authenticate, authorize('TEACHER'), validate(createScheduleSchema), scheduleController.create);

/**
 * @swagger
 * /schedule/subject/{subject}:
 *   get:
 *     summary: Get rotation schedule for a subject
 *     tags: [Schedule]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: subject
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Schedule list }
 */
router.get('/subject/:subject', authenticate, scheduleController.getBySubject);

/**
 * @swagger
 * /schedule/{id}:
 *   delete:
 *     summary: Remove content from rotation (Teacher only)
 *     tags: [Schedule]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Removed from rotation }
 *       403: { description: Not your schedule }
 *       404: { description: Not found }
 */
router.delete('/:id', authenticate, authorize('TEACHER'), scheduleController.remove);

export default router;
