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
    const { memberId, email, firstName, lastName } = await req.json()

    const origin = req.headers.get('origin') ?? Deno.env.get('SITE_URL')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Warwick Asian Society — Annual Membership 2026/27',
              description: 'Full access to events, socials and member benefits for the academic year.',
            },
            unit_amount: 800,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${origin}/#/membership?payment=success`,
      cancel_url: `${origin}/#/membership?payment=cancelled`,
      metadata: { memberId, firstName, lastName },
    })

    await supabase
      .from('members')
      .update({ stripe_session_id: session.id })
      .eq('id', memberId)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
