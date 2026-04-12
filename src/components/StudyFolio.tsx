import type { ReactNode } from 'react'

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
  const surfaceByTint: Record<Exclude<Accent, 'oxblood' | 'blush'> | 'butter', string> = {
    powder: 'rgba(214, 228, 237, 0.92)',
    butter: 'rgba(245, 230, 184, 0.92)',
    lilac: 'rgba(221, 212, 236, 0.92)',
    sage: 'rgba(212, 228, 208, 0.92)',
  }

  return (
    <article style={{ width: '100%' }}>
      <button
        type="button"
        onClick={onOpen}
        style={{
          width: '100%',
          minHeight: 320,
          background: surfaceByTint[tint],
          border: '1px solid rgba(169, 151, 141, 0.28)',
          boxShadow: '0 18px 34px rgba(86, 60, 68, 0.08)',
          cursor: onOpen ? 'pointer' : 'default',
          padding: 0,
          textAlign: 'center',
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
        <div style={{ padding: 'var(--space-2xl) var(--space-xl) var(--space-lg)', textAlign: 'center', maxWidth: 620, margin: '0 auto', position: 'relative' }}>
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
      </button>
    </article>
  )
}
