import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "yellow";
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", hover = false, children, ...props }, ref) => {
    const baseStyles = "relative industrial-border overflow-hidden";
    
    const variants = {
      default: "bg-white",
      dark: "bg-[#353535] text-white",
      yellow: "bg-[#CCAA4C]",
    };

    const hoverStyles = hover 
      ? "transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#353535] cursor-pointer" 
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {/* Corner rivets */}
        <span className="rivet top-3 left-3 z-10" />
        <span className="rivet top-3 right-3 z-10" />
        <span className="rivet bottom-3 left-3 z-10" />
        <span className="rivet bottom-3 right-3 z-10" />
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  tag?: string;
  status?: "live" | "archived" | "new";
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", tag, status, children, ...props }, ref) => {
    const statusColors = {
      live: "text-red-500",
      archived: "text-[#AEACA1]",
      new: "text-[#CCAA4C]",
    };

    return (
      <div
        ref={ref}
        className={`flex justify-between items-center px-4 py-2 bg-[#AEACA1]/20 border-b-2 border-[#353535] ${className}`}
        {...props}
      >
        {tag && (
          <span className="text-[9px] font-black tracking-tighter uppercase">
            {tag}
          </span>
        )}
        {status && (
          <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${statusColors[status]}`}>
            {status === "live" && (
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            )}
            {status === "live" ? "LIVE FEED" : status === "new" ? "NEW" : "ARCHIVED"}
          </span>
        )}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card Body
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-6 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = "CardBody";
