-- Create render_jobs table
CREATE TABLE IF NOT EXISTS public.render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'processing',
    progress INTEGER DEFAULT 0,
    scenes JSONB NOT NULL,
    audio_url TEXT,
    resolution TEXT NOT NULL,
    fps INTEGER NOT NULL,
    total_duration NUMERIC NOT NULL,
    video_url TEXT,
    external_render_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON public.render_jobs(status);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_render_jobs_created_at ON public.render_jobs(created_at DESC);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_render_jobs_user_id ON public.render_jobs(user_id);

-- Enable Row Level Security
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own render jobs
CREATE POLICY "Users can view their own render jobs"
    ON public.render_jobs
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy: Users can insert their own render jobs
CREATE POLICY "Users can insert render jobs"
    ON public.render_jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy: Users can update their own render jobs
CREATE POLICY "Users can update their own render jobs"
    ON public.render_jobs
    FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Grant permissions
GRANT ALL ON public.render_jobs TO authenticated;
GRANT ALL ON public.render_jobs TO anon;
GRANT ALL ON public.render_jobs TO service_role;

-- Add comment to table
COMMENT ON TABLE public.render_jobs IS 'Stores video rendering job information and status';
