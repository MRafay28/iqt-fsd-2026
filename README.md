IQT-FSD-2026

# Taskboard

Full stack task application for the IQ Technology Full Stack Developer assessment. The Next.js client talks to a separate Express API. Tasks are stored in PostgreSQL. Current weather comes from Open-Meteo through the API.

## Stack

- Client: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- Server: Node.js, Express, TypeScript, Zod, Prisma, Helmet
- Database: PostgreSQL 16

## Prerequisites

- Node.js 20 or newer
- Docker Desktop

## Setup

1. Start PostgreSQL.

```bash
docker compose up -d --wait
```

2. Copy the environment files.

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env.local
```

On macOS or Linux, use `cp` instead of `copy`.

3. Install dependencies.

```bash
npm install --prefix server
npm install --prefix client
npm install
```

`server` runs `prisma generate` after install.

4. Apply the schema to the app database and the test database.

```bash
npm run db:migrate
```

5. Run the API tests.

```bash
npm test
```

Tests use `tasks_test` and clear that table. They do not delete rows in the app database.

6. Start the client and the API.

```bash
npm run dev
```

- UI: http://localhost:3000
- API: http://localhost:4000

## Environment

`server/.env`

- `DATABASE_URL` — application database
- `TEST_DATABASE_URL` — database used by the API tests
- `CLIENT_ORIGIN` — browser origin allowed by CORS
- `PORT` — API port, default `4000`

`client/.env.local`

- `NEXT_PUBLIC_API_URL` — Express base URL, default `http://localhost:4000`

The local database password in the example files is for Docker on your machine only. Do not reuse it in a shared environment.

## Database schema

Prisma model:

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([createdAt(sort: Desc)])
  @@map("tasks")
}
```

SQL applied by the migration:

```sql
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at" DESC);
```

## REST API

Success responses use `{ "data": ... }`. Failures use `{ "error": { "message": "..." } }`. Delete returns `204` with an empty body.

- `GET /api/health` — process and database check
- `GET /api/tasks` — all tasks, newest first
- `POST /api/tasks` — body `{ "title": string, "description"?: string | null }`
- `PATCH /api/tasks/:id` — body may include `title`, `description`, and `completed`
- `DELETE /api/tasks/:id`
- `GET /api/weather?city=` — current conditions from Open-Meteo

`title` is required, trimmed, and limited to 200 characters. `description` is optional and limited to 2000 characters. `:id` must be a UUID.

## Submission notes

- GitHub repository: publish this folder and paste the URL with the application.
- Live demo: not deployed. Run the steps above.
- API integration: [docs/api-integration.md](docs/api-integration.md)
- Architecture answers: [docs/architecture-answers.md](docs/architecture-answers.md)
- Screenshot: [docs/screenshots/taskboard.png](docs/screenshots/taskboard.png)
