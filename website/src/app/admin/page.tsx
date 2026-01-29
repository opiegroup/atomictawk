import Link from "next/link";
import { 
  Video, 
  ShoppingBag, 
  Users, 
  FileText,
  Layout,
  ArrowRight,
  TrendingUp,
  Eye
} from "lucide-react";

const stats = [
  { label: "Total Content", value: "47", icon: Video, change: "+3 this week", color: "text-blue-400" },
  { label: "Products", value: "12", icon: ShoppingBag, change: "2 low stock", color: "text-green-400" },
  { label: "Subscribers", value: "1,247", icon: Users, change: "+89 this month", color: "text-purple-400" },
  { label: "Page Views", value: "12.4k", icon: Eye, change: "+23% this week", color: "text-yellow-400" },
];

const quickActions = [
  { label: "Manage Content", description: "Create and edit broadcasts", href: "/admin/content", icon: Video },
  { label: "Manage Products", description: "Update store inventory", href: "/admin/products", icon: ShoppingBag },
  { label: "Page Builder", description: "Drag & drop page editing", href: "/admin/pages", icon: Layout },
  { label: "View Orders", description: "Process customer orders", href: "/admin/orders", icon: FileText },
];

export default function AdminPage() {
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
              Welcome Back
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
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="border-2 border-[#AEACA1]/20 bg-[#252219] p-6 hover:border-[#CCAA4C]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded flex items-center justify-center bg-[#1f1c13]`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-3 h-3" />
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
              {[
                { title: "Burnout Theory: Friction & Torque", status: "published", type: "video" },
                { title: "The V8 Restoration: Part IV", status: "published", type: "video" },
                { title: "Sim Rig Build Guide", status: "draft", type: "article" },
                { title: "Bloke Science: Oil Thermodynamics", status: "draft", type: "article" },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-4 bg-[#1f1c13] border border-[#AEACA1]/10 hover:border-[#CCAA4C]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.type === "video" ? "🎬" : "📄"}</span>
                    <span className="text-sm font-bold text-white">{item.title}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                    item.status === "published" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
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
                href="/admin/orders"
                className="text-xs font-bold uppercase tracking-widest text-[#CCAA4C] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {[
                { id: "AT-001247", customer: "John D.", total: "$64.00", status: "shipped" },
                { id: "AT-001246", customer: "Sarah M.", total: "$32.00", status: "processing" },
                { id: "AT-001245", customer: "Mike T.", total: "$95.00", status: "pending" },
                { id: "AT-001244", customer: "Emma R.", total: "$1,899.00", status: "shipped" },
              ].map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-[#1f1c13] border border-[#AEACA1]/10 hover:border-[#CCAA4C]/30 transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-mono text-[#CCAA4C]">{order.id}</span>
                    <p className="text-sm font-bold text-white">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{order.total}</span>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      order.status === "shipped" ? "text-green-400" :
                      order.status === "processing" ? "text-blue-400" : "text-yellow-400"
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
