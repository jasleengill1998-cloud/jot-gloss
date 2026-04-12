/**
 * CHINOISERIE WALLPAPER — Dense, multi-color, botanically precise.
 *
 * De Gournay / Gracie hand-painted panel style:
 * - Continuous branching tree with bark texture
 * - Dense leaf coverage: elongated, veined, alternating angles
 * - Detailed flowers at branch junctions (identifiable petals, stamens, layers)
 * - Multi-color: warm taupe branches, sage leaves, coral/rose flowers, gold accents
 * - NO group opacity wrapper — each element controls its own visibility
 * - Elements must be IDENTIFIABLE at rendered size: petals, veins, stamens all visible
 */

/* ═══ PALETTE — SOFT PASTELS, watercolor-on-silk feel ═══ */
const branch = '#C8A898'      // warm taupe
const branchLight = '#D4BAA8' // softer taupe for twigs
const leafBody = '#A3B18A'    // soft sage green
const leafHighlight = '#B8C8A0' // lighter sage for light side
const leafShadow = '#90A878'  // medium sage for shadow side
const leafVein = '#88A070'    // slightly deeper sage for veins
const leafEdge = '#98B088'    // sage green for leaf outline
const petalOuter = '#F0B8C0'  // soft blush coral
const petalMid = '#F0C8D0'    // rose pink
const petalInner = '#F0D0D8'  // pale blush for inner ring
const stamen = '#D8C098'      // soft gold for centers/stamens
const stamenDark = '#C8B088'  // muted gold for stamen dots
const budColor = '#E8B0B8'    // soft bud pink

