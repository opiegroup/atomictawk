-- ============================================
-- ATOMIC TAWK - PRODUCTS & STORE SCHEMA
-- ============================================
-- Tables: products, product_variants, orders, order_items
-- ============================================

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  specs jsonb DEFAULT '[]', -- Array of {label, value} objects
  price integer NOT NULL, -- Price in cents
  compare_price integer, -- Original price for sale items
  images jsonb DEFAULT '[]', -- Array of image URLs
  category text NOT NULL DEFAULT 'apparel',
  serial_no text,
  in_stock boolean DEFAULT true,
  stock_qty integer DEFAULT 100,
  stripe_product_id text,
  stripe_price_id text,
  featured boolean DEFAULT false,
  configurable boolean DEFAULT false, -- For 3D configurator
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. PRODUCT VARIANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "M", "L", "XL", "Red", "Blue"
  type text NOT NULL DEFAULT 'size' CHECK (type IN ('size', 'color')),
  stock_qty integer DEFAULT 100,
  price_adjustment integer DEFAULT 0, -- Additional cost for this variant (in cents)
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total integer NOT NULL, -- Total in cents
  subtotal integer NOT NULL,
  shipping_cost integer DEFAULT 0,
  tax_amount integer DEFAULT 0,
  shipping_address jsonb,
  billing_address jsonb,
  stripe_session_id text,
  stripe_payment_intent_id text,
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 4. ORDER ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL, -- Store product name at time of order
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL, -- Price at time of order
  variant_name text, -- e.g., "Size: M"
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 5. PRODUCT CATEGORIES (for reference)
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 6. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Auto-update updated_at on products
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-update updated_at on orders
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- PRODUCTS POLICIES
-- Public can view published products
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (status = 'published');

-- Admin can manage all products
CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- PRODUCT VARIANTS POLICIES
-- Public can view variants of published products
CREATE POLICY "Public can view product variants"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND products.status = 'published'
    )
  );

-- Admin can manage variants
CREATE POLICY "Admin can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin());

-- ORDERS POLICIES
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin/Sales can view all orders
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin() OR public.is_sales());

-- Admin can manage orders
CREATE POLICY "Admin can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- System can create orders (for checkout)
CREATE POLICY "System can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- ORDER ITEMS POLICIES
-- Users can view their own order items
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Admin can view all order items
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin() OR public.is_sales());

-- Admin can manage order items
CREATE POLICY "Admin can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- System can create order items
CREATE POLICY "System can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- PRODUCT CATEGORIES POLICIES
-- Public can view categories
CREATE POLICY "Public can view product categories"
  ON public.product_categories FOR SELECT
  USING (true);

-- Admin can manage categories
CREATE POLICY "Admin can manage product categories"
  ON public.product_categories FOR ALL
  USING (public.is_admin());

-- ============================================
-- 9. RPC FUNCTIONS
-- ============================================

-- Get products with filters
CREATE OR REPLACE FUNCTION public.get_products(
  p_category text DEFAULT NULL,
  p_featured_only boolean DEFAULT false,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  specs jsonb,
  price integer,
  compare_price integer,
  images jsonb,
  category text,
  serial_no text,
  in_stock boolean,
  stock_qty integer,
  featured boolean,
  configurable boolean,
  status text,
  sort_order integer,
  variants jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.specs,
    p.price,
    p.compare_price,
    p.images,
    p.category,
    p.serial_no,
    p.in_stock,
    p.stock_qty,
    p.featured,
    p.configurable,
    p.status,
    p.sort_order,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', pv.id,
        'name', pv.name,
        'type', pv.type,
        'stock_qty', pv.stock_qty,
        'price_adjustment', pv.price_adjustment
      ))
      FROM public.product_variants pv
      WHERE pv.product_id = p.id),
      '[]'::jsonb
    ) as variants
  FROM public.products p
  WHERE p.status = 'published'
    AND (p_category IS NULL OR p.category = p_category)
    AND (NOT p_featured_only OR p.featured = true)
  ORDER BY p.sort_order ASC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get single product by slug
