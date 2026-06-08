import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a Vendure asset URL.
 *
 * Vendure may return:
 *  - A full absolute URL (Cloudinary or with ASSET_URL_PREFIX) → use as-is
 *  - A relative path like "preview/aa/file.jpg" or "preview\aa\file.jpg"
 *    (local-disk fallback, common when ASSET_URL_PREFIX is not set)
 *
 * For relative paths we build an absolute URL from NEXT_PUBLIC_VENDURE_SHOP_API_URL
 * by stripping "/shop-api" and prepending "/assets/".
 */
export function getVendureAssetUrl(url: string | null | undefined): string {
  if (!url) return ''

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // Normalize backslashes to forward slashes (Windows-style paths from local disk)
  const normalized = url.replace(/\\/g, '/')

  // Build base from the public Vendure API URL
  const apiUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VENDURE_SHOP_API_URL) || ''
  const base = apiUrl.replace(/\/shop-api\/?$/, '')

  if (!base) return normalized

  return `${base}/assets/${normalized.replace(/^\//, '')}`
}
