# System Architecture & Clean Code Rules

This monorepo is organized as independent npm workspaces under `apps/`. Keep boundaries strict.

## 1. Application Roles

### Vendure Server (`apps/server`)

- Owns commerce data and behavior: catalog, products, variants, pricing, carts, checkout, orders, customers, admin dashboard and job queue.
- Must not contain storefront layout, blog rendering, CMS page content, or customer-facing React UI.
- Runs server and worker in the same process on Render Free via `RUN_WORKER_IN_PROCESS=true`.
- Asset storage uses `CloudinaryAssetStorageStrategy` (`apps/server/src/plugins/cloudinary-asset-storage.ts`) in production. Activated by `ASSET_STORAGE=cloudinary`. Falls back to local disk when unset — local dev needs no extra config.

### Payload CMS (`apps/cms`)

- Owns editorial/content data: pages, blog posts, navigation, footer and CMS media metadata.
- Must not contain checkout, payment, order processing, product pricing or other transactional commerce behavior.
- Content localization belongs here when the content is authored by CMS admins.
- Media uploads use `payloadcms-storage-cloudinary` plugin. Auto-activated when all three `CLOUDINARY_*` env vars are present. Falls back to local disk in dev.

### Storefront (`apps/storefront`)

- Owns customer-facing UI.
- Reads commerce data through Vendure APIs.
- Reads content data through Payload APIs.
- Must not connect directly to Postgres or read backend files directly.
- Must not block builds on Vendure or Payload being reachable — all external fetches must have safe fallbacks and timeouts.

## 2. Deployment Direction

The active deployment stack (do not change without updating all rules):

| Service | Provider |
|---------|----------|
| Storefront | Vercel Hobby |
| Vendure server + worker | Render Free (Docker) |
| Payload CMS | Render Free (Docker) |
| Database | Neon Free Postgres |
| Media | Cloudinary Free |
| CI | GitHub Actions (validate only) |

The old GHCR + SSH + Docker Compose + Nginx path has been removed. Do not reintroduce it.

For detailed env vars, Docker specifics, migration commands and debugging steps see `rules/deployment-runtime.md`.

## 3. CI/CD Rules

- GitHub Actions validates only: lint, typecheck, build. It does not deploy.
- Vercel and Render handle deployment via Git integration.
- `render.yaml` lives at the **repository root** — Render Blueprint reads from there, not from `my-shop/`.
- After adding or removing npm packages, always run `npm install` from `my-shop/` and commit the updated `package-lock.json` together with the package.json change. CI uses `npm ci` and will fail if they are out of sync.
- Do not reintroduce GHCR push, SSH deploy, Docker Compose smoke test or Nginx proxy.

## 4. Database Rules

- Storefront must never access the database directly.
- Vendure and Payload may share the same Neon free-tier Postgres instance but must use separate schemas:
  - Vendure: `public`
  - Payload: `payload`
- Connection pools must stay low on free-tier:
  - Vendure: `VENDURE_DB_POOL_MAX=6`
  - Payload: `PAYLOAD_DB_POOL_MAX=4`
- `DB_SYNCHRONIZE` (Vendure) must always be `false` in production.
- `DB_PUSH` (Payload) must always be `false` in production.
- Schema changes go through explicit migrations, not auto-sync.

## 5. Migration Rules

### Vendure
- Migrations run automatically on container boot via `docker-entrypoint.sh` (idempotent).
- Never use `DB_SYNCHRONIZE=true` to apply schema changes.

### Payload
- Every new migration file in `apps/cms/src/migrations/` **must** be registered in `apps/cms/src/migrations/index.ts`. A file that exists but is not registered will never run.
- Migrations run via `apps/cms/src/migrate.ts` executed by `tsx` in `docker-entrypoint.sh`.
- The Payload CLI (`payload migrate`) does not work in production Docker images — it requires `tsconfig.json` at runtime which is absent in standalone builds. Always use `src/migrate.ts`.
- To create a new migration locally: `npm run migrate:create -w cms`.

## 6. Asset Rules

- Render filesystem is ephemeral — files written to disk are lost on every redeploy or sleep cycle.
- Cloudinary is the only durable media store. Do not upload assets to Render disk and expect them to persist.
- Use separate `CLOUDINARY_FOLDER` per service:
  - Vendure: `vendure-assets`
  - Payload: `payload-cms`
- Storefront may render Cloudinary URLs directly (`res.cloudinary.com` is already in `next.config.ts` remotePatterns).
- Do not implement upload logic inside large config files — keep it in isolated modules or adapter files.

## 7. Localization Rules

- Storefront supports `en` and `vi`.
- Vendure product data should be indexed for both languages.
- Payload CMS content fields intended for end users should be localized.
- Currency follows route locale:
  - `en → USD`
  - `vi → VND`

## 8. Code Organization Rules

- Keep config files as composition roots, not business logic containers.
- Add new files only when they fit an existing domain/module boundary.
- Do not duplicate API clients or currency/locale logic.
- Keep changes minimal and scoped to the requested behavior.
- Validate environment-derived URLs before using `new URL()` or fetch logic.
