import type { StudyFile } from '../types'

interface Props {
  file: StudyFile
  coursePalette?: { accent: string; bg: string; border: string; s1: string; s2: string }
  versionSummary?: { total: number; archivedCount: number }
  index?: number
  onOpen: (file: StudyFile) => void
  onEdit: (file: StudyFile) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}

const TINT_BG = [
  'rgba(252, 233, 228, 0.82)',
  'rgba(230, 238, 248, 0.84)',
  'rgba(243, 235, 199, 0.84)',
  'rgba(236, 230, 243, 0.84)',
  'rgba(229, 240, 231, 0.84)',
]

const TINT_STRIPE = [
  'rgba(201, 124, 138, 0.82)',
  'rgba(146, 167, 199, 0.84)',
  'rgba(204, 176, 112, 0.82)',
  'rgba(183, 166, 203, 0.84)',
  'rgba(155, 180, 149, 0.84)',
]

function fmtSize(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
}

function humanTitle(name: string) {
  let base = name.replace(/\.[^.]+$/, '')
  base = base.replace(/^m[-_]b[-_]a[-_]s[-_]?(\d{3})/i, 'mbas$1')
  base = base.replace(/^mbas[-_]?\d{3}[-_]/i, '')
  return base.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (char) => char.toUpperCase()).trim()
}

export default function FileCard({
  file,
  versionSummary,
  index = 0,
  onOpen,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: Props) {
  const title = humanTitle(file.name)
  const background = TINT_BG[index % TINT_BG.length]
  const spine = TINT_STRIPE[index % TINT_STRIPE.length]

  return (
    <div
      className={`utility-file-row group ${file.archived ? 'opacity-55' : ''}`}
      onClick={() => onOpen(file)}
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(file)
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
        padding: '16px 18px',
        marginBottom: 10,
        cursor: 'pointer',
        background,
        border: '1px solid rgba(184, 149, 106, 0.22)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-1px)'
        event.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.6), 0 10px 20px rgba(90,62,75,0.07)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = ''
        event.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.45)'
      }}
    >
      <div
        style={{
          width: 4,
          borderRadius: 999,
          background: spine,
          opacity: 0.82,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#c97c8a',
            }}
          >
            {file.className}
          </div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 10,
              fontStyle: 'italic',
              color: 'rgba(90,62,75,0.58)',
            }}
          >
            {fmtDate(file.updatedAt)}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 17,
            fontWeight: 700,
            color: '#5A3E4B',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
          title={file.name}
        >
          {title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 12, fontStyle: 'italic', color: '#5A3E4B' }}>
            {file.resourceType}
          </span>
          <span style={{ color: 'rgba(184,149,106,0.42)' }}>{'\u00b7'}</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: 'rgba(90,62,75,0.62)' }}>{fmtSize(file.size)}</span>
          {versionSummary && versionSummary.total > 1 && (
            <>
              <span style={{ color: 'rgba(184,149,106,0.42)' }}>{'\u00b7'}</span>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 10, fontStyle: 'italic', color: '#c97c8a' }}>
                v{file.version} of {versionSummary.total}
              </span>
            </>
          )}
        </div>

        <div
          className="utility-file-actions"
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}
          onClick={(event) => event.stopPropagation()}
        >
          <button onClick={() => onEdit(file)} className="desk-tool-link">Edit</button>
          {file.archived ? (
            <button onClick={() => onRestore(file.id)} className="desk-tool-link">Bring Back</button>
          ) : (
            <button onClick={() => onArchive(file.id)} className="desk-tool-link">Save Version</button>
          )}
          <button
            onClick={() => {
              if (confirm('Remove this file from the desk?')) {
                onDelete(file.id)
              }
            }}
            className="desk-tool-link desk-tool-link-danger"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
