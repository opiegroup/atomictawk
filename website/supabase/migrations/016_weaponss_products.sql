-- ============================================
-- WEAPONSS SECURE STORAGE PRODUCTS
-- Partner products for Atomic Tawk Store
-- https://weaponss.com.au/collections/all
-- ============================================

-- Insert WeaponsS products
INSERT INTO products (
  name, slug, description, price, compare_price, images, category, serial_no, 
  in_stock, featured, configurable, status, sort_order, specs, long_description,
  care_instructions, product_tables
) VALUES

-- 1. 34 PISTOL CABINET
(
  'WeaponsS 34 Pistol Cabinet',
  'weaponss-34-pistol-cabinet',
  'Compact secure storage for up to 34 pistols. Heavy-duty steel construction with multi-point locking system. Perfect for clubs and ranges.',
  289900, -- $2,899.00
  NULL,
  '["https://images.unsplash.com/photo-1584281722666-ce8c1db27e3c?w=800&q=80", "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80"]',
  'Security',
  'WS-PC-034',
  true,
  true,
  false,
  'published',
  10,
  '[{"label": "Capacity", "value": "34 pistols"}, {"label": "Material", "value": "3mm steel body"}, {"label": "Lock", "value": "Multi-point locking"}, {"label": "Compliance", "value": "Australian firearms regulations"}]',
  'The WeaponsS 34 Pistol Cabinet provides secure, organized storage for pistol collections, shooting clubs, and ranges. Constructed from 3mm steel with reinforced door hinges and a multi-point locking mechanism.

Internal foam-lined racks protect firearms from scratches while keeping them organized and easily accessible. Meets Australian firearms storage regulations for Category H firearms.',
  'Wipe exterior with dry cloth. Lubricate lock mechanism annually. Inspect hinges and bolts quarterly. Keep in climate-controlled environment.',
  '[{"title": "Specifications", "headers": ["Feature", "Value"], "rows": [["External Dimensions", "600W x 500D x 1200H mm"], ["Internal Capacity", "34 pistols"], ["Door Thickness", "5mm steel"], ["Body Thickness", "3mm steel"], ["Weight", "85kg"], ["Lock Type", "Key + combination"]]}]'
),

-- 2. 77 PISTOL CABINET
(
  'WeaponsS 77 Pistol Cabinet',
  'weaponss-77-pistol-cabinet',
  'High-capacity secure storage holding up to 77 Glock 17 size pistols. Ideal for law enforcement armories and large collections.',
  449900, -- $4,499.00
  NULL,
  '["https://images.unsplash.com/photo-1584281722666-ce8c1db27e3c?w=800&q=80", "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80"]',
  'Security',
  'WS-PC-077',
  true,
  true,
  false,
  'published',
  11,
  '[{"label": "Capacity", "value": "77 pistols (Glock 17 size)"}, {"label": "Material", "value": "4mm steel body"}, {"label": "Lock", "value": "Electronic + key override"}, {"label": "Audit", "value": "Optional electronic logging"}]',
  'The WeaponsS 77 Pistol Cabinet is designed for law enforcement armories, military installations, and large shooting clubs requiring maximum secure storage capacity.

Holds up to 77 Glock 17 sized pistols in organized, foam-lined racks. Electronic lock with key override and optional audit logging tracks every access. Heavy 4mm steel construction with anti-pry door design.',
  'Clean exterior monthly. Service electronic lock annually. Replace backup batteries yearly. Log all access per facility protocols.',
  '[{"title": "Specifications", "headers": ["Feature", "Value"], "rows": [["External Dimensions", "900W x 600D x 1800H mm"], ["Internal Capacity", "77 pistols"], ["Door Thickness", "6mm steel"], ["Body Thickness", "4mm steel"], ["Weight", "180kg"], ["Lock Type", "Electronic + key override"]]}]'
),

-- 3. APPOINTMENT BELT LOCKER - 14 DOOR
(
  'WeaponsS 14 Door Belt Locker',
  'weaponss-14-door-belt-locker',
  'Dual-lock appointment belt locker with 14 individual compartments. Secure duty belt and sidearm storage for shift changes.',
  389900, -- $3,899.00
  NULL,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", "https://images.unsplash.com/photo-1584281722666-ce8c1db27e3c?w=800&q=80"]',
  'Security',
  'WS-BL-014',
  true,
  false,
  false,
  'published',
  12,
  '[{"label": "Compartments", "value": "14 individual lockers"}, {"label": "Lock System", "value": "Dual-lock (user + master)"}, {"label": "Ideal For", "value": "Duty belts, sidearms, equipment"}, {"label": "Ventilation", "value": "Integrated vents"}]',
  'The WeaponsS 14 Door Belt Locker provides secure individual storage for law enforcement and security personnel during shift changes. Each compartment features dual-lock security - personal lock plus master override.

Sized to accommodate complete duty belts with holstered sidearms, radios, and accessories. Integrated ventilation prevents moisture buildup. Wall or floor mounting options.',
  'Clean locker interiors between users. Lubricate locks quarterly. Inspect door seals annually.',
  '[{"title": "Compartment Dimensions", "headers": ["Measurement", "Value"], "rows": [["Width", "300mm"], ["Depth", "450mm"], ["Height", "400mm"], ["Total Unit Height", "1800mm"], ["Total Unit Width", "1200mm"]]}]'
),

