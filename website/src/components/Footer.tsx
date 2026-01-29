import Link from "next/link";
import Image from "next/image";
import { Radio, Share2, Podcast, Wrench } from "lucide-react";

const footerLinks = {
  frequencies: [
    { href: "/shows/burnouts", label: "Burnout Radio" },
    { href: "/shows/shed", label: "The Shed Session" },
    { href: "/shows/gaming", label: "Digital Static" },
    { href: "/shows", label: "Archive Access" },
  ],
  directives: [
    { href: "/store", label: "Garage Store" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#353535] text-white border-t-[12px] border-[#CCAA4C]">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-4 mb-8">
              <Image 
                src="/logo.png" 
                alt="Atomic Tawk" 
                width={160} 
                height={70}
                className="h-16 w-auto brightness-200 contrast-150"
              />
            </div>
            <p className="text-xs font-mono text-white/70 leading-relaxed uppercase max-w-xs mb-6">
              Broadcasting from the heart of the shed since the atomic age. 
              Keeping your engine humming and your tyre smoke thick.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
              >
                <Radio className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
              >
                <Podcast className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Frequencies */}
          <div className="md:col-span-2 md:border-l-2 md:border-white/20 md:pl-8">
            <h4 
              className="text-[#CCAA4C] font-bold uppercase tracking-widest mb-6 text-sm"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Frequencies
            </h4>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
              {footerLinks.frequencies.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#CCAA4C] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Directives */}
          <div className="md:col-span-2 md:border-l-2 md:border-white/20 md:pl-8">
            <h4 
              className="text-[#CCAA4C] font-bold uppercase tracking-widest mb-6 text-sm"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Directives
            </h4>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
              {footerLinks.directives.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#CCAA4C] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 md:border-l-2 md:border-white/20 md:pl-8">
            <h4 
              className="text-[#CCAA4C] font-bold uppercase tracking-widest mb-6 text-sm"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Join the Broadcast
            </h4>
            <div className="bg-[#1f1c13] p-6 border-2 border-white/20 relative">
              <div className="rivet top-2 left-2 bg-white/40"></div>
              <div className="rivet top-2 right-2 bg-white/40"></div>
              <p className="text-[10px] text-white/90 font-mono uppercase mb-4">
                Stay informed. Join the newsletter for weekly mechanical updates and shed tips.
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="YOUR EMAIL..."
                  className="flex-grow bg-white/10 border-2 border-white/20 text-xs font-bold uppercase px-4 py-3 focus:ring-[#CCAA4C] focus:border-[#CCAA4C] placeholder:text-white/30"
                />
                <button
                  type="submit"
                  className="bg-[#CCAA4C] text-[#353535] px-6 py-3 font-black uppercase text-xs hover:bg-white transition-colors whitespace-nowrap"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t-2 border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>Established 1955 - Rebuilt 2077</span>
          </div>
          <div>All Rights Reserved - Atomic Tawk Media</div>
          <div>Approved for Mechanical Discussion</div>
        </div>
      </div>
    </footer>
  );
}
