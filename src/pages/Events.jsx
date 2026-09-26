import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import PlaceholderImage from '../components/PlaceholderImage.jsx'
import { KolamMedallion, KolamChain } from '../components/Motifs.jsx'
import { Badge, Button, Card, Pill, Section, SectionHeading } from '../components/ui.jsx'
import { useTicketModal } from '../context/TicketModalContext.jsx'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function transformEvents(evts, rels) {
  return evts.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.event_date,
    time: e.event_time,
    location: e.location,
    description: e.description,
    image: e.image_url,
    ticketCapacity: e.ticket_capacity,
    releases: rels
      .filter((r) => r.event_id === e.id)
      .map((r) => ({
        name: r.name,
        startDate: r.start_date,
        endDate: r.end_date,
        pricePence: r.price_pence,
        memberPricePence: r.member_price_pence,
        membersOnly: r.members_only === true,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
  }))
}

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function pence(amount) {
  return `£${(amount / 100).toFixed(2).replace('.00', '')}`
}

export function getActiveRelease(releases) {
  if (!releases?.length) return null
  const today = new Date().toISOString().split('T')[0]
  return releases.find((r) => r.startDate <= today && r.endDate >= today) ?? null
}

export function getNextRelease(releases) {
  if (!releases?.length) return null
  const today = new Date().toISOString().split('T')[0]
  return releases
    .filter((r) => r.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null
}

// Counts down to end of the release end date (23:59:59)
function useCountdown(endDateISO) {
  const endMs = useMemo(() => new Date(`${endDateISO}T23:59:59`).getTime(), [endDateISO])
  const calc = useCallback(() => {
    const diff = endMs - Date.now()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
      totalMs: diff,
    }
  }, [endMs])

  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1_000)
    return () => clearInterval(id)
  }, [calc])
  return time
}

function ReleaseCountdown({ endDate }) {
  const t = useCountdown(endDate)
  if (!t) return null
  // Only show urgency within 7 days
  if (t.days > 7) return null

  const isUrgent = t.days < 1
  const isCritical = t.days === 0 && t.hours < 3

  let label
  if (t.days >= 2) label = `${t.days} days left`
  else if (t.days === 1) label = `1 day ${t.hours}h left`
  else if (t.hours >= 1) label = `${t.hours}h ${String(t.minutes).padStart(2, '0')}m left`
  else label = `${t.minutes}m ${String(t.seconds).padStart(2, '0')}s left`

  return (
    <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${
      isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-amber-500'
    }`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      {label}
    </div>
  )
}

function TicketProgressBar({ avail }) {
  if (!avail) return null
  const pct = Math.min(100, (avail.sold / avail.capacity) * 100)
  const sellingFast = pct >= 50
  const critical = pct >= 80

  return (
    <div className="space-y-1.5">
      {sellingFast && (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${critical ? 'text-red-600' : 'text-amber-600'}`}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor">
            <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
          </svg>
          {critical ? 'Almost gone — buy now!' : 'Selling fast!'}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            critical ? 'bg-red-500' : sellingFast ? 'bg-amber-500' : 'bg-green-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-ink-300">
        {avail.remaining} of {avail.capacity} remaining
      </p>
    </div>
  )
}

