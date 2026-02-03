import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Radio,
  ChevronRight,
  AlertTriangle,
  Eye
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Comments } from "@/components/Comments";
import { SubscribeButton } from "@/components/SubscribeButton";

// Server-side data fetching
async function getContentBySlug(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch content by slug
  const { data: content, error } = await supabase
    .from('content')
    .select(`
      *,
      category:categories(id, name, slug, icon)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !content) {
    return null;
  }

  // Record view (fire and forget)
  try {
    await supabase.rpc('record_content_view', { p_content_id: content.id });
  } catch {
    // Ignore view tracking errors
  }

  // Fetch related content (same category, excluding current)
  const { data: related } = await supabase
    .from('content')
    .select(`
      id,
      title,
      slug,
      subtitle,
      thumbnail_url,
      category:categories(slug)
    `)
    .eq('status', 'published')
    .neq('id', content.id)
    .limit(3);

  return {
    content,
    relatedContent: related || [],
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function estimateReadTime(body: string = '') {
  const wordCount = body.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export default async function ContentPage({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const { category, slug } = await params;
  const data = await getContentBySlug(slug);

  if (!data) {
    notFound();
  }

  const { content, relatedContent } = data;
  const isVideo = content.content_type === 'video' || content.content_type === 'broadcast';

  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Breadcrumb */}
      <div className="border-b border-[#AEACA1]/20 bg-[#252219]">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/shows" className="text-[#AEACA1] hover:text-[#CCAA4C] transition-colors">
              Broadcasts
            </Link>
            <ChevronRight className="w-4 h-4 text-[#AEACA1]/50" />
            <Link 
              href={`/shows/${content.category?.slug || category}`} 
              className="text-[#AEACA1] hover:text-[#CCAA4C] transition-colors capitalize"
            >
              {content.category?.name || category}
            </Link>
            <ChevronRight className="w-4 h-4 text-[#AEACA1]/50" />
            <span className="text-[#E3E2D5] truncate">{content.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Back Link */}
        <Link 
          href={`/shows/${content.category?.slug || category}`}
          className="inline-flex items-center gap-2 text-[#CCAA4C] hover:text-[#E3E2D5] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to {content.category?.name || category}</span>
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#CCAA4C] text-[#353535] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {content.category?.name || 'General'}
            </span>
            {content.subtitle && (
              <span className="text-[#AEACA1] text-xs font-mono">{content.subtitle}</span>
            )}
            {content.is_featured && (
              <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#E3E2D5] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {content.title}
          </h1>

          {/* Description */}
          {content.description && (
            <p className="text-xl text-[#E3E2D5]/80 mb-6">{content.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#AEACA1]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(content.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{isVideo ? "Video" : estimateReadTime(content.body)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{content.view_count?.toLocaleString() || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{content.comment_count || 0} comments</span>
            </div>
          </div>
        </header>

        {/* Video Player or Featured Image - Full Width */}
        {isVideo && content.video_url ? (
          <div className="mb-10">
            {/* Video Container */}
            <div className="relative aspect-video bg-black border-4 border-[#353535] overflow-hidden">
              {content.video_url.includes('youtube') || content.video_url.includes('youtu.be') ? (
                <iframe
                  src={content.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : content.video_url.includes('vimeo') ? (
                <iframe
                  src={content.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0">
                  <Image
                    src={content.thumbnail_url || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80"}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <a 
                      href={content.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-24 h-24 bg-[#CCAA4C] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Play className="w-10 h-10 text-[#353535] ml-2" fill="#353535" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Video Actions */}
            <div className="flex items-center justify-between mt-4 p-4 bg-[#252219] border-2 border-[#AEACA1]/20">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-[#E3E2D5] hover:text-[#CCAA4C] transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm font-bold">Like</span>
                </button>
                <button className="flex items-center gap-2 text-[#E3E2D5] hover:text-[#CCAA4C] transition-colors">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-sm font-bold">Save</span>
                </button>
                <button className="flex items-center gap-2 text-[#E3E2D5] hover:text-[#CCAA4C] transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-bold">Share</span>
                </button>
              </div>
              <div className="text-sm text-[#AEACA1]">
                {content.view_count?.toLocaleString() || 0} views
              </div>
            </div>
          </div>
        ) : content.thumbnail_url ? (
          <div className="mb-8">
            {/* Taller aspect ratio (16:9) for less cropping - was 21:9 */}
            <div className="relative aspect-video bg-[#353535] border-4 border-[#353535] overflow-hidden">
              <Image
                src={content.thumbnail_url}
                alt={content.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c13] via-transparent to-transparent"></div>
            </div>
          </div>
        ) : null}

        {/* Content Body + Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          {/* Main Article Column */}
          <div className="min-w-0 overflow-hidden">
            {content.body ? (
              <div 
                className="blog-content prose prose-invert prose-headings:text-[#CCAA4C] prose-headings:font-black prose-headings:uppercase prose-a:text-[#CCAA4C] prose-blockquote:border-[#CCAA4C] prose-blockquote:text-[#AEACA1] break-words"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            ) : (
              <div className="text-[#AEACA1] text-center py-12 border-2 border-dashed border-[#AEACA1]/30 rounded">
                <p className="text-lg font-bold uppercase mb-2">Video content above</p>
                <p className="text-sm">Watch the broadcast for the full experience.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:space-y-8">
            {/* Safety Notice */}
            <div className="border-2 border-[#CCAA4C] bg-[#CCAA4C]/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-[#CCAA4C]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#CCAA4C]">
                  Safety Notice
                </span>
              </div>
              <p className="text-sm text-[#E3E2D5]">
                Always follow proper safety procedures. Atomic Tawk is not responsible for any injuries sustained while attempting procedures shown in our content.
              </p>
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/shows?tag=${tag.toLowerCase()}`}
                      className="px-3 py-1 bg-[#1f1c13] border border-[#AEACA1]/30 text-xs font-bold text-[#E3E2D5] hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Content */}
            {relatedContent.length > 0 && (
              <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-4">
                  Related Broadcasts
                </h3>
                <div className="space-y-4">
                  {relatedContent.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/shows/${item.category?.slug || 'general'}/${item.slug}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-20 h-14 bg-[#353535] shrink-0 overflow-hidden">
                        {item.thumbnail_url && (
                          <Image
                            src={item.thumbnail_url}
                            alt={item.title}
                            width={80}
                            height={56}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#E3E2D5] group-hover:text-[#CCAA4C] transition-colors line-clamp-2">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <span className="text-[10px] font-mono text-[#AEACA1]">{item.subtitle}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribe Box */}
            <div className="border-2 border-[#CCAA4C] bg-[#252219] p-6">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-5 h-5 text-[#CCAA4C]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#CCAA4C]">
                  Stay Tuned
                </span>
              </div>
              <p className="text-sm text-[#E3E2D5]/80 mb-4">
                Get notified when new broadcasts drop. No spam, just pure mechanical content.
              </p>
              <SubscribeButton 
                source="content-sidebar" 
                fullWidth 
                size="md"
              />
            </div>
          </aside>
        </div>

        {/* Comments Section */}
        {content.allow_comments && (
          <section className="mt-16 border-t-4 border-[#AEACA1]/30 pt-12">
            <h2 
              className="text-2xl font-black uppercase tracking-tight text-[#CCAA4C] mb-8"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Transmission Log
            </h2>
            <Comments contentId={content.id} contentType="content" />
          </section>
        )}
      </article>
    </div>
  );
}
