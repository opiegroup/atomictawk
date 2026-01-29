"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  Layout,
  Settings,
  Users,
  BarChart3,
  LogOut,
  Radio
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/pages", label: "Page Builder", icon: Layout },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
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
        <div className="p-4 border-t-2 border-[#AEACA1]/20">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-[#AEACA1] hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wide">
              View Site
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
