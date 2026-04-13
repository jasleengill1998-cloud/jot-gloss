import { useState, useCallback, useMemo } from 'react'

/* ═══════════════ TYPES ═══════════════ */

export interface SpendingEntry {
  id: string
  platform: string
  amount: number
  date: string // YYYY-MM-DD
  note: string
  createdAt: number
}

export const PLATFORMS = [
  { id: 'claude',     name: 'Claude',      color: '#d4a27f' },
  { id: 'chatgpt',    name: 'ChatGPT',     color: '#74aa9c' },
  { id: 'gemini',     name: 'Gemini',      color: '#4285f4' },
  { id: 'copilot',    name: 'Copilot',     color: '#a371f7' },
  { id: 'midjourney', name: 'Midjourney',  color: '#f5c542' },
  { id: 'perplexity', name: 'Perplexity',  color: '#20b2aa' },
  { id: 'grok',       name: 'Grok',        color: '#e8625a' },
  { id: 'cursor',     name: 'Cursor',      color: '#00d4aa' },
  { id: 'other',      name: 'Other',       color: '#8888a0' },
] as const

export type PlatformId = (typeof PLATFORMS)[number]['id']

export function platformColor(name: string): string {
  return PLATFORMS.find(p => p.name === name)?.color ?? '#8888a0'
}

/* ═══════════════ PERSISTENCE ═══════════════ */

const ENTRIES_KEY = 'ai-spend-entries-v1'
const BUDGET_KEY = 'ai-spend-budget-v1'

function loadEntries(): SpendingEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]')
  } catch { return [] }
}

function saveEntries(entries: SpendingEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

function loadBudget(): number {
  try {
    return parseFloat(localStorage.getItem(BUDGET_KEY) || '0') || 0
  } catch { return 0 }
}

function saveBudget(b: number) {
  localStorage.setItem(BUDGET_KEY, String(b))
}

/* ═══════════════ HELPERS ═══════════════ */

let counter = 0
function makeId(): string {
  return Date.now().toString(36) + (counter++).toString(36) + Math.random().toString(36).slice(2, 6)
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthKey(date: string): string {
  return date.slice(0, 7) // "YYYY-MM"
}

export function currentMonthKey(): string {
  return todayStr().slice(0, 7)
}

export function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function fmtMonthYear(ym: string): string {
  const [y, m] = ym.split('-')
  return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function fmtMonthLong(ym: string): string {
  const [y, m] = ym.split('-')
  return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ═══════════════ HOOK ═══════════════ */

export function useSpendingStore() {
  const [entries, setEntries] = useState<SpendingEntry[]>(loadEntries)
  const [budget, setBudgetRaw] = useState<number>(loadBudget)

  const addEntry = useCallback((platform: string, amount: number, date: string, note: string) => {
    const entry: SpendingEntry = { id: makeId(), platform, amount, date, note, createdAt: Date.now() }
    setEntries(prev => {
      const next = [entry, ...prev]
      saveEntries(next)
      return next
    })
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id)
      saveEntries(next)
      return next
    })
  }, [])

  const editEntry = useCallback((id: string, updates: Partial<Pick<SpendingEntry, 'platform' | 'amount' | 'date' | 'note'>>) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates } : e)
      saveEntries(next)
      return next
    })
  }, [])

  const setBudget = useCallback((amount: number) => {
    const val = Math.max(0, amount)
    setBudgetRaw(val)
    saveBudget(val)
  }, [])

  const cm = currentMonthKey()

  const currentMonthEntries = useMemo(
    () => entries.filter(e => monthKey(e.date) === cm),
    [entries, cm],
  )

  const currentMonthTotal = useMemo(
    () => currentMonthEntries.reduce((s, e) => s + e.amount, 0),
    [currentMonthEntries],
  )

  const allTimeTotal = useMemo(
    () => entries.reduce((s, e) => s + e.amount, 0),
    [entries],
  )

  const platformBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of currentMonthEntries) {
      map.set(e.platform, (map.get(e.platform) || 0) + e.amount)
    }
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total, color: platformColor(name) }))
      .sort((a, b) => b.total - a.total)
  }, [currentMonthEntries])

  const monthlyHistory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) {
      const mk = monthKey(e.date)
      map.set(mk, (map.get(mk) || 0) + e.amount)
    }
    // Return last 6 months
    const result: { month: string; total: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.toISOString().slice(0, 7)
      result.push({ month: m, total: map.get(m) || 0 })
    }
    return result
  }, [entries])

  const avgMonthly = useMemo(() => {
    const months = new Set(entries.map(e => monthKey(e.date)))
    return months.size > 0 ? allTimeTotal / months.size : 0
  }, [entries, allTimeTotal])

  return {
    entries,
    budget,
    addEntry,
    removeEntry,
    editEntry,
    setBudget,
    currentMonthTotal,
    currentMonthEntries,
    allTimeTotal,
    platformBreakdown,
    monthlyHistory,
    avgMonthly,
  }
}
