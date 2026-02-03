"use client";

import { useState } from "react";

interface NewsletterFormProps {
  source?: string;
  buttonText?: string;
  successMessage?: string;
  variant?: "default" | "inline" | "dark";
  className?: string;
}

export function NewsletterForm({
  source = "website",
  buttonText = "Subscribe",
  successMessage = "Welcome to the Atomic Tawk community!",
  variant = "default",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    console.log("[NewsletterForm] Submitting:", { email, source });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source,
        }),
      });

      console.log("[NewsletterForm] Response status:", response.status);
      const data = await response.json();
      console.log("[NewsletterForm] Response data:", data);

      if (response.ok) {
        setStatus("success");
        setMessage(successMessage);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("[NewsletterForm] Error:", error);
      setStatus("error");
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="text-green-400 font-bold uppercase text-sm tracking-widest mb-2">
          ✓ Subscribed!
        </div>
        <p className={`text-xs ${variant === "dark" ? "text-white/70" : "text-[#353535]/70"}`}>
          {message}
        </p>
      </div>
    );
  }

  // Inline variant (used in footer)
  if (variant === "inline" || variant === "dark") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOUR EMAIL..."
          disabled={status === "loading"}
          className="flex-grow bg-white/10 border-2 border-white/20 text-xs font-bold uppercase px-4 py-3 focus:ring-[#CCAA4C] focus:border-[#CCAA4C] placeholder:text-white/30 text-white"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#CCAA4C] text-[#353535] px-6 py-3 font-black uppercase text-xs hover:bg-white transition-colors whitespace-nowrap disabled:opacity-50"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {status === "loading" ? "..." : buttonText}
        </button>
        {status === "error" && (
          <p className="text-red-400 text-xs mt-1 col-span-full">{message}</p>
        )}
      </form>
    );
  }

  // Default variant
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email..."
        disabled={status === "loading"}
        className="w-full border-3 border-[#353535] px-4 py-3 font-bold uppercase text-sm focus:ring-[#CCAA4C] focus:border-[#CCAA4C]"
        style={{ borderWidth: "3px" }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#353535] text-white px-6 py-3 font-black uppercase text-sm hover:bg-[#CCAA4C] hover:text-[#353535] transition-colors disabled:opacity-50"
        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
      >
        {status === "loading" ? "Subscribing..." : buttonText}
      </button>
      {status === "error" && (
        <p className="text-red-500 text-xs">{message}</p>
      )}
    </form>
  );
}
