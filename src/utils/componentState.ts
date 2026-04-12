/**
 * Component State Persistence
 *
 * Saves and loads interactive component state (checked items, quiz progress,
 * flashcard position, etc.) keyed by file ID. Uses localStorage for fast
 * synchronous access from the sandbox iframe communication layer.
 */

const PREFIX = 'sb-component-state:'

export function saveComponentState(fileId: string, state: Record<string, unknown>): void {
  try {
    localStorage.setItem(PREFIX + fileId, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadComponentState(fileId: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(PREFIX + fileId)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearComponentState(fileId: string): void {
  try {
    localStorage.removeItem(PREFIX + fileId)
  } catch {
    // silently fail
  }
}
