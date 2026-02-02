"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ShoppingCart, Check, ArrowLeft } from "lucide-react";

interface Spec {
  label: string;
  value: string;
}

interface Variant {
  id: string;
  name: string;
  type: string;
  stock_qty: number;
  price_adjustment: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specs: Spec[];
  price: number;
  compare_price: number | null;
  images: string[];
  category: string;
  serial_no: string | null;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  configurable: boolean;
  variants: Variant[];
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  // Get size variants
  const sizeVariants = product.variants.filter(v => v.type === 'size');
  const defaultSize = sizeVariants.length > 0 ? sizeVariants[Math.floor(sizeVariants.length / 2)]?.name || sizeVariants[0]?.name : undefined;
  
  const [selectedSize, setSelectedSize] = useState<string | undefined>(defaultSize);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Simulate API call - in production this would add to cart/create checkout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAddingToCart(false);
    setAddedToCart(true);
    
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = async () => {
    setIsAddingToCart(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          quantity: 1,
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3E2D5] blueprint-grid relative">
      <div className="absolute inset-0 halftone-overlay opacity-5 pointer-events-none"></div>
      
      {/* Header */}
      <header className="max-w-[1200px] mx-auto pt-8 px-6">
        <Link 
          href="/store" 
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#CCAA4C] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        {/* Top Bar */}
        <div className="bg-[#CCAA4C] border-4 border-[#353535] p-8 relative overflow-hidden mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#353535] text-white px-3 py-1 text-[11px] font-black uppercase tracking-widest">
              Authorized Personnel Only
            </div>
            {product.serial_no && (
              <div className="text-[11px] font-black uppercase tracking-widest text-[#353535]/60">
                Ref No: {product.serial_no}
              </div>
            )}
          </div>
          <h1 
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] max-w-3xl text-[#353535] mt-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Official Mechanical Requisition
          </h1>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Image */}
          <div className="w-full lg:w-3/5 industrial-border bg-white relative p-6">
            <span className="rivet top-3 left-3" />
            <span className="rivet top-3 right-3" />
            <span className="rivet bottom-3 left-3" />
            <span className="rivet bottom-3 right-3" />

            <div className="relative w-full aspect-square bg-[#f8f8f8] border-2 border-[#353535]/10 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 blueprint-grid pointer-events-none"></div>
              
              {/* Tech corners */}
              <div className="absolute top-8 left-8 border-l-2 border-t-2 border-[#353535] w-10 h-10"></div>
              <div className="absolute top-10 left-10 font-mono text-[11px] font-black text-[#353535]/40">
                FIG 3.2 // PRIMARY VIEW
              </div>
              <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-[#353535] w-10 h-10"></div>
              <div className="absolute bottom-10 right-10 font-mono text-[11px] font-black text-[#353535]/40 text-right">
                COORD_SYS: 45.32.X<br />UNIT: {product.serial_no || 'N/A'}
              </div>

              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
              />

              {/* Approved Stamp */}
              {product.in_stock && (
                <div className="absolute top-6 right-6 stamp stamp-approved text-lg bg-white/90 px-4 py-1 z-20">
                  Approved
                </div>
              )}
            </div>

            {/* Image indicators */}
            <div className="mt-6 flex justify-between items-center px-2">
              <div className="flex gap-1.5">
                <div className="w-16 h-2 bg-[#353535]"></div>
                <div className="w-4 h-2 bg-[#CCAA4C]"></div>
                <div className="w-4 h-2 bg-[#353535]/20"></div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest opacity-60">
                Visual Spec: High Fidelity Digital Capture
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-2/5 flex flex-col gap-8">
            <div className="industrial-border bg-white p-10 relative">
              <span className="rivet top-3 left-3" />
              <span className="rivet top-3 right-3" />

              <div className="mb-10">
                <div className="flex justify-between items-start mb-4">
                  {product.serial_no && (
                    <span className="bg-[#353535] text-white px-4 py-1.5 text-[11px] font-black tracking-widest uppercase">
                      Serial No. {product.serial_no}
                    </span>
                  )}
                  <span className="font-mono text-[10px] font-bold opacity-30">REV. 0.04</span>
                </div>
                <h2 
                  className="text-5xl font-black uppercase tracking-tighter leading-none mb-6 text-[#353535] italic"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {product.name}
                </h2>
                <div className="flex items-baseline gap-3">
                  <span 
                    className="text-4xl font-black text-[#353535] tracking-tight"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-black uppercase opacity-40">MSRP // Standard Issue</span>
                </div>
                {product.description && (
                  <p className="text-sm text-[#353535]/70 mt-4">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="space-y-8">
                {/* Specs */}
                {product.specs && product.specs.length > 0 && (
                  <div className="border-t-3 border-[#353535] pt-8" style={{ borderTopWidth: "3px" }}>
                    <h3 className="text-sm font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                      Technical Specs
                    </h3>
                    <div className="font-mono text-[11px] space-y-3 text-[#353535] bg-[#E3E2D5] p-5 border-2 border-[#353535]">
                      {product.specs.map((spec, index) => (
                        <p 
                          key={spec.label}
                          className={`flex justify-between ${
                            index < product.specs.length - 1 ? "border-b border-[#353535]/10 pb-2" : ""
                          }`}
                        >
                          <span className="font-black opacity-40">{spec.label.toUpperCase()}:</span>
                          <span>{spec.value.toUpperCase()}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizeVariants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.25em] mb-4">Size Selection</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {sizeVariants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedSize(variant.name)}
                          disabled={variant.stock_qty === 0}
                          className={`border-3 py-4 text-xs font-black transition-colors ${
                            selectedSize === variant.name
                              ? "bg-[#353535] text-white border-[#353535]"
                              : variant.stock_qty === 0
                                ? "border-[#353535]/30 text-[#353535]/30 cursor-not-allowed"
                                : "border-[#353535] hover:bg-[#CCAA4C]"
                          }`}
                          style={{ borderWidth: "3px" }}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isAddingToCart || !product.in_stock}
              className="w-full bg-[#CCAA4C] placard-btn p-6 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-7 h-7" />
              <span 
                className="text-xl font-black uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {isAddingToCart ? "Processing..." : "Requisition Item"}
              </span>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || addedToCart || !product.in_stock}
              className="w-full border-4 border-[#353535] bg-white p-4 flex items-center justify-center gap-4 hover:bg-[#E3E2D5] transition-colors disabled:opacity-50"
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-black uppercase tracking-widest text-green-600">Added to Cart</span>
                </>
              ) : (
                <span className="font-black uppercase tracking-widest">Add to Cart</span>
              )}
            </button>

            {/* Stock Status */}
            <div className="industrial-border bg-[#E3E2D5] p-5 flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full border-2 border-[#353535] ${
                product.in_stock ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}></div>
              <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                Logistics: {product.in_stock ? `Depot In Stock (${product.stock_qty} units) // Ready for Deployment` : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
