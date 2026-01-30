"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Search, Radio, User, LogIn, LogOut, Shield, ChevronDown } from "lucide-react";
import { useAuth, useRole, getSupabaseClient } from "@/lib/supabase";

// Default fallback links (used if database not available)
const defaultNavLinks = [
  { href: "/tv", label: "TV", icon: null },
  { href: "/shows", label: "Broadcasts", icon: null },
  { href: "/game", label: "Game", icon: "🎮" },
  { href: "/community", label: "Community", icon: "💬" },
  { href: "/store", label: "Store", icon: null },
  { href: "/about", label: "About", icon: null },
];

interface NavLink {
  id?: string;
  href: string;
  label: string;
  icon: string | null;
  open_in_new_tab?: boolean;
  requires_auth?: boolean;
  parent_id?: string | null;
  children?: NavLink[];
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>(defaultNavLinks);
  const { user, profile, loading, signOut } = useAuth();
  const { isAdmin, isSales } = useRole();

  // Load menu items from database
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const { data, error } = await (supabase as any).rpc('get_menu_items', { 
          p_location: 'header' 
        });

        if (error) {
          console.error('Error loading menu:', error);
          return;
        }

        if (data && data.length > 0) {
          // Convert flat list to nested structure
          const items: NavLink[] = data.map((item: any) => ({
            id: item.id,
            href: item.href,
            label: item.label,
            icon: item.icon,
            open_in_new_tab: item.open_in_new_tab,
            requires_auth: item.requires_auth,
            parent_id: item.parent_id,
          }));

          // Build nested structure - top level items with children
          const topLevel = items.filter(item => !item.parent_id);
          const nested = topLevel.map(parent => ({
            ...parent,
            children: items.filter(child => child.parent_id === parent.id)
          }));

          setNavLinks(nested);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
      }
    };

    loadMenuItems();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  // Filter links based on auth requirements
  const filteredNavLinks = navLinks.filter(link => {
    if (link.requires_auth && !user) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#353535] bg-[#E3E2D5]">
      {/* Main Navigation */}
      <div className="max-w-[1400px] mx-auto flex items-stretch h-20">
        {/* Logo */}
        <Link 
          href="/" 
          className="bg-[#353535] px-4 md:px-6 flex items-center border-r-4 border-[#353535] group shrink-0"
        >
          <Image 
            src="/logo.png" 
            alt="Atomic Tawk" 
            width={140} 
            height={60} 
            className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-grow">
          {filteredNavLinks.map((link) => (
            link.children && link.children.length > 0 ? (
              // Dropdown Menu - entire area is hover trigger
              <div 
                key={link.id || link.href} 
                className="relative group flex border-r-4 border-[#353535] hover:bg-white transition-colors"
              >
                <button
                  className="px-6 xl:px-8 flex items-center gap-1 font-bold uppercase tracking-widest text-xs text-[#353535]"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.label}
                  <ChevronDown className="w-3 h-3 ml-1 transition-transform group-hover:rotate-180" />
                </button>
                {/* Dropdown - shows on parent hover */}
                <div className="absolute top-full left-0 w-48 pt-0 hidden group-hover:block z-50">
                  {/* Invisible bridge to connect hover areas */}
                  <div className="h-1" />
                  <div className="bg-white border-4 border-[#353535] shadow-lg">
                    {/* Parent link (optional) */}
                    {link.href && link.href !== '/' && link.href !== '#' && (
                      <Link
                        href={link.href}
                        className="block px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#353535] hover:bg-[#CCAA4C]/20 border-b-2 border-[#353535]/20"
                        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                      >
                        {link.label} Overview
                      </Link>
                    )}
                    {/* Children */}
                    {link.children.map((child) => (
                      <Link
                        key={child.id || child.href}
                        href={child.href}
                        target={child.open_in_new_tab ? "_blank" : undefined}
                        rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                        className="block px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#353535] hover:bg-[#CCAA4C]/20 transition-colors"
                        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                      >
                        {child.icon && <span className="mr-2">{child.icon}</span>}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Regular Link
              <Link
                key={link.id || link.href}
                href={link.href}
                target={link.open_in_new_tab ? "_blank" : undefined}
                rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                className="px-6 xl:px-8 flex items-center gap-1 border-r-4 border-[#353535] hover:bg-white transition-colors font-bold uppercase tracking-widest text-xs text-[#353535]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Right Side - Auth & Search */}
        <div className="flex items-center gap-3 px-4 md:px-6 ml-auto border-l-4 border-[#353535] bg-white/50">
          {/* Search (Desktop) */}
          <div className="hidden md:flex items-center bg-[#353535]/10 px-3 py-1.5 border-2 border-[#353535]">
            <Search className="w-4 h-4 text-[#353535]" />
            <input
              type="text"
              placeholder="SEARCH..."
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs font-bold uppercase w-24 ml-2 placeholder:text-[#353535]/50"
            />
          </div>

          {/* Auth Section */}
          {loading ? (
            <div className="w-10 h-10 bg-[#353535]/20 rounded-full animate-pulse" />
          ) : user ? (
            /* Logged In - User Menu */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#353535] text-white rounded hover:bg-[#353535]/80 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#CCAA4C] flex items-center justify-center text-[#353535] font-bold text-sm">
                  {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-bold uppercase tracking-wide max-w-[100px] truncate">
                  {profile?.display_name || 'User'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-[#353535] shadow-lg z-50">
                  <div className="p-3 border-b-2 border-[#353535]/20">
                    <p className="text-sm font-bold text-[#353535] truncate">
                      {profile?.display_name || 'User'}
                    </p>
                    <p className="text-xs text-[#353535]/60 truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#353535] hover:bg-[#CCAA4C]/20 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  {(isAdmin || isSales) && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#353535] hover:bg-[#CCAA4C]/20 transition-colors border-t border-[#353535]/10"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 transition-colors border-t-2 border-[#353535]/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out - Login/Signup */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#353535] hover:text-[#CCAA4C] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1 px-4 py-2 bg-[#CCAA4C] text-[#353535] text-xs font-bold uppercase tracking-wide hover:bg-[#CCAA4C]/80 transition-colors border-2 border-[#353535]"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Radio Icon */}
          <div className="hidden xl:flex w-10 h-10 bg-[#353535] rounded-full items-center justify-center text-[#CCAA4C]">
            <Radio className="w-5 h-5" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#353535]" />
            ) : (
              <Menu className="w-6 h-6 text-[#353535]" />
            )}
          </button>
        </div>
      </div>

      {/* Hazard Stripe */}
      <div className="h-2 hazard-stripe opacity-50"></div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-4 border-[#353535] bg-white">
          <nav className="flex flex-col">
            {filteredNavLinks.map((link) => (
              <div key={link.id || link.href}>
                {/* Parent Link */}
                <Link
                  href={link.href}
                  target={link.open_in_new_tab ? "_blank" : undefined}
                  rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-4 border-b-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.label}
                  {link.children && link.children.length > 0 && (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  )}
                </Link>
                {/* Child Links */}
                {link.children && link.children.length > 0 && (
                  <div className="bg-[#f5f5f0]">
                    {link.children.map((child) => (
                      <Link
                        key={child.id || child.href}
                        href={child.href}
                        target={child.open_in_new_tab ? "_blank" : undefined}
                        rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-6 pl-10 py-3 border-b border-[#353535]/10 hover:bg-[#CCAA4C]/20 transition-colors font-medium uppercase tracking-widest text-xs flex items-center gap-2 text-[#353535]/80"
                        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                      >
                        {child.icon && <span>{child.icon}</span>}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Auth Links */}
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-4 border-b-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-4 bg-[#CCAA4C]/20 hover:bg-[#CCAA4C]/40 transition-colors font-bold uppercase tracking-widest text-sm"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-4 border-b-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                {(isAdmin || isSales) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-6 py-4 border-b-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="px-6 py-4 text-left text-red-600 hover:bg-red-50 transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
          
          {/* Mobile Search */}
          <div className="p-4 border-t-2 border-[#353535]/20">
            <div className="flex items-center bg-[#353535]/10 px-4 py-3 border-2 border-[#353535]">
              <Search className="w-4 h-4 text-[#353535]" />
              <input
                type="text"
                placeholder="SEARCH BROADCASTS..."
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-bold uppercase w-full ml-3 placeholder:text-[#353535]/50"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
