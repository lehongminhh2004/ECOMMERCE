import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params
  const safeFilename = path.basename(filename)
  const filePath = path.join(process.cwd(), 'media', safeFilename)

  try {
    const file = await fs.readFile(filePath)
    const ext = path.extname(safeFilename).toLowerCase()

    return new Response(file, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
