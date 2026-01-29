import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Radio, Wrench, Gamepad2, Shield, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#E3E2D5]">
      {/* Hero Section */}
      <section className="bg-[#CCAA4C] border-b-8 border-[#353535] py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 halftone-overlay opacity-20"></div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#353535] text-[#CCAA4C] px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
              Official Directive
            </span>
            <span className="text-[#353535] text-xs font-bold uppercase tracking-widest border-l-2 border-[#353535]/20 pl-4">
              Doc_ID: ABOUT-AT-001
            </span>
          </div>
          <h1 
            className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-[#353535] mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            About<br />
            <span className="bg-[#353535] text-[#CCAA4C] px-4 inline-block">Atomic Tawk</span>
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article */}
          <article className="lg:col-span-8 space-y-12">
            {/* Mission Statement */}
            <div className="industrial-border bg-white p-8 md:p-12 relative">
              <div className="absolute -top-6 right-6 stamp bg-white">UNCLASSIFIED</div>
              <div className="flex items-center gap-6 mb-8 border-b-4 border-[#353535] pb-4">
                <div className="w-16 h-16 bg-[#353535] flex items-center justify-center text-[#CCAA4C]">
                  <Radio className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Section I</span>
                  <h2 
                    className="text-3xl font-black uppercase tracking-tighter leading-none"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    The Mission
                  </h2>
                </div>
              </div>
              <div className="font-mono text-lg text-[#353535]/90 space-y-6">
                <p>
                  <strong>Atomic Tawk</strong> is a retro-future media channel for mechanical culture and 
                  bloke commentary. We test, talk, and occasionally destroy things in the name of horsepower.
                </p>
                <p>
                  Think of us as the Civil Defence PSA for engines. We&apos;re here to broadcast the truth about 
                  burnouts, shed builds, gaming rigs, and everything else that matters to the mechanically inclined.
                </p>
                <p>
                  Our style? 1950s atomic-age optimism meets post-apocalyptic humour. Fallout meets your 
                  local car meet. Government-issue aesthetics for unofficial mechanical wisdom.
                </p>
              </div>
            </div>

            {/* What We Cover */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-1 bg-[#353535] flex-grow"></div>
                <h3 
                  className="text-2xl font-black uppercase tracking-tighter shrink-0"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  What We Cover
                </h3>
                <div className="h-1 bg-[#353535] flex-grow"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: "🔥", title: "Burnouts & Cars", desc: "From street machines to track monsters. If it has wheels and makes noise, we're interested." },
                  { icon: "🔧", title: "Shed Builds", desc: "The art of fixing, building, and occasionally breaking things in the name of progress." },
                  { icon: "🎮", title: "Gaming & Sim Rigs", desc: "Virtual horsepower counts too. Racing sims, builds, and digital car culture." },
                  { icon: "🧪", title: "Bloke Science", desc: "Did you know facts, trivia, and the physics of why stuff works (or doesn't)." },
                ].map((item) => (
                  <div key={item.title} className="industrial-border-sm bg-white p-6">
                    <span className="text-4xl block mb-4">{item.icon}</span>
                    <h4 
                      className="text-xl font-black uppercase mb-2"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#353535]/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Tone */}
            <div className="bg-[#353535] text-white p-8 md:p-12 industrial-border">
              <h3 
                className="text-2xl font-black uppercase tracking-tighter mb-6 text-[#CCAA4C]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Our Tone
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {["Confident", "Blokey", "Humorous", "Slightly Ironic", "Satirical", "Not Political"].map((tone) => (
                  <div key={tone} className="border-2 border-[#AEACA1]/30 px-4 py-2 text-center">
                    <span className="text-sm font-bold uppercase tracking-widest">{tone}</span>
                  </div>
                ))}
              </div>
              <p className="font-mono text-sm text-white/70">
                We channel the optimism of 1950s advertising but with a knowing wink. Think propaganda 
                posters for petrol heads, safety bulletins for speed demons, and government-issue 
                graphics for garage enthusiasts.
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            {/* Brand Badge */}
            <div className="industrial-border bg-white p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 halftone-overlay opacity-10"></div>
              <div className="relative z-10">
                <Image
                  src="/logo.png"
                  alt="Atomic Tawk"
                  width={200}
                  height={150}
                  className="mx-auto mb-6"
                />
                <div className="h-1 w-12 bg-[#353535] mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#353535]/60">
                  Approved for<br />Mechanical Discussion
                </p>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="industrial-border bg-[#353535] text-white p-8">
              <h3 
                className="text-xl font-black uppercase tracking-widest mb-6 text-[#CCAA4C]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Quick Facts
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <Shield className="w-5 h-5 text-[#CCAA4C]" />
                  <span className="font-bold uppercase">Est. 1955 (Rebuilt 2077)</span>
                </li>
                <li className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <Radio className="w-5 h-5 text-[#CCAA4C]" />
                  <span className="font-bold uppercase">Frequency: 104.2 FM</span>
                </li>
                <li className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <Users className="w-5 h-5 text-[#CCAA4C]" />
                  <span className="font-bold uppercase">Target: Men 18-45</span>
                </li>
                <li className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#CCAA4C]" />
                  <span className="font-bold uppercase">Approved by Wasteland Council</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="p-8 border-4 border-dashed border-[#353535]/40 text-center">
              <p 
                className="text-xl font-black uppercase mb-4"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                Join the Broadcast
              </p>
              <Link href="/contact">
                <Button variant="primary" className="w-full">
                  Subscribe Now
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Brand Phrases */}
      <section className="bg-[#353535] py-16 border-y-8 border-[#CCAA4C]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
            {[
              "Powering the Mechanical Conversation",
              "Official Mechanical Broadcast",
              "Talk Loud. Drive Louder.",
              "Broadcasting from the Shed",
              "Approved for Mechanical Discussion",
              "Civil Defence PSA for Horsepower",
            ].map((phrase) => (
              <div key={phrase} className="border-2 border-[#AEACA1]/30 p-6">
                <p 
                  className="text-[#CCAA4C] font-black uppercase tracking-tight text-lg"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  &ldquo;{phrase}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
