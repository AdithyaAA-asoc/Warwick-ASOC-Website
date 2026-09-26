import Stripe from 'https://esm.sh/stripe@16.2.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}

    if (meta.type === 'ticket') {
      return handleTicket(session, meta)
    } else {
      return handleMembership(session, meta)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// ─── Ticket ──────────────────────────────────────────────────────────────────

async function handleTicket(
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  const { eventId, eventName, eventDate, eventTime, eventLocation, releaseName, firstName, lastName, email, isMember } = meta

  if (!email) {
    return new Response('Missing email in ticket metadata', { status: 400 })
  }

  const ticketCode = crypto.randomUUID()

  const { error: insertErr } = await supabase.from('tickets').insert({
    event_id: eventId,
    first_name: firstName,
    last_name: lastName,
    email,
    ticket_code: ticketCode,
    stripe_session_id: session.id,
    paid: true,
    paid_at: new Date().toISOString(),
    price_paid_pence: session.amount_total ?? null,
    release_name: meta.releaseName ?? null,
    is_member: isMember === 'true',
  })

  // On duplicate session (webhook retry), retrieve the existing ticket code
  let finalCode = ticketCode
  if (insertErr) {
    if (insertErr.code !== '23505') {
      return new Response(`DB insert failed: ${insertErr.message}`, { status: 500 })
    }
    const { data } = await supabase
      .from('tickets')
      .select('ticket_code')
      .eq('stripe_session_id', session.id)
      .single()
    finalCode = data?.ticket_code ?? ticketCode
  } else {
    // Only increment sold count on a fresh insert, not a retry
    await supabase.rpc('increment_ticket_sold', { p_event_id: eventId })
  }

  const formattedDate = new Date(`${eventDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${finalCode}&color=170a2c&bgcolor=fdfbf6`

  const emailHtml = ticketEmailHtml({
    firstName,
    lastName,
    email,
    eventName,
    formattedDate,
    eventTime,
    eventLocation,
    releaseName: releaseName ?? '',
    ticketCode: finalCode,
    qrUrl,
    isMember: isMember === 'true',
  })

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'Warwick Asian Society <noreply@warwickasiansociety.social>',
      to: email,
      subject: `Your ticket for ${eventName} — Warwick Asian Society`,
      html: emailHtml,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    console.error(`[ticket email] Resend failed ${emailRes.status}: ${errBody}`)
  } else {
    console.log(`[ticket email] Sent to ${email} for ${eventName}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

function ticketEmailHtml(p: {
  firstName: string
  lastName: string
  email: string
  eventName: string
  formattedDate: string
  eventTime: string
  eventLocation: string
  releaseName: string
  ticketCode: string
  qrUrl: string
  isMember: boolean
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Ticket</title>
</head>
<body style="margin:0;padding:0;background:#fdfbf6;font-family:Georgia,serif;color:#17101f;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e9e2f8;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#170a2c 0%,#3b1078 100%);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d4a942;">Warwick Asian Society</p>
              <h1 style="margin:0;font-size:26px;font-weight:600;color:#fdf8ec;line-height:1.3;">Your Ticket</h1>
              <p style="margin:12px 0 0;font-size:15px;color:#c4b5fd;">${p.eventName}</p>
            </td>
          </tr>

          <!-- QR Code -->
          <tr>
            <td style="padding:36px 40px 24px;text-align:center;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b5f82;">Show this at the door</p>
              <img
                src="${p.qrUrl}"
                alt="Ticket QR code"
                width="180"
                height="180"
                style="display:block;margin:0 auto;border-radius:12px;border:1px solid #ede8f8;"
              />
              <p style="margin:12px 0 0;font-size:10px;font-family:monospace;color:#9c8db0;letter-spacing:0.05em;">${p.ticketCode}</p>
            </td>
          </tr>

          <!-- Event details -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede8f8;border-radius:12px;overflow:hidden;">
                <tr style="background:#f9f6ff;">
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#6b5f82;width:36%;">Event</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:700;color:#170a2c;">${p.eventName}</td>
                </tr>
                <tr>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Date</td>
                  <td style="padding:11px 16px;font-size:13px;color:#170a2c;border-top:1px solid #ede8f8;">${p.formattedDate}</td>
                </tr>
                <tr style="background:#f9f6ff;">
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Time</td>
                  <td style="padding:11px 16px;font-size:13px;color:#170a2c;border-top:1px solid #ede8f8;">${p.eventTime}</td>
                </tr>
                <tr>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Location</td>
                  <td style="padding:11px 16px;font-size:13px;color:#170a2c;border-top:1px solid #ede8f8;">${p.eventLocation}</td>
                </tr>
                <tr style="background:#f9f6ff;">
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Name</td>
                  <td style="padding:11px 16px;font-size:13px;color:#170a2c;border-top:1px solid #ede8f8;">${p.firstName} ${p.lastName}</td>
                </tr>
                <tr>
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Ticket type</td>
                  <td style="padding:11px 16px;font-size:13px;font-weight:700;color:${p.isMember ? '#7c3aed' : '#170a2c'};border-top:1px solid #ede8f8;">${p.releaseName}${p.isMember ? ' · Member price' : ' · Standard price'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#6b5f82;text-align:center;">
                Please have this QR code ready on your phone or printed. One ticket per person.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f0fb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b5f82;">Warwick Asian Society · University of Warwick</p>
              <p style="margin:0;font-size:12px;color:#6b5f82;">Questions? Email us at <a href="mailto:committee@warwickasiansociety.social" style="color:#7c3aed;">committee@warwickasiansociety.social</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Membership (unchanged logic) ────────────────────────────────────────────

async function handleMembership(
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  const { firstName, lastName, email, collegeYear } = meta

  if (!email) {
    return new Response('Missing member details in metadata', { status: 400 })
  }

  const { error: insertErr } = await supabase.from('members').insert({
    first_name: firstName,
    last_name: lastName,
    email,
    college_year: collegeYear,
    stripe_session_id: session.id,
    paid: true,
    paid_at: new Date().toISOString(),
  })

  if (insertErr && insertErr.code !== '23505') {
    return new Response(`DB insert failed: ${insertErr.message}`, { status: 500 })
  }

  const emailHtml = membershipEmailHtml({ firstName, lastName, email, collegeYear })

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'Warwick Asian Society <noreply@warwickasiansociety.social>',
      to: email,
      subject: `Welcome to Warwick Asian Society, ${firstName}!`,
      html: emailHtml,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text()
    console.error(`[membership email] Resend failed ${emailRes.status}: ${errBody}`)
  } else {
    console.log(`[membership email] Sent to ${email}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

function membershipEmailHtml(p: {
  firstName: string
  lastName: string
  email: string
  collegeYear: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Membership Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#fdfbf6;font-family:Georgia,serif;color:#17101f;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e9e2f8;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#170a2c 0%,#3b1078 100%);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d4a942;">Warwick Asian Society</p>
              <h1 style="margin:0;font-size:26px;font-weight:600;color:#fdf8ec;line-height:1.3;">Welcome to the Society!</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#c4b5fd;">Your membership for 2026/27 is confirmed.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#17101f;">Hi ${p.firstName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#44384f;">
                Thank you for joining Warwick Asian Society. You're now a full member for the 2026/27 academic year — here's a summary of your registration:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede8f8;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                <tr style="background:#f9f6ff;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;width:40%;">Name</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;">${p.firstName} ${p.lastName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Email</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;border-top:1px solid #ede8f8;">${p.email}</td>
                </tr>
                <tr style="background:#f9f6ff;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Year of Study</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;border-top:1px solid #ede8f8;">${p.collegeYear}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Membership</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;border-top:1px solid #ede8f8;">Annual 2026/27 · £11</td>
                </tr>
                <tr style="background:#f9f6ff;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Status</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#16a34a;border-top:1px solid #ede8f8;">✓ Paid &amp; Active</td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;line-height:1.6;color:#44384f;">
                We can't wait to see you at an event soon!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f0fb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b5f82;">Warwick Asian Society · University of Warwick</p>
              <p style="margin:0;font-size:12px;color:#6b5f82;">Questions? Email us at <a href="mailto:committee@warwickasiansociety.social" style="color:#7c3aed;">committee@warwickasiansociety.social</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
