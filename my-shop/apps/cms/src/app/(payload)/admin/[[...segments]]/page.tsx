import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { importMap } from '../importMap.js'

interface PageProps {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    params: params as any,
    searchParams: searchParams as any,
    config: configPromise,
  })
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <RootPage
      params={params as any}
      searchParams={searchParams as any}
      config={configPromise}
      importMap={importMap}
    />
  )
}
