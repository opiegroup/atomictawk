"use client";

import { useState } from "react";
import { 
  Camera, 
  Heart, 
  MessageSquare, 
  Trophy,
  Upload,
  X,
  Filter,
  Grid,
  LayoutGrid,
  Star,
  Flame,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Award
} from "lucide-react";
import Link from "next/link";

// Categories for man caves
const categories = [
  { id: "all", label: "All Caves", emoji: "🏠" },
  { id: "shed", label: "Sheds", emoji: "🛖" },
  { id: "garage", label: "Garages", emoji: "🚗" },
  { id: "basement", label: "Basements", emoji: "🪜" },
  { id: "workshop", label: "Workshops", emoji: "🔧" },
  { id: "gaming", label: "Gaming Dens", emoji: "🎮" },
  { id: "bar", label: "Home Bars", emoji: "🍺" },
  { id: "theater", label: "Home Theaters", emoji: "🎬" },
  { id: "outdoor", label: "Outdoor Setups", emoji: "🌳" },
];

// Mock gallery data
const mockGalleryItems = [
  {
    id: "1",
    title: "The Ultimate Shed Setup",
    description: "5 years in the making. Custom pegboard, beer fridge, and the missus is NOT allowed.",
    category: "shed",
    author: "ShedKing42",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 342,
    comments: 67,
    featured: true,
    createdAt: "2 hours ago",
    tags: ["pegboard", "beerfridge", "workshop"],
  },
  {
    id: "2",
    title: "Garage Cinema & Gaming Zone",
    description: "Converted half the double garage. 120 inch screen, surround sound, and a PS5. Worth every argument with the wife.",
    category: "garage",
    author: "GamerDad",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 289,
    comments: 45,
    featured: true,
    createdAt: "5 hours ago",
    tags: ["projector", "gaming", "surround"],
  },
  {
    id: "3",
    title: "Backyard Bar Paradise",
    description: "Built it myself from recycled pallets. Got 8 taps on rotation. Neighbors hate me (jealousy).",
    category: "bar",
    author: "BrewMaster",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 567,
    comments: 123,
    featured: true,
    createdAt: "1 day ago",
    tags: ["bar", "homebrew", "pallets", "diy"],
  },
  {
    id: "4",
    title: "The Workshop That Never Sleeps",
    description: "CNC machine, 3D printer, welding station, and a coffee machine. Sometimes I sleep here. Don't tell anyone.",
    category: "workshop",
    author: "MakerMike",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 234,
    comments: 56,
    featured: false,
    createdAt: "1 day ago",
    tags: ["cnc", "3dprinting", "welding"],
  },
  {
    id: "5",
    title: "Basement Battle Station",
    description: "Triple monitor setup, racing sim rig, and enough RGB to land a plane. Yes, my electricity bill is criminal.",
    category: "gaming",
    author: "RGBRick",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 445,
    comments: 89,
    featured: false,
    createdAt: "2 days ago",
    tags: ["rgb", "simrig", "battlestation"],
  },
  {
    id: "6",
    title: "Converted Shipping Container",
    description: "Bought a 20ft container, insulated it, and now it's my private retreat. Climate controlled and soundproof.",
    category: "outdoor",
    author: "ContainerKev",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 678,
    comments: 156,
    featured: true,
    createdAt: "3 days ago",
    tags: ["container", "conversion", "diy"],
  },
  {
    id: "7",
    title: "Mini Basement Theater",
    description: "7.2.4 Dolby Atmos, 4K laser projector, recliners from an old cinema. Movie night is now a religion.",
    category: "theater",
    author: "CinemaSteve",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 512,
    comments: 98,
    featured: false,
    createdAt: "3 days ago",
    tags: ["atmos", "4k", "recliners"],
  },
  {
    id: "8",
    title: "Shed-to-Pub Transformation",
    description: "What started as a garden shed is now a fully licensed micro-pub. Council approved and everything!",
    category: "shed",
    author: "PubLandlord",
    authorAvatar: null,
    images: ["/api/placeholder/800/600"],
    likes: 891,
    comments: 234,
    featured: true,
    createdAt: "4 days ago",
    tags: ["pub", "licensed", "conversion"],
  },
];

