# Vendure Server

Vendure is the commerce engine for the ecommerce system.

## Responsibility

- Product catalog, collections, variants, and prices
- Orders, customers, carts, checkout, and promotions
- Vendure Shop GraphQL API for the storefront
- Vendure Admin API and dashboard for commerce management
- Search indexing
- Commerce asset handling with Cloudinary storage in production

## Local Development

From the `my-shop` workspace root:

```bash
npm run dev:server -w server
```

Optional worker process:

```bash
npm run dev:worker -w server
```

Default local URLs:

```text
Shop API:       http://localhost:3000/shop-api
Admin API:      http://localhost:3000/admin-api
Dashboard:      http://localhost:3000/dashboard
Health check:   http://localhost:3000/health
```

## Build

```bash
npm run build -w server
```

## Production

Production runs as the Render service `my-shop-vendure`.

Public URLs:

```text
Shop API:   https://my-shop-vendure.onrender.com/shop-api
Dashboard:  https://my-shop-vendure.onrender.com/dashboard
```

The free-tier deployment runs the worker in-process with:

```text
RUN_WORKER_IN_PROCESS=true
```

## Operations

Run migrations after building:

```bash
npm run build -w server
npm run migration:run -w server
```

On Render Shell:

```bash
node apps/server/dist/index.js --run-migrations
```

Useful scripts:

```bash
npm run enable:usd -w server
npm run reindex:search -w server
```

Media is stored in Cloudinary when `ASSET_STORAGE=cloudinary`.

