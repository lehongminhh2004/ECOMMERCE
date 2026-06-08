# DB Neon Patch Guide — Fix `administrator.emailAddress` Crash

## Root cause

The error `column "emailAddress" of relation "administrator" does not exist` (or similar)
occurs when the Vendure server tries to start against a Postgres DB that has not yet had
its schema migrations applied.

This happens in two scenarios on Neon/free-tier:

1. **First deploy** — DB is empty, `DB_SYNCHRONIZE=false`, no migrations have run.
2. **Re-deploy after schema change** — a new Vendure version added a column but migrations
   were not re-run.

## Fix — Run Vendure migrations via Render Shell

On the Render dashboard for the `my-shop-vendure` service:

1. Go to **Shell** tab (or use Render CLI).
2. Run:

```bash
node apps/server/dist/index.js --run-migrations
```

This is the safe, idempotent migration runner wired in `src/index.ts`.

## Fix — Run Payload migrations via Render Shell

On the Render dashboard for the `my-shop-payload-cms` service:

```bash
node apps/cms/node_modules/.bin/payload migrate
```

This runs all pending migrations registered in `src/migrations/index.ts`,
including the recently added `20260608_add_coupon_code` migration.

## One-time SQL patch (emergency)

If you need to unblock a running server **immediately** without a redeploy,
connect to Neon via their SQL Editor and run:

```sql
-- Vendure: ensure administrator table has emailAddress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'administrator'
      AND column_name  = 'email_address'
  ) THEN
    ALTER TABLE "administrator" ADD COLUMN "email_address" character varying NOT NULL DEFAULT '';
  END IF;
END
$$;

-- Payload: ensure posts table has coupon_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'posts'
      AND column_name  = 'coupon_code'
  ) THEN
    ALTER TABLE "posts" ADD COLUMN "coupon_code" varchar;
  END IF;
END
$$;
```

> **Note**: The SQL patch is an emergency workaround only. Always run proper
> migrations afterwards so the migration state table stays consistent.

## Verify after migration

```bash
# Vendure health
curl https://my-shop-vendure.onrender.com/health

# Payload admin (should load the login page, not crash)
curl -I https://my-shop-payload.onrender.com/admin
```

## Prevent recurrence

- `DB_SYNCHRONIZE=false` must remain set in production (it is already in `render.yaml`).
- Every new Vendure/Payload migration must be tested locally before merging.
- For Payload: always register new migration files in `src/migrations/index.ts`
  (the `20260608_add_coupon_code` omission has been fixed in this commit).
