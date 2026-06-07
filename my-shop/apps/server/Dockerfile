# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo config files
COPY package.json package-lock.json ./

# Copy all packages/apps package.json files so npm install can resolve workspaces
COPY apps/storefront/package.json ./apps/storefront/
COPY apps/cms/package.json ./apps/cms/
COPY apps/server/package.json ./apps/server/

# Install dependencies for the entire monorepo
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the server (compiles typescript code to dist/)
RUN npm run build -w server

# Build the admin dashboard
RUN npm run build:dashboard -w server

# Stage 2: Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy monorepo dependencies and workspaces config
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/static ./apps/server/static
COPY --from=builder /app/apps/server/dist/dashboard ./apps/server/dist/dashboard

# Expose backend port
EXPOSE 3000

# CMD is overridden in docker-compose.yml for worker vs server
CMD ["node", "apps/server/dist/index.js"]
