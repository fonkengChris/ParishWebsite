# Hosting Options — Final Production Deployment

For **St. John of God Parish** website. Target: ~200 users (slowly growing), average/low
traffic, most users in **Cameroon/Africa**.

## Chosen setup — Cheapest reliable (~$7/mo)

Managed platforms, no server administration. Backend stays **always-on**, so the daily
liturgical-color cron and any email/SMS reminders never miss.

| Layer | Choice | Cost | Region (best for Cameroon) |
| --- | --- | --- | --- |
| **Frontend** | Cloudflare Pages (or keep Vercel Hobby) | **Free** | Global CDN — Cloudflare has strong Africa coverage |
| **Backend** | Render **Starter** (Node web service) | **$7/mo** | **Frankfurt (EU)** — closest Render region |
| **Database** | MongoDB Atlas **M0** | **Free** | **AWS eu-central-1 (Frankfurt)** — colocate with backend |

**Total: ~$7/mo.**

Why the $7: the app's backend is stateless (media uses external URLs), so the only reason to
spend anything is keeping it awake for the midnight cron job. Render Starter removes free-tier
cold starts (~30–50s) and missed cron runs.

---

## Price ranges by layer (if you want to mix and match)

### Frontend (static Vite site) — effectively free everywhere
| Provider | Cost | Notes |
| --- | --- | --- |
| Cloudflare Pages | **$0** | Unlimited bandwidth, best Africa PoPs — recommended |
| Vercel Hobby | **$0** | Already set up in test; fine |
| Netlify | **$0** | Comparable free tier |

### Backend (Node/Express, needs always-on for cron)
| Provider | Cost | Notes |
| --- | --- | --- |
| Render Free | **$0** | Sleeps after 15 min idle → cold starts + missed cron (needs UptimeRobot workaround) |
| Render Starter | **$7/mo** | Always-on, zero maintenance — **recommended** |
| Railway | **~$5/mo** | Usage-based ($5 hobby credit); can exceed with traffic |
| Fly.io | **~$2–5/mo** | Small always-on machine; slightly more setup |
| Hetzner VPS (CX22) | **~$4/mo** | Cheapest always-on, but you manage OS/TLS/backups |

### Database (MongoDB)
| Provider | Cost | Notes |
| --- | --- | --- |
| MongoDB Atlas M0 | **$0** | 512 MB shared — ample for 200 users |
| Atlas Flex / M10 | **~$9–30+/mo** | Only if you outgrow M0 (thousands of users) |
| Self-host on VPS | **$0 extra** | Runs on the same Hetzner box; you handle backups |

---

## Total-cost scenarios

| Scenario | Frontend | Backend | Database | Monthly |
| --- | --- | --- | --- | --- |
| **Cheapest reliable (chosen)** | Cloudflare Pages $0 | Render Starter $7 | Atlas M0 $0 | **~$7** |
| Absolute cheapest ($0, with caveats) | Pages $0 | Render Free $0 | Atlas M0 $0 | **$0** |
| Cheapest always-on VPS | Pages $0 | Hetzner CX22 ~$4 | Atlas M0 $0 (or self-host) | **~$4** |

_$0 caveat: backend sleeps → ~30–50s cold start on first request and the daily cron may be
skipped unless an UptimeRobot monitor pings `/api/health` every ~10 min._

---

## Scaling headroom

All tiers comfortably handle 200 users at average traffic. First upgrade if you grow to
thousands of active users: move Atlas M0 → Flex/M10, then Render Starter → Standard. Frontend
never needs a paid tier at this scale.
