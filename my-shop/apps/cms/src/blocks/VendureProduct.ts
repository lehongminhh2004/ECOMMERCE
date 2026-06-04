import { Block } from 'payload'

export const VendureProductBlock: Block = {
  slug: 'vendureProduct',
  interfaceName: 'VendureProductBlock',
  fields: [
    {
      name: 'productId',
      type: 'text',
      required: true,
      admin: {
        components: {
          Field: '@/components/fields/ProductSelect',
        }
      }
    }
  ]
}
