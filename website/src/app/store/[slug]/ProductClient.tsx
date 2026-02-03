"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ShoppingCart, Check, ArrowLeft, ShoppingBag, FileText, Download, Truck, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart";

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

interface ProductTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
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
  pdf_url: string | null;
  care_instructions: string | null;
  shipping_info: string | null;
  product_tables: ProductTable[];
}

type ProductTab = "description" | "specs" | "shipping" | "downloads";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addItem, getItemQuantity, openCart, cart } = useCart();
  
  // Get size variants
  const sizeVariants = product.variants.filter(v => v.type === 'size');
  const defaultSize = sizeVariants.length > 0 ? sizeVariants[Math.floor(sizeVariants.length / 2)]?.name || sizeVariants[0]?.name : undefined;
  
  const [selectedSize, setSelectedSize] = useState<string | undefined>(defaultSize);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all product images or use placeholder
  const productImages = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"];
  
  const currentImage = productImages[selectedImageIndex] || productImages[0];

  // Image navigation
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Get current quantity in cart for this product/variant
  const currentQuantity = getItemQuantity(product.id, selectedSize);

  // Get stock for selected variant
  const selectedVariant = sizeVariants.find(v => v.name === selectedSize);
  const maxStock = selectedVariant ? selectedVariant.stock_qty : product.stock_qty;

  const handleAddToCart = () => {
    if (!product.in_stock) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price + (selectedVariant?.price_adjustment || 0),
      image: productImages[0], // Always use first image for cart
      quantity: 1,
      variant: selectedSize,
      maxStock: maxStock,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
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
          {/* Product Image Gallery */}
          <div className="w-full lg:w-3/5 industrial-border bg-white relative p-6">
            <span className="rivet top-3 left-3" />
            <span className="rivet top-3 right-3" />
            <span className="rivet bottom-3 left-3" />
            <span className="rivet bottom-3 right-3" />

            {/* Main Image */}
            <div className="relative w-full aspect-square bg-[#f8f8f8] border-2 border-[#353535]/10 overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 blueprint-grid pointer-events-none"></div>
              
              {/* Tech corners */}
              <div className="absolute top-8 left-8 border-l-2 border-t-2 border-[#353535] w-10 h-10 z-10"></div>
              <div className="absolute top-10 left-10 font-mono text-[11px] font-black text-[#353535]/40 z-10">
                FIG {selectedImageIndex + 1}.{productImages.length} // {selectedImageIndex === 0 ? 'PRIMARY' : 'ALTERNATE'} VIEW
              </div>
              <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-[#353535] w-10 h-10 z-10"></div>
              <div className="absolute bottom-10 right-10 font-mono text-[11px] font-black text-[#353535]/40 text-right z-10">
                COORD_SYS: 45.32.X<br />UNIT: {product.serial_no || 'N/A'}
              </div>

              <Image
                src={currentImage}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-contain p-8"
              />

              {/* Navigation Arrows (show if multiple images) */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#353535]/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#353535] z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#353535]/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#353535] z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Approved Stamp */}
              {product.in_stock && (
                <div className="absolute top-6 right-6 stamp stamp-approved text-lg bg-white/90 px-4 py-1 z-20">
                  Approved
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-[#CCAA4C] ring-2 ring-[#CCAA4C]"
                        : "border-[#353535]/20 hover:border-[#353535]"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-[#CCAA4C]/20"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Image indicators */}
            <div className="mt-4 flex justify-between items-center px-2">
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

            {/* Add to Cart / View Cart Button */}
            {currentQuantity > 0 ? (
              <button
                onClick={openCart}
                className="w-full border-4 border-[#353535] bg-[#353535] text-white p-4 flex items-center justify-center gap-4 hover:bg-[#252219] transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest">
                  View Cart ({currentQuantity} in cart)
                </span>
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.in_stock}
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
            )}

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

        {/* Tabbed Content Section */}
        <div className="mt-12">
          {/* Tab Navigation */}
          <div className="flex border-4 border-[#353535] bg-white overflow-hidden">
            {[
              { id: "description" as ProductTab, label: "Description", icon: FileText },
              { id: "specs" as ProductTab, label: "Full Specs", icon: Info },
              { id: "shipping" as ProductTab, label: "Shipping & Care", icon: Truck },
              { id: "downloads" as ProductTab, label: "Downloads", icon: Download },
            ].map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-black uppercase tracking-widest text-xs transition-colors ${
                  index > 0 ? "border-l-2 border-[#353535]" : ""
                } ${
                  activeTab === tab.id
                    ? "bg-[#353535] text-white"
                    : "bg-white text-[#353535] hover:bg-[#E3E2D5]"
                }`}
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="industrial-border bg-white p-8 relative">
            <span className="rivet top-3 left-3" />
            <span className="rivet top-3 right-3" />
            <span className="rivet bottom-3 left-3" />
            <span className="rivet bottom-3 right-3" />

            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  Product Details
                </h3>
                {product.long_description ? (
                  <div 
                    className="text-[#353535]/80 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: product.long_description }}
                  />
                ) : product.description ? (
                  <p className="text-[#353535]/80 leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-[#353535]/50 italic">No detailed description available for this item.</p>
                )}

                {/* Product Tables */}
                {product.product_tables && product.product_tables.length > 0 && (
                  <div className="mt-8 space-y-8">
                    {product.product_tables.map((table, tableIndex) => (
                      <div key={tableIndex} className="border-t-2 border-[#353535]/20 pt-6">
                        {table.title && (
                          <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#CCAA4C]" />
                            {table.title}
                          </h4>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border-4 border-[#353535]">
                            {table.headers && table.headers.length > 0 && (
                              <thead>
                                <tr className="bg-[#353535] text-white">
                                  {table.headers.map((header, headerIndex) => (
                                    <th
                                      key={headerIndex}
                                      className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest border-r border-[#353535]/30 last:border-r-0"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                            )}
                            <tbody>
                              {table.rows.map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className={`${
                                    rowIndex % 2 === 0 ? "bg-white" : "bg-[#E3E2D5]"
                                  } border-t border-[#353535]/20`}
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className={`px-4 py-3 text-sm border-r border-[#353535]/10 last:border-r-0 ${
                                        cellIndex === 0 ? "font-bold text-[#353535]" : "text-[#353535]/80"
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Care Instructions */}
                {product.care_instructions && (
                  <div className="mt-8 pt-6 border-t-2 border-[#353535]/20">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#CCAA4C]" />
                      Care Instructions
                    </h4>
                    <p className="text-[#353535]/70 text-sm">{product.care_instructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-6" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  Technical Specifications
                </h3>
                {product.specs && product.specs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.specs.map((spec, index) => (
                      <div 
                        key={spec.label}
                        className="flex justify-between items-center py-3 px-4 bg-[#E3E2D5] border-2 border-[#353535]"
                      >
                        <span className="font-black text-xs uppercase tracking-widest text-[#353535]/60">
                          {spec.label}
                        </span>
                        <span className="font-bold text-sm text-[#353535]">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#353535]/50 italic">No specifications available.</p>
                )}
                
                {/* Additional Specs */}
                <div className="mt-8 grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#353535] text-white">
                    <p className="text-2xl font-black" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                      {product.serial_no || "N/A"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Serial Number</p>
                  </div>
                  <div className="text-center p-4 bg-[#CCAA4C] text-[#353535]">
                    <p className="text-2xl font-black" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                      {product.category}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Category</p>
                  </div>
                  <div className="text-center p-4 bg-[#E3E2D5] border-2 border-[#353535]">
                    <p className="text-2xl font-black" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                      {sizeVariants.length > 0 ? sizeVariants.length : "1"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Variants Available</p>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-6" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  Shipping & Returns
                </h3>
                
                <div className="space-y-6">
                  {/* Shipping Info */}
                  <div className="bg-[#E3E2D5] border-2 border-[#353535] p-6">
                    <h4 className="font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#CCAA4C]" />
                      Delivery Information
                    </h4>
                    {product.shipping_info ? (
                      <p className="text-[#353535]/80 text-sm leading-relaxed">{product.shipping_info}</p>
                    ) : (
                      <div className="space-y-3 text-sm text-[#353535]/80">
                        <p><strong>Standard Shipping:</strong> 5-10 business days — $10.00 AUD</p>
                        <p><strong>Express Shipping:</strong> 2-4 business days — $25.00 AUD</p>
                        <p className="text-xs text-[#353535]/60 mt-4">Available destinations: Australia, USA, UK, New Zealand, Canada</p>
                      </div>
                    )}
                  </div>

                  {/* Returns Policy */}
                  <div className="bg-white border-2 border-[#353535] p-6">
                    <h4 className="font-black uppercase tracking-widest text-sm mb-4">Returns Policy</h4>
                    <div className="space-y-3 text-sm text-[#353535]/80">
                      <p>We accept returns within <strong>30 days</strong> of delivery for unworn, unwashed items with original tags attached.</p>
                      <p>To initiate a return, contact us at <span className="text-[#CCAA4C] font-bold">support@atomictawk.com</span></p>
                    </div>
                  </div>

                  {/* Care Instructions if available */}
                  {product.care_instructions && (
                    <div className="bg-[#353535] text-white p-6">
                      <h4 className="font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#CCAA4C]" />
                        Care Instructions
                      </h4>
                      <p className="text-white/80 text-sm">{product.care_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Downloads Tab */}
            {activeTab === "downloads" && (
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-6" style={{ fontFamily: "var(--font-oswald), sans-serif" }}>
                  Downloads & Resources
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Product PDF */}
                  {product.pdf_url ? (
                    <a
                      href={product.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-6 bg-[#E3E2D5] border-2 border-[#353535] hover:bg-[#CCAA4C] hover:border-[#353535] transition-colors group"
                    >
                      <div className="w-12 h-12 bg-[#353535] flex items-center justify-center group-hover:bg-white transition-colors">
                        <FileText className="w-6 h-6 text-white group-hover:text-[#353535]" />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">Product Spec Sheet</p>
                        <p className="text-xs text-[#353535]/60 mt-1">PDF Download</p>
                      </div>
                      <Download className="w-5 h-5 ml-auto opacity-50 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-6 bg-[#E3E2D5]/50 border-2 border-[#353535]/30 opacity-50">
                      <div className="w-12 h-12 bg-[#353535]/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#353535]/50" />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">Product Spec Sheet</p>
                        <p className="text-xs text-[#353535]/60 mt-1">Not available</p>
                      </div>
                    </div>
                  )}

                  {/* Size Guide - always show for apparel */}
                  {(product.category === "Apparel" || sizeVariants.length > 0) && (
                    <button
                      onClick={() => {/* Could open a modal with size chart */}}
                      className="flex items-center gap-4 p-6 bg-[#E3E2D5] border-2 border-[#353535] hover:bg-[#CCAA4C] transition-colors group text-left"
                    >
                      <div className="w-12 h-12 bg-[#353535] flex items-center justify-center group-hover:bg-white transition-colors">
                        <Info className="w-6 h-6 text-white group-hover:text-[#353535]" />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">Size Guide</p>
                        <p className="text-xs text-[#353535]/60 mt-1">Measurement Chart</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* No downloads message */}
                {!product.pdf_url && !(product.category === "Apparel" || sizeVariants.length > 0) && (
                  <p className="text-[#353535]/50 italic text-center py-8">No downloads available for this product.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
