# Deployment and Runtime Rules

These rules preserve the active free-tier deployment shape and prevent build-time/runtime failures.

## 1. Provider Responsibilities

- Deploy Storefront (`apps/storefront`) to Vercel.
- Deploy Vendure (`apps/server`) to Render as a long-running web service.
- Deploy Payload CMS (`apps/cms`) to Render as a long-running web service.
- Do not deploy Vendure to Vercel serverless because it needs a persistent Node process, worker, scheduler, database pool and asset server.
- Do not reintroduce GHCR, SSH, Docker Compose or Nginx deployment unless the project explicitly changes away from the Vercel + Render direction.

## 2. Build-Time Safety

- Storefront builds must not depend on Vendure or Payload being awake, fast or reachable.
- CMS-driven dynamic pages should render at runtime or have safe fallbacks when external APIs are unavailable.
- Do not call `new URL()` on environment variables without validation or fallback.
- Do not throw at module import time for deploy environment values that can be handled during request execution.
- External API fetches in Storefront must have bounded timeout behavior.

## 3. Environment Variables

- Use absolute URLs with protocol.
- Never use placeholders such as `https://api.example.com`, `[REDACTED]`, `<service-name>` or copied example text in real provider dashboards.
- Vercel Storefront values:
  - `VENDURE_SHOP_API_URL=https://<vendure-render-url>/shop-api`
  - `NEXT_PUBLIC_VENDURE_SHOP_API_URL=https://<vendure-render-url>/shop-api`
  - `PAYLOAD_API_URL=https://<payload-render-url>/api`
  - `NEXT_PUBLIC_PAYLOAD_API_URL=https://<payload-render-url>/api`
  - `NEXT_PUBLIC_SITE_URL=https://<vercel-url>`
  - `VENDURE_CHANNEL_TOKEN=__default_channel__`
- Render Vendure values:
  - `DATABASE_URL`
  - `DB_SSL=true`
  - `DB_SYNCHRONIZE=false`
  - `RUN_WORKER_IN_PROCESS=true` only for a single free-tier instance.
  - `ASSET_URL_PREFIX=https://<vendure-render-url>/assets`
- Render Payload values:
  - `DATABASE_URI`
  - `DB_SSL=true`
  - `PAYLOAD_SECRET`
  - `STOREFRONT_REVALIDATE_URL=https://<vercel-url>/api/revalidate`
  - `REVALIDATION_SECRET`

## 4. Vendure Server and Worker

- On Render Free, Vendure may run server and worker in one service with `RUN_WORKER_IN_PROCESS=true`.
- When worker runs in-process, avoid registering scheduler cron jobs twice in the same Node process.
- Keep the service at one instance while worker runs in-process.
- Keep `/health` available and mapped to Render health checks.
- Keep normal startup separate from migrations. Run migrations explicitly with `node apps/server/dist/index.js --run-migrations`.

## 5. Docker and Build Artifacts

- Vendure Docker image must include compiled server output, static assets and dashboard build output.
- Payload Docker image must include the Next/Payload production build artifacts needed by the runtime command.
- Do not assume files generated in the builder stage exist in the runner stage unless the Dockerfile copies them.
- Keep Docker context aligned with workspace root so npm workspaces resolve correctly.

## 6. Free-Tier Reliability

- Expect Render cold starts and occasional slow first requests.
- Do not treat one slow provider response as proof that code is broken.
- Add graceful fallbacks for content/navigation/footer data where user experience can tolerate temporary missing content.
- Keep database pools small to avoid exhausting free-tier Postgres connections.
- Do not rely on Render filesystem for durable uploads; use Cloudinary or a storage adapter for persistent media.

## 7. Deployment Smoke Tests

Run these checks after deployment:

- Vendure health: `https://<vendure-render-url>/health`
- Vendure Shop API: `https://<vendure-render-url>/shop-api`
- Vendure Dashboard: `https://<vendure-render-url>/dashboard`
- Payload Admin: `https://<payload-render-url>/admin`
- Payload API: `https://<payload-render-url>/api`
- Storefront Vietnamese route: `https://<vercel-url>/vi`
- Storefront English route: `https://<vercel-url>/en`

## 8. Debugging Order

- Check provider env values before changing code.
- Check service logs for startup crashes.
- Check health endpoints before checking user-facing pages.
- Reproduce with the narrowest build command:
  - `npm run build -w server`
  - `npm run build -w storefront`
  - `npm run build -w cms`
- Only broaden to full monorepo build after the failing app passes.
