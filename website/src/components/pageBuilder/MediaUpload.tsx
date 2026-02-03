'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Film, Loader2 } from 'lucide-react'

interface MediaUploadProps {
  value: string
  onChange: (url: string) => void
  accept?: 'image' | 'video' | 'both'
  label?: string
  placeholder?: string
}

export function MediaUpload({ 
  value, 
  onChange, 
  accept = 'both',
  label = 'Media',
  placeholder = 'Upload or enter URL'
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptTypes = {
    image: 'image/jpeg,image/png,image/gif,image/webp',
    video: 'video/mp4,video/webm,video/ogg',
    both: 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg'
  }

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)

    try {
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Not authenticated')
      }

      // Check file size (max 50MB for videos, 10MB for images)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error(`File too large. Max ${file.type.startsWith('video/') ? '50MB' : '10MB'}`)
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const timestamp = Date.now()
      const folder = file.type.startsWith('video/') ? 'videos' : 'images'
      const filename = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${ext}`

      // Upload to media_library bucket
      const { data, error: uploadError } = await (supabase.storage as any)
        .from('media_library')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = (supabase.storage as any)
        .from('media_library')
        .getPublicUrl(filename)

      onChange(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const isVideo = value?.match(/\.(mp4|webm|ogg)$/i)
  const isImage = value && !isVideo

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888]">
        {label}
      </label>

      {/* Preview */}
      {value && (
        <div className="relative rounded overflow-hidden border border-[#353535]">
          {isVideo ? (
            <video 
              src={value} 
              className="w-full h-32 object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-32 object-cover"
            />
          )}
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
            {isVideo ? <Film className="w-3 h-3" /> : <Image className="w-3 h-3" />}
            {isVideo ? 'Video' : 'Image'}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-[#CCAA4C] bg-[#CCAA4C]/10' : 'border-[#353535] hover:border-[#CCAA4C]/50'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes[accept]}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 text-[#CCAA4C]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-6 h-6 mx-auto text-[#666]" />
            <p className="text-xs text-[#888]">
              Drop {accept === 'video' ? 'video' : accept === 'image' ? 'image' : 'file'} here or click to upload
            </p>
            <p className="text-[10px] text-[#555]">
              {accept === 'video' ? 'MP4, WebM (max 50MB)' : accept === 'image' ? 'JPG, PNG, GIF (max 10MB)' : 'Images or Videos'}
            </p>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:outline-none focus:border-[#CCAA4C]"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
