import { query as queryVendure } from '@/lib/vendure/api'
import { GetProductDetailQuery, GetProductDetailByIdQuery } from '@/lib/vendure/queries'
import { getRouteLocale } from '@/i18n/server'
import { getActiveCurrencyCode } from '@/lib/currency-server'
import { cacheLife, cacheTag } from 'next/cache'



const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'http://localhost:3002/api'
const PAYLOAD_PUBLIC_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || PAYLOAD_API_URL.replace(/\/api\/?$/, '')
const PAYLOAD_FALLBACK_LOCALE = 'en'
const PAYLOAD_FETCH_TIMEOUT_MS = +(process.env.PAYLOAD_FETCH_TIMEOUT_MS || 15000)

export interface Media {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
}

export interface HeroBlock {
  blockType: 'hero'
  title: string
  subtitle?: string
  backgroundImage?: Media | string
  ctaText?: string
  ctaLink?: string
}

export interface FeaturedProductsBlock {
  blockType: 'featuredProducts'
  title?: string
  productSlugs?: Array<{ slug: string; id?: string }>
}

export interface ContentBlock {
  blockType: 'contentBlock'
  content?: any // Lexical rich text JSON structure
}

export interface CallToActionBlock {
  blockType: 'ctaBlock'
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
}

export interface BlogPostsBlock {
  blockType: 'blogPosts'
  title: string
  limit?: number | null
}

export type PageBlock = HeroBlock | FeaturedProductsBlock | ContentBlock | CallToActionBlock | BlogPostsBlock

export interface PageData {
  id: string
  title: string
  slug: string
  layout?: PageBlock[]
}

export interface PostData {
  id: string
  title: string
  slug: string
  coverImage?: Media
  category?: { name: string; slug: string }
  author?: { name: string }
  /** Localized short label for the discount badge, e.g. "30% OFF" or "Giảm 30%" */
  discountLabel?: string | null
  /** Numeric discount percentage 0-100, used for badge color */
  discountPercent?: number | null
  /** ISO date string of offer expiry; shown as countdown on card */
  expiresAt?: string | null
  /** Vendure coupon code linked to this promotion post. Admin enters this from Vendure Promotions. */
  couponCode?: string | null
  content?: any
  createdAt: string
}

export interface NavigationData {
  topAnnouncement?: string
  links?: Array<{ label: string; url: string }>
}

export interface FooterData {
  contactInfo?: string
  links?: Array<{ label: string; url: string }>
  socialLinks?: Array<{ platform: string; url: string }>
}

async function fetchPayload<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${PAYLOAD_API_URL}${path}`
  const isDev = process.env.NODE_ENV === 'development'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PAYLOAD_FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: isDev ? { revalidate: 0 } : {
        revalidate: 60, // Cache for 60 seconds
        ...options?.next,
      },
      cache: isDev ? 'no-store' : undefined,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch Payload data from ${url}: ${res.statusText}`)
    }

    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

function withPayloadLocale(path: string, locale: string): string {
  const separator = path.includes('?') ? '&' : '?'
  const encodedLocale = encodeURIComponent(locale)
  const encodedFallbackLocale = encodeURIComponent(PAYLOAD_FALLBACK_LOCALE)
  return `${path}${separator}locale=${encodedLocale}&fallback-locale=${encodedFallbackLocale}`
}

export function getPayloadMediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${PAYLOAD_PUBLIC_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const locale = await getRouteLocale()
  return getPageBySlugCached(slug, locale)
}

async function getPageBySlugCached(slug: string, locale: string): Promise<PageData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`page-${slug}-${locale}`)
  cacheTag(`page-${slug}`)
  cacheTag('pages')
  try {
    const data = await fetchPayload<{ docs: PageData[] }>(
      withPayloadLocale(`/pages?where[slug][equals]=${encodeURIComponent(slug)}`, locale)
    )
    return data.docs.length > 0 ? data.docs[0] : null
  } catch (error) {
    console.error('Error fetching page from Payload:', error)
    return null
  }
}

export async function getPosts(limit?: number | null): Promise<PostData[]> {
  const locale = await getRouteLocale()
  return getPostsCached(locale, limit)
}

