import { fmtCurrency, fmtMonthYear, type SpendingEntry } from '../lib/store'

interface Props {
  currentMonthTotal: number
  allTimeTotal: number
  avgMonthly: number
  budget: number
  platformBreakdown: { name: string; total: number; color: string }[]
  monthlyHistory: { month: string; total: number }[]
  currentMonthEntries: SpendingEntry[]
  onEditBudget: () => void
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 border border-border p-5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-text">{value}</p>
      {sub && <p className="text-xs text-text-dim mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard({
  currentMonthTotal,
  allTimeTotal,
  avgMonthly,
  budget,
  platformBreakdown,
  monthlyHistory,
  currentMonthEntries,
  onEditBudget,
}: Props) {
  const budgetPct = budget > 0 ? Math.min((currentMonthTotal / budget) * 100, 100) : 0
  const overBudget = budget > 0 && currentMonthTotal > budget
  const remaining = budget > 0 ? budget - currentMonthTotal : 0

  const histMax = Math.max(...monthlyHistory.map(m => m.total), budget, 1)

  const topPlatform = platformBreakdown[0]?.name ?? '—'

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="This Month" value={fmtCurrency(currentMonthTotal)} sub={`${currentMonthEntries.length} charges`} />
        <StatCard label="All Time" value={fmtCurrency(allTimeTotal)} />
        <StatCard label="Monthly Avg" value={fmtCurrency(avgMonthly)} />
        <StatCard label="Top Platform" value={topPlatform} sub={topPlatform !== '—' ? fmtCurrency(platformBreakdown[0].total) : undefined} />
      </div>

      {/* Budget gauge */}
      <div className="rounded-xl bg-surface-2 border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text">Monthly Budget</h3>
          <button
            onClick={onEditBudget}
            className="text-xs text-accent hover:text-accent-light transition-colors"
          >
            {budget > 0 ? 'Edit' : 'Set budget'}
          </button>
        </div>

        {budget > 0 ? (
          <>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">
                {fmtCurrency(currentMonthTotal)} of {fmtCurrency(budget)}
              </span>
              <span className={overBudget ? 'text-red font-medium' : 'text-text-muted'}>
                {overBudget
                  ? `${fmtCurrency(currentMonthTotal - budget)} over`
                  : `${fmtCurrency(remaining)} left`}
              </span>
            </div>
            <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overBudget ? 'bg-red' : budgetPct > 75 ? 'bg-amber' : 'bg-accent'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-text-dim">No budget set. Set one to track your spending limit.</p>
        )}
      </div>

      {/* Platform breakdown */}
      {platformBreakdown.length > 0 && (
        <div className="rounded-xl bg-surface-2 border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-4">Platform Breakdown</h3>
          <div className="space-y-3">
            {platformBreakdown.map(({ name, total, color }) => {
              const pct = currentMonthTotal > 0 ? (total / currentMonthTotal) * 100 : 0
              return (
                <div key={name}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-sm text-text">{name}</span>
                    </div>
                    <span className="text-sm text-text-muted">
                      {fmtCurrency(total)} <span className="text-text-dim">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 6-month history */}
      <div className="rounded-xl bg-surface-2 border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-4">6-Month History</h3>
        <div className="space-y-2">
          {monthlyHistory.map(({ month, total }) => (
            <div key={month} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-16 shrink-0">{fmtMonthYear(month)}</span>
              <div className="flex-1 h-5 bg-surface-3 rounded relative overflow-hidden">
                {budget > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-text-dim opacity-50"
                    style={{ left: `${Math.min((budget / histMax) * 100, 100)}%` }}
                  />
                )}
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    total > budget && budget > 0 ? 'bg-red/70' : 'bg-accent/60'
                  }`}
                  style={{ width: `${histMax > 0 ? (total / histMax) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-text-muted w-16 text-right shrink-0">
                {total > 0 ? fmtCurrency(total) : '—'}
              </span>
            </div>
          ))}
        </div>
        {budget > 0 && (
          <div className="flex items-center gap-1.5 justify-end mt-3">
            <div className="w-3 h-px bg-text-dim opacity-50" />
            <span className="text-[10px] text-text-dim">budget</span>
          </div>
        )}
      </div>
    </div>
  )
}
