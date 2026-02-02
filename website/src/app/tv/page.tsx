import Link from "next/link";
import { VideoPlayer, VideoCard } from "@/components/VideoPlayer";
import { Tv, Radio, Flame, Wrench, Gamepad2, Beaker, Clock } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Types for database content
interface VideoContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number | null;
  duration_formatted: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_featured: boolean;
  is_live: boolean;
  view_count: number;
  comment_count: number;
  published_at: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

// Helper to extract YouTube ID from URL
function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  return match ? match[1] : null;
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Helper to format view count
function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// Server-side data fetching
async function getTVData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { featured: null, videos: [], categories: [], liveStream: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch featured/live video
  const { data: featuredData } = await supabase
    .rpc('get_tv_featured');
  
  // Fetch all videos
  const { data: videosData } = await supabase
    .rpc('get_tv_videos', { p_limit: 20 });

  // Fetch categories with video counts
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  // Get video counts per category (only content with video_url)
  const { data: videoCounts } = await supabase
    .from('content')
    .select('category_id, video_url')
    .eq('status', 'published')
    .in('content_type', ['video', 'broadcast'])
    .not('video_url', 'is', null)
    .neq('video_url', '');

  // Count videos per category
  const countMap: Record<string, number> = {};
  let totalVideos = 0;
  videoCounts?.forEach((v: { category_id: string | null; video_url: string | null }) => {
    totalVideos++;
    if (v.category_id) {
      countMap[v.category_id] = (countMap[v.category_id] || 0) + 1;
    }
  });

  // Add counts to categories
  const categoriesWithCounts = categoriesData?.map((cat: Category) => ({
    ...cat,
    count: countMap[cat.id] || 0
  })) || [];

  // Check for live stream
  const liveStream = featuredData?.[0]?.is_live ? featuredData[0] : null;
  const featured = featuredData?.[0] || null;

  return {
    featured,
    videos: videosData || [],
    categories: categoriesWithCounts,
    liveStream,
    totalVideos,
  };
}

// Category icon mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'burnouts': Flame,
  'shed': Wrench,
  'gaming': Gamepad2,
  'science': Beaker,
  'broadcasts': Radio,
};