CREATE OR REPLACE FUNCTION public.get_product_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  specs jsonb,
  price integer,
  compare_price integer,
  images jsonb,
  category text,
  serial_no text,
  in_stock boolean,
  stock_qty integer,
  featured boolean,
  configurable boolean,
  status text,
  variants jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.specs,
    p.price,
    p.compare_price,
    p.images,
    p.category,
    p.serial_no,
    p.in_stock,
    p.stock_qty,
    p.featured,
    p.configurable,
    p.status,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', pv.id,
        'name', pv.name,
        'type', pv.type,
        'stock_qty', pv.stock_qty,
        'price_adjustment', pv.price_adjustment
      ) ORDER BY pv.name)
      FROM public.product_variants pv
      WHERE pv.product_id = p.id),
      '[]'::jsonb
    ) as variants
  FROM public.products p
  WHERE p.slug = p_slug
    AND (p.status = 'published' OR public.is_admin());
END;
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_number text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate format: AT-YYYYMMDD-XXXX (e.g., AT-20260201-7A3B)
    v_number := 'AT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
    
    SELECT EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_number) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_number;
END;
$$;

-- Create order from checkout
CREATE OR REPLACE FUNCTION public.create_order(
  p_email text,
  p_name text,
  p_items jsonb, -- Array of {product_id, quantity, variant_name}
  p_shipping_address jsonb DEFAULT NULL,
  p_stripe_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_total integer := 0;
  v_item jsonb;
  v_product record;
BEGIN
  -- Generate order number
  v_order_number := public.generate_order_number();
  
  -- Calculate total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT p.*, 
           COALESCE(pv.price_adjustment, 0) as variant_adjustment
    INTO v_product
    FROM public.products p
    LEFT JOIN public.product_variants pv ON pv.product_id = p.id AND pv.name = (v_item->>'variant_name')
    WHERE p.id = (v_item->>'product_id')::uuid;
    
    IF v_product IS NOT NULL THEN
      v_total := v_total + ((v_product.price + v_product.variant_adjustment) * (v_item->>'quantity')::integer);
    END IF;
  END LOOP;
  
  -- Create order
  INSERT INTO public.orders (
    order_number,
    user_id,
    email,
    name,
    total,
    subtotal,
    shipping_address,
    stripe_session_id
  ) VALUES (
    v_order_number,
    auth.uid(),
    p_email,
    p_name,
    v_total,
    v_total,
    p_shipping_address,
    p_stripe_session_id
  ) RETURNING id INTO v_order_id;
  
  -- Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;
    
    IF v_product IS NOT NULL THEN
      INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name,
        product_image,
        quantity,
        unit_price,
        variant_name
      ) VALUES (
        v_order_id,
        v_product.id,
        v_product.name,
        (v_product.images->0)::text,
        (v_item->>'quantity')::integer,
        v_product.price,
        v_item->>'variant_name'
      );
    END IF;
  END LOOP;
  
  -- Audit log
  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'ORDER_CREATED', 'order', v_order_id::text, jsonb_build_object(
    'order_number', v_order_number,
    'total', v_total,
    'email', p_email
  ));
  
  RETURN v_order_id;
END;
$$;

