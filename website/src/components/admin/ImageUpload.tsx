"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
  folder?: string;
  showPreview?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket = "products",
  folder = "images",
  showPreview = true,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Not connected to database");

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={className}>
      {/* Preview with upload overlay */}
      {value && showPreview ? (
        <div className="relative group">
          <div className="relative w-full aspect-square max-w-[200px] bg-[#252219] border-2 border-[#AEACA1]/20 overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded"
                title="Replace image"
              >
                <Upload className="w-5 h-5" />
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-2 bg-red-500/50 hover:bg-red-500/70 text-white rounded"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* URL input below preview */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL..."
            className="mt-2 w-full bg-[#1f1c13] border border-[#AEACA1]/20 text-white text-xs px-3 py-2 focus:border-[#CCAA4C] focus:outline-none"
          />
        </div>
      ) : (
        /* Upload dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed p-6 text-center cursor-pointer transition-colors
            ${dragOver 
              ? "border-[#CCAA4C] bg-[#CCAA4C]/10" 
              : "border-[#AEACA1]/30 hover:border-[#AEACA1]/50 bg-[#1f1c13]"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#CCAA4C] animate-spin" />
              <p className="text-sm text-[#AEACA1]">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#252219] rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-[#AEACA1]" />
              </div>
              <div>
                <p className="text-sm text-white font-bold">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-[#AEACA1] mt-1">
                  JPG, PNG, GIF, WEBP up to 5MB
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
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input when no preview */}
      {!value && !showPreview && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="mt-2 w-full bg-[#1f1c13] border border-[#AEACA1]/20 text-white text-sm px-3 py-2 focus:border-[#CCAA4C] focus:outline-none"
        />
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

// Multi-image upload component
interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  bucket?: string;
  folder?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  images,
  onChange,
  bucket = "products",
  folder = "images",
  maxImages = 10,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (!files.length) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setError(null);

    console.log("[ImageUpload] Starting upload of", filesToUpload.length, "files");

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Not connected to database");
      }

      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        console.log("[ImageUpload] Processing file:", file.name, file.type, file.size);
        
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
          console.warn("[ImageUpload] Invalid file type:", file.type);
          setError(`Invalid file type: ${file.type}. Use JPG, PNG, GIF, or WEBP.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          console.warn("[ImageUpload] File too large:", file.size);
          setError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 5MB.`);
          continue;
        }

        const timestamp = Date.now();
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

        console.log("[ImageUpload] Uploading to:", bucket, filename);

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("[ImageUpload] Upload error:", uploadError);
          setError(`Upload failed: ${uploadError.message}`);
          continue;
        }

        if (data) {
          console.log("[ImageUpload] Upload success:", data.path);
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);
          console.log("[ImageUpload] Public URL:", urlData.publicUrl);
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        console.log("[ImageUpload] Adding", uploadedUrls.length, "images");
        onChange([...images, ...uploadedUrls]);
      } else {
        console.warn("[ImageUpload] No images were uploaded successfully");
      }
    } catch (err: any) {
      console.error("[ImageUpload] Upload failed:", err);
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleUpload(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onChange(newImages);
  };

  const updateImageUrl = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group bg-[#1f1c13] border border-[#AEACA1]/20"
            >
              <div className="aspect-square relative overflow-hidden">
                {img ? (
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#252219]">
                    <ImageIcon className="w-8 h-8 text-[#AEACA1]/30" />
                  </div>
                )}
                
                {/* Main badge */}
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-[#CCAA4C] text-[#353535] text-[9px] font-bold px-1.5 py-0.5">
                    MAIN
                  </span>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, "up")}
                      className="p-1.5 bg-white/20 hover:bg-white/30 text-white text-xs"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, "down")}
                      className="p-1.5 bg-white/20 hover:bg-white/30 text-white text-xs"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-red-500/50 hover:bg-red-500/70 text-white"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* URL input */}
              <input
                type="text"
                value={img}
                onChange={(e) => updateImageUrl(index, e.target.value)}
                placeholder="Image URL..."
                className="w-full bg-transparent border-t border-[#AEACA1]/20 text-white text-[10px] px-2 py-1.5 focus:outline-none focus:bg-[#252219]"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed p-6 text-center cursor-pointer transition-colors
            ${dragOver 
              ? "border-[#CCAA4C] bg-[#CCAA4C]/10" 
              : "border-[#AEACA1]/30 hover:border-[#AEACA1]/50 bg-[#1f1c13]"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-[#CCAA4C] animate-spin" />
              <span className="text-sm text-[#AEACA1]">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-[#AEACA1]" />
              <p className="text-sm text-white">
                Drop images here or <span className="text-[#CCAA4C]">click to upload</span>
              </p>
              <p className="text-xs text-[#AEACA1]">
                {images.length}/{maxImages} images • JPG, PNG, GIF, WEBP up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
