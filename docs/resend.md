# Resend (Email)

Transactional emails (ticket QR codes, membership confirmations) are sent via [Resend](https://resend.com) from `noreply@warwickasiansociety.social`.

---

## Setup

### 1. Create a Resend account and API key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys → Create API Key**
3. Copy the key immediately — it is only shown once
4. Paste it as `RESEND_API_KEY` in **Supabase → Edge Functions → Secrets**

> If you lose the key, create a new one in Resend and update the Supabase secret. The old key remains valid until you delete it.

### 2. Verify the domain

Resend will reject emails from an unverified domain. To verify `warwickasiansociety.social`:

1. **Resend → Domains → Add Domain** → enter `warwickasiansociety.social`
2. Resend shows a set of DNS records to add (SPF, DKIM — usually 3–4 records)
3. Add those records in your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.)
4. Back in Resend click **Verify** — propagation can take a few minutes

Once the domain shows as **Verified**, emails will send successfully.

---

## Testing

### Test Resend directly (bypasses Stripe and the webhook)

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Warwick Asian Society <noreply@warwickasiansociety.social>",
    "to": "you@example.com",
    "subject": "Resend test",
    "html": "<p>If you got this, Resend is working.</p>"
  }'
```

Expected success response:
```json
{"id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
```

Common error responses:

| Status | Message | Fix |
|--------|---------|-----|
| 401 | API key invalid | Regenerate key in Resend, update Supabase secret |
| 403 | Domain not verified | Complete domain verification steps above |
| 422 | Invalid `from` address | Ensure domain matches the verified domain |

### Test the full webhook flow

1. Go to **Stripe → Developers → Webhooks → your endpoint**
2. Click **Send test event** → select `checkout.session.completed`
3. Immediately check **Supabase → Edge Functions → stripe-webhook → Logs**

You will see one of:
```
[ticket email] Sent to buyer@example.com for Garba Night
```
or an error with the full Resend response:
```
[ticket email] Resend failed 403: {"message":"Domain not verified..."}
```

---

## Emails sent

### Ticket confirmation

Sent after a successful ticket payment. Contains:
- QR code image (generated via `api.qrserver.com`, embedded as `<img>`)
- Event name, date, time, location
- Buyer name, ticket type (release + member/standard), ticket UUID

### Membership confirmation

Sent after a successful membership payment. Contains:
- Member name, email, year of study
- Membership status (Paid & Active)

---

## Debugging

All Resend calls now log to **Supabase → Edge Functions → stripe-webhook → Logs**. If an email fails silently:

1. Check the logs for `[ticket email] Resend failed` or `[membership email] Resend failed`
2. The log line includes the HTTP status and full error body from Resend
3. Cross-check with **Resend dashboard → Emails** — every send attempt (success or failure) appears there
