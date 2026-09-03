# Prod incident: backend never starts, frontend throws React #441

## Status: RESOLVED (2026-09-02, live on this host)

All fixes below were applied and verified directly against the live prod
stack (`backend`, `frontend`, `nginx`, `postgres`, `redis`). This took two
rounds — the first fix (Bug #1) included a mistake (see "Correction" below)
that was caught and reverted during the second round. Final state: all 5
containers `0 restarts` / `running`/`healthy`; `GET https://<host>/api/v1`
→ `200`; `GET https://<host>/en` and `/en/register` → `200` with no
`Minified React error` / `digest` string in the HTML. Note: the database was
wiped (intentionally, by the user, between rounds) and is now empty — see
"Follow-ups for you" at the bottom. See "Timeline of verification" at the
bottom for the full blow-by-blow.

## TL;DR

The backend container is stuck in a crash-restart loop in production. It never
actually runs the compiled server (`node dist/main`). Every restart cycle it
runs Prisma sync successfully, then dies on `npm run seed` with
`ENOENT: /app/package.json`, because the **production Docker image doesn't
contain a `package.json`** but the **compose command still runs `npm run seed
&& npm run start:dev`**, which is a dev-only command.

Because the backend is effectively down (or only briefly reachable right after
each restart, before it dies again), the Next.js frontend's server components
fail their SSR fetches to the backend. Next.js redacts the real error in
production and surfaces it to the browser as the generic, unhelpful:

```
Uncaught Error: Minified React error #441
```

**React #441 decoded:** "An error occurred in the Server Components render.
The specific message is omitted in production builds to avoid leaking
sensitive details. A digest property is included on this error instance which
may provide additional details." — i.e. *some* server-side render threw, and
production purposely hides why. It is a symptom, not the root cause.

Fixing the backend will make #441 go away (or at least stop being caused by
this). It's not a frontend bug.

---

## Root cause: `docker-compose.prod.yml` overrides only `target`, not `command`

`docker compose -f docker-compose.yml -f docker-compose.prod.yml up` merges
both files. The backend service definitions are:

**`docker-compose.yml`** (base, dev-oriented) — `backend` service:
```yaml
build:
  context: ./backend
  target: dev
...
command: |
  sh -c "
  npx prisma db push --schema=/app/prisma/schema.prisma && \
  npx prisma generate --schema=/app/prisma/schema.prisma && \
  npm run seed && \
  npm run start:dev
  "
```

**`docker-compose.prod.yml`** (override) — `backend` service:
```yaml
build:
  context: ./backend
  target: prod
volumes:
  - avatars:/uploads/avatars
```

Compose overlay merges keys, it doesn't replace the whole service. Since
`docker-compose.prod.yml` doesn't set `command:`, the **dev `command:` from
the base file survives**, while the **image target switches to `prod`**.

`backend/Dockerfile`'s `prod` stage:
```dockerfile
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
CMD ["node", "dist/main"]
```

Only `dist/`, `node_modules/`, and `prisma/` are copied. **No
`package.json`.** `CMD ["node", "dist/main"]` never even runs, because the
compose `command:` always takes precedence over a Dockerfile `CMD`.

### What actually happens on `docker compose up` in prod

1. `npx prisma db push` → works (prisma CLI is in `node_modules`, doesn't
   need `package.json`). Matches log: *"Your database is now in sync..."*
2. `npx prisma generate` → works, regenerates the client. Matches log:
   *"Generated Prisma Client..."*
3. `npm run seed` → **npm needs `/app/package.json` to know what "seed"
   means. It's not there.** →
   ```
   npm error code ENOENT
   npm error path /app/package.json
   npm error enoent Could not read package.json
   ```
4. Because the chain is `&&`, the failure here **stops execution before
   `npm run start:dev` is ever reached.** The container's PID 1 process exits.
5. `restart: unless-stopped` fires → Docker restarts the container → back to
   step 1. This is why the log shows `prisma db push` / `generate` running
   *twice*, ending in *"The database is already in sync..."* the second time
   — that's the next restart cycle beginning.

**Net effect: the actual Nest application (`dist/main.js`) never boots in
production.** Nothing is listening on `PORT` for nginx to proxy to (or it's
listening only in tiny windows, if at all — it never gets there, since seed
always fails first).

Also worth noting even if `npm run seed` were fixed: `npm run start:dev` is
the **dev** watch-mode command (`nest start --watch`), which needs the Nest
CLI and TypeScript source — not something you want driving a production
container even if it happened to work.

---

