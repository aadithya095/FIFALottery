# WC2026 Final — Friends Lottery App

Private no-money-in-app lottery for the FIFA World Cup 2026 Final (Argentina vs Spain).  
25 outfield player slots (numbers 3–28, excluding 12 — the backup goalkeeper).

**Stack:** React + Vite · Netlify Functions (Node.js) · Supabase (Postgres) · Tailwind CSS · Framer Motion

---

## Setup Steps

### 1. Create Supabase Project & Run Schema

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste the contents of `supabase/migrations/001_init.sql` → Run
3. Note your **Project URL** and **service-role key** (Settings → API)

---

### 2. Create GitHub Repo & Push

```bash
git init
git add .
git commit -m "init: WC2026 lottery app"
gh repo create worldcup-lottery --private --source=. --push
```

---

### 3. Connect Repo to Netlify

1. [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git → select your repo
2. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Click **Deploy site**

---

### 4. Add Environment Variables in Netlify

Site Settings → Environment variables → Add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase Settings → API |
| `VITE_SUPABASE_URL` | same as above |
| `VITE_SUPABASE_ANON_KEY` | anon/public key from Supabase |
| `JWT_SECRET` | run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRY` | `15m` |
| `ALLOWED_ORIGIN` | your Netlify domain, e.g. `https://yoursite.netlify.app` |

Redeploy after adding variables.

---

### 5. Seed Admin Accounts

Install deps first, then run with credentials via env vars (never hardcode):

```bash
npm install

SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
ADMIN_USERNAME="matchday_admin" \
ADMIN_PASSWORD="YourSecurePass1!" \
SUPER_ADMIN_USERNAME="host_boss" \
SUPER_ADMIN_PASSWORD="YourSecurePass2!" \
npm run seed-admins
```

Store credentials in a password manager. **Never commit them.**

---

### 6. Test Locally with Netlify CLI

```bash
npm install -g netlify-cli
cp .env.example .env        # fill in real values
npm install
netlify dev                 # starts Vite on :3000 + Functions on :8888
```

Visit `http://localhost:3000` for the client site.  
Visit `http://localhost:3000/admin/login` for the admin panel.

---

### 7. Verify End-to-End on Live Deployment

1. Log into `/admin/login` as `matchday_admin`
2. Dashboard → **Assign Ticket** → enter a friend's name + phone → submit
3. Note the displayed OTP (shown once only)
4. Open the public site → **Reveal Your Player** → enter the OTP → scratch the card
5. Navigate to `/my-tickets` — the revealed number should persist without re-entering the OTP

---

## Production Hosting Checklist

### 1. Push to a private GitHub repo

```bash
git add .
git commit -m "ready for deploy"
git push origin main
```

Make sure `.env` is **not** committed (it is already in `.gitignore`).

### 2. Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Pick the repo, then:
   - **Branch:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Click **Deploy**

`netlify.toml` already sets the build/publish values and `/api/* → Netlify Functions` redirects.

### 3. Set production environment variables

In Netlify → Site Settings → Environment variables, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API → service_role key |
| `VITE_SUPABASE_URL` | same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Settings → API → anon/public key |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRY` | `15m` |
| `ALLOWED_ORIGIN` | your live Netlify URL, e.g. `https://yoursite.netlify.app` |

Then trigger a **Redeploy**.

### 4. Seed admin accounts on production

Run from your local machine (uses the production Supabase project):

```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
ADMIN_USERNAME="matchday_admin" \
ADMIN_PASSWORD="YourSecurePass1" \
SUPER_ADMIN_USERNAME="host_boss" \
SUPER_ADMIN_PASSWORD="YourSecurePass2" \
npm run seed-admins
```

Store the two passwords in a password manager. **Only `host_boss` (super_admin) can reset the platform.**

### 5. Switch `ALLOWED_ORIGIN` if you add a custom domain

If you attach a custom domain on Netlify, update `ALLOWED_ORIGIN` to that domain and redeploy.

---

## Project Structure

```
worldcup-lottery/
├── netlify/functions/          # Serverless API endpoints
│   ├── utils/                  # db, auth, rateLimit, response helpers
│   ├── admin-login.js
│   ├── admin-assign-ticket.js
│   ├── admin-tickets.js
│   ├── admin-summary.js
│   ├── admin-list.js
│   ├── admin-manage-admins.js
│   ├── admin-reset.js          # super_admin platform reset
│   └── reveal.js
├── src/
│   ├── components/             # OTPModal, ScratchCard, Confetti, AdminLayout, AssignTicketModal
│   ├── context/                # AdminAuthContext
│   ├── pages/
│   │   ├── client/             # HomePage, MyTickets
│   │   └── admin/              # LoginPage, Dashboard, TicketsList, ManageAdmins
│   └── services/               # api.js, ticketStorage.js
├── supabase/migrations/        # 001_init.sql
├── scripts/
│   ├── seed-admins.js          # One-time admin setup
│   ├── clear-test-data.js      # Wipe assignments/audit/logs (dev use)
│   └── dev-server.js           # Local Express server for Netlify Functions
└── netlify.toml
```

---

## Security Notes

- OTPs are **bcrypt-hashed** — the plaintext is shown to admin once, never stored
- JWT sessions expire in 15 minutes, stored in httpOnly cookies
- Public `/api/reveal` endpoint is rate-limited: **5 attempts per 10 minutes per IP**
- All DB writes use the **service-role key** server-side only — never exposed to the browser
- CORS locked to `ALLOWED_ORIGIN` — set to your production domain

## Slot Reference

Numbers 3–28, **excluding 12** (backup goalkeeper).  
25 outfield slots total.
