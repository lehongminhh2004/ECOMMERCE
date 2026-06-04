import { query as queryVendure } from '@/lib/vendure/api'
import { GetProductDetailQuery, GetProductDetailByIdQuery } from '@/lib/vendure/queries'
import { getRouteLocale } from '@/i18n/server'
import { getActiveCurrencyCode } from '@/lib/currency-server'
import { cacheLife, cacheTag } from 'next/cache'



const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'http://localhost:3002/api'

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

export type PageBlock = HeroBlock | FeaturedProductsBlock | ContentBlock | CallToActionBlock

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
  const res = await fetch(url, {
    ...options,
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
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`page-${slug}`)
  cacheTag('pages')
  try {
    const data = await fetchPayload<{ docs: PageData[] }>(`/pages?where[slug][equals]=${slug}`)
    return data.docs.length > 0 ? data.docs[0] : null
  } catch (error) {
    console.error('Error fetching page from Payload:', error)
    return null
  }
}

export async function getPosts(): Promise<PostData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  try {
    const data = await fetchPayload<{ docs: PostData[] }>('/posts?sort=-createdAt')
    return data.docs
  } catch (error) {
    console.error('Error fetching posts from Payload:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`post-${slug}`)
  cacheTag('posts')
  try {
    const data = await fetchPayload<{ docs: PostData[] }>(`/posts?where[slug][equals]=${slug}`)
    return data.docs.length > 0 ? data.docs[0] : null
  } catch (error) {
    console.error('Error fetching post from Payload:', error)
    return null
  }
}


export async function getNavigation(): Promise<NavigationData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('navigation')
  try {
    return await fetchPayload<NavigationData>('/globals/navigation')
  } catch (error) {
    console.error('Error fetching navigation from Payload:', error)
    return null
  }
}

export async function getFooter(): Promise<FooterData | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('footer')
  try {
    return await fetchPayload<FooterData>('/globals/footer')
  } catch (error) {
    console.error('Error fetching footer from Payload:', error)
    return null
  }
}

// Fetch and transform products for FeaturedProductsBlock from Vendure:
export async function getVendureProductsForSlugs(slugs: string[]): Promise<any[]> {
  const locale = 'en'
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
  const locale = 'en'
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


