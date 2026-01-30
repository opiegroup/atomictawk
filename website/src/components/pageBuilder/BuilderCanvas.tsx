'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageBlock, PageGlobals, getBlockDefinition } from '@/lib/pageBuilder'
import { BlockRenderer } from './BlockRenderer'
import { GripVertical, Trash2, Copy, Eye, EyeOff } from 'lucide-react'

interface BuilderCanvasProps {
  blocks: PageBlock[]
  globals: PageGlobals
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onDeleteBlock: (id: string) => void
  onDuplicateBlock: (id: string) => void
}

interface SortableBlockProps {
  block: PageBlock
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
}

function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const definition = getBlockDefinition(block.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      {/* Block Wrapper */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        className={`relative border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-[#CCAA4C] shadow-[0_0_20px_rgba(204,170,76,0.3)]'
            : 'border-transparent hover:border-[#CCAA4C]/50'
        } ${!block.visible ? 'opacity-50' : ''}`}
      >
        {/* Block Controls - Top Bar */}
        <div
          className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-[#252525]/95 backdrop-blur-sm border-b border-[#CCAA4C] transition-all ${
            isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          {/* Left - Drag Handle & Type */}
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-[#888] hover:text-white cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#CCAA4C] font-bold uppercase tracking-wide">
              {definition?.icon} {definition?.name}
            </span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1.5 text-[#888] hover:text-white hover:bg-[#353535] rounded"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-[#888] hover:text-red-500 hover:bg-red-500/10 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Click to Edit Indicator */}
        {!isSelected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="bg-[#CCAA4C] text-[#1a1a1a] px-4 py-2 rounded font-bold text-sm shadow-lg">
              Click to Edit
            </span>
          </div>
        )}

        {/* Block Content */}
        <div className="pointer-events-none">
          <BlockRenderer block={block} isEditing />
        </div>
      </div>
    </div>
  )
}

export function BuilderCanvas({
  blocks,
  globals,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: BuilderCanvasProps) {
  // Background textures
  const textureStyles: Record<string, string> = {
    plain: '',
    metal: 'bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]',
    'poster-paper': 'bg-[#E3E2D5]',
    concrete: 'bg-[#3a3a3a]',
  }

  if (blocks.length === 0) {
    return (
      <div 
        className={`min-h-[600px] border-4 border-dashed border-[#353535] rounded-lg flex items-center justify-center ${textureStyles[globals.backgroundTexture]}`}
      >
        <div className="text-center p-8">
          <p className="text-[#666] text-lg font-bold uppercase tracking-wide mb-2">
            Empty Canvas
          </p>
          <p className="text-[#555] text-sm">
            Drag blocks from the library or click to add
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-[600px] border-2 border-[#353535] rounded-lg overflow-hidden ${textureStyles[globals.backgroundTexture]}`}
      onClick={() => onSelectBlock(null)}
    >
      <div className="space-y-0">
        {blocks
          .sort((a, b) => a.order - b.order)
          .map(block => (
            <SortableBlock
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onDelete={() => onDeleteBlock(block.id)}
              onDuplicate={() => onDuplicateBlock(block.id)}
            />
          ))}
      </div>
    </div>
  )
}
