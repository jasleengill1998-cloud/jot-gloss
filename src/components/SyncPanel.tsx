import { useState } from 'react'
import type { StudyFile } from '../types'
import {
  pullFromCloud, pushToCloud, mergeFiles,
  SyncAuthError, getSyncToken, setSyncToken, clearSyncToken,
} from '../utils/cloudSync'
import * as db from '../db/indexeddb'

interface Props {
  files: StudyFile[]
  classes: string[]
  onRefresh: () => Promise<void>
  onClose: () => void
}

export default function SyncPanel({ files, classes, onRefresh, onClose }: Props) {
  const [busy, setBusy] = useState<'push' | 'pull' | null>(null)
  const [tokenDraft, setTokenDraft] = useState(() => getSyncToken() ?? '')
  const [hasToken, setHasToken] = useState(() => Boolean(getSyncToken()))
  const [status, setStatus] = useState<{ tone: 'idle' | 'success' | 'error'; message: string }>({
    tone: 'idle',
    message: 'Sync your library between devices. Requires a sync token from your Vercel env.',
  })

  const ensureToken = (): boolean => {
    if (getSyncToken()) return true
    setStatus({ tone: 'error', message: 'Set your sync token first.' })
    return false
  }

  const handleSaveToken = () => {
    const trimmed = tokenDraft.trim()
    if (trimmed.length < 16) {
      setStatus({ tone: 'error', message: 'Token must be at least 16 characters.' })
      return
    }
    setSyncToken(trimmed)
    setHasToken(true)
    setStatus({ tone: 'success', message: 'Sync token saved to this device.' })
  }

  const handleClearToken = () => {
    clearSyncToken()
    setHasToken(false)
    setTokenDraft('')
    setStatus({ tone: 'idle', message: 'Sync token cleared from this device.' })
  }

  const handlePush = async () => {
    if (!ensureToken()) return
    setBusy('push')
    setStatus({ tone: 'idle', message: 'Uploading your library...' })
    try {
      const result = await pushToCloud(files)
      setStatus({ tone: 'success', message: `Uploaded ${files.length} files. Last sync: ${new Date(result.updatedAt).toLocaleTimeString()}` })
    } catch (e: unknown) {
      if (e instanceof SyncAuthError) {
        setStatus({ tone: 'error', message: 'Sync token rejected. Re-enter it above.' })
      } else {
        setStatus({ tone: 'error', message: e instanceof Error ? e.message : 'Upload failed.' })
      }
    } finally {
      setBusy(null)
    }
  }

  const handlePull = async () => {
    if (!ensureToken()) return
    setBusy('pull')
    setStatus({ tone: 'idle', message: 'Downloading from cloud...' })
    try {
      const cloud = await pullFromCloud()
      if (cloud.files.length === 0) {
        setStatus({ tone: 'idle', message: 'No files found in cloud. Push first from your main device.' })
        setBusy(null)
        return
      }
      const lastSynced = Number(localStorage.getItem('studybloom-last-synced') || '0')
      const merged = mergeFiles(files, cloud.files, lastSynced)
      await db.replaceAllFiles(merged)
      localStorage.setItem('studybloom-last-synced', String(Date.now()))
      await onRefresh()
      setStatus({ tone: 'success', message: `Synced! ${merged.length} files on this device now.` })
    } catch (e: unknown) {
      if (e instanceof SyncAuthError) {
        setStatus({ tone: 'error', message: 'Sync token rejected. Re-enter it above.' })
      } else {
        setStatus({ tone: 'error', message: e instanceof Error ? e.message : 'Download failed.' })
      }
    } finally {
      setBusy(null)
    }
  }

  const active = files.filter(f => !f.archived).length
  const archived = files.filter(f => f.archived).length

  return (
    <div className="panel p-5 mb-4 animate-slideDown">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 16, fontWeight: 700, color: '#5A3E4B',
        }}>Cloud Sync</h2>
        <button onClick={onClose} style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: '#C88898', background: 'none', border: 'none', cursor: 'pointer',
        }}>close</button>
      </div>

      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 10, fontStyle: 'italic', color: 'rgba(90,62,75,0.6)',
        marginBottom: 12,
      }}>
        {active} live pages, {archived} saved versions, {classes.length} courses
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{
          display: 'block',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'rgba(90,62,75,0.5)', marginBottom: 4,
        }}>
          Sync token
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={tokenDraft}
            onChange={e => setTokenDraft(e.target.value)}
            autoComplete="off"
            placeholder={hasToken ? '•••••••• (saved)' : 'Paste SYNC_SECRET'}
            className="flex-1 input-warm"
            style={{ padding: '8px 10px', fontSize: 12 }}
          />
          <button onClick={handleSaveToken}
            className="btn-primary px-3 py-1.5">
            Save
          </button>
          {hasToken && (
            <button onClick={handleClearToken}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                padding: '6px 10px', cursor: 'pointer',
                border: '1px solid rgba(240,160,180,0.3)',
                background: 'transparent', color: '#C88898',
              }}>
              Clear
            </button>
          )}
        </div>
        <p style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 10, color: 'rgba(90,62,75,0.5)', marginTop: 4,
        }}>
          Stored only on this device. Must match the SYNC_SECRET env var on your Vercel deployment.
        </p>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={handlePush} disabled={busy !== null || !hasToken}
          className="btn-primary px-3 py-1.5 disabled:opacity-40">
          {busy === 'push' ? 'Uploading...' : 'Push to Cloud'}
        </button>
        <button onClick={handlePull} disabled={busy !== null || !hasToken}
          className="disabled:opacity-40"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            padding: '6px 12px', cursor: 'pointer',
            border: '1px solid rgba(240,160,180,0.3)',
            background: 'transparent', color: '#C88898',
          }}>
          {busy === 'pull' ? 'Pulling...' : 'Pull from Cloud'}
        </button>
      </div>

      <div style={{
        fontFamily: "'Outfit', system-ui, sans-serif",
        fontSize: 10, padding: '6px 8px',
        background: status.tone === 'error' ? 'rgba(240,132,156,0.06)' : status.tone === 'success' ? 'rgba(128,200,144,0.06)' : 'rgba(255,234,230,0.5)',
        border: `1px solid ${status.tone === 'error' ? 'rgba(240,132,156,0.2)' : status.tone === 'success' ? 'rgba(128,200,144,0.2)' : 'rgba(200,136,152,0.15)'}`,
        color: status.tone === 'error' ? '#F0849C' : status.tone === 'success' ? '#80C890' : '#5A3E4B',
      }}>
        {status.message}
      </div>
    </div>
  )
}
