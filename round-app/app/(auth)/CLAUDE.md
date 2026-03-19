# (auth)/ — Login and Register Screens

Public screens — accessible when the user is NOT logged in.

## Screens

- `login.tsx` — email + password form, calls `useAuth().login()`
- `register.tsx` — email + password + displayName form, calls `useAuth().register()`

## Navigation after success

Both screens rely on the auth guard in `(app)/_layout.tsx` to handle redirection.
After `login()` or `register()` resolves, `user` is set in `AuthContext`, which triggers the guard to render `<Stack>` (the protected area) instead of the redirect.
Do NOT manually call `router.push('/(app)/...')` after login — the guard handles it.

## Error handling

Wrap calls in try/catch and display error messages to the user.
The API returns `409 Conflict` for duplicate email on register and `401 Unauthorized` for bad credentials on login.

## No auth guard here

These screens must NOT have `@UseGuards` or auth checks — they are intentionally public.
If a logged-in user lands here (e.g., via direct URL), the root layout will redirect them away.
