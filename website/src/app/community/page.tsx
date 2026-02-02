import { 
  MessageSquare, 
  Camera,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CommunityClient } from "./CommunityClient";

// Server-side data fetching
async function getCommunityData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { posts: [], stats: null, featuredWhinge: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch posts
  const { data: posts } = await supabase
    .from('community_posts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch stats
  const { data: stats } = await supabase.rpc('get_community_stats');

  // Get featured whinge (most liked whinge in the last 24 hours, or most liked overall)
  const { data: featuredWhinge } = await supabase
    .from('community_posts')
    .select('*')
    .eq('status', 'active')
    .eq('post_type', 'whinge')
    .order('like_count', { ascending: false })
    .limit(1)
    .single();

  return {
    posts: posts || [],
    stats: stats || { total_posts: 0, total_users: 0, tips_count: 0, whinges_today: 0 },
    featuredWhinge,
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

export default async function CommunityPage() {
  const { posts, stats, featuredWhinge } = await getCommunityData();

  // Transform posts for client component
  const transformedPosts = posts.map((post: any) => ({
    id: post.id,
    type: post.post_type,
    title: post.title,
    content: post.content,
    author: post.author_name,
    likes: post.like_count,
    comments: post.comment_count,
    createdAt: formatRelativeTime(post.created_at),
  }));

  return (
    <div className="bg-[#E3E2D5]">
      
      {/* Hero Banner */}
      <div className="bg-[#353535] py-12 border-b-4 border-[#CCAA4C]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#CCAA4C] flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-[#353535]" />
            </div>
            <div>
              <h1 
                className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                The Community
              </h1>
              <p className="text-[#AEACA1] text-sm uppercase tracking-widest">
                Where Blokes Share, Learn & Have a Good Whinge
              </p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            Welcome to the Atomic Tawk community hub. Share your man cave tips, ask for advice,
            or just have a proper whinge about whatever&apos;s grinding your gears. No judgement here, mate.
          </p>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#CCAA4C]">{stats?.total_posts?.toLocaleString() || '0'}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Total Posts</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#4ECDC4]">{stats?.total_users?.toLocaleString() || '0'}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Cave Dwellers</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#FF6B35]">{stats?.tips_count?.toLocaleString() || '0'}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Tips Shared</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#E74C3C]">{stats?.whinges_today?.toLocaleString() || '0'}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Whinges Today</p>
            </div>
          </div>

          {/* Client Component for Interactivity */}
          <CommunityClient initialPosts={transformedPosts} />

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-[#353535] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#CCAA4C] hover:text-[#353535] transition-colors border-2 border-[#353535]">
              Load More Posts
            </button>
          </div>
        </div>
      </div>

      {/* Flash Your Cave Banner */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#CCAA4C] py-6 border-y-4 border-[#353535]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white flex items-center justify-center shrink-0">
                <Camera className="w-7 h-7 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white">Flash Your Man Cave</h3>
                <p className="text-white/80 text-sm">Share photos of your setup and get inspired by others</p>
              </div>
            </div>
            <Link
              href="/community/gallery"
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-white transition-colors shrink-0"
            >
              View Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Whinge of the Day Banner */}
      {featuredWhinge && (
        <div className="bg-[#E74C3C] py-4 border-y-4 border-[#353535]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <span className="px-3 py-1 bg-white text-[#E74C3C] font-black text-xs uppercase">
                  Whinge of the Day
                </span>
              </div>
              <p className="text-white font-bold text-sm truncate">
                &ldquo;{featuredWhinge.title}&rdquo; — {featuredWhinge.author_name} got {featuredWhinge.like_count} likes for their righteous anger
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
