# Multi-Parish Configuration — Implementation Guide

> **Purpose:** Convert this single-parish template into a multi-parish product. One shared
> codebase, deployed as isolated instances (own DB, own domain, own secrets, own config).
> Both parish **identity** (name, contacts, branding) and the **editorial copy** on the static
> pages (Home, About, page intros) are fetched at **runtime** from the backend and are
> admin-editable, so **one frontend build serves every parish**. This document is a
> step-by-step execution guide — follow it top to bottom.

---

## 0. Background & decisions (already made)

- **Hosting model:** Hybrid. Parishes license the app; **we host each parish ourselves**.
- **Isolation:** One MongoDB **database per parish**, one **domain per parish**, one **`.env`
  per parish**. Data never mixes. NOT multi-tenant (no shared DB with tenant IDs).
- **No forking:** Single Git repo = single source of truth. Fixes/features ship once and get
  redeployed to each instance.
- **Config delivery:** Runtime. Two **singleton documents** in each parish's own DB, both
  fetched on load (mirroring the existing `ThemeContext` → `liturgicalColorAPI` pattern) and
  both admin-editable:
  1. **`ParishConfig`** — identity/contacts/branding (`GET /api/parish-config`), seeded from
     `PARISH_*` env vars.
  2. **`SiteContent`** — editorial copy for the static pages (`GET /api/site-content`), seeded
     from a shipped defaults file so an unconfigured instance renders exactly like today.
- **Two classes of static text — treat them differently:**
  - **Universal Catholic content** (same for every parish → stays hardcoded in `frontend/src/data/`):
    Order of the Mass (`massData.ts`), Benediction (`benedictionData.ts`), Confession steps
    (`confessionData.ts`), sacrament defaults (`sacraments.ts`), enum/label constants
    (`constants.ts`). Do NOT make these configurable.
  - **Parish editorial copy** (differs per parish → move to `SiteContent`): Home hero/sanctuary/
    formation/closing-verse, About history/mission/pastoral-team, and per-page intro headings.
- **What else stays universal (do NOT make configurable):** the liturgical color system
  (`ThemeContext`, `routes/liturgicalColor.js`) and the Catholic saint calendar
  (`backend/utils/saintCalendar.js`). These are the same for every Catholic parish.

---

## 1. Current state (what's hardcoded today)

### Backend — already ~80% config-driven (minimal work)
Already read from `.env` — leave as-is:
- `PARISH_NAME`, `PARISH_CONTACT_EMAIL`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
  → `backend/routes/contact.js`, `backend/services/paymentService.js`
- `SCHEDULER_TIMEZONE` → `backend/startup/scheduler.js`
- currency (`MTN_CURRENCY`, default `XAF`) → `backend/models/Donation.js`
- Secrets already per-instance: `OPENAI_API_KEY`, `PAYPAL_*`, `TWILIO_*`, `MTN_*`, `MONGODB_URI`
- `backend/utils/saintCalendar.js` — universal, do not touch
- `backend/scripts/seedDemoData.js` — demo/seed only, not runtime

### Frontend — the real work
Partial source of truth exists in `frontend/src/components/Map.tsx`:
```
export const PARISH_COORDINATES: [number, number] = [4.055278, 9.228056];
export const PARISH_NAME = 'St. John of God Parish';
export const PARISH_DIOCESE = 'Buea Diocese';
export const PARISH_LOCATION = { name, diocese, city:'Limbe', region, country:'Cameroon', coordinates };
```
Imported correctly by `Footer.tsx`, `AboutUs.tsx`, `Contact.tsx`, `PrivacyPolicy.tsx`.

**Hardcoded leaks to eliminate (exact locations):**

| File | Hardcoded value(s) |
|---|---|
| `components/Map.tsx` | `"Limbe, Cameroon"` literal in the Marker popup (~line 62); the coordinates + comment |
| `components/Footer.tsx` | `href="https://bueadiocese.org"` (~L54); `"Limbe"` (~L59); `"on Holy Ground."` (~L65); `"Buea Diocese · Cameroon"` (~L99) |
| `components/Navbar.tsx` | `"Buea Diocese · Limbe"` (~L101) |
| `pages/Contact.tsx` | `"{PARISH_NAME}, Bonadikombo, Limbe"` (~L149, "Bonadikombo" hardcoded); phone `+237 333 22 11 00` (~L157); email `info@parishlimbe.cm` (~L164); office hours block (~L170-172) |
| `pages/Home.tsx` | `"Holy Ground"` (~L136); `"Limbe"` (~L139); `"St. John of God · Patron of the Sick"` (~L514) |

