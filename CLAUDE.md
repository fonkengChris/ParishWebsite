# CLAUDE.md

Guidance for working in this repository.

## Project

Website for **St. John of God Parish** ("Holy Ground"), **Buea Diocese**, Limbe, Cameroon —
a Catholic parish. Parish identity constants live in `frontend/src/components/Map.tsx`
(`PARISH_NAME`, `PARISH_DIOCESE`, `PARISH_LOCATION`, coordinates). Patron: St. John of God,
patron of the sick, hospitals, and nurses.

## Stack & layout

- **frontend/** — React 18 + TypeScript + Vite + Tailwind CSS 3, React Router 6, Leaflet (maps).
  - `src/pages/` route pages (public + `admin/`), `src/components/` shared UI,
    `src/contexts/` (ThemeContext), `src/services/api.ts` (axios client + typed API modules),
    `src/types/index.ts`, `src/data/` static content.
- **backend/** — Node + Express (ESM) + MongoDB/Mongoose, JWT auth, Pino logging, node-cron,
  nodemailer/Twilio (notifications), PayPal (donations). `routes/`, `models/`, `services/`,
  `middleware/`, `scripts/` (seeders/admin), `server.js` entry.

## Commands

```bash
# frontend (dev server prefers port 3000, falls back to 3001)
cd frontend && npm run dev        # vite dev
cd frontend && npm run build      # tsc && vite build
cd frontend && npm run lint       # eslint (max-warnings 0)

# backend
cd backend && npm run dev         # node --watch server.js
cd backend && npm test            # jest
cd backend && npm run create-admin
```

## Key concept: the liturgical color system

The whole site recolors itself by the Church's liturgical calendar. This is the product's
signature feature — treat it as first-class.

- `contexts/ThemeContext.tsx` fetches the current liturgical colour (`liturgicalColorAPI`,
  backed by `routes/liturgicalColor.js` + `LiturgicalColorOverride` model) and writes the
  scale to CSS variables `--color-primary-50..900` on `:root`. Admins can override dates.
- Tailwind maps `primary.*` → those variables (`tailwind.config.js`), so any
  `bg-primary-600`, `text-primary-700`, etc. follows the season automatically.
- Colours: green (Ordinary), violet/purple (Advent/Lent), white & gold (feasts/solemnities),
  red (martyrs/Passion/Pentecost), rose (Gaudete/Laetare).
- `LiturgicalColorResponse` has no `season` field — derive human phrasing from `.color`
  (see `seasonPhrase()` in `pages/Home.tsx`).

## Design system — "Communion × Sanctuary" (added 2026-08-05)

Warm, reverent identity chosen over 3 alternatives. Standalone mockups kept in
`design-mockups/` (`4-communion-sanctuary.html` is the chosen one; `index.html` compares all).

**Tokens** (Tailwind + CSS vars in `frontend/src/index.css`):
- Palette: `ivory #fbf7f0`, `ivory-2 #f4ecdf`, `ink #2a241c`, `ink-soft #6a6153`,
  `gold #c29a4e`, `line #e7ddca`, `stone #141210` (the one dark section). Available as
  Tailwind classes (`bg-ivory`, `text-ink`, `border-line`, `bg-stone`, …).
- Fonts: `font-serif` = **Fraunces**, `font-display` = **Playfair Display**,
  `font-sans` = **Inter** (loaded in `index.html`).
- Body is ivory/ink globally; the default `--color-primary-*` fallback is muted liturgical
  green (was sky-blue).
- Signature components in `index.css`: `.arch-frame` (rounded-arch photo frame),
  `.sanctuary-band` (+ `.s-bg`, `.s-arch`, `.s-inner` — the dark "Come and Pray" band with an
  arch-of-light glow), `.lit-soft-panel`. All recolor with the season via `--color-primary-*`.

**Conventions**
- No emoji as iconography (removed from Navbar/Footer/Home). Use type, marks (✝), or SVG.
- Arch motif = the recurring architectural signifier. Serif (Fraunces) for display headings,
  Playfair for the Sanctuary band, Inter for body/labels. Eyebrow labels: uppercase, tracked,
  `text-primary-700`/`gold`, bold.
- Quality floor: responsive to mobile, visible keyboard focus, `prefers-reduced-motion`.

**Migration status**
- Done: `components/Navbar.tsx`, `components/Footer.tsx`, `pages/Home.tsx`
  (Navbar/Footer are in `components/Layout.tsx`, so all pages get the new chrome).
- **Not yet migrated:** the ~40 inner pages (`pages/*`, `pages/admin/*`) still use the older
  gradient/rounded-2xl/emoji styling. When touching one, migrate it to the tokens/fonts above.

## Notes

- Root docs: `README.md`, `DONATIONS_SETUP.md`, `PERFORMANCE.md`, `MONITORING.md`.
- Commit trailer for AI-authored commits:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
