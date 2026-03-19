# (tabs)/ — Bottom Tab Navigator

Five tabs rendered inside the protected `(app)/` area.

## Tab order and query keys

| Tab file | Title | Query key | API endpoint |
|----------|-------|-----------|-------------|
| `index.tsx` | Dashboard | `['dashboard']` | GET /dashboard |
| `firearms.tsx` | Firearms | `['firearms']` | GET /firearms |
| `sessions.tsx` | Sessions | `['sessions']` | GET /sessions |
| `maintenance.tsx` | Maintenance | `['maintenance']` | GET /maintenance |
| `profile.tsx` | Profile | `['me']` | GET /users/me |

## Data fetching pattern

All tabs use `useQuery` from TanStack Query:

```ts
const { data, isLoading, refetch, isRefetching } = useQuery({
  queryKey: ['firearms'],
  queryFn: () => api.get('/firearms').then(r => r.data),
});
```

Pull-to-refresh via `<RefreshControl refreshing={isRefetching} onRefresh={refetch} />`.

## Tab icons

Icons are emoji rendered as `<Text>` — no icon library dependency:
- Dashboard: 📊
- Firearms: no emoji — use a symbol if adding
- Sessions: 🎯
- Maintenance: 🔧
- Profile: 👤

## Dashboard specifics (index.tsx)

- Shows `totalRoundsAllTime` as the hero number
- Overdue maintenance banner — tapping navigates to `/(app)/(tabs)/maintenance`
- "Log Session" CTA button — navigates to `/(app)/sessions/new`
- Firearms list — each card navigates to `/(app)/firearms/[id]`
- Recent 5 sessions list (read-only)

## Cache invalidation after mutations

When a mutation (create/delete session, complete maintenance task, etc.) succeeds in a child screen, invalidate the relevant query keys so tabs refresh:

```ts
queryClient.invalidateQueries({ queryKey: ['dashboard'] });
queryClient.invalidateQueries({ queryKey: ['firearms'] });
```

Get `queryClient` from `useQueryClient()`.