**Values with NO config home yet (must be added):** contact details (phone, email, physical
address, office hours), social links, diocese website URL, brand tagline ("Holy Ground"),
patron saint (name + descriptor), and assets (logo, favicon, hero image).

### Frontend — editorial copy hardcoded in JSX (the new work)
Substantial parish-specific prose is baked into the static pages. These become `SiteContent`
fields (see §2.5 / §8 for the full key map). The two big ones:
- **`pages/Home.tsx`** — hero heading + subhead (~L135-142), the "Come and Pray" sanctuary band
  eyebrow/heading/body (~L232-241), the "Formation" section heading/subhead (~L269-274), the
  Scripture & Doctrine cards incl. external Bible/Catechism URLs (~L280-317), and the closing
  verse quote + attribution (~L510-514).
- **`pages/AboutUs.tsx`** — the sub-hero line (~L11), "Our History" paragraphs (~L24-31),
  "Our Mission" intro + 5 bullet points (~L46-69), and the 4 "Pastoral Team" role blurbs
  (~L87-116).
- **Smaller page intros** (headings/subheads only): `Contact.tsx` (~L135), `Donations.tsx`
  "Support Our Parish" (~L314), `PrivacyPolicy.tsx` intro + effective date (~L10).
- **Leave as-is (universal or already DB-driven):** `Sacraments.tsx`/`Ministries.tsx` defaults,
  `MassSchedule.tsx` fallback lines, and everything sourced from `frontend/src/data/*`.

---

## 2. Backend implementation

### 2.1 New model — `backend/models/ParishConfig.js`
Singleton document (one parish per DB). Model it after `backend/models/LiturgicalColorOverride.js`.

Schema fields:
```
name: String                    // "St. John of God Parish"
diocese: String                 // "Buea Diocese"
dioceseUrl: String              // "https://bueadiocese.org"
city: String                    // "Limbe"
region: String
country: String                 // "Cameroon"
coordinates: { lat: Number, lng: Number }
neighbourhood: String           // "Bonadikombo"
contact: {
  phone: String,
  email: String,
  address: String,
  officeHours: [String]         // ["Mon–Fri: 9:00 AM – 5:00 PM", "Sat: 9–12", "Sun: Closed"]
}
social: { facebook, youtube, instagram, whatsapp, twitter }   // all optional Strings
tagline: String                 // "Holy Ground"
patron: { name: String, descriptor: String }   // "St. John of God", "Patron of the Sick"
assets: { logoUrl: String, faviconUrl: String, heroUrl: String }
currency: String                // display currency, default "XAF"
timestamps: true
```
Enforce singleton (e.g. a fixed `key: 'default'` unique field, or always operate on
`findOne()` / `findOneAndUpdate({}, ..., { upsert: true })`).

### 2.2 New route — `backend/routes/parishConfig.js`
- `GET /api/parish-config` — **public**, no auth. Returns the singleton. If none exists,
  build a fallback object from env vars (`PARISH_NAME`, `PARISH_CONTACT_EMAIL`, etc.) so an
  unconfigured instance still renders. Set cache headers (short TTL) — this is read on every
  page load.
- `PUT /api/parish-config` — **admin-only**. Reuse existing JWT/role middleware (see how
  `routes/liturgicalColor.js` guards its override endpoint). Upsert the singleton.

### 2.3 Wire it up — `backend/server.js`
Register the router next to the other route registrations:
```
import parishConfigRoutes from './routes/parishConfig.js';
app.use('/api/parish-config', parishConfigRoutes);
```

