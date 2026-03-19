# round-api

NestJS REST API for the ROUND app. See the root README for full setup instructions.

## Quick start

```bash
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm install
npm run start:dev      # http://localhost:3000/api
```

## Modules

| Module | Path | Responsibility |
|--------|------|---------------|
| auth | src/auth/ | Register, login, refresh, logout |
| users | src/users/ | Profile read/update |
| firearms | src/firearms/ | CRUD for user firearms |
| sessions | src/sessions/ | Log shots, mutates firearm.totalRounds |
| maintenance | src/maintenance/ | Round-based maintenance tasks |
| dashboard | src/dashboard/ | Aggregated stats for the home screen |

## Key rules

- Never update `firearm.totalRounds` directly — only the sessions service touches it via `$inc`.
- All routes require `Authorization: Bearer <accessToken>` except `POST /auth/register`, `POST /auth/login`, and `POST /auth/refresh`.
- Rate limit: 60 requests per minute per IP (global ThrottlerGuard).
