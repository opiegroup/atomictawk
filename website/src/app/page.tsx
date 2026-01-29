import Image from "next/image";
import Link from "next/link";
import { Settings, Headphones, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui";
import { PosterCard } from "@/components/PosterCard";
import { ContentCard } from "@/components/ContentCard";
import { TickerBar } from "@/components/TickerBar";
import { SectionHeading } from "@/components/SectionHeading";

// Placeholder image URLs - in production these would come from the database
const placeholderImages = {
  burnout: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
  shed: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  gaming: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
  tools: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
  car1: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  car2: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  engine: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#E3E2D5]">
      {/* Hero Section */}
      <section className="relative bg-[#E3E2D5] py-16 md:py-24 border-b-8 border-[#353535] overflow-hidden">
        <div className="absolute inset-0 halftone-overlay"></div>
        
        {/* Decorative Gears */}
        <Settings 
          className="absolute -bottom-10 -left-10 w-[200px] h-[200px] opacity-10 animate-spin-slow text-[#353535]" 
        />
        <Settings 
          className="absolute -top-10 -right-10 w-[150px] h-[150px] opacity-10 animate-spin-slow text-[#353535]" 
          style={{ animationDirection: "reverse" }}
        />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Atomic Tawk"
            width={400}
            height={300}
            className="mb-8 drop-shadow-2xl"
            priority
          />

          {/* Main Headline */}
          <h1 
            className="text-[#353535] text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-4 drop-shadow-md"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Tawk Loud.<br />Drive Louder.<br />Feel Prouder.
          </h1>

          {/* Subtitle */}
          <div className="bg-[#353535] text-white px-8 py-2 mb-8 inline-block skew-x-[-12deg]">
            <h2 
              className="text-lg md:text-2xl font-bold italic uppercase tracking-[0.2em] skew-x-[12deg]"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Powering the Mechanical Conversation
            </h2>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/shows">
              <Button variant="primary" size="lg">
                Start Broadcast
              </Button>
            </Link>
            <Link href="/store">
              <Button variant="outline" size="lg">
                Garage Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker Bar */}
      <TickerBar />

      {/* Featured Propaganda Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <SectionHeading title="Featured Propaganda" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <PosterCard
            title="Rubber vs. Asphalt"
            description="Kinetic energy distribution in high-friction environments."
            thumbnailUrl={placeholderImages.burnout}
            href="/shows/burnouts"
            reportNumber="Report #001"
            buttonText="Analyze Data"
          />
          <PosterCard
            title="Citizen Engineering"
            description="Manual labor and technical ingenuity for the modern era."
            thumbnailUrl={placeholderImages.shed}
            href="/shows/shed"
            reportNumber="Bulletin #102"
            buttonText="Study Blueprints"
          />
          <PosterCard
            title="Digital Fallout"
            description="Simulated survival in post-atomic landscapes."
            thumbnailUrl={placeholderImages.gaming}
            href="/shows/gaming"
            reportNumber="Log #2077"
            buttonText="Initiate Simulation"
          />
        </div>
      </section>

      {/* Bloke Science - Did You Know Section */}
      <section className="bg-[#353535] py-16 border-y-8 border-[#CCAA4C]">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeading title="Bloke Science" variant="center" dark />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="industrial-border bg-[#E3E2D5] p-8 relative">
              <div className="absolute top-4 right-4 stamp text-xs">Did You Know?</div>
              <h3 
                className="text-2xl font-black uppercase mb-4 text-[#353535] pr-24"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                The First V8 Engine
              </h3>
              <p className="font-mono text-sm text-[#353535]/80 leading-relaxed">
                The first V8 engine was patented in 1902 by Léon Levavasseur, a French inventor. 
                Originally designed for aircraft, the V8 configuration became the heart of American 
                muscle cars by the 1960s. Talk about a power upgrade.
              </p>
            </div>
            <div className="industrial-border bg-[#E3E2D5] p-8 relative">
              <div className="absolute top-4 right-4 stamp text-xs">Did You Know?</div>
              <h3 
                className="text-2xl font-black uppercase mb-4 text-[#353535] pr-24"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Burnout Physics
              </h3>
              <p className="font-mono text-sm text-[#353535]/80 leading-relaxed">
                A proper burnout can heat tyre rubber to over 200°C (392°F). The smoke you see 
                is actually vaporized rubber particles mixed with superheated air. That&apos;s science, 
                mate - just more exciting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Broadcasts Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <SectionHeading title="Latest Broadcasts" variant="right" dark />

        <div className="space-y-4">
          {/* Broadcast List Items */}
          {[
            {
              title: "The V8 Restoration: Part IV",
              date: "August 14, 2077",
              thumbnail: placeholderImages.car1,
            },
            {
              title: "Arcade Survival Tactics",
              date: "August 12, 2077",
              thumbnail: placeholderImages.gaming,
            },
            {
              title: "Shed Build: The Rust-Bucket Special",
              date: "August 10, 2077",
              thumbnail: placeholderImages.engine,
            },
          ].map((item, index) => (
            <Link 
              href="/shows" 
              key={index}
              className="flex flex-col md:flex-row items-center border-4 border-[#353535] bg-white group hover:border-[#CCAA4C] transition-colors"
            >
              <div className="w-full md:w-48 aspect-video md:aspect-square bg-[#353535] shrink-0 relative overflow-hidden">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div>
                  <div className="text-xs font-bold text-[#CCAA4C] uppercase mb-1">
                    Entry: {item.date}
                  </div>
                  <h4 
                    className="text-xl md:text-2xl font-black uppercase group-hover:text-[#CCAA4C] transition-colors"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {item.title}
                  </h4>
                </div>
                <div className="flex gap-4 text-[#353535]/50">
                  <Headphones className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer" />
                  <Share2 className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer" />
                  <Heart className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/shows">
            <Button variant="secondary" size="lg">
              Access Full Archive
            </Button>
          </Link>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="bg-[#1f1c13] py-16 border-t-8 border-[#CCAA4C]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Burnouts & Cars", href: "/shows/burnouts", icon: "🔥" },
              { title: "The Shed", href: "/shows/shed", icon: "🔧" },
              { title: "Gaming", href: "/shows/gaming", icon: "🎮" },
              { title: "Garage Store", href: "/store", icon: "🏷️" },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="border-4 border-[#AEACA1] bg-[#353535] p-6 text-center hover:border-[#CCAA4C] hover:bg-[#CCAA4C]/10 transition-all group"
              >
                <span className="text-4xl block mb-4">{cat.icon}</span>
                <span 
                  className="text-white text-lg font-black uppercase tracking-tight group-hover:text-[#CCAA4C]"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="bg-[#CCAA4C] py-12 border-y-4 border-[#353535]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p 
            className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#353535]"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            &ldquo;Civil Defence PSA for Horsepower&rdquo;
          </p>
          <p className="text-sm font-mono uppercase mt-4 text-[#353535]/70">
            Broadcasting from the Shed • Approved for Mechanical Discussion
          </p>
        </div>
      </section>
    </div>
  );
}
