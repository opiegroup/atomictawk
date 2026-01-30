import Image from "next/image";
import Link from "next/link";
import { Settings, Gamepad2, Trophy, Zap, Star, ShoppingBag, MessageSquare, Users, Camera, Tag, Tv, Play, Radio } from "lucide-react";
import { Button } from "@/components/ui";
import { ContentCard } from "@/components/ContentCard";
import { TickerBar } from "@/components/TickerBar";
import { SectionHeading } from "@/components/SectionHeading";
import { BlokeScienceSlider } from "@/components/BlokeScienceSlider";
import { LatestBroadcasts } from "@/components/LatestBroadcasts";
import { FeaturedContent } from "@/components/FeaturedContent";
import { PageRenderer } from "@/components/pageBuilder";
import { createClient } from "@/lib/supabase/server";
import { PageLayout } from "@/lib/pageBuilder";

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

// Try to load the home page from the database
async function getHomePage(): Promise<PageLayout | null> {
  try {
    const supabase = await createClient();
    
    // Fetch the home page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', 'home')
      .eq('status', 'published')
      .single();

    if (pageError || !page) {
      return null;
    }

    // Fetch the latest version
    const { data: version, error: versionError } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', (page as any).id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (versionError || !(version as any)?.layout) {
      return null;
    }

    return (version as any).layout as PageLayout;
  } catch (error) {
    console.error('Error loading home page:', error);
    return null;
  }
}

