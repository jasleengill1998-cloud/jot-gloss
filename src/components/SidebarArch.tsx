/**
 * SIDEBAR ARCH — Intricate Mughal illumination-style arch frame
 * with ornate floral garland, detailed roses, forget-me-nots, and scrollwork
 */

/* ── Reusable SVG ornament fragments ── */

/** 5-petal forget-me-not with yellow center */
function ForgetMeNot({ x = 0, y = 0, scale = 1, opacity = 0.7 }: { x?: number; y?: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="0" cy="-1.8" rx="1.2" ry="1.8" fill="#EBE4F4" transform={`rotate(${a})`} />
      ))}
      <circle r="0.8" fill="#F0E0A0" opacity="0.9" />
    </g>
  )
}

/** Multi-petal rose bloom */
function Rose({ x = 0, y = 0, size = 1, opacity = 0.8 }: { x?: number; y?: number; size?: number; opacity?: number }) {
  const s = size
  return (
    <g transform={`translate(${x},${y})`} opacity={opacity}>
      {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(a => (
        <ellipse key={`o${a}`} cx="0" cy={-5 * s} rx={2.2 * s} ry={5 * s} fill="#F0C0C8" opacity="0.45" transform={`rotate(${a})`} />
      ))}
      {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map(a => (
        <ellipse key={`i${a}`} cx="0" cy={-3.5 * s} rx={1.8 * s} ry={3.5 * s} fill="#E8B0B8" opacity="0.5" transform={`rotate(${a})`} />
      ))}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <ellipse key={`c${a}`} cx="0" cy={-2.2 * s} rx={1.3 * s} ry={2.2 * s} fill="#E0A0A8" opacity="0.55" transform={`rotate(${a})`} />
      ))}
      <circle r={2.8 * s} fill="#D4A0A8" opacity="0.8" />
      <circle r={1.4 * s} fill="#C08890" opacity="0.7" />
      <circle r={0.5 * s} fill="#FFF0F0" opacity="0.5" />
    </g>
  )
}

/** Small rose with petals */
function RoseSm({ x = 0, y = 0, scale = 1, opacity = 0.7 }: { x?: number; y?: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      <path d="M 0,-3.5 C 2.5,-4 4,-2 3,0.5 C 2,2 0.5,2.5 0,2.5" fill="#F0C0C8" opacity="0.7" />
      <path d="M 0,-3.5 C -2.5,-4 -4,-2 -3,0.5 C -2,2 -0.5,2.5 0,2.5" fill="#E8B0B8" opacity="0.65" />
      <path d="M 0,-2.5 C 1.8,-3 3,-1 2,1 C 1,2 0,2.5 0,2.5" fill="#E0A8B0" opacity="0.7" />
      <path d="M 0,-2.5 C -1.8,-3 -3,-1 -2,1 C -1,2 0,2.5 0,2.5" fill="#D8A0A8" opacity="0.65" />
      <circle r="1.3" fill="#D09098" opacity="0.8" />
    </g>
  )
}

/** Leaf with midrib vein detail */
function Leaf({ x = 0, y = 0, rot = 0, scale = 1, flip = false, opacity = 0.7 }: { x?: number; y?: number; rot?: number; scale?: number; flip?: boolean; opacity?: number }) {
  const d = flip ? -1 : 1
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      <path d={`M 0,0 C ${3 * d},-2.5 ${7 * d},-7 ${5.5 * d},-10 C ${3 * d},-8.5 0,-5 0,0 Z`} fill="#9CC494" opacity="0.75" />
      <path d={`M ${0.3 * d},-0.5 L ${3 * d},-5 L ${3.8 * d},-8`} stroke="#80B078" strokeWidth="0.3" fill="none" opacity="0.5" />
      <path d={`M ${1.5 * d},-3 L ${3.5 * d},-4`} stroke="#80B078" strokeWidth="0.2" fill="none" opacity="0.35" />
      <path d={`M ${2 * d},-5 L ${4.2 * d},-6.5`} stroke="#80B078" strokeWidth="0.2" fill="none" opacity="0.35" />
    </g>
  )
}

