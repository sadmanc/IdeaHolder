# IdeaHolder

A tiny password-gated web app for capturing ideas — numbered, dated, searchable, synced across devices.

## First-time setup (~5 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Once it's ready, open **SQL Editor** → **New query** → paste the contents of `schema.sql` → **Run**.
3. Open **Project Settings → API**. Copy:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **`service_role` key** (under Project API keys) → this is `SUPABASE_SERVICE_ROLE_KEY`

### 3. Generate a password hash

```bash
npm run hash-password
```

You'll be prompted for the password you want to use. It prints **two** versions:

- The **`.env.local`** version, with each `$` escaped as `\$` — paste this into `.env.local`.
- The **Vercel / production** version, with the raw `$` — paste this into Vercel env vars.

The escape is required locally because Next.js runs `dotenv-expand` on `.env.local` values, and a raw `$2a$12$...` hash would be partially interpreted as variable references and mangled. On Vercel, env vars are passed through directly without dotenv parsing, so the raw hash is correct there.

### 4. Generate a cookie secret

```bash
npm run gen-secret
```

Prints a 64-char hex string. This is `COOKIE_SECRET`.

### 5. Fill in `.env.local`

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste in the four values from steps 2–4.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`. Log in with the password from step 3.

## Deploy to Vercel

1. Push this repo to GitHub (private).
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. On the import screen, under **Environment Variables**, add all four from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_PASSWORD_HASH`
   - `COOKIE_SECRET`
4. Click **Deploy**. Vercel gives you a URL like `ideaholder-xxx.vercel.app`.
5. Open the URL on your phone, tap **Share → Add to Home Screen** — now it feels like an app.

## Using it

- **Add:** type in the textarea, hit **Save** (or ⌘/Ctrl+Enter).
- **Search:** type in the search box — filters by idea text or `#<number>` as you type.
- **Log out:** link in the top-right of the main page.

## Rotating the password

Run `npm run hash-password` again, paste the new `APP_PASSWORD_HASH` into `.env.local` (and Vercel env vars), redeploy. Existing sessions stay valid until the cookie expires (30 days) — bump `COOKIE_SECRET` too if you want to force logout everywhere.
