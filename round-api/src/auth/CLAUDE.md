# Auth Module

Handles registration, login, token refresh, and logout.

## Files

- `auth.controller.ts` — POST /auth/register, /auth/login, /auth/refresh, /auth/logout
- `auth.service.ts` — token issuance and validation logic
- `jwt.strategy.ts` — Passport JWT strategy, validates token and loads user from DB
- `dto/register.dto.ts` — email, password, displayName
- `dto/login.dto.ts` — email, password
- `dto/refresh.dto.ts` — refreshToken

## Which routes are guarded

| Route | JwtAuthGuard |
|-------|-------------|
| POST /auth/register | No |
| POST /auth/login | No |
| POST /auth/refresh | No |
| POST /auth/logout | Yes — needs valid access token |

## Token details

- Access token: signed with `JWT_SECRET`, expires in **15 minutes**
- Refresh token: signed with `JWT_SECRET`, expires in **30 days**
- Both issued by `issueTokens()` — called on register, login, and refresh
- Refresh token is stored in `user.refreshToken` in MongoDB and **rotated on every refresh call**
- On logout: `user.refreshToken` is set to `null`

## Password hashing

bcrypt with **12 salt rounds** (`bcrypt.hash(password, 12)`).

## Token refresh flow

1. Client sends `{ refreshToken }` to POST /auth/refresh
2. Service looks up user by `refreshToken` field in DB
3. Issues new access + refresh tokens, overwrites the stored refresh token
4. Old refresh token is immediately invalid

## JWT strategy validate()

Returns `{ _id, email, displayName }` — this is what `@CurrentUser()` gives you in controllers.
Throws `UnauthorizedException` if user no longer exists in DB.

## What NOT to change without care

- Do not change `JWT_SECRET` after launch — all existing tokens will become invalid
- Do not change bcrypt rounds without adding a migration for existing hashes
