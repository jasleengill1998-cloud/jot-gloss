import type { ReactNode } from 'react'
import { ArchCard } from './ArchCard'

export type Accent = 'oxblood' | 'powder' | 'butter' | 'lilac' | 'blush' | 'sage'

interface Props {
  title: string
  subtitle?: string
  stamp?: string
  note?: string
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
  note,
  metaLeft,
  metaRight,
  accent = 'butter',
  onOpen,
  children,
}: Props) {
  const stampColor = accent === 'oxblood' ? 'var(--color-ink-light)' : 'var(--color-accent)'

  return (
    <article style={{ width: '100%' }}>
      <ArchCard
        uid="featured-folio"
        variant="featured"
        surface="var(--color-butter)"
        className="study-folio-arch"
        onClick={onOpen}
      >
        <div
          style={{
            padding: '4px var(--space-xl) var(--space-lg)',
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto',
            position: 'relative',
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: stampColor,
              marginBottom: 14,
            }}
          >
            {'\u2726'} {stamp} {'\u2726'}
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              lineHeight: 1.02,
              letterSpacing: '0.01em',
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontStyle: 'italic',
                color: 'var(--color-ink-light)',
                marginTop: 10,
              }}
            >
              {subtitle}
            </p>
          )}

          {note && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontStyle: 'italic',
                color: 'color-mix(in srgb, var(--color-ink-light) 70%, transparent)',
                marginTop: subtitle ? 10 : 0,
                maxWidth: 360,
                alignSelf: 'center',
              }}
            >
              {note}
            </p>
          )}

          <div style={{ width: 56, borderTop: '1.2px solid color-mix(in srgb, var(--color-rule) 62%, transparent)', margin: '20px auto 12px' }} />

          {(metaLeft || metaRight) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              {metaLeft && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    fontStyle: 'italic',
                    color: 'var(--color-ink-light)',
                  }}
                >
                  {metaLeft}
                </span>
              )}
              {metaRight && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    fontStyle: 'italic',
                    color: 'color-mix(in srgb, var(--color-ink-light) 72%, transparent)',
                  }}
                >
                  {metaRight}
                </span>
              )}
            </div>
          )}

          {children && <div style={{ marginTop: 18 }}>{children}</div>}
        </div>
      </ArchCard>
    </article>
  )
}
