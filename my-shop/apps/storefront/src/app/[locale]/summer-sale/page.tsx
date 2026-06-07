import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/payload/api'
import { RenderBlocks } from '@/components/shared/render-blocks'
import { SITE_NAME, buildCanonicalUrl } from '@/lib/metadata'

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
  const page = await getPageBySlug('summer-sale')

  if (!page) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-16 md:pt-28 min-h-screen">
      <RenderBlocks blocks={page.layout} />
    </main>
  )
}
