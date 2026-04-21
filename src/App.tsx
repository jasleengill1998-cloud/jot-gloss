import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import type { DuplicateAction, Filters, SortDir, SortField, StudyFile, StudySource } from './types'
import { useClasses } from './hooks/useClasses'
import { useFiles } from './hooks/useFiles'
import { useStudyTimer } from './hooks/useStudyTimer'
import { useGramophone } from './hooks/useGramophone'
import type { MoodKey } from './hooks/useGramophone'
import BookplateLogo from './components/BookplateLogo'
import { ArchCard } from './components/ArchCard'
import ClassFolder from './components/ClassFolder'
import ClipboardWatcher from './components/ClipboardWatcher'
import DeskTodoPanel from './components/DeskTodoPanel'
import DuplicateModal from './components/DuplicateModal'
import DeskNotebook, { type DeskTask, type NotebookPage } from './components/DeskNotebook'
import { DiamondDivider } from './components/DiamondDivider'
import EditModal from './components/EditModal'
import FileCard from './components/FileCard'
import FileUploader from './components/FileUploader'
import FileViewer from './components/FileViewer'
import FloatingTimer from './components/FloatingTimer'
import PromptBank from './components/PromptBank'
import QuickAdd from './components/QuickAdd'
import StickyNote from './components/StickyNote'
import StudyFolio from './components/StudyFolio'
import type { Accent } from './components/StudyFolio'
import StudyStats from './components/StudyStats'
import StudyTimer from './components/StudyTimer'
import SyncPanel from './components/SyncPanel'
import { ArchDivider, FloralBorder, MughalCorner } from './components/Ornaments'
import UtilityBookplate from './components/UtilityBookplate'
import { loadAppSession, saveAppSession, type AppNav, type FocusedObject } from './utils/appSession'
import { getVersionGroup, getVersionSummary } from './utils/studyFiles'
import { useStickyNotes } from './hooks/useStickyNotes'

type Nav = 'library' | 'archive'
type PanelKey = 'upload' | 'paste' | 'notebook' | 'prompts' | 'sync' | 'timer' | 'stats' | null
type FolioSort = 'course' | 'entries' | 'recent'
type PendingDraftSave = { name: string; content: string; className: string; resourceType: string; source: StudySource }
type StudyMix = { key: string; label: string; startIndex: number }
type RailTone = ComponentProps<typeof UtilityBookplate>['tone']
type RailFocusTarget = Exclude<FocusedObject, 'folio' | null>

function humanTitle(name: string) {
  let base = name.replace(/\.[^.]+$/, '')
  base = base.replace(/^m[-_]b[-_]a[-_]s[-_]?(\d{3})/i, 'mbas$1')
  base = base.replace(/^mbas[-_]?\d{3}[-_]/i, '')
  base = base.replace(/([a-z])([A-Z])/g, '$1 $2')
  base = base.replace(/([A-Za-z])(\d)/g, '$1 $2')
  base = base.replace(/(\d)([A-Za-z])/g, '$1 $2')
  base = base.replace(/[-_]+/g, ' ')
  return base.replace(/\b\w/g, (char) => char.toUpperCase()).trim()
}

function shortCourseName(course: string) {
  return course.split(/\s*[\u2014\u2013-]\s*/)[0] || course
}

function makeFilters(tab: Nav): Filters {
  return { search: '', className: '', resourceType: '', fileType: '', tab }
}

function formatActivityDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const COURSE_ACCENT: Record<string, Accent> = {
  'MBAS 832': 'sage',
  'MBAS 811': 'powder',
  'MBAS 801': 'butter',
  General: 'blush',
}

const PINNED_NOTE_STORAGE_KEY = 'jot-gloss-pinned-note'
const DESK_META_PREFIX = '__jot-gloss-'
const DESK_NOTE_FILE = `${DESK_META_PREFIX}notes.md`
const DESK_TASKS_FILE = `${DESK_META_PREFIX}tasks.md`
const DESK_NOTEBOOK_PAGES_FILE = `${DESK_META_PREFIX}notebook-pages.json`
const STUDY_MIXES: StudyMix[] = [
  { key: 'library',   label: 'Sunlight through the stacks', startIndex: 0 },
  { key: 'night',     label: 'After hours',                 startIndex: 10 },
  { key: 'rain',      label: 'The window seat',             startIndex: 20 },
  { key: 'static',    label: 'The B-side',                  startIndex: 30 },
  { key: 'courtyard', label: 'The courtyard',               startIndex: 40 },
  { key: 'dust',      label: 'Dust and strings',            startIndex: 50 },
]

function isCabinetPanel(panel: Exclude<PanelKey, null>) {
  return panel !== 'notebook'
}

function DeskCalculator() {
  const [display, setDisplay] = React.useState('0')
  const [prev, setPrev] = React.useState<number | null>(null)
  const [op, setOp] = React.useState<string | null>(null)
  const [fresh, setFresh] = React.useState(true)

  const press = (val: string) => {
    if (val === 'C') { setDisplay('0'); setPrev(null); setOp(null); setFresh(true); return }
    if (['+', '−', '×', '÷'].includes(val)) {
      setPrev(parseFloat(display)); setOp(val); setFresh(true); return
    }
    if (val === '=') {
      if (prev === null || !op) return
      const cur = parseFloat(display)
      const result = op === '+' ? prev + cur : op === '−' ? prev - cur : op === '×' ? prev * cur : cur !== 0 ? prev / cur : 0
      setDisplay(String(parseFloat(result.toFixed(10))))
      setPrev(null); setOp(null); setFresh(true); return
    }
    if (val === '.' && display.includes('.') && !fresh) return
    setDisplay(fresh ? (val === '.' ? '0.' : val) : display === '0' && val !== '.' ? val : display + val)
    setFresh(false)
  }

  const btn = (label: string, type: 'num' | 'op' | 'eq' | 'clear', keySuffix = label || 'blank') => (
    <button
      key={label === '' ? `${type}-${keySuffix}-${Math.random().toString(36).slice(2, 7)}` : `${type}-${keySuffix}`}
      type="button"
      onClick={() => press(label)}
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 13,
        padding: '6px 0',
        background: type === 'eq' ? 'rgba(201,124,138,0.15)' : type === 'op' ? 'rgba(199,183,157,0.2)' : type === 'clear' ? 'rgba(201,124,138,0.08)' : 'rgba(255,248,242,0.8)',
        border: '1px solid rgba(199,183,157,0.3)',
        color: type === 'op' ? '#5A3E4B' : type === 'eq' ? '#C97C8A' : '#3A2830',
        cursor: 'pointer',
        borderRadius: 2,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18,
        textAlign: 'right',
        padding: '6px 10px',
        background: 'rgba(255,248,242,0.9)',
        border: '1px solid rgba(199,183,157,0.3)',
        color: '#3A2830',
        letterSpacing: '0.04em',
        minHeight: 36,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {btn('C','clear')}{btn('','op')}{btn('','op')}{btn('÷','op')}
        {btn('7','num')}{btn('8','num')}{btn('9','num')}{btn('×','op')}
        {btn('4','num')}{btn('5','num')}{btn('6','num')}{btn('−','op')}
        {btn('1','num')}{btn('2','num')}{btn('3','num')}{btn('+','op')}
        {btn('0','num')}{btn('.','num')}{btn('=','eq')}
      </div>
    </div>
  )
}

const DAILY_QUOTES = [
  'Small, steady study sessions are how understanding starts to feel inevitable.',
  'One clear page of notes is better than ten anxious tabs left half-open.',
  'Let today\'s desk stay focused enough that tomorrow\'s self can return without friction.',
  'You do not need a perfect system today; you need one good page that future-you can trust.',
  'Momentum in a study practice often looks quiet long before it looks impressive.',
  'Finish one thought well, and the next one usually arrives with less resistance.',
  'A calm study practice is built by gentle repetition, not by one giant burst of organization.',
  'If the next note has a home, studying starts to feel lighter almost immediately.',
]

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function isDeskMetaFile(file: StudyFile) {
  return file.name.startsWith(DESK_META_PREFIX)
}

function parseTaskChecklist(content: string): DeskTask[] {
  return content
    .split(/\r?\n/)
    .map((line, index) => {
      const match = line.match(/^- \[( |x)\] (.+)$/i)
      if (!match) return null
      return {
        id: `task-${index}-${match[2].slice(0, 12).replace(/\s+/g, '-')}`,
        text: match[2].trim(),
        done: match[1].toLowerCase() === 'x',
      }
    })
    .filter((task): task is DeskTask => Boolean(task))
}

function serializeTaskChecklist(tasks: DeskTask[]) {
  return tasks
    .filter((task) => task.text.trim())
    .map((task) => `- [${task.done ? 'x' : ' '}] ${task.text.trim()}`)
    .join('\n')
}

