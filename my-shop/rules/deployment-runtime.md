# Deployment and Runtime Rules

Detailed how-to for the active Vercel + Render + Neon + Cloudinary stack. For architectural decisions and ownership boundaries see `rules/architecture.md`.

## 1. Provider Responsibilities

- Storefront → Vercel (serverless, auto-deploy on push).
- Vendure → Render Web Service, Docker runtime, long-running process.
- Payload CMS → Render Web Service, Docker runtime, long-running process.
- Do not deploy Vendure to Vercel — it needs a persistent process, worker, scheduler and DB pool.

## 2. Build-Time Safety

- Storefront builds must not depend on Vendure or Payload being reachable.
- Do not call `new URL()` on env vars without a try/catch or validation.
- Do not throw at module import time for missing production env values.
- All external API fetches must use `VENDURE_FETCH_TIMEOUT_MS` / `PAYLOAD_FETCH_TIMEOUT_MS` (default 15000ms).

## 3. Environment Variables

Full reference is in `.env.free-tier.example`. Key points:

- Use absolute URLs with protocol — never placeholders like `https://api.example.com`.
- `REVALIDATION_SECRET` must be identical on Render Payload and Vercel Storefront.
- `NEXT_PUBLIC_PAYLOAD_URL` is the base URL without `/api` — used for media image src in Storefront.

**Vercel Storefront:**
```
VENDURE_SHOP_API_URL
NEXT_PUBLIC_VENDURE_SHOP_API_URL
PAYLOAD_API_URL
NEXT_PUBLIC_PAYLOAD_API_URL
NEXT_PUBLIC_PAYLOAD_URL          ← base URL, no /api suffix
NEXT_PUBLIC_SITE_URL
VENDURE_CHANNEL_TOKEN=__default_channel__
REVALIDATION_SECRET
```

**Render Vendure:**
```
APP_ENV=prod
DATABASE_URL                     ← Neon connection string with ?sslmode=require
DB_SSL=true
DB_SYNCHRONIZE=false
DB_SCHEMA=public
VENDURE_DB_POOL_MAX=6
RUN_WORKER_IN_PROCESS=true
ASSET_STORAGE=cloudinary
ASSET_URL_PREFIX=https://<vendure>.onrender.com/assets
COOKIE_SECRET
SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD
CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER=vendure-assets
```

**Render Payload CMS:**
```
DATABASE_URI                     ← Neon connection string with ?sslmode=require
DB_SSL=true
DB_PUSH=false
PAYLOAD_DB_POOL_MAX=4
PAYLOAD_SECRET
STOREFRONT_REVALIDATE_URL=https://<vercel>/api/revalidate
REVALIDATION_SECRET
CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER=payload-cms
```

## 4. Vendure Server and Worker

- `RUN_WORKER_IN_PROCESS=true` runs server and worker in one Node process.
- When in-process, **both** server config and worker config must omit `DefaultSchedulerPlugin`. If only one omits it, the cron is registered twice and crashes with `Cron: Tried to initialize new named job 'clean-jobs', but name already taken`. The `omitSchedulerPlugin()` helper in `index.ts` handles this for both.
- Keep the service at **one Render instance** — two instances with in-process worker cause the same duplicate cron crash.
- `/health` must stay mapped — Render uses it for health checks.

## 5. Docker Entrypoints and Migrations

Both services boot via `docker-entrypoint.sh`, which runs migrations before starting the server. Do not replace the `ENTRYPOINT` with a bare `CMD`.

**Vendure** (`docker-entrypoint.sh`):
```sh
node apps/server/dist/index.js --run-migrations
exec node apps/server/dist/index.js
```

**Payload CMS** (`docker-entrypoint.sh`):
```sh
cd /app/apps/cms
node /app/node_modules/.bin/tsx src/migrate.ts
exec node /app/apps/cms/server.js
```

Why `tsx` instead of `payload migrate` CLI:
- The CLI needs `tsconfig.json` and source files present at runtime.
- Next.js standalone builds do not include them.
- `src/migrate.ts` calls `payload.db.migrate()` directly and works in any environment.

**Payload runner stage must include** (in addition to standalone build):
- `/app/node_modules/` — for `tsx` and Payload core
- `/app/apps/cms/node_modules/` — for CMS-specific deps
- `/app/apps/cms/src/` — for `migrate.ts` and migration files
- `/app/apps/cms/payload.config.ts` and `tsconfig.json` — for path alias resolution

## 6. Free-Tier Constraints

- Render free services sleep after ~15 min of inactivity. First request after wakeup can take 30–60 s.
- Neon free tier has a connection limit — stay within pool sizes in §3.
- Cloudinary free tier has 25 GB storage and 25 GB bandwidth/month — sufficient for a student project.
- Do not add background polling or keep-alive pings to Render services — it violates free tier terms.

## 7. Deployment Smoke Tests

Run after every Render redeploy:

```bash
VENDURE_URL=https://your-vendure.onrender.com \
PAYLOAD_URL=https://your-payload.onrender.com \
STOREFRONT_URL=https://your-storefront.vercel.app \
bash my-shop/scripts/smoke-test.sh
```

Expected results:

| Endpoint | Expected |
|----------|----------|
| `<vendure>/health` | `{"status":"ok"}` |
| `<vendure>/shop-api` | GraphQL response |
| `<vendure>/dashboard` | Login page loads |
| `<payload>/admin` | Login page loads |
| `<payload>/api` | JSON response |
| `<storefront>/en` | Storefront loads |
| `<storefront>/vi` | Storefront loads |

## 8. Debugging Order

1. Check Render/Vercel env vars — missing or wrong values cause most crashes.
2. Read Render service logs — migration output appears first on boot.
3. Hit `/health` before any user-facing URL.
4. **Payload crash on start** → check `src/migrations/index.ts` has all migration files registered.
5. **Vendure `Cron: already taken` crash** → both server and worker must use `omitSchedulerPlugin()`.
6. **CI `npm ci` fails** → `package-lock.json` is out of sync, run `npm install` in `my-shop/` and commit it.
7. Narrow the failing build:
   ```
   npm run build -w server
   npm run build -w cms
   npm run build -w storefront
   ```
8. Only run full monorepo build after the individual app passes.