### 2.4 Env additions — `backend/.env.example`
Add fallback vars (used only until the DB singleton is populated):
```
PARISH_DIOCESE=
PARISH_DIOCESE_URL=
PARISH_CITY=
PARISH_COUNTRY=
PARISH_COORDINATES=            # "4.055278,9.228056"
PARISH_TAGLINE=
PARISH_PATRON_NAME=
PARISH_PATRON_DESCRIPTOR=
PARISH_PHONE=
```
(Keep existing `PARISH_NAME`, `PARISH_CONTACT_EMAIL`, `SMTP_*`, `SCHEDULER_TIMEZONE`,
`MTN_CURRENCY`, secrets.)

### 2.5 New model — `backend/models/SiteContent.js`
Second singleton document (same singleton pattern as 2.1) holding the static-page editorial
copy. Structure it **by page**, with typed fields — arrays for lists, strings for paragraphs.
Keep it structured (not free-form key/value) so the frontend stays type-safe. Shape:
```
home: {
  heroHeadingLead: String,        // "Welcome home to"
  heroHeadingEmph: String,        // "Holy Ground"  (rendered italic; may reuse ParishConfig.tagline)
  heroSubhead: String,
  sanctuaryEyebrow: String,       // "Come and Pray"
  sanctuaryHeadingLead: String,   // "The doors are open."
  sanctuaryHeadingEmph: String,   // "Come and stand a while."
  sanctuaryBody: String,
  formationHeading: String,       // "Grow in your faith"
  formationSubhead: String,
  scriptureCard: { eyebrow, title, body, linkUrl, linkLabel },
  doctrineCard:  { eyebrow, title, body, linkUrl, linkLabel },
  closingQuote: String,
  closingAttribution: String      // may reuse ParishConfig.patron
}
about: {
  subHero: String,                // "Learn more about our parish community"
  historyParagraphs: [String],
  missionIntro: String,           // "Our mission is to:"
  missionPoints: [String],
  pastoralTeam: [ { role: String, description: String } ],  // Parish Priest, Associate Priests, ...
  getInTouch: String
}
pageIntros: {                     // { heading, subhead } per page
  contact:   { heading, subhead },
  donations: { heading, subhead },
  privacy:   { heading, subhead, effectiveDate }
}
timestamps: true
```
> Design note: fields that duplicate identity (`heroHeadingEmph` ≈ tagline, `closingAttribution`
> ≈ patron) may either live here for full editorial freedom or be derived from `ParishConfig`.
> Recommend keeping them in `SiteContent` so a parish can word them freely.

### 2.6 New route — `backend/routes/siteContent.js`
- `GET /api/site-content` — **public**. Returns the singleton; if none exists, return the
  shipped defaults (see §3.8) so the page renders identically to today. Cache headers, short TTL.
- `PUT /api/site-content` — **admin-only**, same middleware as 2.2. Upsert. Consider allowing
  partial deep-merge so admins can edit one section without resending the whole document.
- Register in `server.js`: `app.use('/api/site-content', siteContentRoutes);`

---

## 3. Frontend implementation

### 3.1 Type — `frontend/src/types/index.ts`
Add a `ParishConfig` interface mirroring the backend schema (2.1).

### 3.2 API module — `frontend/src/services/api.ts`
Add a typed module next to the existing ones (e.g. `liturgicalColorAPI`):
```
export const parishConfigAPI = {
  get: () => api.get<ParishConfig>('/parish-config').then(r => r.data),
  update: (data: Partial<ParishConfig>) => api.put('/parish-config', data).then(r => r.data),
};
```

