import Link from "next/link";
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
  ChevronRight
} from "lucide-react";

// Mock video data - in production from database
const getVideo = (slug: string) => {
  return {
    youtubeId: "dQw4w9WgXcQ", // Replace with actual video ID
    title: "LS Swap Bible: Everything You Need to Know",
    description: `The complete guide to dropping an LS into anything with wheels. In this comprehensive tutorial, we cover everything from engine selection to wiring harnesses, mounts to exhaust.

Whether you're swapping into a classic muscle car, a Japanese import, or something completely unexpected, this guide has you covered.

Chapters:
00:00 - Introduction
02:15 - Choosing Your LS
08:42 - Engine Mounts & Crossmembers
18:30 - Transmission Options
28:15 - Wiring & ECU
38:00 - Fuel System
45:22 - First Start Checklist`,
    category: "Shed Builds",
    categorySlug: "shed",
    date: "January 27, 2026",
    views: "18,247",
    likes: 1423,
    duration: "45:22",
    tags: ["LS Swap", "Engine Swap", "Tutorial", "V8", "Shed Build"],
  };
};

const relatedVideos = [
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "LS Wiring Harness Simplified",
    duration: "22:15",
    views: "9.2K",
    date: "3 weeks ago",
    href: "/tv/ls-wiring",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "T56 vs 4L60E: Which Trans?",
    duration: "18:33",
    views: "14.1K",
    date: "1 month ago",
    href: "/tv/trans-comparison",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Budget LS Build: $3000 Challenge",
    duration: "38:42",
    views: "42.3K",
    date: "2 months ago",
    href: "/tv/budget-ls",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "First Start Compilation 2025",
    duration: "15:08",
    views: "67.8K",
    date: "3 months ago",
    href: "/tv/first-starts-2025",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Headers vs Manifolds Explained",
    duration: "12:44",
    views: "8.5K",
    date: "3 months ago",
    href: "/tv/headers-manifolds",
  },
];

export default async function VideoPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const video = getVideo(slug);

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
            <Link 
              href={`/tv?category=${video.categorySlug}`} 
              className="text-[#AEACA1] hover:text-[#FF6B35] transition-colors"
            >
              {video.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-[#AEACA1]/50" />
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
            <VideoPlayer youtubeId={video.youtubeId} />

            {/* Video Info */}
            <div className="bg-[#252219] border-2 border-t-0 border-[#AEACA1]/20 p-6">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {video.category}
                </span>
                <div className="flex items-center gap-4 text-sm text-[#AEACA1]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {video.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {video.duration}
                  </span>
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
                  {video.likes.toLocaleString()}
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
              <div className="py-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                  Description
                </h3>
                <div className="text-white/80 whitespace-pre-line leading-relaxed">
                  {video.description}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-6 border-t-2 border-[#AEACA1]/20">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
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
            </div>

            {/* Comments Section */}
            <div className="mt-8 bg-[#252219] border-2 border-[#AEACA1]/20 p-6">
              <h3 
                className="text-xl font-black uppercase tracking-tight text-white mb-6"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Comments (247)
              </h3>

              {/* Comment Form */}
              <div className="mb-8">
                <textarea
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 p-4 text-white placeholder:text-[#AEACA1]/50 focus:border-[#FF6B35] focus:outline-none resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button className="px-6 py-2 bg-[#FF6B35] text-white font-bold uppercase tracking-widest text-sm hover:bg-[#CCAA4C] transition-colors">
                    Comment
                  </button>
                </div>
              </div>

              {/* Sample Comments */}
              <div className="space-y-6">
                {[
                  {
                    author: "LSSwapKing",
                    date: "2 days ago",
                    comment: "Best LS swap guide on the internet. Finally someone explains the wiring properly!",
                    likes: 89,
                  },
                  {
                    author: "GarageBuilds_AU",
                    date: "3 days ago",
                    comment: "Did my first swap thanks to this video. 5.3 into an XD Falcon. Runs like a dream.",
                    likes: 67,
                  },
                  {
                    author: "WrenchMonkey",
                    date: "1 week ago",
                    comment: "The fuel system section saved me so much headache. Cheers mate!",
                    likes: 34,
                  },
                ].map((comment, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#FF6B35] flex items-center justify-center text-white font-black shrink-0">
                      {comment.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-white">{comment.author}</span>
                        <span className="text-xs text-[#AEACA1]">{comment.date}</span>
                      </div>
                      <p className="text-white/80 mb-2">{comment.comment}</p>
                      <button className="flex items-center gap-2 text-[#AEACA1] hover:text-[#FF6B35] text-sm transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        {comment.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 border-2 border-[#AEACA1]/30 text-white font-bold uppercase tracking-widest text-sm hover:border-white transition-colors">
                Load More Comments
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related Videos */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                Related Videos
              </h3>
              <div className="space-y-4">
                {relatedVideos.map((vid, i) => (
                  <Link 
                    key={i}
                    href={vid.href}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-40 shrink-0">
                      <div className="aspect-video bg-[#353535] overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-mono px-1">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-1">
                        {vid.title}
                      </h4>
                      <p className="text-[10px] text-[#AEACA1]">
                        {vid.views} views • {vid.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

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
