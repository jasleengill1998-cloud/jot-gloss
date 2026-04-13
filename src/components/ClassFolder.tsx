import React from 'react'
import type { StudyFile } from '../types'
import { ArchCard } from './ArchCard'

const SURFACE_CYCLE = [
  'var(--color-rose)',
  'var(--color-shell)',
  'var(--color-butter)',
  'var(--color-lavender)',
  'var(--color-sage)',
  'var(--color-blush-bright)',
]

interface ClassFolderProps {
  index: number
  title?: string
  kicker?: string
  description?: string
  entryCount?: number
  onClick?: () => void
  className?: string
  files?: StudyFile[]
}

export const ClassFolder: React.FC<ClassFolderProps> = ({
  index,
  title,
  kicker,
  description,
  entryCount,
  onClick,
  className,
  files,
}) => {
  const resolvedTitle = title ?? className ?? ''
  const resolvedKicker = kicker ?? 'Course Folio'
  const resolvedEntryCount = entryCount ?? files?.length

  return (
    <ArchCard
      uid={`folder-${resolvedTitle.replace(/\s+/g, '-').toLowerCase()}-${index}`}
      variant="folio"
      surface={SURFACE_CYCLE[index % SURFACE_CYCLE.length]}
      onClick={onClick}
      className="folder-arch-card"
    >
      <div
        style={{
          paddingTop: 8,
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 18,
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 8,
        }}
      >
        {resolvedKicker && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-accent)',
            }}
          >
            {resolvedKicker}
          </span>
        )}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--color-ink-light)',
            margin: 0,
            lineHeight: 1.16,
          }}
        >
          {resolvedTitle}
        </h3>
        <div
          aria-hidden="true"
          style={{
            width: 38,
            borderTop: '1px solid rgba(199, 183, 157, 0.42)',
          }}
        />
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--color-ink-muted)',
              margin: 0,
              lineHeight: 1.42,
            }}
          >
            {description}
          </p>
        )}
        {resolvedEntryCount !== undefined && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--color-ink-muted)',
              marginTop: 'auto',
            }}
          >
            {resolvedEntryCount} {resolvedEntryCount === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>
    </ArchCard>
  )
}

export default ClassFolder
