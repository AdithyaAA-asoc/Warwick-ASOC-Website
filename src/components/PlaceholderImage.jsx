/**
 * PlaceholderImage
 * -----------------
 * A visually-integrated stand-in for a real photo/logo. Pass `src` once
 * real assets are available (e.g. from /public/images/...) and it will
 * render an actual <img> instead of the placeholder — no other code
 * needs to change.
 *
 * Usage once you have real assets:
 *   <PlaceholderImage src="/images/execs/priya-sharma.jpg" alt="Priya Sharma" label="President" />
 */
export default function PlaceholderImage({
  src,
  alt = '',
  label,
  icon = 'image',
  ratio = 'aspect-square',
  rounded = 'rounded-2xl',
  className = '',
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${ratio} ${rounded} w-full object-cover ${className}`}
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`${ratio} ${rounded} ${className} relative w-full overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-100 via-purple-50 to-gold-50 flex flex-col items-center justify-center gap-2 text-purple-400`}
      role="img"
      aria-label={alt || label || 'Image placeholder'}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.06]" />
      <PlaceholderIcon kind={icon} className="w-9 h-9 opacity-60" />
      {label && (
        <span className="relative text-[11px] font-medium tracking-wide uppercase text-purple-400/80 px-3 text-center">
          {label}
        </span>
      )}
    </div>
  )
}

function PlaceholderIcon({ kind, className }) {
  if (kind === 'person') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20c1.6-3.8 5-5.6 7.5-5.6s5.9 1.8 7.5 5.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'logo') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 3l7.5 4.3v9.4L12 21l-7.5-4.3V7.3L12 3z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  // default: generic image / event photo
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M21 16.5l-5.5-5-4 4-2-1.7L3 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
