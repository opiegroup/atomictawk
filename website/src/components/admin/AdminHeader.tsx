import { Plus, Search, Filter } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function AdminHeader({
  title,
  subtitle,
  onAddNew,
  addNewLabel = "Add New",
  showSearch = false,
  onSearch,
}: AdminHeaderProps) {
  return (
    <div className="bg-[#252219] border-b-2 border-[#AEACA1]/20 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 
            className="text-3xl font-black uppercase tracking-tighter text-white"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#AEACA1] mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="flex items-center bg-[#1f1c13] border-2 border-[#AEACA1]/30 px-4 py-2">
              <Search className="w-4 h-4 text-[#AEACA1]" />
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => onSearch?.(e.target.value)}
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-white ml-2 w-48 placeholder:text-[#AEACA1]/50"
              />
            </div>
          )}
          
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 bg-[#CCAA4C] text-[#353535] px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#E3E2D5] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {addNewLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
