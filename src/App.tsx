import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import type { DuplicateAction, Filters, SortDir, SortField, StudyFile, StudySource } from './types'
import { useClasses } from './hooks/useClasses'
import { useFiles } from './hooks/useFiles'
import { useStudyTimer } from './hooks/useStudyTimer'
import { useGramophone } from './hooks/useGramophone'
import type { MoodKey } from './hooks/useGramophone'
import BookplateLogo from './components/BookplateLogo'
import ClassFolder from './components/ClassFolder'
import ClipboardWatcher from './components/ClipboardWatcher'
import DeskTodoPanel from './components/DeskTodoPanel'
import DuplicateModal from './components/DuplicateModal'
import DeskNotebook, { type DeskTask } from './components/DeskNotebook'
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
import AiSpendingTracker from './components/AiSpendingTracker'
import SyncPanel from './components/SyncPanel'
import { ArchDivider, FloralBorder, JaliStrip, MughalCorner } from './components/Ornaments'
import UtilityBookplate from './components/UtilityBookplate'
import { loadAppSession, saveAppSession, type AppNav, type FocusedObject } from './utils/appSession'
import { getVersionGroup, getVersionSummary } from './utils/studyFiles'
import { useStickyNotes } from './hooks/useStickyNotes'

type Nav = 'library' | 'archive'
type PanelKey = 'upload' | 'paste' | 'notebook' | 'prompts' | 'sync' | 'timer' | 'stats' | 'spending' | null
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

  const btn = (label: string, type: 'num' | 'op' | 'eq' | 'clear') => (
    <button
      key={label}
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
  const filingCabinetActive = cabinetOpen || isArchiveView || activePanel === 'upload' || activePanel === 'paste' || activePanel === 'prompts' || activePanel === 'sync' || activePanel === 'timer' || activePanel === 'stats' || activePanel === 'spending'

  return (
    <div className="desk-rail-stack">
      <div style={{
        background: 'rgba(245,230,184,0.95)',
        border: '1px solid rgba(194,167,108,0.52)',
        padding: '14px 16px 12px',
        position: 'relative',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 5,
          border: '1px solid rgba(194,167,108,0.28)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8,
          }}>
            Where You Left Off
          </div>

          {continueFile && (
            <button type="button" className="bookplate-action" onClick={() => onOpenFile(continueFile)}
              style={{ marginBottom: 10, width: '100%' }}>
              Back to the books
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
        kicker="Stationery"
        title=""
        objectKey="notebook"
        focusedObject={focusedObject}
        onSpineClick={() => onFocusObject('notebook')}
        onClearFocus={onClearFocus}
        closeLabel="Leave the stationery"
      >
        <div className="rail-button-stack">
          <button type="button"
            className={`bookplate-action ${activePanel === 'notebook' ? 'active' : ''}`}
            onClick={() => { onFocusObject('notebook'); onTogglePanel('notebook') }}>
            Open the notebook
          </button>

          {viewing && (
            <button
              type="button"
              className={`bookplate-action ${activePanel === 'notebook' ? 'active' : ''}`}
              onClick={() => onTogglePanel('notebook')}>
              Open beside the folio
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
            Place a sticky note
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
        onSpineClick={onClearFocus}
        wrapperClassName={musicPlaying ? 'gramophone-playing' : 'gramophone-resting'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 8px' }}>
          <svg width="68" height="56" viewBox="0 0 72 60" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M 36 52 L 8 12 Q 6 8 10 6 Q 14 4 18 8 L 44 48"
                  fill="rgba(200,169,110,0.18)" stroke="#C8A96E" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M 8 12 Q 4 4 12 2 Q 22 0 28 8 L 44 48"
                  fill="rgba(200,169,110,0.08)" stroke="#C8A96E" strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
            <ellipse cx="12" cy="8" rx="8" ry="5"
                     fill="rgba(200,169,110,0.12)" stroke="#C8A96E" strokeWidth="1" transform="rotate(-20, 12, 8)"/>
            <line x1="44" y1="48" x2="52" y2="52" stroke="#A9978D" strokeWidth="1.5" strokeLinecap="round"/>
            <ellipse cx="56" cy="54" rx="13" ry="5" fill="rgba(58,40,48,0.08)" stroke="#A9978D" strokeWidth="0.8"/>
            <ellipse cx="56" cy="54" rx="9" ry="3.5" fill="rgba(90,62,75,0.06)" stroke="#C8A96E" strokeWidth="0.5" opacity="0.7"/>
            <circle cx="56" cy="54" r="1.5" fill="#C8A96E" opacity="0.5"/>
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <button type="button" onClick={onToggleMusic} aria-label={musicActionLabel}
              style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                background: musicPlaying ? 'rgba(201,124,138,0.18)' : 'rgba(200,169,110,0.12)',
                border: `1px solid ${musicPlaying ? 'rgba(201,124,138,0.4)' : 'rgba(200,169,110,0.35)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
              {musicPlaying
                ? <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true">
                    <rect x="1" y="1" width="2.5" height="9" rx="0.8" fill="#5A3E4B" opacity="0.7"/>
                    <rect x="5.5" y="1" width="2.5" height="9" rx="0.8" fill="#5A3E4B" opacity="0.7"/>
                  </svg>
                : <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true">
                    <path d="M2 1L8 5.5L2 10Z" fill="#5A3E4B" opacity="0.7"/>
                  </svg>
              }
            </button>
            <span style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 12, fontStyle: 'italic',
              color: 'rgba(90,62,75,0.7)', flex: 1, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {studyMixes.find(m => m.key === activeMixKey)?.label ?? '—'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {studyMixes.map((mix) => (
              <button key={mix.key} type="button" onClick={() => onSelectMix(mix)} title={mix.label}
                style={{
                  padding: '2px 8px', cursor: 'pointer', borderRadius: 2,
                  fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10,
                  letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  background: activeMixKey === mix.key ? 'rgba(201,124,138,0.16)' : 'rgba(200,169,110,0.07)',
                  border: `1px solid ${activeMixKey === mix.key ? 'rgba(201,124,138,0.4)' : 'rgba(200,169,110,0.22)'}`,
                  color: activeMixKey === mix.key ? '#5A3E4B' : 'rgba(90,62,75,0.5)',
                  maxWidth: 112, overflow: 'hidden', textOverflow: 'ellipsis',
                  transition: 'all 0.15s ease',
                }}>
                {mix.label}
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
                Browse the versions
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'upload' ? 'active' : ''}`} onClick={() => onTogglePanel('upload')}>
                Place in the cabinet
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'paste' ? 'active' : ''}`} onClick={() => onTogglePanel('paste')}>
                Slip from Claude
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'prompts' ? 'active' : ''}`} onClick={() => onTogglePanel('prompts')}>
                Prompt Drawer
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'stats' ? 'active' : ''}`} onClick={() => onTogglePanel('stats')}>
                The Ledger
              </button>
              <button type="button" className={`bookplate-action ${activePanel === 'spending' ? 'active' : ''}`} onClick={() => onTogglePanel('spending')}>
                The Ink Account
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
  const [notebookTasks, setNotebookTasks] = useState<DeskTask[]>([])

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
  const notebookOverlayActive = activePanel === 'notebook'
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

  const handleNotebookSave = useCallback(async (notes: string, tasks: DeskTask[]) => {
    setNotebookTasks(tasks)
    await Promise.all([
      upsertDeskMetaFile(DESK_NOTE_FILE, notes, 'Desk Notes'),
      upsertDeskMetaFile(DESK_TASKS_FILE, serializeTaskChecklist(tasks), 'Desk Tasks'),
    ])
  }, [upsertDeskMetaFile])

  const addTodoTask = useCallback((text: string) => {
    setNotebookTasks((current) => {
      const newTask = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        done: false,
      }
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
      title: formatLongDate(today),
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
          title: cleanedTitle || formatLongDate(today),
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
    <div
      style={{
        minHeight: 228,
        background: 'rgba(214, 228, 237, 0.78)',
        border: '1px solid rgba(169, 151, 141, 0.28)',
        boxShadow: '0 18px 34px rgba(86, 60, 68, 0.08)',
        position: 'relative',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 'var(--space-sm)',
          border: '1px solid rgba(199, 183, 157, 0.52)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ padding: 'calc(var(--space-2xl) * 1.5) var(--space-xl) var(--space-lg)', textAlign: 'center', maxWidth: 620, margin: '0 auto', position: 'relative' }}>
        {showFolders && !showArchive && (
          <>
            <div className="wordmark-lockup">
              <span className="wordmark-jot">JOT</span>
              <div className="wordmark-rule" />
              <span className="wordmark-gloss">Gloss</span>
              <span className="wordmark-sub">notes in the margin</span>
            </div>
            <div style={{ margin: '8px auto 0', width: '60%', opacity: 0.7 }}>
              <JaliStrip color="#C7B79D" width="100%" />
            </div>
            <div className="bloom-stats">
              <span className="collection-stat">{active.length} live pages</span>
              <span className="collection-stat">{classes.length} course folios</span>
              <span className="collection-stat">{archived.length} saved versions</span>
            </div>
          </>
        )}

        {selectedCourse && !showArchive && (
          <>
            <button type="button" onClick={() => setSelectedClass(null)} className="desk-tool-link" style={{ marginBottom: 10 }}>Back to Course Folios</button>
            <h1 className="bloom-title">{selectedCourse}</h1>
            {courseFileCount > 0 && (
              <div className="bloom-stats">
                {courseFileCount > 0 && <span className="collection-stat">{courseFileCount} pages</span>}
              </div>
            )}
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
    </div>
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
      notes={noteFile?.content || ''}
      tasks={notebookTasks}
      hasPinnedNote={Boolean(pinnedNote)}
      companionFile={continueFile}
      onSave={handleNotebookSave}
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
                <div className="sidebar-arch-sides">
                  <div className="sidebar-arch-content">
                    <div aria-hidden="true" style={{ position: 'absolute', top: 6, left: 6, pointerEvents: 'none', zIndex: 1 }}>
                      <MughalCorner size={32} color="#C97C8A" />
                    </div>
                    <div aria-hidden="true" style={{ position: 'absolute', top: 6, right: 6, pointerEvents: 'none', zIndex: 1, transform: 'scaleX(-1)' }}>
                      <MughalCorner size={32} color="#C97C8A" />
                    </div>
                    <div className="sidebar-section">
                      <button type="button" className="desk-tool-link" onClick={goHome} style={{ marginBottom: 0 }}>
                        Return to the desk
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
                          <input name="new-course" placeholder="New course..." className="input-warm" />
                          <button type="submit" className="bookplate-action compact">Add</button>
                        </form>
                      </div>
                    </details>
                  </div>
                </div>
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
                            Return to the desk
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
                                <input name="new-course" placeholder="New course..." className="input-warm" />
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
              {viewing && activePanel === 'notebook' ? (
                <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
                  <div style={{ flex: '0 0 55%', overflowY: 'auto', borderRight: '1px solid rgba(199,183,157,0.3)', paddingRight: 0 }}>
                    {viewerPanel}
                  </div>
                  <div style={{ flex: '0 0 45%', overflowY: 'auto', paddingLeft: 0 }}>
                    {notebookPanel}
                  </div>
                </div>
              ) : viewing ? (
                viewerPanel
              ) : (
                <>
                  {!notebookOverlayActive && <div className={`bloom-title-block ${deskFocusOnRail ? 'desk-panel-resting' : ''}`}>{titleBlock}</div>}

                  {!notebookOverlayActive && showFolders && featured && (
                    <div className={`hero-panel ${deskFocusOnRail ? 'desk-panel-resting' : ''}`}>
                      <StudyFolio
                        title={humanTitle(featured.name)}
                        subtitle={`${featured.className} · ${featured.resourceType}`}
                        stamp="Latest Entry"
                        accent={getFolioAccent(featured.className)}
                        onOpen={() => openFileWithFocus(featured)}
                      >
                        <p className="hero-note">Pick up where you left off.</p>
                      </StudyFolio>
                    </div>
                  )}

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
                    {activePanel === 'spending' && <AiSpendingTracker onClose={() => {
                      setActivePanel(null)
                      setFocusedObject((current) => current === 'cabinet' ? null : current)
                    }} />}
                  </div>

                  {!notebookOverlayActive && (!showFolders || showArchive || selectedClass !== null) && (
                    <UtilityBookplate tone="parchment" surface="bare" kicker="Index" className={`search-filter-shell ${deskFocusOnRail ? 'desk-panel-resting' : ''}`}>
                      <input type="search" placeholder="Search notes and folios..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className="index-search" />

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
                        <p className="rail-copy">The folios are being gathered now.</p>
                      </UtilityBookplate>
                    ) : showFolders ? (
                      <>
                        <FloralBorder />
                        <UtilityBookplate tone="parchment" surface="bare" kicker="Course Folios" title="By course" footer={`${folders.length} folios · ${active.length} live pages`}>
                          <div className="folio-sort-row">
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
                          <div className="card-grid">
                            {sortedFolders.map((folder, index) => (
                              <ClassFolder key={folder.name} className={folder.name} files={folder.files} onClick={() => setSelectedClass(folder.name)} index={index} />
                            ))}
                          </div>
                        </UtilityBookplate>
                        <FloralBorder mirror={true} />

                        <ArchDivider width="48%" />

                        <UtilityBookplate tone="parchment" surface="bare" kicker="Recent Pages">
                          <div>
                            {recent.slice(1, 7).map((file, index) => (
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
                          <button type="button" onClick={() => setSelectedClass('')} className="desk-tool-link browse-all-link">Browse all entries</button>
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
                          <p className="rail-copy">No entries are visible in this view yet. Add a folio or clear the current filters to repopulate the desk.</p>
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
