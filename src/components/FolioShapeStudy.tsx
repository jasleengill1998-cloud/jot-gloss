import ArchNiche, { type ArchShape } from './ArchNiche'

interface Props {
  label: string
  description: string
  courseName: string
  entryCount: number
  shape: ArchShape
}

export default function FolioShapeStudy({ label, description, courseName, entryCount, shape }: Props) {
  return (
    <div className="folio-shape-study-option">
      <ArchNiche tint="cream" variant="section" shape={shape} style={{ minHeight: 276 }}>
        <div style={{ padding: '150px 24px 24px', textAlign: 'center', maxWidth: 260, margin: '0 auto' }}>
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
            {courseName}
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
            {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </ArchNiche>

      <div className="folio-shape-study-caption">
        <div className="folio-shape-study-label">{label}</div>
        <p className="folio-shape-study-copy">{description}</p>
      </div>
    </div>
  )
}
