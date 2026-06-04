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
ENV NODE_ENV=production

# Build the CMS
RUN npm run build -w cms

# Stage 2: Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Copy the standalone build output
COPY --from=builder /app/apps/cms/.next/standalone ./
# Copy public assets and static files which Next.js does not copy to standalone by default
COPY --from=builder /app/apps/cms/public ./apps/cms/public
COPY --from=builder /app/apps/cms/.next/static ./apps/cms/.next/static
# Copy media
COPY --from=builder /app/apps/cms/media ./apps/cms/media

EXPOSE 3002

CMD ["node", "apps/cms/server.js"]
