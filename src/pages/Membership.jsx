import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { RangoliMedallion, KolamMedallion, KolamChain } from '../components/Motifs.jsx'
import { Badge, Button, Card, Section, SectionHeading } from '../components/ui.jsx'
import { useJoinModal } from '../context/JoinModalContext.jsx'

const BENEFITS = [
  {
    title: 'Priority Event Access',
    body: 'Members get early or discounted access to tickets for every event we run, including our biggest cultural celebrations.',
  },
  {
    title: 'Community & Belonging',
    body: 'Join a network of 500+ students who share your culture, curiosity and love of celebration.',
  },
  {
    title: 'Exclusive Socials',
    body: 'Members-only hangouts, dinners and welfare check-ins throughout the year.',
  },
  {
    title: 'Performance Opportunities',
    body: 'Take part in dance, music and cultural showcases as a performer or crew member.',
  },
  {
    title: 'Leadership Pathways',
    body: 'First access to exec applications, sub-committees and volunteering opportunities.',
  },
  {
    title: 'Partner Discounts',
    body: 'Access to discounts with local restaurants and partner societies throughout the year.',
  },
]

const STEPS = [
  { title: 'Fill in your details', body: 'Enter your name, Warwick email and year of study.' },
  { title: 'Complete payment', body: 'Pay securely via Stripe — just £11 for the full academic year.' },
  { title: "You're in!", body: 'Get a confirmation email and instant access to member benefits.' },
]

const FAQS = [
  {
    q: 'Who can join Warwick Asian Society?',
    a: "Any current Warwick student — undergraduate or postgraduate — regardless of background. You don't need to be South or East Asian to join; everyone curious about the culture is welcome.",
  },
  {
    q: 'How long does membership last?',
    a: 'Membership runs for the full academic year, from Welcome Week through to the end of Term 3.',
  },
  {
    q: 'Do I need to be a member to attend events?',
    a: 'Some socials are open to everyone, but members get priority and discounted access to ticketed events — especially our larger celebrations, which sell out quickly.',
  },
  {
    q: 'How do I pay for membership?',
    a: 'You pay securely via Stripe during sign-up — just click "Join Warwick Asian Society" on this page. We accept all major debit and credit cards.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-purple-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-purple-950">{q}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden px-6 pb-5 text-sm leading-relaxed text-ink-500">{a}</div>
      </div>
    </div>
  )
}

export default function Membership() {
  const { openModal } = useJoinModal()
  const [searchParams] = useSearchParams()
  const payment = searchParams.get('payment')

  return (
    <div>
      <PageHero eyebrow="Join Us" title="Become a Member" description="One membership. A full year of culture, community and celebration.">
        <Button variant="gold" size="lg" className="mt-2" onClick={openModal}>
          Join Warwick Asian Society
        </Button>
      </PageHero>

      {/* Payment result banners */}
      {payment === 'success' && (
        <div className="bg-green-50 border-b border-green-100">
          <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
            <p className="text-sm font-semibold text-green-800">
              Payment confirmed — welcome to Warwick Asian Society! Check your inbox for your membership confirmation email.
            </p>
          </div>
        </div>
      )}
      {payment === 'cancelled' && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-amber-800">
              Payment was cancelled — your details are saved. Click below whenever you're ready to complete your membership.
            </p>
            <Button variant="gold" size="sm" onClick={openModal}>Try again</Button>
          </div>
        </div>
      )}

      {/* Benefits */}
      <Section>
        <SectionHeading
          eyebrow="Why Join"
          title="Membership benefits"
          description="Here's what you unlock as a Warwick Asian Society member."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="p-7">
              <h3 className="text-base font-semibold text-purple-950">{b.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{b.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Join card / CTA */}
      <Section id="join" className="bg-purple-50/60">
        <div className="mx-auto max-w-3xl">
          <Card className="relative overflow-hidden p-10 text-center sm:p-14">
            <RangoliMedallion className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 text-purple-200" />
            <RangoliMedallion className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 text-gold-200" />

            <div className="relative flex flex-col items-center gap-5">
              <Badge>2026 / 27 Membership</Badge>
              <h2 className="font-display text-3xl font-semibold text-purple-950 sm:text-4xl">Annual Membership</h2>
              <p className="max-w-md text-sm leading-relaxed text-ink-500">
                Full access to every Warwick Asian Society event, social and celebration for the entire academic
                year — plus priority booking for our biggest nights.
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span className="font-display text-5xl font-semibold text-purple-950">£11</span>
                <span className="pb-1 text-sm text-ink-300">/ year</span>
              </div>

              <Button variant="gold" size="lg" className="mt-2 w-full max-w-xs" onClick={openModal}>
                Sign Up Now
              </Button>
              <p className="text-xs text-ink-300">
                Secure payment via Stripe · Confirmation email sent after payment
              </p>
            </div>
          </Card>

          <div className="mx-auto my-14 max-w-xs">
            <KolamChain units={10} className="h-4 w-full text-gold-500/50" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold-400 font-display text-lg font-semibold text-gold-600">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-purple-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="relative overflow-hidden">
        <KolamMedallion
          loops={10}
          className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/3 text-purple-200/20"
          aria-hidden="true"
        />
        <SectionHeading eyebrow="Good to Know" title="Frequently asked questions" className="relative" />
        <div className="relative mx-auto mt-12 flex max-w-2xl flex-col gap-4">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>
    </div>
  )
}
