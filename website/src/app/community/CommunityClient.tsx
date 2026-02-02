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
  Plus,
  X,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";
import { getSupabaseClient, useAuth } from "@/lib/supabase";

interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommunityClientProps {
  initialPosts: Post[];
}

const categories = [
  { id: "all", label: "All Posts", icon: MessageSquare, color: "#CCAA4C" },
  { id: "tip", label: "Tips & Tricks", icon: Lightbulb, color: "#4ECDC4" },
  { id: "advice", label: "Advice Needed", icon: Wrench, color: "#FF6B35" },
  { id: "whinge", label: "The Whinge Corner", icon: AlertTriangle, color: "#E74C3C" },
];

export function CommunityClient({ initialPosts }: CommunityClientProps) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostType, setNewPostType] = useState<"tip" | "advice" | "whinge">("tip");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthorName, setNewPostAuthorName] = useState("");
  const [newPostAuthorEmail, setNewPostAuthorEmail] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentAuthorName, setCommentAuthorName] = useState("");

  // Create a new post
  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    const authorName = user ? (user.email?.split('@')[0] || 'Anonymous') : newPostAuthorName.trim();
    const authorEmail = user ? user.email : newPostAuthorEmail.trim();

    if (!authorName) {
      alert('Please enter your name');
      return;
    }

    if (!user && !authorEmail) {
      alert('Please enter your email');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setCreatingPost(true);
    try {
      // Create the post
      const { data: newPost, error: postError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user?.id || null,
          author_name: authorName,
          post_type: newPostType,
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          like_count: 0,
          comment_count: 0,
        })
        .select()
        .single();

      if (postError) throw postError;

      // If not logged in, save to newsletter for follow-up
      if (!user && authorEmail) {
        // Add to newsletter subscribers
        await supabase
          .from('newsletter_subscribers')
          .upsert({
            email: authorEmail,
            game_display_name: authorName,
            source: 'community_post',
            subscribed_to: ['general', 'community'],
          }, { onConflict: 'email' });
      }

      // Add to local state
      const formattedPost: Post = {
        id: newPost.id,
        type: newPost.post_type,
        title: newPost.title,
        content: newPost.content,
        author: newPost.author_name,
        likes: 0,
        comments: 0,
        createdAt: 'just now',
      };

      setPosts(prev => [formattedPost, ...prev]);

      // Reset form
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostAuthorName("");
      setNewPostAuthorEmail("");
      setShowNewPost(false);

      alert('Post created successfully!');
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('Error creating post: ' + error.message);
    } finally {
      setCreatingPost(false);
    }
  };

  // Load comments when a post is selected
  const loadComments = async (postId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoadingComments(true);
    try {
      const { data } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle selecting a post
  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setComments([]);
    loadComments(post.id);
  };

  // Post a comment
  const handlePostComment = async () => {
    if (!selectedPost || !newComment.trim()) return;
    
    const authorName = user ? (user.email?.split('@')[0] || 'Anonymous') : commentAuthorName.trim();
    if (!authorName) {
      alert('Please enter your name');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setPostingComment(true);
    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: selectedPost.id,
          user_id: user?.id || null,
          author_name: authorName,
          content: newComment.trim(),
        });

      if (error) throw error;

      // Refresh comments and update count
      await loadComments(selectedPost.id);
      await updateCommentCount(selectedPost.id);
      setNewComment("");
      setCommentAuthorName("");
    } catch (error: any) {
      console.error('Error posting comment:', error);
      alert('Error posting comment: ' + error.message);
    } finally {
      setPostingComment(false);
    }
  };

  // Format relative time for comments
  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Like a post
  const [likingPost, setLikingPost] = useState(false);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleLikePost = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent opening modal when clicking like on list
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLikingPost(true);
    try {
      // Increment like count directly (simple approach without user tracking)
      const { error } = await supabase
        .from('community_posts')
        .update({ like_count: (posts.find(p => p.id === postId)?.likes || 0) + 1 })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));

      // Update selected post if it's the one being liked
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
    } finally {
      setLikingPost(false);
    }
  };

  // Update comment count after posting
  const updateCommentCount = async (postId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Get actual count from database
      const { count } = await supabase
        .from('community_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('status', 'active');

      // Update the post's comment_count
      await supabase
        .from('community_posts')
        .update({ comment_count: count || 0 })
        .eq('id', postId);

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments: count || 0 } : p
      ));

      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, comments: count || 0 } : null);
      }
    } catch (error) {
      console.error('Error updating comment count:', error);
    }
  };

  const filteredPosts = posts.filter(p => {
    // Filter by category
    if (activeCategory !== "all" && p.type !== activeCategory) return false;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

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
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#353535]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by title, content, or author..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C] font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#353535]/40 hover:text-[#353535]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-[#353535]/60 mt-2">
            Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
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
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
        
        {/* New Post Button */}
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2 font-bold uppercase text-xs tracking-widest bg-[#CCAA4C] text-[#353535] border-2 border-[#CCAA4C] hover:bg-[#353535] hover:text-[#CCAA4C] transition-all ml-auto"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border-2 border-[#353535] p-12 text-center">
            <MessageSquare className="w-12 h-12 text-[#353535]/30 mx-auto mb-4" />
            <p className="text-[#353535]/60">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article 
              key={post.id}
              onClick={() => handleSelectPost(post)}
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
                      <button 
                        onClick={(e) => handleLikePost(post.id, e)}
                        className="flex items-center gap-1 hover:text-[#CCAA4C] transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-bold">{post.likes}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold">{post.comments} comments</span>
                      </span>
                    </div>
                </div>
              </div>
            </article>
          ))
        )}
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
              {/* Author Info (if not logged in) */}
              {!user && (
                <div className="p-4 bg-[#CCAA4C]/10 border-2 border-[#CCAA4C]">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#353535] mb-3">
                    Your Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#353535]/60 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newPostAuthorName}
                        onChange={(e) => setNewPostAuthorName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3 py-2 bg-white border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#353535]/60 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newPostAuthorEmail}
                        onChange={(e) => setNewPostAuthorEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 bg-white border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C]"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#353535]/50 mt-2">
                    We&apos;ll notify you when someone replies to your post
                  </p>
                </div>
              )}

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
                  Title *
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
                  {newPostType === "tip" ? "Share your wisdom *" : newPostType === "advice" ? "What do you need help with? *" : "Let it all out, mate *"}
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
                  onClick={handleCreatePost}
                  disabled={creatingPost || !newPostTitle.trim() || !newPostContent.trim()}
                  className="flex-1 px-6 py-3 bg-[#CCAA4C] border-2 border-[#CCAA4C] text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-[#CCAA4C] hover:border-[#353535] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creatingPost ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Post It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#E3E2D5] border-4 border-[#353535] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div 
              className="px-6 py-4 flex items-center justify-between"
              style={{ backgroundColor: getTypeColor(selectedPost.type) }}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="text-white/80 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-bold uppercase text-sm tracking-widest flex items-center gap-2">
                  {getTypeIcon(selectedPost.type)}
                  {getTypeLabel(selectedPost.type)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Post Content */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs text-[#353535]/60 mb-3">
                  <User className="w-4 h-4" />
                  <span className="font-bold">{selectedPost.author}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>{selectedPost.createdAt}</span>
                </div>
                
                <h2 
                  className="text-2xl font-black uppercase tracking-tight text-[#353535] mb-4"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {selectedPost.title}
                </h2>
                
                <p className="text-[#353535]/80 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 py-4 border-y-2 border-[#353535]/20 mb-6">
                <button 
                  onClick={() => handleLikePost(selectedPost.id)}
                  disabled={likingPost}
                  className="flex items-center gap-2 px-4 py-2 bg-[#353535] text-white font-bold text-xs uppercase hover:bg-[#CCAA4C] hover:text-[#353535] transition-colors disabled:opacity-50"
                >
                  {likingPost ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  Like ({selectedPost.likes})
                </button>
                <span className="text-sm text-[#353535]/60">
                  {selectedPost.comments} comments
                </span>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#353535] mb-4">
                  Comments ({comments.length})
                </h3>

                {/* Comment Input */}
                <div className="mb-6 p-4 bg-white border-2 border-[#353535]/20">
                  {!user && (
                    <input
                      type="text"
                      value={commentAuthorName}
                      onChange={(e) => setCommentAuthorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 bg-[#E3E2D5] border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C] mb-2"
                    />
                  )}
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#E3E2D5] border-2 border-[#353535] text-[#353535] placeholder:text-[#353535]/40 focus:outline-none focus:border-[#CCAA4C] resize-none mb-2"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={postingComment || !newComment.trim()}
                    className="px-4 py-2 bg-[#CCAA4C] text-[#353535] font-bold uppercase text-xs tracking-widest hover:bg-[#353535] hover:text-[#CCAA4C] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {postingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {loadingComments ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#353535]/40" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-[#353535]/40">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Be the first!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-white border-2 border-[#353535]/20">
                        <div className="flex items-center gap-2 text-xs text-[#353535]/60 mb-2">
                          <div className="w-8 h-8 bg-[#CCAA4C] flex items-center justify-center text-[#353535] font-bold text-sm">
                            {comment.author_name[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-bold text-[#353535]">{comment.author_name}</span>
                          <span>•</span>
                          <span>{formatCommentTime(comment.created_at)}</span>
                        </div>
                        <p className="text-[#353535]/80 text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
