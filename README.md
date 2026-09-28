# Warwick Asian Society — Website

A modern, purple-and-gold website for Warwick Asian Society, built with React, React Router and Tailwind CSS v4, backed by Supabase (database + storage), Stripe (payments) and Resend (email).

## Quick start

```bash
npm install
npm run dev        # local dev server at localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

Create a `.env` file at the project root (never commit it):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_ADMIN_PASSWORD=choose_a_strong_password
```

## Developer docs

Full documentation lives in the [`docs/`](./docs/) folder:

- [Stripe — payments, webhook, Connect](./docs/stripe.md)
- [Admin Dashboard — events, tickets, members](./docs/admin.md)
- [Resend — email setup and debugging](./docs/resend.md)
- [Deployment — GitHub Actions, environment variables](./docs/deployment.md)

## Project structure

```
src/
  components/       Shared UI (Navbar, Footer, Card, Button, PlaceholderImage, Motifs)
  context/          TicketModalContext — ticket purchase modal state
  pages/
    About.jsx
    Execs.jsx
    Events.jsx        Public events page with ticket purchasing and QR lookup
    Membership.jsx    Society membership signup
    Admin.jsx         Password-protected admin dashboard
  App.jsx             Routes
  index.css           Design tokens + Tailwind

supabase/
  setup.sql           Full DB schema, RLS policies, seed data — run once in SQL Editor
  functions/
    create-ticket-checkout/   Creates Stripe Checkout session
    stripe-webhook/           Handles payment confirmation, inserts ticket, sends email
docs/               Developer documentation
.github/workflows/  GitHub Actions deploy pipeline
```

## Design system

Colours, fonts and shadows are defined in `src/index.css` under `@theme` (Tailwind v4). Deep purple (`purple-950`…`purple-50`) paired with warm gold (`gold-700`…`gold-50`). Decorative Indian geometric motifs (rangoli medallions, kolam chains) in `src/components/Motifs.jsx`.
