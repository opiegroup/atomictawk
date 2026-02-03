-- ============================================
-- BOSCOTEK INDUSTRIAL STORAGE PRODUCTS
-- Partner products for Atomic Tawk Store
-- https://boscotek.com.au/our-products/
-- ============================================

-- Insert Boscotek products
INSERT INTO products (
  name, slug, description, price, compare_price, images, category, serial_no, 
  in_stock, featured, configurable, status, sort_order, specs, long_description,
  care_instructions, product_tables
) VALUES

-- 1. WORKBENCHES
(
  'Boscotek Heavy Duty Workbench',
  'boscotek-heavy-duty-workbench',
  'Australian-made industrial workbench built for serious workshop use. Powder-coated steel construction with customizable configurations.',
  249900, -- $2,499.00
  NULL,
  '["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"]',
  'Workshop',
  'BOS-WB-001',
  true,
  true,
  true,
  'published',
  1,
  '[{"label": "Material", "value": "Powder-coated steel"}, {"label": "Load Capacity", "value": "500kg"}, {"label": "Origin", "value": "Made in Australia"}]',
  'The Boscotek Heavy Duty Workbench is the cornerstone of any serious workshop. Designed and manufactured in Australia, this workbench features heavy-gauge steel construction with a durable powder-coated finish that withstands years of heavy use.

Whether you''re building engines, fabricating parts, or tackling complex mechanical projects, this workbench provides the solid foundation you need. The modular design allows for endless customization with drawers, cupboards, and accessories.',
  'Wipe clean with damp cloth. Avoid abrasive cleaners. Lubricate drawer slides annually.',
  '[{"title": "Specifications", "headers": ["Feature", "Standard", "Heavy Duty"], "rows": [["Width", "1500mm", "2100mm"], ["Depth", "750mm", "900mm"], ["Height", "850mm", "850-1050mm adjustable"], ["Load Capacity", "350kg", "500kg"], ["Frame", "50x50mm steel", "60x60mm steel"]]}]'
),

-- 2. INDUSTRIAL CUPBOARDS
(
  'Boscotek Industrial Cupboard',
  'boscotek-industrial-cupboard',
  'Heavy-duty storage cupboard with adjustable shelving. Perfect for tools, parts, and workshop essentials.',
  189900, -- $1,899.00
  NULL,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
  'Workshop',
  'BOS-IC-001',
  true,
  true,
  true,
  'published',
  2,
  '[{"label": "Material", "value": "Heavy-gauge steel"}, {"label": "Shelves", "value": "4 adjustable"}, {"label": "Locking", "value": "3-point locking system"}]',
  'The Boscotek Industrial Cupboard brings order to your workshop chaos. Built from heavy-gauge steel with a 3-point locking system, your tools and valuables stay secure.

Four fully adjustable shelves let you configure the interior to suit your storage needs. The powder-coated finish resists chips, scratches, and corrosion for years of reliable service.',
  'Clean with mild detergent. Lubricate hinges and locks as needed.',
  '[{"title": "Dimensions", "headers": ["Model", "Width", "Depth", "Height"], "rows": [["Standard", "900mm", "450mm", "1800mm"], ["Wide", "1200mm", "500mm", "1800mm"], ["Tall", "900mm", "450mm", "2100mm"]]}]'
),

-- 3. HIGH DENSITY STORAGE CABINETS
(
  'Boscotek High Density Storage Cabinet',
  'boscotek-high-density-cabinet',
  'Maximize storage in minimal space with adjustable compartments for small parts, fasteners, and components.',
  129900, -- $1,299.00
  NULL,
  '["https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80"]',
  'Workshop',
  'BOS-HD-001',
  true,
  false,
  false,
  'published',
  3,
  '[{"label": "Compartments", "value": "Up to 72"}, {"label": "Drawer Type", "value": "Clear polycarbonate"}, {"label": "Labeling", "value": "Integrated label slots"}]',
  'Stop wasting time searching for parts. The Boscotek High Density Storage Cabinet organizes up to 72 compartments in a compact footprint.

Clear polycarbonate drawers let you see contents at a glance, while integrated label slots keep everything identified. Perfect for fasteners, electrical components, small tools, and hardware.',
  'Wipe drawers with dry cloth. Avoid solvents on polycarbonate components.',
  '[{"title": "Drawer Configurations", "headers": ["Config", "Small", "Medium", "Large"], "rows": [["A - Small Parts", "48", "24", "0"], ["B - Mixed", "24", "24", "12"], ["C - Large Parts", "0", "24", "24"]]}]'
),

