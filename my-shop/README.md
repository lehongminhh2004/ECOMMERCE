# my-shop

A modern full-stack e-commerce monorepo built with [Vendure](https://www.vendure.io/), [Next.js](https://nextjs.org/), and [Payload CMS](https://payloadcms.com/).

## Project Structure

This is a monorepo using npm workspaces:

```
my-shop/
├── apps/
│   ├── server/       # Vendure backend (GraphQL API, Admin Dashboard) - Port 3000
│   ├── storefront/   # Next.js frontend - Port 3001
│   └── cms/          # Payload CMS (v3) headless content builder - Port 3002
├── docker-compose.yml # Root Compose configuration for orchestrating all services
└── package.json      # Root workspace configuration
```

---

## Getting Started

### Method 1: Running with Docker (Recommended for Production / CI/CD / Single-Command Start)

You can build and start all services (PostgreSQL, Vendure Server, Vendure Worker, Payload CMS, and Next.js Storefront) using the root `docker-compose.yml`:

```bash
# Build and run all services in detached mode
docker compose up --build -d
```

#### Access Points:
- **Storefront**: [http://localhost:3001](http://localhost:3001)
- **Payload CMS Admin Panel**: [http://localhost:3002/admin](http://localhost:3002/admin)
- **Payload CMS REST API**: [http://localhost:3002/api](http://localhost:3002/api)
- **Vendure Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Shop GraphQL API**: [http://localhost:3000/shop-api](http://localhost:3000/shop-api)
- **Admin GraphQL API**: [http://localhost:3000/admin-api](http://localhost:3000/admin-api)

#### Data Persistence & Volumes:
- `postgres_db_data` (external: `server_postgres_db_data`): Persists the PostgreSQL database shared by both Vendure and Payload CMS.
- `vendure_assets`: Persists Vendure product image uploads (`apps/server/static/assets`).
- `cms_media`: Persists Payload CMS media uploads (`apps/cms/media`).

---

### Method 2: Running Locally (Development Mode)

If you prefer to run services natively on your host machine for development:

1. **Start the database only** using Docker (maps to port 6543):
   ```bash
   # Switch to server folder to start postgres
   cd apps/server
   docker compose up -d postgres_db
   cd ../..
   ```

2. **Start all dev servers** concurrently from the root directory:
   ```bash
   npm run dev
   ```

3. **Stop all dev servers** and free up ports:
   Press `Ctrl + C` in the terminal. If node processes hang, run:
   ```powershell
   # Windows PowerShell
   taskkill /F /IM node.exe
   ```

---

## Admin Credentials

- **Vendure Dashboard**:
  - **Username**: `superadmin`
  - **Password**: `superadmin`
- **Payload CMS Admin Panel**:
  - Create your own credentials upon visiting [http://localhost:3002/admin](http://localhost:3002/admin) for the first time.

---

## Production Build

To build all packages natively:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

## CI/CD and Docker Deployment Guidelines

For deploying the applications via Docker:
- Both `apps/storefront` and `apps/cms` are configured with **Next.js Standalone Build** (`output: 'standalone'`). This compiles a minimal server file containing only required files and node_modules dependencies, minimizing the runner stage image size.
- Environment variables are divided for internal (container-to-container) and external (client-to-container) network routing:
  - **RSC / SSR (Server-side):** Uses internal Docker network URLs (`http://vendure_server:3000/...` and `http://payload_cms:3002/...`).
  - **Browser (Client-side):** Uses host-forwarded URLs (`http://localhost:3000/...` and `http://localhost:3002/...`).

---

## Troubleshooting & Important Notes

### 1. Port Access Guidelines
- **PostgreSQL Database (`localhost:6543`)**: This is a database connection port. Do not access it via a web browser (it will fail and log `invalid length of startup packet`). Use a database client like DBeaver, TablePlus, or pgAdmin to connect.
- **Vendure Backend (`localhost:3000`)**: The root `/` path returns a 404. Navigate directly to `/dashboard` for the admin panel, `/shop-api` / `/admin-api` for GraphQL, or `/health` for health checks.
- **Payload CMS (`localhost:3002`)**: The root `/` path may return a 404. Access the admin dashboard via `/admin` or APIs via `/api`.

### 2. Windows to Linux/Docker Database Migrations (Broken Images Fix)
If you import a database dump generated on Windows, paths in the `asset` table will contain Windows backslashes (`\`). On Linux/Docker environments, these backslashes cause broken image links.
Fix this by running the following SQL query inside your PostgreSQL database:
```sql
UPDATE asset SET source = replace(source, '\', '/'), preview = replace(preview, '\', '/');
```

### 3. Dynamic Asset URL Prefix
The `vendure_server` accepts an `ASSET_URL_PREFIX` environment variable. If not set, it defaults to dynamic detection based on the incoming request header (e.g., `http://localhost:3000/assets/...` for browsers, or `http://vendure_server:3000/assets/...` for server-side Next.js fetches).


