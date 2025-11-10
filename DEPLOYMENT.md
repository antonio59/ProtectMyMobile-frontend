# ProtectMyMobile Deployment Guide

## Architecture Overview

- **Backend**: Express.js API hosted on Railway with PostgreSQL
- **Frontend**: Astro static site hosted on Cloudflare Pages
- **Domain**: protectmymobile.xyz

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `antonio59/ProtectMyMobile` repository
4. Railway will detect it's a Node.js project

### 1.3 Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create `DATABASE_URL` variable

### 1.4 Configure Environment Variables
In Railway project settings, add these variables:

```
NODE_ENV=production
SESSION_SECRET=<generate-a-secure-random-string>
FRONTEND_URL=https://protectmymobile.xyz

# Email (choose one service)
SMTP2GO_API_KEY=<your-smtp2go-key>
CONTACT_FORM_EMAIL=contact@protectmymobile.xyz

# Admin Credentials
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<choose-secure-password>
```

**Generate secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.5 Deploy
1. Railway will automatically deploy on push
2. Once deployed, copy your Railway URL (e.g., `https://protectmymobile-production.up.railway.app`)
3. Note this URL - you'll need it for the frontend

### 1.6 Run Database Migrations
1. In Railway dashboard, go to your service
2. Click "Settings" → "Variables" tab
3. Verify DATABASE_URL is set
4. In your local terminal:
```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile
# Update .env with Railway DATABASE_URL
npm run db:push
```

## Step 2: Deploy Frontend to Cloudflare Pages

### 2.1 Update API URL
1. Edit `/Users/antoniosmith/Projects/ProtectMyMobile-astro/.env`:
```
PUBLIC_API_URL=https://your-railway-url.railway.app
```

2. Commit and push:
```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile-astro
git add .env
git commit -m "Update API URL for production"
git push
```

### 2.2 Create Cloudflare Pages Project
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to "Workers & Pages" → "Create application"
3. Select "Pages" → "Connect to Git"
4. Authorize GitHub and select `antonio59/ProtectMyMobile-frontend`

### 2.3 Configure Build Settings
```
Framework preset: Astro
Build command: npm run build
Build output directory: dist
```

### 2.4 Add Environment Variables
In Cloudflare Pages settings:
```
PUBLIC_API_URL=https://your-railway-url.railway.app
```

### 2.5 Deploy
1. Click "Save and Deploy"
2. Cloudflare will build and deploy your site
3. You'll get a URL like `protectmymobile-frontend.pages.dev`

## Step 3: Configure Custom Domain

### 3.1 Point Domain to Cloudflare Pages
1. In Cloudflare Pages project, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter `protectmymobile.xyz`
4. Cloudflare will provide DNS records to add

### 3.2 Update DNS Records
If your domain is already on Cloudflare:
1. Go to DNS settings
2. Add CNAME record pointing to your Pages deployment

If domain is elsewhere:
1. Update nameservers to Cloudflare
2. Wait for propagation (24-48 hours)

### 3.3 Update Environment Variables
Once domain is active, update in Railway:
```
FRONTEND_URL=https://protectmymobile.xyz
```

## Step 4: Testing

### 4.1 Test Backend
```bash
curl https://your-railway-url.railway.app/api/health
```

### 4.2 Test Frontend
1. Visit https://protectmymobile.xyz
2. Test navigation
3. Test contact form
4. Test security checkup
5. Test admin login

### 4.3 Test API Integration
1. Open browser DevTools → Network tab
2. Submit contact form
3. Verify API calls to Railway backend succeed

## Step 5: Enable HTTPS & Security

### 5.1 Force HTTPS (Cloudflare)
1. SSL/TLS → Overview → Set to "Full (strict)"
2. SSL/TLS → Edge Certificates → Enable "Always Use HTTPS"

### 5.2 Configure Security Headers
In Cloudflare Pages:
1. Go to "Functions" → "Headers"
2. Add security headers (CSP, X-Frame-Options, etc.)

## Maintenance

### Updating Backend
```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile
# Make changes
git add .
git commit -m "Your changes"
git push
# Railway auto-deploys
```

### Updating Frontend
```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile-astro
# Make changes
git add .
git commit -m "Your changes"
git push
# Cloudflare Pages auto-deploys
```

## Troubleshooting

### CORS Issues
- Verify `FRONTEND_URL` in Railway matches your actual domain
- Check browser console for specific CORS errors
- Verify Railway backend is running

### Database Connection Issues
- Check `DATABASE_URL` in Railway variables
- Verify PostgreSQL service is running
- Run migrations: `npm run db:push`

### Build Failures
**Frontend:**
- Check Cloudflare Pages build logs
- Verify `PUBLIC_API_URL` is set
- Test build locally: `npm run build`

**Backend:**
- Check Railway deployment logs
- Verify all dependencies in package.json
- Test locally: `npm run start`

## Cost Breakdown

- **Railway**: $5/month free credit, then ~$5-10/month
- **Cloudflare Pages**: Free (unlimited bandwidth & builds)
- **PostgreSQL**: Included in Railway
- **Total**: Free to start, ~$5-10/month after credits

## Support

- Backend repo: https://github.com/antonio59/ProtectMyMobile
- Frontend repo: https://github.com/antonio59/ProtectMyMobile-frontend
