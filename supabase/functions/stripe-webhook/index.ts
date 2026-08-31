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
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { firstName, lastName, email, collegeYear } = session.metadata ?? {}

    if (!email) {
      return new Response('Missing member details in metadata', { status: 400 })
    }

    // Insert member now that payment is confirmed — ignore duplicate emails
    const { error: insertErr } = await supabase
      .from('members')
      .insert({
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

    const emailHtml = `
<!DOCTYPE html>
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
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#17101f;">Hi ${firstName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#44384f;">
                Thank you for joining Warwick Asian Society. You're now a full member for the 2026/27 academic year — here's a summary of your registration:
              </p>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede8f8;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                <tr style="background:#f9f6ff;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;width:40%;">Name</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Email</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;border-top:1px solid #ede8f8;">${email}</td>
                </tr>
                <tr style="background:#f9f6ff;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Year of Study</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;border-top:1px solid #ede8f8;">${collegeYear}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Membership</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#170a2c;border-top:1px solid #ede8f8;">Annual 2026/27 · £11</td>
                </tr>
                <tr style="background:#f9f6ff;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b5f82;border-top:1px solid #ede8f8;">Status</td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#16a34a;border-top:1px solid #ede8f8;">✓ Paid & Active</td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44384f;">
                We'll be in touch with invitations to upcoming events and everything happening throughout the year. Keep an eye on your inbox and our social channels.
              </p>
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

    await fetch('https://api.resend.com/emails', {
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
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
