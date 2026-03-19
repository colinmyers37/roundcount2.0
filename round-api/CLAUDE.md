# round-api — NestJS Backend

## Overview

REST API for ROUND. All routes are prefixed with `/api` (set via `app.setGlobalPrefix('api')` in `main.ts`).

## Module structure

```
src/
├── auth/          # Register, login, refresh, logout
├── users/         # GET /users/me, PATCH /users/me
├── firearms/      # CRUD for firearms
├── sessions/      # Log shooting sessions (drives totalRounds)
├── maintenance/   # Round-based maintenance tasks
├── dashboard/     # Aggregated stats (read-only)
└── common/
    ├── guards/    # JwtAuthGuard
    └── decorators/# @CurrentUser()
```

## Auth pattern

Every controller class (except AuthController) has `@UseGuards(JwtAuthGuard)` at the class level.
`@CurrentUser()` returns `{ _id: ObjectId, email: string, displayName: string }` — set by `JwtStrategy.validate()`.
Always call `user._id.toString()` when passing userId to services.

## Ownership check pattern

Every service method that operates on a document by ID:
1. Fetch the document
2. Throw `NotFoundException` if not found
3. Throw `ForbiddenException` if `doc.userId.toString() !== userId`

See `FirearmsService.findOne()` as the canonical example.

## Rate limiting

`ThrottlerGuard` is applied globally in `AppModule` — 60 requests per 60 seconds per IP. No per-route override exists yet.

## Adding a new module

1. Create `src/<feature>/<feature>.schema.ts` — Mongoose schema with `@Schema({ timestamps: true })`
2. Create `src/<feature>/dto/` — class-validator DTOs
3. Create `src/<feature>/<feature>.service.ts` — business logic
4. Create `src/<feature>/<feature>.controller.ts` — route handlers with `@UseGuards(JwtAuthGuard)`
5. Create `src/<feature>/<feature>.module.ts` — register schema + providers
6. Import the module in `AppModule`

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs — must not change after users register |
