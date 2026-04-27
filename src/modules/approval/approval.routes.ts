import { Router } from 'express';
import { z } from 'zod';
import * as approvalController from './approval.controller.ts';
import { authenticate, authorize } from '../../middlewares/auth.middleware.ts';
import { validate } from '../../middlewares/validate.middleware.ts';
import { rejectSchema, allContentQuerySchema } from './approval.validator.ts';

const router = Router();
const pageSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * @swagger
 * /approval/pending:
 *   get:
 *     summary: List pending content (Principal only)
 *     tags: [Approval]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pending content list }
 */
router.get('/pending', authenticate, authorize('PRINCIPAL'), validate(pageSchema, 'query'), approvalController.pending);

/**
 * @swagger
 * /approval/all:
 *   get:
 *     summary: List all content with filters (Principal only)
 *     tags: [Approval]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [UPLOADED, PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: teacherId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Filtered content list }
 */
router.get('/all', authenticate, authorize('PRINCIPAL'), validate(allContentQuerySchema, 'query'), approvalController.all);

/**
 * @swagger
 * /approval/{id}/approve:
 *   patch:
 *     summary: Approve content (Principal only)
 *     tags: [Approval]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Content approved }
 *       400: { description: Already approved }
 *       404: { description: Not found }
 */
router.patch('/:id/approve', authenticate, authorize('PRINCIPAL'), approvalController.approve);

/**
 * @swagger
 * /approval/{id}/reject:
 *   patch:
 *     summary: Reject content (Principal only)
 *     tags: [Approval]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejectionReason]
 *             properties:
 *               rejectionReason: { type: string }
 *     responses:
 *       200: { description: Content rejected }
 *       400: { description: Missing rejection reason }
 */
router.patch('/:id/reject', authenticate, authorize('PRINCIPAL'), validate(rejectSchema), approvalController.reject);

export default router;
