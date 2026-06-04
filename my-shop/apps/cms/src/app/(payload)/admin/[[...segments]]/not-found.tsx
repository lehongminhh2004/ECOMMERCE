import { NotFoundPage } from '@payloadcms/next/views'
import configPromise from '@payload-config'
import { importMap } from '../importMap.js'

interface NotFoundProps {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function NotFound({ params, searchParams }: NotFoundProps) {
  return (
    <NotFoundPage
      params={params as any}
      searchParams={searchParams as any}
      config={configPromise}
      importMap={importMap}
    />
  )
}
