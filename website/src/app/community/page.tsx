"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  Lightbulb, 
  Wrench, 
  AlertTriangle,
  ThumbsUp,
  Send,
  User,
  Clock,
  Filter,
  Plus,
  X,
  ChevronDown,
  Camera,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

// Mock data for demo - would come from database
const mockPosts = [
  {
    id: "1",
    type: "tip",
    title: "Best way to organize your shed tools",
    content: "Mate, get yourself some pegboard and outline where each tool goes with a marker. You'll never lose your 10mm socket again... well, you still will, but at least you'll know where it SHOULD be.",
    author: "ShedMaster69",
    likes: 42,
    comments: 12,
    createdAt: "2 hours ago",
  },
  {
    id: "2", 
    type: "whinge",
    title: "Council won't let me build a second shed",
    content: "Bloody council knocked back my DA for a second shed. Said one 6x4 is enough for any man. ENOUGH?! Do they not understand the sacred need for a dedicated beer fridge shed?",
    author: "DeniedDave",
    likes: 156,
    comments: 48,
    createdAt: "4 hours ago",
  },
  {
    id: "3",
    type: "tip",
    title: "How to keep the missus happy while spending weekends in the cave",
    content: "Pro tip: Install a nice coffee machine in the man cave. Bring her a flat white every couple hours. She thinks you're being thoughtful, you get uninterrupted tinkering time. Win-win.",
    author: "CaveDiplomacy",
    likes: 89,
    comments: 34,
    createdAt: "6 hours ago",
  },
  {
    id: "4",
    type: "advice",
    title: "Best budget mini fridge for the garage?",
    content: "Looking for recommendations on a small bar fridge that won't chew through power. Needs to keep at least 12 tinnies cold. What are you blokes running?",
    author: "ThirstyTrev",
    likes: 23,
    comments: 67,
    createdAt: "1 day ago",
  },
  {
    id: "5",
    type: "whinge",
    title: "Kids keep 'borrowing' my tools",
    content: "Third time this month I've found my good screwdrivers being used to dig in the garden. Installed a lock on the shed, now the wife says I'm being 'dramatic'. AM I?!",
    author: "ToolDad",
    likes: 203,
    comments: 89,
    createdAt: "1 day ago",
  },
  {
    id: "6",
    type: "tip",
    title: "DIY soundproofing for your man cave",
    content: "Egg cartons don't actually work that well, learned that the hard way. Get some proper acoustic foam panels from Bunnings. Your neighbors (and family) will thank you when you're watching the footy at full volume.",
    author: "QuietBloke",
    likes: 67,
    comments: 21,
    createdAt: "2 days ago",
  },
];

