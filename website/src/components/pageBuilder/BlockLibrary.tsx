'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { BLOCK_LIBRARY, BlockCategory, BlockType, BlockDefinition } from '@/lib/pageBuilder'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface BlockLibraryProps {
  onAddBlock: (type: BlockType) => void
}

const CATEGORIES: { id: BlockCategory; label: string; icon: string }[] = [
  { id: 'atomic', label: 'Atomic Tawk', icon: '☢️' },
  { id: 'hero', label: 'Hero', icon: '🎯' },
  { id: 'content', label: 'Content', icon: '📝' },
  { id: 'media', label: 'Media', icon: '🎬' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'commerce', label: 'Commerce', icon: '🛒' },
  { id: 'layout', label: 'Layout', icon: '📐' },
]

function DraggableBlock({ block, onAdd }: { block: BlockDefinition; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library_${block.type}`,
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onAdd}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
        isDragging 
          ? 'opacity-50 bg-[#CCAA4C]/20' 
          : 'hover:bg-[#353535]'
      }`}
    >
      <span className="text-lg">{block.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{block.name}</p>
        <p className="text-[#666] text-xs truncate">{block.description}</p>
      </div>
    </button>
  )
}

export function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<BlockCategory>>(
    new Set(['hero', 'content', 'media'])
  )

  const toggleCategory = (category: BlockCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const getBlocksByCategory = (category: BlockCategory) => 
    BLOCK_LIBRARY.filter(b => b.category === category)

  return (
    <div className="py-2">
      {CATEGORIES.map(category => {
        const blocks = getBlocksByCategory(category.id)
        const isExpanded = expandedCategories.has(category.id)

        return (
          <div key={category.id} className="mb-1">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[#353535]/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#666]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#666]" />
              )}
              <span className="text-sm">{category.icon}</span>
              <span className="text-[#CCAA4C] text-xs font-bold uppercase tracking-wide flex-1">
                {category.label}
              </span>
              <span className="text-[#666] text-xs">{blocks.length}</span>
            </button>

            {isExpanded && (
              <div className="px-2 pb-2">
                {blocks.map(block => (
                  <DraggableBlock
                    key={block.type}
                    block={block}
                    onAdd={() => onAddBlock(block.type)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
