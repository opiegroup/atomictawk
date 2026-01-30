"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaUpload } from "@/components/pageBuilder/MediaUpload";
import { 
  X, Save, Video, FileText, Plus, Search, Eye, EyeOff, 
  Trash2, Edit, LayoutGrid, Loader2, Calendar, Tag
} from "lucide-react";
import { useAuth, useRole, getSupabaseClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  body: string;
  thumbnail_url: string;
  video_url: string;
  category_id: string | null;
  content_type: "video" | "article" | "broadcast" | "podcast";
  status: "draft" | "published" | "archived" | "scheduled";
  scheduled_for: string | null;
  tags: string[];
  is_featured: boolean;
  allow_comments: boolean;
  seo_title: string;
  seo_description: string;
  use_page_builder: boolean;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

const contentTypes = [
  { value: "video", label: "📺 Video", icon: Video },
  { value: "article", label: "📝 Article", icon: FileText },
  { value: "broadcast", label: "📻 Broadcast", icon: Video },
  { value: "podcast", label: "🎙️ Podcast", icon: Video },
];

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-500" },
  { value: "published", label: "Published", color: "bg-green-500" },
  { value: "scheduled", label: "Scheduled", color: "bg-blue-500" },
  { value: "archived", label: "Archived", color: "bg-red-500" },
];

