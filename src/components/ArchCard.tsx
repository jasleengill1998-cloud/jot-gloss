import React from 'react'

type ArchVariant = 'hero' | 'featured' | 'folio' | 'sidebar'

interface ArchCardProps {
  uid: string
  variant: ArchVariant
  surface: string
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}

const PATHS: Record<ArchVariant, { w: number; h: number; main: string; inner: string; scallop: string }> = {
  hero: {
    w: 760,
    h: 220,
    main: 'M 0 220 L 0 105 C 40 103 240 35 380 18 C 520 35 720 103 760 105 L 760 220 Z',
    inner: 'M 18 220 L 18 112 C 55 110 250 46 380 30 C 510 46 705 110 742 112 L 742 220 Z',
    scallop: 'M 130 88 Q 255 52 380 42 Q 505 52 630 88',
  },
  featured: {
    w: 760,
    h: 260,
    main: 'M 0 260 L 0 120 C 40 118 240 42 380 22 C 520 42 720 118 760 120 L 760 260 Z',
    inner: 'M 22 260 L 22 130 C 58 128 250 52 380 34 C 510 52 702 128 738 130 L 738 260 Z',
    scallop: 'M 140 106 Q 260 64 380 52 Q 500 64 620 106',
  },
  folio: {
    w: 260,
    h: 300,
    main: 'M 0 300 L 0 120 C 20 118 80 40 130 20 C 180 40 240 118 260 120 L 260 300 Z',
    inner: 'M 12 300 L 12 130 C 30 128 88 50 130 32 C 172 50 230 128 248 130 L 248 300 Z',
    scallop: 'M 46 108 Q 88 62 130 48 Q 172 62 214 108',
  },
  sidebar: {
    w: 180, h: 160,
    main: 'M 0 160 L 0 58 C 15 56 60 24 90 14 C 120 24 165 56 180 58 L 180 160 Z',
    inner: 'M 8 160 L 8 64 C 22 62 66 30 90 22 C 114 30 158 62 172 64 L 172 160 Z',
    scallop: 'M 30 52 Q 60 30 90 22 Q 120 30 150 52',
  },
}

/* PROTECTED — see CLAUDE.md §15. Content starts in the wide belly below the arch crown. */
const BELLY_TOP: Record<ArchVariant, string> = {
  hero: '30%',
  featured: '28%',
  folio: '24%',
  sidebar: '20%',
}

/* PROTECTED — horizontal inset keeps text away from the curved arch edges. */
const BELLY_INSET: Record<ArchVariant, string> = {
  hero: '4%',
  featured: '4%',
  folio: '8%',
  sidebar: '6%',
}

const INNER_FILL: Record<ArchVariant, string> = {
  hero: 'rgba(249, 252, 255, 0.76)',
  featured: 'rgba(255, 251, 245, 0.8)',
  folio: 'rgba(255, 251, 246, 0.82)',
  sidebar: 'rgba(255, 252, 248, 0.78)',
}

function RoseBud({ x, y, r, rotation = 0 }: { x: number; y: number; r: number; rotation?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      {/* Outer petals — 6 layered ellipses */}
      {[0, 60, 120, 180, 240, 300].map(a => (
        <ellipse key={`o${a}`} cx={0} cy={0} rx={r * 0.45} ry={r} fill="rgba(240,192,200,0.7)" opacity={0.6} transform={`rotate(${a}) translate(0,${-r * 0.35})`} />
      ))}
      {/* Inner petals — tighter ring */}
      {[30, 90, 150, 210, 270, 330].map(a => (
        <ellipse key={`i${a}`} cx={0} cy={0} rx={r * 0.35} ry={r * 0.7} fill="rgba(232,168,184,0.65)" opacity={0.65} transform={`rotate(${a}) translate(0,${-r * 0.25})`} />
      ))}
      {/* Center */}
      <circle r={r * 0.42} fill="rgba(240,132,156,0.7)" />
      <circle r={r * 0.22} fill="rgba(255,208,216,0.5)" />
    </g>
  )
}

function ForgetMeNot({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.55}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.5} rx={r * 0.4} ry={r * 0.6} fill="rgba(180,168,224,0.7)" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.25} fill="rgba(240,224,160,0.8)" />
    </g>
  )
}

