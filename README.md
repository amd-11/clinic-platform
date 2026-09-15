# Aurora Dental — clinic platform

**Live demo: [aurora-dental-yerevan.vercel.app](https://aurora-dental-yerevan.vercel.app)**

A modern, multilingual website for a dental clinic, built as a portfolio project.
The clinic, doctors and reviews are fictional — the project is a template that can be
rebranded for any clinic, beauty salon or studio.

## Features

- **3 languages** — Russian, Armenian, English (`next-intl`, locale-aware routing, `hreflang` alternates)
- **Light / dark theme** — no flash on load, remembers the visitor's choice
- **Responsive** — mobile menu, fluid typography, tested from 375 px to desktop
- **Animations** — scroll reveals with Framer Motion, CSS entrance for above-the-fold content, `prefers-reduced-motion` respected
- **Accessible** — semantic landmarks, keyboard-friendly tabs, accordion and menus, ARIA attributes
- **SEO** — per-locale metadata, Open Graph, static generation for every language

### Roadmap

- [x] Stage 1 — landing page
- [ ] Stage 2 — online booking (service → doctor → date → time slot)
- [ ] Stage 3 — admin panel (appointments, schedule, services)
- [ ] Stage 4 — Telegram notifications for new appointments
- [ ] Stage 5 — AI assistant that answers patient questions 24/7
- [ ] Stage 6 — deploy to Vercel

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, design tokens in `globals.css` |
| i18n | next-intl 4 |
| Animation | Framer Motion |
| Icons | lucide-react |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
messages/            Translations (ru, hy, en) — all visible text lives here
src/
  app/[locale]/      Root layout and home page for each language
  components/
    layout/          Header, footer, language switcher, theme toggle
    sections/        Page sections: hero, services, doctors, pricing…
    ui/              Reusable building blocks: button, container, reveal
  i18n/              Locale routing and request config
  lib/site-data.ts   Clinic data that does not depend on language (prices, ids)
  proxy.ts           Locale detection and redirects
```

### Rebranding for a new client

1. Change the name, phone and links in `src/lib/site-data.ts`
2. Edit texts in `messages/*.json`
3. Adjust the colour tokens at the top of `src/app/globals.css`
4. Replace doctor placeholders with real photos (`next/image`)

---

Developed by [Aren Mkrtchyan](https://github.com/amd-11)
