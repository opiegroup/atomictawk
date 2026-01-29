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
        onClick={onSelect}
        className={`relative border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-[#CCAA4C] shadow-[0_0_20px_rgba(204,170,76,0.3)]'
            : 'border-transparent hover:border-[#CCAA4C]/50'
        } ${!block.visible ? 'opacity-50' : ''}`}
      >
        {/* Block Controls */}
        <div
          className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-2 py-1 bg-[#252525] rounded-t border border-[#353535] transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {/* Left - Drag Handle & Type */}
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-[#666] hover:text-white cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#CCAA4C] font-bold uppercase">
              {definition?.icon} {definition?.name}
            </span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1 text-[#666] hover:text-white"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-[#666] hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Block Content */}
        <BlockRenderer block={block} isEditing />
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
