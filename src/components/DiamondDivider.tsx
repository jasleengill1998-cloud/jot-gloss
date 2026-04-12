export function DiamondDivider() {
  return (
    <svg
      viewBox="0 0 240 12"
      width="100%"
      height="12"
      className="diamond-divider"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="0" y1="6" x2="90" y2="6" stroke="#C7B79D" strokeWidth="0.7" opacity="0.6" />
      <circle cx="100" cy="6" r="1.5" fill="#C7B79D" opacity="0.5" />
      <polygon points="120,1 128,6 120,11 112,6" fill="none" stroke="#C7B79D" strokeWidth="1" />
      <polygon points="120,4 125,6 120,8 115,6" fill="#C7B79D" opacity="0.35" />
      <circle cx="140" cy="6" r="1.5" fill="#C7B79D" opacity="0.5" />
      <line x1="150" y1="6" x2="240" y2="6" stroke="#C7B79D" strokeWidth="0.7" opacity="0.6" />
    </svg>
  )
}
