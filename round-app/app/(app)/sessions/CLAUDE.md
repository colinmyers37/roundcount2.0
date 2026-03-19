# sessions/ — Log Session Screen

## Screens

### new.tsx — Log a Session

Form fields:
- `firearmId` — required, picker populated from GET /firearms
- `date` — required, defaults to today
- `roundsFired` — required, number input, min 1
- `location` — optional string
- `notes` — optional string

On submit: POST /sessions
On success, invalidate ALL of these query keys (session creation affects round counts and dashboard):
```ts
queryClient.invalidateQueries({ queryKey: ['sessions'] });
queryClient.invalidateQueries({ queryKey: ['firearms'] });
queryClient.invalidateQueries({ queryKey: ['dashboard'] });
// If on a firearm detail screen, also:
queryClient.invalidateQueries({ queryKey: ['firearms', firearmId] });
queryClient.invalidateQueries({ queryKey: ['maintenance', { firearmId }] });
```

Then navigate back: `router.back()`

## No edit screen

Sessions are immutable. There is no PATCH endpoint and no edit UI.
If a user needs to correct a session, they delete it and log a new one.

## Delete flow (from sessions list tab)

On DELETE /sessions/:id success, invalidate:
- `['sessions']`
- `['firearms']`
- `['dashboard']`

Show a confirmation prompt before deleting — round counts will decrease.
