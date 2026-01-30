-- ============================================
-- SEED CONTENT - BROADCASTS & FEATURED CONTENT
-- ============================================

-- First, ensure categories exist (in case 004 wasn't run)
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Burnouts & Cars', 'burnouts', 'High-octane automotive content', '🚗', 1),
  ('The Shed', 'shed', 'DIY projects and workshop builds', '🔧', 2),
  ('Gaming', 'gaming', 'Gaming sessions and walkthroughs', '🎮', 3),
  ('Bloke Science', 'science', 'Mechanical science and engineering', '🔬', 4),
  ('Broadcasts', 'broadcasts', 'Live shows and podcasts', '📻', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FEATURED PROPAGANDA CONTENT (3 items)
-- ============================================

-- 1. Rubber vs. Asphalt (Featured - Burnouts)
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Rubber vs. Asphalt',
  'rubber-vs-asphalt',
  'Report #001',
  'Kinetic energy distribution in high-friction environments.',
  '<h2>Technical Analysis</h2>
<p>Understanding the fundamental physics of tire-to-road contact under extreme stress conditions.</p>

<h3>Key Findings</h3>
<ul>
<li>Tire compound degradation rates at various temperatures</li>
<li>Friction coefficient optimization for controlled slides</li>
<li>Heat dissipation patterns across different asphalt surfaces</li>
</ul>

<blockquote>"The perfect burnout is a symphony of physics and controlled chaos." - Atomic Tawk Research Division</blockquote>',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
  (SELECT id FROM public.categories WHERE slug = 'burnouts'),
  'article',
  ARRAY['featured', 'burnouts', 'physics', 'technical'],
  'published',
  true,
  true,
  2847,
  NOW() - INTERVAL '2 days'
) ON CONFLICT (slug) DO UPDATE SET 
  is_featured = true,
  status = 'published';

-- 2. Citizen Engineering (Featured - Shed)
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Citizen Engineering',
  'citizen-engineering',
  'Bulletin #102',
  'Manual labor and technical ingenuity for the modern era.',
  '<h2>Workshop Philosophy</h2>
<p>The art of building with your hands in an increasingly automated world.</p>

<h3>This Week''s Projects</h3>
<ul>
<li>Custom workbench construction with integrated tool storage</li>
<li>Welding fundamentals for garage fabrication</li>
<li>Basic metalworking techniques every bloke should know</li>
</ul>

<p>Remember: measure twice, cut once, and always wear safety gear.</p>',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  (SELECT id FROM public.categories WHERE slug = 'shed'),
  'article',
  ARRAY['featured', 'shed', 'diy', 'workshop'],
  'published',
  true,
  true,
  1923,
  NOW() - INTERVAL '3 days'
) ON CONFLICT (slug) DO UPDATE SET 
  is_featured = true,
  status = 'published';

-- 3. Digital Fallout (Featured - Gaming)
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Digital Fallout',
  'digital-fallout',
  'Log #2077',
  'Simulated survival in post-atomic landscapes.',
  '<h2>Mission Briefing</h2>
<p>Survival tactics and strategy guides for navigating the wasteland.</p>

<h3>Survival Tips</h3>
<ul>
<li>Resource management in scarcity conditions</li>
<li>Base building optimization for defense</li>
<li>Combat tactics for hostile encounters</li>
</ul>

<blockquote>"In the wasteland, preparation is the difference between survival and becoming another skeleton on the road." - Vault Dweller Manual</blockquote>',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
  (SELECT id FROM public.categories WHERE slug = 'gaming'),
  'article',
  ARRAY['featured', 'gaming', 'survival', 'strategy'],
  'published',
  true,
  true,
  3156,
  NOW() - INTERVAL '1 day'
) ON CONFLICT (slug) DO UPDATE SET 
  is_featured = true,
  status = 'published';

-- ============================================
-- LATEST BROADCASTS (6 items)
-- ============================================

-- 1. Burnout Theory: Friction & Torque Calibration
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, video_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Burnout Theory: Friction & Torque Calibration',
  'burnout-theory-friction-torque-calibration',
  'AT-990-2',
  'Understanding the physics behind the perfect burnout. Deep dive into tire compounds, torque delivery, and heat management.',
  '<h2>Mechanical Safety Notice</h2>
<p>In this episode, we break down the fundamental physics that make a perfect burnout possible. From tire compound analysis to torque delivery optimization, we cover everything you need to know.</p>

<h3>What You''ll Learn</h3>
<ul>
<li>Friction coefficient calculations for different tire compounds</li>
<li>Optimal torque curves for maximum smoke output</li>
<li>Heat management and tire longevity</li>
<li>Safety considerations for controlled burnouts</li>
</ul>

<h3>Equipment Breakdown</h3>
<p>We''ll show you the exact setup we use for testing, including our custom dyno rig and thermal imaging equipment.</p>

<blockquote>"A burnout isn''t just about power - it''s about the precise balance of friction, heat, and controlled chaos." - Atomic Tawk Labs</blockquote>',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
  'https://youtube.com/watch?v=example1',
  (SELECT id FROM public.categories WHERE slug = 'burnouts'),
  'broadcast',
  ARRAY['burnouts', 'physics', 'technical', 'live'],
  'published',
  false,
  true,
  1247,
  NOW() - INTERVAL '6 hours'
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published';

