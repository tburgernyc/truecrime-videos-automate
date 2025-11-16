# True Crime Video Automation - Deployment Guide

Complete setup guide for getting your application running with Supabase.

## ✅ What's Already Done

- ✅ `.env` file created with your Supabase credentials
- ✅ `src/lib/supabase.ts` configured to use environment variables
- ✅ Edge Functions created (`render-video`, `check-render-status`)
- ✅ Database schema created (`render_jobs` table)
- ✅ `.gitignore` updated to protect sensitive data

## 🚀 Quick Start (5 Minutes)

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser for authentication.

### 3. Deploy Everything

Run the automated deployment script:

```bash
chmod +x supabase/deploy.sh
./supabase/deploy.sh
```

**Or deploy manually:**

```bash
# Link your project
supabase link --project-ref tcwmbwkvflnranchrhyr

# Apply database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy render-video --no-verify-jwt
supabase functions deploy check-render-status --no-verify-jwt
```

### 4. Start Your App

```bash
npm install
npm run dev
```

Your app should now be running at `http://localhost:8080`

## 🎬 Video Rendering Modes

The app supports two rendering modes:

### Development Mode (Default)

**What it does:** Simulates video rendering with a 10-second delay

**Good for:** Testing the UI and workflow

**Setup:** Nothing required - works out of the box

### Production Mode (Shotstack)

**What it does:** Actually renders videos using Shotstack API

**Good for:** Real video creation

**Setup:**

1. Sign up at https://shotstack.io (free tier available)
2. Get your API key from the dashboard
3. Set it as a Supabase secret:

```bash
supabase secrets set SHOTSTACK_API_KEY=your_shotstack_api_key_here
```

4. Redeploy the functions:

```bash
supabase functions deploy render-video --no-verify-jwt
supabase functions deploy check-render-status --no-verify-jwt
```

## 📊 Database Setup

The `render_jobs` table is automatically created when you run `supabase db push`.

**To verify it was created:**

1. Go to https://supabase.com/dashboard/project/tcwmbwkvflnranchrhyr/editor
2. Look for the `render_jobs` table in the Table Editor

**Manual setup (if needed):**

1. Open SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/20250116000000_create_render_jobs.sql`
3. Paste and run

## 🔧 Environment Variables

Your `.env` file is already configured with:

```env
VITE_SUPABASE_URL=https://tcwmbwkvflnranchrhyr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Gsrt45m5y4Rdd6EPSAE-AQ_u-mf-7nq
```

**Optional variables:**

- `SHOTSTACK_API_KEY` - For production video rendering (set via `supabase secrets`)

## 🧪 Testing the Setup

### Test 1: App Connects to Supabase

1. Start the app: `npm run dev`
2. Open browser to `http://localhost:8080`
3. Check browser console for errors
4. If you see "Missing Supabase environment variables", restart the dev server

### Test 2: Edge Functions Work

Try creating a video through the app:

1. Generate a script
2. Create a storyboard
3. Generate voiceover
4. Assemble and export video
5. You should see "Video rendering started"

### Test 3: Check Render Status

1. After initiating a render, the app should poll for status
2. In development mode, it will complete after 10 seconds
3. You should see progress updates

## 📁 Project Structure

```
truecrime-videos-automate/
├── .env                        # Your environment variables (do not commit!)
├── .env.example                # Template for environment variables
├── supabase/
│   ├── functions/
│   │   ├── render-video/       # Initiates video rendering
│   │   └── check-render-status/# Checks render progress
│   ├── migrations/             # Database schema
│   ├── config.toml             # Supabase configuration
│   ├── deploy.sh               # Automated deployment script
│   └── README.md               # Detailed Supabase documentation
├── src/
│   ├── lib/
│   │   └── supabase.ts         # Supabase client configuration
│   └── components/
│       ├── VideoAssembly.tsx   # Calls render-video function
│       └── RenderProgress.tsx  # Calls check-render-status function
└── DEPLOYMENT_GUIDE.md         # This file
```

## ❓ Troubleshooting

### "Missing Supabase environment variables"

**Solution:** Restart your dev server (`npm run dev`)

Vite only loads `.env` on startup.

### "Failed to export video"

**Check:**

1. Are Edge Functions deployed? Run: `supabase functions list`
2. Is the database migration applied? Check the Supabase Dashboard
3. Check browser console for detailed error messages

### CORS Errors

The Edge Functions include CORS headers. If you still see errors:

1. Check that you're running on `http://localhost:8080` (configured port)
2. Verify the `Authorization` header is being sent
3. Check Supabase Dashboard → Project Settings → API Settings

### "Command not found: supabase"

**Solution:**

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Functions fail to deploy

**Solution:**

```bash
# Ensure you're logged in
supabase login

# Re-link project
supabase link --project-ref tcwmbwkvflnranchrhyr --password your_db_password

# Try deploying again
supabase functions deploy render-video --no-verify-jwt
```

## 🔐 Security Notes

### What's Safe to Commit

- ✅ `.env.example` (template)
- ✅ Edge Function code
- ✅ Database migrations
- ✅ Configuration files

### What's NOT Safe to Commit

- ❌ `.env` (contains your actual keys)
- ❌ Service role key (never needed for this app)
- ❌ Database passwords

**Note:** The anon/public key in `.env` is safe to expose in frontend code - it only allows operations permitted by your Row Level Security policies.

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **Shotstack Docs:** https://shotstack.io/docs/guide/getting-started/
- **Detailed Setup:** See `supabase/README.md`

## 🎯 Next Steps

1. **Test the full workflow** - Create a video from script to export
2. **Set up Shotstack** - For actual video rendering
3. **Customize rendering** - Modify `render-video/index.ts` for your needs
4. **Add authentication** - Require users to log in
5. **Monitor costs** - Track Shotstack usage and Supabase API calls

## 💡 Tips

- **Development:** Use mock mode (default) to avoid API costs
- **Production:** Set up Shotstack for real rendering
- **Testing:** Use Supabase local development (`supabase start`)
- **Monitoring:** Check Supabase Dashboard → Logs for function execution logs

## 🆘 Need Help?

1. Check the browser console for errors
2. Check Supabase Dashboard → Logs → Edge Functions
3. Read detailed docs in `supabase/README.md`
4. Check that all environment variables are set correctly

---

**You're all set!** Run `npm run dev` and start creating true crime videos! 🎬
