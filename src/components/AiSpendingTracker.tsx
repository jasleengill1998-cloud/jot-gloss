/**
 * THE INK ACCOUNT — AI usage & spending tracker across platforms.
 *
 * Features:
 * - Add spending entries per AI platform with date & notes
 * - Monthly budget gauge with visual fill
 * - Per-platform breakdown bars (current month)
 * - 6-month spending history chart
 * - Entry log with remove capability
 */
import { useState, useMemo } from 'react'
import {
  useAiSpending,
  AI_PLATFORMS,
  PLATFORM_ICONS,
  todayStr,
  monthStr,
  fmtCurrency,
  fmtMonth,
} from '../hooks/useAiSpending'

interface Props {
  onClose: () => void
}

/* ═══ PALETTE — muted tones matching the study room ═══ */
const PLATFORM_COLORS: Record<string, string> = {
  Claude:     '#C88898',
  ChatGPT:    '#88B090',
  Gemini:     '#90A8C8',
  Copilot:    '#A8A0C0',
  Midjourney: '#C8A878',
  Perplexity: '#80B0B8',
  Grok:       '#B89888',
  Cursor:     '#98A8A0',
  Other:      '#B0A898',
}

const SERIF = "'Cormorant Garamond', Georgia, serif"

/* ═══ SECTION HEADING ═══ */
function SectionHeading({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: SERIF,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
      textTransform: 'uppercase' as const, color: '#5A3E4B', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

/* ═══ METRIC CARD ═══ */
function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,244,240,0.6)',
      border: '1px solid rgba(200,136,152,0.15)',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: SERIF,
        fontSize: 22, fontWeight: 700, color: '#5A3E4B',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        color: '#C88898', marginTop: 4,
      }}>
        {label}
      </div>
      {sub && (
        <div style={{
          fontFamily: SERIF,
          fontSize: 10, fontStyle: 'italic', color: 'rgba(90,62,75,0.6)', marginTop: 2,
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ═══ BUDGET GAUGE ═══ */
function BudgetGauge({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const over = budget > 0 && spent > budget
  const remaining = budget > 0 ? Math.max(budget - spent, 0) : 0

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 6,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 12, color: '#5A3E4B', fontStyle: 'italic' }}>
          {budget > 0
            ? over
              ? `Over budget by ${fmtCurrency(spent - budget)}`
              : `${fmtCurrency(remaining)} remaining`
            : 'No budget set'}
        </span>
        {budget > 0 && (
          <span style={{ fontFamily: SERIF, fontSize: 11, color: '#C88898' }}>
            {fmtCurrency(spent)} / {fmtCurrency(budget)}
          </span>
        )}
      </div>
      {budget > 0 && (
        <div style={{
          height: 8, background: 'rgba(240,160,180,0.1)',
          borderRadius: 4, overflow: 'hidden',
          border: '0.5px solid rgba(200,136,152,0.12)',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: over
              ? 'linear-gradient(90deg, #D06878, #C04858)'
              : 'linear-gradient(90deg, #C88898, #E8A8B0)',
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}
    </div>
  )
}

/* ═══ HISTORY CHART — 6-month horizontal bars ═══ */
function HistoryChart({ monthlyTotals, budget }: {
  monthlyTotals: Map<string, number>
  budget: number
}) {
  const months = useMemo(() => {
    const result: { month: string; total: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.toISOString().slice(0, 7)
      result.push({ month: m, total: monthlyTotals.get(m) || 0 })
    }
    return result
  }, [monthlyTotals])

  const maxVal = Math.max(...months.map(m => m.total), budget, 1)

  return (
    <div style={{ marginBottom: 18 }}>
      <SectionHeading>Six-Month History</SectionHeading>
      {months.map(({ month, total }) => (
        <div key={month} style={{ marginBottom: 6 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 2,
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 11, fontStyle: 'italic', color: '#5A3E4B' }}>
              {fmtMonth(month)}
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 10, color: '#C88898' }}>
              {total > 0 ? fmtCurrency(total) : '—'}
            </span>
          </div>
          <div style={{
            height: 5, background: 'rgba(240,160,180,0.08)',
            borderRadius: 2, overflow: 'hidden', position: 'relative',
          }}>
            {budget > 0 && (
              <div style={{
                position: 'absolute',
                left: `${Math.min((budget / maxVal) * 100, 100)}%`,
                top: 0, bottom: 0, width: 1,
                background: 'rgba(90,62,75,0.25)',
              }} />
            )}
            <div style={{
              width: `${maxVal > 0 ? (total / maxVal) * 100 : 0}%`,
              height: '100%',
              background: total > budget && budget > 0
                ? 'rgba(208,104,120,0.7)'
                : 'rgba(200,136,152,0.55)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      ))}
      {budget > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
          justifyContent: 'flex-end',
        }}>
          <div style={{ width: 12, height: 1, background: 'rgba(90,62,75,0.25)' }} />
          <span style={{ fontFamily: SERIF, fontSize: 9, fontStyle: 'italic', color: 'rgba(90,62,75,0.5)' }}>
            budget line
          </span>
        </div>
      )}
    </div>
  )
}

/* ═══ ADD ENTRY FORM ═══ */
function AddEntryForm({ onAdd }: { onAdd: (platform: string, amount: number, date: string, note: string) => void }) {
  const [platform, setPlatform] = useState<string>(AI_PLATFORMS[0])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) return
    onAdd(platform, parsed, date, note)
    setAmount('')
    setNote('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontFamily: SERIF,
          fontSize: 12, fontStyle: 'italic',
          color: '#C88898',
          background: 'rgba(255,244,240,0.4)',
          border: '1px dashed rgba(200,136,152,0.3)',
          cursor: 'pointer',
          transition: 'background 0.2s',
          marginBottom: 16,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,244,240,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,244,240,0.4)')}
      >
        + Record a charge
      </button>
    )
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: SERIF,
    fontSize: 12,
    color: '#5A3E4B',
    background: 'rgba(255,252,248,0.8)',
    border: '1px solid rgba(199,183,157,0.35)',
    padding: '6px 10px',
    width: '100%',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: SERIF,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(90,62,75,0.6)',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <form onSubmit={handleSubmit} style={{
      padding: '14px',
      background: 'rgba(255,248,242,0.5)',
      border: '1px solid rgba(199,183,157,0.25)',
      marginBottom: 16,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Platform</label>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {AI_PLATFORMS.map(p => (
              <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={inputStyle}
            autoFocus
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Note</label>
          <input
            type="text"
            placeholder="optional"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setOpen(false)} style={{
          fontFamily: SERIF, fontSize: 10, color: 'rgba(90,62,75,0.5)',
          background: 'none', border: 'none', cursor: 'pointer',
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        }}>
          cancel
        </button>
        <button type="submit" style={{
          fontFamily: SERIF, fontSize: 10, color: '#fff',
          background: '#C88898', border: 'none', cursor: 'pointer',
          padding: '5px 14px', letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          opacity: amount && parseFloat(amount) > 0 ? 1 : 0.4,
        }}>
          record
        </button>
      </div>
    </form>
  )
}

/* ═══ MAIN COMPONENT ═══ */
type View = 'overview' | 'log'

export default function AiSpendingTracker({ onClose }: Props) {
  const {
    entries,
    budget,
    addEntry,
    removeEntry,
    setBudget,
    currentMonth,
    currentMonthTotal,
    monthlyTotals,
    platformTotals,
  } = useAiSpending()

  const [view, setView] = useState<View>('overview')
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(budget.amount > 0 ? budget.amount.toString() : '')
  const [logMonth, setLogMonth] = useState(currentMonth)

  // All-time total
  const allTimeTotal = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries])

  // Entries for selected month in log view
  const logEntries = useMemo(
    () => entries
      .filter(e => monthStr(e.date) === logMonth)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [entries, logMonth],
  )

  // Available months for log filter
  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    set.add(currentMonth)
    for (const e of entries) set.add(monthStr(e.date))
    return Array.from(set).sort().reverse()
  }, [entries, currentMonth])

  // Platform breakdown max for bar scaling
  const maxPlatform = Math.max(...platformTotals.map(([, v]) => v), 1)

  // Count of platforms used this month
  const platformCount = platformTotals.length

  const handleBudgetSave = () => {
    const parsed = parseFloat(budgetInput)
    setBudget(parsed > 0 ? parsed : 0)
    setEditingBudget(false)
  }

  return (
    <div className="panel animate-slideDown" style={{
      padding: '20px 24px',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 13, fontWeight: 700, letterSpacing: '0.25em',
          textTransform: 'uppercase' as const, color: '#5A3E4B',
        }}>The Ink Account</span>
        <button onClick={onClose} style={{
          fontFamily: SERIF,
          fontSize: 10, color: '#C88898', background: 'none', border: 'none', cursor: 'pointer',
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        }}>close</button>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([['overview', 'Overview'], ['log', 'Entry Log']] as const).map(([key, label]) => (
          <button key={key}
            className={`filter-chip ${view === key ? 'active' : ''}`}
            onClick={() => setView(key)}>
            {label}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <>
          {/* ═══ METRICS ═══ */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8, marginBottom: 18,
          }}>
            <MetricCard
              label="This Month"
              value={fmtCurrency(currentMonthTotal)}
              sub={fmtMonth(currentMonth)}
            />
            <MetricCard
              label="All Time"
              value={fmtCurrency(allTimeTotal)}
              sub={`${entries.length} entries`}
            />
            <MetricCard
              label="Platforms"
              value={platformCount.toString()}
              sub="this month"
            />
          </div>

          {/* ═══ BUDGET GAUGE ═══ */}
          <div style={{ marginBottom: 4 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 6,
            }}>
              <SectionHeading>Monthly Budget</SectionHeading>
              {!editingBudget ? (
                <button
                  type="button"
                  onClick={() => { setBudgetInput(budget.amount > 0 ? budget.amount.toString() : ''); setEditingBudget(true) }}
                  style={{
                    fontFamily: SERIF, fontSize: 9, color: '#C88898',
                    background: 'none', border: 'none', cursor: 'pointer',
                    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  }}
                >
                  {budget.amount > 0 ? 'adjust' : 'set'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: '#5A3E4B' }}>$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleBudgetSave() }}
                    autoFocus
                    style={{
                      fontFamily: SERIF, fontSize: 12, color: '#5A3E4B',
                      background: 'rgba(255,252,248,0.8)',
                      border: '1px solid rgba(199,183,157,0.35)',
                      padding: '3px 6px', width: 64, outline: 'none',
                    }}
                  />
                  <button type="button" onClick={handleBudgetSave} style={{
                    fontFamily: SERIF, fontSize: 9, color: '#C88898',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}>save</button>
                </div>
              )}
            </div>
            <BudgetGauge spent={currentMonthTotal} budget={budget.amount} />
          </div>

          {/* ═══ ADD ENTRY ═══ */}
          <AddEntryForm onAdd={addEntry} />

          {/* ═══ PLATFORM BREAKDOWN ═══ */}
          {platformTotals.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading>By Platform</SectionHeading>
              {platformTotals.map(([platform, total]) => {
                const pct = currentMonthTotal > 0 ? Math.round((total / currentMonthTotal) * 100) : 0
                const barWidth = Math.round((total / maxPlatform) * 100)
                const color = PLATFORM_COLORS[platform] || PLATFORM_COLORS.Other
                return (
                  <div key={platform} style={{ marginBottom: 8 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      marginBottom: 3,
                    }}>
                      <span style={{
                        fontFamily: SERIF,
                        fontSize: 11, fontStyle: 'italic', color: '#5A3E4B',
                      }}>
                        {PLATFORM_ICONS[platform] || '○'} {platform}
                      </span>
                      <span style={{ fontFamily: SERIF, fontSize: 10, color: '#C88898' }}>
                        {fmtCurrency(total)} ({pct}%)
                      </span>
                    </div>
                    <div style={{
                      height: 5, background: 'rgba(240,160,180,0.1)',
                      borderRadius: 2, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${barWidth}%`, height: '100%',
                        background: color,
                        borderRadius: 2,
                        transition: 'width 0.4s ease',
                        opacity: 0.65,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ HISTORY CHART ═══ */}
          <HistoryChart monthlyTotals={monthlyTotals} budget={budget.amount} />

          {/* Empty state */}
          {entries.length === 0 && (
            <p style={{
              fontFamily: SERIF,
              fontSize: 12, fontStyle: 'italic', color: 'rgba(90,62,75,0.35)',
              textAlign: 'center', padding: '8px 0',
            }}>
              No charges recorded yet. Use the form above to begin tracking.
            </p>
          )}
        </>
      )}

      {view === 'log' && (
        <>
          {/* Month selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {availableMonths.map(m => (
              <button key={m}
                className={`filter-chip ${logMonth === m ? 'active' : ''}`}
                onClick={() => setLogMonth(m)}>
                {fmtMonth(m)}
              </button>
            ))}
          </div>

          {/* Month total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 12, padding: '8px 0',
            borderBottom: '1px solid rgba(199,183,157,0.2)',
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 12, fontStyle: 'italic', color: '#5A3E4B' }}>
              {fmtMonth(logMonth)} total
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#5A3E4B' }}>
              {fmtCurrency(monthlyTotals.get(logMonth) || 0)}
            </span>
          </div>

          {/* Entry list */}
          {logEntries.length > 0 ? (
            logEntries.map(entry => (
              <div key={entry.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: '1px solid rgba(240,160,180,0.08)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 12, color: '#5A3E4B' }}>
                      {PLATFORM_ICONS[entry.platform] || '○'} {entry.platform}
                    </span>
                    <span style={{ fontFamily: SERIF, fontSize: 10, fontStyle: 'italic', color: 'rgba(90,62,75,0.45)' }}>
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {entry.note && (
                    <div style={{
                      fontFamily: SERIF, fontSize: 10, fontStyle: 'italic',
                      color: 'rgba(90,62,75,0.4)', marginTop: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.note}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: '#5A3E4B' }}>
                    {fmtCurrency(entry.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    title="Remove entry"
                    style={{
                      fontFamily: SERIF, fontSize: 10, color: 'rgba(90,62,75,0.3)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '2px 4px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#D06878')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(90,62,75,0.3)')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{
              fontFamily: SERIF,
              fontSize: 12, fontStyle: 'italic', color: 'rgba(90,62,75,0.35)',
              textAlign: 'center', padding: '16px 0',
            }}>
              No charges recorded for {fmtMonth(logMonth)}.
            </p>
          )}
        </>
      )}
    </div>
  )
}
