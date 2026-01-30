'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Radio, Headphones, Share2, Heart, Loader2, Calendar } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

interface Broadcast {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string
  published_at: string
  category: {
    slug: string
    name: string
  } | null
}

interface LatestBroadcastsProps {
  heading?: string
  headingVariant?: 'left' | 'right'
  maxItems?: number
  showViewAllButton?: boolean
  viewAllLink?: string
  viewAllText?: string
  variant?: 'list' | 'grid' | 'compact'
  className?: string
}

export function LatestBroadcasts({
  heading = 'Latest Broadcasts',
  headingVariant = 'left',
  maxItems = 5,
  showViewAllButton = true,
  viewAllLink = '/shows',
  viewAllText = 'View All Broadcasts',
  variant = 'list',
  className = '',
}: LatestBroadcastsProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBroadcasts()
  }, [maxItems])

  const fetchBroadcasts = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('[LatestBroadcasts] No Supabase client available')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .from('content')
        .select(`
          id,
          title,
          slug,
          description,
          thumbnail_url,
          published_at,
          category:categories(slug, name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(maxItems)

      if (error) {
        console.error('[LatestBroadcasts] Error:', error.message)
      } else {
        console.log('[LatestBroadcasts] Fetched:', data?.length || 0, 'items')
        setBroadcasts(data || [])
      }
    } catch (err) {
      console.error('[LatestBroadcasts] Exception:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <section className={`max-w-[1200px] mx-auto px-6 py-16 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#CCAA4C]" />
        </div>
      </section>
    )
  }

  if (broadcasts.length === 0) {
    return (
      <section className={`max-w-[1200px] mx-auto px-6 py-16 ${className}`}>
        {/* Section Heading */}
        <div className={`flex items-center gap-6 mb-12 ${headingVariant === 'right' ? 'flex-row-reverse' : ''}`}>
          <h2 
            className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {heading}
          </h2>
          <div className="flex-grow h-1 bg-[#353535]"></div>
        </div>
        <div className="border-2 border-dashed border-[#353535]/30 rounded-lg p-12 text-center">
          <Radio className="w-12 h-12 mx-auto mb-4 text-[#353535]/30" />
          <p className="text-[#353535]/50">No broadcasts available yet</p>
          <p className="text-sm text-[#353535]/30 mt-1">Content can be added in Admin → Content</p>
        </div>
      </section>
    )
  }

  return (
    <section className={`max-w-[1200px] mx-auto px-6 py-16 ${className}`}>
      {/* Section Heading */}
      <div className={`flex items-center gap-6 mb-12 ${headingVariant === 'right' ? 'flex-row-reverse' : ''}`}>
        <h2 
          className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {heading}
        </h2>
        <div className="flex-grow h-1 bg-[#353535]"></div>
      </div>

      {/* List Variant */}
      {variant === 'list' && (
        <div className="space-y-4">
          {broadcasts.map((item) => (
            <Link 
              href={`/shows/${item.category?.slug || 'general'}/${item.slug}`} 
              key={item.id}
              className="block"
            >
              <div className="flex flex-col md:flex-row items-stretch border-4 border-[#353535] bg-white group hover:border-[#CCAA4C] transition-colors">
                {/* Thumbnail */}
                <div className="w-full md:w-56 aspect-video md:aspect-auto md:h-auto bg-[#353535] shrink-0 relative overflow-hidden">
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[120px] flex items-center justify-center text-[#CCAA4C]">
                      <Radio className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#CCAA4C] uppercase tracking-wider">
                      {item.category?.name || 'Broadcast'}
                    </span>
                    <span className="text-xs text-[#353535]/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.published_at)}
                    </span>
                  </div>
                  <h4 
                    className="text-xl md:text-2xl font-black uppercase group-hover:text-[#CCAA4C] transition-colors mb-2"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-[#353535]/70 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4 px-6 text-[#353535]/30 border-l border-[#353535]/10">
                  <Headphones className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer transition-colors" />
                  <Share2 className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer transition-colors" />
                  <Heart className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid Variant */}
      {variant === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {broadcasts.map((item) => (
            <Link 
              href={`/shows/${item.category?.slug || 'general'}/${item.slug}`} 
              key={item.id}
              className="block group"
            >
              <div className="border-4 border-[#353535] bg-white hover:border-[#CCAA4C] transition-colors h-full">
                {/* Thumbnail */}
                <div className="aspect-video bg-[#353535] relative overflow-hidden">
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#CCAA4C]">
                      <Radio className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#CCAA4C] text-[#353535] text-[10px] font-black uppercase tracking-wider px-2 py-1">
                      {item.category?.name || 'Broadcast'}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="text-xs text-[#353535]/50 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.published_at)}
                  </div>
                  <h4 
                    className="text-lg font-black uppercase group-hover:text-[#CCAA4C] transition-colors mb-2 line-clamp-2"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-[#353535]/70 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Compact Variant */}
      {variant === 'compact' && (
        <div className="space-y-3">
          {broadcasts.map((item) => (
            <Link 
              href={`/shows/${item.category?.slug || 'general'}/${item.slug}`} 
              key={item.id}
              className="flex items-center gap-4 p-3 bg-white border-2 border-[#353535]/20 hover:border-[#CCAA4C] transition-colors group"
            >
              <div className="w-16 h-16 bg-[#353535] shrink-0 relative overflow-hidden">
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#CCAA4C]">
                    <Radio className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-bold uppercase text-sm group-hover:text-[#CCAA4C] transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-[#353535]/50">{formatDate(item.published_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* View All Button */}
      {showViewAllButton && (
        <div className="text-center mt-12">
          <Link 
            href={viewAllLink} 
            className="inline-block px-8 py-4 bg-[#E3E2D5] text-[#353535] font-bold uppercase tracking-widest border-4 border-[#353535] hover:bg-[#353535] hover:text-white transition-colors"
          >
            {viewAllText}
          </Link>
        </div>
      )}
    </section>
  )
}
