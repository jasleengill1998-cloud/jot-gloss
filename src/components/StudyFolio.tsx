import type { ReactNode } from 'react'
import ArchNiche from './ArchNiche'

export type Accent = 'oxblood' | 'powder' | 'butter' | 'lilac' | 'blush' | 'sage'

interface Props {
  title: string
  subtitle?: string
  stamp?: string
  metaLeft?: string
  metaRight?: string
  accent?: Accent
  onOpen?: () => void
  children?: ReactNode
}

export default function StudyFolio({
  title,
  subtitle,
  stamp = 'Continue Studying',
  metaLeft,
  metaRight,
  accent = 'butter',
  onOpen,
  children,
}: Props) {
  const tint = accent === 'oxblood' || accent === 'blush' ? 'butter' : accent
  const stampColor = accent === 'oxblood' ? '#6e3040' : '#c97c8a'

  return (
    <article style={{ width: '100%' }}>
      <ArchNiche onClick={onOpen} emphasis tint={tint} variant="hero" shape="hybrid" style={{ cursor: 'pointer', minHeight: 360 }}>
        <div style={{ padding: '146px 40px 38px', textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: stampColor,
              marginBottom: 10,
            }}
          >
            {'\u2726'} {stamp} {'\u2726'}
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 28,
              fontWeight: 700,
              color: '#3A2830',
              lineHeight: 1.08,
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 13,
                fontStyle: 'italic',
                color: '#5A3E4B',
                marginTop: 8,
              }}
            >
              {subtitle}
            </p>
          )}

          <div style={{ width: 40, borderTop: '1.5px solid rgba(184, 160, 144, 0.34)', margin: '14px auto 12px' }} />

          {(metaLeft || metaRight) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              {metaLeft && (
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 11,
                    fontStyle: 'italic',
                    color: '#5A3E4B',
                  }}
                >
                  {metaLeft}
                </span>
              )}
              {metaRight && (
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 11,
                    fontStyle: 'italic',
                    color: 'rgba(90, 62, 75, 0.72)',
                  }}
                >
                  {metaRight}
                </span>
              )}
            </div>
          )}

          {children && <div style={{ marginTop: 18 }}>{children}</div>}
        </div>
      </ArchNiche>
    </article>
  )
}
