# Users Module

Profile management for the authenticated user.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /users/me | Get current user's profile |
| PATCH | /users/me | Update displayName (email/password changes handled separately if added) |

Both routes require `JwtAuthGuard`. userId is always taken from `@CurrentUser()` — never from URL params.

## Schema — User

```
email           string    unique, lowercased, trimmed
passwordHash    string    bcrypt hash — never returned in responses
displayName     string    trimmed
refreshToken    string | null   stored for refresh token rotation
timestamps      createdAt, updatedAt
```

## What NOT to expose

`passwordHash` and `refreshToken` must never be included in API responses.
When returning user data, select or omit these fields explicitly.

## Password changes (not yet implemented)

If adding a change-password endpoint:
- Require the current password before accepting a new one
- Re-hash with bcrypt (12 rounds)
- Invalidate the current refresh token (set to null) to force re-login on other devices
