-- Add extended product fields for tabs
-- Migration: 013_product_extended_fields.sql

-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS shipping_info TEXT,
ADD COLUMN IF NOT EXISTS product_tables JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN products.long_description IS 'Extended product description for the Description tab';
COMMENT ON COLUMN products.pdf_url IS 'URL to downloadable product spec sheet PDF';
COMMENT ON COLUMN products.care_instructions IS 'Product care and maintenance instructions';
COMMENT ON COLUMN products.shipping_info IS 'Product-specific shipping information';
COMMENT ON COLUMN products.product_tables IS 'Array of tables with title, headers[], and rows[][] for product detail tables';

-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS get_product_by_slug(TEXT);

-- Recreate the get_product_by_slug function with new fields
CREATE OR REPLACE FUNCTION get_product_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  long_description TEXT,
  specs JSONB,
  price INTEGER,
  compare_price INTEGER,
  images JSONB,
  category TEXT,
  serial_no TEXT,
  in_stock BOOLEAN,
  stock_qty INTEGER,
  featured BOOLEAN,
  configurable BOOLEAN,
  variants JSONB,
  pdf_url TEXT,
  care_instructions TEXT,
  shipping_info TEXT,
  product_tables JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.long_description,
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
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pv.id,
            'name', pv.name,
            'type', pv.type,
            'stock_qty', pv.stock_qty,
            'price_adjustment', pv.price_adjustment
          )
        )
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ),
      '[]'::jsonb
    ) as variants,
    p.pdf_url,
    p.care_instructions,
    p.shipping_info,
    COALESCE(p.product_tables, '[]'::jsonb) as product_tables
  FROM products p
  WHERE p.slug = p_slug
    AND p.status = 'published';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_product_by_slug(TEXT) TO anon, authenticated;

-- Example of product_tables JSON structure:
-- [
--   {
--     "title": "Size Chart",
--     "headers": ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
--     "rows": [
--       ["S", "96", "71", "20"],
--       ["M", "101", "74", "21"],
--       ["L", "106", "76", "22"],
--       ["XL", "111", "79", "23"],
--       ["2XL", "116", "81", "24"]
--     ]
--   },
--   {
--     "title": "Material Composition",
--     "headers": ["Material", "Percentage", "Properties"],
--     "rows": [
--       ["Cotton", "80%", "Breathable, soft"],
--       ["Polyester", "20%", "Durable, wrinkle-resistant"]
--     ]
--   }
-- ]
