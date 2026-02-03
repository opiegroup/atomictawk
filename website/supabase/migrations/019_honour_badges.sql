-- ============================================
-- ATOMIC TAWK HONOUR BADGE SYSTEM
-- Man Cave Culture Recognition
-- ============================================

-- ============================================
-- 1. BADGES TABLE - Badge Definitions
-- ============================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary', 'special')),
  category TEXT CHECK (category IN ('rank', 'special', 'achievement')),
  -- Award criteria
  auto_award BOOLEAN DEFAULT false, -- Can be automatically awarded
  criteria_type TEXT, -- 'comment_count', 'post_count', 'first_comment', 'admin_awarded', etc.
  criteria_value INT, -- Threshold for auto-award (e.g., 10 comments)
  -- Display
  color TEXT DEFAULT '#CCAA4C', -- Badge accent color
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. USER BADGES TABLE - Awarded Badges
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  awarded_by UUID REFERENCES auth.users(id), -- NULL for auto-awarded
  reason TEXT, -- Custom reason for special badges
  is_featured BOOLEAN DEFAULT false, -- User can feature one badge
  UNIQUE(user_id, badge_id) -- Each badge can only be awarded once per user
);

-- ============================================
-- 3. SEED BADGE DEFINITIONS
-- ============================================

-- RANK BADGES (Auto-awarded based on activity)
INSERT INTO public.badges (slug, name, description, icon, tier, category, auto_award, criteria_type, criteria_value, color, sort_order) VALUES
  ('bench-warmer', 'Bench Warmer', 'Issued to recruits who''ve entered the cave and spoken their first words. Status: Observing. Learning. Warming up.', '🥉', 'bronze', 'rank', true, 'comment_count', 1, '#CD7F32', 10),
  ('tool-handler', 'Tool Handler', 'Recognised for basic contribution and community participation. Status: Trusted with sharp objects.', '🛠️', 'bronze', 'rank', true, 'comment_count', 10, '#CD7F32', 20),
  ('workshop-regular', 'Workshop Regular', 'A known voice in the cave. Status: Pulls up a stool without asking.', '⚙️', 'silver', 'rank', true, 'comment_count', 25, '#C0C0C0', 30),
  ('master-tinkerer', 'Master Tinkerer', 'Recognised for thoughtful advice, humour, or solid input. Status: Consulted before things get built.', '🔥', 'gold', 'rank', true, 'comment_count', 50, '#FFD700', 40),
  ('chief-engineer', 'Chief Engineer', 'Awarded to those shaping the culture and conversation. Status: Ideas carry weight.', '🧠', 'platinum', 'rank', true, 'comment_count', 100, '#E5E4E2', 50),
  ('atomic-legend', 'Atomic Legend', 'Rare honour for members who define the tone and spirit of Atomic Tawk. Status: Stories told about them.', '🏆', 'legendary', 'rank', false, 'admin_awarded', NULL, '#CCAA4C', 60)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  tier = EXCLUDED.tier,
  criteria_type = EXCLUDED.criteria_type,
  criteria_value = EXCLUDED.criteria_value;

-- SPECIAL BADGES (Admin awarded or special criteria)
INSERT INTO public.badges (slug, name, description, icon, tier, category, auto_award, criteria_type, criteria_value, color, sort_order) VALUES
  ('cold-fridge-medal', 'Cold Fridge Medal', 'Awarded for helpful advice that saves time, money, or skin.', '🍺', 'special', 'special', false, 'admin_awarded', NULL, '#4A90D9', 100),
  ('built-not-bought', 'Built Not Bought', 'Awarded for sharing DIY projects, builds, or restorations.', '🧱', 'special', 'special', false, 'admin_awarded', NULL, '#8B4513', 110),
  ('loud-opinion-ribbon', 'Loud Opinion Ribbon', 'Awarded for legendary comments that spark debate or laughs.', '🔊', 'special', 'special', false, 'admin_awarded', NULL, '#FF6B35', 120),
  ('grease-under-nails', 'Grease Under the Nails', 'Awarded for hands-on mechanical or workshop knowledge.', '🛢️', 'special', 'special', false, 'admin_awarded', NULL, '#333333', 130),
  ('big-idea-division', 'Big Idea Division', 'Awarded for creative concepts, wild builds, or visionary suggestions.', '🧨', 'special', 'special', false, 'admin_awarded', NULL, '#9B59B6', 140),
  ('first-responder', 'First Responder', 'Awarded for first useful reply on a new post or article.', '🏁', 'special', 'achievement', true, 'first_reply', NULL, '#27AE60', 150)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  tier = EXCLUDED.tier,
  criteria_type = EXCLUDED.criteria_type;

-- ============================================
-- 4. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_tier ON public.badges(tier);

-- ============================================
-- 5. RLS POLICIES
-- ============================================

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Anyone can view badges
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (is_active = true);

-- Anyone can view user badges
CREATE POLICY "Anyone can view user badges"
ON public.user_badges FOR SELECT
USING (true);

-- Only admins can manage badges
CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('god', 'admin')));

-- Admins can award badges, users can update their own featured badge
CREATE POLICY "Admins can award badges"
ON public.user_badges FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('god', 'admin')));

