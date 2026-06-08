/**
 * Standalone migration runner for production (Docker/Render).
 * Called by docker-entrypoint.sh before the CMS server starts.
 * Does NOT require tsconfig.json or payload.config.ts to be present at runtime.
 */
import config from '../payload.config'
import { getPayload } from 'payload'

async function runMigrations() {
  console.log('==> Connecting to database...')
  const payload = await getPayload({ config })

  console.log('==> Running pending Payload migrations...')
  await payload.db.migrate()

  console.log('==> Migrations complete.')
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
