"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  Layout,
  Settings,
  Users,
  BarChart3,
  LogOut,
  Radio,
  MessageSquare,
  Target,
  Shield,
  ClipboardList,
  Menu,
  Image,
  Award
} from "lucide-react";
import { useAuth, useRole } from "@/lib/supabase";
import { useEffect } from "react";

// Navigation items with role requirements
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["god", "admin", "sales"] },
  { href: "/admin/pages", label: "Page Builder", icon: Layout, roles: ["god", "admin"] },
  { href: "/admin/menu", label: "Menu", icon: Menu, roles: ["god", "admin"] },
  { href: "/admin/content", label: "Content", icon: FileText, roles: ["god", "admin"] },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare, roles: ["god", "admin"] },
  { href: "/admin/products", label: "Products", icon: ShoppingBag, roles: ["god", "admin"] },
  { href: "/admin/media", label: "Media Library", icon: Image, roles: ["god", "admin"] },
  { href: "/admin/badges", label: "Honour Badges", icon: Award, roles: ["god", "admin"] },
  { href: "/admin/community", label: "Community", icon: MessageSquare, roles: ["god", "admin"] },
  { href: "/admin/leads", label: "Leads", icon: Target, roles: ["god", "sales"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["god", "admin"] },
  { href: "/admin/audit", label: "Audit Log", icon: ClipboardList, roles: ["god"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["god", "admin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["god"] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { role, isAdmin, isGod, isSales } = useRole();
  const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "/admin")}`;

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [loading, user, router, redirectUrl]);

  // Filter nav items based on role
  const filteredNavItems = navItems.filter(item => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1c13] flex items-center justify-center">
        <div className="text-[#CCAA4C]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1f1c13] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#252525] border border-[#353535] rounded-lg p-6 text-center">
          <h2 className="text-white text-lg font-bold mb-2">Sign in required</h2>
          <p className="text-[#AEACA1] text-sm mb-4">
            Please sign in to access the Admin Console.
          </p>
          <Link
            href={redirectUrl}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isGod && !isSales) {
    return (
      <div className="min-h-screen bg-[#1f1c13] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#252525] border border-red-500/50 rounded-lg p-6 text-center">
          <h2 className="text-white text-lg font-bold mb-2">Access denied</h2>
          <p className="text-[#AEACA1] text-sm">
            Your account does not have permission to view this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1c13] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#353535] border-r-4 border-[#CCAA4C] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b-2 border-[#AEACA1]/20">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CCAA4C] rounded flex items-center justify-center">
              <Radio className="w-6 h-6 text-[#353535]" />
            </div>
            <div>
              <h1 
                className="text-lg font-black uppercase tracking-tighter text-white"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Atomic Tawk
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#AEACA1]">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b-2 border-[#AEACA1]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CCAA4C]/20 flex items-center justify-center">
              <span className="text-[#CCAA4C] font-bold">
                {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || user?.email}
              </p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#CCAA4C]" />
                <span className="text-xs text-[#CCAA4C] uppercase font-bold">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                  isActive
                    ? "bg-[#CCAA4C] text-[#353535]"
                    : "text-[#AEACA1] hover:bg-[#AEACA1]/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-2 border-[#AEACA1]/20 space-y-1">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-[#AEACA1] hover:text-white transition-colors"
          >
            <Radio className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wide">
              View Site
            </span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#AEACA1] hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
