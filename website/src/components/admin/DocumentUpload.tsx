"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, Download } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface DocumentUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export function DocumentUpload({
  value,
  onChange,
  bucket = "documents",
  folder = "pdfs",
  accept = ".pdf",
  maxSizeMB = 10,
  label = "PDF Document",
  className = "",
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileName = (url: string) => {
    if (!url) return "";
    try {
      const parts = url.split("/");
      return parts[parts.length - 1];
    } catch {
      return url;
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    console.log("[DocumentUpload] Processing file:", file.name, file.type, file.size);

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    
    if (!isPDF && !validTypes.includes(file.type)) {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Not connected to database");

      // Generate unique filename
      const timestamp = Date.now();
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-")
        .replace(/-+/g, "-");
      const filename = `${folder}/${timestamp}-${safeName}`;

      console.log("[DocumentUpload] Uploading to:", bucket, filename);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[DocumentUpload] Upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log("[DocumentUpload] Success:", urlData.publicUrl);
      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("[DocumentUpload] Upload failed:", err);
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

  const handleClear = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={className}>
      {/* Show uploaded file */}
      {value ? (
        <div className="bg-[#1f1c13] border border-[#AEACA1]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{getFileName(value)}</p>
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#CCAA4C] hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download / Preview
              </a>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 text-[#AEACA1] hover:text-white hover:bg-white/10 transition-colors"
                title="Replace file"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* URL input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste document URL..."
            className="mt-3 w-full bg-[#252219] border border-[#AEACA1]/20 text-white text-xs px-3 py-2 focus:border-[#CCAA4C] focus:outline-none"
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
            border-2 border-dashed p-6 text-center cursor-pointer transition-colors
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
                <FileText className="w-6 h-6 text-[#AEACA1]" />
              </div>
              <div>
                <p className="text-sm text-white font-bold">
                  Drop {label} here or click to upload
                </p>
                <p className="text-xs text-[#AEACA1] mt-1">
                  PDF up to {maxSizeMB}MB
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
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input when no file */}
      {!value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste document URL..."
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
