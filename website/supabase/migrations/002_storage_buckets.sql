-- ============================================
-- ATOMIC TAWK - STORAGE BUCKETS & POLICIES
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('community', 'community', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('media_library', 'media_library', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AVATARS BUCKET POLICIES (Public bucket)
-- ============================================

-- Anyone can view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- COMMUNITY BUCKET POLICIES (Private bucket)
-- ============================================

-- Users can upload to their own folder: community/USER_ID/*
CREATE POLICY "Users can upload to own community folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own uploads
CREATE POLICY "Users can view own community uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'community' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own community uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin/God can view all community uploads
CREATE POLICY "Admin can view all community uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'community' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
);

-- Admin/God can delete any community upload
CREATE POLICY "Admin can delete community uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
);

-- ============================================
-- MEDIA_LIBRARY BUCKET POLICIES (Admin only uploads)
-- ============================================

-- Public can view media library (for site content)
CREATE POLICY "Public can view media library"
ON storage.objects FOR SELECT
USING (bucket_id = 'media_library');

-- Only admin/god can upload to media library
CREATE POLICY "Admin can upload to media library"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media_library' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
);

-- Only admin/god can update media library
CREATE POLICY "Admin can update media library"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media_library' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
);

-- Only admin/god can delete from media library
CREATE POLICY "Admin can delete from media library"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media_library' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
);
