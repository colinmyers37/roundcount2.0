# ROUND

Track every shot. Maintain every firearm.

A mobile app for firearm owners to log shooting sessions, track round counts per firearm, and manage maintenance schedules with round-based reminders.

---

## Project Structure

```
roundcount2.0/
├── round-api/      # NestJS backend (REST API)
└── round-app/      # Expo (React Native) frontend
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | bundled with Node |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community |
| Expo CLI | latest | `npm install -g expo-cli` |
| Expo Go app | latest | iOS App Store / Google Play (for device testing) |

---

## Backend Setup (`round-api`)

### 1. Install dependencies

```bash
cd round-api
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and update:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rounddb
JWT_SECRET=replace-with-a-long-random-secret
```

**Required changes:**

| Variable | What to change |
|----------|---------------|
| `MONGODB_URI` | Replace with your MongoDB connection string. For local MongoDB, the default works. For MongoDB Atlas, use the connection string from your Atlas dashboard (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/rounddb`). |
| `JWT_SECRET` | Replace with a long random string (32+ characters). Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | Optional. Change if port 3000 is in use. |

### 3. Start MongoDB

**Local MongoDB (macOS with Homebrew):**
```bash
brew services start mongodb-community
```

**Local MongoDB (manual):**
```bash
mongod --dbpath /your/data/path
```

**MongoDB Atlas:** No local setup needed — just set `MONGODB_URI` to your Atlas connection string.

### 4. Run the backend

**Development (auto-restart on changes):**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

---

## Frontend Setup (`round-app`)

### 1. Install dependencies

```bash
cd round-app
npm install --legacy-peer-deps
```

### 2. Configure environment variables

```bash
# round-app/.env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**Required changes depending on how you're running the app:**

| Scenario | Value for `EXPO_PUBLIC_API_URL` |
|----------|--------------------------------|
| iOS Simulator on the same Mac | `http://localhost:3000/api` |
| Android Emulator on the same Mac | `http://10.0.2.2:3000/api` |
| Physical device (iPhone or Android) | `http://YOUR_MACHINE_IP:3000/api` (see below) |
| Deployed backend | `https://your-api-domain.com/api` |

**Finding your local machine IP (for physical device testing):**

```bash
# macOS
ipconfig getifaddr en0

# Example result: 192.168.1.45
# Then set: EXPO_PUBLIC_API_URL=http://192.168.1.45:3000/api
```

Your phone and Mac must be on the same Wi-Fi network.

### 3. Run the frontend

```bash
cd round-app
npx expo start
```

Then:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with the **Expo Go** app on your physical device

---

## Running Both Together

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd round-api
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd round-app
npx expo start
```

---

## Deploying to Production

### Backend

The backend can be deployed to any Node.js host. Two easy free-tier options:

**Railway:**
1. Push `round-api/` to a GitHub repo
2. Create a new project at [railway.app](https://railway.app)
3. Connect the repo and add environment variables in the Railway dashboard
4. Railway will auto-detect NestJS and deploy

**Render:**
1. Push `round-api/` to a GitHub repo
2. Create a new Web Service at [render.com](https://render.com)
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start:prod`
5. Add environment variables in the Render dashboard

After deploying, update `EXPO_PUBLIC_API_URL` in `round-app/.env` to your deployed backend URL.

### Database (MongoDB Atlas)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your server's IP (or use `0.0.0.0/0` to allow all)
4. Copy the connection string and set it as `MONGODB_URI` in your backend environment

### Mobile App (EAS Build)

To build installable binaries for TestFlight (iOS) or Play Store (Android):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios      # or android / all
```

---

## API Overview

All endpoints are prefixed with `/api`. All routes except auth require a `Bearer` JWT token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate session |
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |
| GET | `/firearms` | List firearms |
| POST | `/firearms` | Add firearm |
| GET | `/firearms/:id` | Firearm detail |
| PATCH | `/firearms/:id` | Update firearm |
| DELETE | `/firearms/:id` | Delete firearm |
| GET | `/sessions` | List sessions |
| POST | `/sessions` | Log session (increments round count) |
| DELETE | `/sessions/:id` | Delete session (decrements round count) |
| GET | `/maintenance` | List maintenance tasks |
| POST | `/maintenance` | Add task |
| PATCH | `/maintenance/:id` | Update task |
| PATCH | `/maintenance/:id/complete` | Mark task done |
| DELETE | `/maintenance/:id` | Delete task |
| GET | `/dashboard` | Aggregated stats |

---

## Common Issues

**"Network request failed" on device**
- Make sure your phone and Mac are on the same Wi-Fi network
- Set `EXPO_PUBLIC_API_URL` to your Mac's local IP, not `localhost`
- Make sure the backend is running and accessible (try opening the URL in your phone's browser)

**MongoDB connection error**
- Verify MongoDB is running: `brew services list | grep mongodb`
- Check the `MONGODB_URI` value in `round-api/.env`
- For Atlas, verify the IP whitelist and connection string credentials

**JWT errors / 401 responses**
- Make sure `JWT_SECRET` in `.env` is set and non-empty
- The secret must be the same value when the API restarts — don't change it after users have registered

**Expo "Unable to resolve module"**
- Run `npm install --legacy-peer-deps` in `round-app/`
- Clear Expo cache: `npx expo start --clear`
