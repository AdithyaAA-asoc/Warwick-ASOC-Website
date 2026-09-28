import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { email } = await req.json()
  if (!email) {
    return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: corsHeaders })
  }

  const { data: member } = await supabase
    .from('members')
    .select('first_name, last_name, email, college_year, paid')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (!member) {
    return new Response(JSON.stringify({ error: 'Member not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  if (!member.paid) {
    return new Response(JSON.stringify({ error: 'Member has not paid' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'Warwick Asian Society <noreply@warwickasiansociety.social>',
      to: member.email,
      subject: `Welcome to Warwick Asian Society, ${member.first_name}!`,
      html: membershipEmailHtml({
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        collegeYear: member.college_year,
      }),
    }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.text()
    console.error(`[resend-member-email] failed ${emailRes.status}: ${err}`)
    return new Response(JSON.stringify({ error: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  console.log(`[resend-member-email] Sent to ${member.email}`)
  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})

function membershipEmailHtml(p: { firstName: string; lastName: string; email: string; collegeYear: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#fdfbf6;font-family:Georgia,serif;color:#17101f;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e9e2f8;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#170a2c 0%,#3b1078 100%);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d4a942;">Warwick Asian Society</p>
            <h1 style="margin:0;font-size:26px;font-weight:600;color:#fdf8ec;">Welcome to the Society!</h1>
            <p style="margin:12px 0 0;font-size:14px;color:#c4b5fd;">Your membership for 2026/27 is confirmed.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#17101f;">Hi ${p.firstName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#44384f;">
              Thank you for joining Warwick Asian Society. You're now a full member for the 2026/27 academic year.
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
            <p style="margin:0;font-size:15px;line-height:1.6;color:#44384f;">We can't wait to see you at an event soon!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f3f0fb;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#6b5f82;">Warwick Asian Society · University of Warwick</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