/* ═══ LEAF — organically shaped, asymmetric, visibly veined, lush ═══ */
function Leaf({ cx, cy, size = 32, angle = 0, opacity = 0.55, flip = false }: {
  cx: number; cy: number; size?: number; angle?: number; opacity?: number; flip?: boolean
}) {
  const s = size / 28
  const sc = flip ? -1 : 1
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle}) scale(${sc * s},${s})`} opacity={opacity}>
      {/* Leaf body — asymmetric, organic, slightly curved midrib */}
      <path d="M 0,14 C 2,13 5,9 5.5,3 C 6,-2 5.5,-7 4,-10.5 C 3,-12.5 1.5,-14 0,-14.5 C -1.2,-14 -2.8,-12 -4,-9.5 C -5.5,-6 -6,-1 -5.5,4 C -5,9 -2.5,13 0,14 Z"
        fill={leafBody} stroke={leafEdge} strokeWidth="0.3" />
      {/* Light side highlight — right half, brighter */}
      <path d="M 0.5,12 C 2,11 4.5,7 5,2 C 5.5,-3 5,-7 3.5,-10 C 2.5,-12 1,-13.5 0,-14 C 0,-12 1,-8 1.5,-3 C 2,3 1,9 0.5,12 Z"
        fill={leafHighlight} opacity="0.45" />
      {/* Shadow side — left half, darker */}
      <path d="M -0.5,12 C -2,11 -4.5,7 -5,3 C -5.5,-1 -5,-5 -3.5,-9 C -2.5,-11 -1,-13 0,-14 C 0,-12 -0.5,-8 -0.8,-3 C -1,3 -0.8,9 -0.5,12 Z"
        fill={leafShadow} opacity="0.3" />
      {/* Central vein — slightly curved, not perfectly straight */}
      <path d="M 0,14 C 0.2,10 0.3,5 0.1,0 C 0,-5 -0.1,-10 0,-14"
        stroke={leafVein} strokeWidth="0.7" fill="none" opacity="0.8" strokeLinecap="round" />
      {/* Side veins — 5 pairs, curving outward like real leaf venation */}
      <path d="M 0.2,10 C 1.5,9 3,7.5 4.5,7" stroke={leafVein} strokeWidth="0.3" fill="none" opacity="0.5" />
      <path d="M 0,10 C -1.5,9 -3,7.5 -4.2,7.5" stroke={leafVein} strokeWidth="0.3" fill="none" opacity="0.5" />
      <path d="M 0.2,6 C 1.8,5 3.5,3.5 5,3" stroke={leafVein} strokeWidth="0.3" fill="none" opacity="0.45" />
      <path d="M 0,6 C -1.8,5 -3.5,3.5 -4.8,3.5" stroke={leafVein} strokeWidth="0.3" fill="none" opacity="0.45" />
      <path d="M 0.1,2 C 1.5,1 3.5,-1 4.8,-1.5" stroke={leafVein} strokeWidth="0.25" fill="none" opacity="0.4" />
      <path d="M 0,2 C -1.5,1 -3.5,-1 -4.5,-1" stroke={leafVein} strokeWidth="0.25" fill="none" opacity="0.4" />
      <path d="M 0.1,-2 C 1.2,-3 3,-5 4,-6" stroke={leafVein} strokeWidth="0.2" fill="none" opacity="0.35" />
      <path d="M 0,-2 C -1.2,-3 -3,-5 -3.8,-5.5" stroke={leafVein} strokeWidth="0.2" fill="none" opacity="0.35" />
      <path d="M 0,-6 C 1,-7 2.5,-9 3,-10" stroke={leafVein} strokeWidth="0.18" fill="none" opacity="0.3" />
      <path d="M 0,-6 C -1,-7 -2,-8.5 -2.8,-9" stroke={leafVein} strokeWidth="0.18" fill="none" opacity="0.3" />
      {/* Fine tertiary veins branching off secondary veins */}
      <path d="M 2.5,8 C 3,7.2 3.8,7 4.2,7.3" stroke={leafVein} strokeWidth="0.12" fill="none" opacity="0.2" />
      <path d="M -2.5,8 C -3,7.2 -3.5,7 -4,7.3" stroke={leafVein} strokeWidth="0.12" fill="none" opacity="0.2" />
      <path d="M 3,4 C 3.5,3 4.2,2.5 4.8,2.8" stroke={leafVein} strokeWidth="0.12" fill="none" opacity="0.18" />
      <path d="M -3,4 C -3.5,3 -4,2.5 -4.5,3" stroke={leafVein} strokeWidth="0.12" fill="none" opacity="0.18" />
      {/* Leaf tip drip point */}
      <path d="M 0,-14 C 0.2,-14.8 0,-15.5 -0.1,-14.5" stroke={leafEdge} strokeWidth="0.2" fill="none" opacity="0.4" />
    </g>
  )
}

/* ═══ FLOWER — multi-layer, identifiable petals, visible stamens ═══ */
function Flower({ cx, cy, size = 30, angle = 0, opacity = 0.55 }: {
  cx: number; cy: number; size?: number; angle?: number; opacity?: number
}) {
  const s = size / 24
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle}) scale(${s})`} opacity={opacity}>
      {/* Outer petals — 5, each a distinct rounded shape */}
      {[0, 72, 144, 216, 288].map((a, i) => (
        <g key={`o${i}`} transform={`rotate(${a})`}>
          <path d="M 0,0 C -3,-2 -4.5,-6 -3.5,-10 C -2.5,-13 0,-14 0,-14 C 0,-14 2.5,-13 3.5,-10 C 4.5,-6 3,-2 0,0 Z"
            fill={petalOuter} stroke={petalMid} strokeWidth="0.4" />
        </g>
      ))}
      {/* Middle petals — 5, offset, slightly smaller */}
      {[36, 108, 180, 252, 324].map((a, i) => (
        <g key={`m${i}`} transform={`rotate(${a})`}>
          <path d="M 0,0 C -2,-1.5 -3,-4 -2.5,-7 C -2,-9 0,-10 0,-10 C 0,-10 2,-9 2.5,-7 C 3,-4 2,-1.5 0,0 Z"
            fill={petalMid} stroke={petalInner} strokeWidth="0.3" />
        </g>
      ))}
      {/* Inner petals — 5, tight */}
      {[18, 90, 162, 234, 306].map((a, i) => (
        <g key={`i${i}`} transform={`rotate(${a})`}>
          <path d="M 0,0 C -1,-1 -1.5,-2.5 -1,-4.5 C -0.5,-5.5 0,-6 0,-6 C 0,-6 0.5,-5.5 1,-4.5 C 1.5,-2.5 1,-1 0,0 Z"
            fill={petalInner} />
        </g>
      ))}
      {/* Stamen ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
        const r = 2.5
        const x = r * Math.cos(a * Math.PI / 180)
        const y = r * Math.sin(a * Math.PI / 180)
        return <circle key={`s${i}`} cx={x} cy={y} r="0.7" fill={stamenDark} opacity="0.8" />
      })}
      {/* Center pistil */}
      <circle r="2.2" fill={stamen} />
      <circle r="1.2" fill={stamenDark} opacity="0.6" />
    </g>
  )
}

