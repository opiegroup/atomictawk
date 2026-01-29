import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "relative font-bold uppercase tracking-widest transition-all active:translate-y-1";
    
    const variants = {
      primary: "bg-[#CCAA4C] text-[#353535] border-4 border-[#353535] shadow-[4px_4px_0px_#353535] hover:bg-[#E3E2D5] active:shadow-none",
      secondary: "bg-[#353535] text-[#CCAA4C] border-4 border-[#353535] shadow-[4px_4px_0px_#CCAA4C] hover:bg-[#1f1c13] active:shadow-none",
      outline: "bg-white text-[#353535] border-4 border-[#353535] shadow-[4px_4px_0px_#353535] hover:bg-[#E3E2D5] active:shadow-none",
      danger: "bg-[#8b0000] text-white border-4 border-[#353535] shadow-[4px_4px_0px_#353535] hover:bg-[#6b0000] active:shadow-none",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-10 py-5 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        {...props}
      >
        {/* Rivets */}
        <span className="rivet top-1.5 left-1.5" />
        <span className="rivet top-1.5 right-1.5" />
        <span className="rivet bottom-1.5 left-1.5" />
        <span className="rivet bottom-1.5 right-1.5" />
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
