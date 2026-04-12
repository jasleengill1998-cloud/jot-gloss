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

        {/* Floral crown above monogram — small rose with leaves */}
        <g transform="translate(40,22)">
          {/* Central rose bloom */}
          {[0, 60, 120, 180, 240, 300].map(a => (
            <ellipse key={`o${a}`} cx={0} cy={0} rx={2} ry={4.5}
              fill="#F0C0C8" opacity={0.6} transform={`rotate(${a}) translate(0,-2)`} />
          ))}
          {[30, 90, 150, 210, 270, 330].map(a => (
            <ellipse key={`i${a}`} cx={0} cy={0} rx={1.5} ry={3.2}
              fill="#E8A8B8" opacity={0.65} transform={`rotate(${a}) translate(0,-1.5)`} />
          ))}
          <circle r={2.2} fill="#F0849C" opacity={0.75} />
          <circle r={1} fill="#FFD0D8" opacity={0.5} />

          {/* Small leaves flanking */}
          <path d="M -7,1 C -9,-2 -8,-5 -5,-6" stroke="#88B890" strokeWidth="0.6" fill="none" opacity="0.6" />
          <ellipse cx={-7} cy={-2} rx={1.5} ry={3.5} fill="#90C898" opacity={0.45} transform="rotate(-25,-7,-2)" />
          <path d="M 7,1 C 9,-2 8,-5 5,-6" stroke="#88B890" strokeWidth="0.6" fill="none" opacity="0.6" />
          <ellipse cx={7} cy={-2} rx={1.5} ry={3.5} fill="#90C898" opacity={0.45} transform="rotate(25,7,-2)" />

          {/* Tiny forget-me-nots */}
          {[-11, 11].map(x => (
            <g key={x} transform={`translate(${x},0)`} opacity="0.5">
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx={0} cy={-0.8} rx={0.6} ry={0.9} fill="#C8B8E0" transform={`rotate(${a})`} />
              ))}
              <circle r={0.4} fill="#F0E0A0" opacity={0.8} />
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

        {/* Ornamental flourish below monogram */}
        <g transform="translate(40,62)" opacity="0.4">
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#C8A878" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="1.2" fill="#C8A878" />
          <circle cx="-8" cy="0" r="0.6" fill="#C8A878" opacity="0.7" />
          <circle cx="8" cy="0" r="0.6" fill="#C8A878" opacity="0.7" />
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
