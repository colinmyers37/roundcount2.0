# maintenance/ — Maintenance Task Screens

## Screens

### new.tsx — Add Maintenance Task

Form fields:
- `firearmId` — required, picker populated from GET /firearms
- `name` — required string (e.g. "Clean barrel", "Lube slide")
- `intervalRounds` — required number, min 1 (how many rounds between services)

Note: `nextDueAtRounds` is calculated by the backend on create — do NOT send it from the form.

On submit: POST /maintenance
On success:
- Invalidate `['maintenance']` and `['dashboard']`
- Navigate back: `router.back()`

## Complete action

On the maintenance list or detail, each task has a "Mark Complete" button.

On tap: PATCH /maintenance/:id/complete (no request body)
On success:
- Invalidate `['maintenance']` and `['dashboard']`
- The task's `nextDueAtRounds` resets based on the firearm's current round count

## Task display

Each task should show:
- Task name
- Firearm name
- `roundsRemaining` — rounds until next service (from API response, computed server-side)
- `isOverdue` — boolean flag to drive warning UI (from API response, computed server-side)

These fields (`isOverdue`, `roundsRemaining`) come from the API response — they are not stored in the DB.

## Edit

PATCH /maintenance/:id accepts `name` and/or `intervalRounds`.
Changing `intervalRounds` recalculates `nextDueAtRounds` from `roundsAtLastCompletion`.
On success, invalidate `['maintenance']`.
