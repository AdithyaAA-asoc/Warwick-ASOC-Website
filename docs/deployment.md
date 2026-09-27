# Deployment

The site deploys automatically to **GitHub Pages** on every push to `main` via GitHub Actions.

---

## How it works

The workflow file at `.github/workflows/deploy.yml`:

1. Checks out the repo
2. Installs dependencies (`npm ci`)
3. Runs `npm run build` with environment variables injected from GitHub
4. Uploads the `dist/` folder to GitHub Pages

Routing uses `HashRouter` — URLs look like `/#/events`. This works on GitHub Pages with zero server configuration because all routes resolve to `index.html` and the hash is handled client-side.

---

## Environment variables

Variables are split between **Variables** (not sensitive, visible in logs) and **Secrets** (sensitive, redacted in logs).

Set these in **GitHub → your repo → Settings → Secrets and variables → Actions**:

### Variables tab

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |

### Secrets tab

| Name | Value |
|------|-------|
| `VITE_ADMIN_PASSWORD` | Strong password for the admin dashboard |

These are injected at build time by the workflow:

```yaml
- name: Build
  env:
    VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ vars.VITE_SUPABASE_ANON_KEY }}
    VITE_STRIPE_PUBLISHABLE_KEY: ${{ vars.VITE_STRIPE_PUBLISHABLE_KEY }}
    VITE_ADMIN_PASSWORD: ${{ secrets.VITE_ADMIN_PASSWORD }}
  run: npm run build
```

> These are **build-time** variables baked into the JS bundle — do not put truly secret values (Stripe secret key, Supabase service role key, Resend API key) here. Those belong in Supabase Edge Function secrets.

---

## Local development

Create a `.env` file at the project root (never commit this):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_ADMIN_PASSWORD=anything_for_local
```

Then run:

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

---

## Supabase Edge Functions

The two edge functions (`create-ticket-checkout`, `stripe-webhook`) are deployed separately via the Supabase CLI — they do **not** go through GitHub Actions.

To deploy or update them:

```bash
supabase functions deploy create-ticket-checkout
supabase functions deploy stripe-webhook
```

Their secrets (Stripe keys, Resend key, etc.) are managed in **Supabase → Edge Functions → Secrets**, not in GitHub.

---

## Custom domain (CNAME)

The `CNAME` file at the project root sets the custom domain for GitHub Pages. Update it if the domain changes. Also update `SITE_URL` in Supabase Edge Function secrets to match, so Stripe success/cancel redirects point to the right place.

---

## Triggering a manual deploy

Push any commit to `main`:

```bash
git add .
git commit -m "your message"
git push origin main
```

Or trigger manually in **GitHub → Actions → Deploy to GitHub Pages → Run workflow**.
