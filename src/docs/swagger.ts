import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.ts';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Content Broadcasting System API',
      version: '1.0.0',
      description: 'API for managing and broadcasting educational content. Teachers upload images, Principals approve/reject, Students view live broadcasts.',
    },
    servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['PRINCIPAL', 'TEACHER'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Content: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            subject: { type: 'string' },
            filePath: { type: 'string' },
            fileUrl: { type: 'string' },
            fileType: { type: 'string' },
            fileSize: { type: 'integer' },
            status: { type: 'string', enum: ['UPLOADED', 'PENDING', 'APPROVED', 'REJECTED'] },
            rejectionReason: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BroadcastResponse: {
          type: 'object',
          properties: {
            content: { $ref: '#/components/schemas/Content' },
            secondsRemaining: { type: 'integer' },
            totalInRotation: { type: 'integer' },
            currentIndex: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Content', description: 'Content management (Teacher)' },
      { name: 'Approval', description: 'Content approval workflow (Principal)' },
      { name: 'Schedule', description: 'Rotation schedule management (Teacher)' },
      { name: 'Broadcast', description: 'Public live broadcast API (no auth)' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
