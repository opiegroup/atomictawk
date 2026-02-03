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

// Helper to convert spacing size to CSS value
function getSpacingValue(size: string | undefined): string {
  switch (size) {
    case 'none': return '0'
    case 'small': return '8px'
    case 'medium': return '16px'
    case 'large': return '32px'
    case 'xlarge': return '64px'
    default: return '0'
  }
}

// Wrapper component for spacing - uses padding with background to avoid white gaps
function SpacingWrapper({ block, children }: { block: PageBlock, children: React.ReactNode }) {
  const styling = block.styling || {}
  const hasMargin = styling.marginTop || styling.marginBottom
  const hasPadding = (styling.paddingTop && styling.paddingTop !== 'none') || 
                     (styling.paddingBottom && styling.paddingBottom !== 'none')
  
  if (!hasMargin && !hasPadding) return <>{children}</>
  
  // Use padding instead of margin and apply dark background to prevent white gaps
  const bgColor = styling.backgroundColor || styling.backgroundGradient || '#1a1a1a'
  
  return (
    <div style={{
      // Margin (outside space) - applied as padding with background
      paddingTop: styling.marginTop ? getSpacingValue(styling.marginTop) : undefined,
      paddingBottom: styling.marginBottom ? getSpacingValue(styling.marginBottom) : undefined,
      background: hasMargin ? bgColor : undefined,
    }}>
      <div style={{
        // Padding (inside space)
        paddingTop: styling.paddingTop && styling.paddingTop !== 'none' ? getSpacingValue(styling.paddingTop) : undefined,
        paddingBottom: styling.paddingBottom && styling.paddingBottom !== 'none' ? getSpacingValue(styling.paddingBottom) : undefined,
      }}>
        {children}
      </div>
    </div>
  )
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
            <SpacingWrapper key={block.id} block={block}>
              <FeaturedProducts
                heading={props.heading || 'Featured Products'}
                maxItems={props.maxItems || 4}
                showHeading={true}
              />
            </SpacingWrapper>
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
          <SpacingWrapper key={block.id} block={block}>
            <FeaturedContent
              heading={props.heading || 'Featured Propaganda'}
              maxItems={props.maxItems || 3}
            />
          </SpacingWrapper>
        )

      // Use actual LatestBroadcasts component for live content from database
      case 'broadcastList':
        return (
          <SpacingWrapper key={block.id} block={block}>
            <LatestBroadcasts
              heading={props.heading || 'Latest Broadcasts'}
              maxItems={props.maxItems || 3}
            />
          </SpacingWrapper>
        )

      // Use actual BlokeScienceSlider for auto-play animation
      case 'blokeScienceSlider':
        return (
          <SpacingWrapper key={block.id} block={block}>
            <BlokeScienceSlider
              facts={props.scienceFacts?.map((fact: any, i: number) => ({
                title: fact.title || `Fact #${i + 1}`,
                fact: fact.fact || fact.content || '',
              }))}
            />
          </SpacingWrapper>
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
