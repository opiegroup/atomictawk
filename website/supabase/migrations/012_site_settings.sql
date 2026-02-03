-- ============================================
-- SITE SETTINGS MIGRATION
-- ============================================

-- 1. SITE SETTINGS TABLE (single row for global settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Branding
  site_name TEXT DEFAULT 'Atomic Tawk',
  logo_url TEXT DEFAULT '/logo.png',
  tagline TEXT DEFAULT 'Broadcasting from the heart of the shed since the atomic age. Keeping your engine humming and your tyre smoke thick.',
  -- Contact Info
  contact_email TEXT DEFAULT 'hello@atomictawk.com',
  contact_phone TEXT,
  contact_address TEXT DEFAULT 'The Shed, Australia',
  radio_frequency TEXT DEFAULT '104.2 FM',
  -- Footer
  copyright_text TEXT DEFAULT 'All Rights Reserved - Atomic Tawk Media',
  footer_tagline TEXT DEFAULT 'Approved for Mechanical Discussion',
  established_text TEXT DEFAULT 'Established 1955 - Rebuilt 2077',
  -- Newsletter
  newsletter_title TEXT DEFAULT 'Join the Broadcast',
  newsletter_description TEXT DEFAULT 'Stay informed. Join the newsletter for weekly mechanical updates and shed tips.',
  newsletter_popup_title TEXT DEFAULT 'Stay Tuned',
  newsletter_popup_description TEXT DEFAULT 'Join the Atomic Tawk broadcast network. Get the latest broadcasts, shed tips, and exclusive content.',
  newsletter_success_message TEXT DEFAULT 'Welcome to the Atomic Tawk community.',
  newsletter_fine_print TEXT DEFAULT 'No spam. Unsubscribe anytime. We respect your inbox like we respect a clean engine bay.',
  -- SEO Defaults
  default_seo_title TEXT DEFAULT 'Atomic Tawk - Tawk Loud. Drive Louder. Feel Prouder.',
  default_seo_description TEXT DEFAULT 'Where real blokes talk torque. Burnouts, shed builds, gaming, and mechanical mayhem.',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SOCIAL LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '#',
  icon TEXT, -- icon name or emoji
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_header BOOLEAN DEFAULT false,
  show_in_footer BOOLEAN DEFAULT true,
  show_on_contact BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TICKER MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.ticker_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  icon TEXT DEFAULT 'zap', -- lucide icon name
  is_highlight BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BLOKE SCIENCE FACTS TABLE
CREATE TABLE IF NOT EXISTS public.bloke_science_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  fact TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_social_links_order ON public.social_links(sort_order);
CREATE INDEX IF NOT EXISTS idx_social_links_active ON public.social_links(is_active);
CREATE INDEX IF NOT EXISTS idx_ticker_messages_order ON public.ticker_messages(sort_order);
CREATE INDEX IF NOT EXISTS idx_ticker_messages_active ON public.ticker_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_bloke_facts_order ON public.bloke_science_facts(sort_order);
CREATE INDEX IF NOT EXISTS idx_bloke_facts_active ON public.bloke_science_facts(is_active);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticker_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloke_science_facts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can view active social links"
  ON public.social_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active ticker messages"
  ON public.ticker_messages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active bloke facts"
  ON public.bloke_science_facts FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admin can manage social links"
  ON public.social_links FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admin can manage ticker messages"
  ON public.ticker_messages FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admin can manage bloke facts"
  ON public.bloke_science_facts FOR ALL
  USING (public.is_admin());

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;

GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;

GRANT SELECT ON public.ticker_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticker_messages TO authenticated;

GRANT SELECT ON public.bloke_science_facts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bloke_science_facts TO authenticated;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default site settings (single row)
INSERT INTO public.site_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default social links
INSERT INTO public.social_links (platform, url, icon, sort_order, show_in_header, show_in_footer, show_on_contact) VALUES
  ('YouTube', '#', 'youtube', 1, false, true, true),
  ('Instagram', '#', 'instagram', 2, false, true, true),
  ('TikTok', '#', 'tiktok', 3, false, true, true),
  ('X', '#', 'twitter', 4, false, true, true),
  ('Facebook', '#', 'facebook', 5, false, false, false)
ON CONFLICT DO NOTHING;

-- Insert default ticker messages
INSERT INTO public.ticker_messages (text, icon, is_highlight, sort_order) VALUES
  ('SIGNAL STRENGTH: OPTIMAL', 'zap', false, 1),
  ('CAUTION: HIGH OCTANE CONTENT AHEAD', 'alert-triangle', true, 2),
  ('NEW BUILD LOG: THE RUST-BUCKET SPECIAL', 'wrench', false, 3),
  ('GAMING UPDATE: WASTELAND CHRONICLES V2.0', 'gamepad-2', false, 4),
  ('BROADCAST ACTIVE: TUNE IN NOW', 'radio', true, 5)
ON CONFLICT DO NOTHING;

-- Insert default bloke science facts
INSERT INTO public.bloke_science_facts (title, fact, sort_order) VALUES
  ('ENGINE HEAT', 'A running engine can reach temperatures of over 2000°C in the combustion chamber.', 1),
  ('TYRE SCIENCE', 'Racing tyres can reach temperatures of 100°C and actually get grippier when hot.', 2),
  ('BRAKE POWER', 'The average car brake generates enough heat to boil water in seconds.', 3),
  ('FUEL FACTS', 'A single litre of petrol contains about 34 megajoules of energy.', 4),
  ('OIL PRESSURE', 'Engine oil operates at pressures up to 80 PSI - that''s serious pressure.', 5),
  ('SPARK TIMING', 'A spark plug fires about 400 times per second at 4800 RPM.', 6),
  ('TURBO SPEED', 'Turbochargers can spin at over 150,000 RPM - faster than a jet engine.', 7),
  ('EXHAUST TEMPS', 'Exhaust gases can exceed 900°C - hot enough to melt aluminium.', 8),
  ('TORQUE FACTS', 'Peak torque is where your engine feels strongest - usually mid-range RPM.', 9),
  ('OCTANE RATING', 'Higher octane fuel resists pre-ignition, allowing more aggressive timing.', 10)
ON CONFLICT DO NOTHING;

-- ============================================
-- UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_updated ON public.site_settings;
CREATE TRIGGER site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_site_settings_timestamp();
