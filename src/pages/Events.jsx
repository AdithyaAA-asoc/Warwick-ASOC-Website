import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import PlaceholderImage from '../components/PlaceholderImage.jsx'
import { KolamMedallion, KolamChain } from '../components/Motifs.jsx'
import { Badge, Button, Card, Pill, Section, SectionHeading } from '../components/ui.jsx'
import { upcomingEvents, pastEvents } from '../data/events.js'

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function EventCard({ event, past = false }) {
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
        {!past && event.priceLabel && (
          <Badge className="absolute right-4 top-4 bg-white/90">{event.priceLabel}</Badge>
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
          <div className="mt-2 border-t border-purple-50 pt-4">
            {event.ticketUrl ? (
              <Button as="a" href={event.ticketUrl} variant="primary" className="w-full">
                Register Now
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Tickets Coming Soon
              </Button>
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

export default function Events() {
  const [tab, setTab] = useState('upcoming')
  const events = useMemo(() => (tab === 'upcoming' ? upcomingEvents : pastEvents), [tab])

  return (
    <div>
      <PageHero
        eyebrow="What's On"
        title="Events"
        description="From cultural celebrations to casual socials — here’s what Warwick Asian Society has planned this year."
      />

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

        {events.length === 0 ? (
          <p className="mt-16 text-center text-ink-500">No events to show right now — check back soon!</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} past={tab === 'past'} />
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
          description="Become a member to get early access to tickets, or follow us on social media for the latest announcements."
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

      {/* Developer note, not rendered — kept in JSX as a code comment:
          To connect to a real events system, replace the imports from
          ../data/events.js with a fetch()/React Query call to your API,
          keeping the same { id, name, date, time, location, description,
          image, ticketUrl, priceLabel } shape so these components need no
          changes. */}
    </div>
  )
}
