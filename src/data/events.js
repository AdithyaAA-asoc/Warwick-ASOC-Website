// Event data — placeholder content for now.
// -----------------------------------------------------------------------
// This is structured so it can later be swapped for data fetched from a
// real events/ticketing API with minimal changes to the page component:
// replace the static imports in `Events.jsx` with a `fetch`/API call that
// returns objects shaped like these, and the cards/registration buttons
// will work unchanged. `ticketUrl: null` renders a disabled "Coming soon"
// button instead of a live link.

export const upcomingEvents = [
  {
    id: 'garba-night-2026',
    name: 'Garba & Dandiya Night',
    date: '2026-10-17',
    time: '7:00 PM – 11:00 PM',
    location: 'Warwick Students’ Union, The Copper Rooms',
    description:
      'Our flagship autumn celebration — live dhol, a Garba circle for all skill levels, and festival food stalls. Dandiya sticks provided.',
    image: null,
    ticketUrl: null,
    priceLabel: 'From £6',
  },
  {
    id: 'diwali-ball-2026',
    name: 'Diwali Ball',
    date: '2026-11-14',
    time: '7:30 PM – 12:30 AM',
    location: 'Woods-Scawen Room, Warwick Arts Centre',
    description:
      'A formal celebration of light — three-course dinner, cultural performances and a headline DJ set to close the night.',
    image: null,
    ticketUrl: null,
    priceLabel: 'From £28',
  },
  {
    id: 'culture-quiz-2026',
    name: 'Asian Culture Pub Quiz',
    date: '2026-09-25',
    time: '6:30 PM – 8:30 PM',
    location: 'The Dirty Duck, Students’ Union',
    description:
      'A laid-back social with a pub quiz spanning South & East Asian food, film, music and history. Teams of 4–6.',
    image: null,
    ticketUrl: null,
    priceLabel: 'Free',
  },
]

export const pastEvents = [
  {
    id: 'holi-2026',
    name: 'Holi Festival of Colours',
    date: '2026-03-14',
    time: '2:00 PM – 5:00 PM',
    location: 'Central Campus Piazza',
    description: 'Colour powder, music and dancing to welcome spring — one of our biggest turnouts yet.',
    image: null,
    ticketUrl: null,
    priceLabel: null,
  },
  {
    id: 'lunar-new-year-2026',
    name: 'Lunar New Year Social',
    date: '2026-02-06',
    time: '6:00 PM – 9:00 PM',
    location: 'Arthur Vick Common Room',
    description: 'A cosy welcome to the Year of the Horse with food, games and performances.',
    image: null,
    ticketUrl: null,
    priceLabel: null,
  },
]
