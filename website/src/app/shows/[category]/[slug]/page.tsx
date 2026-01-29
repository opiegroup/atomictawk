import Link from "next/link";
import Image from "next/image";
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
  AlertTriangle
} from "lucide-react";

// Mock content data - in production this comes from database
const getContent = (category: string, slug: string) => {
  // Video content example
  if (slug === "burnout-theory") {
    return {
      type: "video",
      title: "Burnout Theory: Friction & Torque Calibration",
      subtitle: "Understanding the physics behind the perfect burnout",
      category: "Mechanical Safety Notice",
      categorySlug: "burnouts",
      refId: "AT-990-2",
      publishedAt: "January 29, 2026",
      duration: "12:44",
      views: "24.7k",
      likes: 1892,
      comments: 247,
      thumbnailUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      body: `
        <h2>The Science of Smoke</h2>
        <p>Every burnout is a carefully orchestrated dance between friction, torque, and controlled chaos. In this comprehensive guide, we'll break down the physics that separate a mediocre burnout from a legendary cloud of smoke.</p>
        
        <h3>Understanding Tire Compound</h3>
        <p>The rubber compound of your tires plays a crucial role in burnout performance. Softer compounds generate more smoke but wear faster, while harder compounds last longer but require more heat to break loose.</p>
        
        <blockquote>
          "A good burnout isn't about destroying tires—it's about understanding them."
          <cite>— Old Mate Jenkins, 1967</cite>
        </blockquote>
        
        <h3>Torque Management</h3>
        <p>The key to a sustained burnout lies in managing your torque delivery. Too much too fast and you'll spin out. Too little and you'll just sit there looking like a drongo.</p>
        
        <ul>
          <li>Start with moderate throttle (60-70%)</li>
          <li>Build heat gradually in the tires</li>
          <li>Once smoke begins, increase throttle smoothly</li>
          <li>Maintain consistent RPM for sustained smoke production</li>
        </ul>
        
        <h3>The Perfect Launch Point</h3>
        <p>Surface preparation is often overlooked. A clean, dry surface with good grip initially will help you build heat before the tires break loose. Wet surfaces or loose gravel will just spin without generating proper smoke.</p>
      `,
      tags: ["Burnouts", "Physics", "Tutorial", "V8", "Tires"],
    };
  }
  
  // Article content example
  return {
    type: "article",
    title: "Bloke Science 101: The Thermodynamics of Engine Oil",
    subtitle: "Why your engine oil matters more than you think",
    category: "Procedure Log",
    categorySlug: "science",
    refId: "AT-443-1",
    publishedAt: "January 28, 2026",
    readTime: "8 min read",
    views: "12.3k",
    likes: 847,
    comments: 156,
    thumbnailUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
    body: `
      <p class="lead">Engine oil is the lifeblood of your vehicle. Without it, your pride and joy becomes a very expensive paperweight. But what actually happens inside that engine, and why does oil matter so much?</p>
      
      <h2>The Heat Problem</h2>
      <p>Internal combustion engines generate tremendous heat. We're talking about controlled explosions happening thousands of times per minute, with peak temperatures exceeding 2,500°C in the combustion chamber. That heat needs to go somewhere.</p>
      
      <p>Your cooling system handles the bulk of heat removal, but oil plays a critical supporting role. It carries heat away from components that coolant can't reach—like pistons, bearings, and the valve train.</p>
      
      <div class="info-box">
        <h4>Did You Know?</h4>
        <p>A typical engine oil will experience temperature swings from ambient (let's say 20°C) to over 150°C at the sump, and localised temps at piston rings can exceed 300°C.</p>
      </div>
      
      <h2>Viscosity: The Magic Number</h2>
      <p>You've seen those numbers on the bottle—5W-30, 10W-40, 0W-20. But what do they actually mean?</p>
      
      <p>The first number (with the W for "winter") indicates how the oil flows when cold. Lower numbers mean better cold flow. The second number indicates viscosity at operating temperature—higher numbers mean thicker oil when hot.</p>
      
      <h3>Why It Matters</h3>
      <p>Too thick, and your engine struggles to pump it, wasting energy and increasing wear at startup. Too thin, and you lose the protective film between metal surfaces, leading to accelerated wear.</p>
      
      <ul>
        <li><strong>Modern engines</strong> typically run 0W-20 or 5W-30 for efficiency</li>
        <li><strong>Performance engines</strong> often require 5W-40 or 10W-40 for added protection</li>
        <li><strong>Classic V8s</strong> might call for 15W-40 or even 20W-50 in hot climates</li>
      </ul>
      
      <h2>The Breakdown</h2>
      <p>Oil doesn't last forever. Heat, contamination, and oxidation gradually degrade its properties. That's why regular changes are non-negotiable.</p>
      
      <blockquote>
        "Change your oil regularly, or pay the mechanic later. Your choice, mate."
        <cite>— Every mechanic ever</cite>
      </blockquote>
      
      <h3>Signs Your Oil Needs Changing</h3>
      <ul>
        <li>Dark, gritty appearance on the dipstick</li>
        <li>Engine running louder than usual</li>
        <li>Oil level dropping faster than normal</li>
        <li>That little light on your dash (don't ignore it)</li>
      </ul>
      
      <h2>Final Thoughts</h2>
      <p>Your engine oil does more than just lubricate. It cleans, cools, protects against corrosion, and seals gaps. Choosing the right oil and changing it regularly is the single most important thing you can do for your engine's longevity.</p>
      
      <p>Stay tuned for Part 2, where we'll dive into synthetic vs conventional oils and settle that debate once and for all.</p>
    `,
    tags: ["Engine Oil", "Maintenance", "Science", "Tutorial"],
  };
};

