# Admin Dashboard

The admin dashboard lives at `/#/admin`. It is protected by a password set via the `VITE_ADMIN_PASSWORD` environment variable. There is no server-side auth — keep the password strong and do not share it.

---

## Logging in

Navigate to `/#/admin` and enter the admin password. The session is stored in `sessionStorage` — it clears when the browser tab is closed. Logging out redirects to the home page.

---

## Events tab

### Creating an event

1. Click **Create New Event** (dashed card at the top)
2. Fill in name, date, time, location, description, capacity
3. Upload an image or paste a URL (requires the `event-images` Supabase Storage bucket — see below)
4. Add ticket releases (see below)
5. Leave **Published** unchecked to save as a draft
6. Click **Create Event**

### Editing an event

1. Use the **Edit Existing Event** dropdown — select an event by name and date
2. All fields are editable except the URL slug (ID), which is read-only
3. If you change the image, the old image is automatically deleted from Supabase Storage
4. Click **Save Changes**

### Publishing / unpublishing

Toggle the **Published** checkbox in the event form. Unpublished events are invisible on the public Events page — they only appear in the admin dashboard.

### Deleting an event

Open the event in the edit form and click **Delete Event** at the bottom right. This deletes the event, all its releases and its inventory row. It does not delete purchased tickets.

### Preview

Click the **Preview** button (eye icon) in the top-right of the edit/create form to see exactly how the event card will appear on the public Events page — including the active release badge, ticket button state and price. The preview updates live as you type.

---

## Ticket releases

Each event can have multiple releases (e.g. Early Bird, General). Set a release up with:

| Field | Description |
|-------|-------------|
| Release name | e.g. "Early Bird", "General" |
| Start date | First day tickets are available at this price |
| End date | Last day (inclusive) tickets are available at this price |
| Standard £ | Price for non-members |
| Member £ | Price for paid society members |
| Members only | If checked, only paid members can purchase in this release |

The active release is determined at checkout time by comparing today's date against `start_date`/`end_date`. If no release is active, the "Get Tickets" button is disabled.

**Tip:** set the last release's end date to the event date — tickets automatically close once the event has passed.

---

## Supabase Storage (event images)

Images are stored in the `event-images` bucket. To set it up:

1. **Supabase → Storage → New bucket** → name it `event-images`, set to **Public**
2. Run in **Supabase → SQL Editor**:

```sql
CREATE POLICY "Admin can upload event images"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Admin can update event images"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'event-images');
```

---

## Tickets tab

Displays all purchased tickets across all events.

- **Search** — filter by email address (live, as you type)
- **Sort** — click any column header to sort ascending; click again for descending
- **View QR** — opens the QR code image in a new tab (useful when a buyer didn't receive their email)
- **Export CSV** — downloads all visible (filtered) rows as a `.csv` file, which opens in Excel

Columns: Email, First Name, Last Name, Event, Release, Price Paid, Member, Paid At, QR link.

> Requires the RLS policy `"Admin can read tickets"` — see `supabase/setup.sql`.

---

## Members tab

Displays all society members (paid and unpaid).

- **Search** — filter by email address
- **Sort** — click any column header
- **Export CSV** — downloads filtered rows

Columns: Email, First Name, Last Name, Year, Paid status, Paid At.

> Requires the RLS policy `"Admin can read members"` — see `supabase/setup.sql`.
