import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY    = import.meta.env.VITE_SUPABASE_ANON_KEY

function fmt(dateStr) {
  if (!dateStr) return ''
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Ticket() {
  const { code } = useParams()
  const [ticket, setTicket] = useState(null)  // null = loading, false = not found
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) { setLoading(false); setTicket(false); return }
    fetch(`${SUPABASE_URL}/rest/v1/rpc/get_ticket_by_code`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_code: code }),
    })
      .then((r) => r.json())
      .then((data) => {
        setTicket(Array.isArray(data) && data.length > 0 ? data[0] : false)
      })
      .catch(() => setTicket(false))
      .finally(() => setLoading(false))
  }, [code])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Warwick Asian Society</p>
          <p className="text-sm font-semibold text-gray-500">Ticket Verification</p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-sm text-gray-400">Checking ticket…</p>
          </div>
        )}

        {!loading && ticket === false && (
          <div className="rounded-2xl bg-white border border-red-100 shadow-sm overflow-hidden">
            <div className="bg-red-600 px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <p className="text-xl font-bold text-white">Invalid Ticket</p>
              <p className="mt-1 text-sm text-red-100">This ticket could not be found or has not been paid for.</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="font-mono text-xs text-gray-400 break-all">{code}</p>
            </div>
          </div>
        )}

        {!loading && ticket && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Valid banner */}
            <div className="bg-green-600 px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-xl font-bold text-white">Valid Ticket</p>
              <p className="mt-1 text-sm text-green-100">Admit one</p>
            </div>

            {/* Ticket details */}
            <div className="divide-y divide-gray-50">
              <Row label="Event"    value={ticket.event_name ?? ticket.event_id} bold />
              <Row label="Date"     value={fmt(ticket.event_date)} />
              <Row label="Time"     value={ticket.event_time} />
              <Row label="Name"     value={`${ticket.first_name} ${ticket.last_name}`} bold />
              <Row label="Email"    value={ticket.email} />
              {ticket.release_name && (
                <Row
                  label="Ticket type"
                  value={`${ticket.release_name} · ${ticket.is_member ? 'Member price' : 'Standard price'}`}
                />
              )}
              {ticket.price_paid_pence != null && (
                <Row
                  label="Paid"
                  value={ticket.price_paid_pence === 0 ? 'Free' : `£${(ticket.price_paid_pence / 100).toFixed(2)}`}
                />
              )}
              <Row
                label="Purchased"
                value={ticket.paid_at ? new Date(ticket.paid_at).toLocaleString('en-GB') : '—'}
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 text-center">
              <p className="font-mono text-[10px] text-gray-400 break-all">{code}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Row({ label, value, bold = false }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <span className={`text-right text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{value}</span>
    </div>
  )
}