const categories = [
  { id: "all", label: "All Posts", icon: MessageSquare, color: "#CCAA4C" },
  { id: "tip", label: "Tips & Tricks", icon: Lightbulb, color: "#4ECDC4" },
  { id: "advice", label: "Advice Needed", icon: Wrench, color: "#FF6B35" },
  { id: "whinge", label: "The Whinge Corner", icon: AlertTriangle, color: "#E74C3C" },
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostType, setNewPostType] = useState<"tip" | "advice" | "whinge">("tip");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const filteredPosts = activeCategory === "all" 
    ? mockPosts 
    : mockPosts.filter(p => p.type === activeCategory);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tip": return <Lightbulb className="w-4 h-4" />;
      case "advice": return <Wrench className="w-4 h-4" />;
      case "whinge": return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tip": return "#4ECDC4";
      case "advice": return "#FF6B35";
      case "whinge": return "#E74C3C";
      default: return "#CCAA4C";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "tip": return "TIP";
      case "advice": return "ADVICE";
      case "whinge": return "WHINGE";
      default: return "POST";
    }
  };

  return (
    <div className="bg-[#E3E2D5]">
      
      {/* Hero Banner */}
      <div className="bg-[#353535] py-12 border-b-4 border-[#CCAA4C]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#CCAA4C] flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-[#353535]" />
            </div>
            <div>
              <h1 
                className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                The Community
              </h1>
              <p className="text-[#AEACA1] text-sm uppercase tracking-widest">
                Where Blockes Share, Learn & Have a Good Whinge
              </p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            Welcome to the Atomic Tawk community hub. Share your man cave tips, ask for advice,
            or just have a proper whinge about whatever's grinding your gears. No judgement here, mate.
          </p>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs tracking-widest border-2 transition-all ${
                  activeCategory === cat.id
                    ? "text-white border-current"
                    : "bg-white text-[#353535] border-[#353535] hover:border-current"
                }`}
                style={{ 
                  backgroundColor: activeCategory === cat.id ? cat.color : undefined,
                  borderColor: activeCategory === cat.id ? cat.color : undefined,
                  color: activeCategory !== cat.id ? cat.color : undefined
                }}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
            
            {/* New Post Button */}
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs tracking-widest bg-[#CCAA4C] text-[#353535] border-2 border-[#CCAA4C] hover:bg-[#353535] hover:text-[#CCAA4C] transition-all ml-auto"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#CCAA4C]">1,247</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Total Posts</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#4ECDC4]">3,891</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Cave Dwellers</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#FF6B35]">892</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Tips Shared</p>
            </div>
            <div className="bg-white border-2 border-[#353535] p-4 text-center">
              <p className="text-3xl font-black text-[#E74C3C]">456</p>
              <p className="text-[10px] uppercase tracking-widest text-[#353535]">Whinges Today</p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article 
                key={post.id}
                className="bg-white border-2 border-[#353535] hover:border-[#CCAA4C] transition-colors group cursor-pointer"
              >
                <div className="flex">
                  {/* Type Indicator */}
                  <div 
                    className="w-2 shrink-0"
                    style={{ backgroundColor: getTypeColor(post.type) }}
                  />
                  
                  <div className="flex-grow p-4 md:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span 
                          className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1"
                          style={{ backgroundColor: getTypeColor(post.type) }}
                        >
                          {getTypeIcon(post.type)}
                          {getTypeLabel(post.type)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#353535]/60">
                          <User className="w-3 h-3" />
                          <span className="font-bold">{post.author}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{post.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 
                      className="text-xl font-black uppercase tracking-tight text-[#353535] mb-2 group-hover:text-[#CCAA4C] transition-colors"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-[#353535]/80 text-sm leading-relaxed mb-4">
                      {post.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-6 text-xs text-[#353535]/60">
                      <button className="flex items-center gap-1 hover:text-[#CCAA4C] transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-bold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-[#CCAA4C] transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold">{post.comments} comments</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-[#353535] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#CCAA4C] hover:text-[#353535] transition-colors border-2 border-[#353535]">
              Load More Posts
            </button>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#E3E2D5] border-4 border-[#353535] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#353535] px-6 py-4 flex items-center justify-between">
              <h2 
                className="text-2xl font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Create New Post
              </h2>
              <button 
                onClick={() => setShowNewPost(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  What kind of post?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "tip", label: "Tip / Trick", icon: Lightbulb, color: "#4ECDC4" },
                    { id: "advice", label: "Need Advice", icon: Wrench, color: "#FF6B35" },
                    { id: "whinge", label: "Have a Whinge", icon: AlertTriangle, color: "#E74C3C" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewPostType(type.id as "tip" | "advice" | "whinge")}
                      className={`p-4 border-2 flex flex-col items-center gap-2 transition-all ${
                        newPostType === type.id
                          ? "border-current text-white"
                          : "bg-white border-[#353535] text-[#353535]"
                      }`}
                      style={{ 
                        backgroundColor: newPostType === type.id ? type.color : undefined,
                        borderColor: newPostType === type.id ? type.color : undefined
                      }}
                    >
                      <type.icon className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Give it a catchy title..."
                  className="w-full px-4 py-3 bg-white border-2 border-[#353535] font-bold text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                  {newPostType === "tip" ? "Share your wisdom" : newPostType === "advice" ? "What do you need help with?" : "Let it all out, mate"}
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={
                    newPostType === "tip" 
                      ? "What's your top tip? Don't hold back..."
                      : newPostType === "advice"
                      ? "Describe your situation. The community's got your back..."
                      : "Go on, have a proper whinge. We're all ears..."
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C] resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#353535] text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-[#CCAA4C] border-2 border-[#CCAA4C] text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-[#CCAA4C] hover:border-[#353535] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flash Your Cave Banner */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#CCAA4C] py-6 border-y-4 border-[#353535]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white flex items-center justify-center shrink-0">
                <Camera className="w-7 h-7 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white">📸 Flash Your Man Cave</h3>
                <p className="text-white/80 text-sm">Share photos of your setup and get inspired by others</p>
              </div>
            </div>
            <Link
              href="/community/gallery"
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-white transition-colors shrink-0"
            >
              View Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Whinge of the Day Banner */}
      <div className="bg-[#E74C3C] py-4 border-y-4 border-[#353535]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <span className="px-3 py-1 bg-white text-[#E74C3C] font-black text-xs uppercase">
                🏆 Whinge of the Day
              </span>
            </div>
            <p className="text-white font-bold text-sm truncate">
              "Council won't let me build a second shed" — DeniedDave got 156 likes for his righteous anger
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
