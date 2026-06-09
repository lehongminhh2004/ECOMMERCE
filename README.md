# ECOMMERCE

A full-stack ecommerce system built as a monorepo. The project separates the customer storefront, commerce backend, and content management system so each part can be deployed and scaled independently.

## System Overview

This project is composed of three main applications:

| Layer | App | Responsibility |
| --- | --- | --- |
| Customer Experience | `my-shop/apps/storefront` | Public storefront for browsing products, switching language/currency, cart, checkout, account pages, blog, and marketing pages |
| Commerce Engine | `my-shop/apps/server` | Vendure backend for catalog, variants, prices, orders, customers, promotions, search index, assets, and Shop/Admin GraphQL APIs |
| Content Management | `my-shop/apps/cms` | Payload CMS for editable pages, navigation, footer, blog posts, banners, and CMS media |

The storefront is the only customer-facing application. Vendure and Payload are admin/backend systems used to manage commerce data and editorial content.

## Architecture

```text
Customer
   |
   v
Next.js Storefront on Vercel
   |                    |
   | Vendure Shop API   | Payload REST API
   v                    v
Vendure on Render    Payload CMS on Render
   |                    |
   +--------+-----------+
            v
       Neon Postgres
            |
            v
       Cloudinary Media
```

## Core Flows

- Product browsing: Storefront queries Vendure Shop API for products, collections, variants, prices, stock, and search results.
- Product detail: Storefront loads product data from Vendure by slug and renders localized product pages.
- Cart and checkout: Storefront sends cart, coupon, shipping, and checkout mutations to Vendure.
- Content pages: Storefront reads pages, navigation, footer, blog posts, and banners from Payload CMS.
- Media delivery: Vendure and Payload media are stored in Cloudinary so images survive Render redeploys.
- Localization: Storefront supports English and Vietnamese routes, with locale-based currency defaults.
- Currency: English defaults to USD, Vietnamese defaults to VND. Vendure stores prices for both currencies.

## Live Demo

| App | URL | Purpose |
| --- | --- | --- |
| Storefront | https://ecommerce-t6vv.vercel.app | Customer-facing ecommerce website |
| Vendure Admin | https://my-shop-vendure.onrender.com/dashboard | Commerce admin for products, orders, customers, promotions, assets |
| Payload CMS Admin | https://my-shop-payload-cms.onrender.com/admin | CMS admin for pages, blog, navigation, footer, banners |

## Demo Access

Admin dashboards should not use production superadmin credentials for public review.

For reviewers, create separate demo accounts with limited permissions and share them outside the repository:

- Vendure demo admin: catalog/orders/promotions access only.
- Payload demo editor: content editing access only.

Do not publish production secrets, database URLs, Cloudinary secrets, superadmin passwords, or private environment variables in this repository.

## Tech Stack

- Monorepo: npm workspaces
- Storefront: Next.js, React, next-intl, Tailwind CSS
- Commerce: Vendure, GraphQL, PostgreSQL
- CMS: Payload CMS
- Database: Neon Postgres
- Media: Cloudinary
- Deployment: Vercel for storefront, Render for Vendure and Payload
- CI: GitHub Actions for validation

## Repository Structure

```text
.
|-- my-shop/
|   |-- apps/
|   |   |-- storefront/     # Next.js customer storefront
|   |   |-- server/         # Vendure server, worker, dashboard, APIs
|   |   `-- cms/            # Payload CMS
|   |-- rules/              # Architecture, ports, runtime, styling rules
|   `-- README.md           # Inner monorepo development notes
|-- render.yaml             # Render Blueprint for Vendure and Payload
`-- README.md               # Public project overview
```

## Important Files

- `my-shop/AGENTS.md`: repository rules for coding agents.
- `my-shop/rules/`: architecture, ports, deployment/runtime and styling rules.
- `render.yaml`: Render Blueprint for Vendure and Payload CMS.
- `my-shop/.env.free-tier.example`: environment variable reference for Vercel and Render.
- `.github/workflows/ci.yml`: lint, typecheck and build validation.

## Local Development

Install dependencies from the monorepo app root:

```bash
cd my-shop
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

You need a PostgreSQL database available to the apps. Use a local Postgres instance or a free cloud Postgres connection string in local env files.

## Build

From `my-shop`:

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

## Deployment Model

The three apps are deployed separately:

- Vercel deploy exposes only the customer storefront.
- Render `my-shop-vendure` exposes Vendure Shop API, Admin API, worker, and dashboard.
- Render `my-shop-payload-cms` exposes Payload CMS Admin and CMS API.
- `RUN_WORKER_IN_PROCESS=true` is intended only for single-instance Render Free deployment.
- Cloudinary is used for durable media storage in production.

If using a custom domain, map the apps as separate subdomains:

- `shop.example.com` -> Vercel storefront
- `admin.example.com` -> Vendure dashboard
- `cms.example.com` -> Payload admin
