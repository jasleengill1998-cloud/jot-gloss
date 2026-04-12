/**
 * SyncStatus — detailed sync indicator with refresh button.
 */

import type { SyncStatus as SyncStatusType } from '../hooks/useSync'

interface Props {
  syncStatus: SyncStatusType
  lastSynced: number
  syncError: string | null
  onSync: () => void
}

function formatTime(ts: number): string {
  if (ts === 0) return 'never'
  const now = Date.now()
  const diffSec = Math.round((now - ts) / 1000)
  if (diffSec < 30) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 1) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.round(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const STATUS_CONFIG: Record<SyncStatusType, { dot: string; label: string; bg: string }> = {
  synced:  { dot: '#80C890', label: 'Synced',        bg: 'rgba(128,200,144,0.08)' },
  syncing: { dot: '#F0849C', label: 'Syncing\u2026',  bg: 'rgba(240,132,156,0.08)' },
  offline: { dot: '#C88898', label: 'Offline',        bg: 'rgba(200,136,152,0.08)' },
  error:   { dot: '#F0849C', label: 'Sync failed',   bg: 'rgba(240,132,156,0.08)' },
  idle:    { dot: '#C88898', label: 'Ready to sync',  bg: 'transparent' },
}

export default function SyncStatus({ syncStatus, lastSynced, syncError, onSync }: Props) {
  const isSyncing = syncStatus === 'syncing'
  const cfg = STATUS_CONFIG[syncStatus]

  return (
    <div className="mb-4">
      {/* Refresh button */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="w-full disabled:opacity-50"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          padding: '10px 12px',
          background: 'linear-gradient(180deg, #FFB8C8, #F0A0B4)',
          border: '1px solid rgba(240,160,176,0.4)',
          color: '#5A3E4B',
          cursor: isSyncing ? 'wait' : 'pointer',
        }}
        title="Pull latest files from cloud and push local changes"
      >
        <span style={{
          display: 'inline-block',
          animation: isSyncing ? 'spin 1s linear infinite' : 'none',
          marginRight: 6,
          fontSize: 13,
        }}>
          {'\u21BB'}
        </span>
        {isSyncing ? 'Syncing\u2026' : 'Refresh & Sync'}
      </button>

      {/* Status detail box */}
      <div className="mt-2 px-2 py-2" role="status" aria-live="polite" style={{ background: cfg.bg, border: syncStatus === 'error' ? '1px solid rgba(240,132,156,0.2)' : '1px solid transparent' }}>
        {/* Status line */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0"
            style={{
              backgroundColor: cfg.dot,
              boxShadow: isSyncing ? `0 0 6px ${cfg.dot}` : 'none',
              animation: isSyncing ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 10, fontWeight: 600, color: cfg.dot,
          }}>
            {cfg.label}
          </span>
        </div>

        {/* Last synced time */}
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 9, fontStyle: 'italic', color: 'rgba(90,62,75,0.6)',
          marginTop: 4, paddingLeft: 15,
        }}>
          Last sync: {formatTime(lastSynced)}
        </div>

        {/* Error details */}
        {syncStatus === 'error' && syncError && (
          <div style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 10, color: '#F0849C', lineHeight: 1.3,
            marginTop: 4, paddingLeft: 15,
          }}>
            {syncError}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
