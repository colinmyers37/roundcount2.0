# round-app — Expo React Native Frontend

## Overview

Mobile app built with Expo Router v3 (file-based routing). Targets iOS and Android.

## Directory structure

```
app/
├── (auth)/           # Login and register screens (no auth guard)
│   ├── login.tsx
│   └── register.tsx
└── (app)/            # Protected area — redirects to login if no user
    ├── _layout.tsx   # Auth guard (see below)
    ├── (tabs)/       # Bottom tab navigator
    │   ├── index.tsx       # Dashboard
    │   ├── firearms.tsx    # Firearms list
    │   ├── sessions.tsx    # Sessions list
    │   ├── maintenance.tsx # Maintenance list
    │   └── profile.tsx     # User profile
    ├── firearms/
    │   ├── new.tsx         # Add firearm form
    │   └── [id].tsx        # Firearm detail
    ├── sessions/
    │   └── new.tsx         # Log session form
    └── maintenance/
        └── new.tsx         # Add maintenance task form

contexts/
└── AuthContext.tsx   # Auth state, login/register/logout, token storage

lib/
├── api.ts            # Axios instance with JWT injection and auto-refresh
├── sync-queue.ts     # Offline mutation queue (AsyncStorage)
└── use-sync.ts       # useOfflineSync hook (NetInfo listener)
```

## Provider nesting order (app/_layout.tsx)

```
QueryClientProvider
  SafeAreaProvider
    AuthProvider
      SyncProvider        ← useOfflineSync lives here
        Stack
```

Order matters — don't reorder without checking dependencies.

## Auth guard

`app/(app)/_layout.tsx` checks `useAuth()`:
- While loading: renders `<ActivityIndicator>`
- If no user: `<Redirect href="/(auth)/login" />`
- If authenticated: renders `<Stack>`

## TanStack Query config

- `staleTime`: 30 seconds
- `retry`: 1
- Cache is NOT persisted to disk — data refetches on app restart

## Navigation

Uses `router.push()` from `expo-router` for imperative navigation.
Tabs use file-based routing — tab names match file names in `(tabs)/`.

## Styling

Plain `StyleSheet.create()` — no UI library. Color palette:
- Primary text: `#1a1a1a`
- Muted text: `#666`, `#999`
- Background: `#f5f5f5`
- Cards: `#fff` with `borderRadius: 10`
- Primary action: `#1a1a1a` background, `#fff` text
- Overdue/warning: `#fff3cd` background, `#856404` text, `#f0a500` left border
- Positive (rounds added): `#27ae60`
