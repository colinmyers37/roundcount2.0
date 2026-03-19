# Dashboard Module

Read-only aggregation endpoint. Single route: `GET /dashboard`.

## What it returns

```ts
{
  totalRoundsAllTime: number        // sum of totalRounds across all user's firearms
  totalFirearms: number
  firearms: FirearmSummary[]        // all firearms, sorted by updatedAt desc
  recentSessions: Session[]         // 5 most recent sessions, firearmId populated
  overdueMaintenanceCount: number   // total overdue tasks
  overdueTasks: MaintenanceTask[]   // first 5 overdue tasks only
}
```

## How overdue is determined

A task is overdue if `firearm.totalRounds >= task.nextDueAtRounds`.
Computed at query time by comparing task list to a Map of `firearmId -> totalRounds` built from the firearms list.

## Query strategy

Three parallel queries using `Promise.all`:
1. All user's firearms (sorted by updatedAt desc)
2. Last 5 sessions (sorted by date desc, firearmId populated with name/make/model)
3. All maintenance tasks for the user

No limit on tasks at query time — all are fetched, then filtered/sliced in memory. Acceptable at current scale; revisit when users have hundreds of tasks.

## No mutations

This module has no write operations. It imports `Firearm`, `Session`, and `MaintenanceTask` models read-only.

## Firearm summary shape

```ts
{ _id, name, make, model, caliber, totalRounds }
```

Full firearm documents are fetched but only these fields are mapped into the response to keep the payload small.
