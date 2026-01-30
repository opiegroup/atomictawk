'use client'

import { PageLayout, PageBlock } from '@/lib/pageBuilder'
import { BlockRenderer } from './BlockRenderer'
import { FeaturedContent } from '@/components/FeaturedContent'

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

  // Helper to render a block - handle propagandaGrid specially to bypass BlockRenderer switch case issue
  const renderBlock = (block: PageBlock) => {
    // For propagandaGrid, render FeaturedContent directly
    if (block.type === 'propagandaGrid') {
      return (
        <FeaturedContent 
          key={block.id}
          heading={block.props?.heading || 'Featured Propaganda'}
          maxItems={block.props?.maxItems || 3}
          showHeading={true}
        />
      )
    }
    // For all other blocks, use BlockRenderer
    return (
      <BlockRenderer 
        key={block.id} 
        block={block} 
        isEditing={false}
      />
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses} ${textureClasses[globals.backgroundTexture] || ''}`}>
      {sortedBlocks.map(renderBlock)}
    </div>
  )
}
