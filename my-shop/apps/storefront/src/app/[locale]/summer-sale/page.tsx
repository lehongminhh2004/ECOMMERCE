import type { Metadata } from 'next'
import { getPageBySlug } from '@/lib/payload/api'
import { RenderBlocks } from '@/components/shared/render-blocks'
import { SITE_NAME, buildCanonicalUrl } from '@/lib/metadata'
import { getTranslations } from 'next-intl/server'
import { getRouteLocale } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('summer-sale')
  const title = page?.title || 'Summer Sale'

  return {
    title: `${title} - ${SITE_NAME}`,
    description: title,
    alternates: {
      canonical: buildCanonicalUrl('/summer-sale'),
    },
    openGraph: {
      title: `${title} - ${SITE_NAME}`,
      description: title,
      type: 'website',
    },
  }
}

export default async function SummerSalePage() {
  const locale = await getRouteLocale()
  const t = await getTranslations({ locale, namespace: 'SummerSale' })
  const page = await getPageBySlug('summer-sale')

  // If the CMS page doesn't exist yet, show a friendly fallback instead of 404
  if (!page || !page.layout || page.layout.length === 0) {
    return (
      <main className="container mx-auto px-4 pt-24 pb-16 md:pt-28 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
          <div className="text-5xl mb-4">🏖️</div>
          <h1 className="text-3xl font-bold">{t('heroTitle')}</h1>
          <p className="text-muted-foreground">{t('heroSubtitle')}</p>
          <p className="text-sm text-muted-foreground mt-8">{t('noDeals')}</p>
          <p className="text-xs text-muted-foreground">{t('noDealsDesc')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-16 md:pt-28 min-h-screen">
      <RenderBlocks blocks={page.layout} />
    </main>
  )
}
