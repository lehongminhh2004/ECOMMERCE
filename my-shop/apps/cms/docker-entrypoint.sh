#!/bin/sh
set -e

echo "==> Running Payload migrations..."
# payload CLI is in the root node_modules (copied from builder stage)
node /app/node_modules/.bin/payload migrate

echo "==> Starting Payload CMS..."
exec node /app/apps/cms/server.js
