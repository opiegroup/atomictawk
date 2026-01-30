-- ============================================
-- ATOMIC TAWK - MENU MANAGEMENT
-- ============================================

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  parent_id UUID,
  -- Link to a page (optional - for dynamic pages)
  page_id UUID,
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

-- Add foreign keys if tables exist (won't fail if they don't)
DO $$
BEGIN
  -- Self-reference for parent_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'menu_items_parent_id_fkey'
  ) THEN
    ALTER TABLE public.menu_items 
    ADD CONSTRAINT menu_items_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;
  END IF;
  
  -- Reference to pages table (only if pages table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'menu_items_page_id_fkey'
    ) THEN
      ALTER TABLE public.menu_items 
      ADD CONSTRAINT menu_items_page_id_fkey 
      FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admin can manage menu items" ON public.menu_items;

-- Public can view visible menu items
CREATE POLICY "Public can view menu items"
ON public.menu_items FOR SELECT
USING (is_visible = true);

-- Admin/God can manage menu items (check if profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE '
      CREATE POLICY "Admin can manage menu items"
      ON public.menu_items FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role IN (''god'', ''admin'')
        )
      )
    ';
  ELSE
    -- If no profiles table, allow authenticated users to manage
    EXECUTE '
      CREATE POLICY "Admin can manage menu items"
      ON public.menu_items FOR ALL
      USING (auth.uid() IS NOT NULL)
    ';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_location ON public.menu_items(menu_location);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON public.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON public.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_page ON public.menu_items(page_id);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
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
  -- Check if pages table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages') THEN
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
  ELSE
    -- No pages table, just return menu items with their href
    RETURN QUERY
    SELECT 
      m.id,
      m.label,
      m.href,
      m.icon,
      m.sort_order,
      m.parent_id,
      m.page_id,
      m.open_in_new_tab,
      m.requires_auth,
      m.required_roles
    FROM public.menu_items m
    WHERE m.menu_location = p_location
      AND m.is_visible = true
    ORDER BY m.sort_order ASC;
  END IF;
END;
$$;

-- Grant execute to authenticated and anon
GRANT EXECUTE ON FUNCTION get_menu_items(TEXT) TO authenticated, anon;
