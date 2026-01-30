-- ============================================
-- ATOMIC TAWK - CONTENT & COMMENTS SYSTEM
-- ============================================

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT DEFAULT '#CCAA4C',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can view visible categories
CREATE POLICY "Public can view categories"
ON public.categories FOR SELECT
USING (is_visible = true);

-- Admin can manage categories
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can manage categories"
      ON public.categories FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

-- Seed default categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Burnouts & Cars', 'burnouts', 'High-octane automotive content', '🚗', 1),
  ('The Shed', 'shed', 'DIY projects and workshop builds', '🔧', 2),
  ('Gaming', 'gaming', 'Gaming sessions and walkthroughs', '🎮', 3),
  ('Bloke Science', 'science', 'Mechanical science and engineering', '🔬', 4),
  ('Broadcasts', 'broadcasts', 'Live shows and podcasts', '📻', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CONTENT TABLE (Broadcasts/Articles)
-- ============================================

CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  description TEXT,
  -- Content
  body TEXT, -- HTML from rich text editor
  -- OR use page builder
  layout JSONB, -- page builder layout (alternative to body)
  use_page_builder BOOLEAN DEFAULT false,
  -- Media
  thumbnail_url TEXT,
  video_url TEXT,
  -- Categorization
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('video', 'article', 'broadcast', 'podcast')),
  tags TEXT[], -- array of tags
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
  scheduled_for TIMESTAMPTZ, -- for scheduled publishing
  -- Features
  is_featured BOOLEAN DEFAULT false,
  is_live BOOLEAN DEFAULT false, -- for live broadcasts
  allow_comments BOOLEAN DEFAULT true,
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  -- Stats (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  -- Author
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Public can view published content
CREATE POLICY "Public can view published content"
ON public.content FOR SELECT
USING (status = 'published' OR (status = 'scheduled' AND scheduled_for <= NOW()));

-- Admin can manage all content
DROP POLICY IF EXISTS "Admin can manage content" ON public.content;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can manage content"
      ON public.content FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(slug);
CREATE INDEX IF NOT EXISTS idx_content_published ON public.content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_featured ON public.content(is_featured) WHERE is_featured = true;

-- Trigger
DROP TRIGGER IF EXISTS update_content_updated_at ON public.content;
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTENT COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Relations
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.content_comments(id) ON DELETE CASCADE, -- for replies
  -- Comment
  body TEXT NOT NULL,
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam', 'hidden')),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_reason TEXT,
  -- Spam detection
  is_spam BOOLEAN DEFAULT false,
  spam_score FLOAT DEFAULT 0, -- 0-1, higher = more likely spam
  ip_address INET,
  user_agent TEXT,
  -- Stats
  like_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

-- Public can view approved comments
CREATE POLICY "Public can view approved comments"
ON public.content_comments FOR SELECT
USING (status = 'approved');

-- Users can create comments (must be logged in)
CREATE POLICY "Users can create comments"
ON public.content_comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can edit their own comments (within 15 minutes)
CREATE POLICY "Users can edit own recent comments"
ON public.content_comments FOR UPDATE
USING (
  auth.uid() = user_id AND 
  created_at > NOW() - INTERVAL '15 minutes'
);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.content_comments FOR DELETE
USING (auth.uid() = user_id);

-- Admin can manage all comments
DROP POLICY IF EXISTS "Admin can manage comments" ON public.content_comments;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can manage comments"
      ON public.content_comments FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_content ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.content_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.content_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.content_comments(parent_id);

-- Trigger
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.content_comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.content_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENT LIKES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.content_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- one like per user per comment
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like comments"
ON public.comment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.comment_likes FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view likes"
ON public.comment_likes FOR SELECT
USING (true);

-- ============================================
-- SPAM BLOCKLIST TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.spam_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Block type
  block_type TEXT NOT NULL CHECK (block_type IN ('ip', 'email', 'word', 'domain', 'user')),
  block_value TEXT NOT NULL,
  -- Metadata
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ, -- NULL = permanent
  -- Stats
  times_blocked INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.spam_blocklist ENABLE ROW LEVEL SECURITY;

-- Only admin can manage blocklist
DROP POLICY IF EXISTS "Admin can manage blocklist" ON public.spam_blocklist;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can manage blocklist"
      ON public.spam_blocklist FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blocklist_type ON public.spam_blocklist(block_type, block_value);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if comment is spam
CREATE OR REPLACE FUNCTION check_comment_spam(
  p_user_id UUID,
  p_body TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (is_spam BOOLEAN, spam_score FLOAT, reasons TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score FLOAT := 0;
  v_reasons TEXT[] := ARRAY[]::TEXT[];
  v_block_count INTEGER;
  v_recent_comments INTEGER;
BEGIN
  -- Check IP blocklist
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO v_block_count
    FROM public.spam_blocklist
    WHERE block_type = 'ip' 
    AND block_value = p_ip_address::TEXT
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF v_block_count > 0 THEN
      v_score := v_score + 1.0;
      v_reasons := array_append(v_reasons, 'IP blocked');
    END IF;
  END IF;
  
  -- Check for too many recent comments (rate limiting)
  SELECT COUNT(*) INTO v_recent_comments
  FROM public.content_comments
  WHERE user_id = p_user_id
  AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF v_recent_comments >= 5 THEN
    v_score := v_score + 0.5;
    v_reasons := array_append(v_reasons, 'Rate limit: too many comments');
  END IF;
  
  -- Check for blocked words
  SELECT COUNT(*) INTO v_block_count
  FROM public.spam_blocklist
  WHERE block_type = 'word'
  AND p_body ILIKE '%' || block_value || '%'
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_block_count > 0 THEN
    v_score := v_score + 0.3 * v_block_count;
    v_reasons := array_append(v_reasons, 'Contains blocked words');
  END IF;
  
  -- Check for links (potential spam)
  IF p_body ~* '(https?://|www\.)' THEN
    v_score := v_score + 0.2;
    v_reasons := array_append(v_reasons, 'Contains links');
  END IF;
  
  -- Check for ALL CAPS (shouting)
  IF length(regexp_replace(p_body, '[^A-Z]', '', 'g')) > length(p_body) * 0.5 AND length(p_body) > 20 THEN
    v_score := v_score + 0.1;
    v_reasons := array_append(v_reasons, 'Excessive caps');
  END IF;
  
  -- Cap score at 1.0
  v_score := LEAST(v_score, 1.0);
  
  RETURN QUERY SELECT v_score >= 0.7, v_score, v_reasons;
END;
$$;

-- Function to submit a comment with spam check
CREATE OR REPLACE FUNCTION submit_comment(
  p_content_id UUID,
  p_body TEXT,
  p_parent_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  comment_id UUID,
  status TEXT,
  is_spam BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_spam BOOLEAN;
  v_spam_score FLOAT;
  v_reasons TEXT[];
  v_comment_id UUID;
  v_status TEXT;
  v_content_allows_comments BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 'error'::TEXT, false, 'Must be logged in to comment'::TEXT;
    RETURN;
  END IF;
  
  -- Check if content allows comments
  SELECT allow_comments INTO v_content_allows_comments
  FROM public.content WHERE id = p_content_id;
  
  IF v_content_allows_comments IS NOT TRUE THEN
    RETURN QUERY SELECT NULL::UUID, 'error'::TEXT, false, 'Comments are disabled for this content'::TEXT;
    RETURN;
  END IF;
  
  -- Check for spam
  SELECT * INTO v_is_spam, v_spam_score, v_reasons
  FROM check_comment_spam(v_user_id, p_body, p_ip_address);
  
  -- Determine initial status
  IF v_is_spam THEN
    v_status := 'spam';
  ELSIF v_spam_score > 0.3 THEN
    v_status := 'pending'; -- needs moderation
  ELSE
    v_status := 'approved'; -- auto-approve
  END IF;
  
  -- Insert comment
  INSERT INTO public.content_comments (
    content_id, user_id, parent_id, body, status, is_spam, spam_score, ip_address, user_agent
  ) VALUES (
    p_content_id, v_user_id, p_parent_id, p_body, v_status, v_is_spam, v_spam_score, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_comment_id;
  
  -- Update comment count if approved
  IF v_status = 'approved' THEN
    UPDATE public.content SET comment_count = comment_count + 1 WHERE id = p_content_id;
  END IF;
  
  RETURN QUERY SELECT 
    v_comment_id,
    v_status,
    v_is_spam,
    CASE 
      WHEN v_status = 'spam' THEN 'Your comment was flagged as spam'
      WHEN v_status = 'pending' THEN 'Your comment is pending moderation'
      ELSE 'Comment posted successfully'
    END;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_comment_spam(UUID, TEXT, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_comment(UUID, TEXT, UUID, INET, TEXT) TO authenticated;

-- ============================================
-- CONTENT VIEWS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

-- Anyone can record a view
CREATE POLICY "Anyone can record views"
ON public.content_views FOR INSERT
WITH CHECK (true);

-- Only admin can view analytics
DROP POLICY IF EXISTS "Admin can view analytics" ON public.content_views;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can view analytics"
      ON public.content_views FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_views_content ON public.content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_views_time ON public.content_views(viewed_at);

-- Function to record a view (with deduplication)
CREATE OR REPLACE FUNCTION record_content_view(
  p_content_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_recent_view BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  -- Check for recent view from same user/IP (within 30 minutes)
  SELECT EXISTS(
    SELECT 1 FROM public.content_views
    WHERE content_id = p_content_id
    AND (
      (user_id IS NOT NULL AND user_id = v_user_id) OR
      (ip_address IS NOT NULL AND ip_address = p_ip_address)
    )
    AND viewed_at > NOW() - INTERVAL '30 minutes'
  ) INTO v_recent_view;
  
  IF NOT v_recent_view THEN
    -- Record view
    INSERT INTO public.content_views (content_id, user_id, ip_address, user_agent)
    VALUES (p_content_id, v_user_id, p_ip_address, p_user_agent);
    
    -- Update view count
    UPDATE public.content SET view_count = view_count + 1 WHERE id = p_content_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION record_content_view(UUID, INET, TEXT) TO authenticated, anon;
