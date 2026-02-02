import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Tag, Package, Wrench, Box, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StoreClient from "./StoreClient";

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

async function getStoreData() {
  const supabase = await createClient();

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .rpc('get_products', { p_limit: 100 })
    .order('sort_order', { ascending: true });

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  // Fetch categories
  const { data: dbCategories, error: categoriesError } = await supabase
    .from('product_categories')
    .select('name, slug')
    .order('sort_order', { ascending: true });

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  // Add "All" category at the beginning
  const categories: ProductCategory[] = [
    { name: "All", slug: "all" },
    ...(dbCategories || []),
  ];

  return {
    products: (products || []) as Product[],
    categories,
  };
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function StorePage() {
  const { products, categories } = await getStoreData();

  return (
    <div className="min-h-screen bg-[#E3E2D5]">
      {/* Store Header */}
      <div className="bg-[#CCAA4C] border-b-8 border-[#353535] py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 halftone-overlay opacity-20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Package className="w-full h-full text-[#353535]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#353535] text-white px-3 py-1 text-[11px] font-black uppercase tracking-widest">
              Authorized Personnel Only
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#353535]/60">
              Ref No: 77-AT-MCH-01
            </span>
          </div>
          <h1 
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] max-w-3xl text-[#353535]"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Official Mechanical Requisition
          </h1>
          <p className="text-lg text-[#353535]/80 mt-4 max-w-xl">
            Government-issue gear for the mechanically inclined. Approved by Atomic Tawk.
          </p>
        </div>
      </div>

      {/* Category Filter - Client Component for interactivity */}
      <StoreClient products={products} categories={categories} />

      {/* 3D Configurator Banner */}
      <div className="max-w-[1200px] mx-auto px-6 pt-12">
        <div className="industrial-border bg-[#353535] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 halftone-overlay opacity-10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
            <Box className="w-full h-full text-[#CCAA4C]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-8 h-8 text-[#CCAA4C]" />
                <span className="bg-[#CCAA4C] text-[#353535] px-3 py-1 text-xs font-black uppercase tracking-widest">
                  Coming Soon
                </span>
              </div>
              <h2 
                className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                3D Workshop Configurator
              </h2>
              <p className="text-[#E3E2D5]/80 max-w-xl">
                Design your perfect workshop setup with our interactive 3D configurator. 
                Customize workbenches, cabinets, and storage solutions to fit your exact specifications.
              </p>
            </div>
            <div className="shrink-0">
              <button 
                disabled
                className="bg-[#CCAA4C]/20 text-[#CCAA4C] border-2 border-[#CCAA4C] px-8 py-4 font-black uppercase tracking-widest text-sm cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Launch Configurator
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <section className="bg-[#353535] py-12 border-t-8 border-[#CCAA4C] mt-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <ShoppingCart className="w-8 h-8 text-[#CCAA4C] mb-4" />
              <h3 className="text-white font-black uppercase tracking-widest mb-2">Secure Checkout</h3>
              <p className="text-[#E3E2D5]/80 text-sm">Powered by Stripe for safe transactions</p>
            </div>
            <div className="flex flex-col items-center">
              <Package className="w-8 h-8 text-[#CCAA4C] mb-4" />
              <h3 className="text-white font-black uppercase tracking-widest mb-2">Worldwide Shipping</h3>
              <p className="text-[#E3E2D5]/80 text-sm">We ship to most locations on Earth</p>
            </div>
            <div className="flex flex-col items-center">
              <Tag className="w-8 h-8 text-[#CCAA4C] mb-4" />
              <h3 className="text-white font-black uppercase tracking-widest mb-2">Quality Guaranteed</h3>
              <p className="text-[#E3E2D5]/80 text-sm">All items approved by the Mechanical Guild</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
