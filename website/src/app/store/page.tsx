import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import { ShoppingCart, Tag, Package, Wrench, Box, Settings } from "lucide-react";

// Mock products - in production these come from database
const products = [
  // Apparel & Merch
  {
    id: "1",
    name: "Logo Tee",
    slug: "logo-tee",
    price: 3200, // cents
    category: "apparel",
    serialNo: "AT-TEE-01",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    inStock: true,
  },
  {
    id: "2",
    name: "Mechanical Program Cap",
    slug: "mechanical-cap",
    price: 2800,
    category: "apparel",
    serialNo: "AT-CAP-05",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
    inStock: true,
  },
  {
    id: "3",
    name: "The Shed Poster",
    slug: "shed-poster",
    price: 2000,
    category: "poster",
    serialNo: "AT-PRNT-09",
    image: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800&q=80",
    inStock: true,
  },
  {
    id: "4",
    name: "Atomic Warning Sticker Pack",
    slug: "sticker-pack",
    price: 1200,
    category: "sticker",
    serialNo: "AT-STK-03",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    inStock: true,
  },
  // Workshop Equipment - Workbenches
  {
    id: "10",
    name: "Industrial Workbench - Standard",
    slug: "workbench-standard",
    price: 189900,
    category: "workbench",
    serialNo: "AT-WRK-01",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    inStock: true,
    configurable: true,
  },
  {
    id: "11",
    name: "Heavy Duty Workbench - Pro",
    slug: "workbench-pro",
    price: 289900,
    category: "workbench",
    serialNo: "AT-WRK-02",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    inStock: true,
    configurable: true,
  },
  {
    id: "12",
    name: "Hi-Lo Adjustable Workbench",
    slug: "workbench-hilo",
    price: 349900,
    category: "workbench",
    serialNo: "AT-WRK-03",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    inStock: true,
    configurable: true,
  },
  // Storage Cabinets
  {
    id: "20",
    name: "Industrial Tool Cabinet",
    slug: "cabinet-industrial",
    price: 249900,
    category: "cabinet",
    serialNo: "AT-CAB-01",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80",
    inStock: true,
    configurable: true,
  },
  {
    id: "21",
    name: "High Density Storage Cabinet",
    slug: "cabinet-highdensity",
    price: 319900,
    category: "cabinet",
    serialNo: "AT-CAB-02",
    image: "https://images.unsplash.com/photo-1597075561824-9a59e4d9fb01?w=800&q=80",
    inStock: true,
    configurable: true,
  },
  {
    id: "22",
    name: "Mobile Tool Cabinet",
    slug: "cabinet-mobile",
    price: 279900,
    category: "cabinet",
    serialNo: "AT-CAB-03",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    inStock: true,
    configurable: true,
  },
  // Secure Storage
  {
    id: "30",
    name: "Secure Equipment Locker - 6 Door",
    slug: "locker-6door",
    price: 189900,
    category: "locker",
    serialNo: "AT-LKR-01",
    image: "https://images.unsplash.com/photo-1558618047-f4b511e69617?w=800&q=80",
    inStock: true,
  },
  {
    id: "31",
    name: "Secure Equipment Locker - 14 Door",
    slug: "locker-14door",
    price: 289900,
    category: "locker",
    serialNo: "AT-LKR-02",
    image: "https://images.unsplash.com/photo-1558618047-f4b511e69617?w=800&q=80",
    inStock: true,
  },
  {
    id: "32",
    name: "Weapons Storage Cabinet",
    slug: "cabinet-weapons",
    price: 459900,
    category: "locker",
    serialNo: "AT-SEC-01",
    image: "https://images.unsplash.com/photo-1558618047-f4b511e69617?w=800&q=80",
    inStock: true,
  },
];

const categories = [
  { name: "All", slug: "all" },
  { name: "Apparel", slug: "apparel" },
  { name: "Workbenches", slug: "workbench" },
  { name: "Cabinets", slug: "cabinet" },
  { name: "Lockers", slug: "locker" },
  { name: "Posters", slug: "poster" },
  { name: "Stickers", slug: "sticker" },
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function StorePage() {
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

      {/* Category Filter */}
      <div className="border-b-4 border-[#353535] bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {categories.map((cat, index) => (
              <button
                key={cat.slug}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-r-2 border-[#353535]/20 hover:bg-[#CCAA4C]/20 transition-colors whitespace-nowrap ${
                  index === 0 ? "bg-[#353535] text-white" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

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

      {/* Products Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
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
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover mix-blend-multiply"
                  />
                  {/* Badges */}
                  {(product as typeof products[0] & { configurable?: boolean }).configurable && (
                    <div className="absolute top-4 left-4 bg-[#CCAA4C] text-[#353535] text-[9px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1 z-10">
                      <Settings className="w-3 h-3" />
                      3D Config
                    </div>
                  )}
                  {product.inStock && (
                    <div className="absolute top-4 right-4 stamp stamp-approved text-xs bg-white/90 px-3 py-1 z-10">
                      Approved
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-[#353535]/60 flex items-center justify-center">
                      <span className="text-white font-black uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="bg-[#353535] text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest inline-block mb-3">
                  {product.serialNo}
                </div>
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
          ))}

        </div>
      </div>

      {/* Store Info */}
      <section className="bg-[#353535] py-12 border-t-8 border-[#CCAA4C]">
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
