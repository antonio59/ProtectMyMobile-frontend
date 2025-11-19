# Deployment Guide

**ProtectMyMobile** is deployed as a server-side rendered (SSR) Astro application on Netlify, backed by a Supabase PostgreSQL database.

---

## 1. Supabase Setup (Database)

1. **Create a Project**: Go to [Supabase](https://supabase.com) and create a new project.
2. **Get Credentials**: Go to **Project Settings** -> **API**. Copy:
   - `URL`
   - `anon` (public) key
3. **Initialize Schema**:
   - Go to **SQL Editor**.
   - Open `supabase-schema.sql` from this repository.
   - Run the SQL query to create tables and RLS policies.
4. **Fix Contact Form Permissions** (Important):
   - Run the SQL command from `FIX_CONTACT_FORM_RLS.sql` to ensure the public contact form works correctly.

---

## 2. Netlify Setup (Frontend & SSR)

1. **Connect to GitHub**:
   - Log in to Netlify.
   - Click "Add new site" -> "Import an existing project".
   - Select your GitHub repository.

2. **Build Settings**:
   - **Framework**: Astro
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
   Go to **Site Configuration** -> **Environment variables** and add:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL |
   | `PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` | Your Supabase Anon Public Key |
   | `RESEND_API_KEY` | `re_...` | (Optional) For email notifications |

4. **Deploy**:
   - Click "Deploy site".
   - Netlify will build and deploy your application.

---

## 3. Keep-Alive (Optional but Recommended)

If you are on the **Supabase Free Tier**, your project may "pause" after inactivity.

This repository includes a **GitHub Action** (`.github/workflows/supabase-keep-alive.yml`) that pings your database twice a week to keep it active.

**To enable it:**
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following Repository Secrets:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

The workflow will run automatically on Mondays and Thursdays.

---

## 4. Troubleshooting

### Contact Form "Internal Server Error"
- This is usually a Row-Level Security (RLS) issue.
- Ensure you have run `FIX_CONTACT_FORM_RLS.sql` in your Supabase SQL Editor.
- Check the browser network tab for the API response.

### Map Not Loading
- Ensure `public/london-boroughs-simple.json` exists and is accessible.
- Check that `leaflet.css` is being loaded (it should be imported in the component).

### Build Failures
- Check the Netlify deploy logs.
- Ensure you didn't commit `package-lock.json` conflicts.
- Verify all dependencies are in `package.json`.