export default async function TVPage() {
  const { featured, videos, categories, liveStream, totalVideos } = await getTVData();

  // If no videos in database yet, show empty state
  const hasContent = featured || videos.length > 0;

  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#252219] to-[#1f1c13] border-b-4 border-[#FF6B35]">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#FF6B35] flex items-center justify-center">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 
                  className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Atomic Tawk TV
                </h1>
                <p className="text-[#AEACA1] text-sm uppercase tracking-widest">
                  Video Broadcasts • Tutorials • Live Streams
                </p>
              </div>
            </div>
            
            {/* Live Indicator - only show if actually live */}
            {liveStream && (
              <div className="flex items-center gap-4">
                <Link 
                  href={`/tv/${liveStream.slug}`}
                  className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-6 py-3 transition-colors"
                >
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  <span className="font-bold uppercase tracking-widest text-sm">Live Now</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {!hasContent ? (
          /* Empty State */
          <div className="text-center py-20">
            <Tv className="w-16 h-16 text-[#AEACA1]/50 mx-auto mb-6" />
            <h2 
              className="text-2xl font-black uppercase tracking-tight text-white mb-4"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              No Videos Yet
            </h2>
            <p className="text-[#AEACA1] mb-8 max-w-md mx-auto">
              Videos will appear here once they&apos;re added through the admin panel. 
              Create video content with type &quot;Video&quot; or &quot;Broadcast&quot; to get started.
            </p>
            <Link 
              href="/admin/content"
              className="inline-block px-6 py-3 bg-[#FF6B35] text-white font-bold uppercase tracking-widest hover:bg-[#CCAA4C] transition-colors"
            >
              Add Videos in Admin
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Video */}
            {featured && (
              <section className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Player */}
                  <div className="lg:col-span-2">
                    {getYoutubeId(featured.video_url) ? (
                      <VideoPlayer 
                        youtubeId={getYoutubeId(featured.video_url)!} 
                        title={featured.title}
                      />
                    ) : (
                      <div className="aspect-video bg-[#252219] border-2 border-[#AEACA1]/20 flex items-center justify-center">
                        {featured.thumbnail_url ? (
                          <img 
                            src={featured.thumbnail_url} 
                            alt={featured.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tv className="w-16 h-16 text-[#AEACA1]/30" />
                        )}
                      </div>
                    )}
                    <div className="bg-[#252219] border-2 border-t-0 border-[#AEACA1]/20 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        {featured.is_live && (
                          <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            Live
                          </span>
                        )}
                        <span className="bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">
                          {featured.category_name || 'Uncategorized'}
                        </span>
                        <span className="text-[#AEACA1] text-xs">{formatViews(featured.view_count)} views</span>
                        <span className="text-[#AEACA1] text-xs">•</span>
                        <span className="text-[#AEACA1] text-xs">{formatRelativeTime(featured.published_at)}</span>
                      </div>
                      <Link href={`/tv/${featured.slug}`}>
                        <h2 
                          className="text-2xl font-black uppercase tracking-tight text-white mb-2 hover:text-[#FF6B35] transition-colors"
                          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                        >
                          {featured.title}
                        </h2>
                      </Link>
                      <p className="text-white/80">{featured.description}</p>
                    </div>
                  </div>

                  {/* Sidebar - Up Next */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C]">
                        Up Next
                      </h3>
                      <span className="text-xs text-[#AEACA1]">Autoplay</span>
                    </div>
                    
                    {videos.slice(1, 5).map((video: VideoContent) => {
                      const youtubeId = getYoutubeId(video.video_url);
                      return (
                        <Link 
                          key={video.id}
                          href={`/tv/${video.slug}`}
                          className="flex gap-3 group"
                        >
                          <div className="relative w-40 shrink-0">
                            <div className="aspect-video bg-[#353535] overflow-hidden">
                              {youtubeId ? (
                                <img
                                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                                  alt={video.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Tv className="w-6 h-6 text-[#AEACA1]/30" />
                                </div>
                              )}
                            </div>
                            {video.duration_formatted && (
                              <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-mono px-1">
                                {video.duration_formatted}
                              </span>
                            )}
                            {video.is_live && (
                              <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold px-1">
                                LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-1">
                              {video.title}
                            </h4>
                            <p className="text-[10px] text-[#AEACA1]">
                              {formatViews(video.view_count)} views • {formatRelativeTime(video.published_at)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mb-8 border-b-2 border-[#AEACA1]/20 pb-6">
              <Link
                href="/tv"
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest bg-[#FF6B35] text-white"
              >
                <Tv className="w-4 h-4" />
                All Videos
                <span className="text-xs opacity-60">({totalVideos || videos.length})</span>
              </Link>
              {categories.map((cat: Category & { count: number }) => {
                const Icon = categoryIcons[cat.slug] || Tv;
                return (
                  <Link
                    key={cat.slug}
                    href={`/tv?category=${cat.slug}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest border-2 border-[#AEACA1]/30 text-white/80 hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                    <span className="text-xs opacity-60">({cat.count})</span>
                  </Link>
                );
              })}
            </div>

            {/* Latest Videos Grid */}
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <Clock className="w-5 h-5 text-[#FF6B35]" />
                <h2 
                  className="text-2xl font-black uppercase tracking-tight text-white"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Latest Videos
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: VideoContent) => {
                  const youtubeId = getYoutubeId(video.video_url);
                  return (
                    <VideoCard 
                      key={video.id}
                      youtubeId={youtubeId || ''}
                      title={video.title}
                      description={video.description}
                      duration={video.duration_formatted || undefined}
                      views={`${formatViews(video.view_count)}`}
                      date={formatRelativeTime(video.published_at)}
                      href={`/tv/${video.slug}`}
                      thumbnailUrl={!youtubeId ? video.thumbnail_url : undefined}
                    />
                  );
                })}
              </div>

              {/* Load More */}
              {videos.length >= 20 && (
                <div className="text-center mt-10">
                  <button className="px-8 py-4 border-2 border-[#AEACA1] text-white font-bold uppercase tracking-widest hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors">
                    Load More Videos
                  </button>
                </div>
              )}
            </section>

            {/* Popular This Week */}
            {videos.length >= 4 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                  <Flame className="w-5 h-5 text-[#FF6B35]" />
                  <h2 
                    className="text-2xl font-black uppercase tracking-tight text-white"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    Popular This Week
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...videos]
                    .sort((a, b) => b.view_count - a.view_count)
                    .slice(0, 4)
                    .map((video: VideoContent) => {
                      const youtubeId = getYoutubeId(video.video_url);
                      return (
                        <VideoCard 
                          key={video.id}
                          youtubeId={youtubeId || ''}
                          title={video.title}
                          description={video.description}
                          duration={video.duration_formatted || undefined}
                          views={`${formatViews(video.view_count)}`}
                          date={formatRelativeTime(video.published_at)}
                          href={`/tv/${video.slug}`}
                          thumbnailUrl={!youtubeId ? video.thumbnail_url : undefined}
                        />
                      );
                    })}
                </div>
              </section>
            )}

            {/* Subscribe CTA */}
            <section className="bg-[#252219] border-4 border-[#FF6B35] p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#FF6B35] flex items-center justify-center shrink-0">
                    <Radio className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 
                      className="text-3xl font-black uppercase tracking-tight text-white mb-2"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      Never Miss a Broadcast
                    </h3>
                    <p className="text-white/70">
                      Subscribe to get notified when new videos drop. No spam, just pure mechanical content.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-[#FF6B35] text-white font-bold uppercase tracking-widest hover:bg-[#CCAA4C] transition-colors">
                    Subscribe
                  </button>
                  <button className="px-8 py-4 border-2 border-white/30 text-white font-bold uppercase tracking-widest hover:border-white transition-colors">
                    YouTube
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
