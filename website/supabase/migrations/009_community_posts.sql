-- ============================================
-- ATOMIC TAWK - COMMUNITY POSTS & GALLERY
-- ============================================

-- ============================================
-- 1. COMMUNITY POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('tip', 'advice', 'whinge')),
  title text NOT NULL,
  content text NOT NULL,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. COMMUNITY POST LIKES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- 3. COMMUNITY POST COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 4. GALLERY ITEMS TABLE (Enhanced)
-- ============================================

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('shed', 'garage', 'basement', 'workshop', 'gaming', 'bar', 'theater', 'outdoor', 'other')),
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 5. GALLERY LIKES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.gallery_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.gallery_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(gallery_id, user_id)
);

-- ============================================
-- 6. GALLERY COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.gallery_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.gallery_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 7. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON public.community_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes ON public.community_posts(like_count DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_status ON public.gallery_items(status);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON public.gallery_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_gallery_items_created ON public.gallery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_likes ON public.gallery_items(like_count DESC);

-- ============================================
-- 8. RLS POLICIES
-- ============================================

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

-- Public can read active posts
CREATE POLICY "Public can read active community posts"
  ON public.community_posts FOR SELECT
  USING (status = 'active');

-- Authenticated users can create posts
CREATE POLICY "Users can create community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (true);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- Admin can read all
CREATE POLICY "Admin can read all community posts"
  ON public.community_posts FOR SELECT
  USING (public.is_admin());

-- Similar policies for gallery
CREATE POLICY "Public can read active gallery items"
  ON public.gallery_items FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create gallery items"
  ON public.gallery_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own gallery items"
  ON public.gallery_items FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin can read all gallery items"
  ON public.gallery_items FOR SELECT
  USING (public.is_admin());

-- Likes policies
CREATE POLICY "Public can read likes"
  ON public.community_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON public.community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read gallery likes"
  ON public.gallery_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like gallery items"
  ON public.gallery_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike gallery items"
  ON public.gallery_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Public can read active post comments"
  ON public.community_post_comments FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create post comments"
  ON public.community_post_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read active gallery comments"
  ON public.gallery_comments FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create gallery comments"
  ON public.gallery_comments FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 9. FUNCTIONS
-- ============================================

-- Like a community post
CREATE OR REPLACE FUNCTION public.like_community_post(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.community_post_likes (post_id, user_id)
  VALUES (p_post_id, auth.uid())
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  UPDATE public.community_posts
  SET like_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = p_post_id)
  WHERE id = p_post_id;
  
  RETURN true;
END;
$$;

-- Unlike a community post
CREATE OR REPLACE FUNCTION public.unlike_community_post(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.community_post_likes
  WHERE post_id = p_post_id AND user_id = auth.uid();
  
  UPDATE public.community_posts
  SET like_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = p_post_id)
  WHERE id = p_post_id;
  
  RETURN true;
END;
$$;

-- Like a gallery item
CREATE OR REPLACE FUNCTION public.like_gallery_item(p_gallery_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.gallery_likes (gallery_id, user_id)
  VALUES (p_gallery_id, auth.uid())
  ON CONFLICT (gallery_id, user_id) DO NOTHING;
  
  UPDATE public.gallery_items
  SET like_count = (SELECT COUNT(*) FROM public.gallery_likes WHERE gallery_id = p_gallery_id)
  WHERE id = p_gallery_id;
  
  RETURN true;
END;
$$;

-- Get community stats
CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_total_posts integer;
  v_total_users integer;
  v_tips_count integer;
  v_whinges_today integer;
BEGIN
  SELECT COUNT(*) INTO v_total_posts FROM public.community_posts WHERE status = 'active';
  SELECT COUNT(DISTINCT user_id) INTO v_total_users FROM public.community_posts WHERE user_id IS NOT NULL;
  SELECT COUNT(*) INTO v_tips_count FROM public.community_posts WHERE status = 'active' AND post_type = 'tip';
  SELECT COUNT(*) INTO v_whinges_today FROM public.community_posts 
    WHERE status = 'active' AND post_type = 'whinge' AND created_at > NOW() - INTERVAL '24 hours';

  RETURN jsonb_build_object(
    'total_posts', v_total_posts,
    'total_users', v_total_users,
    'tips_count', v_tips_count,
    'whinges_today', v_whinges_today
  );
END;
$$;

-- Get gallery stats
CREATE OR REPLACE FUNCTION public.get_gallery_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_total_items integer;
  v_total_likes integer;
  v_this_week integer;
BEGIN
  SELECT COUNT(*) INTO v_total_items FROM public.gallery_items WHERE status = 'active';
  SELECT COALESCE(SUM(like_count), 0) INTO v_total_likes FROM public.gallery_items WHERE status = 'active';
  SELECT COUNT(*) INTO v_this_week FROM public.gallery_items 
    WHERE status = 'active' AND created_at > NOW() - INTERVAL '7 days';

  RETURN jsonb_build_object(
    'total_items', v_total_items,
    'total_likes', v_total_likes,
    'this_week', v_this_week
  );
END;
$$;

-- ============================================
-- 10. GRANTS
-- ============================================

GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT INSERT, UPDATE ON public.community_posts TO authenticated;

GRANT SELECT ON public.community_post_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.community_post_likes TO authenticated;

GRANT SELECT ON public.community_post_comments TO anon, authenticated;
GRANT INSERT ON public.community_post_comments TO authenticated;

GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE ON public.gallery_items TO authenticated;

GRANT SELECT ON public.gallery_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.gallery_likes TO authenticated;

GRANT SELECT ON public.gallery_comments TO anon, authenticated;
GRANT INSERT ON public.gallery_comments TO authenticated;

GRANT EXECUTE ON FUNCTION public.like_community_post(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlike_community_post(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.like_gallery_item(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_gallery_stats() TO anon, authenticated;

-- ============================================
-- 11. SEED DATA - COMMUNITY POSTS
-- ============================================

INSERT INTO public.community_posts (author_name, post_type, title, content, like_count, comment_count, created_at) VALUES
(
  'ShedMaster69',
  'tip',
  'Best way to organize your shed tools',
  'Mate, get yourself some pegboard and outline where each tool goes with a marker. You''ll never lose your 10mm socket again... well, you still will, but at least you''ll know where it SHOULD be.',
  42,
  12,
  NOW() - INTERVAL '2 hours'
),
(
  'DeniedDave',
  'whinge',
  'Council won''t let me build a second shed',
  'Bloody council knocked back my DA for a second shed. Said one 6x4 is enough for any man. ENOUGH?! Do they not understand the sacred need for a dedicated beer fridge shed?',
  156,
  48,
  NOW() - INTERVAL '4 hours'
),
(
  'CaveDiplomacy',
  'tip',
  'How to keep the missus happy while spending weekends in the cave',
  'Pro tip: Install a nice coffee machine in the man cave. Bring her a flat white every couple hours. She thinks you''re being thoughtful, you get uninterrupted tinkering time. Win-win.',
  89,
  34,
  NOW() - INTERVAL '6 hours'
),
(
  'ThirstyTrev',
  'advice',
  'Best budget mini fridge for the garage?',
  'Looking for recommendations on a small bar fridge that won''t chew through power. Needs to keep at least 12 tinnies cold. What are you blokes running?',
  23,
  67,
  NOW() - INTERVAL '1 day'
),
(
  'ToolDad',
  'whinge',
  'Kids keep ''borrowing'' my tools',
  'Third time this month I''ve found my good screwdrivers being used to dig in the garden. Installed a lock on the shed, now the wife says I''m being ''dramatic''. AM I?!',
  203,
  89,
  NOW() - INTERVAL '1 day'
),
(
  'QuietBloke',
  'tip',
  'DIY soundproofing for your man cave',
  'Egg cartons don''t actually work that well, learned that the hard way. Get some proper acoustic foam panels from Bunnings. Your neighbors (and family) will thank you when you''re watching the footy at full volume.',
  67,
  21,
  NOW() - INTERVAL '2 days'
),
(
  'BunningsLegend',
  'tip',
  'The secret to a perfect snag at Bunnings',
  'Always go Saturday morning around 10am. The volunteers are warmed up, the onions are caramelised just right, and there''s a good chance they''ll throw an extra snag on if you''re friendly.',
  312,
  87,
  NOW() - INTERVAL '3 days'
),
(
  'GrumpyGraham',
  'whinge',
  'Neighbors keep asking to borrow my trailer',
  'Bought a nice box trailer last year. Now every second weekend someone''s knocking asking to borrow it. Thinking of painting "NOT FOR LOAN" on the side.',
  178,
  92,
  NOW() - INTERVAL '3 days'
),
(
  'DIYDan',
  'advice',
  'What''s the best way to run power to a detached shed?',
  'Got a sparky mate who gave me a quote but it seems steep. Anyone done this themselves? Is it worth getting it done properly or can I just run an extension cord? (joking... mostly)',
  45,
  156,
  NOW() - INTERVAL '4 days'
),
(
  'WeekendWarrior',
  'tip',
  'Hang your bike from the ceiling, save floor space',
  'Got one of those pulley systems from eBay for $30. Wife can now park in the garage AND I''ve still got room for the workbench. Marriage saved.',
  134,
  28,
  NOW() - INTERVAL '5 days'
);

-- ============================================
-- 12. SEED DATA - GALLERY ITEMS
-- ============================================

INSERT INTO public.gallery_items (author_name, title, description, category, images, tags, like_count, comment_count, is_featured, created_at) VALUES
(
  'ShedKing42',
  'The Ultimate Shed Setup',
  '5 years in the making. Custom pegboard, beer fridge, and the missus is NOT allowed.',
  'shed',
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
  ARRAY['pegboard', 'beerfridge', 'workshop'],
  342,
  67,
  true,
  NOW() - INTERVAL '2 hours'
),
(
  'GamerDad',
  'Garage Cinema & Gaming Zone',
  'Converted half the double garage. 120 inch screen, surround sound, and a PS5. Worth every argument with the wife.',
  'garage',
  ARRAY['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80'],
  ARRAY['projector', 'gaming', 'surround'],
  289,
  45,
  true,
  NOW() - INTERVAL '5 hours'
),
(
  'BrewMaster',
  'Backyard Bar Paradise',
  'Built it myself from recycled pallets. Got 8 taps on rotation. Neighbors hate me (jealousy).',
  'bar',
  ARRAY['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80'],
  ARRAY['bar', 'homebrew', 'pallets', 'diy'],
  567,
  123,
  true,
  NOW() - INTERVAL '1 day'
),
(
  'MakerMike',
  'The Workshop That Never Sleeps',
  'CNC machine, 3D printer, welding station, and a coffee machine. Sometimes I sleep here. Don''t tell anyone.',
  'workshop',
  ARRAY['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80'],
  ARRAY['cnc', '3dprinting', 'welding'],
  234,
  56,
  false,
  NOW() - INTERVAL '1 day'
),
(
  'RGBRick',
  'Basement Battle Station',
  'Triple monitor setup, racing sim rig, and enough RGB to land a plane. Yes, my electricity bill is criminal.',
  'gaming',
  ARRAY['https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80'],
  ARRAY['rgb', 'simrig', 'battlestation'],
  445,
  89,
  false,
  NOW() - INTERVAL '2 days'
),
(
  'ContainerKev',
  'Converted Shipping Container',
  'Bought a 20ft container, insulated it, and now it''s my private retreat. Climate controlled and soundproof.',
  'outdoor',
  ARRAY['https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80'],
  ARRAY['container', 'conversion', 'diy'],
  678,
  156,
  true,
  NOW() - INTERVAL '3 days'
),
(
  'CinemaSteve',
  'Mini Basement Theater',
  '7.2.4 Dolby Atmos, 4K laser projector, recliners from an old cinema. Movie night is now a religion.',
  'theater',
  ARRAY['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80'],
  ARRAY['atmos', '4k', 'recliners'],
  512,
  98,
  false,
  NOW() - INTERVAL '3 days'
),
(
  'PubLandlord',
  'Shed-to-Pub Transformation',
  'What started as a garden shed is now a fully licensed micro-pub. Council approved and everything!',
  'shed',
  ARRAY['https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&q=80'],
  ARRAY['pub', 'licensed', 'conversion'],
  891,
  234,
  true,
  NOW() - INTERVAL '4 days'
);

-- Set one post as the "whinge of the day" (most liked whinge)
UPDATE public.community_posts 
SET is_featured = true 
WHERE id = (
  SELECT id FROM public.community_posts 
  WHERE post_type = 'whinge' 
  ORDER BY like_count DESC 
  LIMIT 1
);
