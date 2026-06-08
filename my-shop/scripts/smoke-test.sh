#!/usr/bin/env bash
# smoke-test.sh — Run after a provider redeploy to verify all endpoints are alive.
#
# Usage:
#   VENDURE_URL=https://my-shop-vendure.onrender.com \
#   PAYLOAD_URL=https://my-shop-payload.onrender.com \
#   STOREFRONT_URL=https://my-shop.vercel.app \
#   ./scripts/smoke-test.sh

set -euo pipefail

VENDURE_URL="${VENDURE_URL:-}"
PAYLOAD_URL="${PAYLOAD_URL:-}"
STOREFRONT_URL="${STOREFRONT_URL:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass=0
fail=0

check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"

  printf "  %-55s" "$label"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url" || echo "000")

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ $status${NC}"
    ((pass++)) || true
  else
    echo -e "${RED}✗ $status (expected $expected_status)${NC}"
    ((fail++)) || true
  fi
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  my-shop Smoke Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$VENDURE_URL" ]; then
  echo ""
  echo -e "${YELLOW}Vendure Server (${VENDURE_URL})${NC}"
  check "Health endpoint"        "$VENDURE_URL/health"       200
  check "Shop API (GraphQL)"     "$VENDURE_URL/shop-api"     200
  check "Admin Dashboard"        "$VENDURE_URL/dashboard"    200
else
  echo -e "${YELLOW}[SKIP] VENDURE_URL not set${NC}"
fi

if [ -n "$PAYLOAD_URL" ]; then
  echo ""
  echo -e "${YELLOW}Payload CMS (${PAYLOAD_URL})${NC}"
  check "Admin panel"    "$PAYLOAD_URL/admin"   200
  check "REST API root"  "$PAYLOAD_URL/api"     200
else
  echo -e "${YELLOW}[SKIP] PAYLOAD_URL not set${NC}"
fi

if [ -n "$STOREFRONT_URL" ]; then
  echo ""
  echo -e "${YELLOW}Storefront (${STOREFRONT_URL})${NC}"
  check "English route"     "$STOREFRONT_URL/en"   200
  check "Vietnamese route"  "$STOREFRONT_URL/vi"   200
else
  echo -e "${YELLOW}[SKIP] STOREFRONT_URL not set${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Results: ${GREEN}${pass} passed${NC}  ${RED}${fail} failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$fail" -gt 0 ]; then
  exit 1
fi
