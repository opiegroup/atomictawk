'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Radio, Loader2, FileText } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

interface ContentItem {
  id: string
  title: string
  slug: string
  subtitle: string | null
  description: string
  thumbnail_url: string
  is_featured: boolean
  category: {
    slug: string
    name: string
  } | null
}

interface FeaturedContentProps {
  heading?: string
  headingVariant?: 'left' | 'center' | 'right'
  maxItems?: number
  showHeading?: boolean
  className?: string
}

export function FeaturedContent({
  heading = 'Featured Propaganda',
  headingVariant = 'left',
  maxItems = 3,
  showHeading = true,
  className = '',
}: FeaturedContentProps) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedContent()
  }, [maxItems])

  const fetchFeaturedContent = async () => {
    console.log('[FeaturedContent] Starting fetch...')
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn('[FeaturedContent] No Supabase client available')
      setLoading(false)
      return
    }

    try {
      // First, try to get all published content to debug
      const { data, error } = await (supabase as any)
        .from('content')
        .select(`
          id,
          title,
          slug,
          subtitle,
          description,
          thumbnail_url,
          is_featured,
          category:categories(slug, name)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(maxItems)

      if (error) {
        console.error('[FeaturedContent] Error:', error.message, error)
      } else {
        console.log('[FeaturedContent] Fetched:', data?.length || 0, 'featured items', data)
        setContent(data || [])
      }
    } catch (err) {
      console.error('[FeaturedContent] Exception:', err)
    } finally {
      setLoading(false)
    }
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

  if (content.length === 0) {
    return (
      <section className={`max-w-[1200px] mx-auto px-6 py-16 ${className}`}>
        {showHeading && (
          <div className={`flex items-center gap-6 mb-12 ${headingVariant === 'right' ? 'flex-row-reverse' : headingVariant === 'center' ? 'justify-center' : ''}`}>
            <h2 
              className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              {heading}
            </h2>
            {headingVariant !== 'center' && <div className="flex-grow h-1 bg-[#353535]"></div>}
          </div>
        )}
        <div className="border-2 border-dashed border-[#353535]/30 rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[#353535]/30" />
          <p className="text-[#353535]/50">No featured content yet</p>
          <p className="text-sm text-[#353535]/30 mt-1">Mark content as "Featured" in Admin → Content</p>
        </div>
      </section>
    )
  }

  return (
    <section className={`max-w-[1200px] mx-auto px-6 py-16 ${className}`}>
      {showHeading && (
        <div className={`flex items-center gap-6 mb-12 ${headingVariant === 'right' ? 'flex-row-reverse' : headingVariant === 'center' ? 'justify-center' : ''}`}>
          <h2 
            className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {heading}
          </h2>
          {headingVariant !== 'center' && <div className="flex-grow h-1 bg-[#353535]"></div>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
        {content.map((item, index) => (
          <PosterCard
            key={item.id}
            title={item.title}
            description={item.description}
            thumbnailUrl={item.thumbnail_url}
            href={`/shows/${item.category?.slug || 'general'}/${item.slug}`}
            reportNumber={item.subtitle || `Report #${String(index + 1).padStart(3, '0')}`}
            buttonText={getButtonText(item.category?.slug)}
          />
        ))}
      </div>
    </section>
  )
}

// Helper to get category-specific button text
function getButtonText(categorySlug?: string): string {
  switch (categorySlug) {
    case 'burnouts':
      return 'Analyze Data'
    case 'shed':
      return 'Study Blueprints'
    case 'gaming':
      return 'Initiate Simulation'
    case 'science':
      return 'View Research'
    case 'broadcasts':
      return 'Watch Now'
    default:
      return 'View Report'
  }
}

// Poster Card Component (matching existing design)
function PosterCard({
  title,
  description,
  thumbnailUrl,
  href,
  reportNumber,
  buttonText = "View Report"
}: {
  title: string
  description: string
  thumbnailUrl?: string
  href: string
  reportNumber?: string
  buttonText?: string
}) {
  return (
    <Link href={href} className="group block h-full">
      <div className="relative h-full flex flex-col bg-[#E3E2D5] p-4 border-4 border-[#353535] shadow-[8px_8px_0_#CCAA4C] hover:shadow-[12px_12px_0_#CCAA4C] transition-all">
        {/* Report Number Badge - z-20 to stay above image */}
        {reportNumber && (
          <div className="absolute top-0 right-0 z-20 bg-[#353535] text-[#E3E2D5] text-[10px] font-bold uppercase tracking-widest px-3 py-1">
            {reportNumber}
          </div>
        )}

        {/* Image Container with Gold Corner Accents */}
        <div className="relative mb-4">
          {/* Corner accents - z-10 to stay above image */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-[#CCAA4C] z-10"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-[#CCAA4C] z-10"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-[#CCAA4C] z-10"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-[#CCAA4C] z-10"></div>

          {/* Image */}
          <div className="aspect-[4/5] relative overflow-hidden bg-[#353535]">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#CCAA4C]">
                <Radio className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 
          className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-[#CCAA4C] transition-colors"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {title}
        </h3>

        {/* Description - flex-grow to push button to bottom */}
        <p className="text-sm italic text-[#353535]/70 mb-4 line-clamp-2 flex-grow">
          {description}
        </p>

        {/* CTA Button - mt-auto ensures it stays at bottom */}
        <div className="bg-[#353535] text-[#CCAA4C] text-center py-3 font-bold uppercase tracking-widest text-sm group-hover:bg-[#CCAA4C] group-hover:text-[#353535] transition-colors mt-auto">
          {buttonText}
        </div>
      </div>
    </Link>
  )
}
