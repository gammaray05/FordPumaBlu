Ford Puma Blu – Dev Notes

Setup (Vite + React + Tailwind v4)
- Install deps: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`

Remote Storage (Supabase)
This app can sync Profiles and the Activity feed via Supabase.

1) Create a Supabase project
2) In the SQL editor, run `supabase.sql` from this repo to create tables, realtime, and demo RLS policies
3) Create a `.env.local` (or `.env`) from `.env.example` and fill:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4) Restart dev server

What is synced
- Profiles (`profiles`): name, baseline, pack, mode, target_today
- Activities (`activities`): global group feed (icon, text). Inserted when si registra una sigaretta (pulsante “+ Sigaretta”).

Behavior
- On launch, the app shows the “Chi sei?” screen with profiles loaded from Supabase (or localStorage fallback if env isn’t configured).
- “Sono nuovo nella Ford Puma Blu” opens onboarding and creates a remote profile (or local fallback) and returns to the “Chi sei?” selection.
- The activity feed auto-updates via Supabase Realtime.

Security note
The provided RLS policies are permissive for demo. For production, restrict insert/update by user identity (Auth) and row ownership.

