# my-shop

Full-stack e-commerce monorepo for a personal/student project.

## Stack

- `apps/server`: Vendure commerce backend, dashboard, worker, GraphQL APIs.
- `apps/storefront`: Next.js storefront.
- `apps/cms`: Payload CMS for pages, blog, navigation and footer content.

## Deployment Direction

The project now targets a 0-cost personal deployment path:

- Storefront: Vercel Hobby.
- Vendure server + in-process worker: Render Free Web Service.
- Payload CMS: Render Free Web Service.
- Database: Neon Free or Supabase Free Postgres.
- Media: Cloudinary Free.
- CI: GitHub Actions for validation only.

The old GHCR + SSH + Docker Compose + Nginx deployment path has been removed.

## Important Files

- `../render.yaml`: Render Blueprint for Vendure and Payload CMS.
- `.env.free-tier.example`: environment variable reference for Vercel and Render.
- `docs/free-tier-deployment-guide.md`: step-by-step deployment guide.
- `docs/agent-handoff-free-tier-deploy.md`: context handoff for future agents.
- `.github/workflows/ci.yml`: lint, typecheck and build validation.

## Local Development

Install dependencies from the monorepo root:

```bash
npm ci
```

Run all apps locally:

```bash
npm run dev
```

Default local ports:

- Vendure: `http://localhost:3000`
- Storefront: `http://localhost:3001`
- Payload CMS: `http://localhost:3002`

You still need a Postgres database available to the apps. Use a local Postgres instance or a free cloud Postgres connection string in local env files.

## Build

```bash
npm run build
```

Or build individually:

```bash
npm run build -w server
npm run build -w storefront
npm run build -w cms
```

## Vendure Operations

Run migrations after building the server:

```bash
npm run build -w server
npm run migration:run -w server
```

On Render Shell, the equivalent command is:

```bash
node apps/server/dist/index.js --run-migrations
```

## Deployment Notes

- Render uses the Vendure and Payload Dockerfiles.
- Vercel builds the Storefront from the monorepo.
- `RUN_WORKER_IN_PROCESS=true` is intended only for single-instance Render Free deployment.
- Cloudinary automatic upload adapters are not implemented yet; Storefront is already allowed to render `res.cloudinary.com` images.
