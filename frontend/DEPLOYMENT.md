# Vercel Deployment Guide

## Prerequisites
1. A GitHub repository with your frontend code pushed
2. A Vercel account (sign up at https://vercel.com)
3. Your backend deployed to Heroku (or another hosting service)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin master
   ```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/new
   - Sign in with GitHub
   - Click "Import Project"
   - Select your frontend repository

3. **Configure Project Settings**:
   - Framework Preset: Vite (should auto-detect)
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-app.herokuapp.com/api`
     - Replace `your-backend-app` with your actual Heroku app name
   - Make sure to add it for Production, Preview, and Development environments

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```
   - Follow the prompts
   - For production deployment: `vercel --prod`

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_API_URL
   ```
   - Enter: `https://your-backend-app.herokuapp.com/api`
   - Select environments: Production, Preview, Development

## Important Notes

- **CORS**: Make sure your Heroku backend has CORS configured to allow requests from your Vercel domain
- **Environment Variables**: The `VITE_API_URL` must be set in Vercel's dashboard/CLI, not in a `.env` file (Vite env vars must start with `VITE_`)
- **Automatic Deployments**: Vercel will automatically deploy when you push to your main branch
- **Preview Deployments**: Every pull request gets a preview deployment URL

## Troubleshooting

### API Calls Returning HTML Instead of JSON

**Symptoms:**
- Console errors like "Unexpected token '<', "<!doctype "... is not valid JSON"
- API calls fail with "API endpoint returned HTML instead of JSON"

**Cause:**
The `VITE_API_URL` environment variable is not set in Vercel, causing the frontend to make API calls to the Vercel domain itself (e.g., `https://your-app.vercel.app/api/...`) instead of your backend.

**Solution:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-app.herokuapp.com/api` (replace with your actual backend URL)
   - **Environment:** Select **Production**, **Preview**, and **Development**
4. **Redeploy** your application (Vercel will automatically redeploy when you save the environment variable, or you can trigger a manual redeploy)

**To verify:**
- After redeploying, check the browser console - you should no longer see the HTML parse errors
- API calls should now go to your backend URL instead of the Vercel domain

### Other Common Issues

- **CORS errors:** Make sure your backend has CORS configured to allow requests from your Vercel domain
- **Backend not accessible:** Verify your backend is running and accessible at the URL specified in `VITE_API_URL`
- **Build errors:** Check Vercel build logs for any build errors

