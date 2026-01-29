import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "dark" | "yellow" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-[#AEACA1] text-[#353535]",
      dark: "bg-[#353535] text-white",
      yellow: "bg-[#CCAA4C] text-[#353535]",
      outline: "bg-transparent border-2 border-[#353535] text-[#353535]",
    };

    return (
      <span
        ref={ref}
        className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}
        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Stamp Badge (rotated, vintage look)
interface StampBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "approved" | "classified" | "danger" | "new";
}

export const StampBadge = forwardRef<HTMLSpanElement, StampBadgeProps>(
  ({ className = "", variant = "approved", children, ...props }, ref) => {
    const variants = {
      approved: "border-green-700 text-green-700",
      classified: "border-[#8b0000] text-[#8b0000]",
      danger: "border-red-600 text-red-600",
      new: "border-[#CCAA4C] text-[#CCAA4C]",
    };

    return (
      <span
        ref={ref}
        className={`inline-block px-4 py-1 text-sm font-black uppercase tracking-widest border-3 transform -rotate-12 bg-white/90 ${variants[variant]} ${className}`}
        style={{ fontFamily: "var(--font-oswald), sans-serif", borderWidth: "3px" }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

StampBadge.displayName = "StampBadge";
