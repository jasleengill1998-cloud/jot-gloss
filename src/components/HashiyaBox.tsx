/**
 * HashiyaBox — Ornate Mughal manuscript-style bordered frame.
 *
 * Inspired by traditional hashiya (margin decoration) patterns:
 * - Scrolling vine stems with multi-petal flowers (pink + blue)
 * - Proper teardrop leaves flanking stems
 * - Gold vesica-piscis rosettes at intervals
 * - Corner flower clusters
 * - Triple gold rule + bead dot border
 * - Side vine accents
 *
 * DO NOT reduce opacity below stated values. Ornaments must be VISIBLE and RICH.
 */
import type { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
  style?: CSSProperties
  className?: string
}

/* ═══ PALETTE — pastel translation of Mughal gold/blue/pink ═══ */
const gold = '#B8956A'
const goldMid = '#C8A878'
const goldLight = '#D4BC98'
const parchment = '#FFF4F2'

/* Floral — visible pastels with strokes like the reference */
const pinkPetal = '#F0C0C8'
const pinkStroke = '#D4A0A8'
const bluePetal = '#A8C8F0'
const blueStroke = '#88A8C8'
const lilacPetal = '#D0C0E0'
const lilacStroke = '#B0A0C0'
const peachPetal = '#F0D0C0'
const coralCenter = '#D89898'
const goldCenter = '#C8A878'
const sage = '#98C0A0'
const leafGreen = '#88B890'
const leafStroke = '#78A880'
const vine = '#80A880'
const vineLight = '#98B8A0'

/* ═══ REUSABLE FLOWER COMPONENTS ═══ */

/** 5-petal flower — like reference miniFloral. Proper petals with visible strokes. */
function PinkFlower({ cx, cy, scale = 1, opacity = 0.8 }: {
  cx: number; cy: number; scale?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity={opacity}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="0" cy="-5" rx="2.8" ry="5.5"
          fill={pinkPetal} stroke={pinkStroke} strokeWidth="0.5"
          transform={`rotate(${a})`} />
      ))}
      <circle r="2.5" fill={coralCenter} stroke={pinkStroke} strokeWidth="0.3" />
      <circle r="1" fill="#fff" opacity="0.4" />
    </g>
  )
}

/** 4-petal blue flower — like reference miniBlueFlower */
function BlueFlower({ cx, cy, scale = 1, opacity = 0.75 }: {
  cx: number; cy: number; scale?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity={opacity}>
      {[0, 90, 180, 270].map(a => (
        <ellipse key={a} cx="0" cy="-4.5" rx="2.5" ry="5"
          fill={bluePetal} stroke={blueStroke} strokeWidth="0.5"
          transform={`rotate(${a})`} />
      ))}
      <circle r="2.2" fill={goldCenter} stroke={blueStroke} strokeWidth="0.3" />
      <circle r="0.8" fill="#fff" opacity="0.35" />
    </g>
  )
}

/** Lilac flower — 6 petals for variety */
function LilacFlower({ cx, cy, scale = 1, opacity = 0.7 }: {
  cx: number; cy: number; scale?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity={opacity}>
      {[0, 60, 120, 180, 240, 300].map(a => (
        <ellipse key={a} cx="0" cy="-4" rx="2.2" ry="4.5"
          fill={lilacPetal} stroke={lilacStroke} strokeWidth="0.4"
          transform={`rotate(${a})`} />
      ))}
      <circle r="2" fill={coralCenter} stroke={lilacStroke} strokeWidth="0.3" opacity="0.8" />
      <circle r="0.7" fill="#fff" opacity="0.3" />
    </g>
  )
}

