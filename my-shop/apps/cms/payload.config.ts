import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { VendureProductBlock } from '@/blocks/VendureProduct'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbSslEnabled = process.env.DB_SSL === 'true'
const dbPoolMax = Number(process.env.PAYLOAD_DB_POOL_MAX || 4)

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
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
  },
  localization: {
    locales: [
      { label: 'Tiếng Việt', code: 'vi' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  blocks: [
    VendureProductBlock
  ],
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
          localized: true,
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
          localized: true,
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
      labels: {
        singular: 'Post',
        plural: 'Posts',
      },
      access: {
        read: () => true,
      },
      hooks: {
        beforeValidate: [
          async ({ data }) => {
            if (!data) return data

            const hasPromotionData = Boolean(data.discountLabel)
              || data.discountPercent != null
              || Boolean(data.expiresAt)
            const couponCode = typeof data.couponCode === 'string'
              ? data.couponCode.trim().toUpperCase()
              : ''

            if (hasPromotionData && !couponCode) {
              throw new Error('Promotion posts must include a Vendure coupon code created in Vendure Admin.')
            }

            return {
              ...data,
              couponCode: couponCode || null,
            }
          },
        ],
        afterChange: [triggerRevalidate('posts')],
      },
      admin: {
        useAsTitle: 'title',
        description: 'Create and manage articles, promotion posts, and storefront cards.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
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
          name: 'discountLabel',
          label: 'Discount Label',
          type: 'text',
          localized: true,
          admin: {
            description: 'Short label shown on the card badge, e.g. "30% OFF" or "Giảm 30%"',
          },
        },
        {
          name: 'discountPercent',
          label: 'Discount Percent',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Numeric discount percentage (0-100). Used to render the badge color.',
          },
        },
        {
          name: 'couponCode',
          label: 'Mã Coupon Vendure',
          type: 'text',
          admin: {
            description: 'Mã coupon được tạo từ Vendure Admin (Promotions). Khách hàng có thể áp mã này trực tiếp vào giỏ hàng. VD: SUMMER20, SALE50, FREESHIP',
          },
        },
        {
          name: 'expiresAt',
          label: 'Offer Expires At',
          type: 'date',
          admin: {
            description: 'Optional expiry date for this promotion. Shown as a countdown on the card.',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'content',
          type: 'richText',
          localized: true,
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => {
              const filtered = defaultFeatures.filter((f) => f.key !== 'blocks')
              return [
                ...filtered,
                BlocksFeature({
                  blocks: [VendureProductBlock]
                })
              ]
            }
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
          localized: true,
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
                  localized: true,
                },
                {
                  name: 'subtitle',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'backgroundImage',
                  type: 'relationship',
                  relationTo: 'media',
                },
                {
                  name: 'ctaText',
                  type: 'text',
                  localized: true,
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
                  localized: true,
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
                  localized: true,
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
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'buttonText',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'buttonLink',
                  type: 'text',
                },
              ],
            },
            {
              slug: 'blogPosts',
              labels: {
                singular: 'Post Cards',
                plural: 'Post Cards',
              },
              fields: [
                {
                  name: 'title',
                  label: 'Section title',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'limit',
                  label: 'Number of posts',
                  type: 'number',
                  admin: {
                    description: 'Leave empty to show all posts.',
                  },
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
          localized: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
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
          localized: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
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
      max: dbPoolMax,
      ...(dbSslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
    },
    push: process.env.DB_PUSH === 'true',
  }),
})
