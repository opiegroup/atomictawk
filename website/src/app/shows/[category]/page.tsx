import { ContentCard } from "@/components/ContentCard";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Fallback category info if not found in database
const categoryFallbacks: Record<string, { title: string; description: string; tagline: string }> = {
  burnouts: {
    title: "Burnouts & Cars",
    description: "High-friction environments and kinetic energy distribution studies.",
    tagline: "Where rubber meets asphalt - and loses.",
  },
  shed: {
    title: "The Shed",
    description: "Manual labor and technical ingenuity for the modern era.",
    tagline: "Every great build starts with a rusty idea.",
  },
  gaming: {
    title: "Gaming & Sim Rigs",
    description: "Simulated survival in post-atomic landscapes and virtual racing.",
    tagline: "If you can't drive it, simulate it.",
  },
  weapons: {
    title: "Weapons & Firearms",
    description: "Responsible firearms ownership, reviews, and shooting sports.",
    tagline: "Safety first, accuracy second.",
  },
  storage: {
    title: "Storage & Organisation",
    description: "Industrial storage solutions, garage organisation, and workshop setups.",
    tagline: "A place for everything, everything in its place.",
  },
  science: {
    title: "Bloke Science",
    description: "Did you know? Facts and trivia for the mechanically curious.",
    tagline: "Making physics fun since forever.",
  },
  broadcasts: {
    title: "Atomic Tawk Broadcasts",
    description: "Official transmissions from the Atomic Tawk headquarters.",
    tagline: "Broadcasting from the shed since 1955.",
  },
};

// Helper to format duration from seconds
function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Server-side data fetching
async function getCategoryData(categorySlug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { category: null, content: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch category info
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  // Fetch content for this category
  const { data: content } = await supabase
    .from('content')
    .select(`
      id,
      title,
      slug,
      subtitle,
      description,
      thumbnail_url,
      video_url,
      duration,
      content_type,
      is_featured,
      published_at,
      view_count,
      category:categories(id, name, slug)
    `)
    .eq('status', 'published')
    .eq('category_id', category?.id)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(20);

  return {
    category,
    content: content || [],
  };
}

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  
  const { category, content } = await getCategoryData(categorySlug);
  
  // Use database category info or fallback
  const categoryInfo = category 
    ? { 
        title: category.name, 
        description: category.description || categoryFallbacks[categorySlug]?.description || '',
        tagline: categoryFallbacks[categorySlug]?.tagline || ''
      }
    : categoryFallbacks[categorySlug];
  
  if (!categoryInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Category Header */}
      <div className="bg-[#CCAA4C] border-b-8 border-[#353535] py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 halftone-overlay opacity-20"></div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#353535] text-[#CCAA4C] px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
              Section Active
            </span>
            <span className="text-[#353535] text-xs font-bold uppercase tracking-widest border-l-2 border-[#353535]/20 pl-4">
              Category: {categorySlug.toUpperCase()}
            </span>
          </div>
          <h1 
            className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter text-[#353535] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {categoryInfo.title}
          </h1>
          <p className="text-lg md:text-xl font-bold text-[#353535]/80 max-w-2xl">
            {categoryInfo.description}
          </p>
          {categoryInfo.tagline && (
            <p className="text-sm font-mono text-[#353535]/60 mt-4 italic">
              &ldquo;{categoryInfo.tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.map((item: any) => (
            <ContentCard
              key={item.id}
              title={item.title}
              description={item.description || ''}
              thumbnailUrl={item.thumbnail_url || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80"}
              href={`/shows/${categorySlug}/${item.slug}`}
              category={item.content_type === 'video' ? 'Video' : item.content_type === 'broadcast' ? 'Broadcast' : 'Article'}
              refId={item.subtitle || ''}
              duration={formatDuration(item.duration)}
            />
          ))}
        </div>

        {content.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#AEACA1] text-xl uppercase tracking-widest">
              No broadcasts available in this category yet.
            </p>
            <p className="text-[#AEACA1]/60 text-sm mt-2">
              Check back soon for new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
