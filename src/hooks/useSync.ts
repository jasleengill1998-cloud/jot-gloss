import { useState, useCallback, useRef, useEffect } from 'react'
import { pullFromCloud, pushToCloud, mergeFiles } from '../utils/cloudSync'
import * as db from '../db/indexeddb'
import type { StudyFile } from '../types'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

const LAST_SYNCED_KEY = 'studybloom-last-synced'
const DEBOUNCE_MS = 2000

function readLastSynced(): number {
  try {
    const stored = localStorage.getItem(LAST_SYNCED_KEY)
    return stored ? Number(stored) : 0
  } catch {
    return 0
  }
}

function writeLastSynced(ts: number) {
  try {
    localStorage.setItem(LAST_SYNCED_KEY, String(ts))
  } catch { /* ignore */ }
}

/**
 * Pull files from cloud via Vercel Blob.
 */
async function pull(): Promise<{ files: StudyFile[]; updatedAt: number }> {
  return pullFromCloud()
}

/**
 * Push files to cloud via Vercel Blob.
 */
async function push(files: StudyFile[]): Promise<{ updatedAt: number }> {
  return pushToCloud(files)
}

export function useSync(onFilesChanged: () => Promise<void>) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSynced, setLastSynced] = useState<number>(readLastSynced)
  const [syncError, setSyncError] = useState<string | null>(null)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncingRef = useRef(false)

  // Full sync: pull from cloud, merge with local, push merged result back
  const triggerSync = useCallback(async () => {
    if (syncingRef.current) return
    if (!navigator.onLine) {
      setSyncStatus('offline')
      return
    }

    syncingRef.current = true
    setSyncStatus('syncing')
    setSyncError(null)

    try {
      const cloudData = await pull()
      const localFiles = await db.getAllFiles()
      const prevSynced = readLastSynced()
      const merged = mergeFiles(localFiles, cloudData.files, prevSynced)

      await db.replaceAllFiles(merged)
      const result = await push(merged)

      const ts = result.updatedAt
      writeLastSynced(ts)
      setLastSynced(ts)
      setSyncStatus('synced')

      await onFilesChanged()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      setSyncError(message)
      setSyncStatus('error')
    } finally {
      syncingRef.current = false
    }
  }, [onFilesChanged])

  // Debounced push: after a local mutation, wait then push
  const schedulePush = useCallback(() => {
    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current)
    }
    pushTimerRef.current = setTimeout(async () => {
      if (!navigator.onLine || syncingRef.current) return

      try {
        const localFiles = await db.getAllFiles()
        const result = await push(localFiles)
        writeLastSynced(result.updatedAt)
        setLastSynced(result.updatedAt)
        setSyncStatus('synced')
        setSyncError(null)
      } catch (error) {
        console.warn('[sync] Background push failed:', error instanceof Error ? error.message : error)
      }
    }, DEBOUNCE_MS)
  }, [])

  // Push a single file to cloud via debounced full push
  const pushFile = useCallback((_file: StudyFile) => {
    if (!navigator.onLine) return
    schedulePush()
  }, [schedulePush])

  // Delete: debounced full push
  const pushDelete = useCallback((_id: string) => {
    if (!navigator.onLine) return
    schedulePush()
  }, [schedulePush])

  // Auto-sync on mount
  useEffect(() => {
    triggerSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => prev === 'offline' ? 'idle' : prev)
      triggerSync()
    }
    const handleOffline = () => setSyncStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (!navigator.onLine) setSyncStatus('offline')

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [triggerSync])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    }
  }, [])

  return {
    syncStatus,
    lastSynced,
    syncError,
    triggerSync,
    schedulePush,
    pushFile,
    pushDelete,
  }
}
