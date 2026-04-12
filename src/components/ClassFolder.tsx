import type { StudyFile } from '../types'

interface Props {
  className: string
  files: StudyFile[]
  onClick: () => void
  index?: number
}

const TINTS: Array<'blush' | 'powder' | 'butter' | 'lilac' | 'sage'> = ['blush', 'powder', 'butter', 'lilac', 'sage']
const SURFACES: Record<(typeof TINTS)[number], string> = {
  blush: 'rgba(242, 208, 204, 0.92)',
  powder: 'rgba(214, 228, 237, 0.92)',
  butter: 'rgba(245, 230, 184, 0.92)',
  lilac: 'rgba(221, 212, 236, 0.92)',
  sage: 'rgba(212, 228, 208, 0.92)',
}

export default function ClassFolder({ className, files, onClick, index = 0 }: Props) {
  const tint = TINTS[index % TINTS.length]

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 276,
        background: SURFACES[tint],
        border: '1px solid rgba(169, 151, 141, 0.28)',
        boxShadow: '0 16px 28px rgba(86, 60, 68, 0.08)',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        position: 'relative',
        padding: 0,
        textAlign: 'center',
      }}
      className="folder-arch-card"
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '8px',
          border: '1px solid rgba(199, 183, 157, 0.52)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ padding: '48px 24px 24px', textAlign: 'center', maxWidth: 260, margin: '0 auto', position: 'relative' }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c97c8a',
            marginBottom: 8,
          }}
        >
          Course Folio
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: '#5A3E4B',
            lineHeight: 1.15,
          }}
        >
          {className}
        </h3>

        <div style={{ width: 36, borderTop: '1.3px solid rgba(184, 160, 144, 0.28)', margin: '10px auto 8px' }} />

        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 12,
            fontStyle: 'italic',
            color: '#5A3E4B',
          }}
        >
          {files.length} {files.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>
    </button>
  )
}
