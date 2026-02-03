import Link from "next/link";
import { 
  Video, 
  ShoppingBag, 
  Users, 
  FileText,
  Layout,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Eye,
  Minus,
  MessageSquare,
  DollarSign
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Create supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Helper to format price from cents
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// Helper to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toLocaleString();
}

// Fetch dashboard stats
async function getDashboardStats() {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      totalContent: 0,
      contentThisWeek: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      totalSubscribers: 0,
      subscribersThisMonth: 0,
      totalViews: 0,
      viewsThisWeek: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
    };
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all stats in parallel
  const [
    contentResult,
    contentWeekResult,
    productsResult,
    lowStockResult,
    subscribersResult,
    subscribersMonthResult,
    viewsResult,
    viewsWeekResult,
    ordersResult,
    pendingOrdersResult,
    revenueResult,
    monthlyRevenueResult,
  ] = await Promise.all([
    // Total content
    supabase.from('content').select('id', { count: 'exact', head: true }),
    // Content this week
    supabase.from('content').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
    // Total products
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    // Low stock products
    supabase.from('products').select('id', { count: 'exact', head: true }).lt('stock_qty', 10),
    // Total subscribers
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    // Subscribers this month
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).gte('created_at', oneMonthAgo),
    // Total views
    supabase.from('content').select('view_count'),
    // Views this week
    supabase.from('content_views').select('id', { count: 'exact', head: true }).gte('viewed_at', oneWeekAgo),
    // Total orders
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    // Pending orders
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
    // Total revenue
    supabase.from('orders').select('total').not('status', 'in', '(cancelled,refunded)'),
    // Monthly revenue
    supabase.from('orders').select('total').not('status', 'in', '(cancelled,refunded)').gte('created_at', oneMonthAgo),
  ]);

  // Calculate totals
  const totalViews = viewsResult.data?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
  const totalRevenue = revenueResult.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const monthlyRevenue = monthlyRevenueResult.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

  return {
    totalContent: contentResult.count || 0,
    contentThisWeek: contentWeekResult.count || 0,
    totalProducts: productsResult.count || 0,
    lowStockProducts: lowStockResult.count || 0,
    totalSubscribers: subscribersResult.count || 0,
    subscribersThisMonth: subscribersMonthResult.count || 0,
    totalViews,
    viewsThisWeek: viewsWeekResult.count || 0,
    totalOrders: ordersResult.count || 0,
    pendingOrders: pendingOrdersResult.count || 0,
    totalRevenue,
    monthlyRevenue,
  };
}

// Fetch recent content
async function getRecentContent() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('content')
    .select('id, title, status, content_type, created_at')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.log('Error fetching recent content:', error);
    return [];
  }

  return data || [];
}

// Fetch recent orders
async function getRecentOrders() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, name, email, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.log('Error fetching recent orders:', error);
    return [];
  }

  return data || [];
}

// Fetch pending comments
async function getPendingComments() {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('content_comments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.log('Error fetching pending comments:', error);
    return 0;
  }

  return count || 0;
}

const quickActions = [
  { label: "Manage Content", description: "Create and edit broadcasts", href: "/admin/content", icon: Video },
  { label: "Manage Products", description: "Update store inventory", href: "/admin/products", icon: ShoppingBag },
  { label: "Page Builder", description: "Drag & drop page editing", href: "/admin/pages", icon: Layout },
  { label: "Site Settings", description: "Configure global settings", href: "/admin/settings", icon: FileText },
];

