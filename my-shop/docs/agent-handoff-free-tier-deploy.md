# Agent Handoff — Free-Tier Deployment

## Current Direction

The project is being moved toward a 0-cost personal deployment path:

- Storefront: Vercel Hobby.
- Vendure server + worker: Render Free web service.
- Payload CMS: Render Free web service.
- Database: Neon Free or Supabase Free Postgres.
- Media: Cloudinary Free.
- CI/CD: GitHub Actions where useful, but Vercel/Render auto deploy can handle the free-tier path.

This direction intentionally accepts free-tier limitations: cold starts, low database connection limits, no SLA, and manual setup through provider dashboards.

## Important Architecture Boundaries

Follow `rules/architecture.md`:

- `apps/server`: Vendure commerce backend only.
- `apps/cms`: Payload content management only.
- `apps/storefront`: customer-facing frontend only; no direct DB access.

Do not move commerce logic into Payload or direct database access into Storefront.

## Recent Deployment-Relevant Changes

### Vendure

- `apps/server/src/index.ts`
  - Supports `node apps/server/dist/index.js --run-migrations`.
  - No longer runs migrations on every normal server startup.
  - Supports `RUN_WORKER_IN_PROCESS=true` for Render Free.

- `apps/server/src/vendure-config.ts`
  - Supports `DATABASE_URL`.
  - Supports `DB_SSL=true`.
  - Supports `VENDURE_DB_POOL_MAX`.
  - Uses email transport `none` in production demo mode, avoiding SMTP setup.

- `apps/server/package.json`
  - Adds `migration:run`.

### Payload CMS

- `apps/cms/payload.config.ts`
  - Supports `DB_SSL=true`.
  - Supports `PAYLOAD_DB_POOL_MAX`.
  - Has admin i18n and content localization.

- `apps/cms/next.config.ts`
  - Sets `turbopack.root` to avoid monorepo lockfile root ambiguity.

### Storefront

- `apps/storefront/next.config.ts`
  - Allows `res.cloudinary.com`.
  - Sets `turbopack.root`.

- `apps/storefront/src/app/[locale]/layout.tsx`
- `apps/cms/src/app/(main)/layout.tsx`
  - Removed `next/font/google` to avoid build-time external font fetch failures.

## New Deployment Files

- `render.yaml`
  - Render Blueprint for Vendure and Payload.
  - Located at Git repo root because Render Blueprints are normally loaded from the repository root.

- `my-shop/.env.free-tier.example`
  - Copy/reference env values for Render and Vercel.
  - Contains placeholders only; do not commit real secrets.

- `my-shop/docs/free-tier-deployment-guide.md`
  - Step-by-step free-tier deployment guide.

## Validation Already Run

These commands passed:

```bash
npm run build -w server
npm exec -w storefront tsc -- --noEmit
npm exec -w cms tsc -- --noEmit
npm run build -w storefront
npm run build -w cms
```

## Known Limitations

- Cloudinary automatic upload adapters are not implemented yet.
  - Storefront can render Cloudinary URLs.
  - Payload/Vendure still need proper storage integration if automatic uploads are required.

- Render Free services can sleep.
  - This is accepted for a personal/student project.

- Vendure worker in-process is only safe with one Render instance.
  - Do not scale the Vendure service above 1 while `RUN_WORKER_IN_PROCESS=true`.

- Payload `DB_PUSH=true` is acceptable for demo/free-tier but not ideal for serious production.

## Old Deployment Path Status

The project has committed to the Vercel + Render free-tier direction.

Removed:

- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-prod.yml`
- `my-shop/docker-compose.yml`
- `my-shop/nginx/nginx.conf`

Replaced:

- `.github/workflows/ci.yml`
  - Now validates lint, typecheck, and builds only.
  - It no longer runs Docker Compose or GHCR/SSH deployment.

Keep:

- `my-shop/apps/*/Dockerfile`
  - Render still uses Dockerfiles for Vendure and Payload.
  - Do not remove Dockerfiles unless Render is changed to native Node builds.
