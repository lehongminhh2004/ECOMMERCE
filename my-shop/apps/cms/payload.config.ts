import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { VendureProductBlock } from '@/blocks/VendureProduct'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const triggerRevalidate = (tag: string) => async () => {
  try {
    const revalidateUrl = process.env.STOREFRONT_REVALIDATE_URL || 'http://storefront:3001/api/revalidate';
    const secret = process.env.REVALIDATION_SECRET || 'e1EX6Yeu0fjJ6X2qweSav50VjOxkNPFlMEeXEGvj7Dg=';
    const res = await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: [tag] }),
    });
    if (res.ok) {
      console.log(`Successfully triggered ${tag} cache revalidation`);
    } else {
      console.error(`Failed to trigger ${tag} cache revalidation: ${res.statusText}`);
    }
  } catch (err) {
    console.error(`Failed to trigger ${tag} cache revalidation:`, err);
  }
}

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    {
      slug: 'media',
      access: {
        read: () => true,
      },
      upload: true,
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'categories',
      access: {
        read: () => true,
      },
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
      ],
    },
    {
      slug: 'posts',
      access: {
        read: () => true,
      },
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'coverImage',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              BlocksFeature({
                blocks: [VendureProductBlock]
              })
            ]
          }),
        },

      ],
    },
    {
      slug: 'pages',
      access: {
        read: () => true,
      },
      hooks: {
        afterChange: [
          async ({ doc }) => {
            try {
              const revalidateUrl = process.env.STOREFRONT_REVALIDATE_URL || 'http://storefront:3001/api/revalidate';
              const secret = process.env.REVALIDATION_SECRET || 'e1EX6Yeu0fjJ6X2qweSav50VjOxkNPFlMEeXEGvj7Dg=';
              await fetch(revalidateUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${secret}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tags: ['pages', `page-${doc.slug}`] }),
              });
              console.log(`Successfully triggered page-${doc.slug} cache revalidation`);
            } catch (err) {
              console.error(`Failed to trigger page-${doc.slug} cache revalidation:`, err);
            }
          }
        ]
      },
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'layout',
          type: 'blocks',
          blocks: [
            {
              slug: 'hero',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'subtitle',
                  type: 'textarea',
                },
                {
                  name: 'backgroundImage',
                  type: 'relationship',
                  relationTo: 'media',
                },
                {
                  name: 'ctaText',
                  type: 'text',
                },
                {
                  name: 'ctaLink',
                  type: 'text',
                },
              ],
            },
            {
              slug: 'featuredProducts',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'productSlugs',
                  type: 'array',
                  fields: [
                    {
                      name: 'slug',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              slug: 'contentBlock',
              fields: [
                {
                  name: 'content',
                  type: 'richText',
                  editor: lexicalEditor({}),
                },
              ],
            },
            {
              slug: 'ctaBlock',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                },
                {
                  name: 'buttonText',
                  type: 'text',
                },
                {
                  name: 'buttonLink',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  globals: [
    {
      slug: 'navigation',
      access: {
        read: () => true,
      },
      hooks: {
        afterChange: [triggerRevalidate('navigation')],
      },
      fields: [
        {
          name: 'topAnnouncement',
          type: 'text',
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      slug: 'footer',
      access: {
        read: () => true,
      },
      hooks: {
        afterChange: [triggerRevalidate('footer')],
      },
      fields: [
        {
          name: 'contactInfo',
          type: 'textarea',
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'GitHub', value: 'github' },
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '1234567890abcdefghijklmnopqrstuvwxyz',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgres://vendure:819LpPJvT_5FGtwgm7ZsRw@localhost:6543/vendure',
    },
    push: process.env.DB_PUSH === 'true',
  }),
})
