"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Radio, Mail, MapPin, Phone, Send, Check, Youtube, Instagram, Twitter } from "lucide-react";
import { SiteSettings, SocialLink } from "@/lib/siteSettings";

// Icon mapping for social platforms
const socialIcons: Record<string, React.ComponentType<any>> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
};

interface ContactClientProps {
  settings: SiteSettings;
  socialLinks: SocialLink[];
}

export function ContactClient({ settings, socialLinks }: ContactClientProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert("You've been added to the broadcast list!");
  };

  return (
    <div className="min-h-screen bg-[#E3E2D5]">
      {/* Header */}
      <section className="bg-[#CCAA4C] border-b-8 border-[#353535] py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 halftone-overlay opacity-20"></div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#353535] text-[#CCAA4C] px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
              Communication Channel
            </span>
          </div>
          <h1 
            className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter text-[#353535] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Contact<br />
            <span className="bg-[#353535] text-[#CCAA4C] px-4 inline-block">Headquarters</span>
          </h1>
          <p className="text-lg text-[#353535]/80 max-w-xl mt-4">
            Have a question, suggestion, or just want to talk cars? 
            Open a communication channel with {settings.site_name} HQ.
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="industrial-border bg-white p-8 md:p-12 relative">
              <span className="rivet top-3 left-3" />
              <span className="rivet top-3 right-3" />
              <span className="rivet bottom-3 left-3" />
              <span className="rivet bottom-3 right-3" />

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h2 
                    className="text-3xl font-black uppercase mb-4"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    Transmission Received
                  </h2>
                  <p className="text-[#353535]/70 font-mono uppercase text-sm">
                    Your message has been logged. We&apos;ll respond within 48 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8 border-b-4 border-[#353535] pb-4">
                    <div className="w-12 h-12 bg-[#353535] flex items-center justify-center text-[#CCAA4C]">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Form</span>
                      <h2 
                        className="text-2xl font-black uppercase tracking-tighter leading-none"
                        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                      >
                        Send Transmission
                      </h2>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">
                          Operator Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full border-3 border-[#353535] px-4 py-3 font-bold uppercase text-sm focus:ring-[#CCAA4C] focus:border-[#CCAA4C]"
                          style={{ borderWidth: "3px" }}
                          placeholder="Your name..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">
                          Email Coordinates *
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full border-3 border-[#353535] px-4 py-3 font-bold uppercase text-sm focus:ring-[#CCAA4C] focus:border-[#CCAA4C]"
                          style={{ borderWidth: "3px" }}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-2">
                        Subject Line *
                      </label>
                      <select
                        required
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        className="w-full border-3 border-[#353535] px-4 py-3 font-bold uppercase text-sm focus:ring-[#CCAA4C] focus:border-[#CCAA4C] bg-white"
                        style={{ borderWidth: "3px" }}
                      >
                        <option value="">Select a subject...</option>
                        <option value="general">General Inquiry</option>
                        <option value="content">Content Suggestion</option>
                        <option value="store">Store / Order Question</option>
                        <option value="collab">Collaboration Request</option>
                        <option value="feedback">Feedback / Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full border-3 border-[#353535] px-4 py-3 font-mono text-sm focus:ring-[#CCAA4C] focus:border-[#CCAA4C] resize-none"
                        style={{ borderWidth: "3px" }}
                        placeholder="Enter your message here..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Transmitting..." : "Send Transmission"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            {/* Contact Info */}
            <div className="industrial-border bg-[#353535] text-white p-8">
              <h3 
                className="text-xl font-black uppercase tracking-widest mb-6 text-[#CCAA4C]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Direct Lines
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#CCAA4C] mt-1" />
                  <div>
                    <span className="block text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-1">Email</span>
                    <a href={`mailto:${settings.contact_email}`} className="font-bold hover:text-[#CCAA4C] transition-colors">
                      {settings.contact_email}
                    </a>
                  </div>
                </li>
                {settings.contact_phone && (
                  <li className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-[#CCAA4C] mt-1" />
                    <div>
                      <span className="block text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-1">Phone</span>
                      <a href={`tel:${settings.contact_phone}`} className="font-bold hover:text-[#CCAA4C] transition-colors">
                        {settings.contact_phone}
                      </a>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-4">
                  <Radio className="w-5 h-5 text-[#CCAA4C] mt-1" />
                  <div>
                    <span className="block text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-1">Broadcast Frequency</span>
                    <span className="font-bold">{settings.radio_frequency}</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#CCAA4C] mt-1" />
                  <div>
                    <span className="block text-xs font-black uppercase tracking-widest text-[#AEACA1] mb-1">Location</span>
                    <span className="font-bold">{settings.contact_address}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="industrial-border bg-white p-8 relative">
              <div className="absolute top-4 right-4 stamp text-xs">Join</div>
              
              <h3 
                className="text-xl font-black uppercase tracking-tighter mb-4 pr-20"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {settings.newsletter_title}
              </h3>
              <p className="text-sm text-[#353535]/70 mb-6">
                {settings.newsletter_description}
              </p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  required
                  className="w-full border-3 border-[#353535] px-4 py-3 font-bold uppercase text-sm focus:ring-[#CCAA4C] focus:border-[#CCAA4C]"
                  style={{ borderWidth: "3px" }}
                  placeholder="Your email..."
                />
                <Button type="submit" variant="secondary" className="w-full">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="p-6 border-4 border-dashed border-[#353535]/40">
              <h4 
                className="text-lg font-black uppercase tracking-tighter mb-4 text-center"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Follow the Signal
              </h4>
              <div className="flex justify-center gap-4">
                {socialLinks.map((link) => {
                  const Icon = socialIcons[link.icon.toLowerCase()] || Radio;
                  return (
                    <a
                      key={link.id}
                      href={link.url || "#"}
                      target={link.url && link.url !== '#' ? "_blank" : undefined}
                      rel={link.url && link.url !== '#' ? "noopener noreferrer" : undefined}
                      className="w-12 h-12 border-2 border-[#353535] flex items-center justify-center hover:bg-[#CCAA4C] transition-colors"
                      title={link.platform}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
