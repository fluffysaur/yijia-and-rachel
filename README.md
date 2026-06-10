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

Without Supabase environment variables, the app runs in demo mode with sample invite groups and localStorage-backed RSVP data so the UI can be reviewed.

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

Admin access is handled through Supabase Auth. Create admin users in Supabase and add their UUIDs to the `admin_profiles` table.

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
- `VITE_SUPABASE_ANON_KEY`

Point the final custom domain, for example `yijiaxrachel.<tld>`, to the Vercel project.
