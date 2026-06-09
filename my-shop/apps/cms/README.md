# Payload CMS

Payload CMS manages editorial content for the ecommerce storefront.

## Responsibility

- Pages and marketing content
- Blog posts
- Navigation and footer globals
- Banners and CMS media
- Localized CMS content for English and Vietnamese storefront routes

## Local Development

From the `my-shop` workspace root:

```bash
npm run dev -w cms
```

Default local URL:

```text
http://localhost:3002/admin
```

## Build

```bash
npm run build -w cms
```

## Production

Production runs as the Render service `my-shop-payload-cms`.

Public admin URL:

```text
https://my-shop-payload-cms.onrender.com/admin
```

Media is stored in Cloudinary so uploaded CMS files survive Render redeploys.

