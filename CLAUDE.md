# ROUND — Monorepo Root

Firearm round-count tracking and maintenance scheduling app.

## Monorepo structure

```
roundcount2.0/
├── round-api/    # NestJS REST API (backend)
└── round-app/    # Expo React Native app (frontend)
```

Each subfolder has its own CLAUDE.md with module-level detail.
Read the relevant one before touching code in that area.

## Running the project

Two terminals required:

```bash
# Terminal 1 — backend
cd round-api && npm run start:dev   # API at http://localhost:3000/api

# Terminal 2 — frontend
cd round-app && npx expo start
```

## Environment files

- round-api/.env — PORT, MONGODB_URI, JWT_SECRET
- round-app/.env — EXPO_PUBLIC_API_URL (points to the API)

## Tech stack

- API: NestJS, Mongoose, Passport-JWT, bcryptjs, @nestjs/throttler
- Database: MongoDB
- Mobile: Expo (React Native), Expo Router v3, TanStack Query, Axios, expo-secure-store

## Key architectural decisions

- firearm.totalRounds is the source of truth — mutated only by the sessions service via $inc, never directly through firearms endpoints.
- Maintenance nextDueAtRounds = roundsAtLastCompletion + intervalRounds, recalculated on create and on complete.
- Offline mutations queue in AsyncStorage (sync_queue) and flush on NetInfo reconnect.
- Auth: access tokens expire in 15m, refresh tokens in 30d, stored in MongoDB and rotated on every refresh.
