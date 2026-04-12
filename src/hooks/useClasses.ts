import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_CLASSES } from '../types'

const STORAGE_KEY = 'studybloom-classes'

export function useClasses() {
  const [classes, setClasses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_CLASSES
    } catch {
      return DEFAULT_CLASSES
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
  }, [classes])

  const addClass = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed && !classes.includes(trimmed)) {
      setClasses(prev => [...prev, trimmed])
    }
  }, [classes])

  const removeClass = useCallback((name: string) => {
    setClasses(prev => prev.filter(c => c !== name))
  }, [])

  const replaceClasses = useCallback((newClasses: string[]) => {
    setClasses(newClasses)
  }, [])

  return { classes, addClass, removeClass, replaceClasses }
}