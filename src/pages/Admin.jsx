import { useEffect, useRef, useState } from 'react'
import { EventCard } from './Events.jsx'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin'

// ── DB helpers ────────────────────────────────────────────────────────────────

const headers = (extra = {}) => ({
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  ...extra,
})

const get = (path) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: headers() }).then((r) => r.json())

async function deleteStorageImage(url) {
  if (!url || !url.includes('/storage/v1/object/')) return
  const match = url.match(/\/storage\/v1\/object\/(?:public\/)?event-images\/(.+)/)
  if (!match) return
  await fetch(`${SUPABASE_URL}/storage/v1/object/event-images/${match[1]}`, {
    method: 'DELETE',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  })
}

const post = (table, body) =>
  fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(body),
  })

const patch = (table, filter, body) =>
  fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(body),
  })

const del = (table, filter) =>
  fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: headers(),
  })

async function uploadImage(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${Date.now()}.${ext}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/event-images/${path}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  })
  if (!res.ok) throw new Error('Image upload failed')
  return `${SUPABASE_URL}/storage/v1/object/public/event-images/${path}`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name) {
  return name.toLowerCase().replace(/[^\w\s]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function poundsToPane(val) {
  return Math.round(parseFloat(val || 0) * 100)
}

function penceToPounds(p) {
  return (p / 100).toFixed(2)
}

const EMPTY_RELEASE = () => ({
  _key: crypto.randomUUID(),
  name: '',
  start_date: '',
  end_date: '',
  price_pence: 0,
  member_price_pence: 0,
})

const EMPTY_EVENT = () => ({
  id: '',
  name: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  image_url: '',
  ticket_capacity: '',
  is_past: false,
  published: false,
})

// ── Shared input styles ───────────────────────────────────────────────────────

const inp = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition disabled:opacity-50'
const lbl = 'mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide'

// ── Top-level component ───────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('asoc_admin') === '1')

  function handleLogin() {
    sessionStorage.setItem('asoc_admin', '1')
    setAuthed(true)
  }
  function handleLogout() {
    sessionStorage.removeItem('asoc_admin')
    window.location.href = '/#/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-950 px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Warwick Asian Society</p>
            <h1 className="font-display text-lg font-semibold text-white">Admin Dashboard</h1>
          </div>
          {authed && (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-purple-700 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-900"
            >
              Log out
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {authed ? <Dashboard /> : <LoginScreen onLogin={handleLogin} />}
      </main>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError('Incorrect password.')
      setPassword('')
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 font-display text-2xl font-semibold text-purple-950">Admin Login</h2>
        <p className="mb-6 text-sm text-gray-500">Enter your admin password to continue.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={lbl} htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className={inp}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-purple-900 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Shared utility ────────────────────────────────────────────────────────────

function exportCSV(rows, columns, filename) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = c.format ? c.format(row[c.key], row) : (row[c.key] ?? '')
      const str = String(val).replace(/"/g, '""')
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
    }).join(','),
  ).join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function SortTh({ label, col, sort, onSort }) {
  const active = sort.col === col
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-purple-700"
      onClick={() => onSort(col)}
    >
      {label}
      <span className="ml-1 inline-block w-3 text-center">
        {active ? (sort.dir === 'asc' ? '↑' : '↓') : <span className="opacity-20">↕</span>}
      </span>
    </th>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const [tab, setTab] = useState('events') // 'events' | 'tickets' | 'members'
  const [toast, setToast] = useState('')

  // ── Events state ──
  const [events, setEvents] = useState([])
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)

  async function loadData() {
    setLoading(true)
    const [evts, rels] = await Promise.all([
      get('events?order=event_date.asc'),
      get('event_releases?order=start_date.asc'),
    ])
    setEvents(Array.isArray(evts) ? evts : [])
    setReleases(Array.isArray(rels) ? rels : [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function openEdit(event) { setEditing(event); setView('edit') }
  function openCreate() { setEditing(null); setView('create') }
  function backToList() { setEditing(null); setView('list') }

  async function handleSave(eventData, releasesData) {
    const isNew = view === 'create'
    const eventId = eventData.id
    if (isNew) {
      const r = await post('events', eventData)
      if (!r.ok) { showToast('Failed to save event.'); return }
    } else {
      const r = await patch('events', `id=eq.${eventId}`, eventData)
      if (!r.ok) { showToast('Failed to update event.'); return }
    }
    await del('event_releases', `event_id=eq.${eventId}`)
    if (releasesData.length > 0) {
      const rows = releasesData.map(({ _key, ...r }) => ({ ...r, event_id: eventId }))
      await post('event_releases', rows)
    }
    if (eventData.ticket_capacity) {
      const existing = await get(`event_inventory?event_id=eq.${eventId}`)
      if (Array.isArray(existing) && existing.length === 0) {
        await post('event_inventory', { event_id: eventId, capacity: eventData.ticket_capacity, sold: 0 })
      } else {
        await patch('event_inventory', `event_id=eq.${eventId}`, { capacity: eventData.ticket_capacity })
      }
    }
    // Delete old image from storage if it was replaced
    if (!isNew && editing?.image_url && editing.image_url !== eventData.image_url) {
      await deleteStorageImage(editing.image_url)
    }

    showToast(isNew ? 'Event created!' : 'Event updated!')
    await loadData()
    backToList()
  }

  async function handleDelete(eventId) {
    if (!confirm('Delete this event and all its releases? This cannot be undone.')) return
    await del('event_releases', `event_id=eq.${eventId}`)
    await del('event_inventory', `event_id=eq.${eventId}`)
    await del('events', `id=eq.${eventId}`)
    showToast('Event deleted.')
    await loadData()
    backToList()
  }

  const TABS = [
    { key: 'events',  label: 'Events' },
    { key: 'tickets', label: 'Tickets' },
    { key: 'members', label: 'Members' },
  ]

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-purple-950 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Tab bar — hide when editing an event */}
      {view === 'list' && (
        <div className="mb-8 flex gap-1 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-purple-700 text-purple-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'events' && view === 'list' && (
        <EventsList events={events} releases={releases} loading={loading} onEdit={openEdit} onCreate={openCreate} />
      )}
      {tab === 'events' && (view === 'edit' || view === 'create') && (
        <EventForm
          key={editing?.id ?? 'new'}
          event={editing}
          releases={releases.filter((r) => r.event_id === editing?.id)}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={backToList}
          isNew={view === 'create'}
        />
      )}
      {tab === 'tickets' && <TicketsManagement />}
      {tab === 'members' && <MembersManagement />}
    </div>
  )
}

// ── Events List ───────────────────────────────────────────────────────────────

function EventsList({ events, releases, loading, onEdit, onCreate }) {
  const [editDropdown, setEditDropdown] = useState(false)
  const upcoming = events.filter((e) => !e.is_past)
  const past = events.filter((e) => e.is_past)
  const allEvents = [...upcoming, ...past]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-5 text-xl font-semibold text-gray-900">Events</h2>

        {/* Action cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Create */}
          <button
            onClick={onCreate}
            className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-5 text-left transition hover:border-purple-400 hover:bg-purple-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-900 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-purple-900">Create New Event</p>
              <p className="text-xs text-gray-500">Set up a new upcoming event with ticket releases</p>
            </div>
          </button>

          {/* Edit */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">Edit Existing Event</p>
                <p className="mb-2 text-xs text-gray-500">Select an event to edit its details and releases</p>
                {loading ? (
                  <p className="text-xs text-gray-400">Loading…</p>
                ) : (
                  <select
                    className={inp}
                    defaultValue=""
                    onChange={(e) => {
                      const event = allEvents.find((ev) => ev.id === e.target.value)
                      if (event) onEdit(event)
                    }}
                  >
                    <option value="" disabled>Select an event…</option>
                    {upcoming.length > 0 && (
                      <optgroup label="Upcoming">
                        {upcoming.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} — {new Date(`${e.event_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {past.length > 0 && (
                      <optgroup label="Past">
                        {past.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} — {new Date(`${e.event_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading events…</p>
      ) : (
        <div className="space-y-6">
          <EventTable title="Upcoming" events={upcoming} releases={releases} onEdit={onEdit} />
          <EventTable title="Past"     events={past}     releases={releases} onEdit={onEdit} />
        </div>
      )}
    </div>
  )
}

function EventTable({ title, events, releases, onEdit }) {
  if (events.length === 0) return null
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h3>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Releases</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => {
              const evtReleases = releases.filter((r) => r.event_id === e.id)
              return (
                <tr
                  key={e.id}
                  className={`border-b border-gray-50 transition hover:bg-purple-50/40 ${i === events.length - 1 ? 'border-none' : ''}`}
                >
                  <td className="px-5 py-3.5 font-medium text-gray-900">{e.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(`${e.event_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    {evtReleases.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {evtReleases.map((r) => (
                          <span key={r.id} className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                            {r.name} £{penceToPounds(r.price_pence)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{e.ticket_capacity ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {e.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onEdit(e)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-purple-300 hover:text-purple-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Event Form ────────────────────────────────────────────────────────────────

function EventForm({ event, releases: initialReleases, onSave, onDelete, onCancel, isNew }) {
  const [form, setForm] = useState(() =>
    event ? { ...event } : EMPTY_EVENT(),
  )
  const [releases, setReleases] = useState(() =>
    initialReleases.map((r) => ({ ...r, _key: crypto.randomUUID() })),
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileRef = useRef()

  // Auto-generate ID from name for new events
  function setName(val) {
    setForm((f) => ({
      ...f,
      name: val,
      ...(isNew ? { id: toSlug(val) } : {}),
    }))
  }

  function setField(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm((f) => ({ ...f, image_url: url }))
    } catch {
      alert('Image upload failed. Make sure the event-images bucket exists in Supabase Storage.')
    } finally {
      setUploading(false)
    }
  }

  function addRelease() {
    setReleases((r) => [...r, EMPTY_RELEASE()])
  }

  function removeRelease(key) {
    setReleases((r) => r.filter((x) => x._key !== key))
  }

  function updateRelease(key, field, value) {
    setReleases((r) =>
      r.map((x) =>
        x._key === key
          ? {
              ...x,
              [field]:
                field === 'price_pence' || field === 'member_price_pence'
                  ? poundsToPane(value)
                  : value,
            }
          : x,
      ),
    )
  }

  const EMPTY_RELEASE_WITH_KEY = () => ({ ...EMPTY_RELEASE(), members_only: false })

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const eventData = {
      ...form,
      ticket_capacity: form.ticket_capacity ? parseInt(form.ticket_capacity) : null,
    }
    await onSave(eventData, releases)
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {isNew ? 'New Event' : `Edit: ${event.name}`}
        </h2>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-purple-300 hover:text-purple-700"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {showPreview
              ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><path d="M1 1l22 22" /></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
            }
          </svg>
          {showPreview ? 'Hide preview' : 'Preview'}
        </button>
      </div>

      {showPreview && <EventPreview form={form} releases={releases} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-400">Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={lbl} htmlFor="ef-name">Event name</label>
              <input id="ef-name" type="text" required value={form.name} onChange={(e) => setName(e.target.value)} className={inp} placeholder="Garba & Dandiya Night" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl} htmlFor="ef-id">
                URL slug {isNew ? '(auto-generated)' : '(read-only)'}
              </label>
              <input
                id="ef-id"
                type="text"
                required
                value={form.id}
                onChange={isNew ? setField('id') : undefined}
                readOnly={!isNew}
                className={inp + (!isNew ? ' bg-gray-50 text-gray-400 cursor-not-allowed' : '')}
                placeholder="garba-dandiya-night-2026"
              />
            </div>
            <div>
              <label className={lbl} htmlFor="ef-date">Date</label>
              <input id="ef-date" type="date" required value={form.event_date} onChange={setField('event_date')} className={inp} />
            </div>
            <div>
              <label className={lbl} htmlFor="ef-time">Time</label>
              <input id="ef-time" type="text" required value={form.event_time} onChange={setField('event_time')} className={inp} placeholder="7:00 PM – 11:00 PM" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl} htmlFor="ef-location">Location</label>
              <input id="ef-location" type="text" required value={form.location} onChange={setField('location')} className={inp} placeholder="Warwick SU, The Copper Rooms" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl} htmlFor="ef-desc">Description</label>
              <textarea id="ef-desc" rows={3} value={form.description} onChange={setField('description')} className={inp + ' resize-none'} placeholder="A short description of the event…" />
            </div>
            <div>
              <label className={lbl} htmlFor="ef-cap">Ticket capacity</label>
              <input id="ef-cap" type="number" min="1" value={form.ticket_capacity ?? ''} onChange={setField('ticket_capacity')} className={inp} placeholder="200" />
            </div>
            <div className="flex items-end pb-2 gap-6">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={form.is_past} onChange={setField('is_past')} className="h-4 w-4 rounded border-gray-300 accent-purple-700" />
                <span className="text-sm font-semibold text-gray-700">Mark as past event</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={form.published ?? false} onChange={setField('published')} className="h-4 w-4 rounded border-gray-300 accent-green-600" />
                <span className="text-sm font-semibold text-green-700">Published (visible to users)</span>
              </label>
            </div>
          </div>
        </section>

        {/* Image */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-400">Event Image</h3>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" className="h-28 w-44 rounded-xl object-cover border border-gray-200 shrink-0" />
            ) : (
              <div className="flex h-28 w-44 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400">
                No image
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-300 hover:text-purple-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
              <div>
                <label className={lbl} htmlFor="ef-imgurl">Or paste image URL</label>
                <input id="ef-imgurl" type="url" value={form.image_url ?? ''} onChange={setField('image_url')} className={inp} placeholder="https://…" />
              </div>
              <p className="text-xs text-gray-400">Requires an <code>event-images</code> bucket in Supabase Storage (see setup guide).</p>
            </div>
          </div>
        </section>

        {/* Releases */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Ticket Releases</h3>
            <button
              type="button"
              onClick={addRelease}
              className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Release
            </button>
          </div>

          {releases.length === 0 ? (
            <p className="rounded-xl bg-gray-50 py-6 text-center text-sm text-gray-400">
              No releases yet — click "Add Release" to set ticket prices and dates.
            </p>
          ) : (
            <div className="space-y-4">
              {releases.map((r) => (
                <ReleaseRow
                  key={r._key}
                  release={r}
                  onChange={(field, val) => updateRelease(r._key, field, val)}
                  onRemove={() => removeRelease(r._key)}
                />
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-gray-400">
            Tip: set the last release's end date to the event date — tickets automatically close after the event.
          </p>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-purple-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : isNew ? 'Create Event' : 'Save Changes'}
            </button>
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300">
              Cancel
            </button>
          </div>
          {!isNew && (
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete Event
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function EventPreview({ form, releases }) {
  const capacity = form.ticket_capacity ? parseInt(form.ticket_capacity) : null
  const avail = capacity ? { capacity, sold: 0, remaining: capacity } : undefined

  const event = {
    id: form.id,
    name: form.name,
    date: form.event_date,
    time: form.event_time,
    location: form.location,
    description: form.description,
    image: form.image_url,
    ticketCapacity: capacity,
    releases: releases
      .map((r) => ({
        name: r.name,
        startDate: r.start_date,
        endDate: r.end_date,
        pricePence: r.price_pence,
        memberPricePence: r.member_price_pence,
        membersOnly: r.members_only === true,
      }))
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')),
  }

  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Card preview (unsaved)</p>
      <div className="max-w-sm">
        <EventCard event={event} past={!!form.is_past} avail={avail} onGetTickets={() => {}} />
      </div>
    </div>
  )
}

function ReleaseRow({ release, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className={lbl}>Release name</label>
          <input type="text" value={release.name} onChange={(e) => onChange('name', e.target.value)} className={inp} placeholder="Early Bird" />
        </div>
        <div>
          <label className={lbl}>Start date</label>
          <input type="date" value={release.start_date} onChange={(e) => onChange('start_date', e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>End date</label>
          <input type="date" value={release.end_date} onChange={(e) => onChange('end_date', e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Standard £</label>
          <input type="number" min="0" step="0.01" defaultValue={penceToPounds(release.price_pence)} onBlur={(e) => onChange('price_pence', e.target.value)} className={inp} placeholder="8.00" disabled={release.members_only} />
        </div>
        <div>
          <label className={lbl}>Member £</label>
          <div className="flex gap-2">
            <input type="number" min="0" step="0.01" defaultValue={penceToPounds(release.member_price_pence)} onBlur={(e) => onChange('member_price_pence', e.target.value)} className={inp} placeholder="6.00" />
            <button type="button" onClick={onRemove} className="shrink-0 rounded-lg border border-red-100 px-2 text-red-400 hover:bg-red-50" aria-label="Remove release">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={release.members_only ?? false}
          onChange={(e) => onChange('members_only', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-purple-700"
        />
        <span className="text-xs font-semibold text-purple-800">Members only</span>
        <span className="text-xs text-gray-400">— only paid members can buy tickets in this release (standard price ignored)</span>
      </label>
    </div>
  )
}

// ── Tickets Management ────────────────────────────────────────────────────────

const TICKET_COLS = [
  { key: 'email',             label: 'Email' },
  { key: 'first_name',        label: 'First Name' },
  { key: 'last_name',         label: 'Last Name' },
  { key: 'event_id',          label: 'Event' },
  { key: 'release_name',      label: 'Release' },
  { key: 'price_paid_pence',  label: 'Price Paid', format: (v) => v != null ? (v === 0 ? 'Free' : `£${(v / 100).toFixed(2)}`) : '' },
  { key: 'is_member',         label: 'Member', format: (v) => v ? 'Yes' : 'No' },
  { key: 'paid_at',           label: 'Paid At', format: (v) => v ? new Date(v).toLocaleString('en-GB') : '' },
  { key: 'ticket_code',       label: 'Ticket Code' },
]

function TicketsManagement() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ col: 'paid_at', dir: 'desc' })

  useEffect(() => {
    get('tickets?order=paid_at.desc').then((data) => {
      setTickets(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  function toggleSort(col) {
    setSort((s) => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const filtered = tickets
    .filter((t) => !search || t.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sort.col] ?? ''
      const bv = b[sort.col] ?? ''
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Tickets</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inp + ' w-64'}
          />
          <button
            onClick={() => exportCSV(filtered, TICKET_COLS, 'tickets.csv')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-700 transition"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-400">Loading tickets…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">{search ? 'No tickets match that email.' : 'No tickets yet.'}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {TICKET_COLS.filter((c) => c.key !== 'ticket_code').map((c) => (
                  <SortTh key={c.key} label={c.label} col={c.key} sort={sort} onSort={toggleSort} />
                ))}
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">QR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id ?? t.ticket_code} className="border-b border-gray-50 last:border-0 hover:bg-purple-50/30 transition">
                  <td className="px-4 py-3 text-gray-700">{t.email}</td>
                  <td className="px-4 py-3 text-gray-700">{t.first_name}</td>
                  <td className="px-4 py-3 text-gray-700">{t.last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.event_id}</td>
                  <td className="px-4 py-3 text-gray-600">{t.release_name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {t.price_paid_pence != null ? (t.price_paid_pence === 0 ? 'Free' : `£${(t.price_paid_pence / 100).toFixed(2)}`) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {t.is_member
                      ? <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Yes</span>
                      : <span className="text-gray-400">No</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {t.paid_at ? new Date(t.paid_at).toLocaleString('en-GB') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${t.ticket_code}&color=170a2c&bgcolor=fdfbf6`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 underline underline-offset-2 hover:text-purple-900 text-xs"
                    >
                      View QR
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-gray-400">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}

// ── Members Management ────────────────────────────────────────────────────────

const MEMBER_COLS = [
  { key: 'email',             label: 'Email' },
  { key: 'first_name',        label: 'First Name' },
  { key: 'last_name',         label: 'Last Name' },
  { key: 'college_year',      label: 'Year' },
  { key: 'paid',              label: 'Paid', format: (v) => v ? 'Yes' : 'No' },
  { key: 'paid_at',           label: 'Paid At', format: (v) => v ? new Date(v).toLocaleString('en-GB') : '' },
]

function MembersManagement() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ col: 'paid_at', dir: 'desc' })

  useEffect(() => {
    get('members?order=created_at.desc').then((data) => {
      setMembers(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  function toggleSort(col) {
    setSort((s) => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const filtered = members
    .filter((m) => !search || m.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sort.col] ?? ''
      const bv = b[sort.col] ?? ''
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Members</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inp + ' w-64'}
          />
          <button
            onClick={() => exportCSV(filtered, MEMBER_COLS, 'members.csv')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-700 transition"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-400">Loading members…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">{search ? 'No members match that email.' : 'No members yet.'}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {MEMBER_COLS.map((c) => (
                  <SortTh key={c.key} label={c.label} col={c.key} sort={sort} onSort={toggleSort} />
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-purple-50/30 transition">
                  <td className="px-4 py-3 text-gray-700">{m.email}</td>
                  <td className="px-4 py-3 text-gray-700">{m.first_name}</td>
                  <td className="px-4 py-3 text-gray-700">{m.last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.college_year}</td>
                  <td className="px-4 py-3">
                    {m.paid
                      ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Paid</span>
                      : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">Unpaid</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {m.paid_at ? new Date(m.paid_at).toLocaleString('en-GB') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-gray-400">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
