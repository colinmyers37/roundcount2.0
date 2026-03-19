# Sessions Module

Records shooting sessions and drives `firearm.totalRounds` via atomic increments.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /sessions | List sessions (paginated, filterable by firearmId) |
| GET | /sessions/:id | Get one session (ownership checked, firearm populated) |
| POST | /sessions | Log a session — increments firearm.totalRounds |
| DELETE | /sessions/:id | Delete a session — decrements firearm.totalRounds |

Note: There is **no PATCH/update endpoint**. Sessions are immutable once created. To correct a mistake, delete and re-create.

## Schema — Session

```
userId       ObjectId (ref User)     indexed
firearmId    ObjectId (ref Firearm)  indexed
date         Date                    required
roundsFired  number                  required, min 1
location     string | null           default null
notes        string | null           default null
timestamps   createdAt, updatedAt    auto
```

## Round count logic

### On create (POST /sessions)
1. Verify firearm exists and is owned by the user
2. Create the session document
3. `Firearm.findByIdAndUpdate(id, { $inc: { totalRounds: roundsFired } })` — atomic, no race condition

### On delete (DELETE /sessions/:id)
1. Fetch session (verifies ownership)
2. Fetch firearm to get current `totalRounds`
3. Decrement = `Math.min(session.roundsFired, firearm.totalRounds)` — floors at 0
4. `Firearm.findByIdAndUpdate(id, { $inc: { totalRounds: -decrement } })`
5. Delete the session

## Pagination

`GET /sessions` accepts query params `limit` (default 20) and `offset` (default 0).
Results sorted by `date` descending.
Filter by `firearmId` query param to get sessions for a specific firearm.

## Populate

`findAll()` populates `firearmId` with `name, make, model, caliber`.
`findOne()` populates the full firearm document.
