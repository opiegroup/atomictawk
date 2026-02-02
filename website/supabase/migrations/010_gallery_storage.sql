-- ============================================
-- ATOMIC TAWK - GALLERY STORAGE BUCKET
-- ============================================
-- Public bucket for gallery images
-- Email verification enforced in app code
-- ============================================

-- Create gallery bucket (public so images can be viewed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery', 
  'gallery', 
  true,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================
-- GALLERY BUCKET POLICIES
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can view gallery" ON storage.objects;
DROP POLICY IF EXISTS "Verified users can upload to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage gallery" ON storage.objects;

-- Anyone can view gallery images (public bucket)
CREATE POLICY "Public can view gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Authenticated users can upload to their own folder
-- Files must be in format: USER_ID/filename
-- Email verification is enforced in application code
CREATE POLICY "Users can upload to gallery"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own gallery images
CREATE POLICY "Users can update own gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own gallery images
CREATE POLICY "Users can delete own gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
