import { Router } from 'express';
import * as broadcastController from './broadcast.controller.ts';

const router = Router();

/**
 * @swagger
 * /content/live/{teacherId}:
 *   get:
 *     summary: Get currently active content for a teacher (public)
 *     tags: [Broadcast]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Active content or null }
 */
router.get('/live/:teacherId', broadcastController.live);

/**
 * @swagger
 * /content/live/{teacherId}/{subject}:
 *   get:
 *     summary: Get currently active content for a teacher filtered by subject (public)
 *     tags: [Broadcast]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: subject
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Active content or null }
 */
router.get('/live/:teacherId/:subject', broadcastController.live);

export default router;
