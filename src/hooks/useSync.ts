import { useState, useCallback, useRef, useEffect } from 'react'
import { pullFromCloud, pushToCloud, mergeFiles, SyncAuthError, getSyncToken } from '../utils/cloudSync'
import * as db from '../db/indexeddb'
import type { StudyFile } from '../types'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'auth-required'

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

export function useSync(onFilesChanged: () => Promise<void>) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSynced, setLastSynced] = useState<number>(readLastSynced)
  const [syncError, setSyncError] = useState<string | null>(null)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncingRef = useRef(false)

  // Full sync: pull from cloud, merge with local, push merged result back.
  // This is only ever triggered explicitly by the user (never auto on mount)
  // to avoid silently pulling + rendering attacker-controlled content.
  const triggerSync = useCallback(async () => {
    if (syncingRef.current) return
    if (!navigator.onLine) {
      setSyncStatus('offline')
      return
    }
    if (!getSyncToken()) {
      setSyncStatus('auth-required')
      setSyncError('Sync token required. Open the Sync panel to set it.')
      return
    }

    syncingRef.current = true
    setSyncStatus('syncing')
    setSyncError(null)

    try {
      const cloudData = await pullFromCloud()
      const localFiles = await db.getAllFiles()
      const prevSynced = readLastSynced()
      const merged = mergeFiles(localFiles, cloudData.files, prevSynced)

      await db.replaceAllFiles(merged)
      const result = await pushToCloud(merged)

      const ts = result.updatedAt
      writeLastSynced(ts)
      setLastSynced(ts)
      setSyncStatus('synced')

      await onFilesChanged()
    } catch (error) {
      if (error instanceof SyncAuthError) {
        setSyncStatus('auth-required')
        setSyncError('Sync token rejected. Re-enter it in the Sync panel.')
      } else {
        const message = error instanceof Error ? error.message : 'Sync failed'
        setSyncError(message)
        setSyncStatus('error')
      }
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
      if (!getSyncToken()) return

      try {
        const localFiles = await db.getAllFiles()
        const result = await pushToCloud(localFiles)
        writeLastSynced(result.updatedAt)
        setLastSynced(result.updatedAt)
        setSyncStatus('synced')
        setSyncError(null)
      } catch (error) {
        if (error instanceof SyncAuthError) {
          setSyncStatus('auth-required')
          setSyncError('Sync token rejected. Re-enter it in the Sync panel.')
        } else {
          console.warn('[sync] Background push failed:', error instanceof Error ? error.message : error)
        }
      }
    }, DEBOUNCE_MS)
  }, [])

  const pushFile = useCallback((_file: StudyFile) => {
    if (!navigator.onLine) return
    schedulePush()
  }, [schedulePush])

  const pushDelete = useCallback((_id: string) => {
    if (!navigator.onLine) return
    schedulePush()
  }, [schedulePush])

  // Online/offline listeners. Do NOT auto-sync on mount or on reconnect:
  // cloud content is user-authored but can be manipulated by anyone with
  // the sync token, so every pull must be an explicit user action.
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => (prev === 'offline' ? 'idle' : prev))
    }
    const handleOffline = () => setSyncStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (!navigator.onLine) setSyncStatus('offline')

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
