# Network and Port Mapping Rules

## Local Development Ports

| Port | Service | Description |
| :--- | :--- | :--- |
| `3000` | Vendure Server | Dashboard, Admin API and Shop API |
| `3001` | Storefront | Next.js customer-facing app |
| `3002` | Payload CMS | CMS admin and REST API |
| `5173` | Vendure Dashboard Dev | Vite hot reload for dashboard development only |

## Local URLs

- Vendure Dashboard: `http://localhost:3000/dashboard`
- Vendure Shop API: `http://localhost:3000/shop-api`
- Vendure Admin API: `http://localhost:3000/admin-api`
- Storefront: `http://localhost:3001`
- Payload Admin: `http://localhost:3002/admin`
- Payload API: `http://localhost:3002/api`

## Cloud URL Rules

- Storefront server-side code uses `VENDURE_SHOP_API_URL` and `PAYLOAD_API_URL`.
- Browser/client-facing values use `NEXT_PUBLIC_VENDURE_SHOP_API_URL` and `NEXT_PUBLIC_PAYLOAD_API_URL`.
- Do not use Docker service names such as `vendure_server` or `payload_cms` in the active Vercel + Render deployment path.

## Constraints

- Do not bind another service to ports `3000`, `3001`, `3002`, or `5173`.
- Do not assume a local Docker Postgres port. Use local env or a cloud Postgres connection string.
