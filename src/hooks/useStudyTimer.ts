/**
 * useStudyTimer — App-level hook that owns all timer state.
 *
 * Lives in App.tsx so it NEVER unmounts — timer keeps ticking
 * even when panels close, files go fullscreen, or navigation changes.
 *
 * Persists session logs to localStorage.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

export interface SessionLog {
  course: string
  seconds: number
  date: string // YYYY-MM-DD
  startedAt?: string // ISO timestamp
}

const STORAGE_KEY = 'studybloom-timer-log'
const SESSION_STORAGE_KEY = 'studybloom-timer-session'

interface PersistedTimerSession {
  course: string
  elapsed: number
  running: boolean
  startedAt: string
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadLog(): SessionLog[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveLog(log: SessionLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
}

function loadSession(defaultCourse: string): PersistedTimerSession {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) {
      return { course: defaultCourse, elapsed: 0, running: false, startedAt: '' }
    }

    const parsed = JSON.parse(raw) as Partial<PersistedTimerSession>
    const startedAt = typeof parsed.startedAt === 'string' ? parsed.startedAt : ''
    const running = Boolean(parsed.running)
    const baseElapsed = typeof parsed.elapsed === 'number' && Number.isFinite(parsed.elapsed) ? Math.max(0, Math.floor(parsed.elapsed)) : 0
    const elapsed = running && startedAt
      ? Math.max(baseElapsed, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
      : baseElapsed

    return {
      course: typeof parsed.course === 'string' && parsed.course ? parsed.course : defaultCourse,
      elapsed,
      running,
      startedAt,
    }
  } catch {
    return { course: defaultCourse, elapsed: 0, running: false, startedAt: '' }
  }
}

function saveSession(session: PersistedTimerSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function fmtTime(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

export function fmtTimeShort(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export interface StudyTimerState {
  course: string
  setCourse: (c: string) => void
  elapsed: number
  running: boolean
  start: () => void
  pause: () => void
  logAndReset: () => void
  discard: () => void
}

export function useStudyTimer(defaultCourse: string): StudyTimerState {
  const initialSessionRef = useRef<PersistedTimerSession | null>(null)
  if (!initialSessionRef.current) {
    initialSessionRef.current = loadSession(defaultCourse)
  }

  const [course, setCourse] = useState(initialSessionRef.current.course)
  const [elapsed, setElapsed] = useState(initialSessionRef.current.elapsed)
  const [running, setRunning] = useState(initialSessionRef.current.running)
  const intervalRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const sessionStartRef = useRef<string>(initialSessionRef.current.startedAt)

  // Tick — runs as long as `running` is true
  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed * 1000
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date().toISOString()
      }
      intervalRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [elapsed, running])

  useEffect(() => {
    if (!running && elapsed === 0 && !sessionStartRef.current) {
      clearSession()
      return
    }

    saveSession({
      course,
      elapsed,
      running,
      startedAt: sessionStartRef.current,
    })
  }, [course, elapsed, running])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])

  const logAndReset = useCallback(() => {
    setRunning(false)
    if (elapsed > 0) {
      const log = loadLog()
      const today = getToday()
      const existing = log.find(e => e.course === course && e.date === today)
      if (existing) {
        existing.seconds += elapsed
      } else {
        log.push({
          course,
          seconds: elapsed,
          date: today,
          startedAt: sessionStartRef.current || new Date().toISOString(),
        })
      }
      saveLog(log)
    }
    setElapsed(0)
    sessionStartRef.current = ''
    clearSession()
  }, [course, elapsed])

  const discard = useCallback(() => {
    setRunning(false)
    setElapsed(0)
    sessionStartRef.current = ''
    clearSession()
  }, [])

  return { course, setCourse, elapsed, running, start, pause, logAndReset, discard }
}
