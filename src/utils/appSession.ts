export type AppNav = 'home' | 'all' | 'versions' | 'library'
export type AppPanelKey = 'notebook' | 'cabinet' | null
export type FocusedObject = null | 'notebook' | 'clipboard' | 'cabinet' | 'folio' | 'music'

export interface AppSessionState {
  nav: AppNav
  selectedClass: string | null
  activePanel: AppPanelKey
  clipboardOpen: boolean
  cabinetOpen: boolean
  musicOpen: boolean
  focusedObject: FocusedObject
  viewingId: string | null
  activeMixKey: string
  filters?: { tab?: AppNav; [key: string]: unknown }
  sortField?: string
  sortDir?: 'asc' | 'desc'
  folioSort?: string
}

const SESSION_KEY = 'studybloom-app-session-v1'

const VALID_FOCUSED = new Set<Exclude<FocusedObject, null>>([
  'notebook', 'clipboard', 'cabinet', 'folio',
])

function parseFocusedObject(value: unknown): FocusedObject {
  if (typeof value === 'string' && VALID_FOCUSED.has(value as Exclude<FocusedObject, null>)) {
    return value as Exclude<FocusedObject, null>
  }
  return null
}

export function loadAppSession(): AppSessionState {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return defaultSession()
    const parsed = JSON.parse(raw) as Partial<AppSessionState>
    return {
      nav: (parsed.nav as AppNav) ?? 'home',
      selectedClass: parsed.selectedClass ?? null,
      activePanel: (parsed.activePanel as AppPanelKey) ?? null,
      clipboardOpen: Boolean(parsed.clipboardOpen),
      cabinetOpen: Boolean(parsed.cabinetOpen),
      musicOpen: parsed.musicOpen !== false,
      focusedObject: parseFocusedObject(parsed.focusedObject),
      viewingId: parsed.viewingId ?? null,
      activeMixKey: parsed.activeMixKey ?? 'library',
      filters: parsed.filters,
      sortField: parsed.sortField,
      sortDir: parsed.sortDir,
      folioSort: parsed.folioSort,
    }
  } catch {
    return defaultSession()
  }
}

export function saveAppSession(state: AppSessionState): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state))
  } catch {}
}

function defaultSession(): AppSessionState {
  return {
    nav: 'home',
    selectedClass: null,
    activePanel: null,
    clipboardOpen: false,
    cabinetOpen: false,
    musicOpen: true,
    focusedObject: null,
    viewingId: null,
    activeMixKey: 'library',
  }
}