-- 2. Piston Wear: Critical Tolerances
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, video_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Piston Wear: Critical Tolerances in High Revs',
  'piston-wear-critical-tolerances',
  'AT-991-1',
  'Examining the microscopic battlefield inside your engine. How tolerances affect performance and longevity.',
  '<h2>Engineering Analysis</h2>
<p>Your engine is a precision instrument operating under extreme conditions. Today we examine what happens at the piston ring interface during high-RPM operation.</p>

<h3>Topics Covered</h3>
<ul>
<li>Ring gap specifications and thermal expansion</li>
<li>Cylinder wall honing patterns</li>
<li>Oil film breakdown under stress</li>
<li>Signs of impending failure</li>
</ul>',
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  'https://youtube.com/watch?v=example2',
  (SELECT id FROM public.categories WHERE slug = 'science'),
  'broadcast',
  ARRAY['engineering', 'engines', 'technical', 'bloke-science'],
  'published',
  false,
  true,
  892,
  NOW() - INTERVAL '1 day'
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published';

-- 3. Wasteland Workshop: Scrap Metal Forge
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, video_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Wasteland Workshop: Scrap Metal Forge',
  'wasteland-workshop-scrap-forge',
  'WW-042',
  'Building a functional forge from salvaged materials. Post-apocalyptic crafting meets practical metalworking.',
  '<h2>Project Overview</h2>
<p>In this episode, we construct a working forge using nothing but scrap metal and determination. Perfect for the backyard blacksmith or wasteland survivor.</p>

<h3>Materials Needed</h3>
<ul>
<li>Old brake drum or steel drum</li>
<li>Fire bricks or refractory cement</li>
<li>Salvaged blower motor</li>
<li>Basic hand tools</li>
</ul>',
  'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
  'https://youtube.com/watch?v=example3',
  (SELECT id FROM public.categories WHERE slug = 'shed'),
  'broadcast',
  ARRAY['diy', 'forge', 'metalworking', 'shed'],
  'published',
  false,
  true,
  1534,
  NOW() - INTERVAL '2 days'
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published';

-- 4. Retro Racer Tournament
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, video_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Retro Racer Tournament: Championship Finals',
  'retro-racer-championship-finals',
  'RR-FINALS',
  'The ultimate test of reflexes and nostalgia. Watch the best racers compete for glory.',
  '<h2>Tournament Coverage</h2>
<p>The Atomic Tawk Retro Racer Championship has reached its climax. Sixteen competitors. One champion. Unlimited bragging rights.</p>

<h3>Bracket Highlights</h3>
<ul>
<li>Semi-final upsets and close calls</li>
<li>Strategy breakdown from top players</li>
<li>Final race commentary and analysis</li>
</ul>',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  'https://youtube.com/watch?v=example4',
  (SELECT id FROM public.categories WHERE slug = 'gaming'),
  'broadcast',
  ARRAY['gaming', 'tournament', 'retro', 'competition'],
  'published',
  false,
  true,
  2341,
  NOW() - INTERVAL '3 days'
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published';

-- 5. Exhaust Note Analysis
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, video_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Exhaust Note Analysis: V8 Symphony Decoded',
  'exhaust-note-analysis-v8',
  'AT-992-1',
  'The science of sound. Understanding what your exhaust is telling you about engine health.',
  '<h2>Audio Engineering Meets Automotive</h2>
<p>Every engine has a voice. Learn to listen and diagnose issues before they become catastrophic failures.</p>

<h3>Sound Signatures</h3>
<ul>
<li>Healthy vs unhealthy exhaust tones</li>
<li>Frequency analysis breakdown</li>
<li>Common problems and their sounds</li>
<li>Tuning for optimal exhaust note</li>
</ul>',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'https://youtube.com/watch?v=example5',
  (SELECT id FROM public.categories WHERE slug = 'burnouts'),
  'broadcast',
  ARRAY['audio', 'exhaust', 'diagnostics', 'v8'],
  'published',
  false,
  true,
  756,
  NOW() - INTERVAL '4 days'
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published';

-- 6. Man Cave Masterclass
INSERT INTO public.content (
  title, slug, subtitle, description, body, thumbnail_url, video_url, category_id, 
  content_type, tags, status, is_featured, allow_comments, view_count, published_at
) VALUES (
  'Man Cave Masterclass: The Perfect Setup',
  'man-cave-masterclass-setup',
  'MC-001',
  'Design principles for the ultimate personal space. From lighting to layout, we cover it all.',
  '<h2>Design Philosophy</h2>
<p>Your man cave should be a reflection of your interests and a functional space for your hobbies. Here''s how to get it right.</p>

<h3>Key Elements</h3>
<ul>
<li>Lighting for different activities</li>
<li>Sound insulation basics</li>
<li>Climate control considerations</li>
<li>Storage solutions that work</li>
</ul>',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
  'https://youtube.com/watch?v=example6',
  (SELECT id FROM public.categories WHERE slug = 'shed'),
  'broadcast',
  ARRAY['man-cave', 'design', 'setup', 'lifestyle'],
  'published',
  false,
  true,
  1823,
  NOW() - INTERVAL '5 days'
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published';

-- Verify inserts
SELECT title, slug, is_featured, status FROM public.content ORDER BY published_at DESC;
