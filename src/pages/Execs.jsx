import PageHero from '../components/PageHero.jsx'
import PlaceholderImage from '../components/PlaceholderImage.jsx'
import { RangoliMedallion } from '../components/Motifs.jsx'
import { Badge, Section } from '../components/ui.jsx'
import { execTeams } from '../data/execs.js'

const allMembers = execTeams.flatMap((group) =>
  group.members.map((m) => ({ ...m, team: group.team }))
)

function ExecCard({ member }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-purple-100 bg-white/80 overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/70 hover:shadow-card-hover">

      {/* Photo with bio overlay on hover */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <PlaceholderImage
          src={member.photo}
          alt={member.name}
          icon="person"
          label={null}
          ratio="aspect-[3/4]"
          rounded="rounded-none"
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {member.bio && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-t from-purple-950/95 via-purple-950/80 to-transparent px-4 pb-4 pt-10">
            <p className="text-xs leading-relaxed text-purple-100">{member.bio}</p>
          </div>
        )}
      </div>

      {/* Name / role / team / socials */}
      <div className="flex flex-col gap-2 p-4">
        <div>
          <p className="font-semibold leading-tight text-purple-950">{member.name}</p>
          <p className="text-xs font-semibold text-gold-600 mt-0.5">{member.role}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge className="text-[10px]">{member.team}</Badge>
          {member.socials?.instagram && (
            <a
              href={member.socials.instagram}
              aria-label={`${member.name} on Instagram`}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-100 text-purple-400 transition-colors hover:border-gold-400 hover:text-gold-600"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2ZM17.4 6.6h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Execs() {
  return (
    <div>
      <PageHero
        eyebrow="The People Behind It"
        title="Meet the Execs"
        description="A dedicated team of students volunteering their time to build the Warwick Asian Society community."
      />

      <Section>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {allMembers.map((member) => (
            <ExecCard key={member.name} member={member} />
          ))}
        </div>

        <div className="relative mt-16 overflow-hidden rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-10 text-center">
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
