import { Client } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var: DATABASE_URL')
}

const schema = process.env.DB_SCHEMA || 'public'
const channelId = Number(process.env.VENDURE_CHANNEL_ID || 1)
const vndPerUsd = Number(process.env.VND_PER_USD || 25000)
const dryRun = process.argv.includes('--dry-run')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

try {
  const { rows: columns } = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = 'product_variant_price'
     ORDER BY ordinal_position`,
    [schema],
  )
  const columnNames = columns.map(column => column.column_name)

  for (const required of ['currencyCode', 'price', 'channelId', 'variantId']) {
    if (!columnNames.includes(required)) {
      throw new Error(`Missing product_variant_price column: ${required}. Found: ${columnNames.join(', ')}`)
    }
  }

  const { rows: missing } = await client.query(
    `SELECT usd.*
     FROM "${schema}"."product_variant_price" usd
     WHERE usd."channelId" = $1
       AND usd."currencyCode" = 'USD'
       AND NOT EXISTS (
         SELECT 1
         FROM "${schema}"."product_variant_price" vnd
         WHERE vnd."channelId" = usd."channelId"
           AND vnd."variantId" = usd."variantId"
           AND vnd."currencyCode" = 'VND'
       )
     ORDER BY usd."variantId"`,
    [channelId],
  )

  console.log(`Found ${missing.length} variants missing VND prices.`)

  if (!dryRun) {
    for (const usd of missing) {
      const vndPrice = Math.max(1, Math.round((Number(usd.price) / 100) * vndPerUsd))

      await client.query(
        `INSERT INTO "${schema}"."product_variant_price"
           ("createdAt", "updatedAt", "currencyCode", "channelId", "price", "variantId")
         VALUES (NOW(), NOW(), 'VND', $1, $2, $3)`,
        [usd.channelId, vndPrice, usd.variantId],
      )
    }
  }

  console.log(JSON.stringify({
    channelId,
    vndPerUsd,
    created: dryRun ? 0 : missing.length,
  }, null, 2))
} finally {
  await client.end()
}
