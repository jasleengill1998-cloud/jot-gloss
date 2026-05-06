/**
 * JOT GLOSS LOGO — Ornate botanical bookplate with rose bloom.
 * Warm pastel rose motif with JG monogram, gold border, floral crown.
 * Charming and feminine — feels like a personal ex-libris stamp.
 */

interface Props {
  size?: number
}

export default function BookplateLogo({ size = 48 }: Props) {
  const s = size / 80
  const w = 80 * s
  const h = 90 * s

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: w,
      height: h,
    }}>
      <svg width={w} height={h} viewBox="0 0 80 90" aria-label="Jot Gloss" role="img">

        {/* Outer gold oval border — double rule with warmth */}
        <ellipse cx="40" cy="45" rx="37" ry="41"
          stroke="#C8A878" strokeWidth="1.5" fill="none" opacity="0.6" />
        <ellipse cx="40" cy="45" rx="34" ry="38"
          stroke="#D4BC98" strokeWidth="0.7" fill="none" opacity="0.4" />

        {/* Warm parchment fill */}
        <ellipse cx="40" cy="45" rx="32" ry="36"
          fill="#FFF4F0" opacity="0.95" />
        <ellipse cx="40" cy="45" rx="32" ry="36"
          fill="#FFE8EE" opacity="0.3" />

        {/* Floral crown above monogram — heraldic stamp-rose with leaf sprigs */}
        <g transform="translate(40,22)">
          {/* Outer rose: five almond petals around the heart, stroked so the
              silhouette reads as a flower instead of a cluster of dots. */}
          <g>
            {[0, 72, 144, 216, 288].map(a => (
              <path
                key={`petal-${a}`}
                d="M 0 0 C -2.4 -1.6, -2.6 -5, 0 -6.4 C 2.6 -5, 2.4 -1.6, 0 0 Z"
                fill="#E8A8B8"
                stroke="#C97C8A"
                strokeWidth="0.45"
                strokeLinejoin="round"
                opacity="0.92"
                transform={`rotate(${a})`}
              />
            ))}
          </g>

          {/* Inner ring offset 36° — gives the rose layered depth without
              relying on dozens of confetti ellipses. */}
          <g>
            {[36, 108, 180, 252, 324].map(a => (
              <path
                key={`inner-${a}`}
                d="M 0 0 C -1.5 -1, -1.6 -3.4, 0 -4.2 C 1.6 -3.4, 1.5 -1, 0 0 Z"
                fill="#FFD0D8"
                stroke="#C97C8A"
                strokeWidth="0.35"
                strokeLinejoin="round"
                opacity="0.85"
                transform={`rotate(${a})`}
              />
            ))}
          </g>

          {/* Heart of the rose: a coral button with a small highlight. */}
          <circle r="1.4" fill="#C97C8A" />
          <circle r="0.6" cy="-0.2" fill="#FFD0D8" opacity="0.85" />

          {/* Leaf sprigs flanking the rose. Each leaf has a centre vein and
              a curving stem — readable down to 32px instead of dissolving
              into dots like the old forget-me-nots. */}
          {[
            { x: -7, sign: -1, leafRot: -28 },
            { x: 7,  sign: 1,  leafRot: 28 },
          ].map(({ x, sign, leafRot }) => (
            <g key={`sprig-${x}`} opacity="0.78">
              <path
                d={`M ${0.6 * sign} 0.2 C ${3 * sign} -0.6, ${5 * sign} -2.2, ${x} ${-2}`}
                stroke="#6E9A78"
                strokeWidth="0.55"
                fill="none"
                strokeLinecap="round"
              />
              <g transform={`translate(${x} -2) rotate(${leafRot})`}>
                <path
                  d="M 0 0 C -1.4 -1.4, -1.4 -3.6, 0 -4.4 C 1.4 -3.6, 1.4 -1.4, 0 0 Z"
                  fill="#9CC4A0"
                  stroke="#6E9A78"
                  strokeWidth="0.35"
                  strokeLinejoin="round"
                />
                <line
                  x1="0" y1="-0.2" x2="0" y2="-4"
                  stroke="#6E9A78" strokeWidth="0.3" opacity="0.55"
                />
              </g>
            </g>
          ))}
        </g>

        {/* JG monogram — elegant serif, warm plum */}
        <text x="40" y="48" textAnchor="middle" dominantBaseline="central"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="26" fontWeight="700" fill="#5A3E4B" letterSpacing="0.06em"
          style={{ fontStyle: 'italic' }}>
          JG
        </text>

        {/* Ornamental fillet below monogram — diamond centre + hairline rules
            with chevron flicks at the ends, echoing DiamondDivider. The old
            three-circle pattern read as confetti at small sizes. */}
        <g transform="translate(40,62)" opacity="0.55">
          <line x1="-12" y1="0" x2="-3" y2="0" stroke="#C8A878" strokeWidth="0.5" />
          <line x1="12"  y1="0" x2="3"  y2="0" stroke="#C8A878" strokeWidth="0.5" />
          <path d="M 0 -2 L 2 0 L 0 2 L -2 0 Z" fill="#C8A878" />
          <path d="M 0 -2 L 2 0 L 0 2 L -2 0 Z" fill="none"
            stroke="#5A3E4B" strokeWidth="0.3" opacity="0.45" />
          <path d="M -13 -1.2 L -12 0 L -13 1.2"
            stroke="#C8A878" strokeWidth="0.5" fill="none"
            strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 13 -1.2 L 12 0 L 13 1.2"
            stroke="#C8A878" strokeWidth="0.5" fill="none"
            strokeLinejoin="round" strokeLinecap="round" />
        </g>

        {/* Tiny label */}
        <text x="40" y="72" textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="4.5" fontWeight="600" fill="#5A3E4B" letterSpacing="0.22em"
          opacity="0.35">
          JOT GLOSS
        </text>

      </svg>
    </div>
  )
}
