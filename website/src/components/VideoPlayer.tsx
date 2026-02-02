"use client";

import { useState } from "react";
import { Play, Volume2, VolumeX, Maximize, Settings } from "lucide-react";

interface VideoPlayerProps {
  youtubeId: string;
  title?: string;
  autoplay?: boolean;
}

export function VideoPlayer({ youtubeId, title, autoplay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);

  return (
    <div className="relative bg-black border-4 border-[#353535] overflow-hidden group">
      {/* CRT Frame Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 border-[12px] border-black/50 rounded-sm"></div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 crt-scanline opacity-30"></div>
      
      {/* Video Container */}
      <div className="relative aspect-video">
        {!isPlaying ? (
          // Thumbnail with play button
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to hqdefault if maxres doesn't exist
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
              }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-[#FF6B35] rounded-full flex items-center justify-center hover:scale-110 hover:bg-[#CCAA4C] transition-all shadow-2xl">
                <Play className="w-10 h-10 text-white ml-2" fill="white" />
              </div>
            </div>

            {/* Title Overlay */}
            {title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <h3 
                  className="text-2xl font-black uppercase tracking-tight text-white"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {title}
                </h3>
              </div>
            )}
          </div>
        ) : (
          // YouTube Embed
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>

      {/* Bottom Control Bar (decorative when not playing) */}
      {!isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t-2 border-[#353535] px-4 py-2 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[#FF6B35]">
              <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Ready</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[#AEACA1]">
            <Volume2 className="w-4 h-4" />
            <Settings className="w-4 h-4" />
            <Maximize className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}

// Compact video card for listings
interface VideoCardProps {
  youtubeId?: string;
  title: string;
  description?: string;
  duration?: string;
  views?: string;
  date?: string;
  href: string;
  isLive?: boolean;
  thumbnailUrl?: string; // Custom thumbnail for non-YouTube videos
}

export function VideoCard({ 
  youtubeId, 
  title, 
  description, 
  duration, 
  views, 
  date,
  href,
  isLive,
  thumbnailUrl
}: VideoCardProps) {
  // Determine thumbnail source
  const thumbnail = thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

  return (
    <a href={href} className="group block">
      <div className="bg-[#252219] border-2 border-[#AEACA1]/20 hover:border-[#FF6B35] transition-all overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-[#AEACA1]/30" />
            </div>
          )}
          
          {/* CRT Effect */}
          <div className="absolute inset-0 crt-scanline opacity-20 pointer-events-none"></div>
          
          {/* Duration Badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs font-mono px-2 py-1">
              {duration}
            </div>
          )}
          
          {/* Live Badge */}
          {isLive && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Live
            </div>
          )}

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 bg-[#FF6B35] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 
            className="font-bold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-2"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-white/70 line-clamp-2 mb-3">{description}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-[#AEACA1] uppercase tracking-widest">
            {views && <span>{views} views</span>}
            {views && date && <span>•</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
      </div>
    </a>
  );
}
