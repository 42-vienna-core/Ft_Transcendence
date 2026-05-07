# ft_transcendence — Multiplayer Snake

Real-time multiplayer Snake game built as a microservices stack with Docker Compose.

```
Browser
  │  HTTPS / WSS
  ▼
nginx (reverse proxy + TLS)
  ├── /api/*       → NestJS REST API  (port 4000)
  ├── /socket.io/* → NestJS WebSocket (port 4000)
  └── /*           → Next.js SSR/SSG  (port 3000)
                          │
               ┌──────────┴──────────┐
               │                     │
          PostgreSQL              Redis
          (users, rooms,          (live game state,
           game history)           pub/sub)
```

## Stack

| Service    | Technology        | Role                               |
|------------|-------------------|------------------------------------|
| nginx      | nginx 1.25-alpine | Reverse proxy, TLS termination     |
| frontend   | Next.js 14        | App Router, SSR/SSG, PixiJS canvas |
| backend    | NestJS 10         | REST API, Socket.IO, Prisma ORM    |
| postgres   | PostgreSQL 16     | Persistent data + migrations       |
| redis      | Redis 7           | Live game state + pub/sub          |

## Quick Start

**Prerequisites:** Docker, Docker Compose v2, `openssl`, `make`

```bash
# 1. Create your env file
cp .env.example .env

# 2. Generate self-signed TLS certs (needed by nginx)
make certs

# 3. Build and start everything
make up

# 4. Run database migrations (first time only)
make migrate
```

Open **https://localhost** (accept the self-signed cert warning in your browser).

## Daily Workflow

```bash
make up          # start all services (rebuilds changed images)
make down        # stop everything
make logs        # follow all service logs
make log s=backend   # follow logs for one service
make migrate     # run new Prisma migrations
make studio      # open Prisma Studio DB GUI on port 5555
make shell s=backend # shell into a container
make clean       # stop + wipe volumes (destructive!)
```

## Project Layout

```
ft_transcendence/
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf          # routing rules, TLS, WebSocket proxy
├── backend/                # NestJS application
│   ├── prisma/
│   │   └── schema.prisma   # DB schema — edit here, then run make migrate
│   └── src/
│       ├── auth/           # JWT register/login
│       ├── users/          # User profiles
│       ├── rooms/          # Room create/join/list
│       ├── game/           # Snake logic + Socket.IO gateway
│       ├── prisma/         # PrismaService (DB client)
│       └── redis/          # RedisService (game state + pub/sub)
├── frontend/               # Next.js application
│   └── src/
│       ├── app/            # App Router pages
│       │   ├── page.tsx          → /         (landing)
│       │   ├── login/page.tsx    → /login
│       │   ├── register/page.tsx → /register
│       │   ├── lobby/page.tsx    → /lobby
│       │   └── game/[roomId]/    → /game/:id
│       ├── components/
│       │   └── GameCanvas.tsx  # PixiJS canvas + socket listener
│       └── lib/
│           ├── api.ts      # fetch wrapper
│           └── socket.ts   # socket.io-client singleton
├── docker-compose.yml
├── .env.example
├── Makefile
└── GUIDE.md                # Step-by-step learning guide
```

## API Reference

| Method | Path               | Auth | Description         |
|--------|--------------------|------|---------------------|
| POST   | /api/auth/register | —    | Create account      |
| POST   | /api/auth/login    | —    | Login → JWT token   |
| GET    | /api/users/me      | JWT  | Own profile         |
| GET    | /api/users/:id     | JWT  | User by ID          |
| GET    | /api/rooms         | JWT  | List open rooms     |
| POST   | /api/rooms         | JWT  | Create room         |
| POST   | /api/rooms/join    | JWT  | Join by code        |
| GET    | /api/rooms/:id     | JWT  | Room details        |

## WebSocket Events

| Event             | Direction       | Payload                     |
|-------------------|-----------------|-----------------------------|
| `joinRoom`        | client → server | `{ roomId, userId }`        |
| `startGame`       | client → server | `{ roomId }`                |
| `changeDirection` | client → server | `{ direction: UP/DOWN/... }`|
| `playerJoined`    | server → client | `{ userId }`                |
| `gameStarted`     | server → client | initial `GameState`         |
| `gameState`       | server → client | `GameState` every 150 ms    |
| `gameOver`        | server → client | final `GameState` + scores  |

## Database Schema

```
User ─────┬── GameParticipant ── Room ── GameResult
          └── Friendship (self-join)
```

See `backend/prisma/schema.prisma` for full schema.

## Read the Guide

See **[GUIDE.md](./GUIDE.md)** for a deep-dive into every part of the stack — how Docker
networks work, how nginx proxying works, how NestJS modules are structured, how Prisma
migrations work, and how Socket.IO + Redis pub/sub enables real-time multiplayer.
