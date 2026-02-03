'use client'

import { PageLayout, PageBlock } from '@/lib/pageBuilder'
import { BlockRenderer } from './BlockRenderer'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { FeaturedContent } from '@/components/FeaturedContent'
import { LatestBroadcasts } from '@/components/LatestBroadcasts'
import { BlokeScienceSlider } from '@/components/BlokeScienceSlider'

interface PageRendererProps {
  layout: PageLayout
}

export function PageRenderer({ layout }: PageRendererProps) {
  const { globals, blocks } = layout

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  // Background texture classes
  const textureClasses: Record<string, string> = {
    plain: '',
    metal: 'bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a]',
    'poster-paper': 'bg-[#E3E2D5]',
    concrete: 'bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a]',
  }

  // Theme classes
  const themeClasses = globals.theme === 'atomic-light' 
    ? 'bg-[#E3E2D5] text-[#353535]' 
    : 'bg-[#1a1a1a] text-white'

  // Render blocks - use BlockRenderer for customizable styling, actual components for data-driven content
  const renderBlock = (block: PageBlock) => {
    // Skip invisible blocks
    if (block.visible === false) return null
    
    const props = block.props || {}

    switch (block.type) {
      // Use actual FeaturedProducts component for live data from database
      case 'productEmbed':
        if (props.dataSource === 'featured' || !props.dataSource) {
          return (
            <FeaturedProducts
              key={block.id}
              heading={props.heading || 'Featured Products'}
              maxItems={props.maxItems || 4}
              showHeading={true}
            />
          )
        }
        return (
          <BlockRenderer 
            key={block.id} 
            block={block} 
            isEditing={false}
          />
        )

      // Use actual FeaturedContent component for live articles from database
      case 'propagandaGrid':
        return (
          <FeaturedContent
            key={block.id}
            heading={props.heading || 'Featured Propaganda'}
            maxItems={props.maxItems || 3}
          />
        )

      // Use actual LatestBroadcasts component for live content from database
      case 'broadcastList':
        return (
          <LatestBroadcasts
            key={block.id}
            heading={props.heading || 'Latest Broadcasts'}
            maxItems={props.maxItems || 3}
          />
        )

      // Use actual BlokeScienceSlider for auto-play animation
      case 'blokeScienceSlider':
        return (
          <BlokeScienceSlider
            key={block.id}
            facts={props.scienceFacts?.map((fact: any, i: number) => ({
              title: fact.title || `Fact #${i + 1}`,
              fact: fact.fact || fact.content || '',
            }))}
          />
        )

      // All other blocks (including tickerBar) use BlockRenderer - respects custom styling
      default:
        return (
          <BlockRenderer 
            key={block.id} 
            block={block} 
            isEditing={false}
          />
        )
    }
  }

  return (
    <div className={`min-h-screen ${themeClasses} ${textureClasses[globals.backgroundTexture] || ''}`}>
      {sortedBlocks.map(renderBlock)}
    </div>
  )
}
