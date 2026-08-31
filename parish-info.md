# Parish Information — Onboarding Data Sheet

Everything needed to render a new parish on this platform. One shared codebase serves every
parish; a deployment is configured by (a) filling the **identity** and **page copy** below into
the two admin editors (or seeding them), and (b) providing the **per-instance secrets/ops** at
the bottom. No code changes are required to add a parish — see the runbook in
`multi-parish-config.md` §4.

**How this maps to the app**
- **Identity / Contact / Social / Assets** → the `ParishConfig` singleton, edited at
  **Admin → Parish Settings** (`/admin/parish-settings`) or seeded with
  `cd backend && npm run seed-parish` (reads the `PARISH_*` vars in `backend/.env`).
- **Home / About / Page-intro copy** → the `SiteContent` singleton, edited at
  **Admin → Site Content** (`/admin/site-content`). If left unset, the shipped defaults render.
- In any Site Content field you may use interpolation tokens — `{name}`, `{city}`, `{diocese}`,
  `{tagline}`, `{patronName}`, `{patronDescriptor}` — which are replaced with the live Parish
  Settings values at render time.

The **Current value** column shows the St. John of God example (the app's built-in defaults).

---

## 1. Identity

| Field | Description | Current value |
|---|---|---|
| Parish name | Full official name | St. John of God Parish |
| Tagline | Short brand phrase (hero emphasis) | Holy Ground |
| Diocese | Diocese the parish belongs to | Buea Diocese |
| Diocese website URL | Linked from the footer | https://bueadiocese.org |
| City | Town/city | Limbe |
| Region / State | Province/region | Southwest Region |
| Country | Country | Cameroon |
| Neighbourhood | Local area/quarter | Bonadikombo |
| Coordinates (lat, lng) | Map marker position | 4.055278, 9.228056 |
| Display currency | Currency code for donations display | XAF |
| Patron — name | Patron saint | St. John of God |
| Patron — descriptor | Patron's title | Patron of the Sick |

> The diocese name is also used to look up the local Bishop shown on the Home page
> (`frontend/src/data/churchLeadership.ts`). For a parish in a new diocese, add that diocese's
> Bishop entry there.

## 2. Contact

| Field | Description | Current value |
|---|---|---|
| Phone | Parish office phone | +237 333 22 11 00 |
| Email | Public contact email | info@parishlimbe.cm |
| Address | Physical/postal address | Bonadikombo, Limbe |
| Office hours | One line per row | Monday - Friday: 9:00 AM - 5:00 PM · Saturday: 9:00 AM - 12:00 PM · Sunday: Closed |

## 3. Social links (all optional)

| Field | Current value |
|---|---|
| Facebook | _(none)_ |
| YouTube | _(none)_ |
| Instagram | _(none)_ |
| WhatsApp | _(none)_ |
| Twitter / X | _(none)_ |

## 4. Assets

Drop files in `frontend/public/` and reference by path (e.g. `/images/hero.jpg`), or use a full
CDN URL. Set the URLs in **Admin → Parish Settings**.

| Field | Description | Current value |
|---|---|---|
| Logo URL | Site logo | _(uses ✝ mark)_ |
| Favicon URL | Browser tab icon (swapped at runtime) | _(default favicon)_ |
| Hero image URL | Home hero photo | /images/church.jpeg |

---

## 5. Home page copy (`SiteContent.home`)

| Field | Current value |
|---|---|
| Hero heading — lead | Welcome home to |
| Hero heading — emphasis | `{tagline}` → Holy Ground |
| Hero subhead | `{name}` is a family of faith in `{city}` — gathering to worship, to serve the sick, and to walk together through the whole of the Church's year. There's a place for you here. |
| Sanctuary eyebrow | Come and Pray |
| Sanctuary heading — lead | The doors are open. |
| Sanctuary heading — emphasis | Come and stand a while. |
| Sanctuary body | Beyond the news and the schedule there is the quiet of the sanctuary — Adoration, Confession, and the daily Mass, kept faithfully in step with the Church's year. |
| Formation heading | Grow in your faith |
| Formation subhead | Nourish your soul each day through Scripture and the teaching of the Church. |
| Scripture card | eyebrow "Scripture" · title "Immerse yourself in the Holy Bible" · body (daily reading encouragement) · link https://catenabible.com · label "Read the Bible online" |
| Doctrine card | eyebrow "Doctrine" · title "Deepen your faith with the Catechism" · body (Catechism encouragement) · link https://www.vatican.va/archive/ENG0015/_INDEX.HTM · label "Read the Catechism online" |
| Closing quote | "Labour without stopping; do all the good you can while you still have the time." |
| Closing attribution | `{patronName}` · `{patronDescriptor}` → St. John of God · Patron of the Sick |

## 6. About page copy (`SiteContent.about`)

| Field | Current value |
|---|---|
| Sub-hero | Learn more about our parish community |
| History paragraphs (list) | (1) `{name}` was established with a mission to serve the community… grown into a vibrant community… (2) As part of `{diocese}`, we continue to build on the foundation laid by our founders… |
| Mission intro | Our mission is to: |
| Mission points (list) | Provide a welcoming community for all who seek God · Celebrate the sacraments with reverence and joy · Serve those in need through acts of charity and compassion · Educate and form disciples of Christ · Build bridges of understanding and unity |
| Pastoral team (list of role + description) | Parish Priest — Leading our community in faith and service. · Associate Priests — Supporting the pastoral care of our parish. · Deacons — Assisting in liturgy and pastoral ministry. · Parish Staff — Dedicated team supporting parish operations. |
| Get in touch | For more information about our parish, please visit our contact page. |

## 7. Page intros (`SiteContent.pageIntros`)

| Page | Heading | Subhead | Extra |
|---|---|---|---|
| Contact | Contact Us | We'd love to hear from you | — |
| Donations | Support Our Parish | Your generous donations help us continue our mission and serve our community. Thank you for your support! | — |
| Privacy | Privacy Policy | How we collect, use, and protect your information | Effective date (blank → today's date) |

---

## 8. Per-instance secrets & ops (supplied out of band, not in the DB)

Set in the parish's own `backend/.env` (never shared between parishes). See
`backend/.env.example`.

- [ ] `MONGODB_URI` — the parish's **own** database (e.g. `parish-<slug>`)
- [ ] `JWT_SECRET` — unique per instance (`openssl rand -base64 48`) so admin tokens aren't portable
- [ ] `OPENAI_API_KEY` — chatbot (optional; rule-based fallback if unset)
- [ ] `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` — donations (optional)
- [ ] `MTN_*` (`MTN_ENVIRONMENT`, `MTN_SUBSCRIPTION_KEY`, `MTN_API_USER_UUID`, `MTN_API_KEY`, `MTN_API_SECRET`, `MTN_CURRENCY`) — Mobile Money (optional)
- [ ] `SMTP_*` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`) — email (optional)
- [ ] `TWILIO_*` — WhatsApp/SMS notifications (optional)
- [ ] `FRONTEND_URL` / `BACKEND_URL` — deployed URLs (used in emails, payment callbacks, chatbot links)
- [ ] `ALLOWED_ORIGINS` — CORS allow-list including the deployed frontend origin
- [ ] `SCHEDULER_TIMEZONE` — IANA tz for the daily liturgical-color cron (e.g. `Africa/Douala`)
- [ ] `PARISH_*` fallbacks — seed values for identity before the DB singleton is populated
- [ ] Domain + TLS pointed at the instance
- [ ] Admin account created: `cd backend && npm run create-admin`

### Onboarding order (quick)

1. Create DB, set `MONGODB_URI`. 2. Fill `.env` from `.env.example`. 3. Point domain + TLS.
4. `npm run seed-parish` (identity) or fill **Admin → Parish Settings**. 5. Fill **Admin → Site
Content** (or accept defaults). 6. Upload logo/favicon/hero to `frontend/public/`.
7. `npm run create-admin`. 8. (Optional) seed starter content. 9. Deploy the shared build.