-- 4. APPOINTMENT BELT LOCKER - 6 DOOR
(
  'WeaponsS 6 Door Belt Locker',
  'weaponss-6-door-belt-locker',
  'Compact dual-lock belt locker with 6 individual compartments. Perfect for smaller teams and security posts.',
  219900, -- $2,199.00
  NULL,
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", "https://images.unsplash.com/photo-1584281722666-ce8c1db27e3c?w=800&q=80"]',
  'Security',
  'WS-BL-006',
  true,
  false,
  false,
  'published',
  13,
  '[{"label": "Compartments", "value": "6 individual lockers"}, {"label": "Lock System", "value": "Dual-lock (user + master)"}, {"label": "Footprint", "value": "Compact design"}, {"label": "Mounting", "value": "Wall or floor"}]',
  'The WeaponsS 6 Door Belt Locker delivers the same secure storage as our larger units in a compact footprint. Ideal for smaller security teams, remote posts, and facilities with limited space.

Each of the 6 compartments securely stores a complete duty belt with sidearm. Dual-lock system ensures personal security with master override capability for supervisors.',
  'Clean locker interiors between users. Lubricate locks quarterly. Inspect door seals annually.',
  '[{"title": "Specifications", "headers": ["Feature", "Value"], "rows": [["Compartments", "6"], ["Compartment Size", "300W x 450D x 400H mm"], ["Total Dimensions", "600W x 500D x 1200H mm"], ["Weight", "65kg"], ["Lock Type", "Dual combination"]]}]'
),

-- 5. INDIVIDUAL PISTOL LOCKER
(
  'WeaponsS Individual Pistol Locker',
  'weaponss-individual-pistol-locker',
  'Modular single-pistol locker with dual-lock security. Stack or mount in any configuration. One pistol, one locker, total accountability.',
  34900, -- $349.00
  NULL,
  '["https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80", "https://images.unsplash.com/photo-1584281722666-ce8c1db27e3c?w=800&q=80"]',
  'Security',
  'WS-IPL-001',
  true,
  true,
  false,
  'published',
  14,
  '[{"label": "Capacity", "value": "1 pistol + 2 magazines"}, {"label": "Lock System", "value": "Dual-lock modular"}, {"label": "Design", "value": "Stackable/mountable"}, {"label": "Material", "value": "2mm steel"}]',
  'The WeaponsS Individual Pistol Locker brings complete accountability to firearms storage. One locker, one user, one pistol - no shared access, no confusion.

The modular design lets you stack lockers vertically or mount them side-by-side. Each locker includes foam insert for pistol plus space for 2 magazines. Dual-lock system with personal and master access.',
  'Wipe clean with dry cloth. Lubricate lock annually. Replace foam insert when worn.',
  '[{"title": "Modular Configurations", "headers": ["Config", "Lockers", "Footprint"], "rows": [["Single", "1", "200W x 350D x 250H mm"], ["Stack of 4", "4", "200W x 350D x 1000H mm"], ["Row of 6", "6", "1200W x 350D x 250H mm"], ["Bank of 12", "12", "1200W x 350D x 500H mm"]]}]'
),

-- 6. FREE TARGET DOWNLOAD (Lead Magnet - $0)
(
  'WeaponsS Printable Target Pack',
  'weaponss-target-download',
  'FREE downloadable target pack. Print at home for range practice. Multiple designs for pistol and rifle training.',
  0, -- Free
  NULL,
  '["https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80"]',
  'Accessories',
  'WS-TGT-FREE',
  true,
  false,
  false,
  'published',
  15,
  '[{"label": "Format", "value": "PDF download"}, {"label": "Designs", "value": "6 target styles"}, {"label": "Sizes", "value": "A4 and A3"}, {"label": "Price", "value": "FREE"}]',
  'Download and print professional-grade targets at home. This free pack includes 6 different target designs suitable for pistol and rifle practice:

• Standard bullseye (scored rings)
• Silhouette target
• Grid sight-in target  
• Hostage/no-shoot scenario
• Multiple target array
• WeaponsS branded fun target

Print on standard paper or cardstock. A4 and A3 sizes included.',
  'Print on quality paper for best results. Laminate for reuse with dry-erase markers.',
  '[{"title": "Included Targets", "headers": ["Target", "Best For", "Size"], "rows": [["Bullseye", "Precision practice", "A4/A3"], ["Silhouette", "Defensive training", "A3"], ["Sight-In Grid", "Zeroing optics", "A4"], ["Scenario", "Decision training", "A3"], ["Multi-Target", "Speed drills", "A3"], ["Fun Target", "Casual shooting", "A4"]]}]'
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
