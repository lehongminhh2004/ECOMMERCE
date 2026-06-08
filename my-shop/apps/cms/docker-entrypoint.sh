#!/bin/sh
set -e

echo "==> Running Payload migrations..."
# Run migration script via tsx from the cms app directory so that
# tsconfig paths (@/*) and @payload-config alias resolve correctly.
cd /app/apps/cms
node /app/node_modules/.bin/tsx src/migrate.ts

echo "==> Starting Payload CMS..."
exec node /app/apps/cms/server.js
