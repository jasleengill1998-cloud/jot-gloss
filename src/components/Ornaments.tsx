/**
 * ORNAMENT SYSTEM — Structured, Visible, Historically-Informed
 *
 * Rose (#E8B8C0) primary, Mint (#A8D8B8) / Coral (#E8A0B0) secondary.
 * All ornaments are symmetrical, attached to layout, purposeful.
 * Opacity 0.30-0.55 — ornaments must be VISIBLE and RICH, not ghosted.
 * DO NOT reduce opacity below 0.25 on ANY element. Linter: leave these alone.
 */

/** Rosette — structured lotus medallion */
export function Rosette({ size = 16, color = '#E8B8C0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="0.5" opacity="0.35" fill="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <path key={angle}
          d={`M10 10 Q${10 + 2.2 * Math.cos((angle - 14) * Math.PI / 180)} ${10 + 2.2 * Math.sin((angle - 14) * Math.PI / 180)} ${10 + 5.5 * Math.cos(angle * Math.PI / 180)} ${10 + 5.5 * Math.sin(angle * Math.PI / 180)} Q${10 + 2.2 * Math.cos((angle + 14) * Math.PI / 180)} ${10 + 2.2 * Math.sin((angle + 14) * Math.PI / 180)} 10 10 Z`}
          fill={color} opacity={0.35 + (i % 2) * 0.08} />
      ))}
      <circle cx="10" cy="10" r="2" fill={color} opacity="0.4" />
      <circle cx="10" cy="10" r="0.8" fill={color} opacity="0.3" />
    </svg>
  )
}

/** ArchDivider — rose scalloped divider with center medallion */
export function ArchDivider({ color = '#E8B8C0', width = '60%' }: { color?: string; width?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '18px auto', width }}>
      <svg width="100%" height="16" viewBox="0 0 240 16" preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none">
        <path d="M0 8 Q10 4 20 8 Q30 12 40 8 Q50 4 60 8 Q70 12 80 8 Q90 4 100 8 L110 8"
              stroke={color} strokeWidth="0.6" opacity="0.4" strokeLinecap="round" />
        <g transform="translate(120, 8)">
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <path key={angle}
              d={`M0 0 Q${1.2 * Math.cos((angle - 20) * Math.PI / 180)} ${1.2 * Math.sin((angle - 20) * Math.PI / 180)} ${3.5 * Math.cos(angle * Math.PI / 180)} ${3.5 * Math.sin(angle * Math.PI / 180)} Q${1.2 * Math.cos((angle + 20) * Math.PI / 180)} ${1.2 * Math.sin((angle + 20) * Math.PI / 180)} 0 0 Z`}
              fill={color} opacity={0.32 + (i % 2) * 0.08} />
          ))}
          <circle cx="0" cy="0" r="1.2" fill={color} opacity="0.38" />
        </g>
        <path d="M130 8 Q140 4 150 8 Q160 12 170 8 Q180 4 190 8 Q200 12 210 8 Q220 4 230 8 L240 8"
              stroke={color} strokeWidth="0.6" opacity="0.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** MughalCorner — cusped corner for framing */
export function MughalCorner({ size = 36, color = '#E8B8C0', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className={className} aria-hidden="true" fill="none">
      <path d="M2 48 L2 18 Q2 8 8 4 Q14 2 20 2 L48 2" stroke={color} strokeWidth="0.8" opacity="0.45" strokeLinecap="round" />
      <path d="M6 44 L6 20 Q6 12 12 8 Q16 6 20 6 L44 6" stroke={color} strokeWidth="0.4" opacity="0.3" strokeLinecap="round" />
      {[0, 90, 180, 270].map(angle => (
        <path key={angle} transform={`rotate(${angle}, 8, 8)`}
          d="M8 8 Q9 5 8 3 Q7 5 8 8 Z" fill={color} opacity="0.3" />
      ))}
      <circle cx="8" cy="8" r="1.2" fill={color} opacity="0.35" />
    </svg>
  )
}

