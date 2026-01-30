import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight, Beaker, Wrench, Tv, Gamepad2, FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { NewsletterCTA } from "@/components/NewsletterCTA";

// Server-side data fetching
async function getBlogContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { posts: [], categories: [], featuredPost: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch published articles
  const { data: posts } = await supabase
    .from('content')
    .select(`
      id,
      title,
      slug,
      description,
      thumbnail_url,
      content_type,
      is_featured,
      published_at,
      view_count,
      category:categories(id, name, slug, icon)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  // Get featured post (first featured or first post)
  const featuredPost = posts?.find((p: any) => p.is_featured) || posts?.[0] || null;
  
  // Remove featured from list
  const otherPosts = posts?.filter((p: any) => p.id !== featuredPost?.id) || [];

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

  // Add "All Posts" to beginning
  const totalCount = posts?.length || 0;
  const allCategories = [
    { name: "All Posts", slug: "", icon: null, count: totalCount },
    ...categoriesWithCounts
  ];

  return {
    posts: otherPosts,
    categories: allCategories,
    featuredPost,
  };
}

const categoryIcons: Record<string, any> = {
  shed: Wrench,
  science: Beaker,
  burnouts: Tv,
  gaming: Gamepad2,
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function estimateReadTime(description: string = '') {
  const wordCount = description.split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 200) + 3);
  return `${minutes} min read`;
}

export default async function BlogPage() {
  const { posts, categories, featuredPost } = await getBlogContent();

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
        {featuredPost && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-[#CCAA4C] text-[#353535] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Featured
              </span>
              <div className="flex-1 h-[2px] bg-[#AEACA1]/20"></div>
            </div>

            <Link href={`/shows/${featuredPost.category?.slug || 'general'}/${featuredPost.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#252219] border-2 border-[#AEACA1]/20 hover:border-[#CCAA4C]/50 transition-colors">
                {/* Image */}
                <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <Image
                    src={featuredPost.thumbnail_url || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80"}
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
                      {featuredPost.category?.name || 'General'}
                    </span>
                    <span className="w-1 h-1 bg-[#AEACA1] rounded-full"></span>
                    <span className="text-[#AEACA1] text-xs">{estimateReadTime(featuredPost.description)}</span>
                  </div>

                  <h2 
                    className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#E3E2D5] group-hover:text-[#CCAA4C] transition-colors mb-4"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {featuredPost.title}
                  </h2>

                  <p className="text-[#E3E2D5]/80 text-lg mb-6 line-clamp-3">
                    {featuredPost.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[#AEACA1]">
                      <span className="font-bold text-[#E3E2D5]">Atomic Tawk</span>
                      <span>{formatDate(featuredPost.published_at)}</span>
                    </div>
                    <span className="flex items-center gap-2 text-[#CCAA4C] font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat: any, index: number) => {
            const Icon = cat.slug ? categoryIcons[cat.slug] : null;
            return (
              <button
                key={cat.slug || 'all'}
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
        {posts.length === 0 && !featuredPost ? (
          <div className="text-center py-16 text-[#AEACA1]">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-bold uppercase mb-2">No Articles Found</p>
            <p className="text-sm">Content will appear here once published from the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link 
                key={post.id}
                href={`/shows/${post.category?.slug || 'general'}/${post.slug}`}
                className="group block bg-[#252219] border-2 border-[#AEACA1]/20 hover:border-[#CCAA4C]/50 transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.thumbnail_url || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#353535]/90 text-[#CCAA4C] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      {post.category?.name || 'General'}
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
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#AEACA1]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{estimateReadTime(post.description)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {posts.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 border-2 border-[#AEACA1] text-[#E3E2D5] font-bold uppercase tracking-widest hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors">
              Load More Articles
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20">
          <NewsletterCTA source="blog-page" />
        </div>
      </div>
    </div>
  );
}
