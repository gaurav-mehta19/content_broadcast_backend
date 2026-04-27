# Content Broadcasting System — Backend

## Tech Stack
- **Node.js** (ESM, `"type": "module"`)
- **Express.js** — HTTP framework
- **PostgreSQL** (Neon hosted) + **Prisma ORM** (`@prisma/adapter-pg` native driver)
- **JWT** + **bcryptjs** — authentication
- **Multer + multer-s3** — file uploads directly to AWS S3
- **Zod** — request validation
- **ioredis** — optional Redis caching
- **Winston** — structured logging
- **helmet, cors, express-rate-limit, morgan** — security & observability middleware
- **swagger-jsdoc + swagger-ui-express** — API docs

## Prerequisites
- Node.js v18+
- PostgreSQL database (Neon recommended)
- AWS S3 bucket (required for file uploads)
- Redis instance (optional — caching degrades gracefully without it)

## Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy and fill env vars
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, JWT_SECRET, and the four AWS_* vars

# 3. Run database migration
npx prisma migrate dev

# 4. Seed the database (creates users + sample content)
npm run db:seed

# 5. Start the dev server
npm run dev
```

Server runs at: `http://localhost:5001`  
Swagger docs at: `http://localhost:5001/api/v1/docs`  
Health check: `http://localhost:5001/health`

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | — |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) | — |
| `AWS_ACCESS_KEY_ID` | Yes | AWS credentials for S3 | — |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS credentials for S3 | — |
| `AWS_REGION` | Yes | S3 bucket region | — |
| `AWS_S3_BUCKET` | Yes | S3 bucket name | — |
| `PORT` | No | Server port | `5001` |
| `JWT_EXPIRES_IN` | No | Token TTL | `7d` |
| `CORS_ORIGIN` | No | Allowed frontend origin | `http://localhost:5173` |
| `MAX_FILE_SIZE_MB` | No | Max upload size in MB | `10` |
| `ALLOWED_FILE_TYPES` | No | Comma-separated MIME types | `image/jpeg,image/png,image/gif` |
| `BCRYPT_ROUNDS` | No | Bcrypt cost factor | `10` |
| `BACKEND_URL` | No | Public base URL (used in responses) | `http://localhost:5001` |
| `REDIS_URL` | No | Redis connection URL (caching disabled if empty) | — |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms | `900000` (15 min) |
| `RATE_LIMIT_MAX` | No | Max requests per window | `100` |

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Principal | principal@school.com | Principal@123 |
| Teacher 1 | teacher1@school.com | Teacher@123 |
| Teacher 2 | teacher2@school.com | Teacher@123 |

## API Examples (curl)

### Auth
```bash
# Register
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@school.com","password":"Test@1234","role":"TEACHER"}'

# Login
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher1@school.com","password":"Teacher@123"}'

# Get current user
curl http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### Content (Teacher)
```bash
# Upload content (file goes directly to S3)
curl -X POST http://localhost:5001/api/v1/content/upload \
  -H "Authorization: Bearer <teacher_token>" \
  -F "title=Maths Chapter 3" \
  -F "subject=maths" \
  -F "startTime=2026-04-27T08:00:00Z" \
  -F "endTime=2026-04-27T17:00:00Z" \
  -F "file=@/path/to/image.png"

# List my content (supports ?status=APPROVED&subject=maths&page=1&limit=10)
curl "http://localhost:5001/api/v1/content/my?status=PENDING&page=1" \
  -H "Authorization: Bearer <teacher_token>"

# Get single content item
curl http://localhost:5001/api/v1/content/<content_uuid> \
  -H "Authorization: Bearer <teacher_token>"

# Delete content
curl -X DELETE http://localhost:5001/api/v1/content/<content_uuid> \
  -H "Authorization: Bearer <teacher_token>"
```

### Approval (Principal)
```bash
# List pending content (supports ?page=1&limit=10)
curl http://localhost:5001/api/v1/approval/pending \
  -H "Authorization: Bearer <principal_token>"

# List all content (supports ?status=APPROVED&subject=maths&teacherId=<uuid>&page=1)
curl "http://localhost:5001/api/v1/approval/all?status=PENDING" \
  -H "Authorization: Bearer <principal_token>"

# Approve
curl -X PATCH http://localhost:5001/api/v1/approval/<content_uuid>/approve \
  -H "Authorization: Bearer <principal_token>"

# Reject (reason required)
curl -X PATCH http://localhost:5001/api/v1/approval/<content_uuid>/reject \
  -H "Authorization: Bearer <principal_token>" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason":"Image quality too low"}'
```

### Schedule (Teacher)
```bash
# Add approved content to the subject rotation
curl -X POST http://localhost:5001/api/v1/schedule \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{"contentId":"<content_uuid>","duration":5,"rotationOrder":1}'

# View rotation for a subject
curl http://localhost:5001/api/v1/schedule/subject/maths \
  -H "Authorization: Bearer <any_token>"

# Remove from rotation
curl -X DELETE http://localhost:5001/api/v1/schedule/<schedule_uuid> \
  -H "Authorization: Bearer <teacher_token>"
```

### Public Live Broadcast (no auth required)
```bash
# Currently active content for a teacher across all subjects
curl http://localhost:5001/api/v1/content/live/<teacher_uuid>

# Currently active content for a teacher, filtered to one subject
curl http://localhost:5001/api/v1/content/live/<teacher_uuid>/maths
```

Response includes `secondsRemaining` — the number of seconds until the current slot ends and the next content item becomes active. Clients should re-poll after this interval.

## Content Lifecycle

```
UPLOAD (teacher) → PENDING → APPROVED / REJECTED (principal)
```

Approved content is only broadcast if:
1. It has been added to the rotation via `POST /schedule`
2. The current time falls within its `startTime` / `endTime` window

## Assumptions / Decisions

- **S3 only**: File uploads go directly to AWS S3 via `multer-s3`. There is no local disk storage fallback — AWS credentials must be configured.
- **Two-step scheduling**: Upload and scheduling are separate steps. After uploading, a teacher must call `POST /schedule` with a duration and rotation order to make content eligible for broadcast.
- **No user management module**: User registration handles TEACHER and PRINCIPAL creation. There are no admin endpoints to list or manage users.
- **Redis is optional**: If `REDIS_URL` is not set, the broadcast endpoint runs without caching. On Redis connection error the server degrades gracefully — no crash.
- **Content status `UPLOADED`**: The `UPLOADED` enum value is reserved in the schema but currently unused. Content is created with status `PENDING` and awaits principal action.

## Deployment Notes

1. **Database**: Use the Neon pooler URL for `DATABASE_URL` in production for connection multiplexing.
2. **Files**: S3 is the storage backend. The `filePath` column stores the private S3 key URL; all API responses expose `fileUrl` as a pre-signed URL (1-hour expiry) generated at request time — no public bucket access required.
3. **Environment**: Set `NODE_ENV=production` — disables debug logs, reduces Winston verbosity.
4. **Process manager**: Use PM2 or a Docker container for process supervision.
5. **Reverse proxy**: Put Nginx in front; forward `/api` to Node on port 5001.
6. **Redis**: Provide `REDIS_URL` to enable broadcast caching (strongly recommended in production).
