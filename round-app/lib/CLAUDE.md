# lib/ — API Client, Offline Queue, Sync Hook

## api.ts — Axios instance

Base URL from `EXPO_PUBLIC_API_URL` env var (falls back to `http://localhost:3000/api`).

### Request interceptor
Reads `accessToken` from `expo-secure-store` and attaches it as `Authorization: Bearer <token>`.

### Response interceptor — auto token refresh
On any 401 response:
1. Marks the request with `_retry = true` (prevents infinite loops)
2. Reads `refreshToken` from secure store
3. POSTs to `/auth/refresh` with the refresh token
4. On success: stores new `accessToken` and `refreshToken`, retries the original request
5. On failure: clears both tokens from secure store (user will be redirected to login by the auth guard)

Import this instance everywhere API calls are needed — never create a separate axios instance.

## sync-queue.ts — Offline mutation queue

Stores pending API mutations in AsyncStorage under the key `sync_queue`.

### Queue item shape
```ts
{
  id: string           // Date.now().toString()
  method: 'POST' | 'PATCH' | 'DELETE'
  url: string
  data?: any
  createdAt: number    // timestamp
}
```

### enqueue(mutation)
Appends a mutation to the queue. Call this instead of `api.request()` when offline.

### flushQueue()
Replays all queued mutations in order using the `api` instance.
- Successful items are removed from the queue
- Failed items stay in the queue to be retried next time
- Flush is all-or-nothing per item — partial failures are safe

## use-sync.ts — useOfflineSync hook

Subscribes to `NetInfo.addEventListener`. When `state.isConnected` becomes true, calls `flushQueue()`.
Mounted in `SyncProvider` inside `app/_layout.tsx` — runs once for the lifetime of the app.

Do not call `flushQueue()` manually on every API call — the hook handles it automatically on reconnect.