-- 4. MOBILE CABINETS
(
  'Boscotek Mobile Tool Cabinet',
  'boscotek-mobile-cabinet',
  'Roll your tools where the work is. Heavy-duty casters, multiple drawer configurations, and lockable security.',
  179900, -- $1,799.00
  NULL,
  '["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80"]',
  'Workshop',
  'BOS-MC-001',
  true,
  true,
  true,
  'published',
  4,
  '[{"label": "Casters", "value": "4x 150mm heavy-duty"}, {"label": "Drawers", "value": "7 ball-bearing"}, {"label": "Lock", "value": "Central locking"}]',
  'The Boscotek Mobile Tool Cabinet brings professional tool storage mobility to your workshop. Four 150mm heavy-duty casters (2 locking) handle loads up to 400kg with ease.

Seven ball-bearing drawers with full extension give you complete access to your tools. Central locking secures everything with a single key.',
  'Keep casters clean of debris. Lubricate drawer slides annually. Check caster bolts quarterly.',
  '[{"title": "Drawer Layout", "headers": ["Drawer", "Height", "Best For"], "rows": [["1-2", "50mm", "Wrenches, sockets"], ["3-4", "75mm", "Pliers, screwdrivers"], ["5-6", "100mm", "Power tool accessories"], ["7", "150mm", "Power tools, large items"]]}]'
),

-- 5. HI-LO RAISE & LOWER WORKBENCHES
(
  'Boscotek Hi-Lo Adjustable Workbench',
  'boscotek-hilo-workbench',
  'Electric height-adjustable workbench. Work standing or sitting with the push of a button. Ergonomic excellence.',
  349900, -- $3,499.00
  NULL,
  '["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80"]',
  'Workshop',
  'BOS-HL-001',
  true,
  true,
  true,
  'published',
  5,
  '[{"label": "Height Range", "value": "720-1120mm"}, {"label": "Motor", "value": "Dual electric"}, {"label": "Memory", "value": "4 preset positions"}]',
  'Your back will thank you. The Boscotek Hi-Lo Workbench adjusts from 720mm to 1120mm at the push of a button, letting you work standing or seated.

Dual electric motors provide smooth, quiet operation with 4 programmable memory positions. The heavy-duty frame maintains full load capacity across the entire height range.',
  'Wipe clean with damp cloth. Have motor serviced every 5 years. Keep mechanism free of debris.',
  '[{"title": "Height Positions", "headers": ["Position", "Height", "Best For"], "rows": [["Seated Low", "720mm", "Precision work with armrests"], ["Seated High", "850mm", "General seated work"], ["Standing Low", "950mm", "Standing with forward lean"], ["Standing High", "1120mm", "Tall users / overhead work"]]}]'
),

-- 6. AUTOMOTIVE WORKSHOP STORAGE
(
  'Boscotek Automotive Workshop System',
  'boscotek-automotive-workshop',
  'Complete workshop storage solution designed for automotive professionals. Integrated workbench, tool storage, and parts organization.',
  499900, -- $4,999.00
  549900, -- Was $5,499.00
  '["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"]',
  'Workshop',
  'BOS-AW-001',
  true,
  true,
  true,
  'published',
  6,
  '[{"label": "Components", "value": "Workbench + 2 Cabinets"}, {"label": "Total Storage", "value": "24 drawers + 8 shelves"}, {"label": "Worktop", "value": "Stainless steel"}]',
  'The ultimate automotive workshop setup. This complete system includes a stainless steel topped workbench flanked by two storage cabinets, providing everything a professional mechanic needs.

24 ball-bearing drawers organize tools of every size, while 8 adjustable shelves handle parts, fluids, and equipment. The integrated design creates a professional workspace that maximizes efficiency.',
  'Clean stainless top with appropriate cleaner. Lubricate all slides annually.',
  '[{"title": "System Components", "headers": ["Item", "Qty", "Dimensions"], "rows": [["Center Workbench", "1", "1500x750mm"], ["Side Cabinets", "2", "600x500mm each"], ["Tool Drawers", "24", "Various sizes"], ["Adjustable Shelves", "8", "580x450mm"]]}]'
),