## Why this produces React error #441 in the browser

- `frontend`'s Next.js app (App Router, React 19 / Next 16) uses **Server
  Components** that fetch from the backend at request time (via
  `INTERNAL_API_URL` / `NEXT_PUBLIC_API_URL`, per `.env.prod`).
- With the backend down/unreachable, those fetches throw during the SSR
  render.
- Next.js production builds intentionally strip the real error message
  server-side (to avoid leaking internals to clients) and only ship a
  minified React error to the browser — hence `#441`, whose full text is:

  > "An error occurred in the Server Components render. The specific message
  > is omitted in production builds to avoid leaking sensitive details. A
  > digest property is included on this error instance which may provide
  > additional details about the nature of the error."

- To see the *real* underlying error, check the **frontend container's
  stdout/stderr logs on the server** (`docker compose logs frontend`), not
  the browser console — Next.js logs the full un-redacted error there, along
  with the `digest` that's shown to the client. That will very likely show a
  `fetch failed` / `ECONNREFUSED` to the backend, confirming the causal link.

---

## Correction: there was no "Bug #2" — retracted

An earlier version of this doc claimed the Dockerfile's `CMD ["node",
"dist/main"]` pointed at the wrong path, and "fixed" it to `dist/src/main.js`
in both the Dockerfile and the `docker-compose.prod.yml` command. **That was
wrong**, and was applied to the live prod files for a while before being
caught.

What actually happened: the conclusion was based on a **stale local
`backend/dist/` folder** that already existed on disk (leftover from some
earlier, differently-configured build — not one built during this
investigation), which happened to contain `dist/src/main.js`. That was
mistaken for "how the Docker build behaves." It doesn't reflect the real
build: a clean `docker compose build backend` (multi-stage, `nest build`
inside the `build` stage) produces a **flat** `dist/main.js`, exactly what
the original `CMD ["node", "dist/main"]` expected all along.

Net effect of the mistake: after the real Bug #1 fix (below) was deployed
with the incorrect `dist/src/main.js` path, redeploying again later (once
Bug #4's healthcheck was added, forcing a rebuild) surfaced `Error: Cannot
find module '/app/dist/src/main.js'` — a second, self-inflicted crash loop.
**Fix:** reverted both `backend/Dockerfile`'s `CMD` and
`docker-compose.prod.yml`'s command back to `node dist/main.js`, confirmed
against a genuinely fresh `docker compose build backend` +
`find dist -iname main.js` inside the built image.

Lesson applied for the rest of this doc: every path/behavior claim below was
checked against a fresh build or the live running container, not against
whatever happened to already be sitting on disk.

---

## Fix

### 1. Fix the backend prod command (required)

Give `backend` in `docker-compose.prod.yml` its own production `command:`
that matches the `prod` Dockerfile stage's actual contents — Prisma CLI +
compiled JS, no `npm`/`package.json` dependency:

```yaml
# docker-compose.prod.yml
services:
  backend:
    build:
      context: ./backend
      target: prod
    command: >
      sh -c "
      npx prisma db push --schema=/app/prisma/schema.prisma &&
      npx prisma generate --schema=/app/prisma/schema.prisma &&
      node dist/main.js
      "
    volumes:
      - avatars:/uploads/avatars
