import type { CSSProperties, ReactNode } from 'react'

type Tone = 'cream' | 'blush' | 'powder' | 'butter' | 'lilac' | 'sage'

interface Props {
  children: ReactNode
  title?: string
  kicker?: string
  footer?: string
  tone?: Tone
  surface?: 'default' | 'veil' | 'bare'
  className?: string
  style?: CSSProperties
}

const TONES: Record<Tone, { background: string; wash: string; line: string }> = {
  cream: { background: 'rgba(255, 248, 240, 0.95)', wash: 'rgba(255, 252, 248, 0.92)', line: 'rgba(184, 160, 144, 0.5)' },
  blush: { background: 'rgba(255, 234, 230, 0.95)', wash: 'rgba(255, 243, 239, 0.92)', line: 'rgba(201, 124, 138, 0.5)' },
  powder: { background: 'rgba(228, 238, 248, 0.95)', wash: 'rgba(241, 246, 251, 0.92)', line: 'rgba(149, 174, 204, 0.5)' },
  butter: { background: 'rgba(240, 232, 194, 0.95)', wash: 'rgba(248, 242, 216, 0.92)', line: 'rgba(194, 167, 108, 0.52)' },
  lilac: { background: 'rgba(235, 228, 244, 0.95)', wash: 'rgba(244, 240, 250, 0.92)', line: 'rgba(164, 143, 191, 0.5)' },
  sage: { background: 'rgba(230, 242, 232, 0.95)', wash: 'rgba(239, 247, 240, 0.92)', line: 'rgba(144, 177, 145, 0.52)' },
}

export default function UtilityBookplate({
  children,
  title,
  kicker,
  footer,
  tone = 'cream',
  surface = 'default',
  className,
  style,
}: Props) {
  const palette = TONES[tone]
  const isBare = surface === 'bare'
  const isVeil = surface === 'veil'
  const outerFrame = 'rgba(169, 151, 141, 0.24)'
  const midFrame = 'rgba(221, 210, 194, 0.62)'
  const innerFrame = 'rgba(167, 151, 150, 0.18)'
  const frameBorder = isBare ? 'none' : isVeil ? '1px solid rgba(184, 149, 106, 0.16)' : `1px solid ${outerFrame}`
  const frameShadow = isBare || isVeil ? 'none' : '0 8px 20px rgba(90, 62, 75, 0.05)'
  const frameBackground = isBare
    ? 'transparent'
    : isVeil
    ? `linear-gradient(180deg, ${palette.wash.replace('0.92', '0.28')}, rgba(255, 250, 246, 0.12) 62%, rgba(255, 248, 244, 0.08))`
    : palette.background
  const washBackground = isBare
    ? 'transparent'
    : isVeil
    ? `linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04) 58%, transparent)`
    : `linear-gradient(180deg, ${palette.wash}, transparent 58%)`

  return (
    <section
      className={className}
      style={{
        position: 'relative',
        background: frameBackground,
        boxShadow: frameShadow,
        border: frameBorder,
        padding: isBare ? '0' : '16px 16px 15px',
        overflow: isBare ? 'visible' : 'hidden',
        backdropFilter: isVeil ? 'blur(1.5px)' : undefined,
        ...style,
      }}
    >
      {!isBare && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 6,
              border: isVeil ? '1px solid rgba(255, 255, 255, 0.18)' : `1px solid ${midFrame}`,
              background: washBackground,
              pointerEvents: 'none',
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 11,
              border: `1px solid ${isVeil ? 'rgba(184, 149, 106, 0.12)' : innerFrame}`,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {(title || kicker) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: isBare ? 16 : 14 }}>
            <div>
              {kicker && (
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#c97c8a',
                    marginBottom: 4,
                  }}
                >
                  {kicker}
                </div>
              )}
              {title && (
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: '#5A3E4B',
                  }}
                >
                  {title}
                </h3>
              )}
            </div>
          </div>
        )}

        <div>{children}</div>

        {footer && (
          <div
            style={{
              marginTop: 14,
              paddingTop: isBare ? 0 : 10,
              borderTop: isBare ? 'none' : '1px solid rgba(184, 149, 106, 0.14)',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 11,
              fontStyle: 'italic',
              color: 'rgba(90, 62, 75, 0.7)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </section>
  )
}
