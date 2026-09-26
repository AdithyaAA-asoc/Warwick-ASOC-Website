import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTicketModal } from '../context/TicketModalContext.jsx'
import { Button } from './ui.jsx'

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-2.5 text-sm text-purple-950 placeholder-ink-300 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200'

function pence(amount) {
  return `£${(amount / 100).toFixed(2).replace('.00', '')}`
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getActiveRelease(releases) {
  if (!releases?.length) return null
  const today = new Date().toISOString().split('T')[0]
  return releases.find((r) => r.startDate <= today && r.endDate >= today) ?? null
}

export default function TicketModal() {
  const { event, closeTicketModal } = useTicketModal()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [memberStatus, setMemberStatus] = useState('unknown') // 'unknown'|'checking'|'member'|'non-member'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef(null)
  const checkTimer = useRef(null)

  const open = !!event
  const activeRelease = useMemo(() => getActiveRelease(event?.releases), [event])
  const isMembersOnly = activeRelease?.membersOnly === true
  const isFree = activeRelease?.pricePence === 0 && activeRelease?.memberPricePence === 0
  const hasMemberDiscount = activeRelease && !isMembersOnly && activeRelease.memberPricePence < activeRelease.pricePence
  const shouldCheckMembership = isMembersOnly || hasMemberDiscount

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setForm({ firstName: '', lastName: '', email: '' })
      setError('')
      setLoading(false)
      setMemberStatus('unknown')
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') closeTicketModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeTicketModal])

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setError('')
      if (field === 'email') {
        setMemberStatus('unknown')
        clearTimeout(checkTimer.current)
      }
    }
  }

  function handleEmailBlur() {
    const email = form.email.trim().toLowerCase()
    if (!email.includes('@')) return
    setMemberStatus('checking')
    clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/is_member`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ check_email: email }),
          },
        )
        if (!res.ok) { setMemberStatus('non-member'); return }
        const result = await res.json()
        setMemberStatus(result === true ? 'member' : 'non-member')
      } catch {
        setMemberStatus('non-member')
      }
    }, 400)
  }

  // Display price — the edge function recomputes this server-side, so it's preview only
  const displayPrice =
    activeRelease &&
    (isMembersOnly || memberStatus === 'member' ? activeRelease.memberPricePence : activeRelease.pricePence)

  const memberBlocked = isMembersOnly && memberStatus === 'non-member'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ticket-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          // Prices are NOT sent — the edge function looks up the active release from the DB
          body: JSON.stringify({
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
          }),
        },
      )
      if (!res.ok) {
        const data = await res.json()
        if (data?.error === 'sold_out') throw new Error('sold_out')
        if (data?.error === 'no_active_release') throw new Error('no_active_release')
        if (data?.error === 'members_only') throw new Error('members_only')
        throw new Error('failed')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(
        msg === 'sold_out'         ? 'Sorry — this event just sold out.' :
        msg === 'no_active_release' ? 'Ticket sales are not open right now. Check back soon!' :
        msg === 'members_only'      ? 'This release is for members only. Join for £11 to get access.' :
        'Something went wrong. Please try again or contact us.',
      )
      setLoading(false)
    }
  }

  const canSubmit = form.firstName && form.lastName && form.email && !loading && !memberBlocked

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(23,10,44,0.7)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === overlayRef.current) closeTicketModal() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={closeTicketModal}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-purple-50 hover:text-purple-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mb-5">
          <span className={`text-xs font-bold uppercase tracking-[0.2em] ${isMembersOnly ? 'text-purple-700' : 'text-gold-600'}`}>
            {isFree ? 'Free Registration' : isMembersOnly ? `Members Release · ${activeRelease.name}` : activeRelease ? `${activeRelease.name} Release` : 'Get Tickets'}
          </span>
          <h2 id="ticket-modal-title" className="mt-1 font-display text-2xl font-semibold text-purple-950">
            {event.name}
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            {formatDate(event.date)} · {event.location}
          </p>
        </div>

        {/* Price breakdown */}
        {activeRelease && !isFree && isMembersOnly && (
          <div className="mb-5 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor">
                <path d="M12 1l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16l-6.2 4.4 2.4-7.4L2 8.4h7.6z" />
              </svg>
              Members only — {pence(activeRelease.memberPricePence)} · ends {formatDate(activeRelease.endDate)}
            </div>
            {memberStatus === 'member' && (
              <div className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Membership confirmed — you're in!
              </div>
            )}
            {memberStatus === 'non-member' && (
              <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                This release is for members only.{' '}
                <a href="#/membership" className="font-semibold underline" onClick={closeTicketModal}>
                  Join for £11
                </a>{' '}
                to get early access.
              </div>
            )}
            {memberStatus === 'checking' && (
              <p className="text-xs text-ink-300">Checking membership…</p>
            )}
            {memberStatus === 'unknown' && (
              <p className="text-xs text-ink-400">Enter your email below to verify your membership.</p>
            )}
          </div>
        )}

        {activeRelease && !isFree && hasMemberDiscount && (
          <div className="mb-5 rounded-2xl bg-purple-50/60 px-5 py-4 space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-300">
              {activeRelease.name} · ends {formatDate(activeRelease.endDate)}
            </span>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Standard</span>
              <span className="font-semibold text-purple-950">{pence(activeRelease.pricePence)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Member</span>
              <span className="font-semibold text-purple-950">{pence(activeRelease.memberPricePence)}</span>
            </div>
            {memberStatus === 'member' && (
              <div className="mt-1 flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Member price applied — {pence(activeRelease.memberPricePence)}
              </div>
            )}
            {memberStatus === 'non-member' && (
              <p className="mt-1 text-xs text-ink-400">
                Not a member?{' '}
                <a href="#/membership" className="text-purple-700 underline" onClick={closeTicketModal}>Join for £11</a>{' '}
                to unlock the member price.
              </p>
            )}
            {memberStatus === 'checking' && <p className="mt-1 text-xs text-ink-300">Checking membership…</p>}
          </div>
        )}

        {activeRelease && !isFree && !hasMemberDiscount && !isMembersOnly && (
          <div className="mb-5 rounded-2xl bg-purple-50/60 px-5 py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">{activeRelease.name} price</span>
              <span className="font-semibold text-purple-950">{pence(activeRelease.pricePence)}</span>
            </div>
            <p className="text-xs text-ink-300">Ends {formatDate(activeRelease.endDate)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="tm-first">
                First name
              </label>
              <input id="tm-first" type="text" required autoComplete="given-name" value={form.firstName} onChange={set('firstName')} className={inputClass} placeholder="Priya" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="tm-last">
                Last name
              </label>
              <input id="tm-last" type="text" required autoComplete="family-name" value={form.lastName} onChange={set('lastName')} className={inputClass} placeholder="Sharma" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="tm-email">
              Email address
            </label>
            <input
              id="tm-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              onBlur={shouldCheckMembership ? handleEmailBlur : undefined}
              className={inputClass}
              placeholder="you@example.com"
            />
            {shouldCheckMembership && (
              <p className="mt-1 text-xs text-ink-300">
                Enter the email you used when you joined to verify your membership.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>
          )}

          <Button type="submit" variant="gold" size="lg" className="mt-2 w-full" disabled={!canSubmit}>
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting…
              </>
            ) : isFree ? (
              'Register — Free'
            ) : displayPrice !== undefined ? (
              `Buy Ticket — ${pence(displayPrice)}`
            ) : (
              'Buy Ticket'
            )}
          </Button>

          <p className="text-center text-xs text-ink-300">
            {isFree
              ? 'Your QR code ticket will be sent to your email.'
              : 'Secure payment via Stripe · QR code ticket sent by email after purchase.'}
          </p>
        </form>
      </div>
    </div>,
    document.body,
  )
}