type SortOption = "popular" | "recent" | "featured";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");

  const filteredItems = mockGalleryItems
    .filter(item => activeCategory === "all" || item.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0; // recent - would use date comparison
    });

  const selectedItem = selectedImage ? mockGalleryItems.find(i => i.id === selectedImage) : null;

  return (
    <div className="bg-[#E3E2D5]">
      
      {/* Hero Banner */}
      <div className="bg-[#353535] py-12 border-b-4 border-[#FF6B35]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#FF6B35] flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 
                className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Flash Your Man Cave
              </h1>
              <p className="text-[#AEACA1] text-sm uppercase tracking-widest">
                Show Off Your Sacred Space • Get Inspired • Earn Bragging Rights
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/community" className="hover:text-[#FF6B35]">Community</Link>
            <span>/</span>
            <span className="text-[#FF6B35]">Gallery</span>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Top Bar - Categories Scroll */}
          <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs tracking-widest border-2 transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                      : "bg-white text-[#353535] border-[#353535] hover:border-[#FF6B35] hover:text-[#FF6B35]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white border-2 border-[#353535]">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-[#353535]/60">Sort:</span>
              {[
                { id: "popular", label: "Most Liked", icon: Heart },
                { id: "recent", label: "Recent", icon: Clock },
                { id: "featured", label: "Featured", icon: Star },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as SortOption)}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase transition-colors ${
                    sortBy === option.id
                      ? "bg-[#353535] text-white"
                      : "text-[#353535] hover:bg-[#353535]/10"
                  }`}
                >
                  <option.icon className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>

            {/* View Mode & Upload */}
            <div className="flex items-center gap-3">
              <div className="flex border-2 border-[#353535]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-[#353535] text-white" : "text-[#353535]"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("large")}
                  className={`p-2 border-l-2 border-[#353535] ${viewMode === "large" ? "bg-[#353535] text-white" : "text-[#353535]"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#353535] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Your Cave
              </button>
            </div>
          </div>

          {/* Featured Banner */}
          {activeCategory === "all" && sortBy !== "featured" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#CCAA4C] to-[#FF6B35] border-2 border-[#353535]">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white font-black uppercase text-sm">Cave of the Week</p>
                  <p className="text-white/80 text-xs">
                    "{mockGalleryItems.find(i => i.featured)?.title}" by {mockGalleryItems.find(i => i.featured)?.author} — {mockGalleryItems.find(i => i.featured)?.likes} likes!
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-white text-[#353535] font-bold text-xs uppercase hover:bg-[#353535] hover:text-white transition-colors">
                  View
                </button>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
            {filteredItems.map((item) => (
              <article 
                key={item.id}
                onClick={() => setSelectedImage(item.id)}
                className={`group cursor-pointer bg-white border-2 border-[#353535] hover:border-[#FF6B35] transition-all overflow-hidden ${
                  item.featured ? "ring-2 ring-[#CCAA4C] ring-offset-2" : ""
                }`}
              >
                {/* Image */}
                <div className={`relative bg-[#353535] ${viewMode === "grid" ? "aspect-square" : "aspect-video"}`}>
                  {/* Placeholder - would be actual image */}
                  <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <Camera className="w-16 h-16" />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-[#353535]/80 text-white text-[10px] font-bold uppercase">
                      {categories.find(c => c.id === item.category)?.emoji} {categories.find(c => c.id === item.category)?.label}
                    </span>
                  </div>
                  
                  {/* Featured Badge */}
                  {item.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-[#CCAA4C] text-[#353535] text-[10px] font-bold uppercase flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-[#FF6B35] text-white font-bold text-xs uppercase">
                      View Gallery
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 
                    className={`font-black uppercase tracking-tight text-[#353535] group-hover:text-[#FF6B35] transition-colors line-clamp-1 ${
                      viewMode === "grid" ? "text-sm" : "text-lg"
                    }`}
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  
                  {viewMode === "large" && (
                    <p className="text-[#353535]/70 text-sm mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between mt-2 text-[10px] text-[#353535]/60">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-bold">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-[#353535] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#FF6B35] transition-colors border-2 border-[#353535]">
              Load More Caves
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#FF6B35]">2,847</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Caves Shared</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#CCAA4C]">156K</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Total Likes</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#4ECDC4]">892</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">This Week</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#E74C3C]">#1</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Cave Community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="max-w-4xl w-full bg-[#252219] border-4 border-[#353535]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Area */}
            <div className="relative aspect-video bg-[#353535] flex items-center justify-center">
              <Camera className="w-24 h-24 text-white/20" />
              
              {/* Nav Arrows */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-[#FF6B35]">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-[#FF6B35]">
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Featured Badge */}
              {selectedItem.featured && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#CCAA4C] text-[#353535] text-xs font-bold uppercase flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Featured Cave
                  </span>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="px-2 py-1 bg-[#FF6B35] text-white text-[10px] font-bold uppercase mb-2 inline-block">
                    {categories.find(c => c.id === selectedItem.category)?.emoji} {categories.find(c => c.id === selectedItem.category)?.label}
                  </span>
                  <h2 
                    className="text-2xl font-black uppercase tracking-tight text-white"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {selectedItem.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#E74C3C] text-white font-bold text-xs uppercase hover:bg-[#FF6B35]">
                    <Heart className="w-4 h-4" />
                    {selectedItem.likes}
                  </button>
                </div>
              </div>
              
              <p className="text-white/80 mb-4">
                {selectedItem.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[#353535] text-white/60 text-[10px] font-bold uppercase">
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Author & Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#CCAA4C] flex items-center justify-center text-[#353535] font-bold">
                    {selectedItem.author[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedItem.author}</p>
                    <p className="text-white/40 text-xs">{selectedItem.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {selectedItem.comments} comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#E3E2D5] border-4 border-[#353535] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#FF6B35] px-6 py-4 flex items-center justify-between">
              <h2 
                className="text-2xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                📸 Flash Your Cave
              </h2>
              <button 
                onClick={() => setShowUpload(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Upload Zone */}
              <div className="border-4 border-dashed border-[#353535] p-8 text-center bg-white">
                <Upload className="w-12 h-12 mx-auto text-[#353535]/40 mb-4" />
                <p className="font-bold text-[#353535] mb-2">Drag & drop your photos here</p>
                <p className="text-sm text-[#353535]/60 mb-4">or</p>
                <button className="px-6 py-2 bg-[#FF6B35] text-white font-bold uppercase text-xs">
                  Browse Files
                </button>
                <p className="text-[10px] text-[#353535]/40 mt-4">
                  Max 10 photos • JPG, PNG up to 10MB each
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  What type of cave is it?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.filter(c => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      className="p-3 border-2 border-[#353535] bg-white text-[#353535] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors text-xs font-bold uppercase"
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  Give it a name
                </label>
                <input
                  type="text"
                  placeholder="e.g., The Ultimate Shed Setup"
                  className="w-full px-4 py-3 bg-white border-2 border-[#353535] font-bold text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  Tell us about your cave
                </label>
                <textarea
                  placeholder="What makes it special? How long did it take? Any tips for others?"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#FF6B35] resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  Tags (help others find your cave)
                </label>
                <input
                  type="text"
                  placeholder="e.g., diy, beerfridge, workshop, rgb"
                  className="w-full px-4 py-3 bg-white border-2 border-[#353535] font-bold text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#353535] text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-[#FF6B35] border-2 border-[#FF6B35] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:border-[#353535] transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Flash It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
