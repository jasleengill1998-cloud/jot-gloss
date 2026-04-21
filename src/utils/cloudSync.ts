import type { StudyFile } from '../types'

const SYNC_API = '/api/sync'
const SYNC_TOKEN_KEY = 'jg-sync-token'

export class SyncAuthError extends Error {
  constructor(message = 'Sync authentication required') {
    super(message)
    this.name = 'SyncAuthError'
  }
}

export interface CloudPayload {
  files: StudyFile[]
  updatedAt: number
}

export function getSyncToken(): string | null {
  try { return localStorage.getItem(SYNC_TOKEN_KEY) } catch { return null }
}

export function setSyncToken(token: string): void {
  try { localStorage.setItem(SYNC_TOKEN_KEY, token) } catch { /* ignore */ }
}

export function clearSyncToken(): void {
  try { localStorage.removeItem(SYNC_TOKEN_KEY) } catch { /* ignore */ }
}

function authHeaders(): Record<string, string> {
  const token = getSyncToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Lightweight shape check on pulled files so the client doesn't trust the cloud blindly. */
function sanitizeCloudFiles(raw: unknown): StudyFile[] {
  if (!Array.isArray(raw)) return []
  const now = Date.now()
  const skew = 5 * 60 * 1000
  const allowedTypes = new Set(['jsx', 'html', 'pdf', 'markdown', 'other'])
  const idPattern = /^[A-Za-z0-9_-]{1,128}$/
  const out: StudyFile[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const f = item as Record<string, unknown>
    if (typeof f.id !== 'string' || !idPattern.test(f.id)) continue
    if (typeof f.name !== 'string' || f.name.length === 0 || f.name.length > 512) continue
    if (typeof f.type !== 'string' || !allowedTypes.has(f.type)) continue
    if (typeof f.content !== 'string') continue
    if (typeof f.className !== 'string') continue
    if (typeof f.resourceType !== 'string') continue
    if (typeof f.version !== 'number' || !Number.isFinite(f.version)) continue
    if (typeof f.archived !== 'boolean') continue
    if (typeof f.createdAt !== 'number' || !Number.isFinite(f.createdAt)) continue
    if (typeof f.updatedAt !== 'number' || !Number.isFinite(f.updatedAt)) continue
    if (typeof f.size !== 'number' || !Number.isFinite(f.size)) continue
    const clamped: StudyFile = {
      id: f.id,
      name: f.name,
      type: f.type as StudyFile['type'],
      content: f.content,
      className: f.className,
      resourceType: f.resourceType,
      version: f.version,
      archived: f.archived,
      createdAt: Math.max(0, Math.min(f.createdAt, now + skew)),
      updatedAt: Math.max(0, Math.min(f.updatedAt, now + skew)),
      size: Math.max(0, f.size),
    }
    if (typeof f.canonicalName === 'string') clamped.canonicalName = f.canonicalName
    if (typeof f.lineageId === 'string' && idPattern.test(f.lineageId)) clamped.lineageId = f.lineageId
    if (typeof f.source === 'string') clamped.source = f.source as StudyFile['source']
    if (f.viewerState && typeof f.viewerState === 'object' && !Array.isArray(f.viewerState)) {
      clamped.viewerState = f.viewerState as Record<string, unknown>
    }
    out.push(clamped)
  }
  return out
}

async function handleNonOk(response: Response): Promise<never> {
  if (response.status === 401) throw new SyncAuthError()
  const body = await response.json().catch(() => ({}))
  throw new Error((body as { error?: string }).error || `Cloud sync failed (${response.status})`)
}

/**
 * Pull all files from the Vercel Blob cloud store via /api/sync.
 * Returns an empty array if nothing stored yet.
 */
export async function pullFromCloud(): Promise<CloudPayload> {
  const response = await fetch(SYNC_API, {
    method: 'GET',
    headers: { Accept: 'application/json', ...authHeaders() },
  })
  if (!response.ok) return handleNonOk(response)
  const data = await response.json() as Partial<CloudPayload>
  return {
    files: sanitizeCloudFiles(data.files),
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
  }
}

/**
 * Push files JSON to the Vercel Blob cloud store via /api/sync.
 */
export async function pushToCloud(files: StudyFile[]): Promise<{ updatedAt: number }> {
  const now = Date.now()
  const response = await fetch(SYNC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ files, updatedAt: now }),
  })
  if (!response.ok) return handleNonOk(response)
  const result = await response.json() as { updatedAt?: number }
  return { updatedAt: typeof result.updatedAt === 'number' ? result.updatedAt : now }
}

/**
 * Merge local and cloud file sets.
 * - Files with the same id: keep whichever has the newer updatedAt
 * - Files unique to either side: include them
 * - If a file exists in cloud but not local, and it was updated after
 *   our last sync, it is new from another device -- keep it.
 *   Otherwise it was deleted locally -- skip it.
 */
export function mergeFiles(
  local: StudyFile[],
  cloud: StudyFile[],
  lastSyncedAt: number,
): StudyFile[] {
  const localMap = new Map(local.map(f => [f.id, f]))
  const cloudMap = new Map(cloud.map(f => [f.id, f]))
  const merged = new Map<string, StudyFile>()

  // Process all local files
  for (const [id, localFile] of localMap) {
    const cloudFile = cloudMap.get(id)
    if (!cloudFile) {
      merged.set(id, localFile)
    } else {
      merged.set(id, localFile.updatedAt >= cloudFile.updatedAt ? localFile : cloudFile)
    }
  }

  // Process cloud-only files (not in local)
  for (const [id, cloudFile] of cloudMap) {
    if (!localMap.has(id)) {
      if (lastSyncedAt === 0 || cloudFile.updatedAt > lastSyncedAt) {
        merged.set(id, cloudFile)
      }
    }
  }

  return Array.from(merged.values())
}
