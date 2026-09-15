# Aurora Dental — clinic platform

**Live demo: [aurora-dental-yerevan.vercel.app](https://aurora-dental-yerevan.vercel.app)**

A modern, multilingual website for a dental clinic with online booking, built as a portfolio project.
The clinic, doctors and reviews are fictional — the project is a template that can be
rebranded for any clinic, beauty salon or studio.

## Features

- **Online booking** — service → doctor (or "any available") → date → time slot → contacts
  - Real availability from each doctor's weekly schedule and existing appointments
  - Double-booking protection: bookings lock the doctor's row inside a database transaction
  - Server-side validation (Zod), honeypot spam protection, Google Calendar link on success
- **3 languages** — Russian, Armenian, English (`next-intl`, locale-aware routing, `hreflang` alternates)
- **Light / dark theme** — no flash on load, remembers the visitor's choice
- **Responsive** — mobile menu, fluid typography, tested from 375 px to desktop
- **Animations** — scroll reveals with Framer Motion, CSS entrance for above-the-fold content, `prefers-reduced-motion` respected
- **Accessible** — semantic landmarks, keyboard-friendly steps, tabs, accordion and menus, ARIA attributes
- **SEO** — per-locale metadata, Open Graph, static generation for every language

### Roadmap

- [x] Stage 1 — landing page
- [x] Stage 2 — online booking
- [ ] Stage 3 — admin panel (appointments, schedule, services)
- [ ] Stage 4 — Telegram notifications for new appointments
- [ ] Stage 5 — AI assistant that answers patient questions 24/7
- [x] Deploy to Vercel

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, Route Handlers), React 19 |
| Language | TypeScript |
| Database | PostgreSQL with Drizzle ORM — embedded PGlite locally, Neon in production |
| Validation | Zod |
| Styling | Tailwind CSS 4, design tokens in `globals.css` |
| i18n | next-intl 4 |
| Animation | Framer Motion |
| Icons | lucide-react |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No database setup is needed for development: an embedded
PostgreSQL (PGlite) is created in `~/.clinic-platform/pglite`, migrated and seeded on first request.

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | production | PostgreSQL connection string. Migrations run automatically before `next build`. |
| `PGLITE_DATA_DIR` | optional, local | Custom folder for the embedded development database |

### Database scripts

```bash
npm run db:generate   # create a SQL migration after changing src/db/schema.ts
npm run db:migrate    # apply migrations to DATABASE_URL (runs automatically on build)
```

## Project structure

```
drizzle/             SQL migrations
messages/            Translations (ru, hy, en) — all visible text lives here
scripts/             Production migration script
src/
  app/[locale]/      Home page and /booking for each language
  app/api/slots/     Available time slots API
  components/
    booking/         Booking wizard steps, summary and success screen
    layout/          Header, footer, language switcher, theme toggle
    sections/        Home page sections: hero, services, doctors, pricing…
    ui/              Reusable building blocks: button, container, reveal
  db/                Drizzle schema, connection and reference data seed
  i18n/              Locale routing and request config
  lib/booking/       Availability, validation, server action, clinic time helpers
  lib/site-data.ts   Clinic data that does not depend on language (prices, ids)
  proxy.ts           Locale detection and redirects
```

### Rebranding for a new client

1. Change the name, phone and links in `src/lib/site-data.ts`
2. Set services, doctors and working hours in `src/db/seed.ts`
3. Edit texts in `messages/*.json`
4. Adjust the colour tokens at the top of `src/app/globals.css`
5. Replace doctor placeholders with real photos (`next/image`)

---

Developed by [Aren Mkrtchyan](https://github.com/amd-11)
