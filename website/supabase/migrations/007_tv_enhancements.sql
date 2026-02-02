-- ============================================
-- ATOMIC TAWK - TV/VIDEO ENHANCEMENTS
-- ============================================

-- Add duration field for videos (stored in seconds)
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Add is_live flag for live streams
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- Add sort_order for manual ordering of featured content
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add index for video content queries
CREATE INDEX IF NOT EXISTS idx_content_type_status 
ON public.content(content_type, status);

CREATE INDEX IF NOT EXISTS idx_content_featured_published 
ON public.content(is_featured, published_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_content_live 
ON public.content(is_live) 
WHERE is_live = true;

-- Function to format duration (seconds to HH:MM:SS or MM:SS)
CREATE OR REPLACE FUNCTION format_video_duration(seconds INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF seconds IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF seconds >= 3600 THEN
    RETURN 
      LPAD((seconds / 3600)::TEXT, 2, '0') || ':' ||
      LPAD(((seconds % 3600) / 60)::TEXT, 2, '0') || ':' ||
      LPAD((seconds % 60)::TEXT, 2, '0');
  ELSE
    RETURN 
      LPAD((seconds / 60)::TEXT, 2, '0') || ':' ||
      LPAD((seconds % 60)::TEXT, 2, '0');
  END IF;
END;
$$;

-- RPC to get videos for TV page (only content with video_url)
CREATE OR REPLACE FUNCTION get_tv_videos(
  p_category_slug TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_featured_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration INTEGER,
  duration_formatted TEXT,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  is_featured BOOLEAN,
  is_live BOOLEAN,
  view_count INTEGER,
  comment_count INTEGER,
  published_at TIMESTAMPTZ,
  tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.slug,
    c.description,
    c.thumbnail_url,
    c.video_url,
    c.duration,
    format_video_duration(c.duration) as duration_formatted,
    c.category_id,
    cat.name as category_name,
    cat.slug as category_slug,
    c.is_featured,
    c.is_live,
    c.view_count,
    c.comment_count,
    c.published_at,
    c.tags
  FROM public.content c
  LEFT JOIN public.categories cat ON c.category_id = cat.id
  WHERE c.status = 'published'
    AND c.content_type IN ('video', 'broadcast')
    AND c.video_url IS NOT NULL 
    AND c.video_url != ''
    AND (p_category_slug IS NULL OR cat.slug = p_category_slug)
    AND (NOT p_featured_only OR c.is_featured = true)
  ORDER BY 
    c.is_live DESC,
    c.is_featured DESC, 
    c.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- RPC to get featured/live video for TV hero (only content with video_url)
CREATE OR REPLACE FUNCTION get_tv_featured()
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration INTEGER,
  duration_formatted TEXT,
  category_name TEXT,
  category_slug TEXT,
  is_live BOOLEAN,
  view_count INTEGER,
  published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.slug,
    c.description,
    c.thumbnail_url,
    c.video_url,
    c.duration,
    format_video_duration(c.duration) as duration_formatted,
    cat.name as category_name,
    cat.slug as category_slug,
    c.is_live,
    c.view_count,
    c.published_at
  FROM public.content c
  LEFT JOIN public.categories cat ON c.category_id = cat.id
  WHERE c.status = 'published'
    AND c.content_type IN ('video', 'broadcast')
    AND c.video_url IS NOT NULL 
    AND c.video_url != ''
  ORDER BY 
    c.is_live DESC,
    c.is_featured DESC, 
    c.published_at DESC
  LIMIT 1;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION format_video_duration(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tv_videos(TEXT, INTEGER, INTEGER, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tv_featured() TO anon, authenticated;

-- Comment for documentation
COMMENT ON COLUMN public.content.duration IS 'Video duration in seconds';
COMMENT ON COLUMN public.content.is_live IS 'Whether this is a live stream currently active';
COMMENT ON COLUMN public.content.sort_order IS 'Manual sort order for featured content';
