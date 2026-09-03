*This project has been created as part of the 42 curriculum by efittant, dzasenko, rghazary, ibondarc.*

# Snake.io

## Description

Snake.io is a real-time multiplayer browser game inspired by the classic Snake. Players can create an account, manage their profile and friends, join a lobby, and compete against human players or an AI opponent. The server owns the game state and synchronizes every player through WebSockets.

Key features include:

- Real-time matches for up to four players
- Server-authoritative game logic and AI opponent
- Public, private, friend, and matchmaking rooms
- Email/password and Google OAuth authentication
- Profiles, avatars, friends, presence, leaderboard, and administration
- English, German, Italian, and Russian interfaces
- Responsive interface, HTTPS/WSS, Privacy Policy, and Terms of Service

## Team Information

| Member | Roles | Main responsibilities |
|---|---|---|
| `efittant` | Project Manager / Scrum Master, Developer | Coordinated planning and progress; focused on game logic and sockets. |
| `dzasenko` | Product Owner, Developer | Maintained the product direction and priorities; focused on users and authentication. |
| `rghazary` | Technical Lead / Architect, Developer | Guided architecture and technical decisions; focused on sockets, Redis, and database organization. |
| `ibondarc` | Developer | Focused on the frontend, interface components, and integration with backend features. |

All team members contributed to implementation, testing, reviews, and project decisions.

## Project Management

Work was divided into small tasks and tracked with Trello. The team met at least once a week, with more frequent sessions during integration and testing. Completed work was submitted through pull requests so it could be reviewed before merging. Telegram was used for day-to-day communication and coordination.

## Technical Stack

| Area | Technologies | Reason for the choice |
|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, CSS Modules | Component-based development, routing, server rendering, and responsive styling. |
| Game rendering | PixiJS | Efficient 2D rendering in the browser. |
| Backend | NestJS 11, TypeScript, Socket.IO | Structured modules and dependency injection with real-time communication support. |
| Database | PostgreSQL 16, Prisma ORM | Relational integrity for users, rooms, friendships, sessions, and match results, with a type-safe data layer. |
| Live state | Redis 7 | Fast shared storage, locking, and coordination for concurrent games. |
| Authentication | JWT, Argon2, Passport, Google OAuth 2.0 | Secure password storage, session handling, and remote authentication. |
| Infrastructure | Docker Compose, nginx | Reproducible startup, reverse proxying, and HTTPS/WSS termination. |
| Validation/state | class-validator, Zod, Zustand | Validation on both application sides and lightweight client state management. |

## Database Schema

```text
Users 1 ─── * Sessions
  │
  ├── * FriendsRequest * ── Users
  ├── * RoomUser * ──────── GameRoom
  ├── * GameParticipants * ─ GameResults
  └── * GameResults (winner)

GameRoom 1 ─── * GameResults
```

- `Users`: integer ID, unique email, password hash, name, role, score, level, color, avatar, OAuth identity, and timestamps.
- `Sessions`: UUID, user reference, refresh-token hash, expiry/revocation data, user agent, and IP address.
- `FriendsRequest`: UUID, sender and receiver references, status, and timestamps. Each user pair is unique.
- `GameRoom`: UUID, name, owner, capacity, type, status, timeout, and timestamps.
- `RoomUser`: UUID connecting a user and room, with the active socket ID. A user can occur only once per room.
- `GameResults`: UUID, room and optional winner references, tick count, participants, and timestamps.
- `GameParticipants`: UUID connecting a user to a result, with final score and survival state.

The complete schema is available in `backend/prisma/schema.prisma`.

## Features and Ownership

| Feature | Description | Main contributors |
|---|---|---|
| Multiplayer game | Server-authoritative movement, food, collision, scoring, and win conditions for up to four players. | `efittant` |
| Real-time rooms | Matchmaking and public, private, and friend lobbies with live state and disconnect handling. | `efittant`, `rghazary` |
| AI opponent | Pathfinding-based bot with imperfect fallback behavior. | `efittant` |
| Authentication | Registration, login, refresh sessions, password reset, and Google OAuth. | `dzasenko`, `rghazary` |
| User profiles | Profile editing, colors, avatar upload, statistics, and online status. | `dzasenko`, `ibondarc` |
| Friends | Search, requests, removal, presence, and invitations to active rooms. | `dzasenko`, `ibondarc`, `rghazary`, `efittant` |
| Leaderboard | Ranked player scores and progression display. | `ibondarc`, `efittant`, `dzasenko` |
| Administration | Role-protected user listing, editing, role management, and deletion. | `dzasenko`, `ibondarc`, `rghazary` |
| Internationalization | Complete English, German, Italian, and Russian interfaces. | `ibondarc`, `rghazary` |
| Interface and design system | Responsive pages, shared controls, modals, navigation, themes, and feedback components. | `ibondarc` |
| Persistence and concurrency | Relational schema, Redis-backed live state, locks, and persistent match results. | `rghazary`, `efittant` |
| Infrastructure and legal pages | Dockerized HTTPS application with public Privacy Policy and Terms of Service. | `ibondarc`, `rghazary` |

