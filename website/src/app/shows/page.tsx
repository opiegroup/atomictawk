import Link from "next/link";
import { ContentCard } from "@/components/ContentCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Tv, Wrench, Gamepad2, Beaker, Radio } from "lucide-react";

// Placeholder content - in production this comes from database
const categories = [
  { name: "Burnouts & Cars", slug: "burnouts", icon: Tv, count: 24 },
  { name: "The Shed", slug: "shed", icon: Wrench, count: 18 },
  { name: "Bloke Science", slug: "science", icon: Beaker, count: 12 },
  { name: "Gaming & Sim Rigs", slug: "gaming", icon: Gamepad2, count: 15 },
  { name: "Broadcasts", slug: "broadcasts", icon: Radio, count: 32 },
];

const featuredContent = [
  {
    title: "Burnout Theory: Friction & Torque Calibration",
    description: "Understanding the physics behind the perfect burnout",
    thumbnailUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    href: "/shows/burnouts/burnout-theory",
    category: "Mechanical Safety Notice",
    refId: "AT-990-2",
    isLive: true,
    duration: "12:44:09",
  },
  {
    title: "Piston Wear: Critical Tolerances in High Revs",
    description: "Deep dive into engine maintenance essentials",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    href: "/shows/shed/piston-wear",
    category: "Technical Bulletin",
    refId: "AT-812-4",
    duration: "08:15:33",
  },
  {
    title: "Bloke Science 101: The Thermodynamics of Oil",
    description: "Why your engine oil matters more than you think",
    thumbnailUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
    href: "/shows/science/thermodynamics-oil",
    category: "Procedure Log",
    refId: "AT-443-1",
    duration: "22:04:11",
  },
  {
    title: "Torque Ratio Calibration: Field Report",
    description: "Hands-on transmission testing in the wild",
    thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    href: "/shows/shed/torque-calibration",
    category: "Operational Log",
    refId: "AT-102-9",
    duration: "05:40:19",
  },
  {
    title: "High Revs Ahead: Transmission Strain Analysis",
    description: "What happens when you push it too far",
    thumbnailUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    href: "/shows/burnouts/transmission-strain",
    category: "Safety Warning",
    refId: "AT-229-5",
    duration: "31:12:00",
  },
  {
    title: "The Shed Diaries: Salvaging 1950s Gearboxes",
    description: "Bringing vintage transmissions back to life",
    thumbnailUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    href: "/shows/shed/salvaging-gearboxes",
    category: "Field Report",
    refId: "AT-606-3",
    duration: "19:22:55",
  },
];

export default function ShowsPage() {
  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Page Header */}
      <div className="p-8 border-b-2 border-[#AEACA1]/30 bg-[#252219]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-[#CCAA4C] text-sm font-bold tracking-[0.4em] uppercase">
                Frequency: 104.2 MHZ
              </p>
              <h1 
                className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#E3E2D5]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Atomic Tawk Broadcast Service
              </h1>
              <p className="text-[#E3E2D5]/70 text-lg font-medium uppercase">
                Mechanical Safety Notice: All Hands to the Track
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#AEACA1]/10 border-2 border-[#AEACA1] text-[#E3E2D5] text-xs font-bold tracking-widest hover:bg-[#AEACA1] hover:text-black transition-colors uppercase">
                <Radio className="w-4 h-4" />
                Live Feed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-r-4 border-[#AEACA1]/30 bg-[#18160f] p-6">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-[#AEACA1] mb-4 tracking-[0.3em] uppercase">
                Service Categories
              </p>
              <div className="space-y-2">
                {categories.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/shows/${cat.slug}`}
                      className={`flex items-center gap-4 p-3 transition-all ${
                        index === 0
                          ? "bg-[#CCAA4C] text-black"
                          : "text-[#E3E2D5] hover:bg-[#AEACA1]/10 border border-transparent hover:border-[#AEACA1]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${index !== 0 ? "text-[#CCAA4C]" : ""}`} />
                      <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                      <span className={`ml-auto text-xs ${index === 0 ? "opacity-60" : "text-[#AEACA1]"}`}>({cat.count})</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div>
              <p className="text-[10px] font-black text-[#AEACA1] mb-4 tracking-[0.3em] uppercase">
                System Status
              </p>
              <div className="border-2 border-[#AEACA1] p-4 space-y-3 bg-black/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#E3E2D5]">REVS / MIN</span>
                  <span className="text-xs font-mono text-[#CCAA4C]">7.4k</span>
                </div>
                <div className="h-1.5 bg-[#AEACA1]/20 w-full overflow-hidden">
                  <div className="h-full bg-[#CCAA4C] w-[74%]"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#E3E2D5]">TORQUE</span>
                  <span className="text-xs font-mono text-[#CCAA4C]">HIGH</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Tabs */}
          <div className="flex border-b-2 border-[#AEACA1] gap-8 overflow-x-auto mb-8">
            {["All Broadcasts", "Latest Revs", "High Torque", "Archived Data"].map((tab, i) => (
              <button
                key={tab}
                className={`pb-4 border-b-4 text-xs font-black tracking-widest whitespace-nowrap transition-colors uppercase ${
                  i === 0
                    ? "border-[#CCAA4C] text-[#CCAA4C]"
                    : "border-transparent text-[#AEACA1] hover:text-[#E3E2D5]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredContent.map((content) => (
              <ContentCard key={content.refId} {...content} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-4 border-2 border-[#AEACA1] text-[#E3E2D5] font-bold uppercase tracking-widest hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors">
              Load More Archives
            </button>
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t-4 border-[#AEACA1] bg-[#18160f] px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-bold tracking-widest text-[#AEACA1] uppercase">
              System Online
            </span>
          </div>
          <div className="text-[10px] font-bold tracking-widest text-[#AEACA1] uppercase border-l-2 border-[#AEACA1]/30 pl-6">
            Broadcast Frequency: Locked
          </div>
        </div>
        <p className="text-[10px] font-bold text-[#AEACA1]/50 tracking-widest uppercase text-center md:text-right">
          © 1952-20XX Atomic Tawk Media. All Rights Reserved. Mechanical Compliance Mandatory.
        </p>
      </footer>
    </div>
  );
}
