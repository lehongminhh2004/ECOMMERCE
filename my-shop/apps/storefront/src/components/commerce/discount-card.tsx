import { Link } from '@/i18n/navigation'
import { getPayloadMediaUrl, type PostData } from '@/lib/payload/api'
import { Tag, Clock } from 'lucide-react'

interface DiscountCardProps {
  post: PostData
  /** If true, renders as a compact card (used in summer-sale grid) */
  compact?: boolean
}

function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const label = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(expiresAt))

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">
      <Clock className="size-2.5" />
      {label}
    </span>
  )
}

export function DiscountCard({ post, compact = false }: DiscountCardProps) {
  const coverUrl = getPayloadMediaUrl(post.coverImage?.url ?? null)
  const hasDiscount = post.discountPercent != null && post.discountPercent > 0
  const hasCoupon = !!post.couponCode

  // Choose badge colour based on discount magnitude
  const badgeColor =
    (post.discountPercent ?? 0) >= 40
      ? 'bg-red-500'
      : (post.discountPercent ?? 0) >= 20
      ? 'bg-orange-500'
      : 'bg-primary'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card
        shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={post.title}
    >
      {/* Image area */}
      <div className={`relative overflow-hidden bg-muted ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={post.coverImage?.alt || post.title}
            className="object-cover w-full h-full group-hover:scale-105 group-hover:brightness-90 transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/60 text-muted-foreground">
            <Tag className="size-8 opacity-30" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Discount badge - top right */}
        {hasDiscount && (
          <div
            className={`absolute top-3 right-3 ${badgeColor} text-white text-xs font-bold
              px-2.5 py-1 rounded-full shadow-md ring-2 ring-white/30
              group-hover:scale-110 transition-transform duration-200`}
          >
            {post.discountLabel || `${post.discountPercent}% OFF`}
          </div>
        )}

        {/* Category badge - top left */}
        {post.category && (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold
            uppercase tracking-wider px-2 py-0.5 rounded-full">
            {post.category.name}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3
          className={`font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors
            ${compact ? 'text-sm' : 'text-base'}`}
        >
          {post.title}
        </h3>

        {/* Coupon code preview — chỉ hiển thị nếu có mã */}
        {hasCoupon && (
          <div className="flex items-center gap-1.5 mt-1">
            <Tag className="size-3 text-primary flex-shrink-0" />
            <span className="font-mono font-bold text-[11px] text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">
              {post.couponCode!.toUpperCase()}
            </span>
          </div>
        )}

        {/* Bottom row: expiry countdown */}
        {post.expiresAt && (
          <div className="mt-auto pt-2">
            <ExpiryBadge expiresAt={post.expiresAt} />
          </div>
        )}
      </div>
    </Link>
  )
}

export function DiscountCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4 mt-3" />
      </div>
    </div>
  )
}
