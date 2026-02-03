"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  FileQuestion,
  Link2,
  Code,
  X,
  Filter
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  bucket: string;
  folder: string;
  size: number;
  type: "image" | "video" | "document";
  createdAt: string;
  usedIn: UsageLocation[];
}

interface UsageLocation {
  type: "page" | "product" | "content" | "settings";
  name: string;
  field: string;
  id?: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "document" | "unused">("all");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buckets = ["products", "videos", "documents"];

  // Load media files from all buckets
  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Not connected");

      const allFiles: MediaFile[] = [];

      // Fetch files from each bucket
      for (const bucket of buckets) {
        try {
          const { data: bucketFiles, error: listError } = await supabase.storage
            .from(bucket)
            .list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });

          if (listError) {
            console.warn(`Error listing ${bucket}:`, listError);
            continue;
          }

          // Also list subfolders
          const folders = bucketFiles?.filter(f => !f.id) || [];
          const rootFiles = bucketFiles?.filter(f => f.id) || [];

          // Get files from root
          for (const file of rootFiles) {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
            allFiles.push({
              id: file.id || file.name,
              name: file.name,
              url: urlData.publicUrl,
              bucket,
              folder: "",
              size: file.metadata?.size || 0,
              type: getFileType(file.name),
              createdAt: file.created_at || "",
              usedIn: [],
            });
          }

