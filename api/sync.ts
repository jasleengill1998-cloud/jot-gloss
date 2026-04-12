/**
 * /api/sync — Cloud sync via Vercel Blob REST API (Edge Runtime)
 */

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
}

const BLOB_BASE = 'https://blob.vercel-storage.com'
const BLOB_PATH = 'studybloom-sync/all-files.json'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOOM_READ_WRITE_TOKEN || process.env.bloom_READ_WRITE_TOKEN
  if (!token) {
    return json({ error: 'Blob token not set.' }, 503)
  }

  const auth = { authorization: `Bearer ${token}` }

  // ── GET ────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const lr = await fetch(`${BLOB_BASE}?prefix=studybloom-sync%2F`, { headers: auth })
      if (!lr.ok) return json({ error: `List: ${lr.status}` }, 500)

      const ld = (await lr.json()) as { blobs?: { pathname: string; url: string; downloadUrl?: string }[] }
      const b = ld.blobs?.find(x => x.pathname === BLOB_PATH)
      if (!b) return json({ files: [], updatedAt: 0 })

      const dr = await fetch(b.downloadUrl || b.url, { headers: auth })
      if (!dr.ok) return json({ error: `Fetch: ${dr.status}` }, 500)

      return new Response(await dr.text(), {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'access-control-allow-origin': '*',
        },
      })
    } catch (e) {
      return json({ error: String(e) }, 500)
    }
  }

  // ── POST ───────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    let body: { files?: unknown[]; updatedAt?: number }
    try { body = await req.json() } catch { return json({ error: 'Bad JSON' }, 400) }
    if (!body?.files || !Array.isArray(body.files)) return json({ error: 'No files array' }, 400)

    const payload = JSON.stringify({ files: body.files, updatedAt: body.updatedAt ?? Date.now() })

    try {
      // Use the client token API endpoint which respects store settings
      const pr = await fetch(`${BLOB_BASE}/${BLOB_PATH}`, {
        method: 'PUT',
        headers: {
          ...auth,
          'x-api-version': '7',
          'x-access': 'private',
          'x-content-type': 'application/json',
          'x-add-random-suffix': 'false',
          'x-cache-control-max-age': '0',
          'content-type': 'application/octet-stream',
        },
        body: payload,
      })

      if (!pr.ok) {
        const t = await pr.text()
        // If private access error, the store needs to be set to public
        // or we need to use the multipart upload endpoint
        return json({ error: `Put: ${pr.status} ${t}` }, 500)
      }

      return json({ ok: true, updatedAt: Date.now() })
    } catch (e) {
      return json({ error: String(e) }, 500)
    }
  }

  return json({ error: 'Method not allowed' }, 405)
}
