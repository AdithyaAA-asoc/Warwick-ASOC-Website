import Stripe from 'https://esm.sh/stripe@16.2.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { eventId, eventName, eventDate, eventTime, eventLocation, firstName, lastName, email } =
      await req.json()

    // ── 1. Sold-out check ────────────────────────────────────────────────────
    const { data: inv } = await supabase
      .from('event_inventory')
      .select('capacity, sold')
      .eq('event_id', eventId)
      .maybeSingle()

    if (inv && inv.sold >= inv.capacity) {
      return new Response(JSON.stringify({ error: 'sold_out' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Active release — price is set here, not by the client ────────────
    const today = new Date().toISOString().split('T')[0]
    const { data: release } = await supabase
      .from('event_releases')
      .select('name, price_pence, member_price_pence, members_only')
      .eq('event_id', eventId)
      .lte('start_date', today)
      .gte('end_date', today)
      .maybeSingle()

    if (!release) {
      return new Response(JSON.stringify({ error: 'no_active_release' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Member check — server-side ────────────────────────────────────────
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .eq('paid', true)
      .maybeSingle()

    const isMember = !!member

    if (release.members_only && !isMember) {
      return new Response(JSON.stringify({ error: 'members_only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const finalPricePence: number = isMember ? release.member_price_pence : release.price_pence

    // ── 4. Create Stripe session ─────────────────────────────────────────────
    const origin = req.headers.get('origin') ?? Deno.env.get('SITE_URL')
    const connectAccountId = Deno.env.get('STRIPE_CONNECT_ACCOUNT_ID')
    const feePercent = parseFloat(Deno.env.get('SOCIETY_FEE_PERCENT') ?? '0.10')

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: eventName,
              description: `${release.name} · ${isMember ? 'Member price' : 'Standard price'} · ${eventDate}`,
            },
            unit_amount: finalPricePence,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ...(finalPricePence === 0 ? { payment_method_collection: 'if_required' } : {}),
      customer_email: email.trim().toLowerCase(),
      success_url: `${origin}/#/events?payment=success&event=${eventId}`,
      cancel_url: `${origin}/#/events?payment=cancelled&event=${eventId}`,
      metadata: {
        type: 'ticket',
        eventId,
        eventName,
        eventDate,
        eventTime,
        eventLocation,
        releaseName: release.name,
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        isMember: String(isMember),
      },
    }

    if (connectAccountId && finalPricePence > 0) {
      sessionParams.application_fee_amount = Math.round(finalPricePence * feePercent)
      sessionParams.transfer_data = { destination: connectAccountId }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return new Response(JSON.stringify({ url: session.url, isMember, releaseName: release.name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