function formatLongDate(value: Date) {
  return value.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatWeekdayDate(value: Date) {
  return value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function coerceWeekdayDateLabel(value: string | undefined, fallback: Date) {
  if (!value) return formatWeekdayDate(fallback)
  const normalized = value.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1').trim()
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return formatWeekdayDate(fallback)
  return formatWeekdayDate(parsed)
}

function formatClockTime(value: Date) {
  return value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function formatClockSeconds(value: Date) {
  return value.toLocaleTimeString(undefined, { second: '2-digit' })
}

function getFolioAccent(className: string): Accent {
  for (const [key, value] of Object.entries(COURSE_ACCENT)) {
    if (className.includes(key)) return value
  }
  return 'butter'
}

interface RailProps {
  continueFile: StudyFile | null
  recentActivity: StudyFile[]
  pinnedNote: { text: string; updatedAt: number } | null
  dailyCard: { kicker: string; title: string; body: string; href?: string; source?: string }
  viewing: StudyFile | null
  activePanel: PanelKey
  isArchiveView: boolean
  clipboardOpen: boolean
  cabinetOpen: boolean
  musicOpen: boolean
  focusedObject: FocusedObject
  onTogglePanel: (panel: Exclude<PanelKey, null>) => void
  onOpenFile: (file: StudyFile) => void
  onOpenArchive: () => void
  onFocusObject: (object: Exclude<FocusedObject, null>) => void
  onClearFocus: () => void
  onClipboardToggle: (open: boolean) => void
  onCabinetToggle: (open: boolean) => void
  onMusicToggle: (open: boolean) => void
  syncLabel: string
  studyMixes: StudyMix[]
  activeMixKey: string
  musicPlaying: boolean
  musicActionLabel: string
  onToggleMusic: () => void
  onSelectMix: (mix: StudyMix) => void
  onAddStickyNote: () => void
}

interface FocusableRailSectionProps {
  tone: RailTone
  kicker: string
  title: string
  objectKey: RailFocusTarget | 'music'
  focusedObject: FocusedObject
  onSpineClick: () => void
  onClearFocus?: () => void
  closeLabel?: string
  wrapperClassName?: string
  children: ReactNode
}

function FocusableRailSection({
  tone,
  kicker,
  title,
  objectKey,
  focusedObject,
  onSpineClick,
  onClearFocus,
  closeLabel,
  wrapperClassName,
  children,
}: FocusableRailSectionProps) {
  const isCollapsed = focusedObject !== null && focusedObject !== objectKey
  const isFocused = focusedObject === objectKey

  if (isCollapsed) {
    return (
      <button type="button" className={`rail-focus-shell ${wrapperClassName ?? ''} is-collapsed rail-focus-tone-${tone}`.trim()} onClick={onSpineClick}>
        <span className="rail-focus-spine-kicker">{kicker}</span>
        <span className="rail-focus-spine-rule" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className={`rail-focus-shell ${wrapperClassName ?? ''} ${isFocused ? 'is-focused' : ''}`.trim()}>
      <UtilityBookplate tone={tone} kicker={kicker} title={title} className={`rail-focus-card ${isFocused ? 'rail-focus-card-active' : ''}`}>
        {isFocused && closeLabel && onClearFocus && (
          <div className="rail-focus-dismiss">
            <button type="button" className="desk-tool-link rail-focus-dismiss-link" onClick={onClearFocus}>
              {closeLabel}
            </button>
          </div>
        )}
        {children}
      </UtilityBookplate>
    </div>
  )
}


function JotGlossStudyRail({
  continueFile,
  recentActivity,
  pinnedNote,
  dailyCard,
  viewing,
  activePanel,
  isArchiveView,
  clipboardOpen,
  cabinetOpen,
  musicOpen,
  focusedObject,
  onTogglePanel,
  onOpenFile,
  onOpenArchive,
  onFocusObject,
  onClearFocus,
  onClipboardToggle,
  onCabinetToggle,
  onMusicToggle,
  syncLabel,
  studyMixes,
  activeMixKey,
  musicPlaying,
  musicActionLabel,
  onToggleMusic,
  onSelectMix,
  onAddStickyNote,
}: RailProps) {
  const filingCabinetActive = cabinetOpen || isArchiveView || activePanel === 'upload' || activePanel === 'paste' || activePanel === 'prompts' || activePanel === 'sync' || activePanel === 'timer' || activePanel === 'stats'
  const activeMix = studyMixes.find((mix) => mix.key === activeMixKey) ?? studyMixes[0]
  const [railNow, setRailNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setRailNow(new Date()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="desk-rail-stack">
      <div style={{
        textAlign: 'center',
        padding: '10px 12px 9px',
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        lineHeight: 1.3,
        background: 'rgba(255,248,242,0.6)',
        border: '1px solid rgba(184,149,106,0.14)',
      }}>
        <div style={{ fontSize: 15, color: '#5A3E4B', fontWeight: 700, letterSpacing: '0.04em' }}>
          {railNow.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ fontSize: 13, fontWeight: 400, color: 'rgba(90,62,75,0.6)', letterSpacing: '0.02em', marginTop: 2, fontStyle: 'italic' }}>
          {formatClockTime(railNow)}
        </div>
      </div>

      <div
        className="desk-rail-hukamnama"
        style={{
          background: 'rgba(255, 244, 240, 0.9)',
          border: '1px solid rgba(201,124,138,0.22)',
          boxShadow: '0 10px 18px rgba(90, 62, 75, 0.035)',
          padding: '12px 13px 12px',
          position: 'relative',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 5,
            border: '1px solid rgba(201,124,138,0.16)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#C97C8A',
              marginBottom: 8,
            }}
          >
            {dailyCard.kicker}
          </div>

          {dailyCard.title && (
            <div
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.08,
                color: '#5A3E4B',
                marginBottom: 8,
              }}
            >
              {dailyCard.title}
            </div>
          )}

          <p className="rail-copy" style={{ marginBottom: dailyCard.source ? 8 : 12 }}>
            {dailyCard.body}
          </p>

          {dailyCard.source && (
            <p
              className="rail-copy"
              style={{
                marginBottom: dailyCard.href ? 10 : 0,
                fontStyle: 'italic',
                fontSize: 12,
                opacity: 0.76,
              }}
            >
              {dailyCard.source}
            </p>
          )}

          {dailyCard.href && (
            <a
              href={dailyCard.href}
              target="_blank"
              rel="noreferrer"
              className="desk-tool-link"
              style={{ display: 'inline-block', marginTop: 2 }}
            >
              Read the full passage
            </a>
          )}
        </div>
      </div>

      <div
        className="desk-rail-clipboard"
        style={{
          padding: '12px 13px 10px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8,
          }}>
            Recent
          </div>

          {continueFile ? (
            <>
              <div style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.04,
                color: '#5A3E4B',
                marginBottom: 4,
              }}>
                {humanTitle(continueFile.name)}
              </div>

              <p className="rail-copy" style={{ marginBottom: 10, fontStyle: 'italic' }}>
                {shortCourseName(continueFile.className)} · {continueFile.resourceType}
              </p>
            </>
          ) : (
            <p className="rail-copy" style={{ marginBottom: 10, fontStyle: 'italic', opacity: 0.72 }}>
              Open a folio and it will wait here for you.
            </p>
          )}

          {continueFile && (
            <button type="button" className="bookplate-action" onClick={() => onOpenFile(continueFile)}
              style={{ marginBottom: 10, width: '100%' }}>
              Resume
            </button>
          )}

          <div className="archive-activity-list">
            {recentActivity.length === 0 ? (
              <p className="rail-copy" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                Open a folio and it will wait here for you.
              </p>
            ) : (
              recentActivity.map((file: StudyFile) => (
                <button key={file.id} type="button" className="archive-activity-item"
                  onClick={() => onOpenFile(file)}>
                  <span className="archive-activity-title">{humanTitle(file.name)}</span>
                  <span className="archive-activity-meta">
                    {shortCourseName(file.className)} · {formatActivityDate(file.updatedAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <DiamondDivider />

      <FocusableRailSection
        tone="sage"
        kicker="Stationery Drawer"
        title="Pen & Paper"
        objectKey="notebook"
        focusedObject={focusedObject}
        onSpineClick={() => onFocusObject('notebook')}
        onClearFocus={onClearFocus}
        closeLabel="Close"
      >
        <div className="rail-button-stack">
          <button type="button"
            className={`bookplate-action ${activePanel === 'notebook' ? 'active' : ''}`}
            onClick={() => { onFocusObject('notebook'); onTogglePanel('notebook') }}>
            Notebook
          </button>

          {viewing && (
            <button
              type="button"
              className={`bookplate-action ${activePanel === 'notebook' ? 'active' : ''}`}
              onClick={() => onTogglePanel('notebook')}>
              Notebook + Folio
            </button>
          )}

          <button type="button"
            className="bookplate-action"
            onClick={onAddStickyNote}
            title="Place a sticky note"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1 H10 L13 4 V13 H1 Z" stroke="#5A3E4B" strokeWidth="0.9" fill="rgba(245,230,184,0.5)"/>
              <path d="M10 1 V4 H13" stroke="#5A3E4B" strokeWidth="0.8" fill="none"/>
              <line x1="3" y1="7" x2="11" y2="7" stroke="#C7B79D" strokeWidth="0.6"/>
              <line x1="3" y1="9.5" x2="9" y2="9.5" stroke="#C7B79D" strokeWidth="0.6"/>
            </svg>
            Sticky Note
          </button>

          <button type="button"
            className={`bookplate-action ${activePanel === 'timer' ? 'active' : ''}`}
            onClick={() => onTogglePanel('timer')}>
            Desk Clock
          </button>
        </div>

        {pinnedNote && (
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: '1px solid rgba(199,183,157,0.3)',
            fontFamily: "'EB Garamond',Georgia,serif",
            fontSize: 12, color: 'rgba(90,62,75,0.7)',
            fontStyle: 'italic',
          }}>
            {pinnedNote.text}
          </div>
        )}
      </FocusableRailSection>

      <DiamondDivider />

      <FocusableRailSection
        tone="parchment"
        kicker=""
        title=""
        objectKey="music"
        focusedObject={focusedObject}
        onSpineClick={() => onFocusObject('music')}
        wrapperClassName={musicPlaying ? 'gramophone-playing' : 'gramophone-resting'}
      >
        <div className="gramophone-panel">
          <div className="gramophone-head">
            <div className="gramophone-kicker">Study Music</div>
            <div className="gramophone-title">{musicPlaying ? activeMix.label : 'Music paused'}</div>
          </div>

          <div className="gramophone-stage" aria-hidden="true">
            <div className={`gramophone-wave gramophone-wave-a ${musicPlaying ? 'is-playing' : ''}`} />
            <div className={`gramophone-wave gramophone-wave-b ${musicPlaying ? 'is-playing' : ''}`} />
            <svg className="gramophone-illustration" viewBox="0 0 200 200" fill="none" role="presentation">
              <defs>
                <linearGradient id="cabinet-face" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4B896" />
                  <stop offset="50%" stopColor="#C8A878" />
                  <stop offset="100%" stopColor="#B89B72" />
                </linearGradient>
                <linearGradient id="cabinet-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8D5B8" />
                  <stop offset="100%" stopColor="#D4C4A8" />
                </linearGradient>
                <linearGradient id="horn-fill" x1="0.2" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stopColor="#E8D5B0" />
                  <stop offset="40%" stopColor="#D4BC8E" />
                  <stop offset="100%" stopColor="#C8A96E" />
                </linearGradient>
                <linearGradient id="horn-inner" x1="0.3" y1="0" x2="0.7" y2="1">
                  <stop offset="0%" stopColor="#C8A878" />
                  <stop offset="100%" stopColor="#B89860" />
                </linearGradient>
                <radialGradient id="platter-felt" cx="0.5" cy="0.45" r="0.5">
                  <stop offset="0%" stopColor="#5A4A42" />
                  <stop offset="100%" stopColor="#4A3A32" />
                </radialGradient>
                <radialGradient id="vinyl-sheen" cx="0.42" cy="0.38" r="0.6">
                  <stop offset="0%" stopColor="rgba(90,70,75,0.18)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Soft shadow */}
              <ellipse cx="100" cy="188" rx="52" ry="6" fill="rgba(90,62,75,0.08)" />

              {/* Cabinet body — front face */}
              <path d="M52 148 L52 176 Q52 180 56 180 L144 180 Q148 180 148 176 L148 148 Z" fill="url(#cabinet-face)" stroke="#B89B72" strokeWidth="1.2" />
              {/* Cabinet inset panel */}
              <rect x="60" y="152" width="80" height="24" rx="2" fill="none" stroke="#C8A96E" strokeWidth="0.7" opacity="0.5" />
              {/* Rose scroll decoration */}
              <path d="M85 164 C88 160 92 158 96 160 C98 162 100 162 102 160 C106 158 110 160 113 164" fill="none" stroke="#E8B8C0" strokeWidth="0.8" opacity="0.5" />
              {/* Brass knobs */}
              <circle cx="72" cy="164" r="3" fill="#C8A96E" stroke="#B89B72" strokeWidth="0.5" />
              <circle cx="72" cy="164" r="1.5" fill="#DBC48E" />
              <circle cx="86" cy="164" r="2.5" fill="#C8A96E" stroke="#B89B72" strokeWidth="0.5" />
              <circle cx="86" cy="164" r="1.2" fill="#DBC48E" />
              {/* Winding crank */}
              <path d="M148 162 L156 162 L156 158 L162 164 L156 170 L156 166 L148 166" fill="#C8A96E" stroke="#B89B72" strokeWidth="0.8" />

              {/* Cabinet top surface */}
              <path d="M48 148 L52 140 L148 140 L152 148 Z" fill="url(#cabinet-top)" stroke="#C8A96E" strokeWidth="0.8" />

              {/* Cabinet feet */}
              <rect x="54" y="180" width="10" height="5" rx="1.5" fill="#B89B72" stroke="#9D8C7D" strokeWidth="0.5" />
              <rect x="136" y="180" width="10" height="5" rx="1.5" fill="#B89B72" stroke="#9D8C7D" strokeWidth="0.5" />

              {/* Wood grain lines */}
              <line x1="58" y1="155" x2="142" y2="155" stroke="#C8A878" strokeWidth="0.3" opacity="0.3" />
              <line x1="58" y1="159" x2="142" y2="159" stroke="#C8A878" strokeWidth="0.25" opacity="0.25" />
              <line x1="58" y1="170" x2="142" y2="170" stroke="#C8A878" strokeWidth="0.3" opacity="0.2" />

              {/* Turntable rim */}
              <ellipse cx="100" cy="128" rx="42" ry="15" fill="#D4C4A8" stroke="#C8A96E" strokeWidth="1.2" />
              <ellipse cx="100" cy="126" rx="39" ry="13.5" fill="#E0D0B4" stroke="#C8A96E" strokeWidth="0.6" opacity="0.7" />
              {/* Felt platter surface */}
              <ellipse cx="100" cy="125" rx="34" ry="12" fill="url(#platter-felt)" stroke="#4A3A32" strokeWidth="0.8" />

              {/* Spinning vinyl record */}
              <g className={`gramophone-record ${musicPlaying ? 'is-playing' : ''}`}>
                <ellipse cx="100" cy="124" rx="30" ry="10.5" fill="rgba(38,28,32,0.94)" stroke="rgba(200,169,110,0.35)" strokeWidth="0.8" />
                <ellipse cx="100" cy="124" rx="27" ry="9.4" fill="none" stroke="rgba(70,55,60,0.3)" strokeWidth="0.35" />
                <ellipse cx="100" cy="124" rx="24" ry="8.4" fill="none" stroke="rgba(70,55,60,0.25)" strokeWidth="0.3" />
                <ellipse cx="100" cy="124" rx="21" ry="7.3" fill="none" stroke="rgba(70,55,60,0.2)" strokeWidth="0.35" />
                <ellipse cx="100" cy="124" rx="18" ry="6.3" fill="none" stroke="rgba(70,55,60,0.18)" strokeWidth="0.3" />
                <ellipse cx="100" cy="124" rx="15" ry="5.2" fill="none" stroke="rgba(70,55,60,0.15)" strokeWidth="0.25" />
                <ellipse cx="100" cy="124" rx="12" ry="4.2" fill="none" stroke="rgba(70,55,60,0.12)" strokeWidth="0.3" />
                {/* Label */}
                <ellipse cx="100" cy="124" rx="8" ry="2.8" fill="rgba(201,164,108,0.88)" stroke="rgba(200,169,110,0.5)" strokeWidth="0.5" />
                <ellipse cx="100" cy="124" rx="5" ry="1.8" fill="rgba(240,228,200,0.9)" />
                <ellipse cx="100" cy="124" rx="1.5" ry="0.6" fill="rgba(90,62,75,0.5)" />
                {/* Sheen */}
                <ellipse cx="100" cy="124" rx="30" ry="10.5" fill="url(#vinyl-sheen)" />
                <ellipse cx="96" cy="121" rx="18" ry="5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
              </g>

              {/* Horn neck — curved brass tube */}
              <path d="M78 128 C74 118 66 100 56 82 C50 70 44 55 40 42" fill="none" stroke="#C8A96E" strokeWidth="4" strokeLinecap="round" />
              <path d="M78 128 C74 118 66 100 56 82 C50 70 44 55 40 42" fill="none" stroke="#DBC48E" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
              {/* Horn neck joint rings */}
              <ellipse cx="78" cy="128" rx="4" ry="2" fill="#C8A96E" stroke="#B89B72" strokeWidth="0.5" />
              <ellipse cx="56" cy="82" rx="3.5" ry="1.5" fill="#C8A96E" stroke="#B89B72" strokeWidth="0.4" opacity="0.8" />

              {/* Horn bell — scalloped flare */}
              <path d="M40 42 C32 28 18 14 8 10 C4 8 2 12 4 18 C8 28 14 36 22 44 C28 50 34 52 40 50 C46 52 52 50 58 44 C66 36 72 28 76 18 C78 12 76 8 72 10 C62 14 48 28 40 42 Z"
                fill="url(#horn-fill)" stroke="#C8A96E" strokeWidth="1.2" />
              {/* Horn inner opening */}
              <path d="M40 42 C36 34 28 24 20 18 C26 22 34 30 40 38 C46 30 54 22 60 18 C52 24 44 34 40 42 Z"
                fill="url(#horn-inner)" opacity="0.6" />
              {/* Horn scallop lines */}
              <path d="M20 18 C28 26 34 36 38 42" fill="none" stroke="#B89860" strokeWidth="0.5" opacity="0.4" />
              <path d="M30 14 C34 24 38 34 40 42" fill="none" stroke="#B89860" strokeWidth="0.5" opacity="0.35" />
              <path d="M50 14 C46 24 42 34 40 42" fill="none" stroke="#B89860" strokeWidth="0.5" opacity="0.35" />
              <path d="M60 18 C52 26 46 36 42 42" fill="none" stroke="#B89860" strokeWidth="0.5" opacity="0.4" />
              {/* Horn highlight */}
              <path d="M14 14 C22 12 30 16 36 24" fill="none" stroke="rgba(255,248,240,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              {/* Horn rim */}
              <path d="M8 10 C4 8 2 12 4 18 C8 28 14 36 22 44 C28 50 34 52 40 50 C46 52 52 50 58 44 C66 36 72 28 76 18 C78 12 76 8 72 10"
                fill="none" stroke="#B89860" strokeWidth="1.4" />

              {/* Tonearm pivot base */}
              <ellipse cx="134" cy="130" rx="5" ry="2.2" fill="#C8A96E" stroke="#B89B72" strokeWidth="0.6" />
              <circle cx="134" cy="129" r="2.8" fill="#DBC48E" stroke="#C8A96E" strokeWidth="0.5" />
              {/* Tonearm */}
              <path d="M134 129 L138 108 L122 96" fill="none" stroke="#9D8C7D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M134 129 L138 108 L122 96" fill="none" stroke="#B8A88C" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
              {/* Headshell */}
              <path d="M122 96 L115 92" fill="none" stroke="#9D8C7D" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="111" y="89" width="5.5" height="3.5" rx="0.8" fill="#9D8C7D" stroke="#7A6A5A" strokeWidth="0.4" transform="rotate(-22 114 91)" />
              {/* Counterweight */}
              <ellipse cx="138" cy="108" rx="3" ry="1.8" fill="#9D8C7D" stroke="#7A6A5A" strokeWidth="0.4" />
            </svg>
          </div>

          <div className="gramophone-now-playing">
            <div className="gramophone-now-label">{musicPlaying ? 'Playing' : 'Paused'}</div>
            <div className="gramophone-now-title">{activeMix.label}</div>
            <div className="gramophone-now-meta">
              {musicPlaying ? '' : 'Pick a track to start.'}
            </div>
          </div>

          <div className="gramophone-controls">
            <button type="button" className={`gramophone-toggle ${musicPlaying ? 'is-playing' : ''}`} onClick={onToggleMusic} aria-label={musicActionLabel}>
              {musicPlaying ? (
                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="3" height="12" rx="1" fill="currentColor" />
                  <rect x="7" y="1" width="3" height="12" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" aria-hidden="true">
                  <path d="M2 1 L10 7 L2 13 Z" fill="currentColor" />
                </svg>
              )}
              <span>{musicPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>

          <div className="gramophone-mix-grid">
            {studyMixes.map((mix) => (
              <button
                key={mix.key}
                type="button"
                onClick={() => onSelectMix(mix)}
                title={mix.label}
                className={`gramophone-mix-card ${activeMixKey === mix.key ? 'is-active' : ''}`}
              >
                <span className="gramophone-mix-index">{String(mix.startIndex / 10 + 1).padStart(2, '0')}</span>
                <span className="gramophone-mix-label">{mix.label}</span>
              </button>
            ))}
          </div>
        </div>
      </FocusableRailSection>

      <DiamondDivider />

      <FocusableRailSection
        tone="lavender"
        kicker=""
        title=""
        objectKey="cabinet"
        focusedObject={focusedObject}
        onSpineClick={() => { onFocusObject('cabinet'); onCabinetToggle(true) }}
        onClearFocus={() => { onCabinetToggle(false); onClearFocus() }}
        closeLabel="Leave the cabinet"
      >
        <details className="desk-cabinet-details rail-drawer"
          open={filingCabinetActive}
          onToggle={(event) => onCabinetToggle((event.currentTarget as HTMLDetailsElement).open)}>
          <summary className="desk-cabinet-summary">
            <svg width="64" height="20" viewBox="0 0 64 20" fill="none" aria-hidden="true" style={{ display: 'block', margin: '0 auto' }}>
              <rect x="0" y="9" width="64" height="1.5" rx="0.75" fill="rgba(169,151,141,0.25)"/>
              <rect x="16" y="3" width="32" height="13" rx="3"
                    fill="rgba(200,169,110,0.10)" stroke="rgba(200,169,110,0.45)" strokeWidth="1"/>
              <rect x="22" y="9" width="20" height="2.5" rx="1.2" fill="rgba(200,169,110,0.38)"/>
              <circle cx="22" cy="10.2" r="1.4" fill="rgba(169,151,141,0.35)"/>
              <circle cx="42" cy="10.2" r="1.4" fill="rgba(169,151,141,0.35)"/>
            </svg>
          </summary>
          <div className="desk-cabinet-content">
            <div className="rail-button-stack">
              <button type="button" className={`bookplate-action ${isArchiveView ? 'active' : ''}`} onClick={onOpenArchive}>
                Versions
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'upload' ? 'active' : ''}`} onClick={() => onTogglePanel('upload')}>
                Upload
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'paste' ? 'active' : ''}`} onClick={() => onTogglePanel('paste')}>
                Clipboard
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'prompts' ? 'active' : ''}`} onClick={() => onTogglePanel('prompts')}>
                Prompts
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'stats' ? 'active' : ''}`} onClick={() => onTogglePanel('stats')}>
                Ledger
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'sync' ? 'active' : ''}`} onClick={() => onTogglePanel('sync')}>
                {syncLabel}
              </button>
            </div>
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(199,183,157,0.3)', paddingTop: 14 }}>
              <DeskCalculator />
            </div>
          </div>
        </details>
      </FocusableRailSection>
    </div>
  )
}

export default function App() {
  const { files, loading, addFile, updateFile, removeFile, findDuplicates, replaceAllFiles, sync } = useFiles()
  const { classes, addClass, removeClass } = useClasses()
  const timer = useStudyTimer(classes[0] || 'General')
  const { notes: stickyNotes, addNote: addStickyNote, updateNote: updateStickyNote, removeNote: removeStickyNote } = useStickyNotes()
  const initialSession = useMemo(() => loadAppSession(), [])
  const initialNav: Nav = initialSession.nav === 'versions' ? 'archive' : 'library'
  const initialSelectedClass = initialSession.nav === 'all'
    ? ''
    : typeof initialSession.selectedClass === 'string' || initialSession.selectedClass === null
      ? initialSession.selectedClass
      : null
  const initialFilters: Filters = initialSession.filters
    ? { ...makeFilters(initialNav), ...(initialSession.filters as Partial<Filters>), tab: initialNav }
    : makeFilters(initialNav)
  const initialMix = STUDY_MIXES.find((mix) => mix.key === initialSession.activeMixKey) || STUDY_MIXES[0]
  const initialFocusedObject = initialSession.focusedObject ?? null
  const initialActivePanel: PanelKey = initialSession.activePanel === 'notebook' ? 'notebook' : null

  const [nav, setNav] = useState<Nav>(initialNav)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [sortField, setSortField] = useState<SortField>((initialSession.sortField as SortField) || 'name')
  const [sortDir, setSortDir] = useState<SortDir>(initialSession.sortDir || 'asc')
  const [folioSort, setFolioSort] = useState<FolioSort>((initialSession.folioSort as FolioSort) || 'course')
  const [viewing, setViewing] = useState<StudyFile | null>(null)
  const [editing, setEditing] = useState<StudyFile | null>(null)
  const [activePanel, setActivePanel] = useState<PanelKey>(initialActivePanel)
  const [clipboardOpen, setClipboardOpen] = useState(Boolean(initialSession.clipboardOpen))
  const [cabinetOpen, setCabinetOpen] = useState(Boolean(initialSession.cabinetOpen))
  const [musicOpen, setMusicOpen] = useState(initialSession.musicOpen !== false)
  const gramophone = useGramophone((initialMix.key as MoodKey) || 'library')
  const musicPlaying = gramophone.playing
  const [activeMix, setActiveMix] = useState<StudyMix>(initialMix)
  const [selectedClass, setSelectedClass] = useState<string | null>(initialSelectedClass)
  const [focusedObject, setFocusedObject] = useState<FocusedObject>(initialFocusedObject)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [pendingViewRestoreId, setPendingViewRestoreId] = useState<string | null>(initialSession.viewingId ?? null)
  const [dupFile, setDupFile] = useState<File | null>(null)
  const [dupClass, setDupClass] = useState('')
  const [dupResType, setDupResType] = useState('')
  const [dupExisting, setDupExisting] = useState<StudyFile[]>([])
  const [pendingDraftSave, setPendingDraftSave] = useState<PendingDraftSave | null>(null)

  const [pinnedNote, setPinnedNote] = useState<{ text: string; updatedAt: number } | null>(null)
  const [dailyCard, setDailyCard] = useState<{ kicker: string; title: string; body: string; href?: string; source?: string }>({
    kicker: "Today's Quote",
    title: '',
    body: '',
  })
  const activeMixRef = useRef<StudyMix>(STUDY_MIXES[0])

  useEffect(() => {
    activeMixRef.current = activeMix
  }, [activeMix])

  useEffect(() => {
    if (selectedClass && selectedClass !== '' && !classes.includes(selectedClass)) {
      setSelectedClass(null)
    }
  }, [classes, selectedClass])

  useEffect(() => {
    if (!mobileNavOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen])

  const visibleFiles = useMemo(() => files.filter((file) => !isDeskMetaFile(file)), [files])
  const noteFile = useMemo(() => files.find((file) => file.name === DESK_NOTE_FILE) || null, [files])
  const taskFile = useMemo(() => files.find((file) => file.name === DESK_TASKS_FILE) || null, [files])
  const pagesFile = useMemo(() => files.find((file) => file.name === DESK_NOTEBOOK_PAGES_FILE) || null, [files])
  const [notebookTasks, setNotebookTasks] = useState<DeskTask[]>([])
  const [notebookPages, setNotebookPages] = useState<NotebookPage[]>(() => {
    const now = Date.now()
    return [{ id: 'page-1', title: 'Page 1', content: '', createdAt: now, updatedAt: now }]
  })
  const [activePageId, setActivePageId] = useState('page-1')
  const [pagesMigrated, setPagesMigrated] = useState(false)

  useEffect(() => {
    if (pagesMigrated) return
    if (loading) return
    if (pagesFile?.content) {
      try {
        const parsed = JSON.parse(pagesFile.content) as NotebookPage[]
        if (parsed.length > 0) {
          setNotebookPages(parsed)
          setActivePageId(parsed[0].id)
        }
      } catch { /* ignore bad JSON */ }
    } else if (noteFile?.content) {
      const now = Date.now()
      const migrated: NotebookPage = { id: 'page-1', title: 'Page 1', content: noteFile.content, createdAt: now, updatedAt: now }
      setNotebookPages([migrated])
      setActivePageId('page-1')
    }
    setPagesMigrated(true)
  }, [loading, pagesFile?.content, noteFile?.content, pagesMigrated])

  useEffect(() => {
    setNotebookTasks(parseTaskChecklist(taskFile?.content || ''))
  }, [taskFile?.content])

  useEffect(() => {
    if (loading) return
    if (viewing) {
      setPendingViewRestoreId(null)
      return
    }
    if (!pendingViewRestoreId) return

    const restoredFile = visibleFiles.find((file) => file.id === pendingViewRestoreId) || null
    if (restoredFile) {
      setViewing(restoredFile)
    }
    setPendingViewRestoreId(null)
  }, [loading, pendingViewRestoreId, viewing, visibleFiles])

  const active = visibleFiles.filter((file) => !file.archived)
  const archived = visibleFiles.filter((file) => file.archived)
  const recent = [...active].sort((a, b) => b.updatedAt - a.updatedAt)
  const featured = recent[0] || null
  const versionSummaries = useMemo(() => new Map(visibleFiles.map((file) => [file.id, getVersionSummary(visibleFiles, file)])), [visibleFiles])

  const showArchive = nav === 'archive'
  const selectedCourse = selectedClass && selectedClass !== '' ? selectedClass : null
  const isAllEntriesView = selectedClass === ''
  const showFolders = nav === 'library' && selectedClass === null && !filters.search && !filters.className
  const notebookMode = activePanel === 'notebook' ? (viewing ? 'side-panel' : 'center-desk') : null
  const notebookOverlayActive = false // no longer hides content
  const focusModeActive = focusedObject !== null
  const deskFocusOnRail = focusedObject === 'clipboard' || focusedObject === 'cabinet'
  const deskFocusOnFolio = focusedObject === 'folio'
  const mobileDoorLabel = showArchive
    ? 'Versions'
    : selectedCourse
      ? shortCourseName(selectedCourse)
      : isAllEntriesView
        ? 'All Entries'
        : 'Course Folios'

  const filtered = visibleFiles
    .filter((file) => {
      if (showArchive && !file.archived) return false
      if (!showArchive && file.archived) return false
      if (selectedCourse && !showArchive && file.className !== selectedCourse) return false
      if (filters.className && file.className !== filters.className) return false
      if (filters.resourceType && file.resourceType !== filters.resourceType) return false
      if (filters.fileType && file.type !== filters.fileType) return false
      if (filters.search) {
        const query = filters.search.toLowerCase()
        return file.name.toLowerCase().includes(query)
          || file.className.toLowerCase().includes(query)
          || file.resourceType.toLowerCase().includes(query)
          || file.type.toLowerCase().includes(query)
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
          break
        case 'updatedAt':
          comparison = a.updatedAt - b.updatedAt
          break
        case 'createdAt':
          comparison = a.createdAt - b.createdAt
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'className':
          comparison = a.className.localeCompare(b.className, undefined, { sensitivity: 'base' })
          break
        case 'resourceType':
          comparison = a.resourceType.localeCompare(b.resourceType, undefined, { sensitivity: 'base' })
          break
      }
      if (comparison === 0 && sortField !== 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
      }
      return sortDir === 'asc' ? comparison : -comparison
    })

  const folders = useMemo(
    () => classes.map((course) => ({ name: course, files: active.filter((file) => file.className === course) })),
    [active, classes],
  )
  const sortedFolders = useMemo(() => {
    const items = [...folders]
    if (folioSort === 'entries') {
      return items.sort((a, b) => b.files.length - a.files.length || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    }
    if (folioSort === 'recent') {
      return items.sort((a, b) => {
        const aRecent = Math.max(0, ...a.files.map((file) => file.updatedAt))
        const bRecent = Math.max(0, ...b.files.map((file) => file.updatedAt))
        return bRecent - aRecent || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      })
    }
    return items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [folioSort, folders])
  const scopedRecent = selectedCourse ? recent.filter((file) => file.className === selectedCourse) : recent
  const continueFile = selectedCourse ? scopedRecent[0] || featured : featured
  const recentActivity = (selectedCourse ? scopedRecent : recent).slice(0, 4)

  const syncLabel = sync.syncStatus === 'syncing' ? 'Syncing...' : sync.syncStatus === 'synced' ? 'Synced' : 'Sync the desk'
  const courseFileCount = selectedCourse ? active.filter((file) => file.className === selectedCourse).length : 0
  const courseTypeCount = selectedCourse ? new Set(active.filter((file) => file.className === selectedCourse).map((file) => file.resourceType)).size : 0

  useEffect(() => {
    const sessionNav: AppNav = nav === 'archive'
      ? 'versions'
      : selectedClass === ''
        ? 'all'
        : selectedClass
          ? 'library'
          : 'home'

    saveAppSession({
      nav: sessionNav,
      selectedClass,
      activePanel: activePanel === 'notebook' ? 'notebook' : activePanel ? 'cabinet' : null,
      clipboardOpen,
      cabinetOpen,
      musicOpen,
      filters: { ...filters, tab: sessionNav },
      sortField,
      sortDir,
      folioSort,
      viewingId: viewing?.id ?? null,
      activeMixKey: activeMix.key,
      focusedObject,
    } as Parameters<typeof saveAppSession>[0])
  }, [activeMix.key, activePanel, cabinetOpen, clipboardOpen, filters, focusedObject, folioSort, musicOpen, nav, selectedClass, sortDir, sortField, viewing])

  const handleUpload = useCallback(async (file: File, className: string, resourceType: string) => {
    const duplicates = await findDuplicates(file.name)
    if (duplicates.length > 0) {
      setDupFile(file)
      setDupClass(className)
      setDupResType(resourceType)
      setDupExisting(duplicates)
      return
    }

    await addFile(file, className, resourceType, undefined, 'upload')
    setSelectedClass(className)
    setActivePanel(null)
    setFocusedObject(null)
  }, [addFile, findDuplicates])

  const handleDupAction = useCallback(async (action: DuplicateAction) => {
    if (dupFile) {
      await addFile(dupFile, dupClass, dupResType, action)
    } else if (pendingDraftSave) {
      const blob = new Blob([pendingDraftSave.content], { type: 'text/plain' })
      await addFile(new File([blob], pendingDraftSave.name, { type: 'text/plain' }), pendingDraftSave.className, pendingDraftSave.resourceType, action, pendingDraftSave.source)
    }
    setDupFile(null)
    setDupExisting([])
    setPendingDraftSave(null)
  }, [addFile, dupClass, dupFile, dupResType, pendingDraftSave])

  const handleDirectSave = useCallback(async (name: string, content: string, className: string, resourceType: string, source: StudySource = 'quick-add') => {
    const duplicates = await findDuplicates(name)
    if (duplicates.length > 0) {
      setDupFile(null)
      setDupClass(className)
      setDupResType(resourceType)
      setDupExisting(duplicates)
      setPendingDraftSave({ name, content, className, resourceType, source })
      return
    }

    const blob = new Blob([content], { type: 'text/plain' })
    await addFile(new File([blob], name, { type: 'text/plain' }), className, resourceType, undefined, source)
  }, [addFile, findDuplicates])

  const handleSyncRefresh = useCallback(async () => {
    const allFiles = await import('./db/indexeddb').then((module) => module.getAllFiles())
    await replaceAllFiles(allFiles)
    setNav('library')
    setSelectedClass(null)
    setFilters(makeFilters('library'))
  }, [replaceAllFiles])

  const switchNav = (next: Nav) => {
    setNav(next)
    setSelectedClass(null)
    setFilters(makeFilters(next))
  }

  const togglePanel = (panel: Exclude<PanelKey, null>) => {
    const isOpen = activePanel === panel
    const nextPanel = isOpen ? null : panel
    setActivePanel(nextPanel)

    if (panel === 'notebook') {
      setFocusedObject(nextPanel ? 'notebook' : null)
      return
    }

    setCabinetOpen(Boolean(nextPanel) || cabinetOpen)
    setFocusedObject(nextPanel ? 'cabinet' : null)
  }

  const goHome = () => {
    setNav('library')
    setSelectedClass(null)
    setActivePanel(null)
    setFocusedObject(null)
    setFilters(makeFilters('library'))
    setMobileNavOpen(false)
  }

  const openCourseFolios = () => {
    setNav('library')
    setSelectedClass(null)
    setFilters(makeFilters('library'))
    setFocusedObject(null)
    setMobileNavOpen(false)
  }

  const openAllEntries = () => {
    setNav('library')
    setSelectedClass('')
    setFilters({ search: '', className: '', resourceType: '', fileType: '', tab: 'library' })
    setFocusedObject(null)
    setMobileNavOpen(false)
  }

  const openArchiveIndex = () => {
    setNav('archive')
    setSelectedClass(null)
    setFilters(makeFilters('archive'))
    setFocusedObject('cabinet')
    setMobileNavOpen(false)
  }

  const openCourseIndex = (course: string) => {
    setNav('library')
    setSelectedClass(course)
    setFilters((current) => ({ ...current, tab: 'library', search: '', className: '', resourceType: '', fileType: '' }))
    setFocusedObject(null)
    setMobileNavOpen(false)
  }

  const openFileWithFocus = useCallback((file: StudyFile) => {
    setViewing(file)
    setFocusedObject('folio')
  }, [])

  const closeViewing = useCallback(() => {
    setViewing(null)
    setFocusedObject((current) => current === 'folio' ? null : current)
  }, [])

  const handlePersistState = useCallback((id: string, viewerState: Record<string, unknown>) => {
    updateFile(id, { viewerState })
  }, [updateFile])

  const handleClipboardToggle = useCallback((open: boolean) => {
    setClipboardOpen(open)
    setFocusedObject((current) => open ? 'clipboard' : current === 'clipboard' ? null : current)
  }, [])

  const handleCabinetToggle = useCallback((open: boolean) => {
    setCabinetOpen(open)
    if (open) {
      setFocusedObject('cabinet')
      return
    }

    setFocusedObject((current) => current === 'cabinet' ? null : current)
    if (activePanel && isCabinetPanel(activePanel)) {
      setActivePanel(null)
    }
  }, [activePanel])

  const clearFocusedObject = useCallback(() => {
    setFocusedObject(null)
  }, [])

  const upsertDeskMetaFile = useCallback(async (name: string, content: string, resourceType: string) => {
    const existing = files.find((file) => file.name === name)
    if (existing) {
      await updateFile(existing.id, {
        content,
        size: new Blob([content]).size,
        className: 'General',
        resourceType,
      })
      return
    }

    const blob = new Blob([content], { type: 'text/markdown' })
    await addFile(new File([blob], name, { type: 'text/markdown' }), 'General', resourceType, undefined, 'quick-add')
  }, [addFile, files, updateFile])

  const persistPages = useCallback((pages: NotebookPage[]) => {
    void upsertDeskMetaFile(DESK_NOTEBOOK_PAGES_FILE, JSON.stringify(pages), 'Notebook Pages')
  }, [upsertDeskMetaFile])

  const handleSavePage = useCallback((pageId: string, content: string) => {
    setNotebookPages((current) => {
      const updated = current.map((p) => p.id === pageId ? { ...p, content, updatedAt: Date.now() } : p)
      persistPages(updated)
      return updated
    })
  }, [persistPages])

  const handleAddPage = useCallback(() => {
    const now = Date.now()
    const id = `page-${now.toString(36)}`
    const newPage: NotebookPage = { id, title: `Page ${notebookPages.length + 1}`, content: '', createdAt: now, updatedAt: now }
    setNotebookPages((current) => {
      const updated = [...current, newPage]
      persistPages(updated)
      return updated
    })
    setActivePageId(id)
  }, [notebookPages.length, persistPages])

  const handleDeletePage = useCallback((pageId: string) => {
    setNotebookPages((current) => {
      const updated = current.filter((p) => p.id !== pageId)
      if (updated.length === 0) {
        const now = Date.now()
        const fallback: NotebookPage = { id: 'page-1', title: 'Page 1', content: '', createdAt: now, updatedAt: now }
        persistPages([fallback])
        setActivePageId('page-1')
        return [fallback]
      }
      persistPages(updated)
      if (activePageId === pageId) setActivePageId(updated[0].id)
      return updated
    })
  }, [activePageId, persistPages])

  const handleSaveTasks = useCallback((tasks: DeskTask[]) => {
    setNotebookTasks(tasks)
    void upsertDeskMetaFile(DESK_TASKS_FILE, serializeTaskChecklist(tasks), 'Desk Tasks')
  }, [upsertDeskMetaFile])

  const addTodoTask = useCallback((text: string) => {
    setNotebookTasks((current) => {
      const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      const newTask = { id, text, done: false }
      const updated = [...current, newTask]
      void upsertDeskMetaFile(DESK_TASKS_FILE, serializeTaskChecklist(updated), 'Desk Tasks')
      return updated
    })
  }, [upsertDeskMetaFile])

  const toggleTodoTask = useCallback((id: string) => {
    setNotebookTasks((current) => {
      const updated = current.map((task) => task.id === id ? { ...task, done: !task.done } : task)
      void upsertDeskMetaFile(DESK_TASKS_FILE, serializeTaskChecklist(updated), 'Desk Tasks')
      return updated
    })
  }, [upsertDeskMetaFile])

  const removeTodoTask = useCallback((id: string) => {
    setNotebookTasks((current) => {
      const updated = current.filter((task) => task.id !== id)
      void upsertDeskMetaFile(DESK_TASKS_FILE, serializeTaskChecklist(updated), 'Desk Tasks')
      return updated
    })
  }, [upsertDeskMetaFile])

  const handlePinNote = useCallback((notes: string) => {
    const excerpt = notes.trim().replace(/\s+/g, ' ').slice(0, 180)
    if (!excerpt) return
    const nextPinned = { text: excerpt, updatedAt: Date.now() }
    localStorage.setItem(PINNED_NOTE_STORAGE_KEY, JSON.stringify(nextPinned))
    setPinnedNote(nextPinned)
  }, [])

  const clearPinnedNote = useCallback(() => {
    localStorage.removeItem(PINNED_NOTE_STORAGE_KEY)
    setPinnedNote(null)
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(PINNED_NOTE_STORAGE_KEY)
    if (!raw) return
    try {
      setPinnedNote(JSON.parse(raw))
    } catch {
      localStorage.removeItem(PINNED_NOTE_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const today = new Date()
    const fallback = {
      kicker: "Today's Quote",
      title: '',
      body: DAILY_QUOTES[getDayOfYear(today) % DAILY_QUOTES.length],
    }

    const controller = new AbortController()

    ;(async () => {
      try {
        const response = await fetch('https://www.sikhnet.com/hukam', { signal: controller.signal })
        if (!response.ok) throw new Error('Unable to reach SikhNet')
        const html = await response.text()
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim()
        const body = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim()
        const href = doc.querySelector('meta[property="og:url"]')?.getAttribute('content')?.trim() || 'https://www.sikhnet.com/hukam'

        if (!title || !body) throw new Error('Missing Hukamnama metadata')

        const cleanedTitle = title.replace(/^Daily Hukamnama\s*-\s*/i, '')
        setDailyCard({
          kicker: "Today's Hukamnama",
          title: '',
          body,
          href,
          source: 'Source: Sri Guru Granth Sahib (SGGS).',
        })
      } catch {
        setDailyCard(fallback)
      }
    })()

    return () => controller.abort()
  }, [])

  const selectMusicMix = useCallback((mix: StudyMix) => {
    setActiveMix(mix)
    gramophone.selectMood(mix.key as MoodKey)
  }, [gramophone])

  const titleBlock = (
    <ArchCard
      uid="hero"
      variant="hero"
      surface="rgba(214,231,248,0.8)"
      className="bloom-title-block"
    >
      <div className="hero-wordmark-shell">
        {showFolders && !showArchive && (
          <>
            <div className="hero-wordmark">
              <span className="hero-wordmark-jot">Jot</span>{' '}
              <span className="hero-wordmark-gloss">Gloss</span>
            </div>
            <div className="hero-wordmark-rule" aria-hidden="true" />
            <div className="hero-wordmark-note">notes in the margin</div>
            <div className="hero-wordmark-meta">
              {active.length} active entries · {classes.length} course folios · {archived.length} archived
            </div>
          </>
        )}

        {selectedCourse && !showArchive && (
          <>
            <button type="button" onClick={() => setSelectedClass(null)} className="desk-tool-link" style={{ marginBottom: 10 }}>Back to Course Folios</button>
            <h1 className="bloom-title">{selectedCourse}</h1>
            {courseFileCount > 0 && <div className="bloom-stats"><span className="collection-stat">{courseFileCount} pages</span></div>}
          </>
        )}

        {showArchive && (
          <>
            <h1 className="bloom-title">Versions</h1>
            <div className="bloom-stats"><span className="collection-stat">{archived.length} saved versions</span></div>
          </>
        )}

        {isAllEntriesView && !showArchive && (
          <>
            <h1 className="bloom-title">All Entries</h1>
            <div className="bloom-stats"><span className="collection-stat">{active.length} live pages</span></div>
          </>
        )}
      </div>
    </ArchCard>
  )

  const viewerPanel = viewing ? (
    <FileViewer
      file={viewing}
      relatedFiles={viewing.lineageId ? getVersionGroup(visibleFiles, viewing) : undefined}
      onSelectVersion={openFileWithFocus}
      onArchiveVersion={(id) => { removeFile(id); closeViewing() }}
      onRestoreVersion={openFileWithFocus}
      onPersistState={handlePersistState}
      onClose={closeViewing}
    />
  ) : null

  const notebookPanel = (
    <DeskNotebook
      mode={notebookMode || 'center-desk'}
      pages={notebookPages}
      activePageId={activePageId}
      tasks={notebookTasks}
      hasPinnedNote={Boolean(pinnedNote)}
      companionFile={continueFile}
      onSavePage={handleSavePage}
      onAddPage={handleAddPage}
      onDeletePage={handleDeletePage}
      onSetActivePage={setActivePageId}
      onSaveTasks={handleSaveTasks}
      onPin={handlePinNote}
      onClearPin={clearPinnedNote}
      onOpenCompanion={openFileWithFocus}
      onClose={() => {
        setActivePanel(null)
        setFocusedObject(null)
      }}
    />
  )

  return (
    <div className="world-frame">
      <div className="world-frame-inner">
        <div className="portal-shell">
          <nav className={`archive-rail ${focusModeActive ? 'archive-rail-muted' : ''}`}>
            <div className="sidebar-arch hidden lg:flex">
              <div className="sidebar-arch-top" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ArchCard
                  uid="sidebar-monogram"
                  variant="sidebar"
                  surface="var(--color-parchment)"
                  style={{ width: '188px', height: '236px', flexShrink: 0 }}
                >
                  <button
                    type="button"
                    className="sidebar-crest-shell"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, padding: 0, background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
                    onClick={() => { closeViewing(); setSelectedClass(null); setActivePanel(null); setFocusedObject(null); setNav('library') }}
                    aria-label="Return to home"
                  >
                    <BookplateLogo size={78} />
                    <svg width="88" height="18" viewBox="0 0 88 18" aria-hidden="true" style={{ opacity: 0.6 }}>
                      <path
                        d="M 0 10 Q 6 4 12 10 Q 18 16 24 10 Q 30 4 36 10 Q 42 16 48 10 Q 54 4 60 10 Q 66 16 72 10 Q 78 4 84 10"
                        fill="none"
                        stroke="var(--color-gold)"
                        strokeWidth="0.9"
                      />
                    </svg>
                    <div className="sidebar-crest-caption">Jot Gloss</div>
                  </button>
                </ArchCard>
              </div>

              <div className="sidebar-arch-sides">
                <div className="sidebar-arch-content">
                  <div aria-hidden="true" style={{ position: 'absolute', top: 6, left: 6, pointerEvents: 'none', zIndex: 1 }}>
                    <MughalCorner size={32} color="var(--color-accent)" />
                  </div>
                  <div aria-hidden="true" style={{ position: 'absolute', top: 6, right: 6, pointerEvents: 'none', zIndex: 1, transform: 'scaleX(-1)' }}>
                    <MughalCorner size={32} color="var(--color-accent)" />
                  </div>
                  <div className="sidebar-section">
                    <button type="button" className="desk-tool-link" onClick={goHome} style={{ marginBottom: 0 }}>
                      Home
                    </button>
                  </div>

                  <DiamondDivider />

                  <div className="sidebar-section">
                    <div className="rail-heading">Index</div>
                    <div className={`rail-item ${nav === 'library' && !selectedCourse && selectedClass !== '' ? 'active' : ''}`} onClick={openCourseFolios} role="button" tabIndex={0}>
                      Course Folios
                    </div>
                    <div className={`rail-item ${selectedClass === '' ? 'active' : ''}`} onClick={openAllEntries} role="button" tabIndex={0}>
                      All Entries
                    </div>
                    <div className={`rail-item ${nav === 'archive' ? 'active' : ''}`} onClick={openArchiveIndex} role="button" tabIndex={0}>
                      Versions
                    </div>
                  </div>

                  <DiamondDivider />

                  <div className="sidebar-section">
                    <div className="rail-heading">Courses</div>
                    {classes.map((course) => (
                      <div
                        key={course}
                        className={`rail-item ${selectedCourse === course ? 'active' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => openCourseIndex(course)}
                      >
                        {course.replace(/\s*[\u2014\u2013-]\s*/, ' · ')}
                      </div>
                    ))}
                  </div>

                  <DiamondDivider />

                  <div className="sidebar-section sidebar-courses-editor">
                    <details>
                      <summary className="rail-heading cursor-pointer" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 6 }}>
                        Edit Courses
                      </summary>
                      <div className="space-y-1 mt-2">
                        {classes.map((course) => (
                          <div key={course} className="course-edit-row">
                            <span className="truncate">{course}</span>
                            <button type="button" onClick={() => removeClass(course)} className="course-edit-remove">x</button>
                          </div>
                        ))}
                        <form
                          onSubmit={(event) => {
                            event.preventDefault()
                            const input = (event.target as HTMLFormElement).elements.namedItem('new-course') as HTMLInputElement
                            if (input.value.trim()) {
                              addClass(input.value.trim())
                              input.value = ''
                            }
                          }}
                          className="course-edit-form"
                        >
                          <input name="new-course" placeholder="Name a new course..." className="input-warm" />
                          <button type="submit" className="bookplate-action compact">Add</button>
                        </form>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              <div className="sidebar-arch-bottom" style={{ width: '100%', padding: '0 12px', marginTop: 'auto' }}>
                <svg width="100%" viewBox="0 0 236 40" aria-hidden="true" style={{ display: 'block' }}>
                  <path
                    d="M 0 40 Q 15 18 30 40 Q 45 18 60 40 Q 75 18 90 40 Q 105 18 118 40 Q 131 18 146 40 Q 161 18 176 40 Q 191 18 206 40 Q 221 18 236 40"
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth="1"
                    opacity="0.55"
                  />
                  {[15, 45, 75, 105, 131, 161, 191, 221].map((x) => (
                    <circle key={x} cx={x} cy="20" r="1.8" fill="var(--color-gold)" opacity="0.4" />
                  ))}
                  {[0, 60, 118, 176, 236].map((x, i) => (
                    <g key={i} transform={`translate(${x}, 40)`}>
                      <circle cx="0" cy="0" r="2.5" fill="var(--color-accent)" opacity="0.3" />
                      <circle cx="0" cy="0" r="1" fill="var(--color-gold)" opacity="0.5" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <div className="mobile-study-door-bar lg:hidden">
              <button
                type="button"
                className="study-door-trigger"
                onClick={() => setMobileNavOpen(true)}
                aria-expanded={mobileNavOpen}
                aria-controls="study-door-panel"
              >
                <BookplateLogo size={36} />
              </button>
              <button
                type="button"
                className="study-door-selector"
                onClick={() => setMobileNavOpen(true)}
                aria-expanded={mobileNavOpen}
                aria-controls="study-door-panel"
              >
                <span className="study-door-selector-label">{mobileDoorLabel}</span>
                <span className="study-door-selector-caret" aria-hidden="true">v</span>
              </button>
            </div>
            {mobileNavOpen && (
              <>
                <button
                  type="button"
                  className="study-door-backdrop lg:hidden"
                  aria-label="Close the study door"
                  onClick={() => setMobileNavOpen(false)}
                />
                <div
                  id="study-door-panel"
                  className="study-door-panel lg:hidden"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Course folios"
                >
                  <div className="study-door-shell sidebar-arch">
                    <div className="sidebar-arch-sides">
                      <div className="sidebar-arch-content study-door-content">
                        <div className="study-door-head">
                          <div className="rail-heading">Course Folios</div>
                          <button type="button" className="desk-tool-link" onClick={() => setMobileNavOpen(false)}>
                            Close
                          </button>
                        </div>

                        <div className="sidebar-section">
                          <button type="button" className="desk-tool-link" onClick={goHome}>
                            Home
                          </button>
                        </div>

                        <DiamondDivider />

                        <div className="sidebar-section">
                          <div className={`rail-item ${nav === 'library' && !selectedCourse && selectedClass !== '' ? 'active' : ''}`} onClick={openCourseFolios} role="button" tabIndex={0}>
                            Course Folios
                          </div>
                          <div className={`rail-item ${selectedClass === '' ? 'active' : ''}`} onClick={openAllEntries} role="button" tabIndex={0}>
                            All Entries
                          </div>
                          <div className={`rail-item ${nav === 'archive' ? 'active' : ''}`} onClick={openArchiveIndex} role="button" tabIndex={0}>
                            Versions
                          </div>
                        </div>

                        <DiamondDivider />

                        <div className="sidebar-section">
                          <div className="rail-heading">Courses</div>
                          {classes.map((course) => (
                            <div
                              key={course}
                              className={`rail-item ${selectedCourse === course ? 'active' : ''}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => openCourseIndex(course)}
                            >
                              {course.replace(/\s*[\u2014\u2013-]\s*/, ' · ')}
                            </div>
                          ))}
                        </div>

                        <DiamondDivider />

                        <div className="sidebar-section sidebar-courses-editor">
                          <details>
                            <summary className="rail-heading cursor-pointer" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 6 }}>
                              Edit Courses
                            </summary>
                            <div className="space-y-1 mt-2">
                              {classes.map((course) => (
                                <div key={course} className="course-edit-row">
                                  <span className="truncate">{course}</span>
                                  <button type="button" onClick={() => removeClass(course)} className="course-edit-remove">x</button>
                                </div>
                              ))}
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault()
                                  const input = (event.target as HTMLFormElement).elements.namedItem('new-course') as HTMLInputElement
                                  if (input.value.trim()) {
                                    addClass(input.value.trim())
                                    input.value = ''
                                  }
                                }}
                                className="course-edit-form"
                              >
                                <input name="new-course" placeholder="Name a new course..." className="input-warm" />
                                <button type="submit" className="bookplate-action compact">Add</button>
                              </form>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </nav>

          <DeskTodoPanel
            tasks={notebookTasks}
            onAddTask={addTodoTask}
            onToggleTask={toggleTodoTask}
            onRemoveTask={removeTodoTask}
          />

          <main className={`main-desk ${focusModeActive ? 'main-desk-focused' : ''} ${deskFocusOnRail ? 'main-desk-cleared' : ''} ${deskFocusOnFolio ? 'main-desk-folio' : ''}`}>
            <div className={`main-desk-inner ${focusModeActive ? 'main-desk-inner-focused' : ''}`}>
              {viewing && notebookMode === 'side-panel' ? (
                <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
                  <div style={{ flex: '1 1 auto', overflowY: 'auto', minWidth: 0 }}>
                    {viewerPanel}
                  </div>
                  <div style={{ flex: '0 0 320px', maxWidth: '35%', overflowY: 'auto' }}>
                    {notebookPanel}
                  </div>
                </div>
              ) : viewing ? (
                viewerPanel
              ) : (
                <>
                  {!notebookOverlayActive && <div className={`bloom-title-block ${deskFocusOnRail ? 'desk-panel-resting' : ''}`}>{titleBlock}</div>}


                  {!notebookOverlayActive && (
                    <div className={`desk-rail-inline ${deskFocusOnFolio ? 'desk-rail-inline-resting' : ''}`}>
                      <JotGlossStudyRail
                        continueFile={continueFile}
                        recentActivity={recentActivity}
                        pinnedNote={pinnedNote}
                        dailyCard={dailyCard}
                        viewing={viewing}
                        activePanel={activePanel}
                        isArchiveView={showArchive}
                        clipboardOpen={clipboardOpen}
                        cabinetOpen={cabinetOpen}
                        musicOpen={musicOpen}
                        focusedObject={focusedObject}
                        onTogglePanel={togglePanel}
                        onOpenFile={openFileWithFocus}
                        onOpenArchive={() => {
                          setActivePanel(null)
                          switchNav('archive')
                          setFocusedObject('cabinet')
                        }}
                        onFocusObject={setFocusedObject}
                        onClearFocus={clearFocusedObject}
                        onClipboardToggle={handleClipboardToggle}
                        onCabinetToggle={handleCabinetToggle}
                        onMusicToggle={setMusicOpen}
                        syncLabel={syncLabel}
                        studyMixes={STUDY_MIXES}
                        activeMixKey={activeMix.key}
                        musicPlaying={musicPlaying}
                        musicActionLabel={gramophone.actionLabel}
                        onToggleMusic={gramophone.toggleNeedle}
                        onSelectMix={selectMusicMix}
                        onAddStickyNote={addStickyNote}
                      />
                    </div>
                  )}

                  <div className={`desk-active-panel ${notebookOverlayActive ? 'desk-active-panel-focused' : ''}`}>
                    {activePanel === 'upload' && <FileUploader classes={classes} onUpload={handleUpload} onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                    {activePanel === 'paste' && <QuickAdd classes={classes} onSave={handleDirectSave} onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                    {activePanel === 'notebook' && notebookPanel}
                    {activePanel === 'prompts' && <PromptBank onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                    {activePanel === 'sync' && <SyncPanel files={files} classes={classes} onRefresh={handleSyncRefresh} onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                    {activePanel === 'timer' && <StudyTimer timer={timer} classes={classes} onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                    {activePanel === 'stats' && <StudyStats classes={classes} files={visibleFiles} onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                  </div>

                  {!notebookOverlayActive && showFolders && featured && (
                    <div className="featured-folio-wrap">
                      <StudyFolio
                        title={humanTitle(featured.name)}
                        subtitle={`${featured.className} · ${featured.resourceType}`}
                        stamp="Latest Entry"
                        accent={getFolioAccent(featured.className)}
                        note="Resume exactly where you left off."
                        onOpen={() => openFileWithFocus(featured)}
                      />
                    </div>
                  )}

                  {!notebookOverlayActive && (!showFolders || showArchive || selectedClass !== null) && (
                    <UtilityBookplate tone="parchment" surface="bare" kicker="Index" className={`search-filter-shell ${deskFocusOnRail ? 'desk-panel-resting' : ''}`}>
                      <input type="search" placeholder="Find a folio or page..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className="index-search" />

                      <div className="search-filter-controls">
                        <div className="sort-link-row">
                          {([
                            ['updatedAt', 'Recent'],
                            ['createdAt', 'Added'],
                            ['name', 'A-Z'],
                          ] as const).map(([field, label]) => (
                            <button
                              key={field}
                              type="button"
                              className={`sort-link ${sortField === field ? 'active' : ''}`}
                              onClick={() => {
                                if (sortField === field) setSortDir((current) => current === 'asc' ? 'desc' : 'asc')
                                else {
                                  setSortField(field as SortField)
                                  setSortDir(field === 'name' ? 'asc' : 'desc')
                                }
                              }}
                            >
                              {label} {sortField === field ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </UtilityBookplate>
                  )}

                  {!notebookOverlayActive && <div className={`center-content-stack ${deskFocusOnRail ? 'desk-panel-resting' : ''} ${deskFocusOnFolio ? 'center-content-stack-focused' : ''}`}>
                    {loading ? (
                      <UtilityBookplate tone="parchment" surface="bare" kicker="Opening" title="Opening your desk">
                        <p className="rail-copy">Gathering the folios...</p>
                      </UtilityBookplate>
                    ) : showFolders ? (
                      <>
                        <FloralBorder />
                        <UtilityBookplate tone="parchment" surface="bare" kicker="Course Folios" title="Browse by course">
                          <div className="folio-sort-row course-folio-sort-row">
                            <span className="folio-sort-label">Sort by</span>
                            <div className="sort-link-row">
                              {([
                                ['course', 'Course'],
                                ['entries', 'Entries'],
                                ['recent', 'Recent'],
                              ] as const).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  className={`sort-link ${folioSort === value ? 'active' : ''}`}
                                  onClick={() => setFolioSort(value)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="card-grid course-folio-grid">
                            {sortedFolders.map((folder, index) => (
                              <ClassFolder
                                key={folder.name}
                                index={index}
                                title={folder.name}
                                kicker="Course Folio"
                                entryCount={folder.files.length}
                                onClick={() => setSelectedClass(folder.name)}
                              />
                            ))}
                          </div>
                        </UtilityBookplate>
                        <FloralBorder mirror={true} />

                        <ArchDivider width="48%" />

                        <UtilityBookplate className="recent-pages-field" tone="parchment" surface="veil" kicker="Recent Pages">
                          <p className="recent-pages-note">Freshly opened folios, still warm on the desk.</p>
                          <div className="recent-pages-list">
                            {recent.slice(1, 6).map((file, index) => (
                              <FileCard
                                key={file.id}
                                file={file}
                                index={index}
                                versionSummary={versionSummaries.get(file.id)}
                                onOpen={openFileWithFocus}
                                onEdit={setEditing}
                                onArchive={(id: string) => updateFile(id, { archived: true })}
                                onRestore={(id: string) => updateFile(id, { archived: false })}
                                onDelete={removeFile}
                              />
                            ))}
                          </div>
                        </UtilityBookplate>

                        <div className="browse-all-wrap">
                          <button type="button" onClick={() => setSelectedClass('')} className="desk-tool-link browse-all-link">See everything on the desk</button>
                        </div>
                      </>
                    ) : (
                      <UtilityBookplate
                        tone={showArchive ? 'lavender' : selectedCourse ? 'powder' : 'parchment'}
                        surface="bare"
                        kicker={showArchive ? 'Versions' : 'Entries'}
                        title={showArchive ? 'Saved versions' : selectedCourse ? undefined : 'All folios'}
                        footer={`${filtered.length} visible in this view`}
                      >
                        {filtered.length === 0 ? (
                          <p className="rail-copy">The desk is clear. Add a folio or loosen the filters to see your pages again.</p>
                        ) : (
                          filtered.map((file, index) => (
                            <FileCard
                                key={file.id}
                                file={file}
                                index={index}
                                versionSummary={versionSummaries.get(file.id)}
                                onOpen={openFileWithFocus}
                                onEdit={setEditing}
                                onArchive={(id: string) => updateFile(id, { archived: true })}
                                onRestore={(id: string) => updateFile(id, { archived: false })}
                              onDelete={removeFile}
                            />
                          ))
                        )}
                      </UtilityBookplate>
                    )}
                  </div>}

                  {!notebookOverlayActive && <footer className="desk-colophon">Jasleen's study library</footer>}
                </>
              )}
            </div>
          </main>

          <aside className="desk-rail">
            <JotGlossStudyRail
              continueFile={continueFile}
              recentActivity={recentActivity}
              pinnedNote={pinnedNote}
              dailyCard={dailyCard}
              viewing={viewing}
              activePanel={activePanel}
              isArchiveView={showArchive}
              clipboardOpen={clipboardOpen}
              cabinetOpen={cabinetOpen}
              musicOpen={musicOpen}
              focusedObject={focusedObject}
              onTogglePanel={togglePanel}
              onOpenFile={openFileWithFocus}
              onOpenArchive={() => {
                setActivePanel(null)
                switchNav('archive')
                setFocusedObject('cabinet')
              }}
              onFocusObject={setFocusedObject}
              onClearFocus={clearFocusedObject}
              onClipboardToggle={handleClipboardToggle}
              onCabinetToggle={handleCabinetToggle}
              onMusicToggle={setMusicOpen}
              syncLabel={syncLabel}
              studyMixes={STUDY_MIXES}
              activeMixKey={activeMix.key}
              musicPlaying={musicPlaying}
              musicActionLabel={gramophone.actionLabel}
              onToggleMusic={gramophone.toggleNeedle}
              onSelectMix={selectMusicMix}
              onAddStickyNote={addStickyNote}
            />
          </aside>
        </div>
      </div>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 500 }}>
        {stickyNotes.map((note) => (
          <StickyNote key={note.id} {...note} onUpdate={updateStickyNote} onDismiss={removeStickyNote} />
        ))}
      </div>

      {/* Gramophone audio is managed by useGramophone hook -- no DOM element needed */}
      <ClipboardWatcher classes={classes} onSave={handleDirectSave} />
      {editing && <EditModal file={editing} classes={classes} onSave={(id: string, updates: Partial<StudyFile>) => updateFile(id, updates)} onClose={() => setEditing(null)} />}
      {(dupFile || pendingDraftSave) && <DuplicateModal fileName={dupFile?.name || pendingDraftSave?.name || ''} existing={dupExisting} onAction={handleDupAction} />}
      <FloatingTimer timer={timer} onOpenPanel={() => togglePanel('timer')} />
    </div>
  )
}
