import PageHero from '../components/PageHero.jsx'
import PlaceholderImage from '../components/PlaceholderImage.jsx'
import { KolamChain, RangoliMedallion } from '../components/Motifs.jsx'
import { Card, Section, SectionHeading } from '../components/ui.jsx'
import { execTeams } from '../data/execs.js'

const SOCIAL_ICONS = {
  instagram: (
    <path
      d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2ZM17.4 6.6h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  linkedin: (
    <path
      d="M4.5 4.5h15v15h-15v-15Zm3.6 4.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm-.9 1.8v7.2h1.8v-7.2h-1.8Zm3.6 0v7.2h1.8v-3.9c0-1 .5-1.7 1.4-1.7.8 0 1.2.6 1.2 1.7v3.9h1.8v-4.2c0-2-1-3-2.4-3-1.1 0-1.6.6-1.9 1.1v-1h-1.9Z"
    />
  ),
  email: <path d="M4 6h16v12H4V6Zm0 0 8 7 8-7" strokeLinecap="round" strokeLinejoin="round" />,
}

function SocialLink({ type, href }) {
  return (
    <a
      href={href}
      aria-label={type}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-200 text-purple-500 transition-colors duration-200 hover:border-gold-400 hover:bg-purple-50 hover:text-gold-600"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        {SOCIAL_ICONS[type]}
      </svg>
    </a>
  )
}

function ExecCard({ member }) {
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <PlaceholderImage
        src={member.photo}
        alt={member.name}
        icon="person"
        label={member.photo ? undefined : 'Exec photo'}
        ratio="aspect-[4/5]"
        rounded="rounded-none rounded-t-2xl"
      />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div>
          <h3 className="text-lg font-semibold text-purple-950">{member.name}</h3>
          <p className="text-sm font-semibold text-gold-600">{member.role}</p>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-ink-500">{member.bio}</p>
        {member.socials && (
          <div className="mt-2 flex gap-2 border-t border-purple-50 pt-4">
            {Object.entries(member.socials).map(([type, href]) => (
              <SocialLink key={type} type={type} href={href} />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default function Execs() {
  return (
    <div>
      <PageHero
        eyebrow="The People Behind It"
        title="Meet the Execs"
        description="A dedicated team of students volunteering their time to build the Warwick Asian Society community — from big cultural festivals to weekly socials."
      />

      {execTeams.map((group, idx) => (
        <Section key={group.team} className={idx % 2 === 1 ? 'bg-purple-50/60' : ''}>
          <SectionHeading eyebrow={`0${idx + 1}`} title={group.team} align="left" className="mx-0 items-start text-left" />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.members.map((member) => (
              <ExecCard key={member.name} member={member} />
            ))}
          </div>
          {idx < execTeams.length - 1 && (
            <div className="mx-auto mt-16 max-w-xs">
              <KolamChain units={10} className="h-4 w-full text-gold-500/50" />
            </div>
          )}
        </Section>
      ))}

      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-10 text-center">
          <RangoliMedallion className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 text-purple-200/60" aria-hidden="true" />
          <RangoliMedallion className="pointer-events-none absolute -bottom-14 -left-14 h-36 w-36 text-gold-200/60" aria-hidden="true" />
          <div className="relative">
            <h3 className="font-display text-2xl font-semibold text-purple-950">Interested in joining the exec team?</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500">
              We open applications for new committee positions each academic year. Follow our socials or join as a
              member to be the first to hear when applications open.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
