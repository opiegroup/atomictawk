-- ============================================
-- ATOMIC TAWK - MENU MANAGEMENT
-- ============================================

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Menu location: 'header', 'footer', 'mobile'
  menu_location TEXT NOT NULL DEFAULT 'header',
  -- Label shown in navigation
  label TEXT NOT NULL,
  -- Link - can be internal (/about) or external (https://...)
  href TEXT NOT NULL,
  -- Icon (emoji or icon name)
  icon TEXT,
  -- Sort order
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Parent for dropdowns (NULL = top level)
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  -- Link to a page (optional - for dynamic pages)
  page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  -- Visibility
  is_visible BOOLEAN NOT NULL DEFAULT true,
  -- Open in new tab
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  -- Only show to logged in users
  requires_auth BOOLEAN NOT NULL DEFAULT false,
  -- Only show to specific roles (NULL = all)
  required_roles TEXT[],
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Public can view visible menu items
CREATE POLICY "Public can view menu items"
ON public.menu_items FOR SELECT
USING (is_visible = true);

-- Admin/God can manage menu items
CREATE POLICY "Admin can manage menu items"
ON public.menu_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_location ON public.menu_items(menu_location);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON public.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON public.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_page ON public.menu_items(page_id);

-- Trigger to update updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DEFAULT MENU ITEMS
-- ============================================

INSERT INTO public.menu_items (menu_location, label, href, icon, sort_order, is_visible) VALUES
  ('header', 'TV', '/tv', NULL, 1, true),
  ('header', 'Broadcasts', '/shows', NULL, 2, true),
  ('header', 'Game', '/game', '🎮', 3, true),
  ('header', 'Community', '/community', '💬', 4, true),
  ('header', 'Store', '/store', NULL, 5, true),
  ('header', 'About', '/about', NULL, 6, true)
ON CONFLICT DO NOTHING;

-- Function to get menu items for a location
CREATE OR REPLACE FUNCTION get_menu_items(p_location TEXT)
RETURNS TABLE (
  id UUID,
  label TEXT,
  href TEXT,
  icon TEXT,
  sort_order INTEGER,
  parent_id UUID,
  page_id UUID,
  open_in_new_tab BOOLEAN,
  requires_auth BOOLEAN,
  required_roles TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.label,
    COALESCE(
      CASE WHEN m.page_id IS NOT NULL 
        THEN '/' || p.slug 
        ELSE NULL 
      END,
      m.href
    ) as href,
    m.icon,
    m.sort_order,
    m.parent_id,
    m.page_id,
    m.open_in_new_tab,
    m.requires_auth,
    m.required_roles
  FROM public.menu_items m
  LEFT JOIN public.pages p ON m.page_id = p.id AND p.status = 'published'
  WHERE m.menu_location = p_location
    AND m.is_visible = true
  ORDER BY m.sort_order ASC;
END;
$$;

-- Grant execute to authenticated and anon
GRANT EXECUTE ON FUNCTION get_menu_items(TEXT) TO authenticated, anon;
