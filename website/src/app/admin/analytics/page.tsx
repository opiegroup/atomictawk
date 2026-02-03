"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Globe, 
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Settings,
  RefreshCw
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// Initialize Supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}

interface ContentStats {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  content_type: string;
}

interface DailyViews {
  date: string;
  count: number;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [topContent, setTopContent] = useState<ContentStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [viewsChange, setViewsChange] = useState(0);
  const [dailyViews, setDailyViews] = useState<DailyViews[]>([]);
  const [gaConfigured, setGaConfigured] = useState(false);

  useEffect(() => {
    // Check if GA is configured
    setGaConfigured(!!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const prevStartDate = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Fetch top content by views
      const { data: contentData } = await supabase
        .from('content')
        .select('id, title, slug, view_count, content_type')
        .order('view_count', { ascending: false })
        .limit(10);

      if (contentData) {
        setTopContent(contentData);
        setTotalViews(contentData.reduce((sum, item) => sum + (item.view_count || 0), 0));
      }

      // Fetch current period views
      const { count: currentViews } = await supabase
        .from('content_views')
        .select('id', { count: 'exact', head: true })
        .gte('viewed_at', startDate);

      // Fetch previous period views for comparison
      const { count: prevViews } = await supabase
        .from('content_views')
        .select('id', { count: 'exact', head: true })
        .gte('viewed_at', prevStartDate)
        .lt('viewed_at', startDate);

      if (currentViews && prevViews && prevViews > 0) {
        setViewsChange(Math.round(((currentViews - prevViews) / prevViews) * 100));
      }

      // Fetch daily views for chart
      const { data: viewsData } = await supabase
        .from('content_views')
        .select('viewed_at')
        .gte('viewed_at', startDate)
        .order('viewed_at', { ascending: true });

      if (viewsData) {
        // Group by date
        const grouped: Record<string, number> = {};
        viewsData.forEach((view) => {
          const date = new Date(view.viewed_at).toISOString().split('T')[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });

        const dailyData = Object.entries(grouped).map(([date, count]) => ({
          date,
          count,
        }));
        setDailyViews(dailyData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }

    setIsLoading(false);
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data }: { data: DailyViews[] }) => {
    if (data.length === 0) return null;
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    return (
      <div className="flex items-end gap-1 h-32">
        {data.slice(-14).map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-[#CCAA4C] rounded-t transition-all hover:bg-[#FF6B35]"
              style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: item.count > 0 ? '4px' : '0' }}
              title={`${item.date}: ${item.count} views`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 
            className="text-3xl font-black uppercase tracking-tighter text-white mb-2"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Analytics
          </h1>
          <p className="text-[#AEACA1]">
            Track your site performance and visitor insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex border-2 border-[#AEACA1]/20">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  timeRange === range 
                    ? 'bg-[#CCAA4C] text-[#353535]' 
                    : 'text-[#AEACA1] hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={loadAnalytics}
            className="p-2 border-2 border-[#AEACA1]/20 text-[#AEACA1] hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* GA4 Setup Notice */}
      {!gaConfigured && (
        <div className="bg-[#CCAA4C]/10 border-2 border-[#CCAA4C] p-6 mb-8">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-[#CCAA4C] mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Google Analytics Not Configured</h3>
              <p className="text-[#AEACA1] text-sm mb-4">
                Add your GA4 Measurement ID to enable full analytics tracking. The data below is from your internal content views.
              </p>
              <div className="bg-[#1f1c13] p-4 rounded font-mono text-sm text-[#AEACA1] mb-4">
                <p className="text-[#CCAA4C] mb-2"># Add to your .env.local file:</p>
                <p>NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX</p>
              </div>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#CCAA4C] hover:underline text-sm font-bold"
              >
                Get your GA4 Measurement ID
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Page Views */}
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-[#1f1c13]">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <div className={`flex items-center gap-1 ${viewsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {viewsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="text-sm font-bold">{Math.abs(viewsChange)}%</span>
            </div>
          </div>
          <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
            {totalViews.toLocaleString()}
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Total Page Views</p>
        </div>

        {/* Unique Content */}
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-[#1f1c13]">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
            {topContent.length}
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Content Pieces</p>
        </div>

        {/* Avg Views Per Content */}
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-[#1f1c13]">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
            {topContent.length > 0 ? Math.round(totalViews / topContent.length).toLocaleString() : 0}
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Avg Views/Content</p>
        </div>

        {/* Views This Period */}
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-[#1f1c13]">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
            {dailyViews.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Views ({timeRange})</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Views Over Time */}
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-6" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
            Views Over Time
          </h3>
          {dailyViews.length > 0 ? (
            <SimpleBarChart data={dailyViews} />
          ) : (
            <div className="h-32 flex items-center justify-center text-[#AEACA1]">
              <p>No view data for this period</p>
            </div>
          )}
          <div className="flex justify-between mt-4 text-[10px] text-[#AEACA1] uppercase tracking-widest">
            <span>{dailyViews[0]?.date || '-'}</span>
            <span>{dailyViews[dailyViews.length - 1]?.date || '-'}</span>
          </div>
        </div>

        {/* Top Content */}
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-6" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
            Top Content
          </h3>
          <div className="space-y-3">
            {topContent.slice(0, 5).map((content, i) => (
              <div key={content.id} className="flex items-center gap-4">
                <span className="w-6 h-6 flex items-center justify-center bg-[#CCAA4C]/20 text-[#CCAA4C] text-xs font-bold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{content.title}</p>
                  <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">{content.content_type}</p>
                </div>
                <span className="text-sm font-bold text-[#CCAA4C]">
                  {content.view_count.toLocaleString()}
                </span>
              </div>
            ))}
            {topContent.length === 0 && (
              <p className="text-[#AEACA1] text-center py-4">No content data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* GA4 Embed Section */}
      {gaConfigured && (
        <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tighter text-white" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
              Google Analytics Reports
            </h3>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#CCAA4C] hover:underline text-sm font-bold"
            >
              Open Full Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-[#AEACA1] text-sm mb-4">
            For detailed analytics including real-time users, traffic sources, user demographics, and behavior flow, 
            visit your Google Analytics dashboard directly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://analytics.google.com/analytics/web/#/report/visitors-overview"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#AEACA1]/20 p-4 hover:border-[#CCAA4C] transition-colors group"
            >
              <Users className="w-8 h-8 text-[#AEACA1] group-hover:text-[#CCAA4C] mb-2" />
              <p className="font-bold text-white">Audience Overview</p>
              <p className="text-xs text-[#AEACA1]">Demographics, interests, geo</p>
            </a>
            <a
              href="https://analytics.google.com/analytics/web/#/report/trafficsources-overview"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#AEACA1]/20 p-4 hover:border-[#CCAA4C] transition-colors group"
            >
              <Globe className="w-8 h-8 text-[#AEACA1] group-hover:text-[#CCAA4C] mb-2" />
              <p className="font-bold text-white">Acquisition</p>
              <p className="text-xs text-[#AEACA1]">Traffic sources, campaigns</p>
            </a>
            <a
              href="https://analytics.google.com/analytics/web/#/report/content-overview"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#AEACA1]/20 p-4 hover:border-[#CCAA4C] transition-colors group"
            >
              <BarChart3 className="w-8 h-8 text-[#AEACA1] group-hover:text-[#CCAA4C] mb-2" />
              <p className="font-bold text-white">Behavior</p>
              <p className="text-xs text-[#AEACA1]">Pages, events, site speed</p>
            </a>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-8 border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-4" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
          Analytics Setup Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-[#CCAA4C] mb-2">1. Create GA4 Property</h4>
            <ol className="list-decimal list-inside text-sm text-[#AEACA1] space-y-1">
              <li>Go to <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#CCAA4C] hover:underline">Google Analytics</a></li>
              <li>Click Admin → Create Property</li>
              <li>Follow the setup wizard</li>
              <li>Get your Measurement ID (G-XXXXXXXXXX)</li>
            </ol>
          </div>
          <div>
            <h4 className="font-bold text-[#CCAA4C] mb-2">2. Add to Environment</h4>
            <div className="bg-[#1f1c13] p-3 rounded font-mono text-xs text-[#AEACA1]">
              <p className="text-green-400"># .env.local</p>
              <p>NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX</p>
            </div>
            <p className="text-xs text-[#AEACA1] mt-2">Restart your dev server after adding.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