/** FloralConnector — structured vine divider with rose + mint, center medallion */
export function FloralConnector({ color = '#E8B8C0' }: { color?: string }) {
  const sage = '#A8D8B8'
  const coral = '#E8A0B0'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '28px 0' }}>
      <svg width="100%" height="28" viewBox="0 0 400 28" preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
           style={{ maxWidth: 500 }}>
        {/* Left vine */}
        <path d="M0 14 Q25 7 50 14 Q75 21 100 14 Q125 7 150 14 Q175 21 195 14"
              stroke={color} strokeWidth="0.6" opacity="0.4" strokeLinecap="round" />
        {/* Left leaves — structured pairs */}
        {[50, 100, 150].map((x, i) => (
          <g key={x} opacity="0.35">
            <path d={`M${x} 14 Q${x - 4} ${i % 2 === 0 ? 8 : 20} ${x - 8} ${i % 2 === 0 ? 9 : 19}`}
                  stroke={sage} strokeWidth="0.5" strokeLinecap="round" />
            <path d={`M${x - 8} ${i % 2 === 0 ? 9 : 19} Q${x - 9.5} ${i % 2 === 0 ? 8 : 20} ${x - 8.5} ${i % 2 === 0 ? 11 : 17} Z`}
                  fill={sage} opacity="0.6" />
            <path d={`M${x} 14 Q${x + 4} ${i % 2 === 0 ? 20 : 8} ${x + 8} ${i % 2 === 0 ? 19 : 9}`}
                  stroke={sage} strokeWidth="0.5" strokeLinecap="round" />
            <path d={`M${x + 8} ${i % 2 === 0 ? 19 : 9} Q${x + 9.5} ${i % 2 === 0 ? 20 : 8} ${x + 8.5} ${i % 2 === 0 ? 17 : 11} Z`}
                  fill={sage} opacity="0.6" />
          </g>
        ))}

        {/* Center medallion — prominent, structured */}
        <g transform="translate(200, 14)">
          <circle cx="0" cy="0" r="9" stroke={color} strokeWidth="0.6" opacity="0.35" />
          <circle cx="0" cy="0" r="6.5" stroke={color} strokeWidth="0.35" opacity="0.25" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <path key={angle}
              d={`M0 0 Q${1.5 * Math.cos((angle - 13) * Math.PI / 180)} ${1.5 * Math.sin((angle - 13) * Math.PI / 180)} ${4.5 * Math.cos(angle * Math.PI / 180)} ${4.5 * Math.sin(angle * Math.PI / 180)} Q${1.5 * Math.cos((angle + 13) * Math.PI / 180)} ${1.5 * Math.sin((angle + 13) * Math.PI / 180)} 0 0 Z`}
              fill={i % 2 === 0 ? color : coral} opacity={0.30 + (i % 3) * 0.05} />
          ))}
          <circle cx="0" cy="0" r="1.8" fill={color} opacity="0.35" />
        </g>

        {/* Right vine */}
        <path d="M205 14 Q230 7 255 14 Q280 21 305 14 Q330 7 355 14 Q380 21 400 14"
              stroke={color} strokeWidth="0.6" opacity="0.4" strokeLinecap="round" />
        {/* Right leaves */}
        {[255, 305, 355].map((x, i) => (
          <g key={x} opacity="0.35">
            <path d={`M${x} 14 Q${x - 4} ${i % 2 === 0 ? 8 : 20} ${x - 8} ${i % 2 === 0 ? 9 : 19}`}
                  stroke={sage} strokeWidth="0.5" strokeLinecap="round" />
            <path d={`M${x - 8} ${i % 2 === 0 ? 9 : 19} Q${x - 9.5} ${i % 2 === 0 ? 8 : 20} ${x - 8.5} ${i % 2 === 0 ? 11 : 17} Z`}
                  fill={sage} opacity="0.6" />
            <path d={`M${x} 14 Q${x + 4} ${i % 2 === 0 ? 20 : 8} ${x + 8} ${i % 2 === 0 ? 19 : 9}`}
                  stroke={sage} strokeWidth="0.5" strokeLinecap="round" />
            <path d={`M${x + 8} ${i % 2 === 0 ? 19 : 9} Q${x + 9.5} ${i % 2 === 0 ? 20 : 8} ${x + 8.5} ${i % 2 === 0 ? 17 : 11} Z`}
                  fill={sage} opacity="0.6" />
          </g>
        ))}
      </svg>
    </div>
  )
}

