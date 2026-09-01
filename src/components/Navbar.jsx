import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import PlaceholderImage from './PlaceholderImage.jsx'
import { Button } from './ui.jsx'
import { useJoinModal } from '../context/JoinModalContext.jsx'

const LINKS = [
  { to: '/', label: 'About' },
  { to: '/execs', label: 'Meet the Execs' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/membership', label: 'Membership' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openModal } = useJoinModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(69,32,116,0.08)]' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <NavLink to="/" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
          <img
            src="/images/logo.png"
            alt="Warwick Asian Society logo"
            className="h-10 w-10 shrink-0 rounded-full object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="font-display text-lg font-semibold leading-tight text-purple-950">
            Warwick Asian
            <span className="block -mt-1 text-sm tracking-[0.3em] uppercase text-gold-600">Society</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? 'text-purple-900' : 'text-ink-500 hover:text-purple-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-500" />}
                </>
              )}
            </NavLink>
          ))}
          <Button variant="gold" size="sm" className="ml-3" onClick={openModal}>
            Join Us
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-200 text-purple-800 md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 border-t border-purple-100 bg-cream px-6 py-4">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-purple-50 text-purple-900' : 'text-ink-500'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button
            variant="gold"
            size="sm"
            className="mt-2 w-full"
            onClick={() => { setOpen(false); openModal() }}
          >
            Join Us
          </Button>
        </div>
      </div>
    </header>
  )
}