```

Notes:
- Kept `prisma db push` rather than switching to `prisma migrate deploy`.
  `migrate deploy` is the more correct tool for production (it applies
  committed migrations under `backend/prisma/migrations`, which do exist in
  this repo) — **but** this live DB's `_prisma_migrations` table doesn't
  exist (checked via `psql`: `relation "_prisma_migrations" does not
  exist`), meaning the DB has only ever been schema-synced via `db push`,
  never through Prisma's migration system. Running `migrate deploy` cold
  against it would try to re-run `CREATE TABLE` statements for tables that
  already exist and fail. Moving to real migrations needs an explicit
  baselining step first (`prisma migrate resolve --applied <name>` for each
  historical migration) — a deliberate follow-up, not something to flip
  live as a side effect of this fix.
- Dropped `npm run seed` from the prod boot path. Seeding admin users on
  *every* container restart in production is risky (reruns against a live
  DB) and doesn't belong in the hot restart path. If prod genuinely needs the
  admin-seed step, run it once, manually/via a one-off job
  (`docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend npm run seed`)
  against the *build* stage image (which does have `package.json`), not as
  part of every boot.
- Dropped `npm run start:dev` → the `prisma` CLI (`npx prisma ...`) still
  works in the `prod` image because `prisma` ships as a dependency in
  `node_modules/.bin`; only the top-level `npm run <script>` calls need
  `package.json`, which is why those specifically fail.

### 2. Alternative: keep `npm run seed`/`npm` usable in prod

If seeding via `npm run seed` in prod is actually wanted, copy
`package.json` into the `prod` stage too:

```dockerfile
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
CMD ["node", "dist/main.js"]
```

But note `npm run seed` runs `ts-node prisma/seed.ts`, which needs
`ts-node`/TypeScript and the **source** `prisma/seed.ts` plus dev
dependencies — the `build` stage's `node_modules` (copied via `npm ci`
without `--omit=dev`) does include devDependencies, so this would work, but
it's heavier than necessary for a prod image. Option 1 (drop seed from the
boot path) is the cleaner fix.

### 3. Backend healthcheck (now required — applied)

This stopped being optional: `nginx`'s `depends_on.backend` in
`docker-compose.yml` was changed (independently, on this host) to
`condition: service_healthy`, and Docker Compose refuses to start *anything*
if a service depended on that way has no `healthcheck:` defined at all —
`make prod` failed immediately with `dependency failed to start: container
backend has no healthcheck configured`, before creating a single container.

Added to `backend` in `docker-compose.yml` (reusing the existing `AppController
{/api/v1}` `GET` route rather than adding a new one):

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:${PORT}${API_PREFIX}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 45s
```

**Gotcha hit and fixed:** first attempt used `http://localhost:...` and the
container came up `unhealthy` even though the Nest app had logged `Nest
application successfully started`. `wget`'s DNS resolution for `localhost`
on this (Alpine/musl) image tries `[::1]` (IPv6) first — `wget: can't connect
to remote host: Connection refused` — while Nest was only listening on
IPv4. Switched to `http://127.0.0.1:...` to sidestep resolution order
entirely; healthcheck went `healthy` immediately after.

`start_period: 45s` is generous enough to cover the slower **dev** boot path
(`npm run seed` via `ts-node` + `nest start --watch` compiling) that this
same `healthcheck:` also applies to, since it lives in the shared
`docker-compose.yml`, not the prod-only override.

This now does what was hoped: `docker compose ps` / `docker inspect` show
`backend` as `unhealthy` immediately if it's actually broken, instead of
silently serving 502s through nginx.

---

## Bug #3 (found during live verification): frontend leaked the backend's `PORT` and secrets

While verifying the backend fix live, `https://<host>/en` started returning
`502` with nginx logging `connect() failed ... while connecting to upstream
... http://<frontend-ip>:3000/`. The frontend's Next.js process turned out to
be listening on **4000**, not the **3000** that `nginx/nginx.conf`'s
`upstream frontend { server frontend:3000; }` expects.

Cause: `docker-compose.prod.yml`'s `frontend` service had gained an
`env_file: - .env.prod` entry (added between this doc's first draft and this
verification pass). `.env.prod` has one shared `PORT=4000`, meant for the
`backend` (matches `nginx.conf`'s `upstream backend { server backend:4000;
}`). Blanket-loading the whole file into `frontend` overrode Next.js's
default port to 4000, colliding with nginx's expectation of 3000 — and, as a
side effect, also injected every other `.env.prod` value into the frontend
container's environment, including `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`DATABASE_URL`, `EMAIL_PASS`, and `GOOGLE_CLIENT_SECRET`, none of which the
Next.js server needs.

This was redundant in the first place: `Makefile`'s prod target already runs
`docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file
.env.prod up --build -d`, so the `${VAR}` placeholders in `docker-compose.yml`'s
existing `frontend.environment` block (`NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`,
`INTERNAL_API_URL`, etc.) already resolve correctly from `.env.prod` — no
`env_file:` needed.

**Fix applied:** removed `env_file: - .env.prod` from `frontend` in
`docker-compose.prod.yml`. After recreating the `frontend` container, it
listens on 3000 again (confirmed via `docker exec frontend ss -tlnp`), and a
`docker exec frontend printenv` no longer shows any of the backend secrets.

---

## Timeline of verification actually performed (this host, 2026-09-02)

All of this was run against the live prod stack on this machine — this was
never a disposable test environment.

