/**
 * AI INK ACCOUNT — Track usage & spending across AI platforms.
 *
 * Persists all entries to localStorage under `jot-gloss-ai-spending-v1`.
 * Each entry records: platform, amount, date, and optional note.
 * Supports monthly budget tracking and per-platform breakdowns.
 */
import { useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'jot-gloss-ai-spending-v1'
const BUDGET_KEY = 'jot-gloss-ai-budget-v1'

export interface SpendingEntry {
  id: string
  platform: string
  amount: number
  date: string      // YYYY-MM-DD
  note: string
  createdAt: number
}

export interface MonthlyBudget {
  amount: number
}

export const AI_PLATFORMS = [
  'Claude',
  'ChatGPT',
  'Gemini',
  'Copilot',
  'Midjourney',
  'Perplexity',
  'Grok',
  'Cursor',
  'Other',
] as const

export type AiPlatform = (typeof AI_PLATFORMS)[number]

export const PLATFORM_ICONS: Record<string, string> = {
  Claude: '◈',
  ChatGPT: '◉',
  Gemini: '◇',
  Copilot: '⬡',
  Midjourney: '✦',
  Perplexity: '◎',
  Grok: '✧',
  Cursor: '▣',
  Other: '○',
}

function loadEntries(): SpendingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries: SpendingEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function loadBudget(): MonthlyBudget {
  try {
    const raw = localStorage.getItem(BUDGET_KEY)
    return raw ? JSON.parse(raw) : { amount: 0 }
  } catch {
    return { amount: 0 }
  }
}

function saveBudget(budget: MonthlyBudget) {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget))
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthStr(date: string): string {
  return date.slice(0, 7)
}

export function fmtCurrency(amount: number): string {
  return '$' + amount.toFixed(2)
}

export function fmtMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

export function useAiSpending() {
  const [entries, setEntries] = useState<SpendingEntry[]>(loadEntries)
  const [budget, setBudgetState] = useState<MonthlyBudget>(loadBudget)

  const addEntry = useCallback((platform: string, amount: number, date: string, note: string) => {
    const entry: SpendingEntry = {
      id: makeId(),
      platform,
      amount,
      date,
      note,
      createdAt: Date.now(),
    }
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

  const setBudget = useCallback((amount: number) => {
    const next = { amount }
    setBudgetState(next)
    saveBudget(next)
  }, [])

  const currentMonth = todayStr().slice(0, 7)

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) {
      const m = monthStr(e.date)
      map.set(m, (map.get(m) || 0) + e.amount)
    }
    return map
  }, [entries])

  const currentMonthTotal = monthlyTotals.get(currentMonth) || 0

  const platformTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) {
      if (monthStr(e.date) === currentMonth) {
        map.set(e.platform, (map.get(e.platform) || 0) + e.amount)
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [entries, currentMonth])

  return {
    entries,
    budget,
    addEntry,
    removeEntry,
    setBudget,
    currentMonth,
    currentMonthTotal,
    monthlyTotals,
    platformTotals,
  }
}
