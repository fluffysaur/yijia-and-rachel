# Yi Jia and Rachel's Wedding Site

Password-gated wedding site for event details, gallery content, guest RSVP, admin invite management, invite messages, RSVP deadlines, and day-of check-ins.

## Stack

- Node 24+
- React 19, TypeScript, React Router
- Vite and Tailwind CSS v4
- Supabase for production data
- Vercel serverless API routes for auth and admin actions

## Local Development

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` when you want to configure real credentials.

Vite development uses demo mode by default. Demo mode loads sample invite groups from `src/data/demo.ts` and stores RSVP/admin changes in `localStorage`, so the app works without Supabase.

Demo passwords:

- Admin dashboard: `adminpass` or `VITE_DEMO_ADMIN_PASSWORD`
- Full-detail guest access: `sampledinnerpass`
- Lunch-only guest access: `samplechurchpass`
- Direct invite access: use an invite password from the admin dashboard, such as `demo-family-tan`

To use Supabase locally, set `VITE_ENABLE_SUPABASE_IN_DEV=true` and provide the Supabase env vars below.

## Environment

Client-safe values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ENABLE_SUPABASE_IN_DEV` optional, only needed for local Supabase testing
- `VITE_DEMO_ADMIN_PASSWORD` optional demo-mode override

Server-only values:

- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `LUNCH_PASSWORD`
- `FULL_PASSWORD`

Never expose the Supabase service-role key as a `VITE_` variable.

## Supabase

Fresh projects only need the consolidated migration:

```sh
supabase/migrations/0001_initial.sql
```

It creates the current schema in one file:

- invite groups with per-invite passwords and invite-sent timestamps
- RSVP responses, ceremony attendees, dinner attendees, check-ins, and audit logs
- site settings for guest passwords, RSVP deadline, and invite message templates
- public RPC helpers for invite search, RSVP reads, RSVP settings, and guest RSVP submission
- RLS policies and grants for authenticated admins plus Vercel service-role API routes

If an existing Supabase project has already run the old numbered migrations, do not re-run this squashed migration against that database.

## Editable Content

Most public site copy lives in `src/content/wedding.ts`.

Update that file for:

- names, hero text, and story copy
- event times, venue details, map links, and calendar metadata
- Q&A, FAQ, and contact copy
- gallery and highlight image URLs

Invite message templates, guest passwords, and the RSVP deadline can also be edited from the admin dashboard.

## Routes

- `/` guest home page
- `/rsvp` RSVP flow
- `/admin` admin dashboard
- `/api/auth/login` password login endpoint
- `/api/admin/*` admin-only Vercel API routes

## Scripts

```sh
npm run dev       # local development
npm run build     # type-check and build
npm run preview   # preview production build
npm run test      # unit tests
npm run lint      # eslint
```

## Deployment

Deploy to Vercel, add the environment variables above, and point the custom domain to the Vercel project.
