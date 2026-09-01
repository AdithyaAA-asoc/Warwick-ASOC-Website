import { HeroBackdrop, RangoliMedallion, KolamMedallion, KolamChain, CornerMotif, TextileTrim, PulliField } from '../components/Motifs.jsx'
import { Button, Card, Eyebrow, Section, SectionHeading } from '../components/ui.jsx'
import { useJoinModal } from '../context/JoinModalContext.jsx'
import PlaceholderImage from '../components/PlaceholderImage.jsx'

const PILLARS = [
  {
    title: 'Our Mission',
    body: 'To celebrate and share South & East Asian culture at Warwick, creating a space where every student can find community, connection and a sense of home.',
  },
  {
    title: 'Our Community',
    body: 'Hundreds of students from every course and background — united by culture, curiosity and a love of good food, music and celebration.',
  },
  {
    title: 'What to Expect',
    body: 'Termly festivals, socials, cultural showcases and collaborations — plus a welcoming network of friends from day one.',
  },
]

const EXPECTATIONS = [
  {
    title: 'Cultural Celebrations',
    body: 'Diwali, Holi, Lunar New Year and more — brought to life with performances, food and festivity.',
  },
  {
    title: 'Socials & Friendships',
    body: 'Low-key hangouts, pub quizzes and dinners designed to help you find your people at Warwick.',
  },
  {
    title: 'A Platform to Perform',
    body: 'Dance, music and creative showcases for members to share their talent and culture with campus.',
  },
  {
    title: 'A Supportive Network',
    body: 'An exec team and community that looks out for members throughout their time at university.',
  },
]

export default function About() {
  const { openModal } = useJoinModal()

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-white">
        <TextileTrim className="absolute inset-x-0 top-0 h-3.5 w-full text-gold-400/70" />
        <HeroBackdrop className="absolute inset-0 h-full w-full opacity-90" />
        <KolamMedallion
          loops={10}
          className="pointer-events-none absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 text-gold-200/10"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-24 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-6 text-left">
            <Eyebrow className="text-gold-300">University of Warwick</Eyebrow>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Warwick <span className="text-gradient-gold">Asian Society</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-purple-200 sm:text-lg">
              A vibrant home for South &amp; East Asian culture at Warwick — where celebration, community and
              identity come together. Whether you grew up immersed in the culture or are simply curious to learn,
              there&rsquo;s a place for you here.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="gold" size="lg" onClick={openModal}>
                Become a Member
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rounded-[2rem] border border-gold-400/30" />
            <img
              src="/images/front_page.jpg"
              alt="Warwick Asian Society"
              className="w-full rounded-[1.75rem] object-cover shadow-2xl aspect-[4/5]"
            />
            <RangoliMedallion className="absolute -bottom-8 -right-8 h-24 w-24 text-gold-400 opacity-90" />
          </div>
        </div>
        <KolamChain units={40} className="absolute inset-x-0 bottom-0 h-3 w-full text-gold-400/60" />
      </div>

      {/* Mission / Community / Expect pillars */}
      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <Card key={p.title} className="p-8">
              <CornerMotif className="absolute right-4 top-4 h-8 w-8 text-gold-400 opacity-70" />
              <h3 className="text-xl font-semibold text-purple-950">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{p.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Who we are */}
      <Section className="relative overflow-hidden bg-purple-50/60">
        <PulliField
          cols={14}
          rows={7}
          className="pointer-events-none absolute inset-0 h-full w-full text-purple-300/25"
          aria-hidden="true"
        />
        <KolamMedallion
          loops={8}
          className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 text-purple-300/25"
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title="More than a society — a second family at Warwick"
              className="mx-0 items-start text-left"
            />
            <p className="mt-6 text-base leading-relaxed text-ink-500">
              Warwick Asian Society exists to bring South &amp; East Asian culture to the heart of campus life.
              We&rsquo;re run by students, for students — organising the events, celebrations and everyday moments
              that help our members feel proud, represented and at home.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              From our biggest cultural showcases to quiet Tuesday-night socials, everything we do is grounded in
              one idea: culture is best experienced together.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-purple-100 pt-6">
              {[
                ['500+', 'Members'],
                ['15+', 'Events a year'],
                ['10', 'Exec team'],
              ].map(([stat, label]) => (
                <div key={label}>
                  <p className="font-display text-3xl font-semibold text-purple-900">{stat}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-ink-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <PlaceholderImage ratio="aspect-[3/4]" label="Community photo" className="translate-y-6" />
              <PlaceholderImage ratio="aspect-[3/4]" label="Event photo" />
              <PlaceholderImage ratio="aspect-[3/4]" label="Culture night" />
              <PlaceholderImage ratio="aspect-[3/4]" label="Committee photo" className="translate-y-6" />
            </div>
          </div>
        </div>
      </Section>

      {/* What members can expect */}
      <Section>
        <SectionHeading
          eyebrow="Membership Life"
          title="What members can expect"
          description="Joining Warwick Asian Society opens the door to a full calendar of culture, connection and celebration."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EXPECTATIONS.map((item) => (
            <Card key={item.title} className="p-6">
              <CornerMotif className="absolute right-3 top-3 h-6 w-6 text-gold-400 opacity-60" />
              <h3 className="text-base font-semibold text-purple-950">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="pb-28">
        <div className="mx-auto mb-14 max-w-xs">
          <KolamChain units={10} className="h-4 w-full text-gold-500/60" />
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 to-purple-950 px-8 py-16 text-center text-white sm:px-16">
          <HeroBackdrop className="absolute inset-0 h-full w-full opacity-60" />
          <RangoliMedallion className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 text-purple-400/20" aria-hidden="true" />
          <RangoliMedallion className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 text-gold-300/20" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-6">
            <h2 className="max-w-xl font-display text-3xl font-semibold sm:text-4xl">
              Ready to be part of the community?
            </h2>
            <p className="max-w-lg text-purple-200">
              Membership gives you priority access to every event we run this year — plus a community that feels
              like home.
            </p>
            <Button variant="gold" size="lg" onClick={openModal}>
              Join Warwick Asian Society
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
