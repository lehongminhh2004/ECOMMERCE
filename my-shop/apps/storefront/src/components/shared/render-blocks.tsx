import React, { Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ProductCarousel } from '@/components/commerce/product-carousel'
import { ProductCard } from '@/components/commerce/product-card'
import { DiscountCard, DiscountCardSkeleton } from '@/components/commerce/discount-card'
import { getPayloadMediaUrl, getVendureProductsForSlugs, getVendureProductById, getPosts, type PageBlock } from '@/lib/payload/api'


// Lexical RichText Renderer
export function LexicalRenderer({ content }: { content: any }) {
  if (!content || !content.root || !content.root.children) return null

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    if (node.type === 'text') {
      let textElement: React.ReactNode = node.text
      if (node.format & 1) { // Bold
        textElement = <strong key={index}>{textElement}</strong>
      }
      if (node.format & 2) { // Italic
        textElement = <em key={index}>{textElement}</em>
      }
      if (node.format & 4) { // Strikethrough
        textElement = <span key={index} className="line-through">{textElement}</span>
      }
      if (node.format & 8) { // Underline
        textElement = <span key={index} className="underline">{textElement}</span>
      }
      if (node.format & 16) { // Code
        textElement = <code key={index} className="bg-neutral-100 dark:bg-neutral-800 text-pink-500 dark:text-pink-400 px-1 rounded font-mono text-sm">{textElement}</code>
      }
      return <React.Fragment key={index}>{textElement}</React.Fragment>
    }

    const children = node.children ? node.children.map((child: any, idx: number) => renderNode(child, idx)) : null

    switch (node.type) {
      case 'paragraph':
        return <p key={index} className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">{children}</p>
      case 'heading': {
        const Tag = (node.tag || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
        const classes = {
          h1: 'text-4xl font-extrabold mb-6 mt-8 tracking-tight',
          h2: 'text-3xl font-bold mb-4 mt-6 tracking-tight',
          h3: 'text-2xl font-semibold mb-3 mt-4',
          h4: 'text-xl font-semibold mb-2 mt-4',
          h5: 'text-lg font-medium mb-2',
          h6: 'text-base font-medium mb-2',
        }[Tag] || 'text-xl font-semibold mb-2'
        return <Tag key={index} className={classes}>{children}</Tag>
      }
      case 'list': {
        const Tag = node.listType === 'number' ? 'ol' : 'ul'
        const classes = node.listType === 'number' ? 'list-decimal pl-6 mb-4' : 'list-disc pl-6 mb-4'
        return <Tag key={index} className={classes}>{children}</Tag>
      }
      case 'listitem':
        return <li key={index} className="mb-1">{children}</li>
      case 'quote':
        return <blockquote key={index} className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 italic my-4 text-neutral-600 dark:text-neutral-400">{children}</blockquote>
      case 'link':
        return (
          <a
            key={index}
            href={node.fields?.url}
            className="text-primary hover:underline font-medium decoration-1"
            target={node.fields?.newTab ? '_blank' : undefined}
            rel="noopener noreferrer"
          >
            {children}
          </a>
        )
      case 'block': {
        const blockFields = node.fields
        if (blockFields?.blockType === 'vendureProduct' && blockFields.productId) {
          return (
            <Suspense key={index} fallback={<ProductCardSkeleton />}>
              <VendureProductBlockComponent productId={blockFields.productId} />
            </Suspense>
          )
        }
        return null;
      }

      default:
        return children || null
    }
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      {content.root.children.map((child: any, idx: number) => renderNode(child, idx))}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border w-full max-w-sm my-6">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
      </div>
    </div>
  )
}