/** ShelfCap — cusped heading accent */
export function ShelfCap({ color = '#E8B8C0' }: { color?: string }) {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true" fill="none" style={{ flexShrink: 0, marginRight: 6 }}>
      {/* Multi-cusped Mughal arch cap */}
      <path d="M1 10 Q1 7 4 5.5 Q4 3.5 7 2.5 Q8.5 0.5 10 0 Q11.5 0.5 13 2.5 Q16 3.5 16 5.5 Q19 7 19 10" stroke={color} strokeWidth="0.6" opacity="0.3" strokeLinecap="round" />
      <path d="M3 8.5 Q3 6.5 5.5 5 Q5.5 3.5 8 2.8 Q9.5 1.5 10 1 Q10.5 1.5 12 2.8 Q14.5 3.5 14.5 5 Q17 6.5 17 8.5" stroke={color} strokeWidth="0.35" opacity="0.15" strokeLinecap="round" />
      <path d="M10 1.5 Q10.5 0.5 10 -0.3 Q9.5 0.5 10 1.5 Z" fill={color} opacity="0.2" />
    </svg>
  )
}

/** FloralBorder — structured running botanical border
 *  Rose vine, coral/mint blooms, visible and purposeful */
export function FloralBorder({ color = '#E8B8C0', accentColor = '#A8D8B8', goldColor = '#E8A0B0', height = 40, mirror = false }: {
  color?: string; accentColor?: string; goldColor?: string; height?: number; mirror?: boolean
}) {
  const coral = '#E8A0B0'
  return (
    <svg width="100%" height={height} viewBox="0 0 800 40" preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
         style={{ display: 'block', transform: mirror ? 'scaleY(-1)' : undefined }}>

      {/* Main vine — gold, visible */}
      <path d="M0 20 Q30 14 60 18 Q90 22 120 16 Q150 12 180 16 Q210 20 240 14 Q270 10 300 14 Q330 18 360 12 Q390 8 420 14 Q450 20 480 14 Q510 10 540 14 Q570 18 600 12 Q630 8 660 14 Q690 20 720 16 Q750 12 780 18 L800 16"
            stroke={color} strokeWidth="0.7" opacity="0.45" strokeLinecap="round" />

      {/* Bloom 1 — left, structured petals */}
      <g transform="translate(130, 15)" opacity="0.42">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <path key={a} d={`M0 0 Q${2 * Math.cos((a - 14) * Math.PI / 180)} ${2 * Math.sin((a - 14) * Math.PI / 180)} ${7.5 * Math.cos(a * Math.PI / 180)} ${7.5 * Math.sin(a * Math.PI / 180)} Q${2 * Math.cos((a + 14) * Math.PI / 180)} ${2 * Math.sin((a + 14) * Math.PI / 180)} 0 0 Z`}
            fill={i % 2 === 0 ? coral : color} opacity={0.5 + i * 0.03} />
        ))}
        <circle cx="0" cy="0" r="2.8" fill={goldColor} opacity="0.4" />
        <circle cx="0" cy="0" r="1.2" fill={goldColor} opacity="0.6" />
      </g>

      {/* Leaves around bloom 1 */}
      <g opacity="0.35">
        <path d="M108 17 Q100 12 94 10" stroke={accentColor} strokeWidth="0.6" strokeLinecap="round" />
        <path d="M94 10 Q92 9 93 12 Q94 13 94 10 Z" fill={accentColor} opacity="0.5" />
        <path d="M152 13 Q160 8 166 7" stroke={accentColor} strokeWidth="0.55" strokeLinecap="round" />
        <path d="M166 7 Q168 6 167 9 Q166 10 166 7 Z" fill={accentColor} opacity="0.5" />
      </g>

      {/* Bloom 2 — center-right */}
      <g transform="translate(500, 13)" opacity="0.38">
        {[0, 51, 103, 154, 206, 257, 309].map((a, i) => (
          <path key={a} d={`M0 0 Q${1.8 * Math.cos((a - 13) * Math.PI / 180)} ${1.8 * Math.sin((a - 13) * Math.PI / 180)} ${6.5 * Math.cos(a * Math.PI / 180)} ${6.5 * Math.sin(a * Math.PI / 180)} Q${1.8 * Math.cos((a + 13) * Math.PI / 180)} ${1.8 * Math.sin((a + 13) * Math.PI / 180)} 0 0 Z`}
            fill={i % 2 === 0 ? color : coral} opacity={0.45 + i * 0.03} />
        ))}
        <circle cx="0" cy="0" r="2.2" fill={goldColor} opacity="0.35" />
      </g>

      {/* Leaves around bloom 2 */}
      <g opacity="0.32">
        <path d="M478 14 Q470 9 464 7" stroke={accentColor} strokeWidth="0.55" strokeLinecap="round" />
        <path d="M464 7 Q462 6 463 9 Z" fill={accentColor} opacity="0.5" />
        <path d="M522 11 Q530 7 536 5" stroke={accentColor} strokeWidth="0.5" strokeLinecap="round" />
        <path d="M536 5 Q538 4 537 7 Z" fill={accentColor} opacity="0.45" />
      </g>

      {/* Small bloom — far right */}
      <g transform="translate(710, 17)" opacity="0.35">
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <path key={a} d={`M0 0 Q${1 * Math.cos((a - 18) * Math.PI / 180)} ${1 * Math.sin((a - 18) * Math.PI / 180)} ${5 * Math.cos(a * Math.PI / 180)} ${5 * Math.sin(a * Math.PI / 180)} Q${1 * Math.cos((a + 18) * Math.PI / 180)} ${1 * Math.sin((a + 18) * Math.PI / 180)} 0 0 Z`}
            fill={i % 2 === 0 ? coral : accentColor} opacity="0.5" />
        ))}
        <circle cx="0" cy="0" r="1.2" fill={goldColor} opacity="0.35" />
      </g>

      {/* Leaf pairs along vine */}
      {[50, 250, 340, 600, 750].map((x, i) => (
        <g key={x} opacity="0.30">
          <path d={`M${x} ${18 + (i % 2) * 2} Q${x - 5} ${i % 2 === 0 ? 12 : 24} ${x - 9} ${i % 2 === 0 ? 13 : 23}`} stroke={accentColor} strokeWidth="0.5" strokeLinecap="round" />
          <path d={`M${x - 9} ${i % 2 === 0 ? 13 : 23} Q${x - 10.5} ${i % 2 === 0 ? 12 : 24} ${x - 9.5} ${i % 2 === 0 ? 15 : 21} Z`} fill={accentColor} opacity="0.5" />
        </g>
      ))}

      {/* Gold dot accents */}
      {[40, 180, 320, 440, 570, 680, 770].map((x, i) => (
        <circle key={x} cx={x} cy={18 + (i % 3 - 1) * 3} r={0.6} fill={goldColor} opacity={0.25 + i * 0.01} />
      ))}
    </svg>
  )
}

