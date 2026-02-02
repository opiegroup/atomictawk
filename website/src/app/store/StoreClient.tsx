"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  serial_no: string | null;
  images: string[];
  in_stock: boolean;
  configurable: boolean;
}

interface ProductCategory {
  name: string;
  slug: string;
}

interface StoreClientProps {
  products: Product[];
  categories: ProductCategory[];
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function StoreClient({ products, categories }: StoreClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      {/* Category Filter */}
      <div className="border-b-4 border-[#353535] bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-r-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors whitespace-nowrap ${
                  selectedCategory === cat.slug ? "bg-[#353535] text-white" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#353535]/60 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const imageUrl = product.images && product.images.length > 0
                ? (typeof product.images === 'string' 
                    ? JSON.parse(product.images)[0] 
                    : product.images[0])
                : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

              return (
                <Link 
                  href={`/store/${product.slug}`} 
                  key={product.id}
                  className="group"
                >
                  <div className="industrial-border bg-white p-5 hover:-translate-y-1 transition-transform">
                    {/* Corner Rivets */}
                    <span className="rivet top-3 left-3" />
                    <span className="rivet top-3 right-3" />
                    <span className="rivet bottom-3 left-3" />
                    <span className="rivet bottom-3 right-3" />

                    {/* Product Image */}
                    <div className="aspect-square bg-[#f8f8f8] border-2 border-[#353535]/10 mb-5 relative overflow-hidden">
                      <div className="absolute inset-0 blueprint-grid pointer-events-none opacity-50"></div>
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover mix-blend-multiply"
                      />
                      {/* Badges */}
                      {product.configurable && (
                        <div className="absolute top-4 left-4 bg-[#CCAA4C] text-[#353535] text-[9px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1 z-10">
                          <Settings className="w-3 h-3" />
                          3D Config
                        </div>
                      )}
                      {product.in_stock && (
                        <div className="absolute top-4 right-4 stamp stamp-approved text-xs bg-white/90 px-3 py-1 z-10">
                          Approved
                        </div>
                      )}
                      {!product.in_stock && (
                        <div className="absolute inset-0 bg-[#353535]/60 flex items-center justify-center">
                          <span className="text-white font-black uppercase tracking-widest">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    {product.serial_no && (
                      <div className="bg-[#353535] text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest inline-block mb-3">
                        {product.serial_no}
                      </div>
                    )}
                    <h3 
                      className="text-xl font-black uppercase leading-none group-hover:text-[#CCAA4C] transition-colors mb-2"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="text-2xl font-black tracking-tighter"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
