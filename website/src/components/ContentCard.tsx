import Link from "next/link";
import Image from "next/image";

interface ContentCardProps {
  title: string;
  description?: string;
  thumbnailUrl: string;
  href: string;
  category?: string;
  refId?: string;
  isLive?: boolean;
  duration?: string;
}

export function ContentCard({
  title,
  description,
  thumbnailUrl,
  href,
  category,
  refId,
  isLive = false,
  duration,
}: ContentCardProps) {
  return (
    <Link href={href} className="group cursor-pointer block">
      <div className="border-2 border-[#AEACA1] bg-[#1f1c13] relative overflow-hidden transition-all group-hover:border-[#CCAA4C] group-hover:shadow-[0_0_15px_rgba(205,170,76,0.3)]">
        {/* Tag Top */}
        <div className="flex justify-between items-center px-3 py-1 bg-[#AEACA1]/20 border-b-2 border-[#AEACA1] group-hover:bg-[#CCAA4C]/20 group-hover:border-[#CCAA4C]">
          <span className="text-[9px] font-black tracking-tighter text-white/80">
            {refId || "REF ID: AT-000-0"}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1 text-[9px] font-black text-red-500">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              LIVE FEED
            </span>
          ) : (
            <span className="text-[9px] font-black text-[#AEACA1]">ARCHIVED DATA</span>
          )}
        </div>

        {/* Thumbnail */}
        <div className="relative aspect-video bg-black overflow-hidden">
          <div className="absolute inset-0 crt-scanline z-10 opacity-40"></div>
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-[10px] font-mono border border-[#AEACA1] text-white">
              {duration}
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="p-4 space-y-2">
          {category && (
            <p className="text-[10px] font-black text-[#CCAA4C] tracking-[0.2em] uppercase">
              {category}
            </p>
          )}
          <h3 
            className="text-lg font-black uppercase tracking-tight leading-tight text-white group-hover:text-[#CCAA4C] transition-colors"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[#E3E2D5]/80 line-clamp-2">{description}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[#AEACA1]/30">
            <span className="text-[10px] font-bold text-[#AEACA1] uppercase">
              Atomic Tawk
            </span>
            <span className="text-[10px] font-bold text-[#AEACA1]">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