function CornerBotanical({ variant, side }: { variant: 'hero' | 'featured' | 'folio'; side: 'left' | 'right' }) {
  const mirrored = side === 'right'
  const s = variant === 'hero' ? 1 : variant === 'featured' ? 0.88 : 0.72
  const stemPath = `M 0 0 C ${-12 * s} ${26 * s} ${-16 * s} ${52 * s} ${-8 * s} ${84 * s} C ${-1 * s} ${108 * s} ${8 * s} ${126 * s} ${20 * s} ${144 * s}`

  return (
    <g transform={mirrored ? `translate(${100 * s} ${60 * s}) scale(-1 1)` : `translate(0 ${60 * s})`} opacity={0.58}>
      {/* Main curving vine stem */}
      <path d={stemPath} fill="none" stroke="rgba(145,184,164,0.68)" strokeWidth={1.6 * s} strokeLinecap="round" />

      {/* Structured leaves with veins — pairs along the stem */}
      {[
        { x: -2, y: 28, angle: -35, len: 14 },
        { x: -8, y: 56, angle: -25, len: 12 },
        { x: -3, y: 88, angle: -30, len: 11 },
        { x: 10, y: 110, angle: 15, len: 10 },
      ].map((leaf, i) => (
        <g key={`leaf-${i}`} transform={`translate(${leaf.x * s} ${leaf.y * s}) rotate(${leaf.angle})`}>
          {/* Leaf body */}
          <ellipse cx={leaf.len * s * 0.5} cy={0} rx={leaf.len * s * 0.5} ry={3.5 * s} fill="rgba(144,200,152,0.35)" />
          {/* Leaf spine */}
          <line x1={0} y1={0} x2={leaf.len * s} y2={0} stroke="rgba(145,184,164,0.5)" strokeWidth={0.6 * s} />
          {/* Leaf veins */}
          <line x1={leaf.len * s * 0.3} y1={0} x2={leaf.len * s * 0.5} y2={-2 * s} stroke="rgba(145,184,164,0.35)" strokeWidth={0.4 * s} />
          <line x1={leaf.len * s * 0.55} y1={0} x2={leaf.len * s * 0.7} y2={-1.8 * s} stroke="rgba(145,184,164,0.35)" strokeWidth={0.4 * s} />
          <line x1={leaf.len * s * 0.3} y1={0} x2={leaf.len * s * 0.5} y2={2 * s} stroke="rgba(145,184,164,0.35)" strokeWidth={0.4 * s} />
        </g>
      ))}

      {/* Curling tendrils */}
      <path d={`M ${-6 * s} ${40 * s} C ${-14 * s} ${36 * s} ${-18 * s} ${32 * s} ${-14 * s} ${28 * s}`} fill="none" stroke="rgba(145,184,164,0.4)" strokeWidth={0.7 * s} strokeLinecap="round" />
      <path d={`M ${4 * s} ${74 * s} C ${12 * s} ${70 * s} ${16 * s} ${66 * s} ${12 * s} ${62 * s}`} fill="none" stroke="rgba(145,184,164,0.35)" strokeWidth={0.6 * s} strokeLinecap="round" />
      <path d={`M ${14 * s} ${104 * s} C ${22 * s} ${100 * s} ${26 * s} ${96 * s} ${22 * s} ${92 * s}`} fill="none" stroke="rgba(145,184,164,0.3)" strokeWidth={0.5 * s} strokeLinecap="round" />

      {/* Rose buds — layered multi-petal blooms */}
      <RoseBud x={18 * s} y={22 * s} r={4.5 * s} rotation={-10} />
      <RoseBud x={14 * s} y={66 * s} r={3.8 * s} rotation={15} />

      {/* Forget-me-nots — small 5-petal clusters */}
      <ForgetMeNot x={-12 * s} y={46 * s} r={3 * s} />
      <ForgetMeNot x={22 * s} y={94 * s} r={2.6 * s} />
      <ForgetMeNot x={8 * s} y={120 * s} r={2.2 * s} />

      {/* Small gold accent dots along the stem */}
      {[18, 42, 68, 96, 124].map(yPos => (
        <circle key={`dot-${yPos}`} cx={(-4 + Math.sin(yPos * 0.08) * 6) * s} cy={yPos * s} r={0.8 * s} fill="rgba(200,168,120,0.4)" />
      ))}
    </g>
  )
}

export const ArchCard: React.FC<ArchCardProps> = ({
  uid,
  variant,
  surface,
  children,
  style,
  className,
  onClick,
}) => {
  const { w, h, main, inner, scallop } = PATHS[variant]
  const clipId = `arch-clip-${uid}`
  const outerStroke = variant === 'hero' ? 1.34 : variant === 'featured' ? 1.24 : variant === 'folio' ? 1.12 : 1
  const innerStroke = variant === 'hero' ? 0.92 : variant === 'featured' ? 0.82 : variant === 'folio' ? 0.74 : 0.62
  const crownStroke = variant === 'hero' ? 0.94 : variant === 'featured' ? 0.88 : variant === 'folio' ? 0.78 : 0.64
  const rosetteY = variant === 'hero' ? 20 : variant === 'featured' ? 18 : variant === 'folio' ? 18 : variant === 'sidebar' ? 10 : 18

  return (
    <div
      className={`arch-card-root arch-card--${variant}${className ? ` ${className}` : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${w} / ${h}`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        style={{ display: 'block', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={inner} />
          </clipPath>
        </defs>

        <path d={main} fill={surface} />
        <path d={inner} fill={INNER_FILL[variant]} />
        <path d={main} fill="none" stroke="var(--color-gold)" strokeWidth={outerStroke} />
        <path d={inner} fill="none" stroke="var(--color-gold)" strokeWidth={innerStroke} opacity={0.56} />
        <path d={scallop} fill="none" stroke="var(--color-gold)" strokeWidth={crownStroke} opacity={0.72} />

        <g transform={`translate(${w / 2}, ${rosetteY})`}>
          <circle r={3.8} fill="var(--color-gold)" opacity={0.82} />
          <circle r={2.1} fill={surface} />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle
              key={deg}
              cx={Math.cos((deg * Math.PI) / 180) * 6.1}
              cy={Math.sin((deg * Math.PI) / 180) * 6.1}
              r={1.3}
              fill="var(--color-gold)"
              opacity={0.48}
            />
          ))}
        </g>

        {variant === 'hero' && (
          <>
            <CornerBotanical variant="hero" side="left" />
            <CornerBotanical variant="hero" side="right" />
          </>
        )}

        {variant === 'featured' && (
          <>
            <CornerBotanical variant="featured" side="left" />
            <CornerBotanical variant="featured" side="right" />
          </>
        )}

      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `url(#${clipId})`,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: BELLY_TOP[variant],
            left: BELLY_INSET[variant],
            right: BELLY_INSET[variant],
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default ArchCard
