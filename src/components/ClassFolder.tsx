import type { StudyFile } from '../types'
import ArchNiche from './ArchNiche'

interface Props {
  className: string
  files: StudyFile[]
  onClick: () => void
  index?: number
}

const TINTS: Array<'blush' | 'powder' | 'butter' | 'lilac' | 'sage'> = ['blush', 'powder', 'butter', 'lilac', 'sage']

export default function ClassFolder({ className, files, onClick, index = 0 }: Props) {
  const tint = TINTS[index % TINTS.length]

  return (
    <ArchNiche
      onClick={onClick}
      tint={tint}
      variant="section"
      shape="stationery"
      style={{ cursor: 'pointer', minHeight: 276, transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
      className="folder-arch-card"
    >
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
    </ArchNiche>
  )
}
