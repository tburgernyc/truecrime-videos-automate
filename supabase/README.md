# Supabase Edge Functions Setup

This directory contains the Supabase Edge Functions and database migrations for the True Crime Video Automation project.

## Prerequisites

1. **Supabase CLI** - Install globally:
   ```bash
   npm install -g supabase
   ```

2. **Supabase Account** - You already have a project at:
   - Project URL: `https://tcwmbwkvflnranchrhyr.supabase.co`
   - Project Ref: `tcwmbwkvflnranchrhyr`

## Project Structure

```
supabase/
├── functions/
│   ├── render-video/
│   │   └── index.ts          # Initiates video rendering
│   ├── check-render-status/
│   │   └── index.ts          # Checks render progress
├── migrations/
│   └── 20250116000000_create_render_jobs.sql  # Database schema
├── config.toml                # Supabase configuration
└── README.md                  # This file
```

## Setup Instructions

### Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window for authentication.

### Step 2: Link Your Project

```bash
cd /mnt/c/Users/theburgerllc/Downloads/truecrime-videos-automate
supabase link --project-ref tcwmbwkvflnranchrhyr
```

### Step 3: Apply Database Migrations

Create the `render_jobs` table:

```bash
supabase db push
```

Or manually run the migration in your Supabase dashboard:
1. Go to https://supabase.com/dashboard/project/tcwmbwkvflnranchrhyr/editor
2. Open SQL Editor
3. Copy and paste the contents of `migrations/20250116000000_create_render_jobs.sql`
4. Click "Run"

### Step 4: Deploy Edge Functions

Deploy both functions:

```bash
# Deploy render-video function
supabase functions deploy render-video

# Deploy check-render-status function
supabase functions deploy check-render-status
```

### Step 5: Set Environment Variables (Optional)

If you want to use **Shotstack** for actual video rendering:

1. Sign up at https://shotstack.io
2. Get your API key
3. Set it as a secret:

```bash
supabase secrets set SHOTSTACK_API_KEY=your_shotstack_api_key_here
```

**Note:** Without Shotstack, the functions will use a mock/simulation mode for development.

## Edge Functions Overview

### 1. render-video

**Purpose:** Initiates video rendering from scenes and audio

**Input:**
```json
{
  "scenes": [
    {
      "id": "scene-1",
      "imageUrl": "https://...",
      "duration": 5.0,
      "transition": "fade",
      "order": 1
    }
  ],
  "audioUrl": "https://...",
  "settings": {
    "resolution": "1080p",
    "fps": 30
  }
}
```

**Output:**
```json
{
  "status": "processing",
  "renderId": "uuid-here",
  "message": "Video rendering started"
}
```

### 2. check-render-status

**Purpose:** Checks the status of a render job

**Input:**
```json
{
  "renderId": "uuid-here"
}
```

**Output:**
```json
{
  "status": "done",
  "progress": 100,
  "videoUrl": "https://...",
  "renderId": "uuid-here"
}
```

**Status Values:**
- `processing` - Render is in progress
- `done` - Render completed successfully
- `failed` - Render failed

## Testing Functions Locally

### Start Supabase locally:

```bash
supabase start
```

### Test render-video:

```bash
curl -X POST http://localhost:54321/functions/v1/render-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "scenes": [
      {
        "id": "scene-1",
        "imageUrl": "https://via.placeholder.com/1920x1080",
        "duration": 5.0,
        "transition": "fade",
        "order": 1
      }
    ],
    "audioUrl": null,
    "settings": {
      "resolution": "1080p",
      "fps": 30
    }
  }'
```

### Test check-render-status:

```bash
curl -X POST http://localhost:54321/functions/v1/check-render-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "renderId": "your-render-id-here"
  }'
```

## Database Schema

The `render_jobs` table stores all rendering jobs:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| status | TEXT | processing, done, failed |
| progress | INTEGER | 0-100 |
| scenes | JSONB | Scene data |
| audio_url | TEXT | Audio file URL |
| resolution | TEXT | 1080p or 4k |
| fps | INTEGER | Frame rate |
| total_duration | NUMERIC | Total video duration |
| video_url | TEXT | Final video URL (when done) |
| external_render_id | TEXT | Third-party service render ID |
| created_at | TIMESTAMP | When created |
| completed_at | TIMESTAMP | When completed |
| error_message | TEXT | Error details if failed |
| user_id | UUID | User who created the job |

## Video Rendering Options

### Option 1: Mock/Simulation (Default)

The functions include a mock rendering mode for development. It simulates a 10-second render and returns a placeholder video URL.

**Good for:** Testing, development, understanding the flow

### Option 2: Shotstack API (Recommended)

[Shotstack](https://shotstack.io) is a cloud-based video rendering API.

**Pricing:** Free tier available, then pay-as-you-go

**Setup:**
1. Sign up at https://shotstack.io
2. Get API key from dashboard
3. Set secret: `supabase secrets set SHOTSTACK_API_KEY=your_key`
4. Redeploy functions

**Good for:** Production use, high-quality rendering

### Option 3: Custom Implementation

You can implement your own video rendering logic:

1. Use FFmpeg in a containerized environment
2. Use AWS MediaConvert, Google Cloud Video Intelligence, etc.
3. Use Remotion Lambda
4. Build a custom rendering service

Modify the `render-video/index.ts` function to integrate with your chosen solution.

## Troubleshooting

### Functions not deploying

```bash
# Check you're logged in
supabase status

# Re-link project
supabase link --project-ref tcwmbwkvflnranchrhyr
```

### CORS errors

The functions include CORS headers. If you still see errors:
1. Check your project's CORS settings in Supabase Dashboard
2. Ensure you're sending the `Authorization` header

### Database errors

```bash
# Check migrations status
supabase db diff

# Reset local database (WARNING: destroys data)
supabase db reset
```

## Next Steps

1. **Test the functions** - Use the app to create a video and monitor the render job
2. **Add storage** - Set up Supabase Storage for uploading audio/images
3. **Implement webhooks** - Get notified when renders complete
4. **Add authentication** - Require users to be logged in
5. **Monitor usage** - Track rendering costs and usage

## Support

- Supabase Docs: https://supabase.com/docs
- Shotstack Docs: https://shotstack.io/docs
- Edge Functions Guide: https://supabase.com/docs/guides/functions