// Related content
const relatedContent = [
  {
    title: "Piston Wear: Critical Tolerances",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    refId: "AT-812-4",
    href: "/shows/shed/piston-wear",
  },
  {
    title: "The V8 Restoration: Part IV",
    thumbnailUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
    refId: "AT-771-3",
    href: "/shows/shed/v8-restoration-4",
  },
  {
    title: "Torque Ratio Calibration",
    thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80",
    refId: "AT-102-9",
    href: "/shows/shed/torque-calibration",
  },
];

export default async function ContentPage({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const { category, slug } = await params;
  const content = getContent(category, slug);

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
              href={`/shows/${content.categorySlug}`} 
              className="text-[#AEACA1] hover:text-[#CCAA4C] transition-colors capitalize"
            >
              {content.categorySlug}
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
          href={`/shows/${content.categorySlug}`}
          className="inline-flex items-center gap-2 text-[#CCAA4C] hover:text-[#E3E2D5] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to {content.categorySlug}</span>
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#CCAA4C] text-[#353535] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {content.category}
            </span>
            <span className="text-[#AEACA1] text-xs font-mono">{content.refId}</span>
          </div>

          {/* Title */}
          <h1 
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#E3E2D5] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-[#E3E2D5]/80 mb-6">{content.subtitle}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#AEACA1]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{content.publishedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{content.type === "video" ? content.duration : content.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              <span>{content.likes.toLocaleString()} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{content.comments} comments</span>
            </div>
          </div>
        </header>

        {/* Video Player or Featured Image */}
        {content.type === "video" ? (
          <div className="mb-10">
            {/* Video Container */}
            <div className="relative aspect-video bg-black border-4 border-[#353535] overflow-hidden">
              {/* Placeholder with play button - in production use actual video embed */}
              <div className="absolute inset-0">
                <Image
                  src={content.thumbnailUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button className="w-24 h-24 bg-[#CCAA4C] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-[#353535] ml-2" fill="#353535" />
                  </button>
                </div>
              </div>
              
              {/* CRT Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none crt-scanline opacity-20"></div>
              
              {/* Live Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest">Recording</span>
              </div>
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
                {content.views} views
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10">
            <div className="relative aspect-[21/9] bg-[#353535] border-4 border-[#353535] overflow-hidden">
              <Image
                src={content.thumbnailUrl}
                alt={content.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c13] via-transparent to-transparent"></div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Article */}
          <div 
            className="blog-content max-w-none"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            dangerouslySetInnerHTML={{ __html: content.body }}
          />

          {/* Sidebar */}
          <aside className="space-y-8">
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
            <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
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

            {/* Related Content */}
            <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-4">
                Related Broadcasts
              </h3>
              <div className="space-y-4">
                {relatedContent.map((item) => (
                  <Link
                    key={item.refId}
                    href={item.href}
                    className="flex gap-4 group"
                  >
                    <div className="w-20 h-14 bg-[#353535] shrink-0 overflow-hidden">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        width={80}
                        height={56}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#E3E2D5] group-hover:text-[#CCAA4C] transition-colors line-clamp-2">
                        {item.title}
                      </p>
                      <span className="text-[10px] font-mono text-[#AEACA1]">{item.refId}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

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
              <button className="w-full py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest text-sm hover:bg-[#E3E2D5] transition-colors">
                Subscribe
              </button>
            </div>
          </aside>
        </div>

        {/* Comments Section Preview */}
        <section className="mt-16 border-t-4 border-[#AEACA1]/30 pt-12">
          <h2 
            className="text-2xl font-black uppercase tracking-tight text-[#CCAA4C] mb-8"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Transmission Log ({content.comments} Comments)
          </h2>

          {/* Comment Form */}
          <div className="bg-[#252219] border-2 border-[#AEACA1]/20 p-6 mb-8">
            <textarea
              placeholder="Add to the transmission log..."
              rows={4}
              className="w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 p-4 text-[#E3E2D5] placeholder:text-[#AEACA1]/50 focus:border-[#CCAA4C] focus:outline-none resize-none"
            />
            <div className="flex justify-end mt-4">
              <button className="px-6 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest text-sm hover:bg-[#E3E2D5] transition-colors">
                Transmit
              </button>
            </div>
          </div>

          {/* Sample Comments */}
          <div className="space-y-6">
            {[
              {
                author: "GearheadMike",
                date: "2 hours ago",
                comment: "Finally someone explains the science properly! Been doing burnouts for 20 years and learned something new today.",
                likes: 47,
              },
              {
                author: "V8_Jenny",
                date: "5 hours ago", 
                comment: "The bit about tire compound was gold. Explains why my cheaper tires smoke better than the expensive ones!",
                likes: 23,
              },
              {
                author: "OldMateSteve",
                date: "1 day ago",
                comment: "Back in my day we just sent it and hoped for the best. Kids these days with their 'science'. Love it though, good content.",
                likes: 89,
              },
            ].map((comment, i) => (
              <div key={i} className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#CCAA4C] flex items-center justify-center text-[#353535] font-black">
                      {comment.author[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[#E3E2D5]">{comment.author}</p>
                      <p className="text-xs text-[#AEACA1]">{comment.date}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-[#AEACA1] hover:text-[#CCAA4C] transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{comment.likes}</span>
                  </button>
                </div>
                <p className="text-[#E3E2D5]/90">{comment.comment}</p>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 border-2 border-[#AEACA1] text-[#E3E2D5] font-bold uppercase tracking-widest text-sm hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors">
              Load More Comments
            </button>
          </div>
        </section>
      </article>
    </div>
  );
}
