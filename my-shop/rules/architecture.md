# System Architecture & Clean Code Rules

This monorepo is organized as independent npm workspaces under `apps/`. Keep boundaries strict.

## 1. Application Roles

### Vendure Server (`apps/server`)

- Owns commerce data and behavior: catalog, products, variants, pricing, carts, checkout, orders, customers, admin dashboard and job queue.
- Must not contain storefront layout, blog rendering, CMS page content, or customer-facing React UI.
- Render Free deployment may run worker in-process through `RUN_WORKER_IN_PROCESS=true`.

### Payload CMS (`apps/cms`)

- Owns editorial/content data: pages, blog posts, navigation, footer and CMS media metadata.
- Must not contain checkout, payment, order processing, product pricing or other transactional commerce behavior.
- Content localization belongs here when the content is authored by CMS admins.

### Storefront (`apps/storefront`)

- Owns customer-facing UI.
- Reads commerce data through Vendure APIs.
- Reads content data through Payload APIs.
- Must not connect directly to Postgres or read backend files directly.

## 2. Deployment Direction

The active deployment direction is the free-tier provider setup:

- Storefront: Vercel Hobby.
- Vendure server + worker: Render Free Web Service.
- Payload CMS: Render Free Web Service.
- Database: Neon Free or Supabase Free Postgres.
- Media: Cloudinary Free.
- CI: GitHub Actions validation only.

The old GHCR + SSH + Docker Compose + Nginx deployment path has been removed.

## 3. CI/CD Rules

- GitHub Actions should validate code only: lint, typecheck and build.
- Vercel and Render provider integrations handle deployment.
- Do not reintroduce GHCR push, SSH deploy, Docker Compose smoke test or Nginx proxy deployment unless the deployment strategy changes again.
- Keep `render.yaml` at the repository root because Render Blueprint reads from the Git repository root.

## 4. Database Rules

- Storefront must never access the database directly.
- Vendure and Payload may share the same free-tier Postgres instance for a student project.
- Prefer separate schemas if possible:
  - Vendure: `public` or `vendure`.
  - Payload: `payload`.
- Keep connection pools low on free-tier:
  - Vendure: `VENDURE_DB_POOL_MAX=6`.
  - Payload: `PAYLOAD_DB_POOL_MAX=4`.
- Use SSL for cloud Postgres:
  - `DB_SSL=true`.

## 5. Asset Rules

- Storefront may render Cloudinary URLs.
- Do not rely on Render filesystem for important uploaded assets.
- Do not implement upload logic directly inside large config files if it grows beyond simple composition.
- Prefer dedicated Vendure/Payload storage adapters or small isolated modules.

## 6. Localization Rules

- Storefront supports `en` and `vi`.
- Vendure product data should be indexed for both languages.
- Payload CMS content fields intended for end users should be localized.
- Currency follows route locale for this project:
  - `en -> USD`.
  - `vi -> VND`.

## 7. Code Organization Rules

- Keep config files as composition roots, not business logic containers.
- Add new files only when they fit an existing domain/module boundary.
- Do not duplicate API clients or currency/locale logic.
- Keep changes minimal and scoped to the requested behavior.
