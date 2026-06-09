# Storefront

Next.js customer storefront for the ecommerce system.

## Responsibility

- Public shopping experience
- Product listing, search, collections, and product detail pages
- Cart and checkout flows
- Customer account pages
- Blog and CMS-driven marketing pages
- English and Vietnamese routes
- Locale-aware currency display: English defaults to USD, Vietnamese defaults to VND

## Data Sources

- Vendure Shop API for products, prices, carts, orders, customers, promotions, and checkout.
- Payload CMS API for pages, navigation, footer, blog posts, and banners.
- Cloudinary for production media delivery.

## Local Development

From the `my-shop` workspace root:

```bash
npm run dev -w storefront
```

Default local URL:

```text
http://localhost:3001
```

## Build

```bash
npm run build -w storefront
```

## Production

Production runs on Vercel.

Public URL:

```text
https://ecommerce-t6vv.vercel.app
```

Vercel deploys only the customer-facing storefront. Vendure Admin and Payload CMS Admin are separate Render services.

