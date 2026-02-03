-- ============================================
-- VIDEOS STORAGE BUCKET
-- For short content videos, background clips, product videos
-- ============================================

-- Create videos bucket with 100MB limit per file
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB per file
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from videos" ON storage.objects;

-- Public read access
CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow uploads
CREATE POLICY "Allow all uploads to videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Allow updates
CREATE POLICY "Allow all updates to videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

-- Allow deletes
CREATE POLICY "Allow all deletes from videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');
