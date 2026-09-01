# Hack Tank

Hackathon platform inspired by Shark Tank for **JCI Sousse**. Teams build for 48 hours, then pitch their venture to investors and mentors: the Sharks.

The application uses React, TypeScript, Vite, React Router and Supabase.

## Features

- Public event site: tracks, prizes, Sharks, idea wall, FAQ and countdown.
- Five-step registration form with client validation and centralized Supabase submission.
- Secure admin dashboard: participants, event statistics, search and CSV export.
- Jury dashboard: projects, scores, comments and automatic ranking.
- Team dashboard: project editing, team invitations, GitHub/demo links and PDF pitch-deck upload.
- Role-based access with Supabase Auth and Row Level Security (RLS).

## Pages

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and event information |
| `/tracks` | Public | Tracks and prize deals |
| `/sharks` | Public | Jury and investor panel |
| `/ideas` | Public | Idea wall with track filtering |
| `/faq` | Public | FAQ and contact information |
| `/register` | Public | Participant registration |
| `/admin` | Admin | Event dashboard and participant export |
| `/jury` | Jury | Project scoring and ranking |
| `/team` | Participant | Project, team and pitch-deck management |

## Local setup

```bash
npm install
```

If your network uses Nexus:

```bash
npm install --registry=https://nexus-solutions.rmm.scom/repository/npm/ --strict-ssl=false
```

Copy `.env.example` to `.env`, then add the public values from **Supabase > Project Settings > API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Never use the Supabase `service_role` key in the frontend. `.env` is ignored by Git.

Start the application:

```bash
npm run dev
```

Open the URL displayed by Vite, normally `http://localhost:5173/`.

## Supabase database setup

Run these SQL files in this order from **Supabase > SQL Editor**:

1. [supabase/migrations/20260901_initial_schema.sql](supabase/migrations/20260901_initial_schema.sql)
2. [supabase/migrations/20260901_dashboards_and_storage.sql](supabase/migrations/20260901_dashboards_and_storage.sql)

They create the database, RLS policies, registration RPC, automatic ranking function and private `pitch-decks` storage bucket.

### Create an admin

1. Create the organizer account in **Supabase > Authentication > Users**.
2. Copy its UUID.
3. Run this in SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'ORGANIZER_AUTH_USER_UUID';
```

The organizer can then sign in at `/admin`.

### Create a jury account

1. Create the jury account in **Authentication > Users**.
2. Add the jury profile in `jury_members`.
3. Run:

```sql
update public.profiles
set role = 'jury'
where id = 'JURY_AUTH_USER_UUID';

update public.jury_members
set user_id = 'JURY_AUTH_USER_UUID'
where id = 'JURY_MEMBER_UUID';
```

The jury member can then sign in at `/jury`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production bundle |
| `npm run preview` | Preview the production bundle |
| `npm run generate:presentation` | Generate the project scoping deck |
| `npm run generate:interface-brief` | Generate the interface and content deck |

## Architecture

```text
src/
  components/   Shared UI components and layout
  hooks/        Countdown, reveal and scroll hooks
  pages/        Public, admin, jury and team route screens
  services/     Supabase client, registrations and dashboard queries
  data.ts       Public event content
  types.ts      Shared TypeScript types
  styles.css    Responsive design system and dashboard styles
supabase/
  migrations/   Database, security and storage setup
```

## Deploy

The repository includes SPA routing configuration for Vercel and Netlify:

- [vercel.json](vercel.json) handles Vercel route rewrites.
- [public/_redirects](public/_redirects) handles Netlify route rewrites.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider’s environment-variable settings before deploying. Use `npm run build` as the build command and `dist` as the publish directory.

## Brand

- JCI Blue `#0057B8`, Deep Navy `#0C2340`, Gold `#F4B400`
- Typography: Syne for display text, DM Mono for labels
