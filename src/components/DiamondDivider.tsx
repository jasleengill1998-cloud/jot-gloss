export function DiamondDivider() {
  return (
    <svg
      viewBox="0 0 240 14"
      width="100%"
      height="14"
      className="diamond-divider"
      aria-hidden="true"
      focusable="false"
    >
      {/* Main horizontal rules — double line */}
      <line x1="0" y1="6.5" x2="86" y2="6.5" stroke="#C7B79D" strokeWidth="0.6" opacity="0.5" />
      <line x1="0" y1="7.5" x2="86" y2="7.5" stroke="#C7B79D" strokeWidth="0.3" opacity="0.35" />
      <line x1="154" y1="6.5" x2="240" y2="6.5" stroke="#C7B79D" strokeWidth="0.6" opacity="0.5" />
      <line x1="154" y1="7.5" x2="240" y2="7.5" stroke="#C7B79D" strokeWidth="0.3" opacity="0.35" />

      {/* Small ornamental dots flanking the diamond */}
      <circle cx="90" cy="7" r="0.8" fill="#C7B79D" opacity="0.45" />
      <circle cx="94" cy="7" r="0.5" fill="#C7B79D" opacity="0.35" />
      <circle cx="146" cy="7" r="0.5" fill="#C7B79D" opacity="0.35" />
      <circle cx="150" cy="7" r="0.8" fill="#C7B79D" opacity="0.45" />

      {/* Outer diamond — larger frame */}
      <polygon points="120,1 130,7 120,13 110,7" fill="none" stroke="#C7B79D" strokeWidth="0.8" opacity="0.55" />

      {/* Inner diamond — filled accent */}
      <polygon points="120,3.5 126,7 120,10.5 114,7" fill="#C7B79D" opacity="0.2" />

      {/* Tiny center diamond */}
      <polygon points="120,5 122.5,7 120,9 117.5,7" fill="#C7B79D" opacity="0.45" />

      {/* Small petal accents at cardinal points */}
      <ellipse cx="120" cy="0.5" rx="1.2" ry="0.6" fill="#C7B79D" opacity="0.25" />
      <ellipse cx="120" cy="13.5" rx="1.2" ry="0.6" fill="#C7B79D" opacity="0.25" />
      <ellipse cx="108.5" cy="7" rx="0.6" ry="1.2" fill="#C7B79D" opacity="0.2" />
      <ellipse cx="131.5" cy="7" rx="0.6" ry="1.2" fill="#C7B79D" opacity="0.2" />
    </svg>
  )
}
