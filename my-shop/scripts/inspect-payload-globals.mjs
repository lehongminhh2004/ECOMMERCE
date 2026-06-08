import { Client } from 'pg'

if (!process.env.DATABASE_URI) {
  throw new Error('Missing DATABASE_URI')
}

const client = new Client({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

try {
  const tables = await client.query(`
    select table_schema, table_name
    from information_schema.tables
    where table_schema in ('public', 'payload')
      and table_name in (
        'navigation',
        'navigation_links',
        'footer',
        'footer_links',
        'footer_social_links',
        'media',
        'media_locales'
      )
    order by table_schema, table_name
  `)

  const navigation = await client.query('select * from public.navigation order by id limit 5')
  const navigationLinks = await client.query('select * from public.navigation_links order by _order limit 10')
  const footer = await client.query('select * from public.footer order by id limit 5')
  const footerLinks = await client.query('select * from public.footer_links order by _order limit 10')
  const footerSocialLinks = await client.query('select * from public.footer_social_links order by _order limit 10')

  console.log(JSON.stringify({
    tables: tables.rows,
    navigation: navigation.rows,
    navigationLinks: navigationLinks.rows,
    footer: footer.rows,
    footerLinks: footerLinks.rows,
    footerSocialLinks: footerSocialLinks.rows,
  }, null, 2))
} finally {
  await client.end()
}
