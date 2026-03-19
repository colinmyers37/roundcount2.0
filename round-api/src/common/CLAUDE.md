# Common — Guards and Decorators

Shared utilities used across all feature modules.

## JwtAuthGuard (`guards/jwt-auth.guard.ts`)

Thin wrapper around `AuthGuard('jwt')` from `@nestjs/passport`.
Applies the JWT Passport strategy defined in `auth/jwt.strategy.ts`.

Usage — apply at the controller class level (not per-route) unless a route needs to be public:

```ts
@UseGuards(JwtAuthGuard)
@Controller('firearms')
export class FirearmsController { ... }
```

For mixed controllers (some public, some guarded), apply the guard per-route instead. See `AuthController` — only `logout` is guarded.

## @CurrentUser() decorator (`decorators/current-user.decorator.ts`)

Extracts `request.user` which is set by `JwtStrategy.validate()` after the token is verified.

Shape returned:
```ts
{
  _id: ObjectId,
  email: string,
  displayName: string
}
```

Always call `.toString()` on `_id` before passing it to service methods:
```ts
user._id.toString()   // correct
user._id              // wrong — ObjectId, not string
```

## Adding new shared utilities

Place them in `src/common/`. Create sub-folders for new categories (e.g., `pipes/`, `filters/`, `interceptors/`).
Register globally in `main.ts` or per-module depending on scope.
