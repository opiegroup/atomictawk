import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer, VideoCard } from "@/components/VideoPlayer";
import { 
  ArrowLeft, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  Flag,
  Clock,
  Eye,
  Calendar,
  ChevronRight,
  Tv
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Comments } from "@/components/Comments";

// Helper to extract YouTube ID from URL
function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  return match ? match[1] : null;
}

// Helper to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
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

// Helper to format duration from seconds
function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
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
async function getVideoData(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch the video by slug
  const { data: video, error } = await supabase
    .from('content')
    .select(`
      *,
      category:categories(id, name, slug, icon)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .in('content_type', ['video', 'broadcast'])
    .single();

  if (error || !video) {
    return null;
  }

  // Record view (fire and forget)
  try {
    await supabase.rpc('record_content_view', { p_content_id: video.id });
  } catch {
    // Ignore view tracking errors
  }

  // Fetch related videos (same category, different video, must have video_url)
  const { data: related } = await supabase
    .from('content')
    .select(`
      id,
      title,
      slug,
      description,
      thumbnail_url,
      video_url,
      duration,
      view_count,
      published_at,
      category:categories(slug)
    `)
    .eq('status', 'published')
    .in('content_type', ['video', 'broadcast'])
    .not('video_url', 'is', null)
    .neq('video_url', '')
    .neq('id', video.id)
    .order('published_at', { ascending: false })
    .limit(5);

  return {
    video,
    relatedVideos: related || [],
  };
}

export default async function VideoPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const data = await getVideoData(slug);

  if (!data) {
    notFound();
  }

  const { video, relatedVideos } = data;
  const youtubeId = getYoutubeId(video.video_url);
  const duration = formatDuration(video.duration);

  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Breadcrumb */}
      <div className="border-b border-[#AEACA1]/20 bg-[#252219]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/tv" className="text-[#AEACA1] hover:text-[#FF6B35] transition-colors">
              Atomic Tawk TV
            </Link>
            <ChevronRight className="w-4 h-4 text-[#AEACA1]/50" />
            {video.category && (
              <>
                <Link 
                  href={`/tv?category=${video.category.slug}`} 
                  className="text-[#AEACA1] hover:text-[#FF6B35] transition-colors"
                >
                  {video.category.name}
                </Link>
                <ChevronRight className="w-4 h-4 text-[#AEACA1]/50" />
              </>
            )}
            <span className="text-white truncate">{video.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Back Link */}
            <Link 
              href="/tv"
              className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Back to TV</span>
            </Link>

            {/* Video Player */}
            {youtubeId ? (
              <VideoPlayer youtubeId={youtubeId} title={video.title} />
            ) : video.video_url ? (
              // Non-YouTube video (Vimeo or direct)
              <div className="relative bg-black border-4 border-[#353535] overflow-hidden">
                <div className="aspect-video">
                  {video.video_url.includes('vimeo') ? (
                    <iframe
                      src={video.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={video.video_url} 
                      controls 
                      className="w-full h-full"
                      poster={video.thumbnail_url}
                    />
                  )}
                </div>
              </div>
            ) : (
              // No video URL - show thumbnail or placeholder
              <div className="relative bg-black border-4 border-[#353535] overflow-hidden aspect-video flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tv className="w-20 h-20 text-[#AEACA1]/30" />
                )}
              </div>
            )}

            {/* Video Info */}
            <div className="bg-[#252219] border-2 border-t-0 border-[#AEACA1]/20 p-6">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {video.is_live && (
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
                <span className="bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {video.category?.name || 'Uncategorized'}
                </span>
                <div className="flex items-center gap-4 text-sm text-[#AEACA1]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViews(video.view_count)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.published_at)}
                  </span>
                  {duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 
                className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {video.title}
              </h1>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pb-6 border-b-2 border-[#AEACA1]/20">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#CCAA4C] transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  {(video.like_count || 0).toLocaleString()}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#AEACA1]/30 text-white font-bold text-sm uppercase tracking-widest hover:border-white transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#AEACA1]/30 text-white font-bold text-sm uppercase tracking-widest hover:border-white transition-colors">
                  <Bookmark className="w-4 h-4" />
                  Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-[#AEACA1] hover:text-white transition-colors ml-auto">
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              {video.description && (
                <div className="py-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                    Description
                  </h3>
                  <div className="text-white/80 whitespace-pre-line leading-relaxed">
                    {video.description}
                  </div>
                </div>
              )}

              {/* Body Content (if any) */}
              {video.body && (
                <div className="py-6 border-t-2 border-[#AEACA1]/20">
                  <div 
                    className="prose prose-invert prose-headings:text-[#CCAA4C] prose-headings:font-black prose-headings:uppercase prose-a:text-[#CCAA4C]"
                    dangerouslySetInnerHTML={{ __html: video.body }}
                  />
                </div>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="pt-6 border-t-2 border-[#AEACA1]/20">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/tv?tag=${tag.toLowerCase().replace(/ /g, '-')}`}
                        className="px-3 py-1 bg-[#1f1c13] border border-[#AEACA1]/30 text-sm text-white hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            {video.allow_comments && (
              <div className="mt-8 bg-[#252219] border-2 border-[#AEACA1]/20 p-6">
                <h3 
                  className="text-xl font-black uppercase tracking-tight text-white mb-6"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Comments ({video.comment_count || 0})
                </h3>
                <Comments contentId={video.id} contentType="content" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                  Related Videos
                </h3>
                <div className="space-y-4">
                  {relatedVideos.map((vid: any) => {
                    const vidYoutubeId = getYoutubeId(vid.video_url);
                    const vidDuration = formatDuration(vid.duration);
                    return (
                      <Link 
                        key={vid.id}
                        href={`/tv/${vid.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="relative w-40 shrink-0">
                          <div className="aspect-video bg-[#353535] overflow-hidden">
                            {vidYoutubeId ? (
                              <img
                                src={`https://img.youtube.com/vi/${vidYoutubeId}/mqdefault.jpg`}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : vid.thumbnail_url ? (
                              <img
                                src={vid.thumbnail_url}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Tv className="w-6 h-6 text-[#AEACA1]/30" />
                              </div>
                            )}
                          </div>
                          {vidDuration && (
                            <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-mono px-1">
                              {vidDuration}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-1">
                            {vid.title}
                          </h4>
                          <p className="text-[10px] text-[#AEACA1]">
                            {formatViews(vid.view_count)} views • {formatRelativeTime(vid.published_at)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscribe Box */}
            <div className="bg-[#252219] border-2 border-[#FF6B35] p-6">
              <h3 
                className="text-lg font-black uppercase tracking-tight text-white mb-3"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Subscribe to Atomic Tawk TV
              </h3>
              <p className="text-sm text-white/70 mb-4">
                New videos every week. Tutorials, builds, and mechanical mayhem.
              </p>
              <button className="w-full py-3 bg-[#FF6B35] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#CCAA4C] transition-colors">
                Subscribe
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
