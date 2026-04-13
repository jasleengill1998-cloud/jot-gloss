import { useState } from 'react'
import { PLATFORMS, todayStr } from '../lib/store'

interface Props {
  onAdd: (platform: string, amount: number, date: string, note: string) => void
  onClose: () => void
}

export default function AddEntry({ onAdd, onClose }: Props) {
  const [platform, setPlatform] = useState(PLATFORMS[0].name)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState('')

  const parsed = parseFloat(amount)
  const valid = parsed > 0 && date.length === 10

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    onAdd(platform, parsed, date, note.trim())
    setAmount('')
    setNote('')
  }

  return (
    <div className="rounded-xl bg-surface-2 border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">Record a Charge</h3>
        <button onClick={onClose} className="text-xs text-text-dim hover:text-text-muted transition-colors">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Platform */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {PLATFORMS.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Note (optional)</label>
            <input
              type="text"
              placeholder="API calls, subscription..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid}
            className="px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add Entry
          </button>
        </div>
      </form>
    </div>
  )
}
