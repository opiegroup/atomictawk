"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Film, Play } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export function VideoUpload({
  value,
  onChange,
  bucket = "videos",
  folder = "content",
  maxSizeMB = 100,
  label = "Video",
  className = "",
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileName = (url: string) => {
    if (!url) return "";
    try {
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      // Decode and clean up the filename
      return decodeURIComponent(filename).replace(/^\d+-/, '').substring(0, 40);
    } catch {
      return "Video file";
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    console.log("[VideoUpload] Processing file:", file.name, file.type, file.size);

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a video file (MP4, WebM, MOV, AVI)");
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Video must be less than ${maxSizeMB}MB. This file is ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Not connected to database");

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const safeName = file.name
        .toLowerCase()
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 30);
      const filename = `${folder}/${timestamp}-${safeName}.${ext}`;

      console.log("[VideoUpload] Uploading to:", bucket, filename);

      // Simulate progress (Supabase doesn't give real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error("[VideoUpload] Upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      setUploadProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log("[VideoUpload] Success:", urlData.publicUrl);
      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("[VideoUpload] Upload failed:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleClear = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={className}>
      {/* Show uploaded video */}
      {value ? (
        <div className="bg-[#1f1c13] border border-[#AEACA1]/20 overflow-hidden">
          {/* Video preview */}
          <div className="relative aspect-video bg-black">
            <video
              src={value}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
            />
          </div>
          
          {/* File info and actions */}
          <div className="p-3 border-t border-[#AEACA1]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 flex items-center justify-center flex-shrink-0 rounded">
                <Film className="w-4 h-4 text-purple-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{getFileName(value)}</p>
                <p className="text-[10px] text-[#AEACA1] truncate">{value}</p>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="p-1.5 text-[#AEACA1] hover:text-white hover:bg-white/10 transition-colors rounded"
                  title="Replace video"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Upload dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`
            border-2 border-dashed p-8 text-center cursor-pointer transition-colors
            ${dragOver 
              ? "border-purple-400 bg-purple-400/10" 
              : "border-[#AEACA1]/30 hover:border-[#AEACA1]/50 bg-[#1f1c13]"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              <div className="w-full max-w-xs">
                <div className="h-2 bg-[#252219] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-[#AEACA1] mt-2">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-[#252219] rounded-full flex items-center justify-center">
                <Film className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white font-bold">
                  Drop {label} here or <span className="text-purple-400">click to upload</span>
                </p>
                <p className="text-xs text-[#AEACA1] mt-1">
                  MP4, WebM, MOV up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input - always show for pasting URLs */}
      <div className="mt-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste video URL..."
          className="w-full bg-[#1f1c13] border border-[#AEACA1]/20 text-white text-xs px-3 py-2 focus:border-purple-400 focus:outline-none"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
