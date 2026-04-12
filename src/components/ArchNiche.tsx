import { type CSSProperties, type ReactNode } from 'react'

type Tint = 'cream' | 'blush' | 'powder' | 'butter' | 'lilac' | 'sage'
type Variant = 'title' | 'hero' | 'section' | 'card'
export type ArchShape = 'architectural' | 'stationery' | 'hybrid'

interface Props {
  children: ReactNode
  style?: CSSProperties
  className?: string
  onClick?: () => void
  emphasis?: boolean
  tint?: Tint
  variant?: Variant
  shape?: ArchShape
}

const ARCHES: Record<ArchShape, { outer: string; band: string; inner: string }> = {
  architectural: {
    outer: 'M 104 788 Q 110 652 140 566 Q 170 482 228 438 Q 252 308 338 192 C 360 146 380 106 400 62 C 420 106 440 146 462 192 Q 548 308 572 438 Q 630 482 660 566 Q 690 652 696 788 Z',
    band: 'M 122 770 Q 128 656 154 582 Q 180 506 234 468 Q 256 346 338 246 C 360 204 380 166 400 126 C 420 166 440 204 462 246 Q 544 346 566 468 Q 620 506 646 582 Q 672 656 678 770 Z',
    inner: 'M 142 750 Q 148 658 170 596 Q 194 530 242 496 Q 262 384 338 300 C 360 262 380 226 400 186 C 420 226 440 262 462 300 Q 538 384 558 496 Q 606 530 630 596 Q 652 658 658 750 Z',
  },
  stationery: {
    outer: 'M 84 788 Q 90 666 120 590 Q 152 516 218 472 Q 244 362 324 272 C 350 232 374 194 400 150 C 426 194 450 232 476 272 Q 556 362 582 472 Q 648 516 680 590 Q 710 666 716 788 Z',
    band: 'M 102 770 Q 108 670 132 606 Q 158 540 224 500 Q 248 396 324 318 C 350 284 374 248 400 210 C 426 248 450 284 476 318 Q 552 396 576 500 Q 642 540 668 606 Q 692 670 698 770 Z',
    inner: 'M 122 750 Q 128 672 148 618 Q 172 562 232 528 Q 254 430 326 360 C 352 330 376 298 400 266 C 424 298 448 330 474 360 Q 546 430 568 528 Q 628 562 652 618 Q 672 672 678 750 Z',
  },
  hybrid: {
    outer: 'M 94 788 Q 100 658 130 578 Q 162 498 222 452 Q 248 334 332 232 C 356 188 378 148 400 104 C 422 148 444 188 468 232 Q 552 334 578 452 Q 638 498 670 578 Q 700 658 706 788 Z',
    band: 'M 112 770 Q 118 662 142 594 Q 168 524 228 480 Q 252 372 332 282 C 356 242 378 206 400 166 C 422 206 444 242 468 282 Q 548 372 572 480 Q 632 524 658 594 Q 682 662 688 770 Z',
    inner: 'M 132 750 Q 138 664 160 608 Q 182 548 236 508 Q 258 408 334 332 C 358 298 378 266 400 230 C 422 266 442 298 466 332 Q 542 408 564 508 Q 618 548 640 608 Q 662 664 668 750 Z',
  },
}

const TINTS: Record<Tint, { surface: string; band: string; outline: string; frame: string; inner: string; trace: string }> = {
  cream: { surface: '#fbf6f0', band: '#f1e7da', outline: '#a9978d', frame: '#c7b79d', inner: '#e3d8c9', trace: '#c2c8b5' },
  blush: { surface: '#faf1ed', band: '#f1e2db', outline: '#a9978d', frame: '#c7b79d', inner: '#e2d8cb', trace: '#c1c9b8' },
  powder: { surface: '#f0f4f5', band: '#e3eaed', outline: '#a79a96', frame: '#bbc5cb', inner: '#e2e7e8', trace: '#c0c8c7' },
  butter: { surface: '#f5eed8', band: '#ece1bd', outline: '#ae9a84', frame: '#cdbf9f', inner: '#e7dec9', trace: '#c4c8ae' },
  lilac: { surface: '#f2edf3', band: '#e6dfea', outline: '#a89da4', frame: '#cbc1d2', inner: '#e2dae3', trace: '#c3c8bf' },
  sage: { surface: '#edf3ec', band: '#dfe8dc', outline: '#a69b90', frame: '#bec8b8', inner: '#dde4da', trace: '#b7c3b0' },
}

const VARIANTS: Record<Variant, { lineOpacity: number }> = {
  hero: { lineOpacity: 0.28 },
  title: { lineOpacity: 0.24 },
  section: { lineOpacity: 0.2 },
  card: { lineOpacity: 0.18 },
}

export default function ArchNiche({
  children,
  style,
  className,
  onClick,
  emphasis,
  tint = 'blush',
  variant = 'section',
  shape = 'hybrid',
}: Props) {
  const palette = TINTS[tint]
  const metrics = VARIANTS[variant]
  const arch = ARCHES[shape]

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: emphasis ? 'translateY(-1px)' : undefined,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 800 800"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <path d={arch.outer} fill={palette.band} opacity="0.98" />
        <path d={arch.inner} fill={palette.surface} opacity="0.98" />
        <path d={arch.outer} stroke={palette.outline} strokeWidth="4.05" fill="none" opacity="0.6" strokeLinejoin="round" />
        <path d={arch.band} stroke={palette.frame} strokeWidth="1.8" fill="none" opacity="0.48" strokeLinejoin="round" />
        <path d={arch.inner} stroke={palette.inner} strokeWidth="1.55" fill="none" opacity="0.66" strokeLinejoin="round" />
        <line x1="48" y1="750" x2="752" y2="750" stroke={palette.frame} strokeWidth="1.45" opacity="0.3" />
        <line x1="62" y1="760" x2="738" y2="760" stroke={palette.outline} strokeWidth="0.85" opacity="0.16" />
        <path d={arch.band} stroke={palette.trace} strokeWidth="0.95" fill="none" opacity={metrics.lineOpacity * 0.72} strokeLinejoin="round" />
      </svg>

      <div style={{ position: 'relative', zIndex: 4 }}>{children}</div>
    </div>
  )
}
