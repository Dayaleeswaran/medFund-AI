# MedFund AI

Transparent emergency medical crowdfunding with Supabase-backed Auth, wallets, Seylan-style banking sandbox proxies, AI-assisted fraud scoring, and premium glassmorphism UI (Next.js App Router).

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Radix/Shadcn-style primitives, Zustand, React Hook Form + Zod, Recharts.
- **Backend:** Supabase (Auth + Postgres + Realtime), Route Handlers / server-only clients.
- **Integrations:** OpenAI & ElevenLabs placeholders (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`), Seylan sandbox HTTP gateway (`FINTECH_*`).

## Setup

1. **Clone & install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` → `.env.local` and fill:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
   - Optional **`SUPABASE_SERVICE_ROLE_KEY`** (server-only): powers `/api/auth/account-exists` so login can show **“No account found”** vs **“Invalid Username or Password”** without weakening Supabase’s default ambiguity when this key is absent.
   - `DATABASE_URL` if you use Drizzle helpers / login lockout migrations.
   - `OPENAI_API_KEY`, `ELEVENLABS_API_KEY` when enabling assistant/voice routes.
   - `FINTECH_BASE_URL`, `FINTECH_API_KEY`, optional `FINTECH_TEAM_KEY` / `FINTECH_TEAM_KEY_HEADER` for Seylan sandbox — **never** expose these to the browser (all calls go through `/api/fintech/*`).

3. **Database (Supabase CLI)**

   ```bash
   npx supabase db reset    # local: applies migrations + seed
   # or against linked project:
   npm run supabase:db:push
   ```

   Migrations live in `supabase/migrations/` (profiles, campaigns, donations, wallets, transparency ledger, hospital payouts, fraud analysis, notifications, favorites, lockout helpers).

4. **Auth flows**

   - Login · Signup (`/login`, `/signup`)
   - Forgot password (`/forgot-password`) → Supabase recovery email / magic link
   - OTP verification UI (`/auth/verify-otp?email=&type=signup|email|recovery`) when Auth OTP is enabled in Supabase
   - Session refresh via `@supabase/ssr` middleware + client listeners in `providers.tsx`

5. **Dev server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Product surfaces

- **Role dashboards** (`/dashboard`): donor charts & favorites, patient progress & payouts, admin fraud bars & queues, hospital settlements — driven by `profiles.role`.
- **Campaigns / wallet / admin approvals / voice assistant** under `src/app/(app)/`.
- **QR donations:** `POST /api/fintech/qr` builds a deep-link payload and optionally proxies the sandbox QR endpoint.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run supabase:db:push` | Push migrations via Supabase CLI |

## Security notes

- RLS policies are defined in SQL migrations — review before production.
- Rate limits apply to fintech routes (IP-based, in-memory per instance).
- Keep **service role** and **bank keys** only in server env vars.