## Modules

| Module | Type | Points | Implementation and purpose | Main contributors |
|---|---:|---:|---|---|
| Frontend and backend frameworks | Major | 2 | Next.js provides the frontend and server-rendered routes; NestJS structures the API, services, guards, and gateways. | All members |
| Real-time WebSocket features | Major | 2 | Socket.IO synchronizes rooms, gameplay, presence, invitations, and connection lifecycle events. | `efittant`, `rghazary`, `ibondarc` |
| ORM | Minor | 1 | Prisma defines relations and provides type-safe PostgreSQL queries and migrations. | `rghazary`, `dzasenko` |
| Server-Side Rendering | Minor | 1 | Next.js server layouts and components load session and localization data before rendering. | `ibondarc` |
| Custom design system | Minor | 1 | Shared colors, typography, icons, controls, layouts, modals, navigation, avatars, buttons, and loading states provide a consistent interface. | `ibondarc` |
| Complete web-based game | Major | 2 | Snake has live controls, collisions, scoring, elimination, a winner, and stored results. | `efittant`, `ibondarc` |
| AI opponent | Major | 2 | A server-side pathfinding bot evaluates the board and uses imperfect fallback decisions to remain competitive without perfect play. | `efittant` |
| Multiplayer game for 3+ players | Major | 2 | Up to four players share the same authoritative match state with synchronized rules and room capacity control. | `efittant` |
| OAuth 2.0 | Minor | 1 | Google OAuth is integrated with Passport, existing accounts, application sessions, and the login interface. | `dzasenko`, `ibondarc` |
| Multiple languages | Minor | 1 | `next-intl` provides complete English, German, Italian, and Russian translations and locale-aware navigation. | `ibondarc`, `rghazary` |
| Standard user management | Major | 2 | Users can update profiles and avatars, manage friends, view profiles, and see online status. | `dzasenko`, `ibondarc`, `rghazary` |
| Advanced permissions | Major | 2 | Player, bot, and administrator roles control protected views and user-management CRUD operations. | `dzasenko`, `ibondarc`, `rghazary` |
| **Total** |  | **19** | Major modules: 14 points. Minor modules: 5 points. |  |

The selected modules support the same goal: a complete multiplayer game with secure accounts, real-time interaction, and a clear interface.

## Instructions

### Prerequisites

- Docker Engine with Docker Compose v2
- GNU Make
- OpenSSL
- A current Google Chrome installation
- Google OAuth credentials and SMTP credentials for the related authentication flows

### Configuration

1. Copy `.env.example` to `.env.prod` for the production evaluation setup.
2. Fill in the PostgreSQL, JWT, NextAuth, application URL, email, Google OAuth, bot, and administrator values described in the file.
3. Use strong local secrets and keep `.env.prod` outside version control.

### Run

After configuration, generate the local TLS certificate and start the complete application in production mode with:

```bash
make certs
make prod
```

`make prod` uses `.env.prod`, builds the production frontend and backend image stages, and starts nginx, the frontend, backend, PostgreSQL, and Redis in the background with Docker Compose. Open `https://localhost` in Google Chrome and accept the local self-signed certificate when prompted. The plain `make` command starts the development configuration and is intended for local development rather than evaluation.

Useful commands:

```bash
make down             # stop the application
make logs             # follow service logs
make log s=backend    # follow one service
make prod             # rebuild and restart in production mode
make admin            # seed configured administrator accounts
```

## Individual Contributions

### efittant

Coordinated the team as Project Manager / Scrum Master and developed core game and socket behavior, including real-time input, match progression, and multiplayer synchronization.

### dzasenko

Maintained product priorities as Product Owner and developed user-facing backend features, including authentication, account flows, profiles, and permissions.

### rghazary

Guided architecture and code organization as Technical Lead and developed the WebSocket, Redis, persistence, and database layers used by concurrent matches.

### ibondarc

Developed most of the frontend, including pages, responsive components, game presentation, localization, forms, and integration with REST and socket events.

The main shared challenge was keeping browser state, server game state, Redis, and PostgreSQL consistent while several users acted at the same time. The team addressed it with server-authoritative rules, validated socket events, room membership checks, Redis coordination, database constraints, and multi-client testing. Authentication and frontend integration were handled through shared API contracts, pull-request reviews, and repeated end-to-end testing.

## Resources

- [Next.js documentation](https://nextjs.org/docs)
- [NestJS documentation](https://docs.nestjs.com/)
- [Socket.IO documentation](https://socket.io/docs/v4/)
- [Prisma documentation](https://www.prisma.io/docs)
- [PostgreSQL documentation](https://www.postgresql.org/docs/16/)
- [Redis documentation](https://redis.io/docs/latest/)
- [PixiJS documentation](https://pixijs.com/8.x/guides)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [next-intl documentation](https://next-intl.dev/docs/getting-started/app-router)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

AI tools were used as learning and support tools: to understand TypeScript concepts, brainstorm implementation approaches, and help create tests.
