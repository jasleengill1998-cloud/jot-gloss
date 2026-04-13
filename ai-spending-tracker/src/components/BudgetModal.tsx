import { useState, useEffect, useRef } from 'react'
import { fmtCurrency } from '../lib/store'

interface Props {
  current: number
  onSave: (amount: number) => void
  onClose: () => void
}

export default function BudgetModal({ current, onSave, onClose }: Props) {
  const [value, setValue] = useState(current > 0 ? current.toString() : '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(value)
    onSave(parsed > 0 ? parsed : 0)
    onClose()
  }

  const presets = [20, 50, 100, 200]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-surface rounded-2xl border border-border p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text mb-1">Set Monthly Budget</h2>
        <p className="text-sm text-text-muted mb-5">
          {current > 0
            ? `Current budget: ${fmtCurrency(current)}`
            : 'How much do you plan to spend per month?'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-lg">$</span>
            <input
              ref={inputRef}
              type="number"
              step="1"
              min="0"
              placeholder="0"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl pl-8 pr-4 py-3 text-xl font-semibold text-text outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex gap-2 mb-5">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setValue(p.toString())}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  value === p.toString()
                    ? 'bg-accent/15 border-accent/40 text-accent-light'
                    : 'bg-surface-2 border-border text-text-muted hover:border-border-light'
                }`}
              >
                ${p}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {current > 0 && (
              <button
                type="button"
                onClick={() => { onSave(0); onClose() }}
                className="px-4 py-2.5 text-sm text-red hover:bg-red/10 rounded-lg transition-colors"
              >
                Remove
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-text-muted hover:text-text rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-light transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
