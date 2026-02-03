import Link from "next/link";
import Image from "next/image";
import { Radio, Share2, Podcast, Wrench, Youtube, Instagram, Twitter } from "lucide-react";
import { getSiteSettings, getSocialLinks, SiteSettings, SocialLink, defaultSiteSettings, defaultSocialLinks } from "@/lib/siteSettings";
import { NewsletterForm } from "./NewsletterForm";

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

// Icon mapping for social platforms
const socialIcons: Record<string, React.ComponentType<any>> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Share2,
  facebook: Share2,
  x: Twitter,
};

function getSocialIcon(icon: string) {
  const IconComponent = socialIcons[icon.toLowerCase()] || Radio;
  return <IconComponent className="w-5 h-5" />;
}

interface FooterProps {
  settings?: SiteSettings;
  socialLinks?: SocialLink[];
}

export async function Footer({ settings: propSettings, socialLinks: propSocialLinks }: FooterProps = {}) {
  // Fetch data if not provided as props
  let settings = propSettings;
  let socialLinks = propSocialLinks;

  if (!settings) {
    try {
      settings = await getSiteSettings();
    } catch (e) {
      settings = defaultSiteSettings;
    }
  }

  if (!socialLinks) {
    try {
      socialLinks = await getSocialLinks('footer');
    } catch (e) {
      socialLinks = defaultSocialLinks;
    }
  }

  return (
    <footer className="bg-[#353535] text-white border-t-[12px] border-[#CCAA4C]">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-4 mb-8">
              <Image 
                src={settings?.logo_url || "/logo.png"}
                alt={settings?.site_name || "Atomic Tawk"}
                width={160} 
                height={70}
                className="h-16 w-auto brightness-200 contrast-150"
              />
            </div>
            <p className="text-xs font-mono text-white/70 leading-relaxed uppercase max-w-xs mb-6">
              {settings?.tagline || "Broadcasting from the heart of the shed since the atomic age. Keeping your engine humming and your tyre smoke thick."}
            </p>
            <div className="flex gap-4">
              {socialLinks && socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={link.url || "#"}
                    target={link.url && link.url !== '#' ? "_blank" : undefined}
                    rel={link.url && link.url !== '#' ? "noopener noreferrer" : undefined}
                    className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
                    title={link.platform}
                  >
                    {getSocialIcon(link.icon)}
                  </a>
                ))
              ) : (
                <>
                  <a 
                    href="#" 
                    className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-[#CCAA4C] hover:border-[#CCAA4C] transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </>
              )}
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
              {settings?.newsletter_title || "Join the Broadcast"}
            </h4>
            <div className="bg-[#1f1c13] p-6 border-2 border-white/20 relative">
              <div className="rivet top-2 left-2 bg-white/40"></div>
              <div className="rivet top-2 right-2 bg-white/40"></div>
              <p className="text-[10px] text-white/90 font-mono uppercase mb-4">
                {settings?.newsletter_description || "Stay informed. Join the newsletter for weekly mechanical updates and shed tips."}
              </p>
              <NewsletterForm 
                source="footer" 
                variant="dark" 
                buttonText="Subscribe"
                successMessage="Welcome to the Atomic Tawk community!"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t-2 border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>{settings?.established_text || "Established 1955 - Rebuilt 2077"}</span>
          </div>
          <div>{settings?.copyright_text || "All Rights Reserved - Atomic Tawk Media"}</div>
          <div>{settings?.footer_tagline || "Approved for Mechanical Discussion"}</div>
        </div>
      </div>
    </footer>
  );
}