### 3.3 Context — `frontend/src/contexts/ParishContext.tsx`
Mirror `frontend/src/contexts/ThemeContext.tsx`:
- On mount, call `parishConfigAPI.get()`; store in state.
- Provide hardcoded **default** values while loading (so first paint isn't blank) — use the
  current St. John of God values as the defaults object.
- Export `useParish()` hook returning the config.
- Wrap the app with `<ParishProvider>` where `<ThemeProvider>` is mounted (check `App.tsx` /
  `main.tsx`).

### 3.4 Replace the hardcoded leaks
Delete the exported constants from `components/Map.tsx` and replace **all** usages
(and the leaked literals in §1) with `useParish()` values:

| File | Change |
|---|---|
| `Map.tsx` | Accept coordinates + name/diocese/city/country via props or read from `useParish()`; remove `PARISH_*` exports; fix the `"Limbe, Cameroon"` popup literal |
| `Footer.tsx` | Replace diocese URL, `"Limbe"`, `"on Holy Ground"`, `"Buea Diocese · Cameroon"` with config |
| `Navbar.tsx` | Replace `"Buea Diocese · Limbe"` with `${diocese} · ${city}` |
| `Contact.tsx` | Replace neighbourhood, phone, email, office hours with `config.contact.*` + `config.neighbourhood` |
| `Home.tsx` | Replace tagline, `"Limbe"`, patron line with `config.tagline`, `config.city`, `config.patron.*` |
| `AboutUs.tsx`, `PrivacyPolicy.tsx` | Swap `PARISH_NAME`/`PARISH_DIOCESE` imports for `useParish()` |

> ⚠️ Any file that currently does `import { PARISH_NAME } from '.../Map'` must be updated —
> grep for it (see §6) so none are missed when the constants are removed.

### 3.5 Admin editor — `frontend/src/pages/admin/`
New admin page (follow an existing admin page's structure) to edit the config: name, diocese,
contacts, office hours, social links, tagline, patron, asset URLs. Calls `parishConfigAPI.update`.
Add a route + nav entry alongside the other admin pages.

### 3.6 Assets (logo / favicon / hero)
Reference by URL from `config.assets.*`. Two options:
- **Simple:** each deployment drops its own files in `frontend/public/` (logo.png, favicon,
  hero.jpg) and config URLs point at them.
- **Flexible:** store asset URLs (e.g. an uploads/CDN path) in the config document, editable
  from the admin page. Favicon can be swapped at runtime by updating the `<link rel="icon">`.

### 3.7 Design migration (opportunistic)
Per `CLAUDE.md`, `Home/Footer/Navbar` are migrated but the ~40 inner pages are not. When you
edit `Contact.tsx`, `AboutUs.tsx`, `PrivacyPolicy.tsx` here, migrate them to the
"Communion × Sanctuary" tokens/fonts (ivory/ink/gold, Fraunces/Playfair/Inter, arch motif,
no emoji — replace the 📍📞✉️🕐 in `Contact.tsx` with SVG or type marks).

### 3.8 Site content — type, defaults, API, context
1. **Type** — add a `SiteContent` interface to `frontend/src/types/index.ts` mirroring §2.5.
2. **Defaults** — `frontend/src/data/defaultSiteContent.ts`: a single `SiteContent` object
   holding the **current** St. John of God copy (lift the exact strings extracted in §8). This
   is the single source of default copy — used for first paint, as loading fallback, and as the
   backend seed. Keep `frontend/src/data/*` liturgical files untouched.
3. **API module** — in `services/api.ts`, add `siteContentAPI` (`get`, `update`) next to
   `parishConfigAPI`.
4. **Context** — `frontend/src/contexts/SiteContentContext.tsx`, mirroring `ParishContext`
   (§3.3): fetch `/api/site-content` on mount, fall back to `defaultSiteContent`, expose
   `useSiteContent()`. Mount `<SiteContentProvider>` alongside `<ParishProvider>`.
   > You may combine identity + content into one provider/one fetch if you prefer fewer round
   > trips — but keep the two DB documents and two endpoints separate (different edit UX).

### 3.9 Wire the static pages to `useSiteContent()`
Replace the hardcoded prose (inventory in §1 / exact keys in §8) with content values:
| File | Pull from |
|---|---|
| `Home.tsx` | `content.home.*` (hero, sanctuary band, formation, scripture/doctrine cards + link URLs, closing verse) |
| `AboutUs.tsx` | `content.about.*` — map `historyParagraphs[]`, `missionPoints[]`, `pastoralTeam[]` with `.map()` |
| `Contact.tsx`, `Donations.tsx`, `PrivacyPolicy.tsx` | `content.pageIntros.*` for headings/subheads |

### 3.10 Admin editor — `frontend/src/pages/admin/`
Add a **"Site Content"** admin page (separate from the "Parish Settings" page in §3.5), with
grouped textareas/inputs matching the `SiteContent` structure — repeatable rows for
`historyParagraphs`, `missionPoints`, and `pastoralTeam`. Saves via `siteContentAPI.update`.
Add route + admin-nav entry. (Optional polish: allow simple Markdown in paragraph fields and
render with a small sanitizer.)

---

## 4. Per-parish onboarding runbook (repeat for each parish)

1. **Create database:** new MongoDB database (e.g. `parish-<slug>`); set `MONGODB_URI`.
2. **Create `.env`:** copy `.env.example`; fill parish's own `OPENAI_API_KEY`, `PAYPAL_*`,
   `TWILIO_*`/`MTN_*`, `SMTP_*`, `JWT_SECRET` (unique per parish), `FRONTEND_URL`,
   `SCHEDULER_TIMEZONE`, `MTN_CURRENCY`, and the `PARISH_*` fallbacks.
3. **Domain:** point the parish domain at this instance; configure TLS.
4. **Seed identity:** create the `ParishConfig` singleton (admin UI or seed script) with the
   parish's real name, diocese, coordinates, contacts, tagline, patron, social, assets.
5. **Seed page copy:** create the `SiteContent` singleton — either accept the shipped defaults
   and let the parish edit via the "Site Content" admin page, or pre-fill their Home/About copy.
6. **Assets:** upload the parish's logo, favicon, hero image.
7. **Admin account:** `cd backend && npm run create-admin`.
8. **Seed starter content** (optional): adapt `scripts/seedDemoData.js` or let the parish add
   sermons/events/announcements via admin.
9. **Deploy** the same shared build. Verify (§5).

> Adding parish #3+ is this checklist only — **no code changes**.

---

## 5. Verification

**Backend**
- `cd backend && npm run dev`
- `curl localhost:<PORT>/api/parish-config` → returns seeded/fallback config as JSON.
- `PUT` a change (as admin) → persists and re-fetches.
- `cd backend && npm test`

**Frontend**
- `cd frontend && npm run dev` → name, diocese, contacts, tagline, patron all render from the
  `/api/parish-config` API; Home/About prose renders from `/api/site-content`.
- **No parish literals remain in JSX:**
  `grep -rniE "limbe|buea|holy ground|bonadikombo|john of god|\+237 333" frontend/src`
  and prose spot-checks (`"Welcome home"`, `"Come and stand a while"`, `"Our mission is to"`,
  `"vibrant community"`) should only hit `data/defaultSiteContent.ts` / types / this doc.
- **One-build-many-parishes proof:** run a second backend on a different DB with a different
  `ParishConfig` **and `SiteContent`**; point the same frontend build at it → different identity
  AND different Home/About copy render, zero rebuild.
- **Empty-DB proof:** with no singletons seeded, the site renders identically to today (defaults).
- `cd frontend && npm run build` (tsc + vite) passes.
- `cd frontend && npm run lint` (max-warnings 0) passes.

---

## 6. Quick grep cheatsheet (find every touchpoint)

```bash
# Frontend files importing the constants that will be removed:
grep -rn "from './Map'" frontend/src
grep -rn "PARISH_NAME\|PARISH_DIOCESE\|PARISH_LOCATION\|PARISH_COORDINATES" frontend/src

# All hardcoded parish identity across the repo:
grep -rniE "st\.? ?john of god|buea|limbe|cameroon|holy ground|bonadikombo|\+237" \
  frontend/src backend --include=*.ts --include=*.tsx --include=*.js | grep -v node_modules

# Editorial prose to move into SiteContent (spot-check strings):
grep -rniE "welcome home|come and stand|grow in your faith|our mission is|vibrant community|pastoral team" \
  frontend/src/pages

# Existing patterns to copy:
#   Context:   frontend/src/contexts/ThemeContext.tsx
#   API module: frontend/src/services/api.ts (liturgicalColorAPI)
#   Model:     backend/models/LiturgicalColorOverride.js
#   Route+auth: backend/routes/liturgicalColor.js
```

---

## 7. Security reminder
- Each parish gets its **own** `OPENAI_API_KEY`, PayPal, Twilio/MTN, and SMTP credentials —
  never share one key across instances.
- **Rotate the current `OPENAI_API_KEY`** in `backend/.env` (it was exposed) and confirm
  `backend/.env` is git-ignored and was never committed.
- Use a unique `JWT_SECRET` per instance so admin tokens are not portable between parishes.

---

## 8. Appendix — static page content map (current copy = the defaults)

Lift these exact strings into `frontend/src/data/defaultSiteContent.ts` (§3.8). Source line
numbers are approximate. Words that also exist as identity (`{PARISH_NAME}`, tagline, patron)
stay interpolated / sourced from `ParishConfig`.

### `home.*` — from `pages/Home.tsx`
| Key | Current default text |
|---|---|
| `heroHeadingLead` | "Welcome home to" |
| `heroHeadingEmph` | "Holy Ground" (= `ParishConfig.tagline`) |
| `heroSubhead` | "{PARISH_NAME} is a family of faith in {city} — gathering to worship, to serve the sick, and to walk together through the whole of the Church's year. There's a place for you here." |
| `sanctuaryEyebrow` | "Come and Pray" |
| `sanctuaryHeadingLead` | "The doors are open." |
| `sanctuaryHeadingEmph` | "Come and stand a while." |
| `sanctuaryBody` | "Beyond the news and the schedule there is the quiet of the sanctuary — Adoration, Confession, and the daily Mass, kept faithfully in step with the Church's year." |
| `formationHeading` | "Grow in your faith" |
| `formationSubhead` | "Nourish your soul each day through Scripture and the teaching of the Church." |
| `scriptureCard` | eyebrow "Scripture" · title "Immerse yourself in the Holy Bible" · body "Make a habit of reading the Scriptures daily. God speaks to us through His Word — strengthening, guiding, and consoling us in every circumstance." · linkUrl `https://catenabible.com` · linkLabel "Read the Bible online" |
| `doctrineCard` | eyebrow "Doctrine" · title "Deepen your faith with the Catechism" · body "The Catechism of the Catholic Church presents the faith clearly and completely. Regular reading helps you understand what the Church believes and teaches." · linkUrl `https://www.vatican.va/archive/ENG0015/_INDEX.HTM` · linkLabel "Read the Catechism online" |
| `closingQuote` | "Labour without stopping; do all the good you can while you still have the time." |
| `closingAttribution` | "St. John of God · Patron of the Sick" (= `ParishConfig.patron.name · descriptor`) |

### `about.*` — from `pages/AboutUs.tsx`
| Key | Current default text |
|---|---|
| `subHero` | "Learn more about our parish community" |
| `historyParagraphs[0]` | "{PARISH_NAME} was established with a mission to serve the community and spread the message of faith, hope, and love. Over the years, we have grown into a vibrant community dedicated to worship, service, and fellowship." |
| `historyParagraphs[1]` | "As part of {PARISH_DIOCESE}, we continue to build on the foundation laid by our founders, embracing both tradition and innovation in our ministry to serve God and our neighbors." |
| `missionIntro` | "Our mission is to:" |
| `missionPoints` | ["Provide a welcoming community for all who seek God", "Celebrate the sacraments with reverence and joy", "Serve those in need through acts of charity and compassion", "Educate and form disciples of Christ", "Build bridges of understanding and unity"] |
| `pastoralTeam` | [ {"Parish Priest","Leading our community in faith and service."}, {"Associate Priests","Supporting the pastoral care of our parish."}, {"Deacons","Assisting in liturgy and pastoral ministry."}, {"Parish Staff","Dedicated team supporting parish operations."} ] |
| `getInTouch` | (the "Get in Touch" blurb, ~L128-131) |

### `pageIntros.*`
| Key | Current default text | Source |
|---|---|---|
| `contact.heading` / `subhead` | "Contact Us" / (subhead) | `Contact.tsx` ~L135 |
| `donations.heading` / `subhead` | "Support Our Parish" / (subhead) | `Donations.tsx` ~L314 |
| `privacy.heading` / `subhead` / `effectiveDate` | "Privacy Policy" / "How we collect, use, and protect your information" / (date) | `PrivacyPolicy.tsx` ~L10 |

> Not in scope (universal or DB-driven): `Sacraments.tsx` (`data/sacraments.ts`),
> `Ministries.tsx`, `MassSchedule.tsx` fallbacks, and all of `frontend/src/data/*` liturgical
> text (`massData`, `benedictionData`, `confessionData`, `constants`).