/* ═══ SMALL FLOWER — 5-petal simpler version ═══ */
function SmallFlower({ cx, cy, size = 18, angle = 0, opacity = 0.5 }: {
  cx: number; cy: number; size?: number; angle?: number; opacity?: number
}) {
  const s = size / 14
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle}) scale(${s})`} opacity={opacity}>
      {[0, 72, 144, 216, 288].map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path d="M 0,0 C -2,-1 -3,-3.5 -2,-6.5 C -1,-8 0,-8.5 0,-8.5 C 0,-8.5 1,-8 2,-6.5 C 3,-3.5 2,-1 0,0 Z"
            fill={petalOuter} stroke={petalMid} strokeWidth="0.3" />
        </g>
      ))}
      {[36, 108, 180, 252, 324].map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path d="M 0,0 C -1,-0.8 -1.5,-2.5 -1,-4.5 C -0.5,-5.5 0,-6 0,-6 C 0,-6 0.5,-5.5 1,-4.5 C 1.5,-2.5 1,-0.8 0,0 Z"
            fill={petalMid} />
        </g>
      ))}
      <circle r="1.8" fill={stamen} />
      <circle r="0.9" fill={stamenDark} opacity="0.6" />
    </g>
  )
}

/* ═══ BUD — half-open, visible sepals ═══ */
function Bud({ cx, cy, size = 12, angle = 0, opacity = 0.5 }: {
  cx: number; cy: number; size?: number; angle?: number; opacity?: number
}) {
  const s = size / 10
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle}) scale(${s})`} opacity={opacity}>
      <path d="M 0,4 C 3,2 4,-2 2.5,-6 C 1.5,-8 0,-9 0,-9" fill={budColor} />
      <path d="M 0,4 C -3,2 -4,-2 -2.5,-6 C -1.5,-8 0,-9 0,-9" fill={petalOuter} opacity="0.85" />
      <path d="M 0,2 C 1.5,0 2,-3 1,-6 C 0.5,-7.5 0,-8 0,-8" fill={petalMid} opacity="0.7" />
      <path d="M -2,4 C -3,1 -2.5,-2 -1.5,-4" stroke={leafBody} strokeWidth="0.7" fill="none" opacity="0.8" />
      <path d="M 2,4 C 3,1 2.5,-2 1.5,-4" stroke={leafBody} strokeWidth="0.7" fill="none" opacity="0.8" />
      <line x1="0" y1="4" x2="0" y2="8" stroke={branchLight} strokeWidth="0.6" opacity="0.5" />
    </g>
  )
}

/* ═══ LEAF PAIR — two leaves on short stem ═══ */
function LeafPair({ cx, cy, angle = 0, size = 28, opacity = 0.55 }: {
  cx: number; cy: number; angle?: number; size?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      <Leaf cx={-5} cy={-4} size={size} angle={-35} opacity={opacity} />
      <Leaf cx={5} cy={-4} size={size * 0.85} angle={35} opacity={opacity * 0.9} flip />
      <line x1="0" y1="8" x2="0" y2="-1" stroke={branchLight} strokeWidth="0.7" opacity={opacity * 0.6} />
    </g>
  )
}


