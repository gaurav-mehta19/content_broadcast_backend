import { Router } from 'express';
import * as authController from './auth.controller.ts';
import { validate } from '../../middlewares/validate.middleware.ts';
import { authenticate } from '../../middlewares/auth.middleware.ts';
import { authRateLimit } from '../../middlewares/rateLimit.middleware.ts';
import { registerSchema, loginSchema } from './auth.validator.ts';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password@123 }
 *               role: { type: string, enum: [PRINCIPAL, TEACHER] }
 *     responses:
 *       201: { description: User registered }
 *       409: { description: Email already in use }
 */
router.post('/register', authRateLimit, validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful with token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authRateLimit, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, authController.me);

export default router;
