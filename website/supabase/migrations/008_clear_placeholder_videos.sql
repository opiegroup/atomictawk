-- ============================================
-- Clear placeholder video URLs from seed content
-- ============================================
-- The seed content has fake YouTube URLs like 'example1', 'example2', etc.
-- These should be NULL so they don't appear on the TV page.
-- Real videos should be added through the admin panel with actual YouTube URLs.

-- Clear video_url where it contains 'example' (placeholder URLs)
UPDATE public.content 
SET video_url = NULL 
WHERE video_url LIKE '%example%';

-- Also clear any obviously fake/test video URLs
UPDATE public.content 
SET video_url = NULL 
WHERE video_url LIKE '%test%'
   OR video_url LIKE '%placeholder%'
   OR video_url LIKE '%sample%';