/** FloralCornerCluster — structured corner ornament */
export function FloralCornerCluster({ size = 80, color = '#E8B8C0', accentColor = '#A8D8B8', goldColor = '#E8A0B0', position = 'top-left' }: {
  size?: number; color?: string; accentColor?: string; goldColor?: string; position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const transforms: Record<string, string> = {
    'top-left': '',
    'top-right': 'scaleX(-1)',
    'bottom-left': 'scaleY(-1)',
    'bottom-right': 'scale(-1,-1)',
  }
  const coral = '#E8A0B0'
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" fill="none"
         style={{ display: 'block', transform: transforms[position] }}>
      {/* Main bloom */}
      <g transform="translate(20, 20)" opacity="0.50">
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a, i) => (
          <path key={a} d={`M0 0 Q${2.5 * Math.cos((a - 14) * Math.PI / 180)} ${2.5 * Math.sin((a - 14) * Math.PI / 180)} ${10 * Math.cos(a * Math.PI / 180)} ${10 * Math.sin(a * Math.PI / 180)} Q${2.5 * Math.cos((a + 14) * Math.PI / 180)} ${2.5 * Math.sin((a + 14) * Math.PI / 180)} 0 0 Z`}
            fill={i % 2 === 0 ? coral : color} opacity={0.4 + i * 0.03} />
        ))}
        <circle cx="0" cy="0" r="3" fill={goldColor} opacity="0.35" />
        <circle cx="0" cy="0" r="1.5" fill={goldColor} opacity="0.5" />
      </g>
      {/* Secondary bud */}
      <g transform="translate(48, 48)" opacity="0.40">
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <path key={a} d={`M0 0 Q${0.8 * Math.cos((a - 18) * Math.PI / 180)} ${0.8 * Math.sin((a - 18) * Math.PI / 180)} ${4.5 * Math.cos(a * Math.PI / 180)} ${4.5 * Math.sin(a * Math.PI / 180)} Q${0.8 * Math.cos((a + 18) * Math.PI / 180)} ${0.8 * Math.sin((a + 18) * Math.PI / 180)} 0 0 Z`}
            fill={i % 2 === 0 ? color : accentColor} opacity="0.45" />
        ))}
        <circle cx="0" cy="0" r="1.3" fill={goldColor} opacity="0.3" />
      </g>
      {/* Connecting vine */}
      <path d="M28 28 Q36 34 42 42 Q46 46 48 48" stroke={color} strokeWidth="0.5" opacity="0.35" strokeLinecap="round" />
      <path d="M48 48 Q54 56 58 64 Q60 70 62 74" stroke={color} strokeWidth="0.35" opacity="0.30" strokeLinecap="round" />
      {/* Leaves */}
      <g opacity="0.32">
        <path d="M36 34 Q30 30 26 32" stroke={accentColor} strokeWidth="0.5" strokeLinecap="round" />
        <path d="M26 32 Q24 31 25 34 Z" fill={accentColor} opacity="0.5" />
        <path d="M36 34 Q40 30 44 30" stroke={accentColor} strokeWidth="0.4" strokeLinecap="round" />
        <path d="M44 30 Q46 29 45 32 Z" fill={accentColor} opacity="0.45" />
      </g>
      {/* Corner tendril */}
      <path d="M18 24 Q12 18 8 12 Q5 7 3 4" stroke={color} strokeWidth="0.4" opacity="0.30" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** JaliStrip — ornamental lattice strip */
export function JaliStrip({ color = '#E8B8C0', width = '100%' }: { color?: string; width?: string }) {
  return (
    <svg width={width} height="10" viewBox="0 0 160 10" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', opacity: 0.32 }}>
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i}>
          <path d={`M${i * 10} 5 Q${i * 10 + 2.5} ${1 + (i % 3) * 0.3} ${i * 10 + 5} 5 Q${i * 10 + 7.5} ${9 - (i % 3) * 0.3} ${i * 10 + 10} 5`}
                fill="none" stroke={color} strokeWidth={0.5} strokeLinecap="round" />
          <circle cx={i * 10 + 5} cy={5} r={0.5} fill={color} opacity="0.3" />
        </g>
      ))}
    </svg>
  )
}
