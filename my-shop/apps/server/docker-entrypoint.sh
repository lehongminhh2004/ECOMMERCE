#!/bin/sh
set -e

echo "==> Running Vendure migrations..."
node apps/server/dist/index.js --run-migrations

echo "==> Starting Vendure server..."
exec node apps/server/dist/index.js
