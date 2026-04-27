import { Router } from 'express';
import * as contentController from './content.controller.ts';
import { authenticate, authorize } from '../../middlewares/auth.middleware.ts';
import { validate } from '../../middlewares/validate.middleware.ts';
import { uploadSingle } from '../../middlewares/upload.middleware.ts';
import { uploadContentSchema, listContentQuerySchema } from './content.validator.ts';

const router = Router();

/**
 * @swagger
 * /content/upload:
 *   post:
 *     summary: Upload new content (Teacher only)
 *     tags: [Content]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, subject, file]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               subject: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Content uploaded }
 *       400: { description: Validation error or invalid file }
 *       403: { description: Principals cannot upload }
 */
router.post(
  '/upload',
  authenticate,
  authorize('TEACHER'),
  uploadSingle('file'),
  validate(uploadContentSchema),
  contentController.upload,
);

/**
 * @swagger
 * /content/my:
 *   get:
 *     summary: Get teacher's own content
 *     tags: [Content]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [UPLOADED, PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Paginated content list }
 */
router.get('/my', authenticate, authorize('TEACHER'), validate(listContentQuerySchema, 'query'), contentController.myContent);

/**
 * @swagger
 * /content/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Content]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Content details }
 *       403: { description: Not your content (teacher) }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, authorize('TEACHER', 'PRINCIPAL'), contentController.getById);

/**
 * @swagger
 * /content/{id}:
 *   delete:
 *     summary: Delete content (Teacher only, own content)
 *     tags: [Content]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Content deleted }
 *       403: { description: Not your content }
 *       404: { description: Not found }
 */
router.delete('/:id', authenticate, authorize('TEACHER'), contentController.deleteContent);

export default router;
