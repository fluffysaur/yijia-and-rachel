# Yi Jia and Rachel's Wedding Site

Minimal wedding web app for guests to view event details and RSVP for the church ceremony/lunch and dinner banquet.

## Stack

- Node 24
- TypeScript
- React 19
- React Router
- Tailwind CSS v4
- Supabase
- Vercel

## Local Setup

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in Supabase values when ready.

`npm run dev` now defaults to demo mode (sample invite groups from `src/data/demo.ts` + localStorage-backed RSVP data), so local UI testing works out of the box.

If you want to use Supabase while running Vite locally, set `VITE_ENABLE_SUPABASE_IN_DEV=true` in `.env.local`.

## Editable Content

Most public site copy lives in `src/content/wedding.ts`.

Update this file for:

- Names and hero text
- Event times and venue details
- Map links
- Calendar metadata
- Story, Q&A, FAQ, and contact copy
- Gallery and highlight image URLs

## Supabase Setup

Apply `supabase/migrations/0001_initial.sql` in your Supabase project.

The schema includes:

- `invite_groups`
- `rsvp_responses`
- `ceremony_attendees`
- `dinner_attendees`
- `check_ins`
- `rsvp_audit_log`
- public RPC helpers for invite search and read-only RSVP viewing

Guest access is handled by site passwords. `LUNCH_PASSWORD` and `FULL_PASSWORD` provide initial fallback values, and admins can view or update those guest passwords from the dashboard after `site_settings` exists.

Admin access is handled by the server-only `ADMIN_PASSWORD`. The dashboard uses Vercel API routes with `SUPABASE_SERVICE_ROLE_KEY`, so the service-role key must never be exposed as a `VITE_` variable.

## Scripts

```sh
npm run dev       # local development
npm run build     # type-check and build
npm run preview   # preview production build
npm run test      # unit tests
npm run lint      # eslint
```

## Deployment

Deploy to Vercel and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `LUNCH_PASSWORD`
- `FULL_PASSWORD`

Point the final custom domain, for example `yijiaxrachel.<tld>`, to the Vercel project.
