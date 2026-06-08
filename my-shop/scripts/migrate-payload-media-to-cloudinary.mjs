import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'
import { Client } from 'pg'

const requiredEnv = [
  'DATABASE_URI',
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
const mediaRoot = path.join(repoRoot, 'apps/cms/media')
const configuredSchema = process.env.PAYLOAD_DB_SCHEMA
const folder = process.env.CLOUDINARY_FOLDER || 'payload-cms'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function isRemote(value) {
  return value?.startsWith('http://') || value?.startsWith('https://')
}

function publicIdFor(filename) {
  return `${folder}/${filename.replace(/\.[^/.]+$/, '')}`
}

async function uploadFile(filename) {
  const safeFilename = path.basename(filename)
  const filePath = path.join(mediaRoot, safeFilename)
  await fs.access(filePath)

  if (dryRun) {
    return `dry-run:${publicIdFor(safeFilename)}`
  }

  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicIdFor(safeFilename),
    overwrite: true,
    resource_type: 'auto',
  })

  return result.secure_url
}

const client = new Client({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

try {
  const schemaResult = configuredSchema
    ? { rows: [{ table_schema: configuredSchema }] }
    : await client.query(`
        SELECT table_schema
        FROM information_schema.tables
        WHERE table_name = 'media'
          AND table_schema IN ('payload', 'public')
        ORDER BY CASE table_schema WHEN 'payload' THEN 0 ELSE 1 END
        LIMIT 1
      `)
  const schema = schemaResult.rows[0]?.table_schema

  if (!schema) {
    throw new Error('Could not find a media table in schema payload or public')
  }

  console.log(`Using Payload schema: ${schema}`)

  const query = `
    SELECT id, filename, url
    FROM "${schema}"."media"
    WHERE url IS NULL OR url NOT LIKE 'http%'
    ORDER BY id ASC
  `
  const { rows } = await client.query(query)

  console.log(`Found ${rows.length} Payload media records with local URLs.`)

  let updated = 0
  let missing = 0

  for (const row of rows) {
    try {
      if (!row.filename) {
        throw new Error('missing filename')
      }

      const nextUrl = isRemote(row.url) ? row.url : await uploadFile(row.filename)

      if (!dryRun) {
        await client.query(
          `UPDATE "${schema}"."media" SET url = $1, "updated_at" = NOW() WHERE id = $2`,
          [nextUrl, row.id],
        )
      }

      updated += 1
      console.log(`${dryRun ? 'Would update' : 'Updated'} media ${row.id}`)
    } catch (error) {
      missing += 1
      console.error(`Skipped media ${row.id}: ${error.message}`)
    }
  }

  console.log(`${dryRun ? 'Dry run complete' : 'Migration complete'}. Updated=${updated}, skipped=${missing}.`)
} finally {
  await client.end()
}
