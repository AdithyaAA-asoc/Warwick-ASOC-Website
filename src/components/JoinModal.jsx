import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useJoinModal } from '../context/JoinModalContext.jsx'
import { Button } from './ui.jsx'
import { supabase } from '../lib/supabase.js'

const COLLEGE_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Masters',
  'PhD / Postgrad Research',
  'Exchange Student',
]

const EMPTY = { firstName: '', lastName: '', email: '', collegeYear: '' }

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-2.5 text-sm text-purple-950 placeholder-ink-300 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200'

export default function JoinModal() {
  const { open, closeModal } = useJoinModal()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setForm(EMPTY)
      setError('')
      setLoading(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeModal])

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email.toLowerCase().endsWith('@live.warwick.ac.uk')) {
      setError('Please use your Warwick email address — it ends with @live.warwick.ac.uk')
      return
    }

    setLoading(true)
    try {
      const memberId = crypto.randomUUID()

      const { error: dbErr } = await supabase
        .from('members')
        .insert({
          id: memberId,
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          college_year: form.collegeYear,
        })

      if (dbErr) {
        if (dbErr.code === '23505') {
          setError('This email is already registered. If you haven\'t paid yet, please contact us.')
        } else {
          setError('Something went wrong saving your details. Please try again.')
        }
        setLoading(false)
        return
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            memberId,
            email: form.email.trim().toLowerCase(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
          }),
        },
      )

      if (!res.ok) throw new Error('Could not create payment session')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Something went wrong. Please try again or contact us.')
      setLoading(false)
    }
  }

  const canSubmit = form.firstName && form.lastName && form.email && form.collegeYear && !loading

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(23,10,44,0.7)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === overlayRef.current) closeModal() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-purple-50 hover:text-purple-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Join Us</span>
          <h2 id="join-modal-title" className="mt-1 font-display text-2xl font-semibold text-purple-950">
            Become a Member
          </h2>
          <p className="mt-1 text-sm text-ink-400">Annual membership · £11 · 2026/27 academic year</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="jm-firstName">
                First name
              </label>
              <input
                id="jm-firstName"
                type="text"
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={set('firstName')}
                className={inputClass}
                placeholder="Priya"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="jm-lastName">
                Last name
              </label>
              <input
                id="jm-lastName"
                type="text"
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={set('lastName')}
                className={inputClass}
                placeholder="Sharma"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="jm-email">
              Warwick email
            </label>
            <input
              id="jm-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              className={inputClass}
              placeholder="u1234567@live.warwick.ac.uk"
            />
            <p className="mt-1 text-xs text-ink-300">Must end with @live.warwick.ac.uk</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-purple-950" htmlFor="jm-year">
              Year of study
            </label>
            <select
              id="jm-year"
              required
              value={form.collegeYear}
              onChange={set('collegeYear')}
              className={inputClass}
            >
              <option value="" disabled>Select year…</option>
              {COLLEGE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>
          )}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="mt-2 w-full"
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to payment…
              </>
            ) : (
              'Register & Pay £11'
            )}
          </Button>

          <p className="text-center text-xs text-ink-300">
            Secure payment via Stripe · No account created · Confirmation email sent after payment
          </p>
        </form>
      </div>
    </div>,
    document.body,
  )
}
