-- Create render_jobs table for video rendering queue and status tracking

CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  scenes JSONB NOT NULL,
  audio_url TEXT,
  resolution TEXT NOT NULL DEFAULT '1080p' CHECK (resolution IN ('1080p', '4k')),
  fps INTEGER NOT NULL DEFAULT 30 CHECK (fps IN (30, 60)),
  total_duration NUMERIC NOT NULL,
  video_url TEXT,
  external_render_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_render_jobs_updated_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication strategy)
-- For now, allow all operations for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON render_jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON render_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON render_jobs
  FOR UPDATE
  TO authenticated
  USING (true);

-- For anonymous users (if needed during development)
CREATE POLICY "Enable read access for anonymous users" ON render_jobs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for anonymous users" ON render_jobs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users" ON render_jobs
  FOR UPDATE
  TO anon
  USING (true);
