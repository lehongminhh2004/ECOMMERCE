import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'
import { Client } from 'pg'

const requiredEnv = [
  'DATABASE_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`)
  }
}

const dryRun = process.argv.includes('--dry-run')
const repoRoot = process.cwd()
const assetRoot = path.join(repoRoot, 'apps/server/static/assets')
const schema = process.env.DB_SCHEMA || 'public'
const folder = process.env.CLOUDINARY_FOLDER || 'vendure-assets'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function isRemote(value) {
  return value?.startsWith('http://') || value?.startsWith('https://')
}

function normalizeIdentifier(value) {
  return value.replace(/\\/g, '/').replace(/^\/+/, '')
}

function publicIdFor(identifier) {
  const normalized = normalizeIdentifier(identifier)
  return `${folder}/${normalized.replace(/\.[^/.]+$/, '')}`
}

async function uploadIdentifier(identifier) {
  const normalized = normalizeIdentifier(identifier)
  const filePath = path.join(assetRoot, normalized)
  await fs.access(filePath)

  if (dryRun) {
    return `dry-run:${publicIdFor(normalized)}`
  }

  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicIdFor(normalized),
    overwrite: true,
    resource_type: 'auto',
  })

  return result.secure_url
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

try {
  const query = `
    SELECT id, source, preview
    FROM "${schema}"."asset"
    WHERE source NOT LIKE 'http%' OR preview NOT LIKE 'http%'
    ORDER BY id ASC
  `
  const { rows } = await client.query(query)

  console.log(`Found ${rows.length} Vendure assets with local identifiers.`)

  let updated = 0
  let missing = 0

  for (const row of rows) {
    try {
      const nextSource = isRemote(row.source) ? row.source : await uploadIdentifier(row.source)
      const nextPreview = isRemote(row.preview) ? row.preview : await uploadIdentifier(row.preview)

      if (!dryRun) {
        await client.query(
          `UPDATE "${schema}"."asset" SET source = $1, preview = $2, "updatedAt" = NOW() WHERE id = $3`,
          [nextSource, nextPreview, row.id],
        )
      }

      updated += 1
      console.log(`${dryRun ? 'Would update' : 'Updated'} asset ${row.id}`)
    } catch (error) {
      missing += 1
      console.error(`Skipped asset ${row.id}: ${error.message}`)
    }
  }

  console.log(`${dryRun ? 'Dry run complete' : 'Migration complete'}. Updated=${updated}, skipped=${missing}.`)
} finally {
  await client.end()
}
