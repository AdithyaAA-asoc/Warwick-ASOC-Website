# Stripe

## Overview

Stripe handles all payments — event tickets and society membership. Two Supabase Edge Functions do the work:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `create-ticket-checkout` | Called by the frontend | Validates release & capacity, creates a Stripe Checkout session |
| `stripe-webhook` | Called by Stripe | On payment success: inserts ticket row, increments inventory, sends QR email |

---

## Secrets (set in Supabase → Edge Functions → Secrets)

| Secret | Where to get it |
|--------|----------------|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → your endpoint → Signing secret |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `SITE_URL` | Your deployed URL e.g. `https://yourorg.github.io/warwickasiansociety` |
| `STRIPE_CONNECT_ACCOUNT_ID` | Treasurer's Stripe `acct_...` ID *(optional — for split payments)* |
| `SOCIETY_FEE_PERCENT` | e.g. `0.10` for 10% society cut, `0` for no cut *(default: 0.10)* |

---

## Payment flow

```
User clicks "Get Tickets"
  → fills name + email in modal
  → frontend calls create-ticket-checkout edge function
      → checks inventory (sold_out?)
      → looks up active release for today's date (price set server-side)
      → checks if email is a paid member (member price?)
      → creates Stripe Checkout session
  → user redirected to Stripe payment page
  → user pays
  → Stripe redirects to /#/events?payment=success
  → Stripe fires checkout.session.completed webhook
      → stripe-webhook edge function runs
      → inserts row into tickets table (ticket_code UUID = the QR code)
      → increments event_inventory.sold
      → sends QR code email via Resend
```

The price is **always determined server-side** — the client only sends the event ID, name and buyer details. The edge function looks up the active release from the database.

---

## Webhook setup

1. Go to **Stripe → Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://<your-supabase-project>.supabase.co/functions/v1/stripe-webhook`
3. Events to listen for: `checkout.session.completed`
4. Copy the **Signing secret** and paste it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

To test without a real payment: **Stripe → Webhooks → your endpoint → Send test event** → select `checkout.session.completed`. Then check **Supabase → Edge Functions → stripe-webhook → Logs**.

---

## Stripe Connect (treasurer split)

When `STRIPE_CONNECT_ACCOUNT_ID` is set, ticket revenue is split automatically:

- The **society fee** (`SOCIETY_FEE_PERCENT` × ticket price) stays in your Stripe account
- The **remainder** transfers to the treasurer's connected Stripe account
- Stripe's own processing fees are charged on top

### Setup steps

1. Go to **Stripe → Settings → Connect** and invite the treasurer's Stripe account
2. Treasurer accepts the invite and completes identity verification in their dashboard
3. Treasurer shares their account ID (starts with `acct_...`)
4. Paste it as `STRIPE_CONNECT_ACCOUNT_ID` in Supabase secrets

If `STRIPE_CONNECT_ACCOUNT_ID` is not set, all money goes to your own Stripe account — safe to leave unset while testing.

---

## Free events

If a release has `price_pence = 0` and `member_price_pence = 0`, Stripe Checkout is created in `payment_method_collection: 'if_required'` mode — no card is needed and no charge is made. The ticket is still inserted and the QR email is still sent.

---

## Duplicate webhook protection

Stripe may fire the same webhook more than once (retries). The `stripe_session_id` column on the `tickets` table has a `UNIQUE` constraint — on a duplicate insert the webhook retrieves the existing `ticket_code` instead of creating a second ticket, so the email is not re-sent.
