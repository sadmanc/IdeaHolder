# IdeaHolder

A small, password-gated web app for capturing **ideas** and **reminders** — searchable, synced across devices, with optional push notifications and a subscribable calendar feed.

Built as a single-user personal tool: one password, one shared bucket. Designed to feel instant on phone and laptop, and to deploy on Vercel's free tier.

## Features

- **Ideas** (`/ideas`) — numbered, dated, append-only. Type, save, done. Newest first. Live search filters by text or `#<number>`.
- **Reminders** (`/reminders`) — same shape as ideas, plus an optional deadline. Editable. Active / Completed lifecycle.
- **Trash** (`/trash`) — soft-deleted ideas and reminders. Restore or delete forever.
- **Web Push notifications** — daily 9 AM digest (Toronto time, DST-aware) and a "due tomorrow" ping when any reminder's deadline is within 24 hours. Permission is opt-in per device.
- **Calendar feed** — token-gated `.ics` URL of reminders with deadlines. Subscribe in Apple Calendar / Google Calendar / Outlook and your reminders show up alongside everything else.
- **Add to Home Screen** — works as an installable PWA on iOS and Android.
- **Password gate** — one bcrypt-hashed password protects everything. Sessions are signed (jose) cookies, valid for 30 days.

## Tech stack

- **Next.js 15** (App Router, Server Components + Server Actions) with **React 19**
- **TypeScript** end-to-end
- **Tailwind CSS v4** (CSS-first, no `tailwind.config.ts`)
- **Supabase** Postgres, accessed server-side via the service-role key
- **jose** for signed session cookies, **bcryptjs** for password hashing
- **web-push** for VAPID-signed Web Push
- **Vercel** for hosting; **GitHub Actions** for the 15-minute notification cron

## Architecture at a glance

- Server Components fetch lists at render time; mutations go through Server Actions in `app/actions.ts`.
- `middleware.ts` runs on the edge and redirects unauthenticated requests to `/login`. It only imports `lib/session.ts` (jose-only) so it stays edge-compatible.
- `lib/auth.ts` (Node-only, bcrypt) and `lib/push.ts` (Node-only, web-push) are kept off the edge.
- `public/sw.js` is the service worker that handles `push` and `notificationclick` events; registered on mount via `components/RegisterServiceWorker.tsx`.
- `POST /api/cron/notify` is bearer-gated and pinged every 15 min by `.github/workflows/notify-cron.yml`. It fires the daily digest within a `9:00–9:14 AM Toronto` window and sends "due tomorrow" pushes once per reminder.
- `GET /api/calendar.ics?token=...` returns a static `.ics` feed of reminders with deadlines.
- There is no row-level security on the DB — the password gate **is** the access boundary, and the service-role key never leaves the server.

## First-time setup (~10 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Once it's ready, open **SQL Editor** → **New query** → paste the contents of `schema.sql` → **Run**. This creates the `ideas`, `reminders`, and `push_subscriptions` tables.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`service_role` key** (under Project API keys) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Generate a password hash

```bash
npm run hash-password
```

You'll be prompted for the password. The script prints **two** versions:

- The **`.env.local`** version, with each `$` escaped as `\$` — paste this into `.env.local`.
- The **Vercel / production** version, with the raw `$` — paste this into Vercel's env vars.

The escape is required locally because Next.js runs `dotenv-expand` on `.env.local` and would otherwise treat parts of a `$2a$12$...` hash as variable references. Vercel passes env vars through directly, so the raw form is correct there.

### 4. Generate the other secrets

```bash
npm run gen-secret      # COOKIE_SECRET, CRON_SECRET, CALENDAR_FEED_TOKEN — run 3x
npm run gen-vapid       # VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

### 5. Create `.env.local`

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
APP_PASSWORD_HASH=                      # the \$-escaped form
COOKIE_SECRET=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=           # same value as VAPID_PUBLIC_KEY
VAPID_SUBJECT=mailto:you@example.com
CRON_SECRET=
CALENDAR_FEED_TOKEN=
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Use the password from step 3.

## Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Add every variable from `.env.local` to **Environment Variables**, **but** use the **raw** (un-escaped) `APP_PASSWORD_HASH`.
4. Deploy. Vercel gives you a URL like `ideaholder-xxx.vercel.app`.
5. Open it on your phone → **Share → Add to Home Screen**.

### Wire up the notification cron

In your GitHub repo settings → **Secrets and variables → Actions**, add:

- `CRON_SECRET` — must match the value in Vercel
- `CRON_URL` — full URL, e.g. `https://ideaholder-xxx.vercel.app/api/cron/notify`

The workflow in `.github/workflows/notify-cron.yml` runs every 15 minutes and posts to that endpoint. The endpoint itself decides when to actually send pushes (daily digest + 24h warnings).

### Subscribe to the calendar feed

The feed lives at:

```
https://<your-vercel-url>/api/calendar.ics?token=<CALENDAR_FEED_TOKEN>
```

Add it as a subscribed calendar in Apple Calendar / Google Calendar / Outlook. Treat the URL like a password — anyone with it can read your reminders.

## Using it

- **Add an idea:** type in the textarea, hit **Save** (or ⌘/Ctrl+Enter).
- **Add a reminder:** same, plus an optional deadline.
- **Search:** type in the search box — filters by content or `#<number>` as you type.
- **Complete / restore / delete:** buttons next to each item.
- **Enable notifications:** the **Enable notifications** banner on `/reminders` asks for browser permission and registers your device's push subscription.
- **Log out:** link in the top-right.

## Rotating the password

Run `npm run hash-password` again, paste the new `APP_PASSWORD_HASH` into `.env.local` and Vercel, redeploy. Existing sessions stay valid until the cookie expires (30 days) — change `COOKIE_SECRET` too if you want to force logout everywhere.

## Project layout

```
app/
  actions.ts             # all Server Actions (mutations)
  api/
    calendar.ics/        # token-gated .ics feed
    cron/notify/         # bearer-gated cron endpoint
    push/                # subscribe / unsubscribe
  ideas/ reminders/ trash/  # the three main pages
  login/                 # password gate
components/              # client + server components
lib/
  auth.ts                # Node-only (bcrypt + cookies)
  session.ts             # edge-safe (jose only)
  push.ts                # Node-only (web-push)
  ics.ts                 # pure .ics builder
  reminders.ts           # shared query helpers
  supabase.ts            # service-role client (server-only)
public/sw.js             # service worker
schema.sql               # paste into Supabase SQL editor
scripts/                 # hash-password, gen-vapid-keys, verify-password
```

## License

Personal project, no license. Fork it, run your own copy, change anything.