/** Teardrop leaf — like reference leaf shapes */
function Leaf({ cx, cy, rot = 0, scale = 1, variant = 0 }: {
  cx: number; cy: number; rot?: number; scale?: number; variant?: number
}) {
  const fill = variant % 2 === 0 ? sage : leafGreen
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rot}) scale(${scale})`}>
      <path d="M 0,6 C 3,3 4,0 2,-5 C 1,-7.5 0,-8 0,-8 C 0,-8 -1,-7.5 -2,-5 C -4,0 -3,3 0,6 Z"
        fill={fill} stroke={leafStroke} strokeWidth="0.4" opacity="0.65" />
      {/* Central vein */}
      <line x1="0" y1="5" x2="0" y2="-6" stroke={leafStroke} strokeWidth="0.25" opacity="0.35" />
    </g>
  )
}

/** Bud — small unopened flower */
function Bud({ cx, cy, rot = 0, color = pinkPetal }: {
  cx: number; cy: number; rot?: number; color?: string
}) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rot})`} opacity="0.7">
      <ellipse cx="0" cy="-3" rx="1.5" ry="3.5" fill={color} stroke={pinkStroke} strokeWidth="0.3" />
      <ellipse cx="0.5" cy="-2" rx="0.8" ry="2.5" fill={peachPetal} opacity="0.5" />
      <path d="M -1,-5 C -0.5,-6.5 0.5,-6.5 1,-5" stroke={leafStroke} strokeWidth="0.4" fill="none" opacity="0.5" />
    </g>
  )
}

/** Gold rosette — small flower/star motif between vine flowers */
function GoldRosette({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity="0.5">
      {/* 6-petal flower */}
      {[0, 60, 120, 180, 240, 300].map(a => (
        <ellipse key={a} cx="0" cy="-3" rx="1" ry="3"
          fill={gold} opacity="0.45" transform={`rotate(${a})`} />
      ))}
      <circle r="1.8" fill={goldMid} opacity="0.4" />
    </g>
  )
}

/* ═══ FLORAL BAND — rich scrolling vine with flowers ═══
 * 50px tall, full vine with multi-petal flowers, leaves, rosettes.
 * Inspired by mughal_floral_border_pattern.svg */
