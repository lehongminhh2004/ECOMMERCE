# Network and Port Mapping Rules

To prevent port conflicts and ensure correct routing inside the monorepo, developers must strictly adhere to the following port mapping conventions.

## Port Map

| Port | Service | Description | Scope |
| :--- | :--- | :--- | :--- |
| **`3000`** | Vendure Server | Node.js backend & API endpoints | Dev / Prod |
| **`3001`** | Next.js Storefront | Public storefront application | Dev / Prod |
| **`3002`** | Payload CMS | Content CMS application & admin UI | Dev / Prod |
| **`5173`** | Vite Dev Server | Vendure admin dashboard hot-reload | Dev Only |
| **`6543`** | PostgreSQL DB | Postgres database for Vendure (Docker) | Dev / Prod |

## Key Constraints

1. **Docker Compose database port:**
   - PostgreSQL must map host port `6543` to container port `5432`.
   - Host port `3306` (MariaDB/MySQL) must **not** be mapped or bound automatically unless local database instances are stopped first, to avoid port conflicts.
2. **API Endpoint Routing (Browser vs Server-Side in Docker):**
   - **Client-Side/Browser Requests:** Must communicate with APIs via public hostnames:
     - Vendure API: `http://localhost:3000/shop-api`
     - Payload CMS API: `http://localhost:3002/api`
   - **Server-Side Requests (SSR / ISR / RSC within Docker Network):** Must communicate via Docker network service names:
     - Vendure API: `http://vendure_server:3000/shop-api`
     - Payload CMS API: `http://payload_cms:3002/api`
3. **No Duplicate Vite Dashboards:**
   - Port `5173` is for hot-reloading development dashboard only.
   - Port `3000/dashboard` uses the static build.

