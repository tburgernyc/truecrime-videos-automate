# Deploy to Vercel - Complete Guide

Deploy your True Crime Video Production app to Vercel in under 5 minutes!

## 🌟 Why Vercel?

- ✅ **Free hosting** for frontend apps
- ✅ **Automatic HTTPS** with custom domains
- ✅ **Global CDN** for fast loading
- ✅ **Automatic deployments** from GitHub
- ✅ **Zero configuration** for Vite/React apps
- ✅ **Perfect for this project** - no backend needed

## 📋 Prerequisites

Before deploying, make sure you've:

1. ✅ Deployed Supabase Edge Functions (see `DEPLOYMENT_GUIDE.md`)
2. ✅ Created the database table (via migration)
3. ✅ Have your Supabase credentials in `.env`

## 🚀 Deployment Options

### Option 1: Deploy via Vercel Website (Easiest)

#### **Step 1: Push to GitHub**

First, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - TrueCrime Clay Studio"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### **Step 2: Deploy to Vercel**

1. Go to https://vercel.com and sign up (free)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite - no config needed!
5. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add these:
     - `VITE_SUPABASE_URL` = `https://tcwmbwkvflnranchrhyr.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Gsrt45m5y4Rdd6EPSAE-AQ_u-mf-7nq`
6. Click **"Deploy"**

**That's it!** Your app will be live at `https://your-project.vercel.app` in ~2 minutes.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - What's your project's name? truecrime-videos-automate
# - In which directory is your code? ./
# - Want to override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://tcwmbwkvflnranchrhyr.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: sb_publishable_Gsrt45m5y4Rdd6EPSAE-AQ_u-mf-7nq

# Deploy to production
vercel --prod
```

## 🔧 Configuration Files Created

### `vercel.json`
Already created with optimal settings for your Vite app:
- Auto-detects build command
- Routes all paths to index.html (for React Router)
- Optimized for fast builds

## 🌐 After Deployment

### Your App Will Be Live At:
```
https://truecrime-videos-automate.vercel.app
```

Or your custom domain if you set one up.

### What You Can Do:

1. **Open the web interface** - No command line needed!
2. **Start Production** - Click the button on homepage
3. **Follow the 7-phase workflow:**
   - Phase 1: Topic Discovery
   - Phase 2: Case Research
   - Phase 3: Script Writing
   - Phase 4: Claymation Storyboard
   - Phase 5: Video Assembly
   - Phase 6: YouTube Packaging
   - Phase 7: JSON Export

## 🎨 UI Features

Your deployed app includes:

### **Home Page**
- Hero section with "Start Production" button
- Feature cards showcasing capabilities
- Complete production pipeline overview

### **Production Dashboard**
- Config panel for settings
- Progress bar tracking workflow phases
- Action panel for phase controls

### **Phase 1: Topic Discovery**
- Input field for case names
- Trending topics suggestions

### **Phase 2: Case Research**
- Research card with case details
- Fact-checking and source verification
- Timeline of events

### **Phase 3: Script Editor**
- Full-featured markdown editor
- Real-time preview
- Export capabilities

### **Phase 4: Storyboard Viewer**
- Visual scene previews
- Shot list with descriptions
- Duration and timing info

### **Phase 5: Video Assembly**
- Timeline editor
- Scene reordering (drag to reorder)
- Transition controls
- Resolution/FPS settings
- **Export MP4 button** (calls your Supabase Edge Functions)

### **Phase 6: YouTube Packaging**
- Title generator
- Tag suggestions
- Thumbnail concepts
- SEO optimization

### **Phase 7: JSON Output**
- Complete data export
- Download production file

## 🔄 Automatic Deployments

Once connected to GitHub:

1. **Push to `main` branch** → Automatic production deployment
2. **Create PR** → Preview deployment for testing
3. **Merge PR** → Automatic production update

```bash
# Make changes
git add .
git commit -m "Update video assembly feature"
git push

