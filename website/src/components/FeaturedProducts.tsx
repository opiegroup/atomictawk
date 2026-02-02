'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Loader2, Package, Tag, ArrowRight } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: string[]
  in_stock: boolean
  serial_no: string | null
}

interface FeaturedProductsProps {
  heading?: string
  headingVariant?: 'left' | 'center' | 'right'
  maxItems?: number
  showHeading?: boolean
  className?: string
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function FeaturedProducts({
  heading = 'Garage Essentials',
  headingVariant = 'left',
  maxItems = 4,
  showHeading = true,
  className = '',
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [maxItems])

  const fetchFeaturedProducts = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('[FeaturedProducts] No Supabase client available')
      setLoading(false)
      return
    }

    try {
      // Fetch published products, ordered by sort_order
      const { data, error } = await (supabase as any)
        .from('products')
        .select('id, name, slug, price, compare_price, images, in_stock, serial_no')
        .eq('status', 'published')
        .eq('in_stock', true)
        .order('sort_order', { ascending: true })
        .limit(maxItems)

      if (error) {
        console.error('[FeaturedProducts] Error:', error.message)
      } else {
        console.log('[FeaturedProducts] Fetched:', data?.length || 0, 'products')
        setProducts(data || [])
      }
    } catch (err) {
      console.error('[FeaturedProducts] Exception:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className={`bg-[#1f1c13] py-16 border-y-4 border-[#CCAA4C] ${className}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#CCAA4C]" />
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className={`bg-[#1f1c13] py-16 border-y-4 border-[#CCAA4C] ${className}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          {showHeading && (
            <div className={`flex items-center gap-6 mb-12 ${headingVariant === 'right' ? 'flex-row-reverse' : headingVariant === 'center' ? 'justify-center' : ''}`}>
              <h2 
                className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#CCAA4C] text-[#353535] px-6 py-2"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {heading}
              </h2>
              {headingVariant !== 'center' && <div className="flex-grow h-1 bg-[#CCAA4C]"></div>}
            </div>
          )}
          <div className="border-2 border-dashed border-[#CCAA4C]/30 rounded-lg p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-[#CCAA4C]/30" />
            <p className="text-white/50">No products available yet</p>
            <p className="text-sm text-white/30 mt-1">Products can be added in Admin → Products</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`bg-[#1f1c13] py-16 border-y-4 border-[#CCAA4C] ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div className={`flex items-center gap-6 ${headingVariant === 'right' ? 'flex-row-reverse' : headingVariant === 'center' ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#CCAA4C] flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-[#353535]" />
              </div>
              <div>
                <h2 
                  className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {heading}
                </h2>
                <p className="text-[#CCAA4C] text-xs uppercase tracking-widest font-bold">
                  Official Atomic Tawk Merchandise
                </p>
              </div>
            </div>
            {headingVariant !== 'center' && <div className="hidden md:block flex-grow h-1 bg-[#CCAA4C]/30"></div>}
          </div>
          
          {/* View All Link */}
          <Link 
            href="/store" 
            className="group flex items-center gap-2 text-[#CCAA4C] hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
          >
            Browse All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const imageUrl = product.images && product.images.length > 0
              ? (typeof product.images === 'string' 
                  ? JSON.parse(product.images)[0] 
                  : product.images[0])
              : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"

            const hasDiscount = product.compare_price && product.compare_price > product.price

            return (
              <Link 
                href={`/store/${product.slug}`} 
                key={product.id}
                className="group"
              >
                <div className="bg-[#252219] border-2 border-[#353535] hover:border-[#CCAA4C] transition-all p-4 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="aspect-square bg-[#353535] mb-4 relative overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 bg-[#FF6B35] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1">
                        Sale
                      </div>
                    )}
                    
                    {/* Stock Badge */}
                    {product.in_stock && (
                      <div className="absolute top-2 right-2 bg-[#39FF14] text-[#353535] text-[10px] font-black uppercase tracking-wider px-2 py-1">
                        In Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow flex flex-col">
                    {product.serial_no && (
                      <span className="text-[#CCAA4C] text-[10px] font-bold uppercase tracking-widest mb-1">
                        {product.serial_no}
                      </span>
                    )}
                    
                    <h3 
                      className="text-white text-sm md:text-base font-black uppercase leading-tight group-hover:text-[#CCAA4C] transition-colors mb-2 flex-grow"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-white text-lg md:text-xl font-black"
                        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-white/40 text-sm line-through">
                          {formatPrice(product.compare_price!)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link 
            href="/store"
            className="inline-flex items-center gap-3 bg-[#CCAA4C] hover:bg-white text-[#353535] px-8 py-4 font-black uppercase tracking-widest text-sm transition-colors"
          >
            <Tag className="w-5 h-5" />
            Shop The Full Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