async function getPostsCached(locale: string, limit?: number | null): Promise<PostData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`posts-${locale}`)
  cacheTag('posts')
  try {
    const normalizedLimit = typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : null
    const limitQuery = normalizedLimit ? `&limit=${normalizedLimit}` : ''
    const data = await fetchPayload<{ docs: PostData[] }>(
      withPayloadLocale(`/posts?sort=-createdAt${limitQuery}&depth=1`, locale)
    )
    return data.docs
  } catch (error) {
    console.error('Error fetching posts from Payload:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const locale = await getRouteLocale()
  return getPostBySlugCached(slug, locale)
}

async function getPostBySlugCached(slug: string, locale: string): Promise<PostData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`post-${slug}-${locale}`)
  cacheTag(`post-${slug}`)
  cacheTag('posts')
  try {
    const data = await fetchPayload<{ docs: PostData[] }>(
      withPayloadLocale(`/posts?where[slug][equals]=${encodeURIComponent(slug)}&depth=1`, locale)
    )
    return data.docs.length > 0 ? data.docs[0] : null
  } catch (error) {
    console.error('Error fetching post from Payload:', error)
    return null
  }
}

export async function getNavigation(): Promise<NavigationData | null> {
  const locale = await getRouteLocale()
  return getNavigationCached(locale)
}

async function getNavigationCached(locale: string): Promise<NavigationData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`navigation-${locale}`)
  cacheTag('navigation')
  try {
    return await fetchPayload<NavigationData>(withPayloadLocale('/globals/navigation', locale))
  } catch (error) {
    console.error('Error fetching navigation from Payload:', error)
    return null
  }
}

export async function getFooter(): Promise<FooterData | null> {
  const locale = await getRouteLocale()
  return getFooterCached(locale)
}

async function getFooterCached(locale: string): Promise<FooterData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`footer-${locale}`)
  cacheTag('footer')
  try {
    return await fetchPayload<FooterData>(withPayloadLocale('/globals/footer', locale))
  } catch (error) {
    console.error('Error fetching footer from Payload:', error)
    return null
  }
}

// Fetch and transform products for FeaturedProductsBlock from Vendure:
export async function getVendureProductsForSlugs(slugs: string[]): Promise<any[]> {
  const locale = await getRouteLocale()
  const currencyCode = await getActiveCurrencyCode()
  return getVendureProductsForSlugsCached(slugs, locale, currencyCode)
}

async function getVendureProductsForSlugsCached(slugs: string[], locale: string, currencyCode: string): Promise<any[]> {
  'use cache'
  cacheLife('minutes')
  
  const productPromises = slugs.map(async (slug) => {
    try {
      const result = await queryVendure(GetProductDetailQuery, { slug }, { languageCode: locale, currencyCode })
      const product = result.data?.product
      if (!product) return null
      
      const prices = product.variants.map((v) => v.priceWithTax)
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
      
      return {
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        productAsset: product.assets?.[0] ? {
          id: product.assets[0].id,
          preview: product.assets[0].preview,
        } : null,
        priceWithTax: minPrice === maxPrice 
          ? { __typename: 'SinglePrice' as const, value: minPrice }
          : { __typename: 'PriceRange' as const, min: minPrice, max: maxPrice },
        currencyCode,
      }
    } catch (e) {
      console.error(`Error loading Vendure product for slug "${slug}":`, e)
      return null
    }
  })
  
  const products = await Promise.all(productPromises)
  return products.filter((p) => p !== null)
}

export async function getVendureProductById(id: string): Promise<any | null> {
  const locale = await getRouteLocale()
  const currencyCode = await getActiveCurrencyCode()
  return getVendureProductByIdCached(id, locale, currencyCode)
}

async function getVendureProductByIdCached(id: string, locale: string, currencyCode: string): Promise<any | null> {
  'use cache'
  cacheLife('minutes')
  
  try {
    const result = await queryVendure(GetProductDetailByIdQuery, { id }, { languageCode: locale, currencyCode })
    const product = result.data?.product
    if (!product) return null
    
    const prices = product.variants.map((v) => v.priceWithTax)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
    
    return {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      productAsset: product.assets?.[0] ? {
        id: product.assets[0].id,
        preview: product.assets[0].preview,
      } : null,
      priceWithTax: minPrice === maxPrice 
        ? { __typename: 'SinglePrice' as const, value: minPrice }
        : { __typename: 'PriceRange' as const, min: minPrice, max: maxPrice },
      currencyCode,
    }
  } catch (e) {
    console.error(`Error loading Vendure product for id "${id}":`, e)
    return null
  }
}
