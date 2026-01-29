"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, Radio } from "lucide-react";

const navLinks = [
  { href: "/tv", label: "TV" },
  { href: "/shows", label: "Broadcasts" },
  { href: "/shed", label: "🏠 3D Shed" },
  { href: "/game", label: "🎮 Game" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-6 xl:px-8 flex items-center border-r-4 border-[#353535] hover:bg-white transition-colors font-bold uppercase tracking-widest text-xs text-[#353535]"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side - Search & Status */}
        <div className="flex items-center gap-4 px-4 md:px-6 ml-auto border-l-4 border-[#353535] bg-white/50">
          {/* Search (Desktop) */}
          <div className="hidden md:flex items-center bg-[#353535]/10 px-3 py-1.5 border-2 border-[#353535]">
            <Search className="w-4 h-4 text-[#353535]" />
            <input
              type="text"
              placeholder="SEARCH..."
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs font-bold uppercase w-32 ml-2 placeholder:text-[#353535]/50"
            />
          </div>

          {/* Status Indicator */}
          <div className="hidden xl:flex flex-col items-end text-right">
            <span className="text-[10px] font-black uppercase tracking-tighter leading-none text-[#353535]">
              Signal: 104.2 FM
            </span>
            <span className="text-[10px] uppercase opacity-60 font-mono">
              Status: Live
            </span>
          </div>

          {/* Radio Icon */}
          <div className="w-10 h-10 bg-[#353535] rounded-full flex items-center justify-center text-[#CCAA4C]">
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-4 border-b-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors font-bold uppercase tracking-widest text-sm"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
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
