import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight, Beaker, Wrench, Tv, Gamepad2 } from "lucide-react";

// Mock blog posts - in production from database
const featuredPost = {
  title: "Bloke Science 101: The Thermodynamics of Engine Oil",
  excerpt: "Engine oil is the lifeblood of your vehicle. Without it, your pride and joy becomes a very expensive paperweight. Let's dive into the science that keeps your engine alive.",
  thumbnailUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
  category: "Science",
  categorySlug: "science",
  slug: "thermodynamics-oil",
  publishedAt: "January 28, 2026",
  readTime: "8 min read",
  author: "Dr. Grease",
};

const blogPosts = [
  {
    title: "The Complete Guide to Brake Pad Selection",
    excerpt: "Not all brake pads are created equal. Learn the differences between ceramic, semi-metallic, and organic compounds.",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    category: "The Shed",
    categorySlug: "shed",
    slug: "brake-pad-guide",
    publishedAt: "January 27, 2026",
    readTime: "6 min read",
  },
  {
    title: "Why V8s Sound the Way They Do",
    excerpt: "The unmistakable rumble of a V8 isn't just noise—it's physics. Here's the science behind that glorious sound.",
    thumbnailUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
    category: "Science",
    categorySlug: "science",
    slug: "v8-sound-science",
    publishedAt: "January 25, 2026",
    readTime: "5 min read",
  },
  {
    title: "Setting Up Your First Sim Racing Rig",
    excerpt: "From budget builds to full-motion rigs, everything you need to know to start sim racing at home.",
    thumbnailUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80",
    category: "Gaming",
    categorySlug: "gaming",
    slug: "sim-racing-setup",
    publishedAt: "January 23, 2026",
    readTime: "12 min read",
  },
  {
    title: "The Lost Art of Carburetor Tuning",
    excerpt: "Before fuel injection took over, carbs were king. Here's how the old masters tuned them to perfection.",
    thumbnailUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
    category: "The Shed",
    categorySlug: "shed",
    slug: "carburetor-tuning",
    publishedAt: "January 20, 2026",
    readTime: "10 min read",
  },
  {
    title: "Burnout Competition Rules & Regulations",
    excerpt: "Want to compete? Here's everything you need to know about burnout competition classes and regulations.",
    thumbnailUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
    category: "Burnouts",
    categorySlug: "burnouts",
    slug: "burnout-competition-rules",
    publishedAt: "January 18, 2026",
    readTime: "7 min read",
  },
  {
    title: "Understanding Gear Ratios for Maximum Torque",
    excerpt: "The relationship between gear ratios and power delivery is critical. Here's how to optimise your setup.",
    thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
    category: "Science",
    categorySlug: "science",
    slug: "gear-ratios-explained",
    publishedAt: "January 15, 2026",
    readTime: "9 min read",
  },
];

const categories = [
  { name: "All Posts", slug: "", icon: null, count: 47 },
  { name: "The Shed", slug: "shed", icon: Wrench, count: 18 },
  { name: "Bloke Science", slug: "science", icon: Beaker, count: 12 },
  { name: "Burnouts", slug: "burnouts", icon: Tv, count: 9 },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, count: 8 },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Hero Header */}
      <div className="border-b-4 border-[#CCAA4C] bg-[#252219]">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <p className="text-[#CCAA4C] text-sm font-bold tracking-[0.4em] uppercase mb-4">
            Technical Archives
          </p>
          <h1 
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#E3E2D5] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            The Atomic Blog
          </h1>
          <p className="text-xl text-[#E3E2D5]/80 max-w-2xl">
            Deep dives, tutorials, and technical knowledge for the mechanically curious.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Featured Post */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#CCAA4C] text-[#353535] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              Featured
            </span>
            <div className="flex-1 h-[2px] bg-[#AEACA1]/20"></div>
          </div>

          <Link href={`/shows/${featuredPost.categorySlug}/${featuredPost.slug}`} className="group block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#252219] border-2 border-[#AEACA1]/20 hover:border-[#CCAA4C]/50 transition-colors">
              {/* Image */}
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                <Image
                  src={featuredPost.thumbnailUrl}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#252219]/50 lg:block hidden"></div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[#CCAA4C] text-xs font-bold uppercase tracking-widest">
                    {featuredPost.category}
                  </span>
                  <span className="w-1 h-1 bg-[#AEACA1] rounded-full"></span>
                  <span className="text-[#AEACA1] text-xs">{featuredPost.readTime}</span>
                </div>

                <h2 
                  className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#E3E2D5] group-hover:text-[#CCAA4C] transition-colors mb-4"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {featuredPost.title}
                </h2>

                <p className="text-[#E3E2D5]/80 text-lg mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[#AEACA1]">
                    <span className="font-bold text-[#E3E2D5]">{featuredPost.author}</span>
                    <span>{featuredPost.publishedAt}</span>
                  </div>
                  <span className="flex items-center gap-2 text-[#CCAA4C] font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                  index === 0
                    ? "bg-[#CCAA4C] text-[#353535]"
                    : "border-2 border-[#AEACA1]/30 text-[#E3E2D5] hover:border-[#CCAA4C] hover:text-[#CCAA4C]"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.name}
                <span className="text-xs opacity-60">({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link 
              key={post.slug}
              href={`/shows/${post.categorySlug}/${post.slug}`}
              className="group block bg-[#252219] border-2 border-[#AEACA1]/20 hover:border-[#CCAA4C]/50 transition-colors"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#353535]/90 text-[#CCAA4C] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 
                  className="text-xl font-black uppercase tracking-tight text-[#E3E2D5] group-hover:text-[#CCAA4C] transition-colors mb-3 line-clamp-2"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {post.title}
                </h3>

                <p className="text-[#E3E2D5]/80 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-[#AEACA1]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{post.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 border-2 border-[#AEACA1] text-[#E3E2D5] font-bold uppercase tracking-widest hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors">
            Load More Articles
          </button>
        </div>

        {/* Newsletter CTA */}
        <section className="mt-20 border-4 border-[#CCAA4C] bg-[#252219] p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#CCAA4C] mb-4"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Get the Technical Dispatch
            </h2>
            <p className="text-[#E3E2D5]/80 text-lg mb-8">
              New articles, tutorials, and mechanical wisdom delivered straight to your inbox. 
              No spam, just pure technical content.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-[#1f1c13] border-2 border-[#AEACA1]/30 text-[#E3E2D5] placeholder:text-[#AEACA1]/50 focus:border-[#CCAA4C] focus:outline-none"
              />
              <button className="px-8 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest hover:bg-[#E3E2D5] transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