export function EventCard({ event, past = false, avail, onGetTickets }) {
  const { openTicketModal } = useTicketModal()
  const handleGetTickets = onGetTickets ?? openTicketModal
  const activeRelease = getActiveRelease(event.releases)
  const nextRelease = getNextRelease(event.releases)
  const hasTicketing = !!event.releases?.length
  const isFree = activeRelease?.pricePence === 0 && activeRelease?.memberPricePence === 0
  const soldOut = avail && avail.remaining <= 0
  const lowStock = avail && avail.remaining > 0 && avail.remaining <= Math.min(10, Math.ceil(avail.capacity * 0.15))
  const sellingFast = avail && !soldOut && (avail.sold / avail.capacity) >= 0.5

  const ctaLabel = isFree
    ? 'Register Free'
    : lowStock
      ? `Only ${avail.remaining} Left — Buy Now`
      : sellingFast
        ? 'Get Tickets — Going Fast'
        : 'Get Tickets'

  return (
    <Card className={`flex flex-col overflow-hidden p-0 ${past ? 'opacity-90' : ''}`}>
      <div className="relative">
        <PlaceholderImage
          src={event.image}
          alt={event.name}
          icon="image"
          label={event.image ? undefined : 'Event photo'}
          ratio="aspect-[16/10]"
          rounded="rounded-none rounded-t-2xl"
        />
        {!past && activeRelease && !soldOut && (
          <Badge className={`absolute right-4 top-4 shadow-sm ${activeRelease.membersOnly ? 'bg-purple-700 text-white' : 'bg-white/90'}`}>
            {activeRelease.membersOnly
              ? `★ Members — ${pence(activeRelease.memberPricePence)}`
              : isFree ? 'Free' : `${activeRelease.name} — ${pence(activeRelease.pricePence)}`}
          </Badge>
        )}
        {!past && !activeRelease && nextRelease && !soldOut && (
          <Badge className="absolute right-4 top-4 bg-white/90">
            From {formatShortDate(nextRelease.startDate)}
          </Badge>
        )}
        {!past && soldOut && (
          <span className="absolute right-4 top-4 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold text-white">
            Sold Out
          </span>
        )}
        {past && (
          <span className="absolute left-4 top-4 rounded-full bg-purple-950/80 px-3 py-1 text-xs font-semibold text-white">
            Past Event
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-lg font-semibold text-purple-950">{event.name}</h3>

        <div className="space-y-1.5 text-sm text-ink-500">
          <div className="flex items-center gap-2">
            <IconCalendar /> {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2">
            <IconClock /> {event.time}
          </div>
          <div className="flex items-center gap-2">
            <IconPin /> {event.location}
          </div>
        </div>

        <p className="flex-1 text-sm leading-relaxed text-ink-500">{event.description}</p>

        {!past && (
          <div className="mt-2 space-y-3 border-t border-purple-50 pt-4">
            {hasTicketing ? (
              soldOut ? (
                <Button variant="outline" className="w-full" disabled>Sold Out</Button>
              ) : activeRelease ? (
                <>
                  {avail && <TicketProgressBar avail={avail} />}

                  <Button
                    variant="primary"
                    className={`w-full transition-shadow duration-200 ${
                      lowStock ? 'shadow-[0_0_0_3px_rgba(251,191,36,0.5)] hover:shadow-[0_0_0_4px_rgba(251,191,36,0.6)]' : ''
                    }`}
                    onClick={() => handleGetTickets(event)}
                  >
                    {ctaLabel}
                  </Button>

                  <ReleaseCountdown endDate={activeRelease.endDate} />
                </>
              ) : nextRelease ? (
                <Button variant="outline" className="w-full" disabled>
                  {nextRelease.name} opens {formatShortDate(nextRelease.startDate)}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>Tickets Closed</Button>
              )
            ) : (
              <Button variant="outline" className="w-full" disabled>Tickets Coming Soon</Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-600" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  )
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-600" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-600" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

function TicketLookup({ events }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [tickets, setTickets] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTickets(null)
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_tickets_by_email`,
        {
          method: 'POST',
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lookup_email: email.trim().toLowerCase() }),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Lookup failed')
      setTickets(Array.isArray(data) ? data : [])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-purple-100 bg-purple-50/60">
      <div className="mx-auto max-w-6xl px-6 py-3 sm:px-8">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="text-sm text-purple-700 underline underline-offset-2 hover:text-purple-900"
          >
            Didn't receive your ticket email? Find it here.
          </button>
        ) : (
          <div className="py-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-purple-900">Find my ticket</p>
              <button onClick={() => { setOpen(false); setTickets(null); setEmail('') }} className="text-xs text-purple-400 hover:text-purple-700">Close</button>
            </div>
            <form onSubmit={handleLookup} className="flex gap-2 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email you used to buy the ticket"
                className="flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-purple-900 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
              >
                {loading ? 'Looking…' : 'Find'}
              </button>
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {tickets !== null && tickets.length === 0 && (
              <p className="text-sm text-ink-500">No tickets found for that email. Make sure you use the same email you paid with.</p>
            )}

            {tickets && tickets.length > 0 && (
              <div className="space-y-4">
                {tickets.map((t) => {
                  const eventName = events.find((ev) => ev.id === t.event_id)?.name ?? t.event_id
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${t.ticket_code}&color=170a2c&bgcolor=fdfbf6`
                  const pricePaid = t.price_paid_pence != null
                    ? t.price_paid_pence === 0 ? 'Free' : `£${(t.price_paid_pence / 100).toFixed(2)}`
                    : null
                  return (
                    <div key={t.ticket_code} className="flex gap-4 rounded-xl border border-purple-100 bg-white p-4">
                      <img src={qrUrl} alt="QR code" className="h-24 w-24 shrink-0 rounded-lg border border-purple-100" />
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-purple-950">{eventName}</p>
                        <p className="text-sm text-ink-500">{t.first_name} {t.last_name}</p>
                        {t.release_name && (
                          <p className="text-xs text-ink-400">
                            {t.release_name}{t.is_member ? ' · Member price' : ' · Standard price'}
                            {pricePaid ? ` · ${pricePaid}` : ''}
                          </p>
                        )}
                        <p className="font-mono text-[10px] text-ink-300 break-all pt-1">{t.ticket_code}</p>
                      </div>
                    </div>
                  )
                })}
                <p className="text-xs text-ink-400">Screenshot your QR code and show it at the door.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Events() {
  const [tab, setTab] = useState('upcoming')
  const [searchParams] = useSearchParams()
  const [availability, setAvailability] = useState({})
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const payment = searchParams.get('payment')
  const paidEventId = searchParams.get('event')

  const events = useMemo(() => (tab === 'upcoming' ? upcomingEvents : pastEvents), [tab, upcomingEvents, pastEvents])
  const paidEvent = paidEventId
    ? [...upcomingEvents, ...pastEvents].find((e) => e.id === paidEventId)
    : null

  // Fetch events + releases from Supabase
  useEffect(() => {
    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/events?published=eq.true&order=event_date.asc`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      }).then((r) => r.json()),
      fetch(`${SUPABASE_URL}/rest/v1/event_releases?order=start_date.asc`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      }).then((r) => r.json()),
    ])
      .then(([evts, rels]) => {
        if (!Array.isArray(evts)) return
        const allRels = Array.isArray(rels) ? rels : []
        const all = transformEvents(evts, allRels)
        setUpcomingEvents(all.filter((e) => !evts.find((x) => x.id === e.id)?.is_past))
        setPastEvents(all.filter((e) => evts.find((x) => x.id === e.id)?.is_past))
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (upcomingEvents.length === 0) return
    const ids = upcomingEvents.map((e) => e.id).join(',')
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/event_inventory?event_id=in.(${ids})&select=event_id,capacity,sold`,
      {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    )
      .then((r) => r.json())
      .then((rows) => {
        if (!Array.isArray(rows)) return
        setAvailability(
          Object.fromEntries(
            rows.map((r) => [
              r.event_id,
              { capacity: r.capacity, sold: r.sold, remaining: r.capacity - r.sold },
            ]),
          ),
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      <PageHero
        eyebrow="What's On"
        title="Events"
        description="From cultural celebrations to casual socials — here's what Warwick Asian Society has planned this year."
      />

      {payment === 'success' && (
        <div className="border-b border-green-100 bg-green-50">
          <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
            <p className="text-sm font-semibold text-green-800">
              {paidEvent
                ? `You're registered for ${paidEvent.name}! Check your inbox for your QR code ticket.`
                : 'Payment confirmed! Check your inbox for your QR code ticket.'}
            </p>
          </div>
        </div>
      )}
      {payment === 'cancelled' && (
        <div className="border-b border-amber-100 bg-amber-50">
          <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
            <p className="text-sm font-semibold text-amber-800">
              Payment was cancelled — no charge was made. Click any event below to try again.
            </p>
          </div>
        </div>
      )}

      <TicketLookup events={[...upcomingEvents, ...pastEvents]} />

      <Section className="pt-16">
        <div className="mx-auto mb-10 max-w-xs">
          <KolamChain units={10} className="h-4 w-full text-gold-500/50" />
        </div>
        <div className="flex items-center justify-center gap-3">
          <Pill active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
            Upcoming Events
          </Pill>
          <Pill active={tab === 'past'} onClick={() => setTab('past')}>
            Past Events
          </Pill>
        </div>

        {loadingEvents ? (
          <p className="mt-16 text-center text-ink-400">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="mt-16 text-center text-ink-500">No events to show right now — check back soon!</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                past={tab === 'past'}
                avail={availability[event.id]}
              />
            ))}
          </div>
        )}

      </Section>

      <Section className="relative overflow-hidden bg-purple-50/60">
        <KolamMedallion
          loops={8}
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 text-purple-300/25"
          aria-hidden="true"
        />
        <KolamMedallion
          loops={8}
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 text-gold-300/25"
          aria-hidden="true"
        />
        <SectionHeading
          eyebrow="Stay in the loop"
          title="Never miss an event"
          description="Become a member to get early access and discounted tickets, or follow us on social media for the latest announcements."
          className="relative"
        />
        <div className="relative mt-8 flex justify-center gap-3">
          <Button as="a" href="#/membership" variant="gold" size="lg">
            Become a Member
          </Button>
          <Button as="a" href="#" variant="outline" size="lg">
            Follow on Instagram
          </Button>
        </div>
      </Section>
    </div>
  )
}
