import { useEffect, useState, useCallback } from 'react'
import PageHero from '../components/PageHero.jsx'
import { Section } from '../components/ui.jsx'
import { KolamChain } from '../components/Motifs.jsx'

// Vite picks up every image dropped into src/assets/gallery/
// The filename becomes the title — e.g. "diwali-night-2024.jpg" → "Diwali Night 2024"
const imageModules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp,avif}', { eager: true })

function titleFromPath(path) {
  return path
    .split('/').pop()          // grab filename
    .replace(/\.[^.]+$/, '')   // strip extension
    .replace(/[-_]/g, ' ')     // hyphens/underscores → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // Title Case
}

const IMAGES = Object.entries(imageModules).map(([path, mod]) => ({
  src: mod.default,
  title: titleFromPath(path),
}))

function Placeholder({ title }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-900 to-purple-950">
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-gold-400/60" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="6" y="10" width="36" height="28" rx="4" />
        <circle cx="18" cy="22" r="4" />
        <path d="M6 32l10-8 8 6 6-5 12 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-semibold text-gold-300">{title}</p>
      <p className="text-xs text-purple-400">Add image to src/assets/gallery/</p>
    </div>
  )
}

export default function Gallery() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const hasImages = IMAGES.length > 0

  const go = useCallback((index) => {
    if (animating || !hasImages) return
    setAnimating(true)
    setCurrent((index + IMAGES.length) % IMAGES.length)
    setTimeout(() => setAnimating(false), 350)
  }, [animating, hasImages])

  const prev = useCallback(() => go(current - 1), [go, current])
  const next = useCallback(() => go(current + 1), [go, current])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Auto-advance
  useEffect(() => {
    if (!hasImages || IMAGES.length < 2) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, hasImages])

  const item = hasImages ? IMAGES[current] : null

  return (
    <div>
      <PageHero
        eyebrow="Our Moments"
        title="Gallery"
        description="A look back at the events, celebrations and memories that make Warwick Asian Society what it is."
      />

      <Section>
        {/* Main carousel */}
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-purple-950 shadow-2xl" style={{ aspectRatio: '16/9' }}>

            {/* Image or placeholder */}
            <div
              className={`absolute inset-0 transition-opacity duration-350 ${animating ? 'opacity-0' : 'opacity-100'}`}
            >
              {item?.src ? (
                <img
                  src={item.src}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Placeholder title={hasImages ? item.title : 'No images yet'} />
              )}
            </div>

            {/* Title overlay */}
            {hasImages && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent px-8 pb-6 pt-16">
                <p className="font-display text-xl font-semibold text-white sm:text-2xl">{item.title}</p>
              </div>
            )}

            {/* Prev / Next arrows */}
            {hasImages && IMAGES.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-950/60 text-white backdrop-blur-sm transition hover:bg-purple-950/90"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-950/60 text-white backdrop-blur-sm transition hover:bg-purple-950/90"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {hasImages && IMAGES.length > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 h-2 bg-gold-500'
                      : 'w-2 h-2 bg-purple-200 hover:bg-purple-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {hasImages && IMAGES.length > 1 && (
          <>
            <div className="mx-auto my-12 max-w-xs">
              <KolamChain units={10} className="h-4 w-full text-gold-500/50" />
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {IMAGES.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    aria-label={img.title}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                      i === current
                        ? 'ring-2 ring-gold-400 ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ aspectRatio: '1' }}
                  >
                    {img.src ? (
                      <img src={img.src} alt={img.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-800 to-purple-950">
                        <p className="px-1 text-center text-[9px] font-semibold leading-tight text-gold-300">{img.title}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasImages && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 px-8 py-12 text-center">
            <p className="font-semibold text-purple-900">No photos yet</p>
            <p className="mt-2 text-sm text-ink-400">
              Drop image files into <code className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800">src/assets/gallery/</code> and name them descriptively — the filename becomes the caption.
            </p>
            <p className="mt-3 text-xs text-ink-300">e.g. <code className="text-purple-700">diwali-night-2024.jpg</code> → "Diwali Night 2024"</p>
          </div>
        )}
      </Section>
    </div>
  )
}
