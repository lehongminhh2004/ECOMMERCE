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

# Set env to production for build
ARG VENDURE_SHOP_API_URL=http://localhost:3000/shop-api
ARG NEXT_PUBLIC_VENDURE_SHOP_API_URL=http://localhost:3000/shop-api
ARG NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3002/api

ENV NODE_ENV=production
ENV VENDURE_SHOP_API_URL=$VENDURE_SHOP_API_URL
ENV NEXT_PUBLIC_VENDURE_SHOP_API_URL=$NEXT_PUBLIC_VENDURE_SHOP_API_URL
ENV NEXT_PUBLIC_PAYLOAD_API_URL=$NEXT_PUBLIC_PAYLOAD_API_URL

# Build the storefront
RUN npm run build -w storefront

# Stage 2: Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Copy the standalone build output
COPY --from=builder /app/apps/storefront/.next/standalone ./
# Copy public assets and static files which Next.js does not copy to standalone by default
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static

EXPOSE 3001

CMD ["node", "apps/storefront/server.js"]
