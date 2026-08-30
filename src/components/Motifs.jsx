// Decorative, Indian-inspired geometric motifs used as subtle accents
// throughout the site — rangoli medallions, corner ornaments and dot
// borders. All are pure inline SVG (no external assets) so they inherit
// currentColor and scale cleanly at any size.

/** A small mandala/rangoli-style medallion built from rotated petals. */
export function RangoliMedallion({ className = '', petals = 12, ...props }) {
  const angles = Array.from({ length: petals }, (_, i) => (360 / petals) * i)
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" {...props}>
      <circle cx="100" cy="100" r="98" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      {angles.map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          <path
            d="M100 100 C 108 70, 108 40, 100 18 C 92 40, 92 70, 100 100 Z"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="0.75"
          />
        </g>
      ))}
      <circle cx="100" cy="100" r="34" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="100" cy="100" r="20" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="100" cy="100" r="6" fill="currentColor" fillOpacity="0.55" />
    </svg>
  )
}

/** A quarter ornamental corner flourish, meant to sit in a card/section corner. */
export function CornerMotif({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" {...props}>
      <path d="M4 4 Q4 60 60 60 Q4 60 4 116" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.25" />
      <path d="M4 4 H40 M4 4 V40" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.25" />
      <circle cx="4" cy="4" r="3.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="60" cy="60" r="2.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

/** A repeating row of diamonds/dots used as a thin ornamental border. */
export function DotBorder({ className = '', count = 24, ...props }) {
  const items = Array.from({ length: count }, (_, i) => i)
  return (
    <svg viewBox={`0 0 ${count * 20} 20`} className={className} preserveAspectRatio="none" fill="none" {...props}>
      {items.map((i) => (
        <g key={i} transform={`translate(${i * 20 + 10} 10)`}>
          <rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="currentColor" fillOpacity={i % 3 === 0 ? 0.5 : 0.18} />
        </g>
      ))}
    </svg>
  )
}

/** Large soft background medallions used behind hero sections. */
export function HeroBackdrop({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 1200 700" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dcb24d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#dcb24d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowPurple" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9a63d1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#9a63d1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="980" cy="120" r="260" fill="url(#glowGold)" />
      <circle cx="140" cy="560" r="300" fill="url(#glowPurple)" />
      <g opacity="0.5" stroke="#dcb24d" strokeWidth="1">
        <circle cx="1040" cy="90" r="70" />
        <circle cx="1040" cy="90" r="50" />
        <circle cx="1040" cy="90" r="30" />
      </g>
      <g opacity="0.35" stroke="#e0cdf5" strokeWidth="1">
        <circle cx="90" cy="600" r="90" />
        <circle cx="90" cy="600" r="64" />
      </g>
    </svg>
  )
}

/**
 * A continuous-loop kolam border — a chain of interlacing curves threaded
 * through a row of dots, echoing the "sikku kolam" (line kolam) tradition
 * of looping a single line around a dot grid without lifting the pen.
 */
export function KolamChain({ className = '', units = 30, ...props }) {
  const items = Array.from({ length: units }, (_, i) => i)
  return (
    <svg viewBox={`0 0 ${units * 30} 30`} className={className} preserveAspectRatio="none" fill="none" {...props}>
      {items.map((i) => (
        <g key={i} transform={`translate(${i * 30} 0)`}>
          <path
            d="M0,15 C0,5 10,4 15,15 C20,4 30,5 30,15 C30,25 20,26 15,15 C10,26 0,25 0,15 Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeOpacity="0.55"
          />
        </g>
      ))}
      {Array.from({ length: units + 1 }, (_, i) => (
        <circle key={`d-${i}`} cx={i * 30} cy="15" r="2" fill="currentColor" fillOpacity="0.75" />
      ))}
    </svg>
  )
}

/**
 * A radial kolam "flower" — looped petals traced around a ring of dots,
 * distinct from the wide-petalled RangoliMedallion above. Used as a large,
 * low-opacity watermark or a small standalone ornament.
 */
export function KolamMedallion({ className = '', loops = 8, ...props }) {
  const angles = Array.from({ length: loops }, (_, i) => (360 / loops) * i)
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" {...props}>
      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />
      {angles.map((a) => (
        <g key={a} transform={`rotate(${a} 80 80)`}>
          <path d="M80,80 C66,62 66,38 80,22 C94,38 94,62 80,80 Z" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
        </g>
      ))}
      <circle cx="80" cy="80" r="5" fill="currentColor" fillOpacity="0.6" />
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180
        const x = 80 + 54 * Math.sin(rad)
        const y = 80 - 54 * Math.cos(rad)
        return <circle key={`dot-${a}`} cx={x} cy={y} r="2" fill="currentColor" fillOpacity="0.8" />
      })}
    </svg>
  )
}

/** A faint field of pulli (dot-grid) points — the base every kolam is drawn from. */
export function PulliField({ className = '', cols = 10, rows = 6, ...props }) {
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push([c, r])
  }
  return (
    <svg viewBox={`0 0 ${cols * 24} ${rows * 24}`} className={className} preserveAspectRatio="xMidYMid meet" fill="none" {...props}>
      {cells.map(([c, r]) => (
        <circle key={`${c}-${r}`} cx={c * 24 + 12} cy={r * 24 + 12} r="1.6" fill="currentColor" fillOpacity="0.5" />
      ))}
    </svg>
  )
}

/** Simple geometric triangular border strip, inspired by textile trims. */
export function TextileTrim({ className = '', flip = false, ...props }) {
  return (
    <svg
      viewBox="0 0 120 16"
      className={className}
      preserveAspectRatio="none"
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
      fill="none"
      {...props}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <polygon key={i} points={`${i * 10},16 ${i * 10 + 5},2 ${i * 10 + 10},16`} fill="currentColor" fillOpacity={i % 2 === 0 ? 0.8 : 0.35} />
      ))}
    </svg>
  )
}
