import { useMemo, useState } from 'react'
import {
  fmtCurrency,
  fmtDate,
  fmtMonthLong,
  monthKey,
  currentMonthKey,
  platformColor,
  type SpendingEntry,
} from '../lib/store'

interface Props {
  entries: SpendingEntry[]
  onRemove: (id: string) => void
}

export default function EntryLog({ entries, onRemove }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    set.add(currentMonthKey())
    for (const e of entries) set.add(monthKey(e.date))
    return Array.from(set).sort().reverse()
  }, [entries])

  const filtered = useMemo(
    () => entries
      .filter(e => monthKey(e.date) === selectedMonth)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [entries, selectedMonth],
  )

  const monthTotal = useMemo(
    () => filtered.reduce((s, e) => s + e.amount, 0),
    [filtered],
  )

  const handleRemove = (id: string) => {
    if (confirmDelete === id) {
      onRemove(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(prev => prev === id ? null : prev), 3000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Month filter + total */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {availableMonths.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedMonth === m
                  ? 'bg-accent/15 border-accent/40 text-accent-light'
                  : 'bg-surface-2 border-border text-text-muted hover:border-border-light'
              }`}
            >
              {fmtMonthLong(m)}
            </button>
          ))}
        </div>
        <span className="text-sm font-semibold text-text">{fmtCurrency(monthTotal)}</span>
      </div>

      {/* Entry list */}
      <div className="rounded-xl bg-surface-2 border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-dim">No charges recorded for {fmtMonthLong(selectedMonth)}.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-surface-3/50 transition-colors">
                {/* Color dot */}
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: platformColor(entry.platform) }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-text">{entry.platform}</span>
                    <span className="text-xs text-text-dim">{fmtDate(entry.date)}</span>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-text-dim truncate mt-0.5">{entry.note}</p>
                  )}
                </div>

                {/* Amount + delete */}
                <span className="text-sm font-semibold text-text shrink-0">{fmtCurrency(entry.amount)}</span>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className={`shrink-0 text-xs px-2 py-1 rounded transition-colors ${
                    confirmDelete === entry.id
                      ? 'bg-red/20 text-red'
                      : 'text-text-dim opacity-0 group-hover:opacity-100 hover:text-red'
                  }`}
                  title={confirmDelete === entry.id ? 'Click again to confirm' : 'Remove'}
                >
                  {confirmDelete === entry.id ? 'Confirm?' : '✕'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
