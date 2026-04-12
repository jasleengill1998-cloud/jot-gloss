import type { StudyFile } from '../types'

const SYNC_API = '/api/sync'

export interface CloudPayload {
  files: StudyFile[]
  updatedAt: number
}

/**
 * Pull all files from the Vercel Blob cloud store via /api/sync.
 * Returns an empty array if nothing stored yet.
 */
export async function pullFromCloud(): Promise<CloudPayload> {
  const response = await fetch(SYNC_API, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error || `Cloud sync GET failed (${response.status})`)
  }

  const data = await response.json() as CloudPayload
  return {
    files: Array.isArray(data.files) ? data.files : [],
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files, updatedAt: now }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error || `Cloud sync POST failed (${response.status})`)
  }

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
