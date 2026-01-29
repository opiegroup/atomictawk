interface SectionHeadingProps {
  title: string;
  variant?: "left" | "right" | "center";
  dark?: boolean;
}

export function SectionHeading({ 
  title, 
  variant = "left", 
  dark = false 
}: SectionHeadingProps) {
  const bgColor = dark ? "bg-[#CCAA4C] text-[#353535]" : "bg-[#353535] text-white";
  const lineColor = dark ? "bg-[#CCAA4C]" : "bg-[#353535]";

  if (variant === "center") {
    return (
      <div className="flex items-center gap-6 mb-12">
        <div className={`flex-grow h-1 ${lineColor}`}></div>
        <h2 
          className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${bgColor} px-6 py-2`}
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {title}
        </h2>
        <div className={`flex-grow h-1 ${lineColor}`}></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-6 mb-12 ${variant === "right" ? "flex-row-reverse" : ""}`}>
      <h2 
        className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${bgColor} px-6 py-2`}
        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
      >
        {title}
      </h2>
      <div className={`flex-grow h-1 ${lineColor}`}></div>
    </div>
  );
}
