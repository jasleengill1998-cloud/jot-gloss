import { useState, useCallback } from 'react'

export interface StickyNoteData {
  id: string
  text: string
  colorIndex: number
  x: number
  y: number
  pinned: boolean
}

const STORAGE_KEY = 'jg-sticky-notes'

function load(): StickyNoteData[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(notes: StickyNoteData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function useStickyNotes() {
  const [notes, setNotes] = useState<StickyNoteData[]>(load)

  const addNote = useCallback(() => {
    setNotes(current => {
      const next: StickyNoteData = {
        id: `sn-${Date.now()}`,
        text: '',
        colorIndex: current.length % 4,
        x: 120 + (current.length % 5) * 40,
        y: 120 + (current.length % 4) * 40,
        pinned: false,
      }
      const updated = [...current, next]
      save(updated)
      return updated
    })
  }, [])

  const updateNote = useCallback((id: string, data: Partial<StickyNoteData>) => {
    setNotes(current => {
      const updated = current.map(n => n.id === id ? { ...n, ...data } : n)
      save(updated)
      return updated
    })
  }, [])

  const removeNote = useCallback((id: string) => {
    setNotes(current => {
      const updated = current.filter(n => n.id !== id)
      save(updated)
      return updated
    })
  }, [])

  return { notes, addNote, updateNote, removeNote }
}
