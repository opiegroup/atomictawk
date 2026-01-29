'use client'

import { PageLayout } from '@/lib/pageBuilder'
import { BlockRenderer } from './BlockRenderer'

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

  return (
    <div className={`min-h-screen ${themeClasses} ${textureClasses[globals.backgroundTexture] || ''}`}>
      {sortedBlocks.map(block => (
        <BlockRenderer 
          key={block.id} 
          block={block} 
          isEditing={false}
        />
      ))}
    </div>
  )
}
