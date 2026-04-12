import type { StudyFile, DuplicateAction } from '../types'

interface Props {
  fileName: string
  existing: StudyFile[]
  onAction: (action: DuplicateAction) => void
}

export default function DuplicateModal({ fileName, existing, onAction }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn modal-overlay"
         role="dialog" aria-modal="true" aria-label="Duplicate file detected">
      <div className="modal-panel max-w-md w-full animate-scaleIn">
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 700, color: '#5A3E4B',
          letterSpacing: '0.04em', marginBottom: 8,
        }}>
          Similar file exists
        </h3>
        <p style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 13, color: 'rgba(90,62,75,0.6)', marginBottom: 4,
        }}>
          <strong style={{ color: '#5A3E4B' }}>{fileName}</strong> looks similar to:
        </p>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 11, fontStyle: 'italic', color: 'rgba(90,62,75,0.6)',
          marginBottom: 14,
        }}>
          Saving as a new version keeps the earlier draft on the versions shelf.
        </p>
        <ul style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 12, color: '#5A3E4B', marginBottom: 24,
          paddingLeft: 20, listStyle: 'disc',
        }}>
          {existing.map(f => (
            <li key={f.id} style={{ marginBottom: 4 }}>
              {f.name} <span style={{ color: 'rgba(90,62,75,0.35)', fontSize: 11 }}>(v{f.version})</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onAction('replace')} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            padding: '10px 16px', cursor: 'pointer',
            color: '#C07070', background: 'none',
            border: '1px solid rgba(192,112,112,0.3)',
            transition: 'all 0.15s',
          }}>
            Replace
          </button>
          <button onClick={() => onAction('archive')} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            padding: '10px 16px', cursor: 'pointer',
            color: '#5A3E4B', background: 'none',
            border: '1px solid rgba(184,149,106,0.3)',
            transition: 'all 0.15s',
          }}>
            Save older version
          </button>
          <button onClick={() => onAction('keep-both')} className="btn-primary" style={{
            padding: '10px 16px', fontSize: 11,
          }}>
            Keep both
          </button>
          <button onClick={() => onAction('skip')} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            padding: '10px 16px', cursor: 'pointer',
            color: 'rgba(90,62,75,0.5)', background: 'none',
            border: '1px solid rgba(184,149,106,0.2)',
            transition: 'all 0.15s',
          }}>
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
