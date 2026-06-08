import { Client } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var: DATABASE_URL')
}

const schema = process.env.DB_SCHEMA || 'public'
const channelId = Number(process.env.VENDURE_CHANNEL_ID || 1)

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flat()
  }

  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function serializeLike(original, values) {
  if (Array.isArray(original)) {
    return values
  }

  if (original && typeof original === 'object') {
    return values
  }

  return values.join(',')
}

await client.connect()

try {
  const { rows } = await client.query(
    `SELECT id, "availableLanguageCodes", "availableCurrencyCodes"
     FROM "${schema}"."channel"
     WHERE id = $1`,
    [channelId],
  )

  if (!rows.length) {
    throw new Error(`Channel ${channelId} not found`)
  }

  const channel = rows[0]
  const languages = Array.from(new Set([...normalizeList(channel.availableLanguageCodes), 'en', 'vi']))
  const currencies = Array.from(new Set([...normalizeList(channel.availableCurrencyCodes), 'USD', 'VND']))

  await client.query(
    `UPDATE "${schema}"."channel"
     SET "availableLanguageCodes" = $1,
         "availableCurrencyCodes" = $2,
         "updatedAt" = NOW()
     WHERE id = $3`,
    [
      serializeLike(channel.availableLanguageCodes, languages),
      serializeLike(channel.availableCurrencyCodes, currencies),
      channelId,
    ],
  )

  console.log(JSON.stringify({
    channelId,
    availableLanguageCodes: languages,
    availableCurrencyCodes: currencies,
  }, null, 2))
} finally {
  await client.end()
}