function FloralBand({ mirror = false, id = 'top' }: { mirror?: boolean; id?: string }) {
  return (
    <svg
      width="100%"
      height="60"
      viewBox="0 0 800 50"
      preserveAspectRatio="none"
      style={{ display: 'block', transform: mirror ? 'scaleY(-1)' : undefined }}
      aria-hidden="true"
    >
      {/* Bead dots along edges — no straight ruling lines */}
      {Array.from({ length: 40 }, (_, i) => (
        <g key={`bd${id}${i}`}>
          <circle cx={10 + i * 20} cy="4.5" r="0.8" fill={gold} opacity="0.35" />
          <circle cx={10 + i * 20} cy="45.5" r="0.8" fill={gold} opacity="0.35" />
        </g>
      ))}

      {/* Main scrolling vine — dual-line like reference */}
      <path
        d="M 0,26 C 40,16 80,34 120,22 C 160,10 200,36 240,24 C 280,12 320,34 360,22 C 400,10 440,36 480,24 C 520,12 560,34 600,22 C 640,10 680,34 720,22 C 760,14 790,26 800,24"
        stroke={vine} strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round"
      />
      <path
        d="M 0,28 C 40,20 80,38 120,26 C 160,14 200,40 240,28 C 280,16 320,38 360,26 C 400,14 440,40 480,28 C 520,16 560,38 600,26 C 640,14 680,38 720,26 C 760,18 790,30 800,28"
        stroke={vineLight} strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round"
      />

      {/* ── FLOWERS along vine ── */}
      <PinkFlower cx={80} cy={30} scale={0.85} />
      <BlueFlower cx={200} cy={20} scale={0.75} />
      <PinkFlower cx={320} cy={30} scale={0.9} />
      <LilacFlower cx={440} cy={18} scale={0.7} />
      <PinkFlower cx={560} cy={30} scale={0.85} />
      <BlueFlower cx={680} cy={20} scale={0.75} />

      {/* ── GOLD ROSETTES between flowers ── */}
      <GoldRosette cx={140} cy={25} scale={0.65} />
      <GoldRosette cx={260} cy={25} scale={0.55} />
      <GoldRosette cx={380} cy={25} scale={0.65} />
      <GoldRosette cx={500} cy={25} scale={0.55} />
      <GoldRosette cx={620} cy={25} scale={0.65} />
      <GoldRosette cx={740} cy={25} scale={0.55} />

      {/* ── BUDS ── */}
      <Bud cx={40} cy={24} rot={-15} />
      <Bud cx={160} cy={22} rot={10} color={bluePetal} />
      <Bud cx={280} cy={28} rot={-10} />
      <Bud cx={400} cy={14} rot={15} color={lilacPetal} />
      <Bud cx={520} cy={28} rot={-12} />
      <Bud cx={640} cy={16} rot={8} color={bluePetal} />
      <Bud cx={760} cy={24} rot={-8} />

      {/* ── LEAVES — in pairs flanking stems ── */}
      {[
        { cx: 55, cy: 28, rot: -35 }, { cx: 65, cy: 32, rot: 25 },
        { cx: 105, cy: 32, rot: 30 }, { cx: 95, cy: 28, rot: -25 },
        { cx: 175, cy: 22, rot: -30 }, { cx: 185, cy: 18, rot: 35 },
        { cx: 225, cy: 18, rot: 25 }, { cx: 215, cy: 22, rot: -35 },
        { cx: 295, cy: 28, rot: -40 }, { cx: 305, cy: 32, rot: 30 },
        { cx: 345, cy: 32, rot: 25 }, { cx: 335, cy: 28, rot: -30 },
        { cx: 415, cy: 20, rot: -25 }, { cx: 425, cy: 16, rot: 35 },
        { cx: 465, cy: 16, rot: 30 }, { cx: 455, cy: 20, rot: -35 },
        { cx: 535, cy: 28, rot: -35 }, { cx: 545, cy: 32, rot: 25 },
        { cx: 585, cy: 32, rot: 30 }, { cx: 575, cy: 28, rot: -25 },
        { cx: 655, cy: 22, rot: -30 }, { cx: 665, cy: 18, rot: 35 },
        { cx: 705, cy: 18, rot: 25 }, { cx: 695, cy: 22, rot: -35 },
        { cx: 735, cy: 26, rot: -20 }, { cx: 775, cy: 22, rot: 20 },
      ].map((l, i) => (
        <Leaf key={`lf${id}${i}`} cx={l.cx} cy={l.cy} rot={l.rot} scale={0.5} variant={i} />
      ))}

      {/* Small stem connections from vine to flowers */}
      {[
        { x1: 65, y1: 28, x2: 80, y2: 30 },
        { x1: 185, y1: 23, x2: 200, y2: 20 },
        { x1: 305, y1: 28, x2: 320, y2: 30 },
        { x1: 425, y1: 21, x2: 440, y2: 18 },
        { x1: 545, y1: 28, x2: 560, y2: 30 },
        { x1: 665, y1: 23, x2: 680, y2: 20 },
      ].map((s, i) => (
        <path key={`st${id}${i}`}
          d={`M ${s.x1},${s.y1} C ${(s.x1 + s.x2) / 2},${s.y1 - 3} ${(s.x1 + s.x2) / 2},${s.y2 + 3} ${s.x2},${s.y2}`}
          stroke={vine} strokeWidth="0.8" fill="none" opacity="0.4" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/* ═══ SIDE VINE — vertical ornamental border ═══
 * Narrow vine strip for left/right edges */
function SideVine({ side }: { side: 'left' | 'right' }) {
  const flip = side === 'right'
  return (
    <svg
      width="40"
      height="100%"
      viewBox="0 0 30 400"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        [side]: 4,
        top: 60,
        bottom: 60,
        transform: flip ? 'scaleX(-1)' : undefined,
        pointerEvents: 'none',
        zIndex: 3,
      }}
      aria-hidden="true"
    >
      {/* Vertical vine */}
      <path d="M 16,0 C 12,30 20,60 14,90 C 8,120 20,150 16,180 C 12,210 20,240 14,270 C 8,300 20,330 16,360 C 14,380 16,400 16,400"
        stroke={vine} strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />

      {/* Small flowers along vine */}
      <g transform="translate(15,60) scale(0.4)" opacity="0.65">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-4" rx="2" ry="4.5"
            fill={pinkPetal} stroke={pinkStroke} strokeWidth="0.5" transform={`rotate(${a})`} />
        ))}
        <circle r="1.8" fill={coralCenter} opacity="0.7" />
      </g>

      <g transform="translate(13,180) scale(0.35)" opacity="0.6">
        {[0, 90, 180, 270].map(a => (
          <ellipse key={a} cx="0" cy="-3.5" rx="1.8" ry="4"
            fill={bluePetal} stroke={blueStroke} strokeWidth="0.5" transform={`rotate(${a})`} />
        ))}
        <circle r="1.5" fill={goldCenter} opacity="0.65" />
      </g>

      <g transform="translate(16,300) scale(0.35)" opacity="0.6">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-4" rx="2" ry="4.5"
            fill={lilacPetal} stroke={lilacStroke} strokeWidth="0.5" transform={`rotate(${a})`} />
        ))}
        <circle r="1.8" fill={coralCenter} opacity="0.65" />
      </g>

      {/* Leaves */}
      {[
        { cy: 30, rot: -25 }, { cy: 100, rot: 30 }, { cy: 140, rot: -35 },
        { cy: 220, rot: 25 }, { cy: 260, rot: -30 }, { cy: 340, rot: 35 },
        { cy: 380, rot: -20 },
      ].map((l, i) => (
        <Leaf key={i} cx={14 + (i % 2) * 4} cy={l.cy} rot={l.rot} scale={0.35} variant={i} />
      ))}

      {/* Buds */}
      <Bud cx={16} cy={120} rot={-10} color={peachPetal} />
      <Bud cx={14} cy={240} rot={15} color={bluePetal} />
      <Bud cx={15} cy={360} rot={-5} color={pinkPetal} />
    </svg>
  )
}