export default async function AdminPage() {
  // Fetch all data in parallel
  const [stats, recentContent, recentOrders, pendingComments] = await Promise.all([
    getDashboardStats(),
    getRecentContent(),
    getRecentOrders(),
    getPendingComments(),
  ]);

  // Build stats array with real data
  const dashboardStats = [
    { 
      label: "Total Content", 
      value: formatNumber(stats.totalContent), 
      icon: Video, 
      change: stats.contentThisWeek > 0 ? `+${stats.contentThisWeek} this week` : "No new content",
      trend: stats.contentThisWeek > 0 ? 'up' : 'neutral',
      color: "text-blue-400" 
    },
    { 
      label: "Products", 
      value: formatNumber(stats.totalProducts), 
      icon: ShoppingBag, 
      change: stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : "Stock healthy",
      trend: stats.lowStockProducts > 0 ? 'down' : 'up',
      color: "text-green-400" 
    },
    { 
      label: "Subscribers", 
      value: formatNumber(stats.totalSubscribers), 
      icon: Users, 
      change: stats.subscribersThisMonth > 0 ? `+${stats.subscribersThisMonth} this month` : "No new subscribers",
      trend: stats.subscribersThisMonth > 0 ? 'up' : 'neutral',
      color: "text-purple-400" 
    },
    { 
      label: "Page Views", 
      value: formatNumber(stats.totalViews), 
      icon: Eye, 
      change: stats.viewsThisWeek > 0 ? `+${formatNumber(stats.viewsThisWeek)} this week` : "No views this week",
      trend: stats.viewsThisWeek > 0 ? 'up' : 'neutral',
      color: "text-yellow-400" 
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Welcome Header */}
      <div className="bg-[#252219] border-b-2 border-[#AEACA1]/20 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl font-black uppercase tracking-tighter text-white mb-2"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Command Center
            </h1>
            <p className="text-[#AEACA1]">
              Here&apos;s what&apos;s happening with Atomic Tawk today.
            </p>
          </div>
          <Link 
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 border-2 border-[#AEACA1]/30 text-[#AEACA1] hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Live Site
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
            const trendColor = stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-[#AEACA1]';
            
            return (
              <div 
                key={stat.label}
                className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6 hover:border-[#CCAA4C]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded flex items-center justify-center bg-[#1f1c13]`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{stat.change}</span>
                  </div>
                </div>
                <p 
                  className="text-4xl font-black text-white mb-1"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-[#CCAA4C]/20">
                <DollarSign className="w-5 h-5 text-[#CCAA4C]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Monthly Revenue</p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  {formatPrice(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>
          <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-[#CCAA4C]/20">
                <ShoppingBag className="w-5 h-5 text-[#CCAA4C]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Pending Orders</p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  {stats.pendingOrders}
                </p>
              </div>
            </div>
          </div>
          <div className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-[#CCAA4C]/20">
                <MessageSquare className="w-5 h-5 text-[#CCAA4C]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#AEACA1]">Pending Comments</p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  {pendingComments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 
            className="text-xl font-black uppercase tracking-tighter text-[#CCAA4C] mb-6"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group border-2 border-[#AEACA1]/20 bg-[#252219] p-6 hover:border-[#CCAA4C] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#CCAA4C]/20 flex items-center justify-center group-hover:bg-[#CCAA4C] transition-colors">
                      <Icon className="w-6 h-6 text-[#CCAA4C] group-hover:text-[#353535]" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#AEACA1] group-hover:text-[#CCAA4C] transition-colors" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{action.label}</h3>
                  <p className="text-sm text-[#AEACA1]">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Content */}
          <div className="border-2 border-[#AEACA1]/20 bg-[#252219]">
            <div className="flex items-center justify-between p-6 border-b border-[#AEACA1]/20">
              <h3 
                className="text-lg font-black uppercase tracking-tighter text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Recent Content
              </h3>
              <Link 
                href="/admin/content"
                className="text-xs font-bold uppercase tracking-widest text-[#CCAA4C] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {recentContent.length > 0 ? (
                recentContent.map((item) => (
                  <Link 
                    key={item.id}
                    href={`/admin/content?edit=${item.id}`}
                    className="flex items-center justify-between p-4 bg-[#1f1c13] border border-[#AEACA1]/10 hover:border-[#CCAA4C]/30 transition-colors cursor-pointer block"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {item.content_type === "video" ? "🎬" : 
                         item.content_type === "broadcast" ? "📻" :
                         item.content_type === "podcast" ? "🎙️" : "📄"}
                      </span>
                      <span className="text-sm font-bold text-white truncate max-w-[200px]">{item.title}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                      item.status === "published" 
                        ? "bg-green-500/20 text-green-400" 
                        : item.status === "archived"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {item.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-[#AEACA1]">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No content yet</p>
                  <Link href="/admin/content" className="text-[#CCAA4C] text-sm hover:underline mt-2 inline-block">
                    Create your first content →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="border-2 border-[#AEACA1]/20 bg-[#252219]">
            <div className="flex items-center justify-between p-6 border-b border-[#AEACA1]/20">
              <h3 
                className="text-lg font-black uppercase tracking-tighter text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Recent Orders
              </h3>
              <Link 
                href="/admin/products"
                className="text-xs font-bold uppercase tracking-widest text-[#CCAA4C] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <Link 
                    key={order.id}
                    href={`/admin/products?tab=orders&order=${order.id}`}
                    className="flex items-center justify-between p-4 bg-[#1f1c13] border border-[#AEACA1]/10 hover:border-[#CCAA4C]/30 transition-colors cursor-pointer block"
                  >
                    <div>
                      <span className="text-xs font-mono text-[#CCAA4C]">{order.order_number}</span>
                      <p className="text-sm font-bold text-white">{order.name || order.email?.split('@')[0]}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{formatPrice(order.total)}</span>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        order.status === "shipped" || order.status === "delivered" ? "text-green-400" :
                        order.status === "processing" || order.status === "paid" ? "text-blue-400" : 
                        order.status === "cancelled" || order.status === "refunded" ? "text-red-400" :
                        "text-yellow-400"
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-[#AEACA1]">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                  <p className="text-xs opacity-60 mt-1">Orders will appear here when customers purchase</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