export default function ChinoiserieBackground() {
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      viewBox="0 0 900 1400"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      fill="none"
    >
      {/* NO group opacity wrapper — each element has its own direct opacity */}

      {/* ═══════════════════════════════════════════════════════
          BRANCH SYSTEM — elegant, thin, intricate
          Main vine with many fine sub-branches, tendrils, and twiglets
          ═══════════════════════════════════════════════════════ */}

      {/* Main vine — thin, graceful S-curve */}
      <path d="M -30,1350 C 60,1280 120,1180 160,1060 C 200,940 210,840 250,720
               C 290,600 350,500 420,400 C 490,300 560,240 650,180
               C 740,120 820,80 920,50"
        stroke={branch} strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />

      {/* Sub-branch 1 — lower left, with fine twigs */}
      <path d="M 160,1060 C 120,1020 80,1000 30,990 C -10,982 -40,990 -30,1010"
        stroke={branch} strokeWidth="1.8" strokeLinecap="round" opacity="0.18" />
      <path d="M 80,1000 C 60,970 50,940 55,920"
        stroke={branchLight} strokeWidth="1" strokeLinecap="round" opacity="0.15" />
      {/* Fine twiglets off sub-branch 1 */}
      <path d="M 55,990 C 40,978 28,972 20,975" stroke={branchLight} strokeWidth="0.6" strokeLinecap="round" opacity="0.12" />
      <path d="M 110,1030 C 95,1015 85,1005 80,1008" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      {/* Tendril curl */}
      <path d="M -30,1010 C -35,1005 -38,1010 -35,1015 C -32,1020 -36,1022 -40,1018" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" fill="none" />

      {/* Sub-branch 2 — mid right, with fine detail */}
      <path d="M 250,720 C 310,700 380,710 450,740 C 520,770 560,790 600,780"
        stroke={branch} strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
      <path d="M 450,740 C 470,710 480,680 475,650"
        stroke={branchLight} strokeWidth="0.9" strokeLinecap="round" opacity="0.15" />
      <path d="M 600,780 C 620,770 640,740 650,710"
        stroke={branchLight} strokeWidth="0.8" strokeLinecap="round" opacity="0.13" />
      {/* Fine twiglets */}
      <path d="M 340,708 C 330,695 325,685 328,678" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.11" />
      <path d="M 500,762 C 510,750 515,738 510,730" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 560,785 C 570,795 582,800 590,795" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" />
      {/* Tendril */}
      <path d="M 650,710 C 655,700 660,705 657,712 C 654,718 660,720 665,715" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" fill="none" />

      {/* Sub-branch 3 — upper left, with intricate sub-twigs */}
      <path d="M 420,400 C 370,380 310,390 260,420 C 210,450 170,470 140,460"
        stroke={branch} strokeWidth="1.5" strokeLinecap="round" opacity="0.18" />
      <path d="M 310,390 C 290,360 280,330 285,300"
        stroke={branchLight} strokeWidth="0.8" strokeLinecap="round" opacity="0.14" />
      <path d="M 140,460 C 120,450 100,430 90,410"
        stroke={branchLight} strokeWidth="0.7" strokeLinecap="round" opacity="0.12" />
      {/* Fine twiglets */}
      <path d="M 260,420 C 248,408 240,398 242,390" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 195,455 C 185,442 178,432 180,425" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" />
      <path d="M 350,388 C 345,375 338,368 340,362" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      {/* Tendril */}
      <path d="M 90,410 C 85,405 80,408 82,415 C 84,420 78,422 75,418" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" fill="none" />

      {/* Sub-branch 4 — upper right, fine */}
      <path d="M 650,180 C 680,200 720,240 740,290 C 760,340 755,370 740,390"
        stroke={branch} strokeWidth="1.3" strokeLinecap="round" opacity="0.17" />
      <path d="M 740,290 C 770,300 800,290 820,270"
        stroke={branchLight} strokeWidth="0.7" strokeLinecap="round" opacity="0.13" />
      {/* Fine twiglets */}
      <path d="M 700,225 C 690,215 685,205 688,198" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 750,340 C 762,335 770,325 768,318" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" />
      <path d="M 720,250 C 730,242 738,238 735,230" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" />
      {/* Tendril */}
      <path d="M 820,270 C 825,265 830,268 828,275 C 826,280 832,282 835,278" stroke={branchLight} strokeWidth="0.35" strokeLinecap="round" opacity="0.09" fill="none" />

      {/* Sub-branch 5 — lower right */}
      <path d="M 210,840 C 280,860 360,890 430,870 C 500,850 540,820 550,800"
        stroke={branch} strokeWidth="1.2" strokeLinecap="round" opacity="0.17" />
      {/* Fine twiglets */}
      <path d="M 330,882 C 340,895 348,900 345,908" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 480,855 C 490,845 498,838 495,830" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" />
      {/* Tendril */}
      <path d="M 550,800 C 555,795 560,798 558,805 C 556,810 562,812 565,808" stroke={branchLight} strokeWidth="0.35" strokeLinecap="round" opacity="0.09" fill="none" />

      {/* Sub-branch 6 — top wispy tendrils */}
      <path d="M 820,80 C 850,60 880,30 900,10"
        stroke={branchLight} strokeWidth="0.9" strokeLinecap="round" opacity="0.12" />
      <path d="M 650,180 C 620,150 600,120 610,90"
        stroke={branchLight} strokeWidth="0.8" strokeLinecap="round" opacity="0.12" />
      <path d="M 610,90 C 605,80 608,70 615,65" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.09" />

      {/* Additional fine connecting twigs along main vine for intricacy */}
      <path d="M 100,1220 C 85,1210 75,1200 78,1190" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 185,960 C 195,950 200,938 196,930" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 270,660 C 258,648 250,640 253,632" stroke={branchLight} strokeWidth="0.5" strokeLinecap="round" opacity="0.1" />
      <path d="M 340,520 C 350,508 355,498 352,490" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.1" />
      <path d="M 470,340 C 478,328 482,318 478,310" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.09" />
      <path d="M 570,240 C 565,228 560,220 563,212" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.09" />
      <path d="M 780,100 C 790,92 795,82 790,75" stroke={branchLight} strokeWidth="0.4" strokeLinecap="round" opacity="0.08" />


      {/* ═══════════════════════════════════════════════════════
          FLOWERS — detailed, at branch junctions
          ═══════════════════════════════════════════════════════ */}

      <Flower cx={250} cy={720} size={34} opacity={0.6} />
      <Flower cx={420} cy={400} size={30} angle={15} opacity={0.55} />
      <Flower cx={160} cy={1060} size={28} angle={-10} opacity={0.55} />
      <SmallFlower cx={740} cy={390} size={22} angle={20} opacity={0.5} />
      <Flower cx={430} cy={870} size={26} angle={-15} opacity={0.5} />
      <SmallFlower cx={650} cy={180} size={20} angle={10} opacity={0.48} />
      <SmallFlower cx={475} cy={650} size={18} angle={-20} opacity={0.45} />
      <SmallFlower cx={140} cy={460} size={19} angle={5} opacity={0.45} />


      {/* ═══════════════════════════════════════════════════════
          BUDS — at branch tips
          ═══════════════════════════════════════════════════════ */}

      <Bud cx={55} cy={920} size={13} angle={-30} opacity={0.5} />
      <Bud cx={285} cy={300} size={12} angle={-15} opacity={0.48} />
      <Bud cx={820} cy={270} size={11} angle={25} opacity={0.45} />
      <Bud cx={610} cy={90} size={10} angle={-10} opacity={0.42} />
      <Bud cx={-30} cy={1010} size={12} angle={-40} opacity={0.45} />
      <Bud cx={650} cy={710} size={11} angle={20} opacity={0.42} />
      <Bud cx={550} cy={800} size={12} angle={10} opacity={0.45} />
      <Bud cx={90} cy={410} size={11} angle={-25} opacity={0.45} />
      <Bud cx={900} cy={50} size={10} angle={15} opacity={0.38} />


      {/* ═══════════════════════════════════════════════════════
          LEAVES — dense coverage, every branch
          Direct opacity per leaf (no parent multiplier)
          ═══════════════════════════════════════════════════════ */}

      {/* === MAIN TRUNK (bottom to top) === */}
      <Leaf cx={40} cy={1300} size={36} angle={-50} opacity={0.6} />
      <Leaf cx={80} cy={1250} size={32} angle={40} opacity={0.58} flip />
      <LeafPair cx={110} cy={1180} angle={-30} size={28} opacity={0.58} />
      <Leaf cx={140} cy={1120} size={34} angle={50} opacity={0.55} flip />
      <Leaf cx={170} cy={1040} size={30} angle={-45} opacity={0.55} />
      <LeafPair cx={195} cy={960} angle={35} size={26} opacity={0.52} />
      <Leaf cx={220} cy={880} size={32} angle={-55} opacity={0.52} />
      <Leaf cx={235} cy={800} size={28} angle={40} opacity={0.52} flip />
      <LeafPair cx={260} cy={680} angle={-35} size={26} opacity={0.5} />
      <Leaf cx={290} cy={620} size={30} angle={50} opacity={0.5} flip />
      <Leaf cx={320} cy={560} size={26} angle={-45} opacity={0.5} />
      <LeafPair cx={360} cy={480} angle={40} size={24} opacity={0.48} />
      <Leaf cx={400} cy={430} size={28} angle={-50} opacity={0.48} />
      <Leaf cx={450} cy={370} size={26} angle={45} opacity={0.48} flip />
      <LeafPair cx={500} cy={320} angle={-35} size={24} opacity={0.45} />
      <Leaf cx={550} cy={270} size={26} angle={50} opacity={0.45} flip />
      <Leaf cx={600} cy={220} size={24} angle={-45} opacity={0.45} />
      <LeafPair cx={680} cy={160} angle={40} size={22} opacity={0.42} />
      <Leaf cx={740} cy={120} size={24} angle={-40} opacity={0.42} />
      <Leaf cx={800} cy={85} size={22} angle={35} opacity={0.4} flip />

      {/* === SUB-BRANCH 1 (lower left) === */}
      <Leaf cx={120} cy={1040} size={26} angle={-60} opacity={0.52} />
      <Leaf cx={80} cy={1010} size={24} angle={45} opacity={0.5} flip />
      <Leaf cx={40} cy={998} size={26} angle={-35} opacity={0.5} />
      <LeafPair cx={10} cy={995} angle={-50} size={22} opacity={0.48} />
      <Leaf cx={60} cy={960} size={22} angle={-40} opacity={0.5} />
      <Leaf cx={50} cy={930} size={20} angle={30} opacity={0.48} flip />

      {/* === SUB-BRANCH 2 (mid right) === */}
      <Leaf cx={310} cy={705} size={26} angle={30} opacity={0.5} flip />
      <LeafPair cx={370} cy={715} angle={-20} size={24} opacity={0.5} />
      <Leaf cx={420} cy={730} size={26} angle={40} opacity={0.48} flip />
      <Leaf cx={480} cy={750} size={24} angle={-35} opacity={0.48} />
      <LeafPair cx={530} cy={770} angle={25} size={22} opacity={0.45} />
      <Leaf cx={570} cy={785} size={24} angle={-40} opacity={0.45} />
      <Leaf cx={460} cy={695} size={22} angle={-50} opacity={0.45} />
      <Leaf cx={470} cy={665} size={20} angle={35} opacity={0.42} flip />
      <Leaf cx={630} cy={760} size={22} angle={45} opacity={0.42} flip />
      <Leaf cx={645} cy={730} size={20} angle={-30} opacity={0.42} />

      {/* === SUB-BRANCH 3 (upper left) === */}
      <Leaf cx={380} cy={385} size={24} angle={-40} opacity={0.48} />
      <LeafPair cx={340} cy={390} angle={30} size={22} opacity={0.48} />
      <Leaf cx={290} cy={405} size={26} angle={45} opacity={0.45} flip />
      <Leaf cx={240} cy={430} size={24} angle={-50} opacity={0.45} />
      <LeafPair cx={195} cy={455} angle={-35} size={22} opacity={0.45} />
      <Leaf cx={160} cy={465} size={22} angle={40} opacity={0.42} flip />
      <Leaf cx={300} cy={350} size={20} angle={-40} opacity={0.45} />
      <Leaf cx={290} cy={320} size={18} angle={30} opacity={0.42} flip />
      <Leaf cx={110} cy={440} size={20} angle={-30} opacity={0.42} />
      <Leaf cx={95} cy={420} size={18} angle={25} opacity={0.4} flip />

      {/* === SUB-BRANCH 4 (upper right) === */}
      <Leaf cx={680} cy={200} size={22} angle={35} opacity={0.45} flip />
      <Leaf cx={710} cy={240} size={24} angle={-40} opacity={0.45} />
      <LeafPair cx={730} cy={290} angle={30} size={20} opacity={0.45} />
      <Leaf cx={750} cy={340} size={22} angle={-35} opacity={0.42} />
      <Leaf cx={745} cy={370} size={20} angle={40} opacity={0.42} flip />
      <Leaf cx={770} cy={300} size={18} angle={25} opacity={0.4} flip />
      <Leaf cx={800} cy={280} size={20} angle={-30} opacity={0.4} />

      {/* === SUB-BRANCH 5 (lower right) === */}
      <Leaf cx={260} cy={850} size={24} angle={35} opacity={0.5} flip />
      <LeafPair cx={320} cy={870} angle={-25} size={22} opacity={0.48} />
      <Leaf cx={380} cy={885} size={24} angle={40} opacity={0.45} flip />
      <Leaf cx={460} cy={860} size={22} angle={-35} opacity={0.45} />
      <LeafPair cx={510} cy={840} angle={30} size={20} opacity={0.42} />
      <Leaf cx={540} cy={810} size={22} angle={-40} opacity={0.42} />

      {/* === FILL LEAVES — negative space density === */}
      <Leaf cx={150} cy={780} size={20} angle={-55} opacity={0.35} />
      <Leaf cx={180} cy={650} size={18} angle={40} opacity={0.32} flip />
      <Leaf cx={350} cy={550} size={20} angle={-45} opacity={0.35} />
      <Leaf cx={500} cy={450} size={18} angle={35} opacity={0.32} flip />
      <Leaf cx={580} cy={350} size={18} angle={-50} opacity={0.32} />
      <Leaf cx={700} cy={450} size={16} angle={40} opacity={0.3} flip />
      <Leaf cx={100} cy={1150} size={20} angle={50} opacity={0.35} flip />
      <Leaf cx={30} cy={1100} size={18} angle={-40} opacity={0.32} />
      <Leaf cx={400} cy={650} size={18} angle={-35} opacity={0.32} />
      <Leaf cx={350} cy={750} size={16} angle={45} opacity={0.3} flip />
      <Leaf cx={620} cy={600} size={16} angle={-40} opacity={0.3} />
      <Leaf cx={550} cy={500} size={18} angle={35} opacity={0.32} flip />
      <Leaf cx={850} cy={150} size={18} angle={-30} opacity={0.32} />
      <Leaf cx={860} cy={100} size={16} angle={25} opacity={0.3} flip />

    </svg>
  )
}