CREATE POLICY "Users can update own featured badge"
ON public.user_badges FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Get user's total comment count across all tables
CREATE OR REPLACE FUNCTION public.get_user_total_comments(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT 
    COALESCE((SELECT COUNT(*) FROM public.community_comments WHERE user_id = p_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM public.content_comments WHERE user_id = p_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM public.community_post_comments WHERE user_id = p_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM public.gallery_comments WHERE user_id = p_user_id), 0)
  INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Check and award badges for a user
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_slug TEXT, badge_name TEXT, newly_awarded BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_count INT;
  v_badge RECORD;
BEGIN
  -- Get user's comment count
  v_comment_count := get_user_total_comments(p_user_id);
  
  -- Check each auto-award badge
  FOR v_badge IN 
    SELECT b.* FROM badges b 
    WHERE b.auto_award = true 
      AND b.is_active = true 
      AND b.criteria_type = 'comment_count'
    ORDER BY b.criteria_value ASC
  LOOP
    -- Check if user qualifies and doesn't already have badge
    IF v_comment_count >= v_badge.criteria_value THEN
      -- Try to insert (will fail silently if already exists due to UNIQUE constraint)
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      -- Return badge info
      badge_slug := v_badge.slug;
      badge_name := v_badge.name;
      newly_awarded := (SELECT COUNT(*) = 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id AND awarded_at > NOW() - INTERVAL '5 seconds');
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

-- Get user's badges with badge details
CREATE OR REPLACE FUNCTION public.get_user_badges(p_user_id UUID)
RETURNS TABLE(
  badge_id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  icon TEXT,
  tier TEXT,
  category TEXT,
  color TEXT,
  awarded_at TIMESTAMPTZ,
  is_featured BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as badge_id,
    b.slug,
    b.name,
    b.description,
    b.icon,
    b.tier,
    b.category,
    b.color,
    ub.awarded_at,
    ub.is_featured,
    ub.reason
  FROM user_badges ub
  JOIN badges b ON b.id = ub.badge_id
  WHERE ub.user_id = p_user_id
  ORDER BY b.sort_order ASC, ub.awarded_at DESC;
END;
$$;

-- Award a badge to a user (admin function)
CREATE OR REPLACE FUNCTION public.award_badge(p_user_id UUID, p_badge_slug TEXT, p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_id UUID;
  v_badge_name TEXT;
BEGIN
  -- Check admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('god', 'admin')) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Get badge
  SELECT id, name INTO v_badge_id, v_badge_name
  FROM badges WHERE slug = p_badge_slug AND is_active = true;
  
  IF v_badge_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Badge not found');
  END IF;
  
  -- Award badge
  INSERT INTO user_badges (user_id, badge_id, awarded_by, reason)
  VALUES (p_user_id, v_badge_id, auth.uid(), p_reason)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'badge_name', v_badge_name);
END;
$$;

-- Get leaderboard (users with most badges)
CREATE OR REPLACE FUNCTION public.get_badge_leaderboard(p_limit INT DEFAULT 20)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  badge_count BIGINT,
  highest_tier TEXT,
  badges JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.display_name,
    p.avatar_url,
    COUNT(DISTINCT ub.badge_id) as badge_count,
    (
      SELECT b.tier FROM user_badges ub2 
      JOIN badges b ON b.id = ub2.badge_id 
      WHERE ub2.user_id = p.id 
      ORDER BY b.sort_order DESC 
      LIMIT 1
    ) as highest_tier,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'icon', b.icon,
        'name', b.name,
        'tier', b.tier
      ) ORDER BY b.sort_order)
      FROM user_badges ub3
      JOIN badges b ON b.id = ub3.badge_id
      WHERE ub3.user_id = p.id
    ) as badges
  FROM profiles p
  JOIN user_badges ub ON ub.user_id = p.id
  WHERE p.status = 'active'
  GROUP BY p.id, p.display_name, p.avatar_url
  ORDER BY badge_count DESC, highest_tier DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- 7. TRIGGER TO AUTO-CHECK BADGES ON COMMENT
-- ============================================

CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check and award any earned badges
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Add triggers to all comment tables
DROP TRIGGER IF EXISTS check_badges_on_content_comment ON public.content_comments;
CREATE TRIGGER check_badges_on_content_comment
  AFTER INSERT ON public.content_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges_on_comment();

DROP TRIGGER IF EXISTS check_badges_on_community_comment ON public.community_comments;
CREATE TRIGGER check_badges_on_community_comment
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges_on_comment();

DROP TRIGGER IF EXISTS check_badges_on_post_comment ON public.community_post_comments;
CREATE TRIGGER check_badges_on_post_comment
  AFTER INSERT ON public.community_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges_on_comment();

DROP TRIGGER IF EXISTS check_badges_on_gallery_comment ON public.gallery_comments;
CREATE TRIGGER check_badges_on_gallery_comment
  AFTER INSERT ON public.gallery_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges_on_comment();

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.badges TO anon, authenticated;
GRANT SELECT ON public.user_badges TO anon, authenticated;
GRANT INSERT, UPDATE ON public.user_badges TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_total_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_badges(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_badge(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_badge_leaderboard(INT) TO anon, authenticated;
