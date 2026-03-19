# Maintenance Module

Round-based maintenance tasks for firearms. Tracks when service is due based on round count, not calendar time.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /maintenance | List tasks (optional ?firearmId= filter) |
| POST | /maintenance | Create a task |
| PATCH | /maintenance/:id | Update task name or interval |
| PATCH | /maintenance/:id/complete | Mark task done, reset due counter |
| DELETE | /maintenance/:id | Delete task |

## Schema — MaintenanceTask

```
userId                ObjectId (ref User)     indexed
firearmId             ObjectId (ref Firearm)  indexed
name                  string                  required (e.g. "Clean barrel")
intervalRounds        number                  required, min 1 (e.g. 500)
lastCompletedAt       Date | null             default null
roundsAtLastCompletion number                 default 0
nextDueAtRounds       number                  required — calculated, not user-supplied
timestamps            createdAt, updatedAt    auto
```

## nextDueAtRounds formula

```
nextDueAtRounds = roundsAtLastCompletion + intervalRounds
```

### On create
`nextDueAtRounds = firearm.totalRounds + intervalRounds`
(starts counting from current round count, not from 0)

### On complete (PATCH /:id/complete)
```
roundsAtLastCompletion = firearm.totalRounds   (current value at time of completion)
lastCompletedAt        = now
nextDueAtRounds        = firearm.totalRounds + intervalRounds
```

### On update (PATCH /:id — changing intervalRounds)
```
nextDueAtRounds = task.roundsAtLastCompletion + new intervalRounds
```

## isOverdue and roundsRemaining — computed at read time, NOT stored

`findAll()` enriches each task by joining with the firearm's current `totalRounds`:

```
isOverdue       = firearm.totalRounds >= task.nextDueAtRounds
roundsRemaining = Math.max(0, task.nextDueAtRounds - firearm.totalRounds)
```

These fields are computed in the service and added to the response object. They do not exist on the Mongoose document.

## Ownership

Creating a task verifies the firearm exists and is owned by the user.
`findOne()` verifies userId match before any mutation.