/* ═══ CORNER CLUSTER — multi-flower corner ornament ═══
 * Inspired by reference corner flourishes with 2-3 flowers + leaves */
function CornerCluster({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isRight = position.includes('r')
  const isBottom = position.includes('b')
  return (
    <svg width="64" height="64" viewBox="0 0 44 44" aria-hidden="true"
      style={{
        position: 'absolute',
        [isRight ? 'right' : 'left']: 0,
        [isBottom ? 'bottom' : 'top']: 0,
        transform: `${isRight ? 'scaleX(-1)' : ''} ${isBottom ? 'scaleY(-1)' : ''}`.trim() || undefined,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Vine tendrils extending along edges — connects to side vines */}
      <path d="M 5,42 C 5,34 6,26 8,18 C 9,14 10,10 14,6"
        stroke={vine} strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M 14,6 C 20,4 28,3 36,4 C 40,5 42,6 42,8"
        stroke={vine} strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round" />

      {/* Main flower at corner intersection */}
      <g transform="translate(14,14) scale(0.6)" opacity="0.85">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-5" rx="2.8" ry="5.5"
            fill={pinkPetal} stroke={pinkStroke} strokeWidth="0.5" transform={`rotate(${a})`} />
        ))}
        <circle r="2.5" fill={coralCenter} stroke={pinkStroke} strokeWidth="0.3" />
        <circle r="1" fill="#fff" opacity="0.4" />
      </g>

      {/* Secondary blue flower along horizontal vine */}
      <g transform="translate(30,8) scale(0.4)" opacity="0.7">
        {[0, 90, 180, 270].map(a => (
          <ellipse key={a} cx="0" cy="-4" rx="2.2" ry="4.5"
            fill={bluePetal} stroke={blueStroke} strokeWidth="0.5" transform={`rotate(${a})`} />
        ))}
        <circle r="1.8" fill={goldCenter} opacity="0.7" />
      </g>

      {/* Small flower along vertical vine */}
      <g transform="translate(8,30) scale(0.35)" opacity="0.65">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-4" rx="2" ry="4.5"
            fill={lilacPetal} stroke={lilacStroke} strokeWidth="0.5" transform={`rotate(${a})`} />
        ))}
        <circle r="1.8" fill={coralCenter} opacity="0.65" />
      </g>

      {/* Leaves along vines */}
      <Leaf cx={10} cy={22} rot={-35} scale={0.35} variant={0} />
      <Leaf cx={6} cy={36} rot={-45} scale={0.3} variant={1} />
      <Leaf cx={22} cy={10} rot={30} scale={0.32} variant={0} />
      <Leaf cx={36} cy={6} rot={15} scale={0.28} variant={1} />
      <Leaf cx={18} cy={18} rot={-20} scale={0.25} variant={0} />

      {/* Buds */}
      <Bud cx={38} cy={10} rot={20} color={peachPetal} />
      <Bud cx={6} cy={40} rot={-15} color={pinkPetal} />
    </svg>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function HashiyaBox({ children, title, subtitle, style, className }: Props) {
  return (
    <div
      className={className || ''}
      style={{
        position: 'relative',
        background: parchment,
        overflow: 'hidden',
        /* Triple gold border — outer solid, mid dotted, inner solid */
        border: `2.5px solid ${gold}`,
        boxShadow: `inset 0 0 0 4px ${parchment}, inset 0 0 0 5px ${goldMid}`,
        ...style,
      }}
    >
      {/* Bead dot border — inside the gold rules */}
      <div style={{
        position: 'absolute',
        inset: 8,
        border: `1px dashed ${goldLight}`,
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 1,
        borderRadius: 0,
      }} />

      {/* Inner hashiya border */}
      <div style={{
        position: 'absolute',
        inset: 12,
        border: `0.8px solid ${goldMid}`,
        opacity: 0.35,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Corner flower clusters */}
      <CornerCluster position="tl" />
      <CornerCluster position="tr" />
      <CornerCluster position="bl" />
      <CornerCluster position="br" />

      {/* Side vine borders */}
      <SideVine side="left" />
      <SideVine side="right" />

      {/* Top floral band */}
      <FloralBand id="top" />

      {/* Content area — inset past the side vines */}
      <div style={{ position: 'relative', zIndex: 2, padding: '8px 52px 0' }}>
        {title && (
          <div style={{
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: `1px solid ${goldLight}40`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            {/* Small rosette before title */}
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flexShrink: 0 }}>
              <g transform="translate(7,7)" opacity="0.5">
                <path d="M -5,0 C -2,-3.5 2,-3.5 5,0 C 2,3.5 -2,3.5 -5,0 Z"
                  fill="none" stroke={gold} strokeWidth="0.6" />
                <circle r="1.2" fill={goldMid} opacity="0.6" />
              </g>
            </svg>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: '#5A3E4B',
            }}>
              {title}
            </span>
            {subtitle && (
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 11,
                fontStyle: 'italic',
                color: '#C88FA0',
              }}>
                {subtitle}
              </span>
            )}
            <div style={{
              flex: 1,
              height: 0.5,
              background: `linear-gradient(90deg, ${goldLight}50, transparent)`,
            }} />
            {/* Trailing rosette */}
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flexShrink: 0 }}>
              <g transform="translate(7,7)" opacity="0.4">
                <path d="M -5,0 C -2,-3.5 2,-3.5 5,0 C 2,3.5 -2,3.5 -5,0 Z"
                  fill="none" stroke={gold} strokeWidth="0.6" />
                <circle r="1" fill={goldMid} opacity="0.5" />
              </g>
            </svg>
          </div>
        )}
        {children}
      </div>

      {/* Bottom floral band */}
      <FloralBand mirror id="btm" />
    </div>
  )
}
