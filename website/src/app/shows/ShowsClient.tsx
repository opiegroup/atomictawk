"use client";

import { useState, useMemo } from "react";
import { ContentCard } from "@/components/ContentCard";
import { Radio } from "lucide-react";

interface ShowsClientProps {
  content: any[];
}

type FilterTab = "all" | "latest" | "featured" | "archived";

// Helper function to filter content
function filterContent(content: any[], filter: FilterTab) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  switch (filter) {
    case "latest":
      return content.filter(item => new Date(item.published_at) >= thirtyDaysAgo);
    case "featured":
      return content.filter(item => item.is_featured === true);
    case "archived":
      return content.filter(item => new Date(item.published_at) < thirtyDaysAgo);
    case "all":
    default:
      return content;
  }
}

export function ShowsClient({ content }: ShowsClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Pre-calculate counts for all tabs
  const tabCounts = useMemo(() => ({
    all: content.length,
    latest: filterContent(content, "latest").length,
    featured: filterContent(content, "featured").length,
    archived: filterContent(content, "archived").length,
  }), [content]);

  // Filter content based on active tab
  const filteredContent = useMemo(() => filterContent(content, activeTab), [content, activeTab]);

  // Map content to ContentCard format
  const displayContent = filteredContent.map((item: any) => ({
    title: item.title,
    description: item.description || item.subtitle,
    thumbnailUrl: item.thumbnail_url || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    href: `/shows/${item.category?.slug || 'general'}/${item.slug}`,
    category: item.category?.name || 'General',
    refId: item.subtitle || `AT-${item.id.slice(0,3).toUpperCase()}`,
    isLive: item.is_featured,
    duration: item.video_url ? "00:00:00" : undefined,
  }));

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All Broadcasts" },
    { id: "latest", label: "Latest Revs" },
    { id: "featured", label: "High Torque" },
    { id: "archived", label: "Archived Data" },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b-2 border-[#AEACA1] gap-8 overflow-x-auto mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 border-b-4 text-xs font-black tracking-widest whitespace-nowrap transition-colors uppercase ${
              activeTab === tab.id
                ? "border-[#CCAA4C] text-[#CCAA4C]"
                : "border-transparent text-[#AEACA1] hover:text-[#E3E2D5]"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-[10px] opacity-60">
              ({tabCounts[tab.id]})
            </span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {displayContent.length === 0 ? (
        <div className="text-center py-16 text-[#AEACA1]">
          <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-bold uppercase mb-2">No Broadcasts Found</p>
          <p className="text-sm">
            {activeTab === "all" 
              ? "Content will appear here once published from the admin panel."
              : `No content matches the "${tabs.find(t => t.id === activeTab)?.label}" filter.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {displayContent.map((item: any, index: number) => (
            <ContentCard key={`${item.refId}-${index}`} {...item} />
          ))}
        </div>
      )}

      {/* Load More */}
      {displayContent.length > 0 && (
        <div className="text-center mt-12">
          <button className="px-8 py-4 border-2 border-[#AEACA1] text-[#E3E2D5] font-bold uppercase tracking-widest hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors">
            Load More Archives
          </button>
        </div>
      )}
    </>
  );
}
