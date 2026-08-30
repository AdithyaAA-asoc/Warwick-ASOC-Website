import { HeroBackdrop, KolamChain, KolamMedallion, TextileTrim } from './Motifs.jsx'
import { Eyebrow } from './ui.jsx'

export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 text-white">
      <TextileTrim className="absolute inset-x-0 top-0 h-3.5 w-full text-gold-400/70" />
      <HeroBackdrop className="absolute inset-0 h-full w-full opacity-90" />
      <KolamMedallion
        loops={10}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-gold-200/10"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-24 text-center sm:px-8 sm:py-28">
        {eyebrow && <Eyebrow className="text-gold-300">{eyebrow}</Eyebrow>}
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="max-w-2xl text-base leading-relaxed text-purple-200 sm:text-lg">{description}</p>}
        {children}
      </div>
      <KolamChain units={40} className="absolute inset-x-0 bottom-0 h-3 w-full text-gold-400/60" />
    </div>
  )
}
