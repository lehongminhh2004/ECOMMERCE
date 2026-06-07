import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getPayloadMediaUrl, getPosts } from '@/lib/payload/api'
import { Calendar, User, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Insights & Updates',
  description: 'Explore the latest articles, tutorials, and stories from our team.',
}

export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl min-h-screen">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
          Our Blog
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Stay updated with our latest news, insights, and stories.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl border-neutral-300 dark:border-neutral-700">
          <BookOpen className="size-12 mx-auto text-neutral-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Articles Yet</h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Check back later for interesting stories, guides, and news.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const coverUrl = getPayloadMediaUrl(post.coverImage?.url)

            return (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg"
              >
                {coverUrl ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950">
                    <img
                      src={coverUrl}
                      alt={post.coverImage?.alt || post.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <BookOpen className="size-10 text-neutral-400" />
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6">
                  {post.category && (
                    <span className="inline-block self-start text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                      {post.category.name}
                    </span>
                  )}
                  <h2 className="text-xl font-bold mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                      {post.title}
                    </Link>
                  </h2>

                  <div className="mt-auto flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    {post.author && (
                      <div className="flex items-center gap-1">
                        <User className="size-3.5" />
                        <span>{(post.author as any).name || (post.author as any).email || 'Admin'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