-- Get store stats (for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_store_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_products integer;
  v_published_products integer;
  v_total_orders integer;
  v_pending_orders integer;
  v_total_revenue integer;
  v_monthly_revenue integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT COUNT(*) INTO v_total_products FROM public.products;
  SELECT COUNT(*) INTO v_published_products FROM public.products WHERE status = 'published';
  SELECT COUNT(*) INTO v_total_orders FROM public.orders;
  SELECT COUNT(*) INTO v_pending_orders FROM public.orders WHERE status IN ('pending', 'processing');
  SELECT COALESCE(SUM(total), 0) INTO v_total_revenue FROM public.orders WHERE status NOT IN ('cancelled', 'refunded');
  SELECT COALESCE(SUM(total), 0) INTO v_monthly_revenue 
  FROM public.orders 
  WHERE status NOT IN ('cancelled', 'refunded')
    AND created_at >= date_trunc('month', now());

  RETURN jsonb_build_object(
    'total_products', v_total_products,
    'published_products', v_published_products,
    'total_orders', v_total_orders,
    'pending_orders', v_pending_orders,
    'total_revenue', v_total_revenue,
    'monthly_revenue', v_monthly_revenue
  );
END;
$$;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;

GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT INSERT ON public.order_items TO anon;

GRANT SELECT ON public.product_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_products(text, boolean, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, jsonb, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_store_stats() TO authenticated;

-- ============================================
-- 11. SEED DATA - PRODUCTS
-- ============================================

-- Insert product categories
INSERT INTO public.product_categories (name, slug, description, sort_order) VALUES
  ('Apparel', 'apparel', 'T-shirts, caps, and wearables', 1),
  ('Posters', 'poster', 'Vintage-style propaganda posters', 2),
  ('Stickers', 'sticker', 'Atomic warning stickers and decals', 3),
  ('Workbenches', 'workbench', 'Industrial workbenches for serious work', 4),
  ('Cabinets', 'cabinet', 'Tool storage and organization', 5),
  ('Lockers', 'locker', 'Secure storage solutions', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert products
INSERT INTO public.products (name, slug, description, specs, price, images, category, serial_no, in_stock, stock_qty, configurable, status, sort_order) VALUES
-- Apparel & Merch
(
  'Logo Tee',
  'logo-tee',
  'The official Atomic Tawk logo tee. Made from heavy-duty cotton for maximum durability in the shed or on the track.',
  '[{"label": "Composition", "value": "100% Heavy Cotton"}, {"label": "Mass Index", "value": "240 GSM"}, {"label": "Fit Profile", "value": "Industrial Oversized"}, {"label": "Maintenance", "value": "Cold Cycle / No Heat"}]',
  3200,
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"]',
  'apparel',
  'AT-TEE-01',
  true,
  200,
  false,
  'published',
  1
),
(
  'Mechanical Program Cap',
  'mechanical-cap',
  'Standard issue headwear for certified mechanical operators. Adjustable strap for all head sizes.',
  '[{"label": "Material", "value": "Cotton Twill"}, {"label": "Closure", "value": "Adjustable Strap"}, {"label": "Style", "value": "Structured Crown"}]',
  2800,
  '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80"]',
  'apparel',
  'AT-CAP-05',
  true,
  150,
  false,
  'published',
  2
),
(
  'The Shed Poster',
  'shed-poster',
  'Vintage-style propaganda poster celebrating the noble art of shed work. Perfect for your workshop or man cave.',
  '[{"label": "Size", "value": "18x24 inches"}, {"label": "Paper", "value": "Premium Matte"}, {"label": "Print", "value": "Archival Quality"}]',
  2000,
  '["https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800&q=80"]',
  'poster',
  'AT-PRNT-09',
  true,
  500,
  false,
  'published',
  3
),
(
  'Atomic Warning Sticker Pack',
  'sticker-pack',
  'High-quality vinyl stickers featuring Atomic Tawk warning symbols and logos. Water and weather resistant.',
  '[{"label": "Quantity", "value": "12 stickers"}, {"label": "Material", "value": "Vinyl"}, {"label": "Durability", "value": "3+ years outdoor"}]',
  1200,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
  'sticker',
  'AT-STK-03',
  true,
  1000,
  false,
  'published',
  4
),
-- Workshop Equipment - Workbenches
(
  'Industrial Workbench - Standard',
  'workbench-standard',
  'Heavy-duty industrial workbench for serious workshop use. Steel frame with solid hardwood top.',
  '[{"label": "Dimensions", "value": "1500mm x 750mm x 850mm"}, {"label": "Frame", "value": "Powder-coated Steel"}, {"label": "Top", "value": "32mm Solid Hardwood"}, {"label": "Load Capacity", "value": "500kg"}]',
  189900,
  '["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80"]',
  'workbench',
  'AT-WRK-01',
  true,
  25,
  true,
  'published',
  10
),
(
  'Heavy Duty Workbench - Pro',
  'workbench-pro',
  'Professional-grade workbench with integrated storage drawers and tool holders.',
  '[{"label": "Dimensions", "value": "1800mm x 900mm x 850mm"}, {"label": "Frame", "value": "Heavy Gauge Steel"}, {"label": "Top", "value": "40mm Hardwood + Steel Edge"}, {"label": "Load Capacity", "value": "800kg"}]',
  289900,
  '["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"]',
  'workbench',
  'AT-WRK-02',
  true,
  15,
  true,
  'published',
  11
),
(
  'Hi-Lo Adjustable Workbench',
  'workbench-hilo',
  'Electric height-adjustable workbench for ergonomic working. Perfect for precision tasks.',
  '[{"label": "Dimensions", "value": "1600mm x 800mm x 650-1050mm"}, {"label": "Adjustment", "value": "Electric Motor"}, {"label": "Top", "value": "ESD-Safe Laminate"}, {"label": "Load Capacity", "value": "400kg"}]',
  349900,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
  'workbench',
  'AT-WRK-03',
  true,
  10,
  true,
  'published',
  12
),
-- Storage Cabinets
(
  'Industrial Tool Cabinet',
  'cabinet-industrial',
  'Heavy-duty tool storage cabinet with multiple drawers and compartments. Ball-bearing slides for smooth operation.',
  '[{"label": "Dimensions", "value": "900mm x 500mm x 1800mm"}, {"label": "Drawers", "value": "12 drawers, various sizes"}, {"label": "Material", "value": "16-gauge Steel"}, {"label": "Lock", "value": "Central Locking System"}]',
  249900,
  '["https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80"]',
  'cabinet',
  'AT-CAB-01',
  true,
  20,
  true,
  'published',
  20
),
(
  'High Density Storage Cabinet',
  'cabinet-highdensity',
  'Maximise your storage space with this high-density cabinet featuring adjustable shelving.',
  '[{"label": "Dimensions", "value": "1200mm x 600mm x 2000mm"}, {"label": "Shelves", "value": "8 adjustable shelves"}, {"label": "Material", "value": "14-gauge Steel"}, {"label": "Load Per Shelf", "value": "150kg"}]',
  319900,
  '["https://images.unsplash.com/photo-1597075561824-9a59e4d9fb01?w=800&q=80"]',
  'cabinet',
  'AT-CAB-02',
  true,
  12,
  true,
  'published',
  21
),
(
  'Mobile Tool Cabinet',
  'cabinet-mobile',
  'Take your tools where the work is. Heavy-duty casters with brake locks.',
  '[{"label": "Dimensions", "value": "750mm x 500mm x 900mm"}, {"label": "Drawers", "value": "7 drawers"}, {"label": "Casters", "value": "125mm Heavy Duty with Brakes"}, {"label": "Material", "value": "Powder-coated Steel"}]',
  279900,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
  'cabinet',
  'AT-CAB-03',
  true,
  18,
  true,
  'published',
  22
),
-- Secure Storage
(
  'Secure Equipment Locker - 6 Door',
  'locker-6door',
  'Secure personal equipment storage with 6 individual lockable compartments.',
  '[{"label": "Doors", "value": "6 compartments"}, {"label": "Dimensions", "value": "900mm x 450mm x 1800mm"}, {"label": "Lock", "value": "Cam Lock per Door"}, {"label": "Ventilation", "value": "Louvered Vents"}]',
  189900,
  '["https://images.unsplash.com/photo-1558618047-f4b511e69617?w=800&q=80"]',
  'locker',
  'AT-LKR-01',
  true,
  30,
  false,
  'published',
  30
),
(
  'Secure Equipment Locker - 14 Door',
  'locker-14door',
  'High-capacity secure locker system for workshops and team environments.',
  '[{"label": "Doors", "value": "14 compartments"}, {"label": "Dimensions", "value": "1800mm x 450mm x 1800mm"}, {"label": "Lock", "value": "Digital Keypad per Door"}, {"label": "Material", "value": "Reinforced Steel"}]',
  289900,
  '["https://images.unsplash.com/photo-1558618047-f4b511e69617?w=800&q=80"]',
  'locker',
  'AT-LKR-02',
  true,
  15,
  false,
  'published',
  31
),
(
  'Weapons Storage Cabinet',
  'cabinet-weapons',
  'Australian-compliant secure weapons storage. Meets Police Category requirements.',
  '[{"label": "Compliance", "value": "Cat A/B Approved"}, {"label": "Capacity", "value": "8 Long Arms"}, {"label": "Lock", "value": "Police-approved Dual Lock"}, {"label": "Material", "value": "3mm Steel Body"}]',
  459900,
  '["https://images.unsplash.com/photo-1558618047-f4b511e69617?w=800&q=80"]',
  'locker',
  'AT-SEC-01',
  true,
  8,
  false,
  'published',
  32
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  category = EXCLUDED.category,
  serial_no = EXCLUDED.serial_no,
  in_stock = EXCLUDED.in_stock,
  stock_qty = EXCLUDED.stock_qty,
  configurable = EXCLUDED.configurable,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order;

-- Insert product variants for apparel
INSERT INTO public.product_variants (product_id, name, type, stock_qty) 
SELECT p.id, v.name, 'size', v.stock
FROM public.products p
CROSS JOIN (VALUES 
  ('S', 50),
  ('M', 100),
  ('L', 75),
  ('XL', 50),
  ('2XL', 25)
) AS v(name, stock)
WHERE p.slug = 'logo-tee'
ON CONFLICT DO NOTHING;
