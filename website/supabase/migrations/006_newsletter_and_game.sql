-- ============================================
-- NEWSLETTER & GAME REGISTRATION SYSTEM
-- ============================================

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  -- Profile link (optional - for logged in users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Subscription preferences
  subscribed_to TEXT[] DEFAULT ARRAY['general']::TEXT[], -- general, broadcasts, gaming, deals
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  -- Game registration
  is_game_registered BOOLEAN DEFAULT false,
  game_display_name TEXT,
  -- Tracking
  source TEXT, -- where they signed up: homepage, content, game, footer
  ip_address INET,
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

-- Users can view/update their own subscription
CREATE POLICY "Users can view own subscription"
ON public.newsletter_subscribers FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
ON public.newsletter_subscribers FOR UPDATE
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR user_id = auth.uid());

-- Admin can manage all
DROP POLICY IF EXISTS "Admin can manage subscribers" ON public.newsletter_subscribers;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can manage subscribers"
      ON public.newsletter_subscribers FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_user ON public.newsletter_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscribers(status);

-- ============================================
-- GAME PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- User identification (can be subscriber or logged in user)
  subscriber_id UUID REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- At least one must be set
  CONSTRAINT game_progress_user_check CHECK (subscriber_id IS NOT NULL OR user_id IS NOT NULL),
  -- Game state
  game_type TEXT NOT NULL DEFAULT 'mancave', -- mancave, racer, etc
  current_level INTEGER DEFAULT 1,
  current_score INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  -- Saved game state (JSON)
  game_state JSONB DEFAULT '{}'::JSONB,
  -- Achievements
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Stats
  total_play_time INTEGER DEFAULT 0, -- seconds
  sessions_played INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own progress
CREATE POLICY "Users can view own progress"
ON public.game_progress FOR SELECT
USING (user_id = auth.uid() OR subscriber_id IN (
  SELECT id FROM public.newsletter_subscribers WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update own progress"
ON public.game_progress FOR UPDATE
USING (user_id = auth.uid() OR subscriber_id IN (
  SELECT id FROM public.newsletter_subscribers WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert own progress"
ON public.game_progress FOR INSERT
WITH CHECK (user_id = auth.uid() OR subscriber_id IS NOT NULL);

-- Admin can view all
DROP POLICY IF EXISTS "Admin can view all progress" ON public.game_progress;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can view all progress"
      ON public.game_progress FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''god'', ''admin'')))
    ';
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_game_progress_subscriber ON public.game_progress(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user ON public.game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_type ON public.game_progress(game_type);
CREATE INDEX IF NOT EXISTS idx_game_progress_score ON public.game_progress(high_score DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_newsletter_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER update_newsletter_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_progress_updated_at ON public.game_progress;
CREATE TRIGGER update_game_progress_updated_at
  BEFORE UPDATE ON public.game_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Subscribe to newsletter with optional game registration
CREATE OR REPLACE FUNCTION subscribe_newsletter(
  p_email TEXT,
  p_subscribed_to TEXT[] DEFAULT ARRAY['general']::TEXT[],
  p_source TEXT DEFAULT 'website',
  p_game_display_name TEXT DEFAULT NULL,
  p_is_game_registered BOOLEAN DEFAULT false
)
RETURNS TABLE (
  subscriber_id UUID,
  is_new BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscriber_id UUID;
  v_is_new BOOLEAN := false;
  v_user_id UUID;
BEGIN
  -- Get current user if logged in
  v_user_id := auth.uid();
  
  -- Check if already subscribed
  SELECT id INTO v_subscriber_id
  FROM public.newsletter_subscribers
  WHERE email = lower(p_email);
  
  IF v_subscriber_id IS NOT NULL THEN
    -- Update existing subscription
    UPDATE public.newsletter_subscribers
    SET 
      subscribed_to = ARRAY(SELECT DISTINCT unnest(subscribed_to || p_subscribed_to)),
      is_game_registered = COALESCE(p_is_game_registered, is_game_registered),
      game_display_name = COALESCE(p_game_display_name, game_display_name),
      user_id = COALESCE(user_id, v_user_id),
      status = 'active',
      updated_at = NOW()
    WHERE id = v_subscriber_id;
    
    RETURN QUERY SELECT v_subscriber_id, false, 'Subscription updated'::TEXT;
  ELSE
    -- Create new subscription
    INSERT INTO public.newsletter_subscribers (
      email, user_id, subscribed_to, source, is_game_registered, game_display_name
    ) VALUES (
      lower(p_email), v_user_id, p_subscribed_to, p_source, p_is_game_registered, p_game_display_name
    )
    RETURNING id INTO v_subscriber_id;
    
    RETURN QUERY SELECT v_subscriber_id, true, 'Successfully subscribed!'::TEXT;
  END IF;
END;
$$;

-- Get or create game progress
CREATE OR REPLACE FUNCTION get_or_create_game_progress(
  p_subscriber_id UUID DEFAULT NULL,
  p_game_type TEXT DEFAULT 'mancave'
)
RETURNS public.game_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_progress public.game_progress;
BEGIN
  v_user_id := auth.uid();
  
  -- Try to find existing progress
  SELECT * INTO v_progress
  FROM public.game_progress
  WHERE game_type = p_game_type
  AND (
    (user_id IS NOT NULL AND user_id = v_user_id) OR
    (subscriber_id IS NOT NULL AND subscriber_id = p_subscriber_id)
  )
  LIMIT 1;
  
  -- If not found, create new
  IF v_progress.id IS NULL THEN
    INSERT INTO public.game_progress (subscriber_id, user_id, game_type)
    VALUES (p_subscriber_id, v_user_id, p_game_type)
    RETURNING * INTO v_progress;
  END IF;
  
  RETURN v_progress;
END;
$$;

-- Save game progress
CREATE OR REPLACE FUNCTION save_game_progress(
  p_progress_id UUID,
  p_game_state JSONB,
  p_current_level INTEGER DEFAULT NULL,
  p_current_score INTEGER DEFAULT NULL,
  p_play_time_add INTEGER DEFAULT 0
)
RETURNS public.game_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress public.game_progress;
BEGIN
  UPDATE public.game_progress
  SET 
    game_state = p_game_state,
    current_level = COALESCE(p_current_level, current_level),
    current_score = COALESCE(p_current_score, current_score),
    high_score = GREATEST(high_score, COALESCE(p_current_score, current_score)),
    total_play_time = total_play_time + p_play_time_add,
    sessions_played = sessions_played + 1,
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE id = p_progress_id
  RETURNING * INTO v_progress;
  
  RETURN v_progress;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION subscribe_newsletter(TEXT, TEXT[], TEXT, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_game_progress(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_game_progress(UUID, JSONB, INTEGER, INTEGER, INTEGER) TO authenticated;
