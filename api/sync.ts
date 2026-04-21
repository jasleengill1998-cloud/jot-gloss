/**
 * /api/sync — Cloud sync via Vercel Blob REST API (Edge Runtime)
 *
 * Access control: requires a shared-secret bearer token (SYNC_SECRET env var).
 * The public endpoint is otherwise unauthenticated — never ship this without
 * SYNC_SECRET set.
 */

export const config = {
  runtime: 'edge',
  regions: ['iad1'],
}

const BLOB_BASE = 'https://blob.vercel-storage.com'
const BLOB_PATH = 'studybloom-sync/all-files.json'
const MAX_BODY_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 5_000
const MAX_FILE_CONTENT_BYTES = 5 * 1024 * 1024
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/
const ALLOWED_TYPES = new Set(['jsx', 'html', 'pdf', 'markdown', 'other'])

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  })
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

interface ValidatedFile {
  id: string
  name: string
  type: string
  content: string
  className: string
  resourceType: string
  version: number
  archived: boolean
  createdAt: number
  updatedAt: number
  size: number
  canonicalName?: string
  lineageId?: string
  source?: string
  viewerState?: Record<string, unknown>
}

function validateFile(raw: unknown, now: number): ValidatedFile | null {
  if (!isPlainObject(raw)) return null
  const f = raw
  const id = f.id
  const name = f.name
  const type = f.type
  const content = f.content
  const className = f.className
  const resourceType = f.resourceType
  const version = f.version
  const archived = f.archived
  const createdAt = f.createdAt
  const updatedAt = f.updatedAt
  const size = f.size

  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null
  if (typeof name !== 'string' || name.length === 0 || name.length > 512) return null
  if (typeof type !== 'string' || !ALLOWED_TYPES.has(type)) return null
  if (typeof content !== 'string' || content.length > MAX_FILE_CONTENT_BYTES) return null
  if (typeof className !== 'string' || className.length > 256) return null
  if (typeof resourceType !== 'string' || resourceType.length > 128) return null
  if (typeof version !== 'number' || !Number.isFinite(version) || version < 0) return null
  if (typeof archived !== 'boolean') return null
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt) || createdAt < 0 || createdAt > now + MAX_FUTURE_SKEW_MS) return null
  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || updatedAt < 0 || updatedAt > now + MAX_FUTURE_SKEW_MS) return null
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) return null

  const clean: ValidatedFile = {
    id, name, type, content, className, resourceType, version,
    archived, createdAt, updatedAt, size,
  }
  if (typeof f.canonicalName === 'string' && f.canonicalName.length <= 512) clean.canonicalName = f.canonicalName
  if (typeof f.lineageId === 'string' && ID_PATTERN.test(f.lineageId)) clean.lineageId = f.lineageId
  if (typeof f.source === 'string' && f.source.length <= 32) clean.source = f.source
  if (isPlainObject(f.viewerState)) clean.viewerState = f.viewerState as Record<string, unknown>
  return clean
}

function checkAuth(req: Request, expected: string): boolean {
  const header = req.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) return false
  const provided = header.slice(7).trim()
  if (provided.length !== expected.length) return false
  // Constant-time compare
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } })
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOOM_READ_WRITE_TOKEN || process.env.bloom_READ_WRITE_TOKEN
  if (!blobToken) return json({ error: 'Blob token not set.' }, 503)

  const syncSecret = process.env.SYNC_SECRET
  if (!syncSecret || syncSecret.length < 16) {
    return json({ error: 'SYNC_SECRET env var must be set (min 16 chars).' }, 503)
  }
  if (!checkAuth(req, syncSecret)) {
    return json({ error: 'Unauthorized' }, 401, { 'www-authenticate': 'Bearer' })
  }

  const auth = { authorization: `Bearer ${blobToken}` }

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
        },
      })
    } catch {
      return json({ error: 'Upstream error' }, 500)
    }
  }

  // ── POST ───────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const contentLengthHeader = req.headers.get('content-length')
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader)
      if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
        return json({ error: 'Payload too large' }, 413)
      }
    }

    let raw: string
    try { raw = await req.text() } catch { return json({ error: 'Bad body' }, 400) }
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'Payload too large' }, 413)

    let body: unknown
    try { body = JSON.parse(raw) } catch { return json({ error: 'Bad JSON' }, 400) }
    if (!isPlainObject(body)) return json({ error: 'Bad body' }, 400)

    const filesRaw = (body as { files?: unknown }).files
    if (!Array.isArray(filesRaw)) return json({ error: 'No files array' }, 400)
    if (filesRaw.length > MAX_FILES) return json({ error: 'Too many files' }, 413)

    const now = Date.now()
    const cleanFiles: ValidatedFile[] = []
    for (const f of filesRaw) {
      const v = validateFile(f, now)
      if (!v) return json({ error: 'Invalid file in payload' }, 400)
      cleanFiles.push(v)
    }

    const updatedAtRaw = (body as { updatedAt?: unknown }).updatedAt
    const updatedAt = typeof updatedAtRaw === 'number' && Number.isFinite(updatedAtRaw)
      ? Math.min(Math.max(0, updatedAtRaw), now + MAX_FUTURE_SKEW_MS)
      : now

    const payload = JSON.stringify({ files: cleanFiles, updatedAt })

    try {
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

      if (!pr.ok) return json({ error: `Upstream put failed (${pr.status})` }, 500)

      return json({ ok: true, updatedAt: now })
    } catch {
      return json({ error: 'Upstream error' }, 500)
    }
  }

  return json({ error: 'Method not allowed' }, 405)
}
