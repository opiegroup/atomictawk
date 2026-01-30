import Link from "next/link";
import { ContentCard } from "@/components/ContentCard";
import { Tv, Wrench, Gamepad2, Beaker, Radio } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Server-side data fetching
async function getContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { content: [], categories: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch published content
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
      content_type,
      is_featured,
      published_at,
      view_count,
      category:categories(id, name, slug, icon)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  // Fetch categories with counts
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_visible', true)
    .order('sort_order');

  // Get content counts per category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat) => {
      const { count } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'published');
      return { ...cat, count: count || 0 };
    })
  );

  return {
    content: content || [],
    categories: categoriesWithCounts,
  };
}

const categoryIcons: Record<string, any> = {
  burnouts: Tv,
  shed: Wrench,
  science: Beaker,
  gaming: Gamepad2,
  broadcasts: Radio,
};

export default async function ShowsPage() {
  const { content, categories } = await getContent();

  // Map content to ContentCard format
  const featuredContent = content.map((item: any) => ({
    title: item.title,
    description: item.description || item.subtitle,
    thumbnailUrl: item.thumbnail_url || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    href: `/shows/${item.category?.slug || 'general'}/${item.slug}`,
    category: item.category?.name || 'General',
    refId: item.subtitle || `AT-${item.id.slice(0,3).toUpperCase()}`,
    isLive: item.is_featured,
    duration: item.video_url ? "00:00:00" : undefined,
  }));

  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Page Header */}
      <div className="p-8 border-b-2 border-[#AEACA1]/30 bg-[#252219]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-[#CCAA4C] text-sm font-bold tracking-[0.4em] uppercase">
                Frequency: 104.2 MHZ
              </p>
              <h1 
                className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#E3E2D5]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Atomic Tawk Broadcast Service
              </h1>
              <p className="text-[#E3E2D5]/70 text-lg font-medium uppercase">
                Mechanical Safety Notice: All Hands to the Track
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#AEACA1]/10 border-2 border-[#AEACA1] text-[#E3E2D5] text-xs font-bold tracking-widest hover:bg-[#AEACA1] hover:text-black transition-colors uppercase">
                <Radio className="w-4 h-4" />
                Live Feed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-r-4 border-[#AEACA1]/30 bg-[#18160f] p-6">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-[#AEACA1] mb-4 tracking-[0.3em] uppercase">
                Service Categories
              </p>
              <div className="space-y-2">
                {/* All Shows link */}
                <Link
                  href="/shows"
                  className="flex items-center gap-4 p-3 bg-[#CCAA4C] text-black transition-all"
                >
                  <Radio className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-tight">All Broadcasts</span>
                  <span className="ml-auto text-xs opacity-60">({content.length})</span>
                </Link>
                
                {categories.map((cat: any) => {
                  const Icon = categoryIcons[cat.slug] || Radio;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/shows/${cat.slug}`}
                      className="flex items-center gap-4 p-3 text-[#E3E2D5] hover:bg-[#AEACA1]/10 border border-transparent hover:border-[#AEACA1] transition-all"
                    >
                      <Icon className="w-5 h-5 text-[#CCAA4C]" />
                      <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                      <span className="ml-auto text-xs text-[#AEACA1]">({cat.count})</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div>
              <p className="text-[10px] font-black text-[#AEACA1] mb-4 tracking-[0.3em] uppercase">
                System Status
              </p>
              <div className="border-2 border-[#AEACA1] p-4 space-y-3 bg-black/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#E3E2D5]">BROADCASTS</span>
                  <span className="text-xs font-mono text-[#CCAA4C]">{content.length}</span>
                </div>
                <div className="h-1.5 bg-[#AEACA1]/20 w-full overflow-hidden">
                  <div className="h-full bg-[#CCAA4C]" style={{ width: `${Math.min(content.length * 5, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#E3E2D5]">STATUS</span>
                  <span className="text-xs font-mono text-[#CCAA4C]">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Tabs */}
          <div className="flex border-b-2 border-[#AEACA1] gap-8 overflow-x-auto mb-8">
            {["All Broadcasts", "Latest Revs", "High Torque", "Archived Data"].map((tab, i) => (
              <button
                key={tab}
                className={`pb-4 border-b-4 text-xs font-black tracking-widest whitespace-nowrap transition-colors uppercase ${
                  i === 0
                    ? "border-[#CCAA4C] text-[#CCAA4C]"
                    : "border-transparent text-[#AEACA1] hover:text-[#E3E2D5]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          {featuredContent.length === 0 ? (
            <div className="text-center py-16 text-[#AEACA1]">
              <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-bold uppercase mb-2">No Broadcasts Found</p>
              <p className="text-sm">Content will appear here once published from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {featuredContent.map((content: any) => (
                <ContentCard key={content.refId} {...content} />
              ))}
            </div>
          )}

          {/* Load More */}
          {featuredContent.length > 0 && (
            <div className="text-center mt-12">
              <button className="px-8 py-4 border-2 border-[#AEACA1] text-[#E3E2D5] font-bold uppercase tracking-widest hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors">
                Load More Archives
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t-4 border-[#AEACA1] bg-[#18160f] px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-bold tracking-widest text-[#AEACA1] uppercase">
              System Online
            </span>
          </div>
          <div className="text-[10px] font-bold tracking-widest text-[#AEACA1] uppercase border-l-2 border-[#AEACA1]/30 pl-6">
            Broadcast Frequency: Locked
          </div>
        </div>
        <p className="text-[10px] font-bold text-[#AEACA1]/50 tracking-widest uppercase text-center md:text-right">
          © 1952-20XX Atomic Tawk Media. All Rights Reserved. Mechanical Compliance Mandatory.
        </p>
      </footer>
    </div>
  );
}