export default async function HomePage() {
  // Try to load the home page from the database
  const pageLayout = await getHomePage();

  // If we have a database page, render it with the page builder
  if (pageLayout) {
    return <PageRenderer layout={pageLayout} />;
  }

  // Otherwise, render the hardcoded fallback
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
              Where real blokes talk torque.
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

      {/* Play The Game, Store & Community Modules */}
      <section className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* PLAY THE GAME MODULE */}
          <div className="relative overflow-hidden border-4 border-[#FF6B35] bg-gradient-to-br from-[#353535] to-[#1f1c13]">
            {/* Decorative corner badges */}
            <div className="absolute top-0 right-0 bg-[#FF6B35] px-4 py-1">
              <span className="text-white text-xs font-black uppercase tracking-widest">Free to Play</span>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4">
                <Gamepad2 className="w-32 h-32 text-[#FF6B35]" />
              </div>
              <div className="absolute bottom-4 right-4 rotate-12">
                <Trophy className="w-24 h-24 text-[#CCAA4C]" />
              </div>
            </div>
            
            <div className="relative p-8">
              {/* Game Icon */}
              <div className="w-20 h-20 bg-[#FF6B35] flex items-center justify-center mb-6 border-4 border-[#CCAA4C]">
                <Gamepad2 className="w-10 h-10 text-white" />
              </div>
              
              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Man Cave Commander
              </h2>
              
              <p className="text-[#FF6B35] font-bold uppercase text-sm tracking-widest mb-4">
                🎮 Build • Customize • Dominate
              </p>
              
              <p className="text-white/70 text-sm mb-6 max-w-md">
                Build your ultimate man cave in 3D! Choose your room, place furniture, 
                work on projects, and compete for the highest Atomic Rating. 
                Unlock mini-games and earn bonus budget.
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { icon: "🏠", label: "4 Room Sizes" },
                  { icon: "🛋️", label: "50+ Items" },
                  { icon: "🕹️", label: "Mini-Games" },
                  { icon: "🏆", label: "Leaderboards" },
                ].map((feature) => (
                  <div 
                    key={feature.label}
                    className="flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20"
                  >
                    <span>{feature.icon}</span>
                    <span className="text-white text-xs font-bold uppercase">{feature.label}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <Link href="/game">
                <button className="group flex items-center gap-3 bg-[#FF6B35] hover:bg-[#CCAA4C] text-white hover:text-[#353535] px-8 py-4 font-black uppercase text-sm tracking-widest transition-all border-2 border-[#FF6B35] hover:border-[#CCAA4C]">
                  <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  Play Now
                  <span className="text-xs opacity-70">— It&apos;s Free!</span>
                </button>
              </Link>
            </div>
          </div>

          {/* STORE MODULE */}
          <div className="relative overflow-hidden border-4 border-[#CCAA4C] bg-gradient-to-br from-[#252219] to-[#353535]">
            {/* Decorative corner badge */}
            <div className="absolute top-0 right-0 bg-[#CCAA4C] px-4 py-1">
              <span className="text-[#353535] text-xs font-black uppercase tracking-widest">New Drops</span>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 right-8">
                <ShoppingBag className="w-28 h-28 text-[#CCAA4C]" />
              </div>
              <div className="absolute bottom-8 left-8 -rotate-12">
                <Tag className="w-24 h-24 text-[#FF6B35]" />
              </div>
            </div>
            
            <div className="relative p-8">
              {/* Store Icon */}
              <div className="w-20 h-20 bg-[#CCAA4C] flex items-center justify-center mb-6 border-4 border-[#FF6B35]">
                <ShoppingBag className="w-10 h-10 text-[#353535]" />
              </div>
              
              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Garage Store
              </h2>
              
              <p className="text-[#CCAA4C] font-bold uppercase text-sm tracking-widest mb-4">
                🏷️ Merch • Gear • Essentials
              </p>
              
              <p className="text-white/70 text-sm mb-6 max-w-md">
                Rep the brand with official Atomic Tawk merch. Tees, caps, stickers, 
                posters, and gear for the mechanically inclined. Limited drops, 
                industrial quality.
              </p>
              
              {/* Product Categories */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { icon: "👕", label: "Apparel" },
                  { icon: "🧢", label: "Caps" },
                  { icon: "🖼️", label: "Posters" },
                  { icon: "🔧", label: "Gear" },
                ].map((cat) => (
                  <div 
                    key={cat.label}
                    className="flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20"
                  >
                    <span>{cat.icon}</span>
                    <span className="text-white text-xs font-bold uppercase">{cat.label}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <Link href="/store">
                <button className="group flex items-center gap-3 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white px-8 py-4 font-black uppercase text-sm tracking-widest transition-all border-2 border-[#CCAA4C] hover:border-[#FF6B35]">
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                  <Star className="w-4 h-4 opacity-70" />
                </button>
              </Link>
            </div>
          </div>

          {/* COMMUNITY MODULE */}
          <div className="relative overflow-hidden border-4 border-[#39FF14] bg-gradient-to-br from-[#1f1c13] to-[#252219]">
            {/* Decorative corner badge */}
            <div className="absolute top-0 right-0 bg-[#39FF14] px-4 py-1">
              <span className="text-[#353535] text-xs font-black uppercase tracking-widest">Join Us</span>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 right-8">
                <Users className="w-28 h-28 text-[#39FF14]" />
              </div>
              <div className="absolute bottom-8 left-8 -rotate-12">
                <Camera className="w-24 h-24 text-[#CCAA4C]" />
              </div>
            </div>
            
            <div className="relative p-8">
              {/* Community Icon */}
              <div className="w-20 h-20 bg-[#39FF14] flex items-center justify-center mb-6 border-4 border-[#CCAA4C]">
                <MessageSquare className="w-10 h-10 text-[#353535]" />
              </div>
              
              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                The Community
              </h2>
              
              <p className="text-[#39FF14] font-bold uppercase text-sm tracking-widest mb-4">
                💬 Share • Connect • Whinge
              </p>
              
              <p className="text-white/70 text-sm mb-6 max-w-md">
                Join the conversation with fellow blockes. Share tips, get advice, 
                show off your man cave, and have a proper whinge when you need to. 
                No judgement here.
              </p>
              
              {/* Community Features */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { icon: "💡", label: "Tips" },
                  { icon: "📸", label: "Gallery" },
                  { icon: "🔧", label: "Advice" },
                  { icon: "😤", label: "Whinge" },
                ].map((feature) => (
                  <div 
                    key={feature.label}
                    className="flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20"
                  >
                    <span>{feature.icon}</span>
                    <span className="text-white text-xs font-bold uppercase">{feature.label}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <Link href="/community">
                <button className="group flex items-center gap-3 bg-[#39FF14] hover:bg-[#CCAA4C] text-[#353535] px-8 py-4 font-black uppercase text-sm tracking-widest transition-all border-2 border-[#39FF14] hover:border-[#CCAA4C]">
                  <Users className="w-5 h-5" />
                  Join Community
                  <Star className="w-4 h-4 opacity-70" />
                </button>
              </Link>
            </div>
          </div>
          
        </div>
      </section>

      {/* ATOMIC TV BANNER */}
      <section className="bg-[#353535] border-y-4 border-[#FF6B35]">
        <div className="max-w-[1400px] mx-auto">
          <Link href="/tv" className="block group">
            <div className="flex flex-col md:flex-row items-center">
              {/* Left - Icon & Branding */}
              <div className="bg-[#FF6B35] p-6 md:p-8 flex items-center gap-4 w-full md:w-auto shrink-0">
                <div className="w-16 h-16 bg-white flex items-center justify-center">
                  <Tv className="w-8 h-8 text-[#FF6B35]" />
                </div>
                <div>
                  <h2 
                    className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    Atomic TV
                  </h2>
                  <p className="text-white/80 text-xs uppercase tracking-widest">
                    Official Broadcast Network
                  </p>
                </div>
              </div>
              
              {/* Middle - Description & Features */}
              <div className="flex-grow p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <p className="text-white/70 text-sm md:text-base max-w-md text-center md:text-left">
                  Burnouts, shed builds, gaming sessions, and mechanical mayhem. 
                  Watch the latest episodes and live broadcasts.
                </p>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {[
                    { icon: "🔥", label: "Burnouts" },
                    { icon: "🔧", label: "Builds" },
                    { icon: "🎮", label: "Gaming" },
                    { icon: "📺", label: "Live" },
                  ].map((item) => (
                    <span 
                      key={item.label}
                      className="flex items-center gap-1 bg-white/10 px-3 py-1 text-white text-xs font-bold uppercase border border-white/20"
                    >
                      {item.icon} {item.label}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Right - CTA */}
              <div className="bg-[#1f1c13] p-6 md:p-8 w-full md:w-auto shrink-0 flex justify-center">
                <div className="flex items-center gap-3 bg-[#FF6B35] group-hover:bg-[#CCAA4C] text-white group-hover:text-[#353535] px-8 py-4 font-black uppercase text-sm tracking-widest transition-all">
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Propaganda Section - Dynamic from Database */}
      <FeaturedContent 
        heading="Featured Propaganda"
        headingVariant="left"
        maxItems={3}
      />

      {/* Bloke Science - Animated Slider */}
      <section className="bg-[#353535] py-16 border-y-8 border-[#CCAA4C]">
        <div className="max-w-[1400px] mx-auto px-6">
          <SectionHeading title="Bloke Science" variant="center" dark />
          <BlokeScienceSlider />
        </div>
      </section>

      {/* Latest Broadcasts Section - Dynamic from Database */}
      <LatestBroadcasts 
        heading="Latest Broadcasts"
        headingVariant="right"
        maxItems={5}
        showViewAllButton={true}
        viewAllLink="/shows"
        viewAllText="Access Full Archive"
        variant="list"
      />

      {/* Category Quick Links */}
      <section className="bg-[#1f1c13] py-16 border-t-8 border-[#CCAA4C]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            {/* BURNOUTS & CARS */}
            <Link
              href="/shows/burnouts"
              className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <img 
                  src="/images/categories/burnouts.png" 
                  alt="Burnouts & Cars" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span 
                className="text-[#1f1c13] text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Burnouts & Cars
              </span>
            </Link>

            {/* THE SHED */}
            <Link
              href="/shows/shed"
              className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <img 
                  src="/images/categories/shed.png" 
                  alt="The Shed" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span 
                className="text-[#1f1c13] text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                The Shed
              </span>
            </Link>

            {/* GAMING */}
            <Link
              href="/shows/gaming"
              className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <img 
                  src="/images/categories/gaming.png" 
                  alt="Gaming" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span 
                className="text-[#1f1c13] text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Gaming
              </span>
            </Link>

            {/* GARAGE STORE */}
            <Link
              href="/store"
              className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <img 
                  src="/images/categories/store.png" 
                  alt="Garage Store" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span 
                className="text-[#1f1c13] text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Garage Store
              </span>
            </Link>

            {/* WEAPONS */}
            <Link
              href="/shows/weapons"
              className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <img 
                  src="/images/categories/weapons.png" 
                  alt="Weapons" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span 
                className="text-[#1f1c13] text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Weapons
              </span>
            </Link>

            {/* STORAGE */}
            <Link
              href="/shows/storage"
              className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <img 
                  src="/images/categories/storage.png" 
                  alt="Storage" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span 
                className="text-[#1f1c13] text-lg font-black uppercase tracking-tight"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Storage
              </span>
            </Link>
            
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
