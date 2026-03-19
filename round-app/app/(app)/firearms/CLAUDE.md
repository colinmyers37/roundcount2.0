# firearms/ — Firearm Detail and Create Screens

## Screens

### new.tsx — Add Firearm
Form to create a new firearm.

Required fields: name, make, model, caliber
Optional fields: serialNumber, notes

On submit: POST /firearms
On success:
- Invalidate `['firearms']` and `['dashboard']`
- Navigate back (`router.back()`)

### [id].tsx — Firearm Detail
Shows full firearm info including:
- Name, make, model, caliber, serialNumber
- `totalRounds` counter (prominent display)
- List of maintenance tasks for this firearm (fetched with `?firearmId=<id>`)
- Edit button — opens inline edit or navigates to an edit form

Query keys used:
- `['firearms', id]` — GET /firearms/:id
- `['maintenance', { firearmId: id }]` — GET /maintenance?firearmId=id

On edit (PATCH /firearms/:id):
- Invalidate `['firearms']`, `['firearms', id]`, `['dashboard']`

On delete (DELETE /firearms/:id):
- Invalidate `['firearms']`, `['dashboard']`
- Navigate back to firearms list (`router.replace('/(app)/(tabs)/firearms')`)

## Important

Never display or allow editing of `totalRounds` from this screen.
Round count is display-only and is managed by the sessions module.
