# Deployment guide

How to deploy St. John of God Parish website for live testing on free/cheap tiers.

**Recommended stack**

| Layer    | Platform            | Tier                    |
| -------- | ------------------- | ----------------------- |
| Database | MongoDB Atlas       | M0 (free)               |
| Backend  | Render (Web Service)| Free, or $7/mo Starter  |
| Frontend | Vercel              | Free (Hobby)            |

> **Why Render (not Vercel functions) for the backend?** The backend runs a
> `node-cron` scheduler, which needs an always-on process. Serverless functions
> would not run it reliably.
>
> **Free-tier caveat:** Render free instances sleep after ~15 min idle and
> cold-start in ~30–50s. While asleep the cron won't fire. For reliable testing
> either use the $7/mo Starter plan, or ping `GET /api/health` every ~10 min with
> a free service like UptimeRobot to keep it awake.

---

## 1. Database — MongoDB Atlas

1. Create a free account → new **M0** cluster.
2. **Database Access** → add a user (username + password). Save these.
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — needed because
   Render egress IPs are dynamic).
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/parish-website?retryWrites=true&w=majority
   ```
   Replace `<user>`/`<pass>` and keep `/parish-website` as the db name. This is your
   `MONGODB_URI`.

---

## 2. Backend — Render

1. Push this repo to GitHub.
2. Render → **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter to avoid sleeping)
4. **Environment** → add variables (see `backend/.env.example` for the full list):
   - `NODE_ENV=production`
   - `MONGODB_URI=` (from step 1)
   - `JWT_SECRET=` (generate: `openssl rand -base64 48`)
   - `ALLOWED_ORIGINS=` your Vercel URL (set after step 3, e.g.
     `https://parish-website.vercel.app`)
   - `FRONTEND_URL=` same Vercel URL
   - `BACKEND_URL=` this Render URL (e.g. `https://parish-backend.onrender.com`)
   - `SCHEDULER_TIMEZONE=Africa/Douala`
   - Optional: SMTP_*, TWILIO_*, PAYPAL_*, MTN_* only if testing those features.
     Use **sandbox** credentials for PayPal/MTN.
5. Deploy. Verify: open `https://<your-backend>.onrender.com/api/health` → should
   return `{"status":"ok",...}`.
6. **Seed data** (first deploy only) — from Render's **Shell** tab, or locally with
   the same `MONGODB_URI`:
   ```bash
   npm run create-admin      # creates the admin login
   npm run seed-schedules    # seeds Mass schedules
   ```

---

## 3. Frontend — Vercel

1. Vercel → **New Project** → import the repo.
2. Settings:
   - **Root Directory:** `frontend`
   - Framework preset: **Vite** (build `npm run build`, output `dist` — auto-detected)
3. **Environment Variables:**
   - `VITE_API_URL=https://<your-backend>.onrender.com`
4. Deploy. Copy the resulting URL.
5. **Go back to Render** and make sure `ALLOWED_ORIGINS` and `FRONTEND_URL` contain
   this exact Vercel URL (no trailing slash), then redeploy the backend.

---

## 4. Post-deploy checklist

- [ ] `GET /api/health` returns ok
- [ ] Frontend loads and the liturgical color/theme renders
- [ ] Log in with the seeded admin account
- [ ] Browser devtools → Network: API calls hit the Render URL, no CORS errors
- [ ] Chatbot responds (rule-based fallback is fine; Ollama isn't deployed)
- [ ] (If keeping free tier) UptimeRobot monitor pinging `/api/health` every 10 min

## Notes

- **Uploads/images** are stored as base64 in MongoDB, so there's no disk to
  configure — good, since Render's filesystem is ephemeral.
- **Costs:** everything above is free to start. The only likely spend is Render
  Starter ($7/mo) if you need the cron/notifications to run reliably without an
  uptime pinger.
- **Alternatives:** Railway (backend + DB together, ~$5/mo after trial), Fly.io
  (persistent VMs, small free allowance), Netlify or Cloudflare Pages (interchangeable
  with Vercel for the frontend).