          // Get files from subfolders
          for (const folder of folders) {
            const { data: folderFiles } = await supabase.storage
              .from(bucket)
              .list(folder.name, { limit: 500 });

            if (folderFiles) {
              for (const file of folderFiles) {
                if (!file.id) continue; // Skip nested folders
                const filePath = `${folder.name}/${file.name}`;
                const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
                allFiles.push({
                  id: file.id || filePath,
                  name: file.name,
                  url: urlData.publicUrl,
                  bucket,
                  folder: folder.name,
                  size: file.metadata?.size || 0,
                  type: getFileType(file.name),
                  createdAt: file.created_at || "",
                  usedIn: [],
                });
              }
            }
          }
        } catch (err) {
          console.warn(`Error processing bucket ${bucket}:`, err);
        }
      }

      setFiles(allFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a file URL or name appears in a string
  const fileMatchesContent = (file: MediaFile, content: string): boolean => {
    if (!content) return false;
    const lowerContent = content.toLowerCase();
    
    // Check full URL
    if (lowerContent.includes(file.url.toLowerCase())) return true;
    
    // Check filename
    if (lowerContent.includes(file.name.toLowerCase())) return true;
    
    // Check URL-encoded filename
    const encodedName = encodeURIComponent(file.name).toLowerCase();
    if (lowerContent.includes(encodedName)) return true;
    
    // Extract the path portion from URL and check that
    // e.g., "products/images/foo.jpg" from full supabase URL
    const pathMatch = file.url.match(/\/storage\/v1\/object\/public\/(.+)$/);
    if (pathMatch && lowerContent.includes(pathMatch[1].toLowerCase())) return true;
    
    // Check bucket/folder/filename pattern
    const bucketPath = file.folder 
      ? `${file.bucket}/${file.folder}/${file.name}`
      : `${file.bucket}/${file.name}`;
    if (lowerContent.includes(bucketPath.toLowerCase())) return true;
    
    return false;
  };

  // Scan for media usage across the database
  const scanUsage = useCallback(async () => {
    setScanning(true);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const updatedFiles = [...files];
      
      // Scan pages for media URLs
      const { data: pages } = await supabase
        .from("pages")
        .select("id, title, slug, layout");

      // Scan products for media URLs  
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, images, image_url, pdf_url");

      // Scan content for media URLs
      const { data: content } = await supabase
        .from("content")
        .select("id, title, slug, thumbnail_url, video_url");

      // Scan site_settings
      const { data: settings } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      // Build a big searchable string for each data source
      const pagesData = pages?.map(p => ({
        ...p,
        searchStr: JSON.stringify(p.layout || {})
      })) || [];
      
      const productsData = products?.map(p => ({
        ...p,
        searchStr: JSON.stringify({
          images: p.images,
          image_url: p.image_url,
          pdf_url: p.pdf_url
        })
      })) || [];
      
      const contentData = content?.map(c => ({
        ...c,
        searchStr: JSON.stringify({
          thumbnail_url: c.thumbnail_url,
          video_url: c.video_url
        })
      })) || [];
      
      const settingsStr = settings ? JSON.stringify(settings) : "";

      // Check each file for usage
      for (const file of updatedFiles) {
        file.usedIn = [];

        // Check pages
        for (const page of pagesData) {
          if (fileMatchesContent(file, page.searchStr)) {
            file.usedIn.push({
              type: "page",
              name: page.title || page.slug,
              field: "layout",
              id: page.id,
            });
          }
        }

        // Check products
        for (const product of productsData) {
          if (fileMatchesContent(file, product.searchStr)) {
            file.usedIn.push({
              type: "product",
              name: product.name,
              field: "images/pdf",
              id: product.id,
            });
          }
        }

        // Check content
        for (const item of contentData) {
          if (fileMatchesContent(file, item.searchStr)) {
            file.usedIn.push({
              type: "content",
              name: item.title,
              field: "media",
              id: item.id,
            });
          }
        }

        // Check settings
        if (fileMatchesContent(file, settingsStr)) {
          file.usedIn.push({
            type: "settings",
            name: "Site Settings",
            field: "various",
          });
        }
      }

      setFiles(updatedFiles);
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setScanning(false);
    }
  }, [files]);

  // Delete a file
  const deleteFile = async (file: MediaFile) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const filePath = file.folder ? `${file.folder}/${file.name}` : file.name;
      
      const { error } = await supabase.storage
        .from(file.bucket)
        .remove([filePath]);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== file.id));
      setDeleteConfirm(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Get file type from extension
  const getFileType = (filename: string): "image" | "video" | "document" => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["mp4", "webm", "mov", "avi"].includes(ext)) return "video";
    return "document";
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Generate embed code
  const getEmbedCode = (file: MediaFile) => {
    if (file.type === "image") {
      return `<img src="${file.url}" alt="${file.name}" />`;
    }
    if (file.type === "video") {
      return `<video src="${file.url}" controls></video>`;
    }
    return `<a href="${file.url}">${file.name}</a>`;
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    if (filter === "unused" && file.usedIn.length > 0) return false;
    if (filter !== "all" && filter !== "unused" && file.type !== filter) return false;
    if (search && !file.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Load media on mount, then auto-scan usage
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Auto-scan usage after files are loaded
  useEffect(() => {
    if (files.length > 0 && !scanning && files.every(f => f.usedIn.length === 0)) {
      // Only auto-scan once when files first load
      scanUsage();
    }
  }, [files.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-[#252219] border-b-4 border-[#CCAA4C] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-oswald)" }}>
              Media Library
            </h1>
            <p className="text-sm text-[#AEACA1]">
              {files.length} files across {buckets.length} storage buckets
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadMedia}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#353535] hover:bg-[#454545] text-white text-sm font-bold uppercase tracking-wider disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={scanUsage}
              disabled={scanning || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] hover:bg-[#b8993f] text-[#1a1a1a] text-sm font-bold uppercase tracking-wider disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${scanning ? "animate-pulse" : ""}`} />
              {scanning ? "Scanning..." : "Scan Usage"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-[#1f1c13] border-b border-[#353535]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#AEACA1]" />
            <div className="flex bg-[#252219] rounded overflow-hidden">
              {[
                { key: "all", label: "All" },
                { key: "image", label: "Images", icon: ImageIcon },
                { key: "video", label: "Videos", icon: Film },
                { key: "document", label: "Docs" },
                { key: "unused", label: "Unused", icon: AlertTriangle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                    filter === key
                      ? "bg-[#CCAA4C] text-[#1a1a1a]"
                      : "text-[#AEACA1] hover:text-white"
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEACA1]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 bg-[#252219] border border-[#353535] text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
              />
            </div>
          </div>

          <div className="text-sm text-[#AEACA1]">
            Showing {filteredFiles.length} of {files.length} files
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 mx-auto text-[#CCAA4C] animate-spin mb-4" />
            <p className="text-[#AEACA1]">Loading media...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20">
            <FileQuestion className="w-12 h-12 mx-auto text-[#AEACA1]/30 mb-4" />
            <p className="text-[#AEACA1]">No files found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`group bg-[#252219] border cursor-pointer transition-all hover:border-[#CCAA4C] ${
                  file.usedIn.length === 0 ? "border-orange-500/50" : "border-[#353535]"
                }`}
              >
                {/* Preview */}
                <div className="aspect-square bg-[#1a1a1a] relative overflow-hidden">
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : file.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <video
                        src={file.url}
                        className="max-w-full max-h-full"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Film className="w-10 h-10 text-white/80" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileQuestion className="w-10 h-10 text-[#AEACA1]/30" />
                    </div>
                  )}

                  {/* Usage badge - only show after scan */}
                  {scanning && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 font-bold uppercase animate-pulse">
                      Scanning...
                    </div>
                  )}
                  {!scanning && file.usedIn.length === 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 font-bold uppercase">
                      Unused
                    </div>
                  )}
                  {!scanning && file.usedIn.length > 0 && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] px-1.5 py-0.5 font-bold">
                      {file.usedIn.length} use{file.usedIn.length > 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Bucket badge */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 uppercase">
                    {file.bucket}
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs text-white truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-[#AEACA1]">
                      {formatSize(file.size)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url, file.id);
                      }}
                      className="text-[10px] text-[#CCAA4C] hover:text-white flex items-center gap-1"
                      title="Copy URL for Page Builder"
                    >
                      {copiedUrl === file.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copiedUrl === file.id ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#252219] max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#353535]">
              <h3 className="font-bold text-lg">{selectedFile.name}</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-[#353535] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="p-4 bg-[#1a1a1a]">
              {selectedFile.type === "image" ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-[300px] mx-auto object-contain"
                />
              ) : selectedFile.type === "video" ? (
                <video
                  src={selectedFile.url}
                  controls
                  className="max-w-full max-h-[300px] mx-auto"
                />
              ) : (
                <div className="py-10 text-center">
                  <FileQuestion className="w-16 h-16 mx-auto text-[#AEACA1]/30 mb-2" />
                  <p className="text-[#AEACA1]">Preview not available</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#AEACA1]">Bucket:</span>
                  <span className="ml-2 text-white">{selectedFile.bucket}</span>
                </div>
                <div>
                  <span className="text-[#AEACA1]">Size:</span>
                  <span className="ml-2 text-white">{formatSize(selectedFile.size)}</span>
                </div>
                <div>
                  <span className="text-[#AEACA1]">Type:</span>
                  <span className="ml-2 text-white capitalize">{selectedFile.type}</span>
                </div>
                <div>
                  <span className="text-[#AEACA1]">Folder:</span>
                  <span className="ml-2 text-white">{selectedFile.folder || "root"}</span>
                </div>
              </div>

              {/* Usage */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCAA4C] mb-2">
                  Used In ({selectedFile.usedIn.length})
                </h4>
                {selectedFile.usedIn.length === 0 ? (
                  <p className="text-sm text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    This file is not used anywhere and can be safely deleted
                  </p>
                ) : (
                  <div className="space-y-1">
                    {selectedFile.usedIn.map((usage, i) => (
                      <div key={i} className="text-sm flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#353535] text-[10px] uppercase">
                          {usage.type}
                        </span>
                        <span className="text-white">{usage.name}</span>
                        <span className="text-[#AEACA1]">({usage.field})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy URLs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCAA4C] mb-2">
                  Share & Embed
                </h4>
                <div className="space-y-3">
                  {/* Direct URL - Primary option for Page Builder */}
                  <div>
                    <p className="text-[10px] text-green-400 mb-1 font-bold">
                      ✓ USE THIS FOR PAGE BUILDER
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedFile.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-green-500/50 text-xs text-white"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedFile.url, "url")}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 flex items-center gap-1 text-xs text-white font-bold"
                      >
                        {copiedUrl === "url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy URL
                      </button>
                    </div>
                  </div>

                  {/* Markdown - for text blocks */}
                  {selectedFile.type === "image" && (
                    <div>
                      <p className="text-[10px] text-[#AEACA1] mb-1">
                        Markdown (for text blocks)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={`![${selectedFile.name}](${selectedFile.url})`}
                          readOnly
                          className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#353535] text-xs text-white font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(`![${selectedFile.name}](${selectedFile.url})`, "markdown")}
                          className="px-3 py-2 bg-[#353535] hover:bg-[#454545] flex items-center gap-1 text-xs"
                        >
                          {copiedUrl === "markdown" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HTML Embed Code - for external sites */}
                  <div>
                    <p className="text-[10px] text-[#AEACA1] mb-1">
                      HTML Embed (for external sites)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={getEmbedCode(selectedFile)}
                        readOnly
                        className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#353535] text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(getEmbedCode(selectedFile), "embed")}
                        className="px-3 py-2 bg-[#353535] hover:bg-[#454545] flex items-center gap-1 text-xs"
                      >
                        {copiedUrl === "embed" ? <Check className="w-4 h-4 text-green-400" /> : <Code className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Open in new tab */}
                  <a
                    href={selectedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#CCAA4C] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in new tab
                  </a>
                </div>
              </div>

              {/* Delete */}
              <div className="pt-4 border-t border-[#353535]">
                {deleteConfirm === selectedFile.id ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-400">Delete this file permanently?</span>
                    <button
                      onClick={() => deleteFile(selectedFile)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 bg-[#353535] text-white text-xs font-bold uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(selectedFile.id)}
                    disabled={selectedFile.usedIn.length > 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {selectedFile.usedIn.length > 0 ? "Cannot Delete (In Use)" : "Delete File"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
