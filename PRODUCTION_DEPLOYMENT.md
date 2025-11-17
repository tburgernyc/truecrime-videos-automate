# Production Deployment Guide

Complete guide to deploy TrueCrime Clay Studio to production.

## 🎯 Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Environment variables ready
- [ ] Code pushed to Git repository
- [ ] (Optional) Production API keys obtained

---

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel auto-detects Vite configuration

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     ```
   - (Optional) Add production API keys

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

**Automatic Deployments:** Every git push to `main` will auto-deploy.

---

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Locally**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Configure Environment**
   - Go to Site Settings → Environment Variables
   - Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Alternative:** Connect your Git repo in Netlify dashboard for auto-deployments.

---

### Option 3: Deploy to Your Own Server

1. **Build the Application**
   ```bash
   npm install
   npm run build
   ```

2. **Upload `dist/` Folder**
   - Use FTP, SCP, or your hosting provider's file manager
   - Upload entire `dist/` directory to your web root

3. **Configure Web Server**

   **For Apache (`.htaccess`):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **For Nginx (`nginx.conf`):**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

4. **Set Environment Variables**
   - Create `.env.production` on your server
   - Or set variables in your hosting control panel

---

## 🔧 Supabase Configuration

### 1. Apply Database Migration

**Method A: Supabase Dashboard (Easiest)**
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy-paste from `supabase/migrations/20250116_create_render_jobs.sql`
5. Click "Run"
6. Verify table created in **Table Editor**

**Method B: Supabase CLI**
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

### 2. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy research-case
supabase functions deploy generate-script
supabase functions deploy generate-storyboard
supabase functions deploy generate-voiceover
supabase functions deploy render-video
supabase functions deploy check-render-status
```

### 3. Set Function Secrets (Optional)

If using production APIs:

```bash
# OpenAI for script generation
supabase secrets set OPENAI_API_KEY=sk-...

# ElevenLabs for voiceover
supabase secrets set ELEVENLABS_API_KEY=...

# Shotstack for video rendering
supabase secrets set SHOTSTACK_API_KEY=...

# Research API (choose one)
supabase secrets set PERPLEXITY_API_KEY=...
# OR
supabase secrets set TAVILY_API_KEY=...
```

### 4. Verify Functions

Test each function in Supabase dashboard:
- Go to **Edge Functions**
- Click on a function
- Use "Invoke" to test
- Check logs for errors

---

## 🔐 Security Configuration

### 1. Enable Supabase RLS (Row Level Security)

Already configured in migration, but verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'render_jobs';
```

Should return `rowsecurity = true`.

### 2. Rotate Keys if Exposed

If you accidentally committed keys to Git:

1. **Supabase Keys:**
   - Go to Settings → API
   - Click "Rotate" on exposed keys
   - Update `.env` with new keys
   - Redeploy

2. **Third-party API Keys:**
   - Generate new keys from provider
   - Update Supabase secrets
   - Update local `.env`

### 3. Configure CORS (if needed)

Edge functions already have CORS headers configured. If you add custom APIs, include:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 📊 Post-Deployment Monitoring

### 1. Check Deployment Status

**Vercel:**
- Visit Deployments tab
- Check build logs
- Verify no errors

**Netlify:**
- Go to Deploys
- Check deploy log
- Verify success message

### 2. Test Core Features

Visit your deployed site and test:

- [ ] Homepage loads
- [ ] Enter case name and click "Research Case"
- [ ] Research data appears
- [ ] Generate script works
- [ ] Storyboard generation works
- [ ] Project save/load works
- [ ] No console errors (F12 DevTools)

### 3. Monitor Supabase

- Go to Supabase **Logs**
- Check Edge Functions logs
- Look for errors or warnings
- Monitor API usage in **Usage** tab

### 4. Monitor Costs

**Supabase Free Tier:**
- 500MB database
- 2GB file storage
- 2GB bandwidth
- 50,000 monthly active users

**Vercel/Netlify Free Tier:**
- 100GB bandwidth
- Unlimited static sites
- Automatic SSL

**Third-party APIs:**
- Check usage dashboards
- Set billing alerts
- Monitor costs daily initially

---

## 🐛 Troubleshooting

### Build Fails

**TypeScript Errors:**
```bash
# Check types locally
npx tsc --noEmit

# If errors, fix them before deploying
```

**Missing Dependencies:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Site Loads But Features Don't Work

**Check Browser Console:**
- Press F12
- Look for errors in Console tab
- Common issues:
  - CORS errors → Check Supabase edge function CORS headers
  - 404 on edge functions → Redeploy functions
  - Environment variable errors → Check `.env` variables are set

**Check Supabase Connection:**
```typescript
// Add to your code temporarily
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key set:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Edge Functions Failing

