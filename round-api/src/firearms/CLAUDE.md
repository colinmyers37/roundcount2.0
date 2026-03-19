# Firearms Module

CRUD for a user's firearms. Round counting is managed externally by the sessions module.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /firearms | List all firearms for current user, sorted by updatedAt desc |
| GET | /firearms/:id | Get one firearm (ownership checked) |
| POST | /firearms | Create firearm |
| PATCH | /firearms/:id | Update firearm fields (ownership checked) |
| DELETE | /firearms/:id | Delete firearm (ownership checked) |

## Schema — Firearm

```
userId          ObjectId (ref User)   indexed
name            string                required
make            string                required
model           string                required
caliber         string                required
serialNumber    string | null         default null
totalRounds     number                default 0, min 0
notes           string | null         default null
timestamps      createdAt, updatedAt  auto
```

## Critical rule — totalRounds is READ-ONLY from this module

`totalRounds` must NEVER be set directly via `FirearmsService.update()` or any firearms endpoint.
It is owned exclusively by `SessionsService`, which uses `$inc` to atomically increment/decrement it when sessions are created or deleted.

If you need to manually correct a round count (e.g., admin tooling), do it via a session, not by patching the firearm.

## Ownership check

`findOne(id, userId)` verifies ownership and is called by `update()` and `remove()` before any mutation.

## DTO fields (create)

- `name` — required
- `make` — required
- `model` — required
- `caliber` — required
- `serialNumber` — optional
- `notes` — optional

UpdateFirearmDto uses `PartialType(CreateFirearmDto)` — all fields optional.
