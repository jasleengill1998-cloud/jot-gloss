import type { ComponentProps, ReactNode } from 'react'
import { memo } from 'react'
import type { StudyFile } from '../types'
import type { FocusedObject } from '../utils/appSession'
import { DiamondDivider } from './DiamondDivider'
import UtilityBookplate from './UtilityBookplate'

type PanelKey = 'upload' | 'paste' | 'notebook' | 'prompts' | 'sync' | 'timer' | 'stats' | null
export type StudyMix = { key: string; label: string; startIndex: number }
type RailTone = ComponentProps<typeof UtilityBookplate>['tone']
type RailFocusTarget = Exclude<FocusedObject, 'folio' | null>

interface Props {
  continueFile: StudyFile | null
  recentActivity: StudyFile[]
  pinnedNote: { text: string; updatedAt: number } | null
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
  calculator?: ReactNode
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

function formatActivityDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
      <UtilityBookplate tone={tone} surface="veil" kicker={kicker} title={title} className={`rail-focus-card ${isFocused ? 'rail-focus-card-active' : ''}`}>
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
  calculator,
}: Props) {
  const filingCabinetActive = cabinetOpen || isArchiveView || activePanel === 'upload' || activePanel === 'paste' || activePanel === 'prompts' || activePanel === 'sync' || activePanel === 'timer' || activePanel === 'stats'

  return (
    <div className="desk-rail-stack">
      <div
        style={{
          padding: '10px 11px 8px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#C97C8A',
              marginBottom: 6,
            }}
          >
            Recent
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#5A3E4B',
              marginBottom: 6,
            }}
          >
            Pick up where you left off
          </div>

          {continueFile && (
            <button type="button" className="bookplate-action" onClick={() => onOpenFile(continueFile)} style={{ marginBottom: 8, width: '100%' }}>
              Continue
            </button>
          )}

          <div className="archive-activity-list">
            {recentActivity.length === 0 ? (
              <p className="rail-copy" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                Open a folio and it will wait here for you.
              </p>
            ) : (
              recentActivity.map((file) => (
                <button key={file.id} type="button" className="archive-activity-item" onClick={() => onOpenFile(file)}>
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
        closeLabel="Close the drawer"
      >
        <div className="rail-button-stack">
          <button
            type="button"
            className={`bookplate-action ${activePanel === 'notebook' ? 'active' : ''}`}
            onClick={() => {
              onFocusObject('notebook')
              onTogglePanel('notebook')
            }}
          >
            Open notebook
          </button>

          {viewing && (
            <button
              type="button"
              className={`bookplate-action ${activePanel === 'notebook' ? 'active' : ''}`}
              onClick={() => onTogglePanel('notebook')}
            >
              Open beside folio
            </button>
          )}

          <button
            type="button"
            className="bookplate-action"
            onClick={onAddStickyNote}
            title="Add sticky note"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1 H10 L13 4 V13 H1 Z" stroke="#5A3E4B" strokeWidth="0.9" fill="rgba(245,230,184,0.5)" />
              <path d="M10 1 V4 H13" stroke="#5A3E4B" strokeWidth="0.8" fill="none" />
              <line x1="3" y1="7" x2="11" y2="7" stroke="#C7B79D" strokeWidth="0.6" />
              <line x1="3" y1="9.5" x2="9" y2="9.5" stroke="#C7B79D" strokeWidth="0.6" />
            </svg>
            Sticky Note
          </button>

          <button type="button" className={`bookplate-action ${activePanel === 'timer' ? 'active' : ''}`} onClick={() => onTogglePanel('timer')}>
            Desk Clock
          </button>
        </div>

        {pinnedNote && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid rgba(199,183,157,0.3)',
              fontFamily: "'EB Garamond',Georgia,serif",
              fontSize: 12,
              color: 'rgba(90,62,75,0.7)',
              fontStyle: 'italic',
            }}
          >
            {pinnedNote.text}
          </div>
        )}

        {calculator && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(199,183,157,0.3)' }}>
            {calculator}
          </div>
        )}
      </FocusableRailSection>

      <DiamondDivider />

      <FocusableRailSection
        tone="parchment"
        kicker="Study Music"
        title="Study Music"
        objectKey="music"
        focusedObject={focusedObject}
        onSpineClick={onClearFocus}
        wrapperClassName={musicPlaying ? 'gramophone-playing' : 'gramophone-resting'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '2px 0 6px' }}>
          <svg width="60" height="50" viewBox="0 0 72 60" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M 36 52 L 8 12 Q 6 8 10 6 Q 14 4 18 8 L 44 48" fill="rgba(200,169,110,0.18)" stroke="#C8A96E" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 8 12 Q 4 4 12 2 Q 22 0 28 8 L 44 48" fill="rgba(200,169,110,0.08)" stroke="#C8A96E" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="12" cy="8" rx="8" ry="5" fill="rgba(200,169,110,0.12)" stroke="#C8A96E" strokeWidth="1" transform="rotate(-20, 12, 8)" />
            <line x1="44" y1="48" x2="52" y2="52" stroke="#A9978D" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="56" cy="54" rx="13" ry="5" fill="rgba(58,40,48,0.08)" stroke="#A9978D" strokeWidth="0.8" />
            <ellipse cx="56" cy="54" rx="9" ry="3.5" fill="rgba(90,62,75,0.06)" stroke="#C8A96E" strokeWidth="0.5" opacity="0.7" />
            <circle cx="56" cy="54" r="1.5" fill="#C8A96E" opacity="0.5" />
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%' }}>
            <button
              type="button"
              onClick={onToggleMusic}
              aria-label={musicPlaying ? 'Pause' : 'Play'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                flexShrink: 0,
                cursor: 'pointer',
                background: musicPlaying ? 'rgba(201,124,138,0.18)' : 'rgba(200,169,110,0.12)',
                border: `1px solid ${musicPlaying ? 'rgba(201,124,138,0.4)' : 'rgba(200,169,110,0.35)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {musicPlaying ? (
                <svg width="11" height="13" viewBox="0 0 9 11" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="2.5" height="9" rx="0.8" fill="#5A3E4B" opacity="0.7" />
                  <rect x="5.5" y="1" width="2.5" height="9" rx="0.8" fill="#5A3E4B" opacity="0.7" />
                </svg>
              ) : (
                <svg width="11" height="13" viewBox="0 0 9 11" fill="none" aria-hidden="true">
                  <path d="M2 1L8 5.5L2 10Z" fill="#5A3E4B" opacity="0.7" />
                </svg>
              )}
            </button>
            <span
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 11,
                color: 'rgba(90,62,75,0.6)',
                letterSpacing: '0.04em',
              }}
            >
              {musicPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

        </div>
      </FocusableRailSection>

      <DiamondDivider />

      <FocusableRailSection
        tone="lavender"
        kicker="Archive & Sundries"
        title="The Filing Cabinet"
        objectKey="cabinet"
        focusedObject={focusedObject}
        onSpineClick={() => {
          onCabinetToggle(true)
          onFocusObject('cabinet')
        }}
        onClearFocus={onClearFocus}
        closeLabel="Leave the cabinet"
      >
        <details
          open={musicOpen}
          onToggle={(event) => onMusicToggle((event.currentTarget as HTMLDetailsElement).open)}
          className="desk-cabinet-block"
        >
          <summary className="desk-cabinet-summary">{musicOpen ? 'Close music' : 'Study Music'}</summary>
          <p className="rail-copy">
            Keep a small collection of desk music close while you read.
          </p>
        </details>

        <details
          open={clipboardOpen}
          onToggle={(event) => onClipboardToggle((event.currentTarget as HTMLDetailsElement).open)}
          className="desk-cabinet-block"
        >
          <summary className="desk-cabinet-summary">{continueFile ? humanTitle(continueFile.name) : 'Recent'}</summary>
          <p className="rail-copy">
            {continueFile ? `${continueFile.className} · ${continueFile.resourceType}` : 'Open a folio and it will wait here for you.'}
          </p>
          {continueFile && (
            <button type="button" className="bookplate-action compact" onClick={() => onOpenFile(continueFile)}>
              Continue
            </button>
          )}
        </details>

        <details
          open={filingCabinetActive}
          onToggle={(event) => onCabinetToggle((event.currentTarget as HTMLDetailsElement).open)}
          className="desk-cabinet-block"
        >
          <summary className="desk-cabinet-summary">{filingCabinetActive ? 'Close Cabinet' : 'Filing Cabinet'}</summary>
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
        </details>
      </FocusableRailSection>
    </div>
  )
}

export default memo(JotGlossStudyRail)