**Check Function Logs:**
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on failing function
4. Check Logs tab
5. Look for error messages

**Common Issues:**
- Missing environment secrets
- CORS configuration
- Invalid API keys
- Timeout issues

**Fix:**
```bash
# Redeploy function
supabase functions deploy function-name

# Check secrets are set
supabase secrets list
```

### Slow Performance

**Optimize Images:**
- Use WebP format
- Compress images
- Use CDN for assets

**Check Bundle Size:**
```bash
npm run build

# Look for large chunks
# Consider code splitting more aggressively
```

**Enable Caching:**
- Already configured in `netlify.toml`
- Vercel automatically caches static assets

---

## 🎨 Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   - Type: A Record
   - Name: @ (or subdomain)
   - Value: (Vercel provides IP)
4. Wait for DNS propagation (5-60 minutes)
5. SSL automatically enabled

### Netlify

1. Go to Domain Settings
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. SSL automatically enabled via Let's Encrypt

---

## 📈 Production Optimizations

### 1. Add Analytics (Optional)

**Google Analytics:**
```typescript
// In src/main.tsx or App.tsx
if (import.meta.env.PROD) {
  // Add Google Analytics script
}
```

**Plausible (Privacy-friendly):**
```html
<!-- In index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### 2. Error Tracking (Optional)

**Sentry:**
```bash
npm install @sentry/react
```

```typescript
// In src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "your-sentry-dsn",
    environment: "production",
  });
}
```

### 3. Performance Monitoring

Use built-in browser tools:
- Lighthouse (in Chrome DevTools)
- WebPageTest.org
- GTmetrix

**Target Metrics:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

---

## 🔄 Update Process

### Update Application Code

1. **Make changes locally**
2. **Test thoroughly**
   ```bash
   npm run dev
   npm run build
   npm run preview
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```

4. **Auto-deployment**
   - Vercel/Netlify automatically deploys
   - Monitor deployment logs
   - Test live site

### Update Edge Functions

```bash
# Make changes to function
# Test locally if possible

# Deploy updated function
supabase functions deploy function-name

# Test on production
# Check logs
```

### Update Database

```bash
# Create new migration
supabase migration new description

# Write SQL changes

# Test locally
supabase db reset

# Deploy to production
supabase db push
```

---

## ✅ Production Checklist

Before considering deployment complete:

### Pre-Deploy
- [ ] All environment variables documented
- [ ] `.env.example` up to date
- [ ] No secrets in code
- [ ] Build succeeds locally
- [ ] TypeScript has no errors
- [ ] All features tested locally

### Supabase
- [ ] Database migration applied
- [ ] All 6 edge functions deployed
- [ ] RLS policies enabled
- [ ] Function secrets configured (if using APIs)
- [ ] Test edge functions in dashboard

### Deployment
- [ ] Code pushed to Git
- [ ] Deployed to hosting (Vercel/Netlify/Custom)
- [ ] Environment variables set on host
- [ ] Build succeeded
- [ ] Site accessible via URL
- [ ] SSL certificate active (HTTPS)

### Testing
- [ ] Homepage loads
- [ ] All workflow phases accessible
- [ ] Research function works
- [ ] Script generation works
- [ ] Storyboard generation works
- [ ] Video assembly works
- [ ] Project save/load works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works in Chrome, Firefox, Safari

### Monitoring
- [ ] Error tracking configured (optional)
- [ ] Analytics setup (optional)
- [ ] Supabase usage monitored
- [ ] Cost alerts configured
- [ ] Backup strategy in place

### Documentation
- [ ] Deployment URL documented
- [ ] Team has access to accounts
- [ ] API keys securely stored
- [ ] Update process documented

---

## 🆘 Support

If you encounter issues:

1. **Check Documentation:**
   - `SETUP_GUIDE.md`
   - `OPTIMIZATION_SUMMARY.md`
   - This guide

2. **Check Logs:**
   - Browser console (F12)
   - Vercel/Netlify deployment logs
   - Supabase edge function logs

3. **Common Solutions:**
   - Clear browser cache
   - Redeploy edge functions
   - Verify environment variables
   - Check Supabase project status

4. **Get Help:**
   - Supabase Discord: https://discord.supabase.com
   - Vercel Support: https://vercel.com/support
   - GitHub Issues: (your repo)

---

## 🎉 Success!

Your TrueCrime Clay Studio is now live in production!

**Next Steps:**
1. Share the URL with your team
2. Create your first video
3. Monitor usage and costs
4. Gather user feedback
5. Iterate and improve

**Your app is ready to create viral true crime content! 🚀**
