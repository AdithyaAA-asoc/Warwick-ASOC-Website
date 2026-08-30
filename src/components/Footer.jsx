import { NavLink } from 'react-router-dom'
import PlaceholderImage from './PlaceholderImage.jsx'
import { KolamChain } from './Motifs.jsx'

const SOCIALS = [
  { label: 'Instagram', href: '#', key: 'instagram' },
  { label: 'TikTok', href: '#', key: 'tiktok' },
  { label: 'Facebook', href: '#', key: 'facebook' },
  { label: 'Email', href: 'mailto:hello@warwickasiansociety.co.uk', key: 'email' },
]

const ICONS = {
  instagram: (
    <path
      d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2ZM17.4 6.6h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  tiktok: (
    <path
      d="M14 3v10.5a3 3 0 1 1-2.6-3v-2.1A5.1 5.1 0 1 0 16 13.4V8.6a6.2 6.2 0 0 0 4-1.5V4.9a4.2 4.2 0 0 1-2.8-1.1A4.1 4.1 0 0 1 16 3h-2Z"
      strokeLinejoin="round"
    />
  ),
  facebook: (
    <path
      d="M14 9h2.5V6H14c-1.9 0-3.3 1.5-3.3 3.4V11H8.5v3H10.7v6H14v-6h2.2l.4-3H14V9.7c0-.4.3-.7.6-.7Z"
      strokeLinejoin="round"
    />
  ),
  email: <path d="M4 6h16v12H4V6Zm0 0 8 7 8-7" strokeLinecap="round" strokeLinejoin="round" />,
}

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-purple-950 text-purple-100">
      <KolamChain units={40} className="h-3 w-full text-gold-500/70" />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <PlaceholderImage
                icon="logo"
                rounded="rounded-full"
                label={null}
                className="h-11 w-11 border-purple-700 from-purple-800 to-purple-900 text-gold-400"
                alt="Warwick Asian Society logo"
              />
              <span className="font-display text-xl font-semibold text-white">
                Warwick Asian Society
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-purple-300">
              A home away from home for South &amp; East Asian culture at the University of Warwick —
              connecting students through community, celebration and shared identity.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-700 text-gold-300 transition-colors duration-200 hover:border-gold-400 hover:bg-purple-900 hover:text-gold-200"
                >
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    {ICONS[s.key]}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-purple-300">
              <li><NavLink to="/" className="hover:text-gold-200">About</NavLink></li>
              <li><NavLink to="/execs" className="hover:text-gold-200">Meet the Execs</NavLink></li>
              <li><NavLink to="/events" className="hover:text-gold-200">Events</NavLink></li>
              <li><NavLink to="/membership" className="hover:text-gold-200">Membership</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Get in touch</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-purple-300">
              <li>University of Warwick</li>
              <li>Students&rsquo; Union, Coventry, CV4 7AL</li>
              <li>
                <a href="mailto:hello@warwickasiansociety.co.uk" className="hover:text-gold-200">
                  hello@warwickasiansociety.co.uk
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-purple-800 pt-6 text-xs text-purple-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Warwick Asian Society. All rights reserved.</p>
          <p>Affiliated with Warwick Students&rsquo; Union</p>
        </div>
      </div>
    </footer>
  )
}
