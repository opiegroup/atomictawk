"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  Heart, 
  MessageSquare, 
  Upload,
  X,
  Grid,
  LayoutGrid,
  Star,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Award,
  Loader2,
  AlertTriangle,
  Shield,
  Mail,
  LogIn,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseClient, useAuth } from "@/lib/supabase";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  authorAvatar: string | null;
  images: string[];
  likes: number;
  comments: number;
  featured: boolean;
  createdAt: string;
  tags: string[];
}

interface GalleryClientProps {
  initialItems: GalleryItem[];
  stats: {
    total_items: number;
    total_likes: number;
    this_week: number;
  } | null;
}

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

// Allowed file types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

type SortOption = "popular" | "recent" | "featured";

export function GalleryClient({ initialItems, stats }: GalleryClientProps) {
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Gallery items state (for updates)
  const [items, setItems] = useState<GalleryItem[]>(initialItems);

  // Check if user has verified email
  const isEmailVerified = user?.email_confirmed_at || user?.confirmed_at;

  const filteredItems = items
    .filter(item => activeCategory === "all" || item.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0; // recent - already sorted by date
    });

  const selectedItem = selectedImage ? items.find(i => i.id === selectedImage) : null;

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");
    
    // Validate files
    const validFiles: File[] = [];
    const previews: string[] = [];
    
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`Invalid file type: ${file.name}. Only JPG, PNG, and WebP allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File too large: ${file.name}. Max 10MB allowed.`);
        continue;
      }
      if (validFiles.length >= MAX_FILES) {
        setUploadError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }
    
    setUploadFiles(prev => [...prev, ...validFiles].slice(0, MAX_FILES));
    setUploadPreviews(prev => [...prev, ...previews].slice(0, MAX_FILES));
  };

  // Remove a file from upload
  const removeFile = (index: number) => {
    URL.revokeObjectURL(uploadPreviews[index]);
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle upload submission
  const handleUpload = async () => {
    if (!user || !isEmailVerified) return;
    if (!uploadTitle.trim() || !uploadCategory || uploadFiles.length === 0) {
      setUploadError("Please fill in all required fields and add at least one photo.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setUploading(true);
    setUploadError("");

    try {
      // Upload images to Supabase Storage
      const uploadedUrls: string[] = [];
      
      for (const file of uploadFiles) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(uploadData.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Create gallery item in database
      const { data: newItem, error: dbError } = await supabase
        .from('gallery_items')
        .insert({
          user_id: user.id,
          author_name: user.email?.split('@')[0] || 'Anonymous',
          title: uploadTitle.trim(),
          description: uploadDescription.trim(),
          category: uploadCategory,
          images: uploadedUrls,
          tags: uploadTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
          like_count: 0,
          comment_count: 0,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Add to local state
      const formattedItem: GalleryItem = {
        id: newItem.id,
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        author: newItem.author_name,
        authorAvatar: null,
        images: newItem.images,
        likes: 0,
        comments: 0,
        featured: false,
        createdAt: 'just now',
        tags: newItem.tags || [],
      };

      setItems(prev => [formattedItem, ...prev]);

      // Reset form
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("");
      setUploadTags("");
      setUploadFiles([]);
      uploadPreviews.forEach(url => URL.revokeObjectURL(url));
      setUploadPreviews([]);
      setShowUpload(false);

      alert('Your cave has been shared!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle opening upload modal
  const handleOpenUpload = () => {
    setUploadError("");
    setShowUpload(true);
  };

  return (
    <>
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
            onClick={handleOpenUpload}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#353535] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Your Cave
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border-2 border-[#353535] p-12 text-center">
          <Camera className="w-12 h-12 text-[#353535]/30 mx-auto mb-4" />
          <p className="text-[#353535]/60">No caves shared yet. Be the first!</p>
        </div>
      ) : (
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
                {item.images.length > 0 ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <Camera className="w-16 h-16" />
                  </div>
                )}
                
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
      )}

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-8 py-3 bg-[#353535] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#FF6B35] transition-colors border-2 border-[#353535]">
          Load More Caves
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        <div className="bg-white border-2 border-[#353535] p-4 text-center">
          <p className="text-3xl font-black text-[#FF6B35]">{stats?.total_items?.toLocaleString() || '0'}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#353535]">Caves Shared</p>
        </div>
        <div className="bg-white border-2 border-[#353535] p-4 text-center">
          <p className="text-3xl font-black text-[#CCAA4C]">{stats?.total_likes?.toLocaleString() || '0'}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#353535]">Total Likes</p>
        </div>
        <div className="bg-white border-2 border-[#353535] p-4 text-center">
          <p className="text-3xl font-black text-[#4ECDC4]">{stats?.this_week?.toLocaleString() || '0'}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#353535]">This Week</p>
        </div>
        <div className="bg-white border-2 border-[#353535] p-4 text-center">
          <p className="text-3xl font-black text-[#E74C3C]">#1</p>
          <p className="text-[10px] uppercase tracking-widest text-[#353535]">Cave Community</p>
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
            <div className="relative aspect-video bg-[#353535] overflow-hidden">
              {selectedItem.images.length > 0 ? (
                <Image
                  src={selectedItem.images[0]}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-24 h-24 text-white/20" />
                </div>
              )}
              
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
                Flash Your Cave
              </h2>
              <button 
                onClick={() => setShowUpload(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Auth Check - Not logged in */}
              {!user && !authLoading && (
                <div className="p-6 bg-[#353535] text-white text-center">
                  <LogIn className="w-12 h-12 mx-auto mb-4 text-[#FF6B35]" />
                  <h3 className="text-xl font-black uppercase mb-2">Login Required</h3>
                  <p className="text-white/70 mb-4">
                    You need to be logged in to upload photos to the gallery.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-3 bg-[#FF6B35] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#CCAA4C] transition-colors"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              )}

              {/* Auth Check - Not verified */}
              {user && !isEmailVerified && (
                <div className="p-6 bg-[#CCAA4C]/20 border-2 border-[#CCAA4C] text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-[#CCAA4C]" />
                  <h3 className="text-xl font-black uppercase text-[#353535] mb-2">Email Verification Required</h3>
                  <p className="text-[#353535]/70 mb-4">
                    Please verify your email address before uploading photos.<br />
                    Check your inbox for the verification link.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-[#353535]/60">
                    <Shield className="w-4 h-4" />
                    <span>This helps keep our community safe</span>
                  </div>
                </div>
              )}

              {/* Upload Form - Only show if logged in AND verified */}
              {user && isEmailVerified && (
                <>
                  {/* Security Notice */}
                  <div className="p-3 bg-[#4ECDC4]/20 border-2 border-[#4ECDC4] flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#4ECDC4] shrink-0" />
                    <p className="text-xs text-[#353535]">
                      <strong>Secure Upload:</strong> Your photos are uploaded to our secure servers. 
                      Please only upload photos you have the right to share.
                    </p>
                  </div>

                  {/* Error Message */}
                  {uploadError && (
                    <div className="p-3 bg-[#E74C3C]/20 border-2 border-[#E74C3C] flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#E74C3C] shrink-0" />
                      <p className="text-sm text-[#E74C3C]">{uploadError}</p>
                    </div>
                  )}

                  {/* Upload Zone */}
                  <div 
                    className="border-4 border-dashed border-[#353535] p-8 text-center bg-white cursor-pointer hover:border-[#FF6B35] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto text-[#353535]/40 mb-4" />
                    <p className="font-bold text-[#353535] mb-2">Click to select photos</p>
                    <p className="text-[10px] text-[#353535]/40 mt-2">
                      Max {MAX_FILES} photos • JPG, PNG, WebP up to 10MB each
                    </p>
                  </div>

                  {/* Preview Images */}
                  {uploadPreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {uploadPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square bg-[#353535] overflow-hidden group">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-[#E74C3C] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                      What type of cave is it? *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.filter(c => c.id !== "all").map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setUploadCategory(cat.id)}
                          className={`p-3 border-2 text-xs font-bold uppercase transition-colors ${
                            uploadCategory === cat.id
                              ? "border-[#FF6B35] bg-[#FF6B35] text-white"
                              : "border-[#353535] bg-white text-[#353535] hover:border-[#FF6B35] hover:text-[#FF6B35]"
                          }`}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                      Give it a name *
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g., The Ultimate Shed Setup"
                      maxLength={100}
                      className="w-full px-4 py-3 bg-white border-2 border-[#353535] font-bold text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                      Tell us about your cave
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="What makes it special? How long did it take? Any tips for others?"
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 bg-white border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#FF6B35] resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#353535] mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="e.g., diy, beerfridge, workshop, rgb"
                      className="w-full px-4 py-3 bg-white border-2 border-[#353535] font-bold text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowUpload(false)}
                      disabled={uploading}
                      className="flex-1 px-6 py-3 bg-white border-2 border-[#353535] text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-white transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || !uploadTitle.trim() || !uploadCategory || uploadFiles.length === 0}
                      className="flex-1 px-6 py-3 bg-[#FF6B35] border-2 border-[#FF6B35] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:border-[#353535] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Flash It!'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
