// Small, reusable UI primitives shared across every page — keep visual
// language (spacing, radii, shadows, colours) consistent by always
// building new sections from these instead of one-off markup.

export function Button({ as: Tag = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }
  const variants = {
    primary:
      'bg-purple-800 text-gold-100 hover:bg-purple-900 shadow-card hover:shadow-card-hover border border-transparent',
    gold: 'bg-gradient-to-r from-gold-500 to-gold-400 text-purple-950 hover:from-gold-400 hover:to-gold-300 shadow-card hover:shadow-card-hover',
    outline: 'border border-purple-300 text-purple-800 hover:bg-purple-50',
    ghost: 'text-purple-800 hover:bg-purple-50',
  }
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function Card({ className = '', children, hoverLift = true, ...props }) {
  return (
    <div
      className={`group relative rounded-2xl border border-purple-100 bg-white/80 backdrop-blur-sm shadow-card ${
        hoverLift ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-gold-300/70' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Eyebrow({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 ${className}`}
    >
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" />
      {children}
    </span>
  )
}

export function SectionHeading({ eyebrow, title, description, align = 'center', className = '' }) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'
  return (
    <div className={`flex flex-col gap-4 max-w-2xl ${alignment} ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl sm:text-4xl font-semibold text-purple-950">{title}</h2>
      {description && <p className="text-ink-500 text-base sm:text-lg leading-relaxed">{description}</p>}
    </div>
  )
}

export function Section({ children, className = '', containerClassName = '', id }) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 ${className}`}>
      <div className={`mx-auto w-full max-w-6xl px-6 sm:px-8 ${containerClassName}`}>{children}</div>
    </section>
  )
}

export function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700 ${className}`}
    >
      {children}
    </span>
  )
}

export function Pill({ children, active = false, className = '', ...props }) {
  return (
    <button
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
        active ? 'bg-purple-800 text-gold-100' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
