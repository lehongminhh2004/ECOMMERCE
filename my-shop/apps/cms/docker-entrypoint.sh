#!/bin/sh
set -e

echo "==> Running Payload migrations..."
# standalone build bundles node_modules at /app/apps/cms/node_modules
node /app/apps/cms/node_modules/.bin/payload migrate

echo "==> Starting Payload CMS..."
exec node /app/apps/cms/server.js
