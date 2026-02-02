'use client'

import { useState, useRef } from 'react'
import { PageBlock, PageGlobals, getBlockDefinition } from '@/lib/pageBuilder'
import { BlockRenderer } from './BlockRenderer'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import type { DragState } from './PageBuilder'

interface BuilderCanvasProps {
  blocks: PageBlock[]
  globals: PageGlobals
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onDeleteBlock: (id: string) => void
  onDuplicateBlock: (id: string) => void
  onDrop: (index: number) => void
  onBlockDragStart: (blockId: string) => void
  onBlockDragEnd: () => void
  dragState: DragState
}

interface DraggableBlockProps {
  block: PageBlock
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: (index: number) => void
  isDragging: boolean
  dragState: DragState
}

function DraggableBlock({ 
  block, 
  index, 
  isSelected, 
  onSelect, 
  onDelete, 
  onDuplicate,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
  dragState,
}: DraggableBlockProps) {
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const definition = getBlockDefinition(block.type)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', block.id)
    onDragStart()
  }

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!blockRef.current) return
    
    const rect = blockRef.current.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    
    if (e.clientY < midpoint) {
      setDropPosition('above')
    } else {
      setDropPosition('below')
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    setDropPosition(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const dropIndex = dropPosition === 'above' ? index : index + 1
    onDrop(dropIndex)
    setDropPosition(null)
  }

  return (
    <div
      ref={blockRef}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Indicator Above */}
      {dropPosition === 'above' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCAA4C] z-30 -translate-y-1/2" />
      )}

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
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              className="p-1 text-[#888] hover:text-white cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </div>
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

      {/* Drop Indicator Below */}
      {dropPosition === 'below' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CCAA4C] z-30 translate-y-1/2" />
      )}
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
  onDrop,
  onBlockDragStart,
  onBlockDragEnd,
  dragState,
}: BuilderCanvasProps) {
  const [isOverCanvas, setIsOverCanvas] = useState(false)
  
  // Background textures
  const textureStyles: Record<string, string> = {
    plain: '',
    metal: 'bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]',
    'poster-paper': 'bg-[#E3E2D5]',
    concrete: 'bg-[#3a3a3a]',
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOverCanvas(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if we're leaving the canvas entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOverCanvas(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOverCanvas(false)
    // Drop at the end if dropped on empty canvas
    onDrop(blocks.length)
  }

  if (blocks.length === 0) {
    return (
      <div 
        className={`min-h-[600px] border-4 border-dashed rounded-lg flex items-center justify-center transition-colors ${
          isOverCanvas && dragState.isDragging
            ? 'border-[#CCAA4C] bg-[#CCAA4C]/10'
            : 'border-[#353535]'
        } ${textureStyles[globals.backgroundTexture]}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center p-8">
          <p className="text-[#666] text-lg font-bold uppercase tracking-wide mb-2">
            {dragState.isDragging ? 'Drop Block Here' : 'Empty Canvas'}
          </p>
          <p className="text-[#555] text-sm">
            {dragState.isDragging ? 'Release to add block' : 'Drag blocks from the library or click to add'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-[600px] border-2 rounded-lg overflow-hidden transition-colors ${
        isOverCanvas && dragState.isDragging
          ? 'border-[#CCAA4C]'
          : 'border-[#353535]'
      } ${textureStyles[globals.backgroundTexture]}`}
      onClick={() => onSelectBlock(null)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-0">
        {blocks
          .sort((a, b) => a.order - b.order)
          .map((block, index) => (
            <DraggableBlock
              key={block.id}
              block={block}
              index={index}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onDelete={() => onDeleteBlock(block.id)}
              onDuplicate={() => onDuplicateBlock(block.id)}
              onDragStart={() => onBlockDragStart(block.id)}
              onDragEnd={onBlockDragEnd}
              onDrop={onDrop}
              isDragging={dragState.draggedBlockId === block.id}
              dragState={dragState}
            />
          ))}
      </div>
    </div>
  )
}
