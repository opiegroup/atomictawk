import Link from "next/link";
import Image from "next/image";

interface PosterCardProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  href: string;
  reportNumber?: string;
  buttonText?: string;
}

export function PosterCard({
  title,
  description,
  thumbnailUrl,
  href,
  reportNumber = "Report #001",
  buttonText = "Analyze Data",
}: PosterCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="industrial-border-sm relative overflow-hidden bg-[#CCAA4C] p-1">
        <div className="bg-[#E3E2D5] p-6 h-full flex flex-col border-2 border-[#353535]">
          {/* Report Number */}
          <div className="absolute top-0 right-0 bg-[#353535] text-white px-3 py-1 text-xs font-bold uppercase z-10">
            {reportNumber}
          </div>

          {/* Image */}
          <div className="w-full aspect-[4/5] bg-[#353535] mb-6 relative overflow-hidden">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
            />
            <div className="absolute inset-0 halftone-overlay"></div>
          </div>

          {/* Title */}
          <h3 
            className="text-2xl md:text-3xl font-black uppercase leading-none mb-2 text-[#353535]"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm font-bold text-[#353535]/70 uppercase mb-6 italic tracking-tight">
            {description}
          </p>

          {/* Button */}
          <div className="mt-auto">
            <span className="block w-full bg-[#353535] text-[#CCAA4C] py-3 font-bold uppercase tracking-widest text-center text-sm group-hover:bg-[#CCAA4C] group-hover:text-[#353535] transition-colors">
              {buttonText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
