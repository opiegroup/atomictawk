import { ContentCard } from "@/components/ContentCard";
import { SectionHeading } from "@/components/SectionHeading";
import { notFound } from "next/navigation";

// Category configuration
const categories: Record<string, { title: string; description: string; tagline: string }> = {
  burnouts: {
    title: "Burnouts & Cars",
    description: "High-friction environments and kinetic energy distribution studies.",
    tagline: "Where rubber meets asphalt - and loses.",
  },
  shed: {
    title: "The Shed",
    description: "Manual labor and technical ingenuity for the modern era.",
    tagline: "Every great build starts with a rusty idea.",
  },
  gaming: {
    title: "Gaming & Sim Rigs",
    description: "Simulated survival in post-atomic landscapes and virtual racing.",
    tagline: "If you can't drive it, simulate it.",
  },
  science: {
    title: "Bloke Science",
    description: "Did you know? Facts and trivia for the mechanically curious.",
    tagline: "Making physics fun since forever.",
  },
  broadcasts: {
    title: "Atomic Tawk Broadcasts",
    description: "Official transmissions from the Atomic Tawk headquarters.",
    tagline: "Broadcasting from the shed since 1955.",
  },
};

// Mock content for each category
const categoryContent: Record<string, Array<{
  title: string;
  description: string;
  thumbnailUrl: string;
  refId: string;
  duration: string;
  category: string;
}>> = {
  burnouts: [
    {
      title: "Burnout Theory: Friction & Torque Calibration",
      description: "Understanding the physics behind the perfect burnout",
      thumbnailUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      refId: "AT-990-2",
      duration: "12:44:09",
      category: "Mechanical Safety Notice",
    },
    {
      title: "High Revs Ahead: Transmission Strain Analysis",
      description: "What happens when you push it too far",
      thumbnailUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
      refId: "AT-229-5",
      duration: "31:12:00",
      category: "Safety Warning",
    },
    {
      title: "Tyre Selection for Maximum Smoke",
      description: "The science of rubber composition and burnout performance",
      thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
      refId: "AT-445-7",
      duration: "18:33:22",
      category: "Technical Bulletin",
    },
  ],
  shed: [
    {
      title: "Piston Wear: Critical Tolerances in High Revs",
      description: "Deep dive into engine maintenance essentials",
      thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      refId: "AT-812-4",
      duration: "08:15:33",
      category: "Technical Bulletin",
    },
    {
      title: "The Shed Diaries: Salvaging 1950s Gearboxes",
      description: "Bringing vintage transmissions back to life",
      thumbnailUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
      refId: "AT-606-3",
      duration: "19:22:55",
      category: "Field Report",
    },
    {
      title: "Tool Storage Solutions: Maximum Efficiency",
      description: "Organizing your workspace for optimal productivity",
      thumbnailUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
      refId: "AT-777-1",
      duration: "14:05:12",
      category: "Procedure Log",
    },
  ],
  gaming: [
    {
      title: "Sim Rig Build: The Ultimate Racing Setup",
      description: "Building a competition-grade racing simulator",
      thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
      refId: "AT-2077-1",
      duration: "45:22:11",
      category: "Build Log",
    },
    {
      title: "Arcade Survival Tactics",
      description: "Classic gaming strategies for the modern era",
      thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
      refId: "AT-2077-2",
      duration: "22:15:00",
      category: "Gaming Guide",
    },
  ],
  science: [
    {
      title: "Bloke Science 101: The Thermodynamics of Oil",
      description: "Why your engine oil matters more than you think",
      thumbnailUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
      refId: "AT-443-1",
      duration: "22:04:11",
      category: "Procedure Log",
    },
  ],
  broadcasts: [
    {
      title: "Weekly Transmission #47: The State of the Shed",
      description: "This week's updates from Atomic Tawk HQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      refId: "AT-LIVE-47",
      duration: "01:22:45",
      category: "Live Broadcast",
    },
  ],
};

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  
  if (!categories[category]) {
    notFound();
  }

  const categoryInfo = categories[category];
  const content = categoryContent[category] || [];

  return (
    <div className="min-h-screen bg-[#1f1c13]">
      {/* Category Header */}
      <div className="bg-[#CCAA4C] border-b-8 border-[#353535] py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 halftone-overlay opacity-20"></div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#353535] text-[#CCAA4C] px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
              Section Active
            </span>
            <span className="text-[#353535] text-xs font-bold uppercase tracking-widest border-l-2 border-[#353535]/20 pl-4">
              Category: {category.toUpperCase()}
            </span>
          </div>
          <h1 
            className="text-4xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter text-[#353535] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {categoryInfo.title}
          </h1>
          <p className="text-lg md:text-xl font-bold text-[#353535]/80 max-w-2xl">
            {categoryInfo.description}
          </p>
          <p className="text-sm font-mono text-[#353535]/60 mt-4 italic">
            &ldquo;{categoryInfo.tagline}&rdquo;
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.map((item) => (
            <ContentCard
              key={item.refId}
              title={item.title}
              description={item.description}
              thumbnailUrl={item.thumbnailUrl}
              href={`/shows/${category}/${item.refId.toLowerCase()}`}
              category={item.category}
              refId={item.refId}
              duration={item.duration}
            />
          ))}
        </div>

        {content.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#AEACA1] text-xl uppercase tracking-widest">
              No broadcasts available in this category yet.
            </p>
            <p className="text-[#AEACA1]/60 text-sm mt-2">
              Check back soon for new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({
    category,
  }));
}
