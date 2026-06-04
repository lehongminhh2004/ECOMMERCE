import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getPostBySlug, getPosts } from '@/lib/payload/api'
import { LexicalRenderer } from '@/components/shared/render-blocks'
import { Calendar, User, ArrowLeft, BookOpen } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { PageSection } from '@/components/layout/page-section'
import { routing } from '@/i18n/routing'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPosts()
  const params: Array<{ locale: string; slug: string }> = []
  
  for (const locale of routing.locales) {
    if (posts.length === 0) {
      params.push({
        locale,
        slug: 'placeholder-post-slug',
      })
    } else {
      for (const post of posts) {
        params.push({
          locale,
          slug: post.slug,
        })
      }
    }
  }
  return params
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} - Blog`,
    description: post.title,
  }
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  const coverUrl = post.coverImage?.url
    ? (post.coverImage.url.startsWith('http') ? post.coverImage.url : `http://localhost:3002${post.coverImage.url}`)
    : null

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
              Back to all articles
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
                    {post.author.name[0]}
                  </div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{post.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
              No content in this post.
            </div>
          )}
        </article>
      </PageSection>
    </Container>
  )
}

