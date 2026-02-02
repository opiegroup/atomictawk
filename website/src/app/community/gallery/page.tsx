import { 
  Camera, 
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { GalleryClient } from "./GalleryClient";

// Server-side data fetching
async function getGalleryData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { items: [], stats: null, featuredItem: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch gallery items
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch stats
  const { data: stats } = await supabase.rpc('get_gallery_stats');

  // Get featured item
  const { data: featuredItem } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('like_count', { ascending: false })
    .limit(1)
    .single();

  return {
    items: items || [],
    stats: stats || { total_items: 0, total_likes: 0, this_week: 0 },
    featuredItem,
  };
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default async function GalleryPage() {
  const { items, stats, featuredItem } = await getGalleryData();

  // Transform items for client component
  const transformedItems = items.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    author: item.author_name,
    authorAvatar: null,
    images: item.images || [],
    likes: item.like_count,
    comments: item.comment_count,
    featured: item.is_featured,
    createdAt: formatRelativeTime(item.created_at),
    tags: item.tags || [],
  }));

  return (
    <div className="bg-[#E3E2D5]">
      
      {/* Hero Banner */}
      <div className="bg-[#353535] py-12 border-b-4 border-[#FF6B35]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#FF6B35] flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 
                className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Flash Your Man Cave
              </h1>
              <p className="text-[#AEACA1] text-sm uppercase tracking-widest">
                Show Off Your Sacred Space • Get Inspired • Earn Bragging Rights
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/community" className="hover:text-[#FF6B35]">Community</Link>
            <span>/</span>
            <span className="text-[#FF6B35]">Gallery</span>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Featured Banner */}
          {featuredItem && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#CCAA4C] to-[#FF6B35] border-2 border-[#353535]">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white font-black uppercase text-sm">Cave of the Week</p>
                  <p className="text-white/80 text-xs">
                    &ldquo;{featuredItem.title}&rdquo; by {featuredItem.author_name} — {featuredItem.like_count} likes!
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-white text-[#353535] font-bold text-xs uppercase hover:bg-[#353535] hover:text-white transition-colors">
                  View
                </button>
              </div>
            </div>
          )}

          {/* Client Component for Interactivity */}
          <GalleryClient 
            initialItems={transformedItems} 
            stats={stats}
          />
        </div>
      </div>

    </div>
  );
}
