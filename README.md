# Todo Manager API

Backend API for the Todo List application, built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- NestJS 11
- TypeScript
- Prisma ORM
- PostgreSQL
- Jest and Supertest
- Docker / Docker Compose
- Swagger API docs

## Requirements

- Node.js 20+
- npm
- PostgreSQL 15+ if running locally without Docker
- Docker Desktop if using the provided compose file

## Environment Variables

Copy the example file and adjust values if needed:

```bash
cp .env.example .env
```

Default local values:

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/todo_db?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

When running with `docker-compose.yml`, the API is exposed on `http://localhost:3002` and connects to the PostgreSQL container automatically.

## Local Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Start the API in development mode:

```bash
npm run start:dev
```

The API runs at `http://localhost:3000` by default.

Swagger documentation is available at:

```text
http://localhost:3000/api-docs
```

## Docker Setup

Start PostgreSQL, pgAdmin, and the API:

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3002`
- Swagger: `http://localhost:3002/api-docs`
- pgAdmin: `http://localhost:8088`

Default pgAdmin credentials:

```text
Email: admin@admin.com
Password: admin
```

## Scripts

```bash
npm run build       # Compile the NestJS app
npm run start       # Start once
npm run start:dev   # Start with watch mode
npm run start:prod  # Start compiled app
npm test            # Run unit tests
npm run test:e2e    # Run e2e tests
npm run test:cov    # Run test coverage
npm run lint        # Run ESLint with auto-fix
```

## Main API Endpoints

All todo, list, group, and search endpoints expect an `x-guest-id` header. The frontend creates and stores this value in `localStorage` for anonymous sessions.

```text
GET    /                 Health check
GET    /todos            List todos with search/filter/sort/pagination
POST   /todos            Create a todo
GET    /todos/:id        Get one todo
PATCH  /todos/:id        Update a todo or toggle completion
DELETE /todos/:id        Delete a todo
GET    /todos/stats      Get total/pending/completed counts
GET    /search?q=term    Search groups, lists, and todos
```

Supported `/todos` query parameters:

```text
search
status=all|pending|completed
sortBy=createdAt|updatedAt|title
order=asc|desc
page
limit
listId
isImportant=true|false
isMyDay=true|false
```

## Notes

- `.env` is intentionally ignored by git. Commit `.env.example` only.
- The current app uses anonymous guest sessions, not full authentication.
- For production, set an explicit `CORS_ORIGIN` instead of allowing all origins.