/** Spiral tendril curl */
function Curl({ x = 0, y = 0, rot = 0, scale = 1, flip = false, opacity = 0.5 }: { x?: number; y?: number; rot?: number; scale?: number; flip?: boolean; opacity?: number }) {
  const sx = flip ? -scale : scale
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sx},${scale})`} opacity={opacity}>
      <path d="M 0,0 C 1,-2 3,-4 2,-6 C 1,-7 -0.5,-6 -0.5,-4.5 C -0.5,-3.5 0.5,-3 1,-3.5" stroke="#88B480" strokeWidth="0.4" fill="none" />
    </g>
  )
}

/** Lilac cluster */
function Lilac({ x = 0, y = 0, flip = false, opacity = 0.55 }: { x?: number; y?: number; flip?: boolean; opacity?: number }) {
  const d = flip ? -1 : 1
  return (
    <g transform={`translate(${x},${y})`} opacity={opacity}>
      <circle cx="0" cy="0" r="1.3" fill="#D0B8D8" />
      <circle cx={1.8 * d} cy="-0.8" r="1.1" fill="#C8B0D0" />
      <circle cx={-1 * d} cy="-1.5" r="1" fill="#D8C0E0" />
      <circle cx={0.5 * d} cy="-2" r="0.8" fill="#E0C8E8" />
    </g>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ARCH TOP SVG — Clean Mughal pointed arch, JG logo, draped garland
   Matches reference: smooth pointed arch, not multi-cusped
   ═══════════════════════════════════════════════════════════════ */

export function ArchTop() {
  /* Clean pointed Mughal arch — smooth curves meeting at apex */
  const outerArch = "M 4,220 L 4,110 C 4,65 30,38 70,22 Q 100,10 130,4 Q 160,10 190,22 C 230,38 256,65 256,110 L 256,220"
  const innerArch = "M 12,220 L 12,112 C 12,70 36,44 74,28 Q 102,16 130,10 Q 158,16 186,28 C 224,44 248,70 248,112 L 248,220"
  const fillArch = innerArch + " Z"

  return (
    <svg viewBox="0 0 260 220" width="100%" preserveAspectRatio="xMidYMin meet" aria-hidden="true" style={{ display: 'block' }}>
      {/* Cream fill inside arch */}
      <path d={fillArch} fill="#FFF8F2" />

      {/* Outer arch border — strong gold */}
      <path d={outerArch} stroke="#A9978D" strokeWidth="2" fill="none" opacity="0.68" />
      {/* Inner arch border */}
      <path d={innerArch} stroke="#C7B79D" strokeWidth="1.1" fill="none" opacity="0.5" />

      {/* Apex — removed teal gem */}

      {/* JG small arch frame — clean pointed arch matching outer */}
      <path d="M 88,140 L 88,82 C 88,60 100,46 130,34 C 160,46 172,60 172,82 L 172,140"
        stroke="#B8956A" strokeWidth="0.9" fill="none" opacity="0.45" />
      <path d="M 93,136 L 93,84 C 93,64 104,50 130,40 C 156,50 167,64 167,84 L 167,136"
        stroke="#C8A878" strokeWidth="0.6" fill="none" opacity="0.35" />

      {/* JG monogram — traditional serif, upright, restrained */}
      <text x="130" y="96" textAnchor="middle" dominantBaseline="central"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="30" fontWeight="400" fill="#5A3E4B" letterSpacing="0.12em"
        style={{ fontStyle: 'italic' }}>JG</text>

      {/* ── Rose at top of JG frame arch ── */}
      <g transform="translate(130,36)">
        <Rose size={0.9} />
        {/* Leaves fanning outward from rose — pointing away naturally */}
        <Leaf x={-8} y={2} rot={-160} scale={0.7} opacity={0.65} />
        <Leaf x={-12} y={4} rot={-140} scale={0.65} opacity={0.55} />
        <Leaf x={8} y={2} rot={160} scale={0.7} flip opacity={0.65} />
        <Leaf x={12} y={4} rot={140} scale={0.65} flip opacity={0.55} />
        {/* Tiny buds */}
        <ForgetMeNot x={-15} y={1} scale={0.7} opacity={0.6} />
        <ForgetMeNot x={15} y={1} scale={0.7} opacity={0.6} />
      </g>

      {/* ── Draped floral garland below JG — hangs DOWN naturally ── */}
      <g transform="translate(130,155)">
        {/* Main vine — U-shaped drape, flowers hang from it */}
        <path d="M -60,-12 C -45,-4 -25,6 -10,10 C -3,12 3,12 10,10 C 25,6 45,-4 60,-12"
          stroke="#6EA068" strokeWidth="1.3" fill="none" opacity="0.6" />
        <path d="M -54,-10 C -40,-2 -22,6 0,10 C 22,6 40,-2 54,-10"
          stroke="#88B480" strokeWidth="0.7" fill="none" opacity="0.35" />

        {/* Leaves draping DOWN from vine — pointing downward naturally */}
        {/* Left side — leaves hang down */}
        <Leaf x={-52} y={-10} rot={170} scale={0.8} opacity={0.65} />
        <Leaf x={-48} y={-8} rot={-170} scale={0.75} flip opacity={0.6} />
        <Leaf x={-40} y={-4} rot={160} scale={0.8} opacity={0.6} />
        <Leaf x={-35} y={-2} rot={-155} scale={0.75} flip opacity={0.55} />
        <Leaf x={-26} y={3} rot={170} scale={0.7} opacity={0.6} />
        <Leaf x={-20} y={5} rot={-165} scale={0.7} flip opacity={0.55} />
        <Leaf x={-12} y={8} rot={175} scale={0.65} opacity={0.55} />
        {/* Right side — mirror */}
        <Leaf x={52} y={-10} rot={-170} scale={0.8} flip opacity={0.65} />
        <Leaf x={48} y={-8} rot={170} scale={0.75} opacity={0.6} />
        <Leaf x={40} y={-4} rot={-160} scale={0.8} flip opacity={0.6} />
        <Leaf x={35} y={-2} rot={155} scale={0.75} opacity={0.55} />
        <Leaf x={26} y={3} rot={-170} scale={0.7} flip opacity={0.6} />
        <Leaf x={20} y={5} rot={165} scale={0.7} opacity={0.55} />
        <Leaf x={12} y={8} rot={-175} scale={0.65} flip opacity={0.55} />
        {/* Bottom center leaves */}
        <Leaf x={-4} y={10} rot={180} scale={0.6} opacity={0.5} />
        <Leaf x={4} y={10} rot={-180} scale={0.6} flip opacity={0.5} />

        {/* Roses sitting on the vine — facing upward/outward */}
        <Rose x={0} y={8} size={0.85} />
        <Rose x={-30} y={0} size={0.6} opacity={0.75} />
        <Rose x={30} y={0} size={0.6} opacity={0.75} />
        <RoseSm x={-50} y={-9} scale={0.75} />
        <RoseSm x={50} y={-9} scale={0.75} />

        {/* Forget-me-nots along the garland */}
        <ForgetMeNot x={-18} y={6} scale={0.85} opacity={0.65} />
        <ForgetMeNot x={18} y={6} scale={0.85} opacity={0.65} />
        <ForgetMeNot x={-42} y={-5} scale={0.8} opacity={0.6} />
        <ForgetMeNot x={42} y={-5} scale={0.8} opacity={0.6} />
        <ForgetMeNot x={-56} y={-11} scale={0.7} opacity={0.5} />
        <ForgetMeNot x={56} y={-11} scale={0.7} opacity={0.5} />
        <ForgetMeNot x={-8} y={9} scale={0.65} opacity={0.5} />
        <ForgetMeNot x={8} y={9} scale={0.65} opacity={0.5} />

        {/* Lilac clusters */}
        <Lilac x={-38} y={-3} />
        <Lilac x={38} y={-3} flip />

        {/* Spiral tendrils hanging down */}
        <Curl x={-55} y={-8} rot={160} scale={0.6} opacity={0.45} />
        <Curl x={55} y={-8} rot={-160} scale={0.6} flip opacity={0.45} />
        <Curl x={-22} y={5} rot={170} scale={0.5} opacity={0.4} />
        <Curl x={22} y={5} rot={-170} scale={0.5} flip opacity={0.4} />

        {/* Tiny berries */}
        <circle cx="-46" cy="-6" r="0.8" fill="#E0A0A8" opacity="0.5" />
        <circle cx="46" cy="-6" r="0.8" fill="#E0A0A8" opacity="0.5" />
        <circle cx="-14" cy="8" r="0.7" fill="#D0B8D8" opacity="0.45" />
        <circle cx="14" cy="8" r="0.7" fill="#D0B8D8" opacity="0.45" />
      </g>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DIAMOND DIVIDER — ornamental row between sections
   ═══════════════════════════════════════════════════════════════ */

export function DiamondDivider() {
  return (
    <div className="sidebar-diamond-divider" aria-hidden="true">
      <svg viewBox="0 0 200 20" width="100%" height="20" preserveAspectRatio="xMidYMid meet">
        <line x1="5" y1="10" x2="75" y2="10" stroke="#C7B79D" strokeWidth="0.5" opacity="0.35" />
        <line x1="125" y1="10" x2="195" y2="10" stroke="#C7B79D" strokeWidth="0.5" opacity="0.35" />
        {[85, 93, 107, 115].map(cx => (
          <g key={cx} transform={`translate(${cx},10)`} opacity="0.4">
            <rect x="-1.8" y="-1.8" width="3.6" height="3.6" fill="none" stroke="#C7B79D" strokeWidth="0.5" transform="rotate(45)" />
          </g>
        ))}
        <g transform="translate(100,10)" opacity="0.55">
          <rect x="-2.5" y="-2.5" width="5" height="5" fill="#C7B79D" opacity="0.12" stroke="#C7B79D" strokeWidth="0.6" transform="rotate(45)" />
        </g>
        <circle cx="5" cy="10" r="1" fill="#C7B79D" opacity="0.2" />
        <circle cx="195" cy="10" r="1" fill="#C7B79D" opacity="0.2" />
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ARCH BOTTOM SVG — Intricate Mughal illumination scrollwork
   ═══════════════════════════════════════════════════════════════ */

export function ArchBottom() {
  return (
    <svg viewBox="0 0 260 75" width="100%" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style={{ display: 'block' }}>
      {/* Background fill */}
      <rect x="12" y="0" width="236" height="56" fill="#FFF8F2" />
      {/* Outer border — strong, matching arch stroke */}
      <path d="M 4,0 L 4,66 L 256,66 L 256,0" stroke="#A9978D" strokeWidth="2" fill="none" opacity="0.68" strokeLinejoin="round" />
      {/* Inner border */}
      <path d="M 12,0 L 12,58 L 248,58 L 248,0" stroke="#C7B79D" strokeWidth="1.1" fill="none" opacity="0.5" strokeLinejoin="round" />

      {/* Elaborate floral scrollwork */}
      <g transform="translate(130,28)" opacity="0.8">
        {/* Central rose — full layered bloom */}
        <Rose size={1.2} />

        {/* Left S-curve vine */}
        <path d="M -14,0 C -22,-4 -30,-8 -42,-8 C -54,-8 -62,-3 -70,0 C -78,3 -86,5 -98,2"
          stroke="#6EA068" strokeWidth="1.3" fill="none" opacity="0.6" />
        <path d="M -14,3 C -22,0 -32,-4 -44,-4 C -56,-4 -64,0 -72,3 C -80,6 -88,6 -96,4"
          stroke="#88B480" strokeWidth="0.7" fill="none" opacity="0.35" />
        {/* Right S-curve vine — mirror */}
        <path d="M 14,0 C 22,-4 30,-8 42,-8 C 54,-8 62,-3 70,0 C 78,3 86,5 98,2"
          stroke="#6EA068" strokeWidth="1.3" fill="none" opacity="0.6" />
        <path d="M 14,3 C 22,0 32,-4 44,-4 C 56,-4 64,0 72,3 C 80,6 88,6 96,4"
          stroke="#88B480" strokeWidth="0.7" fill="none" opacity="0.35" />

        {/* Left leaves with midribs */}
        <Leaf x={-24} y={-5} rot={20} scale={0.8} />
        <Leaf x={-28} y={-3} rot={-15} scale={0.75} flip />
        <Leaf x={-38} y={-7} rot={10} scale={0.85} />
        <Leaf x={-42} y={-5} rot={-20} scale={0.8} flip />
        <Leaf x={-52} y={-7} rot={25} scale={0.8} />
        <Leaf x={-56} y={-5} rot={-10} scale={0.75} flip />
        <Leaf x={-66} y={-2} rot={15} scale={0.75} />
        <Leaf x={-70} y={0} rot={-20} scale={0.7} flip />
        <Leaf x={-80} y={2} rot={10} scale={0.7} />
        <Leaf x={-84} y={3} rot={-15} scale={0.65} flip />
        <Leaf x={-92} y={3} rot={5} scale={0.6} opacity={0.55} />
        {/* Right leaves — mirror */}
        <Leaf x={24} y={-5} rot={-20} scale={0.8} flip />
        <Leaf x={28} y={-3} rot={15} scale={0.75} />
        <Leaf x={38} y={-7} rot={-10} scale={0.85} flip />
        <Leaf x={42} y={-5} rot={20} scale={0.8} />
        <Leaf x={52} y={-7} rot={-25} scale={0.8} flip />
        <Leaf x={56} y={-5} rot={10} scale={0.75} />
        <Leaf x={66} y={-2} rot={-15} scale={0.75} flip />
        <Leaf x={70} y={0} rot={20} scale={0.7} />
        <Leaf x={80} y={2} rot={-10} scale={0.7} flip />
        <Leaf x={84} y={3} rot={15} scale={0.65} />
        <Leaf x={92} y={3} rot={-5} scale={0.6} flip opacity={0.55} />

        {/* Small roses along vine */}
        <RoseSm x={-35} y={-7} scale={0.75} />
        <RoseSm x={-62} y={-3} scale={0.7} opacity={0.6} />
        <RoseSm x={-88} y={3} scale={0.6} opacity={0.5} />
        <RoseSm x={35} y={-7} scale={0.75} />
        <RoseSm x={62} y={-3} scale={0.7} opacity={0.6} />
        <RoseSm x={88} y={3} scale={0.6} opacity={0.5} />

        {/* Forget-me-nots */}
        <ForgetMeNot x={-48} y={-7} scale={0.75} opacity={0.6} />
        <ForgetMeNot x={-76} y={0} scale={0.7} opacity={0.55} />
        <ForgetMeNot x={-94} y={3} scale={0.6} opacity={0.45} />
        <ForgetMeNot x={48} y={-7} scale={0.75} opacity={0.6} />
        <ForgetMeNot x={76} y={0} scale={0.7} opacity={0.55} />
        <ForgetMeNot x={94} y={3} scale={0.6} opacity={0.45} />

        {/* Spiral tendrils */}
        <Curl x={-20} y={-3} rot={20} scale={0.6} opacity={0.45} />
        <Curl x={-50} y={-5} rot={10} scale={0.55} opacity={0.4} />
        <Curl x={-78} y={1} rot={30} scale={0.5} opacity={0.35} />
        <Curl x={20} y={-3} rot={-20} scale={0.6} flip opacity={0.45} />
        <Curl x={50} y={-5} rot={-10} scale={0.55} flip opacity={0.4} />
        <Curl x={78} y={1} rot={-30} scale={0.5} flip opacity={0.35} />

        {/* Berry dots */}
        <circle cx="-30" cy="-5" r="0.7" fill="#D0B8D8" opacity="0.5" />
        <circle cx="-58" cy="-4" r="0.7" fill="#D0B8D8" opacity="0.45" />
        <circle cx="-74" cy="1" r="0.6" fill="#E0A0A8" opacity="0.4" />
        <circle cx="30" cy="-5" r="0.7" fill="#D0B8D8" opacity="0.5" />
        <circle cx="58" cy="-4" r="0.7" fill="#D0B8D8" opacity="0.45" />
        <circle cx="74" cy="1" r="0.6" fill="#E0A0A8" opacity="0.4" />
      </g>

      <g transform="translate(130,62)" opacity="0.52">
        <path d="M -22,0 C -12,-2 -8,-2 0,0 C 8,-2 12,-2 22,0" stroke="#C7B79D" strokeWidth="0.6" fill="none" />
        <text
          x="0"
          y="-4"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="7"
          fontStyle="italic"
          fill="#5A3E4B"
          letterSpacing="0.08em"
        >
          JG
        </text>
        <text
          x="0"
          y="8"
          textAnchor="middle"
          fontFamily="'Outfit', system-ui, sans-serif"
          fontSize="3.4"
          fill="#5A3E4B"
          letterSpacing="0.16em"
          opacity="0.5"
        >
          EST. MMXXVI
        </text>
      </g>
    </svg>
  )
}
