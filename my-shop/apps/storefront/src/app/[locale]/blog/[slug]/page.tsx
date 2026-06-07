import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { getRouteLocale } from '@/i18n/server'
import { Link } from '@/i18n/navigation'
import { getPayloadMediaUrl, getPostBySlug } from '@/lib/payload/api'
import { LexicalRenderer } from '@/components/shared/render-blocks'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { PageSection } from '@/components/layout/page-section'
import { SITE_NAME } from '@/lib/metadata'

interface PostPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)
  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} - ${SITE_NAME}`,
    description: post.title,
    openGraph: {
      title: `${post.title} - ${SITE_NAME}`,
      type: 'article',
      publishedTime: post.createdAt,
    },
  }
}

function BlogPostFallback() {
  return (
    <Container className="max-w-3xl min-h-screen">
      <PageSection>
        <div className="space-y-8 animate-pulse">
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="space-y-4">
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-2/3 rounded bg-muted" />
          </div>
          <div className="h-9 w-64 rounded bg-muted" />
          <div className="aspect-[21/9] w-full rounded-2xl bg-muted" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-11/12 rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>
        </div>
      </PageSection>
    </Container>
  )
}

async function BlogPostContent({ slug }: { slug: string }) {
  const locale = await getRouteLocale()
  const t = await getTranslations({ locale, namespace: 'Blog' })
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const coverUrl = getPayloadMediaUrl(post.coverImage?.url ?? null)

  return (
    <Container className="max-w-3xl min-h-screen">
      <PageSection>
        <article>
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              {t('backToArticles')}
            </Link>

            {post.category && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                {post.category.name}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400 pb-6 border-b border-neutral-200 dark:border-neutral-800">
              {post.author && (
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300">
                    {((post.author as any).name || (post.author as any).email || 'A')[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {(post.author as any).name || (post.author as any).email || 'Admin'}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>{new Date(post.createdAt).toLocaleDateString(locale)}</span>
              </div>
            </div>
          </div>

          {coverUrl && (
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl mb-10 bg-neutral-100 dark:bg-neutral-950 shadow-md">
              <img
                src={coverUrl}
                alt={post.coverImage?.alt || post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {post.content ? (
            <div className="mb-16">
              <LexicalRenderer content={post.content} />
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400 italic">
              {t('noContent')}
            </div>
          )}
        </article>
      </PageSection>
    </Container>
  )
}

export default function BlogPostPage({ params }: PostPageProps) {
  return (
    <Suspense fallback={<BlogPostFallback />}>
      {params.then(({ slug }) => (
        <BlogPostContent slug={slug} />
      ))}
    </Suspense>
  )
}
