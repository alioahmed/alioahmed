import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/site'

/**
 * IndexNow — instant URL submission to Bing/IndexNow participants (also feeds ChatGPT's index).
 * POST { urls: string[] }. Requires INDEXNOW_KEY env + a matching public/<KEY>.txt file.
 */
export async function POST(request: Request) {
  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const urls = (body as { urls?: unknown })?.urls
  if (!Array.isArray(urls) || urls.length === 0 || !urls.every((u) => typeof u === 'string')) {
    return NextResponse.json({ error: 'Body must be { urls: string[] }' }, { status: 400 })
  }

  const host = new URL(SITE_URL).host

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    }),
  })

  if (!res.ok && res.status !== 202) {
    return NextResponse.json(
      { error: 'IndexNow upstream error', status: res.status },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true, submitted: urls.length })
}