export default function ContentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  // Auth check
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, router]);

  // Load data
  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoading(true);
    try {
      // Load categories
      const { data: cats } = await (supabase as any)
        .from('categories')
        .select('*')
        .order('sort_order');
      setCategories(cats || []);

      // Load content
      const { data: contentData } = await (supabase as any)
        .from('content')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });
      setContent(contentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    try {
      const itemData = {
        title: editingItem.title,
        slug: editingItem.slug || generateSlug(editingItem.title),
        subtitle: editingItem.subtitle,
        description: editingItem.description,
        body: editingItem.body,
        thumbnail_url: editingItem.thumbnail_url,
        video_url: editingItem.video_url,
        category_id: editingItem.category_id || null,
        content_type: editingItem.content_type,
        status: editingItem.status,
        scheduled_for: editingItem.scheduled_for,
        tags: editingItem.tags || [],
        is_featured: editingItem.is_featured,
        allow_comments: editingItem.allow_comments,
        seo_title: editingItem.seo_title,
        seo_description: editingItem.seo_description,
        use_page_builder: editingItem.use_page_builder,
        published_at: editingItem.status === 'published' ? new Date().toISOString() : null,
      };

      if (isCreating) {
        const { error } = await (supabase as any)
          .from('content')
          .insert({ ...itemData, author_id: user?.id });
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('content')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
      }

      await loadData();
      setEditingItem(null);
      setIsCreating(false);
    } catch (error: any) {
      console.error('Error saving:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content? This cannot be undone.')) return;
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await (supabase as any).from('content').delete().eq('id', id);
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const createNew = () => {
    setIsCreating(true);
    setEditingItem({
      id: '',
      title: '',
      slug: '',
      subtitle: '',
      description: '',
      body: '',
      thumbnail_url: '',
      video_url: '',
      category_id: null,
      content_type: 'article',
      status: 'draft',
      scheduled_for: null,
      tags: [],
      is_featured: false,
      allow_comments: true,
      seo_title: '',
      seo_description: '',
      use_page_builder: false,
      view_count: 0,
      comment_count: 0,
      created_at: '',
      updated_at: '',
    });
  };

  // Filter content
  const filteredContent = content.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory && item.category_id !== filterCategory) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterType && item.content_type !== filterType) return false;
    return true;
  });

  if (authLoading || roleLoading || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCAA4C]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#CCAA4C]" />
            Content Manager
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Manage broadcasts, articles, and videos
          </p>
        </div>
        <button
          onClick={createNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm tracking-wider hover:bg-[#CCAA4C]/80"
        >
          <Plus className="w-4 h-4" />
          New Content
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#252525] border-2 border-[#353535] rounded p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
          >
            <option value="">All Types</option>
            {contentTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
        <div className="p-4 border-b border-[#353535] flex items-center justify-between">
          <span className="text-sm text-[#888]">{filteredContent.length} items</span>
        </div>

        {filteredContent.length === 0 ? (
          <div className="p-12 text-center text-[#666]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No content found</p>
            <button onClick={createNew} className="mt-4 text-[#CCAA4C] hover:underline">
              Create your first content
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#353535]">
            {filteredContent.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-[#2a2a2a]">
                {/* Thumbnail */}
                <div className="w-24 h-16 bg-[#1a1a1a] rounded overflow-hidden shrink-0">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666]">
                      {item.content_type === 'video' ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      statusOptions.find(s => s.value === item.status)?.color || 'bg-gray-500'
                    } text-white`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-[#666]">
                      {item.category?.icon} {item.category?.name || 'Uncategorized'}
                    </span>
                    {item.is_featured && (
                      <span className="text-xs text-[#CCAA4C]">⭐ Featured</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white truncate">{item.title}</h3>
                  <p className="text-xs text-[#888] truncate">{item.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-[#666]">
                    <span>👁 {item.view_count} views</span>
                    <span>💬 {item.comment_count} comments</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setEditingItem(item); setIsCreating(false); }}
                    className="p-2 text-[#CCAA4C] hover:bg-[#353535] rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-[#666] hover:text-red-500 hover:bg-[#353535] rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-[#252525] border-4 border-[#CCAA4C] rounded max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#353535] flex items-center justify-between sticky top-0 bg-[#252525] z-10">
              <h2 className="font-bold text-white text-lg">
                {isCreating ? 'Create New Content' : 'Edit Content'}
              </h2>
              <button
                onClick={() => { setEditingItem(null); setIsCreating(false); }}
                className="p-2 text-[#666] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Title *</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    placeholder="Content title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    placeholder="url-friendly-slug"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={editingItem.subtitle}
                    onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    placeholder="Optional subtitle"
                  />
                </div>
              </div>

              {/* Category, Type, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Category</label>
                  <select
                    value={editingItem.category_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Type</label>
                  <select
                    value={editingItem.content_type}
                    onChange={(e) => setEditingItem({ ...editingItem, content_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  >
                    {contentTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none resize-none"
                  placeholder="Brief description for listings"
                />
              </div>

              {/* Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MediaUpload
                  label="Thumbnail Image"
                  value={editingItem.thumbnail_url}
                  onChange={(url) => setEditingItem({ ...editingItem, thumbnail_url: url })}
                  accept="image"
                  placeholder="Upload or paste image URL"
                />

                {(editingItem.content_type === 'video' || editingItem.content_type === 'broadcast') && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Video URL</label>
                    <input
                      type="text"
                      value={editingItem.video_url}
                      onChange={(e) => setEditingItem({ ...editingItem, video_url: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="YouTube, Vimeo, or direct video URL"
                    />
                  </div>
                )}
              </div>

              {/* Body Content - Rich Text Editor */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                  Content Body
                </label>
                <RichTextEditor
                  value={editingItem.body}
                  onChange={(html) => setEditingItem({ ...editingItem, body: html })}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={(editingItem.tags || []).join(', ')}
                  onChange={(e) => setEditingItem({ 
                    ...editingItem, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  placeholder="burnouts, cars, diy"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-[#CCAA4C]"
                  />
                  <span className="text-sm text-white">⭐ Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.allow_comments}
                    onChange={(e) => setEditingItem({ ...editingItem, allow_comments: e.target.checked })}
                    className="w-4 h-4 accent-[#CCAA4C]"
                  />
                  <span className="text-sm text-white">💬 Allow Comments</span>
                </label>
              </div>

              {/* SEO */}
              <div className="p-4 bg-[#1a1a1a] rounded border border-[#353535]">
                <h3 className="text-sm font-bold text-[#CCAA4C] uppercase mb-3">SEO Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={editingItem.seo_title}
                      onChange={(e) => setEditingItem({ ...editingItem, seo_title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#252525] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="Override page title for SEO"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">SEO Description</label>
                    <textarea
                      value={editingItem.seo_description}
                      onChange={(e) => setEditingItem({ ...editingItem, seo_description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-[#252525] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none resize-none"
                      placeholder="Meta description for search engines"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#353535] flex justify-end gap-3 sticky bottom-0 bg-[#252525]">
              <button
                onClick={() => { setEditingItem(null); setIsCreating(false); }}
                className="px-4 py-2 text-[#888] hover:text-white font-bold uppercase text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingItem.title}
                className="flex items-center gap-2 px-6 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm hover:bg-[#CCAA4C]/80 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isCreating ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
