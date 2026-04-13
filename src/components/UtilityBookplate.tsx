import type { CSSProperties, ReactNode } from 'react'

type Tone = 'parchment' | 'blush' | 'powder' | 'butter' | 'lavender' | 'sage'

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
  parchment: { background: 'rgba(255, 248, 242, 0.95)', wash: 'rgba(255, 252, 248, 0.92)', line: 'rgba(184, 160, 144, 0.5)' },
  blush: { background: 'rgba(255, 234, 230, 0.95)', wash: 'rgba(255, 243, 239, 0.92)', line: 'rgba(201, 124, 138, 0.5)' },
  powder: { background: 'rgba(214, 231, 248, 0.94)', wash: 'rgba(232, 242, 252, 0.9)', line: 'rgba(146, 167, 199, 0.42)' },
  butter: { background: 'rgba(245, 230, 184, 0.95)', wash: 'rgba(250, 240, 210, 0.92)', line: 'rgba(194, 167, 108, 0.52)' },
  lavender: { background: 'rgba(221, 212, 236, 0.95)', wash: 'rgba(234, 228, 246, 0.92)', line: 'rgba(164, 143, 191, 0.5)' },
  sage: { background: 'rgba(212, 228, 208, 0.95)', wash: 'rgba(228, 240, 226, 0.92)', line: 'rgba(144, 177, 145, 0.52)' },
}

export default function UtilityBookplate({
  children,
  title,
  kicker,
  footer,
  tone = 'parchment',
  surface = 'default',
  className,
  style,
}: Props) {
  const palette = TONES[tone]
  const isBare = surface === 'bare'
  const isVeil = surface === 'veil'
  const outerFrame = palette.line
  const midFrame = 'rgba(221, 210, 194, 0.46)'
  const innerFrame = 'rgba(167, 151, 150, 0.14)'
  const frameBorder = isBare ? 'none' : isVeil ? '1px solid rgba(184, 149, 106, 0.12)' : `1px solid ${outerFrame}`
  const frameShadow = isBare || isVeil ? 'none' : '0 10px 18px rgba(90, 62, 75, 0.035)'
  const frameBackground = isBare
    ? 'transparent'
    : isVeil
    ? `linear-gradient(180deg, ${palette.wash.replace('0.92', '0.2')}, rgba(255, 250, 246, 0.08) 62%, rgba(255, 248, 244, 0.04))`
    : palette.background
  const washBackground = isBare
    ? 'transparent'
    : isVeil
    ? `linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03) 58%, transparent)`
    : `linear-gradient(180deg, ${palette.wash}, transparent 58%)`

  return (
    <section
      className={className}
      style={{
        position: 'relative',
        background: frameBackground,
        boxShadow: frameShadow,
        border: frameBorder,
        padding: isBare ? '0' : '12px 12px 11px',
        overflow: isBare ? 'visible' : 'hidden',
        backdropFilter: isVeil ? 'blur(1.5px)' : undefined,
        ...style,
      }}
    >
      {/* Double-inset Victorian frame borders */}
      {!isBare && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 4,
              border: isVeil ? '1px solid rgba(255, 255, 255, 0.18)' : `1px solid ${midFrame}`,
              background: washBackground,
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 8,
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
                    letterSpacing: '0.12em',
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
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.12,
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
