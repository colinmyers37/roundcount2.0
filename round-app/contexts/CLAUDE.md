# contexts/ — AuthContext

Single context that manages authentication state for the entire app.

## AuthContext value shape

```ts
{
  user: { _id: string, email: string, displayName: string } | null
  isLoading: boolean   // true while checking stored token on startup
  login(email, password): Promise<void>
  register(email, password, displayName): Promise<void>
  logout(): Promise<void>
}
```

## Token storage

Tokens are stored in `expo-secure-store` (hardware-backed keychain/keystore):

| Key | Value |
|-----|-------|
| `accessToken` | JWT access token (15m TTL) |
| `refreshToken` | JWT refresh token (30d TTL) |

## Startup flow (loadUser)

Called on mount and after login/register:
1. Read `accessToken` from secure store
2. If no token → set `isLoading = false`, leave `user = null`
3. GET `/users/me` using the stored token
4. On success → set `user` from response
5. On failure → clear both tokens, leave `user = null`

The `api.ts` interceptor handles token refresh transparently during step 3 — `loadUser` doesn't need to know about refresh logic.

## login / register

Both call the corresponding auth endpoint, store the returned tokens, then call `loadUser()` to populate `user`.

## logout

1. POST `/auth/logout` (best effort — ignores errors)
2. Delete both tokens from secure store
3. Set `user = null`

The auth guard in `(app)/_layout.tsx` detects `user = null` and redirects to `/login`.

## useAuth()

Throws if called outside `<AuthProvider>`. Always wrap with the provider before using the hook.