**Round 1** (Bug #1 + the retracted "Bug #2" fix):
1. Confirmed the incident live: `backend` was mid crash-loop
   (`Restarting (1) 20 seconds ago`), `postgres`/`redis`/`nginx` were 2h-old
   with real data in the `pgdata` volume.
2. Checked the DB had never used real Prisma migrations
   (`_prisma_migrations` table didn't exist — `db push` only), which is why
   the fix keeps `prisma db push` instead of switching to `migrate deploy`.
3. Built and redeployed `backend` alone (`--no-deps`). Logs showed `db push`
   → `generate` → full Nest bootstrap → `Nest application successfully
   started`. `docker inspect backend` → `0 restarts`, sustained over
   multiple checks a minute+ apart. `curl -sk https://<host>/api/v1` → `200
   Hello World!`.
4. Found the frontend/`env_file` bug (§Bug below) while checking the
   homepage — fixed, recreated `frontend`, restarted `nginx` to drop its
   cached upstream IPs. Final pass that round: all containers `0 restarts`;
   `GET /en`, `/en/register`, `/api/v1` all `200`; no React-error string in
   the homepage HTML.

**Between rounds:** the user intentionally ran a volume-wiping command
(`make clean` / `make fclean` / `docker compose down -v` — confirmed
directly with the user) before the next `make prod`. `pgdata` and
`redisdata` were gone from `docker volume ls` — confirmed this wasn't a
side effect of anything run in this session (only `build`/`up
--no-deps`/`restart` had been run, none of which touch volumes), confirmed
no other compose project held them (`docker compose ls -a`), and got
explicit confirmation from the user that the wipe was deliberate before
proceeding — this is the kind of state to stop and verify, not assume.

**Round 2** (`make prod` for real, surfaced the retracted "Bug #2" mistake
and the healthcheck requirement):
1. `make prod` failed immediately: `dependency failed to start: container
   backend has no healthcheck configured` — `nginx`'s `depends_on.backend`
   had been changed to `condition: service_healthy` (by the user) without a
   `healthcheck:` on `backend` to satisfy it.
2. Rebuilt the (pruned, by `fclean`) backend image to check `wget`
   availability for a healthcheck — confirmed present (`/usr/bin/wget`,
   BusyBox).
3. Added the healthcheck (§3 above), ran `docker compose ... config backend`
   first to confirm `${PORT}`/`${API_PREFIX}` substituted correctly into it.
4. `make prod` → progressed further but failed again: `container backend is
   unhealthy`. Backend logs showed `Error: Cannot find module
   '/app/dist/src/main.js'` — this is where the retracted "Bug #2" mistake
   surfaced: the path fix applied in round 1 didn't match a real, fresh
   build. Reverted `Dockerfile` `CMD` and the compose `command:` to
   `dist/main.js` (see "Correction" section above), rebuilt.
5. `make prod` again → backend started, but healthcheck failed:
   `wget: can't connect to remote host: Connection refused` against
   `localhost` — the IPv6-resolution gotcha (§3 above). Switched the
   healthcheck to `127.0.0.1`.
6. `make prod` again → clean run: `Container backend Healthy`, `Container
   nginx Started`, no errors.
7. Final verification: `docker inspect` on all 5 containers
   (`backend`/`frontend`/`nginx`/`postgres`/`redis`) → `0 restarts`,
   `running`/`healthy`. `curl -sk https://<host>/api/v1` → `200 Hello
   World!`. `curl -sk https://<host>/en` → `200`, 35 KB of real rendered
   HTML, no `Minified React error` or `digest` string anywhere in it.
   `curl -sk https://<host>/en/register` → `200`.

## Follow-ups for you

- **The database is fresh/empty.** The volume wipe between rounds means
  `pgdata` started from scratch this round — no users, no admin accounts,
  no seed data. Run whatever admin-seeding step this project uses (e.g.
  `make admin`, i.e. `docker compose exec backend npm run seed:admin`) if
  you need the admin accounts back.
- Three orphaned `ft_transcendence-backend-run-*` containers from *before*
  the volume wipe may or may not still exist depending on what the
  clean/fclean run removed — not re-checked after the wipe, harmless either
  way.
- `nginx.conf:33` logs a startup warning: `server name "https://192.168.1.10"
  has suspicious symbols` — the `server_name` directive has a scheme (`https://`)
  in it, which it shouldn't. Cosmetic (nginx still starts and works), unrelated
  to this incident, not fixed here.
- Migration baselining (`db push` → real `prisma migrate`) — flagged above,
  intentionally deferred rather than done live without more care. Since the
  DB is fresh now anyway, this would actually be a good time to switch to
  `prisma migrate deploy` for good (no baselining needed on an empty DB —
  just run `migrate deploy` once instead of `db push` and it'll apply all
  migrations cleanly), if you want to make that switch.