export function ProductCarouselSkeleton() {
  return (
    <div className="mb-16 space-y-4">
      <div className="h-8 bg-muted animate-pulse rounded w-48 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden border border-border w-full">
            <div className="aspect-square bg-muted animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface VendureProductBlockProps {
  productId: string
}

export async function VendureProductBlockComponent({ productId }: VendureProductBlockProps) {
  const product = await getVendureProductById(productId)
  if (!product) return null

  return (
    <div className="w-full max-w-sm my-6">
      <ProductCard product={product} />
    </div>
  )
}


// 1. Hero Block
interface HeroProps {
  title: string
  subtitle?: string
  backgroundImage?: any
  ctaText?: string
  ctaLink?: string
}

export function HeroBlockComponent({ title, subtitle, backgroundImage, ctaText, ctaLink }: HeroProps) {
  const imageUrl = backgroundImage && typeof backgroundImage === 'object' && backgroundImage.url
    ? getPayloadMediaUrl(backgroundImage.url)
    : ''

  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white min-h-[500px] flex items-center mb-16 shadow-xl">
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 ease-out scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900/60 to-transparent" />
      
      <div className="relative container mx-auto px-8 py-16 z-10 max-w-3xl text-left">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-xl font-light leading-relaxed">
            {subtitle}
          </p>
        )}
        {ctaText && ctaLink && (
          <Button
            render={<Link href={ctaLink} />}
            nativeButton={false}
            size="lg"
            className="rounded-full px-8 py-6 text-md font-semibold bg-white text-black hover:bg-neutral-200 transition-all hover:scale-105 shadow-md"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  )
}

// 2. Featured Products Block
interface FeaturedProductsProps {
  title?: string
  productSlugs?: Array<{ slug: string }>
}

export async function FeaturedProductsBlockComponent({ title, productSlugs }: FeaturedProductsProps) {
  const slugs = productSlugs?.map((p) => p.slug) || []
  if (slugs.length === 0) return null

  const products = await getVendureProductsForSlugs(slugs)

  return (
    <div className="mb-16">
      <ProductCarousel
        title={title || 'Featured Products'}
        products={products}
      />
    </div>
  )
}

// 3. Content Block Component
interface ContentBlockProps {
  content?: any
}

export function ContentBlockComponent({ content }: ContentBlockProps) {
  if (!content) return null
  return (
    <div className="container mx-auto px-4 py-8 mb-16 max-w-4xl">
      <LexicalRenderer content={content} />
    </div>
  )
}

// 4. CTA Block Component
interface CTAProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
}

export function CallToActionBlockComponent({ title, description, buttonText, buttonLink }: CTAProps) {
  return (
    <section className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-12 mb-16 text-center shadow-sm">
      <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
      {description && <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto leading-relaxed">{description}</p>}
      {buttonText && buttonLink && (
        <Button
          render={<Link href={buttonLink} />}
          nativeButton={false}
          size="lg"
          className="rounded-full shadow-md hover:scale-105 transition-all"
        >
          {buttonText}
        </Button>
      )}
    </section>
  )
}

// Master Render Blocks Component
interface RenderBlocksProps {
  blocks?: PageBlock[]
}

export function BlogPostsSkeleton() {
  return (
    <div className="mb-16 space-y-4">
      <div className="h-8 bg-muted animate-pulse rounded w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <DiscountCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// 5. Blog Posts Block Component
interface BlogPostsProps {
  title: string
  limit?: number | null
}

export async function BlogPostsBlockComponent({ title, limit }: BlogPostsProps) {
  const posts = await getPosts(limit)
  if (!posts || posts.length === 0) return null

  return (
    <div className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
        {posts.map((post) => (
          <DiscountCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

export function RenderBlocks({ blocks }: RenderBlocksProps) {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block, idx) => {
        switch (block.blockType) {
          case 'hero':
            return <HeroBlockComponent key={idx} {...block} />
          case 'featuredProducts':
            // Resolve standard async component rendering in React Server Components
            // @ts-ignore
            return (
              <Suspense key={idx} fallback={<ProductCarouselSkeleton />}>
                <FeaturedProductsBlockComponent {...block} />
              </Suspense>
            )
          case 'contentBlock':
            return <ContentBlockComponent key={idx} {...block} />
          case 'ctaBlock':
            return <CallToActionBlockComponent key={idx} {...block} />
          case 'blogPosts':
            // @ts-ignore
            return (
              <Suspense key={idx} fallback={<BlogPostsSkeleton />}>
                <BlogPostsBlockComponent {...block} />
              </Suspense>
            )
          default:
            return null
        }
      })}
    </>
  )
}
