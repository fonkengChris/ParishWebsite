# CLAUDE.md

Guidance for working in this repository.

## Project

**My Parish** — a multi-parish (SaaS-style) website for Catholic parishes. One codebase;
each parish deploys it on its own domain with its own config. Never hard-code a particular
parish's identity in shared code.

- **App vs parish name.** "My Parish" is the product name: app metadata (web manifest,
  `application-name`, `apple-mobile-web-app-title`, the home-screen label) and every fallback
  when a parish name is unset. The parish's own name is what visitors see on the site.
- **Where a parish's identity comes from.**
  - Backend env `PARISH_*` (`PARISH_NAME`, `PARISH_DIOCESE`, `PARISH_CITY`, `PARISH_COORDINATES`,
    `PARISH_PATRON_NAME`, …) → `scripts/seedParishConfig.js` upserts the `ParishConfig`
    singleton → served by `routes/parishConfig.js` (env fallback if no DB doc).
  - Frontend `ParishContext` (`useParish()`) fetches it at runtime. Use `parish.*`, not literals.
  - Frontend build env `VITE_PARISH_NAME` (keep equal to `PARISH_NAME`): `vite.config.ts`
    writes it into `index.html` (`<title>`, `og:title`) and it's the first-paint name in
    `src/data/defaultParishConfig.ts`. Otherwise defaults are neutral: generic titles for
    what visitors see ("The Diocese", "The Diocesan Bishop", "Our Patron Saint") and blank
    for facts that mustn't be invented (contacts, hours, coordinates). `ParishContext` skips
    empty API values, so any field a parish leaves empty falls back to these titles.
- Example instances: `backend/.env.default` (St. John of God, Limbe, Buea Diocese) and
  `backend/.env.mulang` (St. Edmund of Abingdon, Mulang, Archdiocese of Bamenda). Mockups and
  seed demo data (`design-mockups/`, `scripts/seedDemoData.js`) use St. John of God.

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

**Logo** (concept 1f "Window & Chalice", chosen 2026-11-22 from `MyParishLogoConcepts.html`):
`components/Logo.tsx` → `<LogoMark size tone variant />`. Window takes `--color-primary-600`
(white/gold seasons fall back to ink, or stone-ivory with `tone="dark"`); chalice is a mask
cut-out. Full drawing ≥48px, compact below. Static copies: `public/favicon.svg` (compact),
`public/logo-mark.svg` (full, ink), `apple-touch-icon.png`, `icon-192/512.png`,
`maskable-192/512.png` (mark at 56% for Android's safe zone). Keep the geometry in these
files in sync.

**PWA**: `vite-plugin-pwa` in `vite.config.ts` generates the manifest (name "My Parish", the
icons above) and a Workbox service worker (`registerType: 'autoUpdate'`) that precaches the
app shell only. `/api` is never cached, so parish data stays live.

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

## Roles & permissions

Roles rank `parishioner < editor < priest < parish-priest = admin`; a higher rank inherits
everything below it. The resource → minimum-role map lives in `backend/utils/permissions.js`
(enforced via `requirePermission('Resource')` in `middleware/auth.js`) and is mirrored in
`frontend/src/utils/permissions.ts` (route guards, dashboard tiles, Navbar). Keep the two in
sync; never check `role === '…'` directly. Users can only grant/change roles at or below their own.
Admins/parish-priests can adjust any user below admin rank per area (Admin → Users,
`PUT /api/users/:id/permissions`): grant extras (`User.permissions`) or revoke areas the role
gives (`User.revokedPermissions`). Access = (role OR grant) AND NOT revoked; admin and
parish-priest always have everything. Only differences from the role are stored
(`normalizeAdjustments`, also re-applied on role change). `Users` is never adjustable; image
uploads follow any image-using area (`UPLOAD_RESOURCES`). Adjustments travel in the JWT, so they
take effect on the next token refresh (≤15 min, or the next page load).

## Notes

- Root docs: `README.md`, `DONATIONS_SETUP.md`, `PERFORMANCE.md`, `MONITORING.md`.
- Commit trailer for AI-authored commits:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