-- 7. FLIGHTLINE TOOL STORAGE
(
  'Boscotek Flightline FOD-Free Cabinet',
  'boscotek-flightline-cabinet',
  'Aviation-grade tool control cabinet with FOD prevention features. Shadow boards, tool tracking, and secure storage.',
  279900, -- $2,799.00
  NULL,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
  'Workshop',
  'BOS-FL-001',
  true,
  false,
  false,
  'published',
  7,
  '[{"label": "FOD Control", "value": "Shadow board system"}, {"label": "Material", "value": "Aerospace-grade aluminum"}, {"label": "Tracking", "value": "RFID compatible"}]',
  'Designed for aviation maintenance environments where Foreign Object Debris (FOD) prevention is critical. The shadow board system ensures every tool has its place and missing tools are instantly visible.

Aerospace-grade aluminum construction keeps weight manageable while maintaining durability. Optional RFID integration enables digital tool tracking and accountability.',
  'Clean regularly with approved aviation cleaners. Inspect shadow boards for wear. Replace foam inserts as needed.',
  '[{"title": "FOD Features", "headers": ["Feature", "Benefit"], "rows": [["Shadow Boards", "Visual tool accountability"], ["Foam Inserts", "Custom tool placement"], ["Bright Interior", "Easy visual inspection"], ["Magnetic Closures", "Prevents accidental opening"]]}]'
),

-- 8. VISUAL TOOL & PARTS STORAGE
(
  'Boscotek Visual Storage Panel System',
  'boscotek-visual-storage-panel',
  'Wall-mounted panel system with hooks, bins, and holders. See everything at a glance and keep tools within reach.',
  59900, -- $599.00
  NULL,
  '["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"]',
  'Workshop',
  'BOS-VS-001',
  true,
  false,
  false,
  'published',
  8,
  '[{"label": "Panel Size", "value": "1200x600mm"}, {"label": "Accessories", "value": "50+ included"}, {"label": "Mounting", "value": "Wall or bench mount"}]',
  'Transform any wall into organized tool storage. The Boscotek Visual Storage Panel System includes over 50 hooks, bins, and holders to organize your most-used tools.

The perforated steel panel accepts standard pegboard accessories plus Boscotek''s proprietary Twist & Lock hooks that won''t fall out when you remove tools.',
  'Wipe panel clean. Replace worn hooks as needed.',
  '[{"title": "Included Accessories", "headers": ["Type", "Quantity", "Suits"], "rows": [["Single Hooks", "20", "Screwdrivers, files"], ["Double Hooks", "10", "Pliers, wrenches"], ["Parts Bins", "12", "Small parts, fasteners"], ["Tool Holders", "8", "Power tools, drills"]]}]'
),

-- 9. TWIST & LOCK TOOL HOOKS
(
  'Boscotek Twist & Lock Hook Set',
  'boscotek-twist-lock-hooks',
  'Patented tool hooks that lock into place and won''t fall out. Compatible with standard pegboard and Boscotek panels.',
  7900, -- $79.00
  9900, -- Was $99.00
  '["https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80"]',
  'Accessories',
  'BOS-TL-001',
  true,
  false,
  false,
  'published',
  9,
  '[{"label": "Quantity", "value": "25 piece set"}, {"label": "Material", "value": "Zinc-plated steel"}, {"label": "Compatibility", "value": "Standard pegboard + Boscotek"}]',
  'Never chase fallen hooks again. Boscotek''s patented Twist & Lock hooks rotate 90° to lock securely into any standard pegboard or Boscotek panel.

This 25-piece set includes a variety of hook sizes and styles to organize everything from screwdrivers to power tools. The zinc-plated steel construction resists rust and corrosion.',
  'Wipe clean as needed. No maintenance required.',
  '[{"title": "Set Contents", "headers": ["Hook Type", "Qty", "Load Rating"], "rows": [["Small Single", "10", "2kg"], ["Large Single", "5", "5kg"], ["Double Hook", "5", "8kg"], ["Power Tool", "3", "10kg"], ["Bin Hook", "2", "3kg"]]}]'
)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  compare_price = EXCLUDED.compare_price,
  images = EXCLUDED.images,
  category = EXCLUDED.category,
  serial_no = EXCLUDED.serial_no,
  specs = EXCLUDED.specs,
  long_description = EXCLUDED.long_description,
  care_instructions = EXCLUDED.care_instructions,
  product_tables = EXCLUDED.product_tables,
  status = EXCLUDED.status,
  updated_at = now();
