import Link from "next/link";
import { VideoPlayer, VideoCard } from "@/components/VideoPlayer";
import { Tv, Radio, Flame, Wrench, Gamepad2, Beaker, Play, Clock } from "lucide-react";

// Mock video data - in production from database
const featuredVideo = {
  youtubeId: "dQw4w9WgXcQ", // Replace with actual video IDs
  title: "Burnout Masterclass: 500HP V8 Tyre Destruction",
  description: "Watch as we put 500 horsepower through the rear wheels and turn premium rubber into clouds of smoke. Full technical breakdown included.",
  category: "Burnouts",
  date: "January 29, 2026",
  views: "24.7K",
  duration: "18:42",
};

const videoCategories = [
  { name: "All Videos", slug: "", icon: Tv, count: 89 },
  { name: "Burnouts", slug: "burnouts", icon: Flame, count: 24 },
  { name: "Shed Builds", slug: "shed", icon: Wrench, count: 31 },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, count: 18 },
  { name: "Bloke Science", slug: "science", icon: Beaker, count: 16 },
];

const latestVideos = [
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "LS Swap Bible: Everything You Need to Know",
    description: "The complete guide to dropping an LS into anything with wheels.",
    duration: "45:22",
    views: "18.2K",
    date: "2 days ago",
    href: "/tv/ls-swap-bible",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Sim Racing Setup: Budget to Beast",
    description: "Building the ultimate racing simulator on any budget.",
    duration: "32:15",
    views: "12.4K",
    date: "4 days ago",
    href: "/tv/sim-racing-setup",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "The Science of Tyre Smoke",
    description: "Why burnouts produce different colored smoke and what it means.",
    duration: "14:08",
    views: "31.5K",
    date: "1 week ago",
    href: "/tv/tyre-smoke-science",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Carburetor Rebuild: Start to Finish",
    description: "Complete teardown and rebuild of a Holley 4-barrel.",
    duration: "28:33",
    views: "8.9K",
    date: "1 week ago",
    href: "/tv/carb-rebuild",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "Workshop Tour: The Atomic Tawk Shed",
    description: "A look inside where all the magic happens.",
    duration: "22:17",
    views: "45.2K",
    date: "2 weeks ago",
    href: "/tv/workshop-tour",
  },
  {
    youtubeId: "dQw4w9WgXcQ",
    title: "First Start: Barn Find 351 Cleveland",
    description: "Will it run? 30 years of sitting and we hit the key.",
    duration: "19:44",
    views: "67.8K",
    date: "2 weeks ago",
    href: "/tv/barn-find-351",
  },
];

const liveNow = {
  youtubeId: "dQw4w9WgXcQ",
  title: "LIVE: Friday Night Garage Stream",
  viewers: "1.2K watching",
};

export default function TVPage() {
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
            
            {/* Live Indicator */}
            <div className="flex items-center gap-4">
              <Link 
                href="/tv/live"
                className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-6 py-3 transition-colors"
              >
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="font-bold uppercase tracking-widest text-sm">Live Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Featured Video */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Player */}
            <div className="lg:col-span-2">
              <VideoPlayer 
                youtubeId={featuredVideo.youtubeId} 
                title={featuredVideo.title}
              />
              <div className="bg-[#252219] border-2 border-t-0 border-[#AEACA1]/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">
                    {featuredVideo.category}
                  </span>
                  <span className="text-[#AEACA1] text-xs">{featuredVideo.views} views</span>
                  <span className="text-[#AEACA1] text-xs">•</span>
                  <span className="text-[#AEACA1] text-xs">{featuredVideo.date}</span>
                </div>
                <h2 
                  className="text-2xl font-black uppercase tracking-tight text-white mb-2"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {featuredVideo.title}
                </h2>
                <p className="text-white/80">{featuredVideo.description}</p>
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
              
              {latestVideos.slice(0, 4).map((video, i) => (
                <Link 
                  key={i}
                  href={video.href}
                  className="flex gap-3 group"
                >
                  <div className="relative w-40 shrink-0">
                    <div className="aspect-video bg-[#353535] overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] font-mono px-1">
                      {video.duration}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-1">
                      {video.title}
                    </h4>
                    <p className="text-[10px] text-[#AEACA1]">{video.views} views • {video.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 border-b-2 border-[#AEACA1]/20 pb-6">
          {videoCategories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                  index === 0
                    ? "bg-[#FF6B35] text-white"
                    : "border-2 border-[#AEACA1]/30 text-white/80 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
                <span className="text-xs opacity-60">({cat.count})</span>
              </button>
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
            {latestVideos.map((video, i) => (
              <VideoCard key={i} {...video} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-10">
            <button className="px-8 py-4 border-2 border-[#AEACA1] text-white font-bold uppercase tracking-widest hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors">
              Load More Videos
            </button>
          </div>
        </section>

        {/* Popular This Week */}
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
            {latestVideos.slice(0, 4).map((video, i) => (
              <VideoCard key={i} {...video} />
            ))}
          </div>
        </section>

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
      </div>
    </div>
  );
}
