# Database Migrations

This directory contains SQL migration files for the TrueCrime Clay Studio database.

## Applying Migrations

### Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Apply migrations:
```bash
supabase db push
```

### Manual Application

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Copy and paste the contents of each migration file in order
4. Execute each migration

## Migration Files

- `20250116_create_render_jobs.sql` - Creates the render_jobs table for video rendering queue

## Tables

### render_jobs

Stores video rendering jobs and their status.

**Columns:**
- `id` - UUID primary key
- `status` - Current status (pending, processing, completed, failed)
- `progress` - Render progress percentage (0-100)
- `scenes` - JSONB array of scene data
- `audio_url` - URL to audio file
- `resolution` - Output resolution (1080p or 4k)
- `fps` - Frame rate (30 or 60)
- `total_duration` - Total video duration in seconds
- `video_url` - URL to completed video (when status = completed)
- `external_render_id` - ID from external rendering service (e.g., Shotstack)
- `error_message` - Error details if status = failed
- `created_at` - Job creation timestamp
- `updated_at` - Last update timestamp
- `completed_at` - Completion timestamp

**Indexes:**
- `idx_render_jobs_status` - Fast status queries
- `idx_render_jobs_created_at` - Fast date-based queries

**Security:**
- Row Level Security (RLS) enabled
- Policies allow authenticated and anonymous access (adjust for production)