# Vercel automatically deploys!
```

## 🎯 Environment Variables

### Required (Already Set):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase public key

### Optional:
- None needed for frontend deployment
- Shotstack API key is set on Supabase (via `supabase secrets`)

### How to Update Env Vars:

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add/Edit variables
5. Redeploy for changes to take effect

**Via CLI:**
```bash
vercel env add VARIABLE_NAME
vercel env ls  # List all variables
vercel env rm VARIABLE_NAME  # Remove a variable
```

## 🔐 Security Notes

### What's Safe in Vercel:
- ✅ `VITE_SUPABASE_URL` - Public URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Public anon key (protected by RLS)

### What's NOT Safe:
- ❌ Service role keys (never needed for frontend)
- ❌ Database passwords
- ❌ Private API keys

**Note:** Vercel environment variables are secure and not exposed in your build output. Only `VITE_*` prefixed variables are bundled into the frontend code.

## 🎬 Custom Domain (Optional)

### Add Your Own Domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Enter your domain: `truecrimestudio.com`
3. Follow DNS setup instructions
4. Vercel automatically provisions SSL certificate

## 📊 Monitoring & Analytics

### Vercel Dashboard Shows:
- Deployment status
- Build logs
- Runtime logs
- Performance metrics
- Visitor analytics

### To Check Logs:

**Via Dashboard:**
1. Vercel Dashboard → Your Project → Deployments
2. Click on a deployment → View build/runtime logs

**Via CLI:**
```bash
vercel logs
```

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. All dependencies in `package.json`
2. No TypeScript errors: `npm run build` locally
3. Environment variables are set in Vercel
4. Build logs in Vercel dashboard

**Fix:**
```bash
# Test build locally first
npm run build

# If it works locally, it'll work on Vercel
```

### "Missing Supabase environment variables"

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Redeploy: Deployments → (3 dots) → Redeploy

### App loads but API calls fail

**Check:**
1. Are Edge Functions deployed? `supabase functions list`
2. Is the database table created? Check Supabase Dashboard
3. Are CORS headers correct? Check browser console
4. Is the Supabase URL correct in env vars?

### 404 on Refresh

This is already handled by `vercel.json` rewrites. If you still see it:
1. Ensure `vercel.json` exists
2. Check it has the rewrites configuration
3. Redeploy

## 🔄 Development Workflow

### Local Development:
```bash
npm run dev
```

### Test Production Build:
```bash
npm run build
npm run preview
```

### Deploy Preview:
```bash
vercel
# Gets a preview URL
```

### Deploy to Production:
```bash
git push origin main
# Auto-deploys via GitHub integration

# OR

vercel --prod
```

## 📱 Mobile Optimization

Your app is already mobile-responsive with:
- Tailwind CSS responsive design
- Mobile-friendly UI components
- Touch-optimized interactions

Test on mobile:
1. Deploy to Vercel
2. Open on phone
3. All features work on mobile browsers!

## 🚀 Performance Optimization

Vercel automatically provides:
- ✅ Brotli/Gzip compression
- ✅ Image optimization
- ✅ Code splitting
- ✅ Edge caching
- ✅ Global CDN

**Your app loads fast worldwide!**

## 🎉 You're Done!

### Quick Checklist:

- [ ] Supabase Edge Functions deployed
- [ ] Database table created
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] App is live and working!

### Next Steps:

1. **Share your app** - Send the Vercel URL to teammates
2. **Set up custom domain** (optional)
3. **Enable Shotstack** for production rendering (optional)
4. **Start creating videos!** 🎬

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Deployment Issues:** Check build logs in Vercel Dashboard
- **App Issues:** Check browser console + Supabase logs
- **Supabase Issues:** See `DEPLOYMENT_GUIDE.md`

---

**Your app is now live! Open it in a browser and start creating true crime videos! 🎉**
