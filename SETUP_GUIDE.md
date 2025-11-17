# TrueCrime Clay Studio - Setup Guide

Complete guide to set up and deploy your YouTube video claymation creator app.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Production API Keys](#production-api-keys)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier works)
- **Git** installed
- Optional: Production API keys for full functionality

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd truecrime-videos-automate

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

---

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project creation (2-3 minutes)

### 2. Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
3. Paste into `.env` file

### 3. Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended for beginners)**

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy contents of `supabase/migrations/20250116_create_render_jobs.sql`
4. Paste and click "Run"
5. Verify table created in **Table Editor**

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Deploy Edge Functions

**Using Supabase CLI:**

```bash
# Deploy all functions
supabase functions deploy research-case
supabase functions deploy generate-script
supabase functions deploy generate-storyboard
supabase functions deploy generate-voiceover
supabase functions deploy render-video
supabase functions deploy check-render-status
```

**Set environment secrets for edge functions:**

```bash
# If using production APIs
supabase secrets set OPENAI_API_KEY=your_key_here
supabase secrets set ELEVENLABS_API_KEY=your_key_here
supabase secrets set SHOTSTACK_API_KEY=your_key_here
supabase secrets set PERPLEXITY_API_KEY=your_key_here
```

---

## Production API Keys

The app works with **mock data** by default. For production features, add these API keys:

### Essential APIs (Choose one from each category)

#### 1. Research API (Choose One)
- **Perplexity AI** (Recommended) - https://www.perplexity.ai/settings/api
  ```env
  PERPLEXITY_API_KEY=your_key
  ```
- **Tavily** - https://tavily.com
- **Brave Search** - https://brave.com/search/api/

#### 2. AI Script Generation (Choose One)
- **OpenAI** (Recommended) - https://platform.openai.com/api-keys
  ```env
  OPENAI_API_KEY=your_key
  ```
- **Anthropic Claude** - https://console.anthropic.com/

#### 3. Text-to-Speech (Choose One)
- **ElevenLabs** (Best quality) - https://elevenlabs.io/api
  ```env
  ELEVENLABS_API_KEY=your_key
  ```
- **Google Cloud TTS** - https://cloud.google.com/text-to-speech
- **Amazon Polly** - https://aws.amazon.com/polly/

#### 4. Video Rendering (Optional but recommended)
- **Shotstack** - https://shotstack.io
  ```env
  SHOTSTACK_API_KEY=your_key
  ```

#### 5. Image Generation (Optional - for storyboard previews)
- **OpenAI DALL-E** (uses OPENAI_API_KEY above)
- **Stability AI** - https://platform.stability.ai/
- **Replicate** - https://replicate.com

### Cost Estimates (as of 2025)

| Service | Free Tier | Typical Cost/Video |
|---------|-----------|-------------------|
| Perplexity | Limited | $0.20-0.50 |
| OpenAI GPT-4 | $5 credit | $0.10-0.30 |
| ElevenLabs | 10k chars/mo | $0.30-0.50 |
| Shotstack | 20 renders/mo | $1.00-3.00 |
| **Total** | **Works for testing** | **~$2-5 per video** |

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Vite

3. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add all your `.env` variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - (Optional) Asset URLs and API keys

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

### Deploy to Your Own Server

```bash
# Build for production
npm run build

# The dist/ folder contains your static site
# Upload to any static hosting (Apache, Nginx, etc.)
```

---

## Troubleshooting

### Common Issues

#### "Supabase client error"
- ✅ Check `.env` has correct `VITE_` prefixes
- ✅ Verify Supabase project is active
- ✅ Confirm API keys are correct

#### "Edge function not found"
- ✅ Deploy edge functions using Supabase CLI
- ✅ Check function names match code references
- ✅ Verify Supabase project has functions enabled

#### "Research/Script generation not working"
- ✅ This is expected without production API keys
- ✅ App uses mock data by default
- ✅ Add API keys to enable real features

#### "Auto-save not working"
- ✅ Check browser localStorage is enabled
- ✅ Try different browser
- ✅ Clear browser cache and reload

#### Build fails with TypeScript errors
```bash
# Check TypeScript version
npm list typescript

# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

- 📚 Check `supabase/migrations/README.md` for database help
- 🐛 Open GitHub issue with error details
- 💬 Join our Discord community (if available)

---

## Next Steps

1. ✅ **Test locally** - Create a test project, generate research
2. ✅ **Add API keys** - Enable production features
3. ✅ **Deploy** - Push to Vercel or your preferred host
4. ✅ **Monitor** - Check Supabase logs for edge function errors
5. ✅ **Optimize** - Add your own assets and branding

---

## Security Notes

- ⚠️ Never commit `.env` file to Git (already in `.gitignore`)
- ⚠️ Use environment variables for all API keys
- ⚠️ Rotate keys if accidentally exposed
- ⚠️ Use Supabase RLS policies for production data

---

**Ready to create viral true crime content? Let's go! 🎬**
