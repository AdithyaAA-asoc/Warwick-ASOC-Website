# Warwick Asian Society — Website

A modern, purple-and-gold website for Warwick Asian Society, built with React, React Router and Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build      # production build -> dist/
npm run preview    # preview the production build locally
```

`dist/` after `npm run build` is a normal static site — deploy it to
Netlify, Vercel, GitHub Pages, or any static web host. Routing uses
`HashRouter` (URLs look like `/#/events`) specifically so it works on
any static host with zero server configuration, and even works if you
just double-click `dist/index.html` to open it locally.

There is also `npm run build:preview`, which produces a single
self-contained `dist-preview/index.html` file (everything inlined) —
handy for quickly sharing a one-file preview, but not meant for real
deployment.

## Project structure

```
src/
  components/       Shared UI building blocks (Navbar, Footer, Card,
                     Button, Section, PlaceholderImage, decorative
                     SVG motifs, etc.) — reuse these rather than writing
                     new one-off markup so the site stays consistent.
  data/
    execs.js         Exec team data — edit this to update Meet the Execs.
    events.js         Event data — edit this to update Events.
  pages/
    About.jsx
    Execs.jsx
    Events.jsx
    Membership.jsx
  App.jsx             Routes
  index.css           Design tokens (colours, fonts, shadows) + Tailwind
```

## Adding your real branding & photos

Every image on the site currently renders as a soft placeholder box
(via the `PlaceholderImage` component) so the layout is fully built
but nothing is hard-coded. To swap in a real asset:

1. Put the image file in `public/images/...` (create subfolders as you like,
   e.g. `public/images/execs/`, `public/images/events/`).
2. Pass its path as the `src` prop, e.g.:
   ```jsx
   <PlaceholderImage src="/images/execs/ananya-rao.jpg" alt="Ananya Rao" />
   ```
   The component automatically renders a real `<img>` instead of the
   placeholder — no other code changes needed.
3. For the logo specifically, edit `src/components/Navbar.jsx` and
   `src/components/Footer.jsx` where the placeholder logo is used.

## Updating execs

Edit `src/data/execs.js`. Each team is a group with a `team` name and a
`members` array; each member has `name`, `role`, `bio`, an optional
`photo` path, and a `socials` object (`instagram`, `linkedin`, `email`
— add/remove keys as needed, matching the icons available in
`Execs.jsx`).

## Updating events

Edit `src/data/events.js`. `upcomingEvents` and `pastEvents` are plain
arrays of event objects (`id`, `name`, `date`, `time`, `location`,
`description`, `image`, `ticketUrl`, `priceLabel`).

**Connecting a real events/ticketing system later:** replace the
static imports at the top of `src/pages/Events.jsx` with a `fetch`/API
call that resolves to arrays shaped the same way, and set `ticketUrl`
to a real link — the "Register Now" button will light up automatically
(it currently shows "Tickets Coming Soon" whenever `ticketUrl` is
`null`).

## Membership page

The Membership page (`src/pages/Membership.jsx`) is intentionally
frontend-only for now: the "Sign Up" button is disabled and labelled
"Coming Soon". When you have a real membership/payment flow (e.g. a
Students' Union portal link, or your own checkout with Stripe +
authentication), that button and the `#join` section are the natural
place to wire it in.

## Design system

Colours, fonts and shadows are defined once in `src/index.css` under
`@theme` (Tailwind v4's CSS-based config) — change a value there and it
updates everywhere. The palette is deep purple (`purple-950`…`purple-50`)
paired with warm gold (`gold-700`…`gold-50`), plus decorative Indian
geometric motifs (rangoli medallions, corner flourishes, dot borders)
in `src/components/Motifs.jsx`, used sparingly as accents.

## Adding more pages later

Add a new file under `src/pages/`, then register it as a `<Route>` in
`src/App.jsx` (it will automatically get the shared Navbar/Footer via
the `Layout` wrapper) and a link in `src/components/Navbar.jsx` /
`Footer.jsx`. Good candidates: a Gallery page, a Sponsors page, or a
members-only dashboard once authentication is added.
