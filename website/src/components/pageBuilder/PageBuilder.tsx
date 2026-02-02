'use client'

import { useState, useCallback } from 'react'
import { 
  PageLayout, 
  PageBlock, 
  BlockType,
  createNewBlock,
  createDefaultPageLayout,
  getBlockDefinition,
} from '@/lib/pageBuilder'
import { BlockLibrary } from './BlockLibrary'
import { BuilderCanvas } from './BuilderCanvas'
import { BlockSettings } from './BlockSettings'
import { GlobalSettings } from './GlobalSettings'
import { 
  Save, 
  Upload, 
  Monitor, 
  Tablet, 
  Smartphone,
  Settings,
  Layers
} from 'lucide-react'

interface PageBuilderProps {
  initialLayout?: PageLayout
  pageId?: string
  pageSlug?: string
  onSave?: (layout: PageLayout) => Promise<void>
  onPublish?: (layout: PageLayout) => Promise<void>
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'
type RightPanelTab = 'block' | 'global'

export interface DragState {
  isDragging: boolean
  dragType: 'library' | 'reorder' | null
  draggedBlockType: BlockType | null
  draggedBlockId: string | null
}

export function PageBuilder({ 
  initialLayout, 
  pageId, 
  pageSlug,
  onSave,
  onPublish,
}: PageBuilderProps) {
  const [layout, setLayout] = useState<PageLayout>(initialLayout || createDefaultPageLayout())
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('block')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    draggedBlockType: null,
    draggedBlockId: null,
  })

  const selectedBlock = layout.blocks.find(b => b.id === selectedBlockId)

  // Add block to canvas
  const handleAddBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock = createNewBlock(type)
    setLayout(prev => {
      const newBlocks = [...prev.blocks]
      const insertIndex = index !== undefined ? index : newBlocks.length
      newBlocks.splice(insertIndex, 0, newBlock)
      return {
        ...prev,
        blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
      }
    })
    setSelectedBlockId(newBlock.id)
    setRightPanelTab('block')
  }, [])

  // Update block props
  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<PageBlock>) => {
    setLayout(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === blockId ? { ...b, ...updates } : b
      ),
    }))
  }, [])

  // Delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    setLayout(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId),
    }))
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }, [selectedBlockId])

  // Duplicate block
  const handleDuplicateBlock = useCallback((blockId: string) => {
    const block = layout.blocks.find(b => b.id === blockId)
    if (!block) return

    const newBlock: PageBlock = {
      ...block,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: layout.blocks.length,
    }
    
    setLayout(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }))
    setSelectedBlockId(newBlock.id)
  }, [layout.blocks])

  // Move block
  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setLayout(prev => {
      const newBlocks = [...prev.blocks]
      const [removed] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, removed)
      return {
        ...prev,
        blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
      }
    })
  }, [])

  // Update global settings
  const handleUpdateGlobals = useCallback((updates: Partial<PageLayout['globals']>) => {
    setLayout(prev => ({
      ...prev,
      globals: { ...prev.globals, ...updates },
    }))
  }, [])

  // Drag handlers for library items
  const handleLibraryDragStart = useCallback((type: BlockType) => {
    setDragState({
      isDragging: true,
      dragType: 'library',
      draggedBlockType: type,
      draggedBlockId: null,
    })
  }, [])

  // Drag handlers for reordering
  const handleBlockDragStart = useCallback((blockId: string) => {
    setDragState({
      isDragging: true,
      dragType: 'reorder',
      draggedBlockType: null,
      draggedBlockId: blockId,
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      draggedBlockType: null,
      draggedBlockId: null,
    })
  }, [])

  // Drop handler for canvas
  const handleCanvasDrop = useCallback((dropIndex: number) => {
    if (dragState.dragType === 'library' && dragState.draggedBlockType) {
      handleAddBlock(dragState.draggedBlockType, dropIndex)
    } else if (dragState.dragType === 'reorder' && dragState.draggedBlockId) {
      const fromIndex = layout.blocks.findIndex(b => b.id === dragState.draggedBlockId)
      if (fromIndex !== -1 && fromIndex !== dropIndex) {
        handleMoveBlock(fromIndex, dropIndex)
      }
    }
    handleDragEnd()
  }, [dragState, handleAddBlock, handleMoveBlock, handleDragEnd, layout.blocks])

  // Save draft
  const handleSave = async () => {
    if (!onSave) {
      alert('Save handler not configured')
      return
    }
    setSaving(true)
    try {
      await onSave(layout)
    } catch (error) {
      alert('Error saving: ' + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // Publish
  const handlePublish = async () => {
    if (!onPublish) return
    setPublishing(true)
    try {
      await onPublish(layout)
    } finally {
      setPublishing(false)
    }
  }

  const canvasWidths = {
    desktop: 'max-w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[375px]',
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a]">
      {/* Top Toolbar */}
      <div className="h-14 bg-[#252525] border-b-4 border-[#CCAA4C] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold uppercase tracking-wider text-sm">
            Page Builder
          </h1>
          {pageSlug && (
            <span className="text-[#CCAA4C] text-xs font-mono bg-[#353535] px-2 py-1 rounded">
              /{pageSlug}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#353535] rounded p-1">
          {[
            { mode: 'desktop' as ViewMode, icon: Monitor, label: 'Desktop' },
            { mode: 'tablet' as ViewMode, icon: Tablet, label: 'Tablet' },
            { mode: 'mobile' as ViewMode, icon: Smartphone, label: 'Mobile' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded transition-colors ${
                viewMode === mode 
                  ? 'bg-[#CCAA4C] text-[#1a1a1a]' 
                  : 'text-[#888] hover:text-white'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#353535] text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-[#454545] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold uppercase tracking-wide rounded hover:bg-[#CCAA4C]/80 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {publishing ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Block Library */}
        <div className="w-64 bg-[#252525] border-r-2 border-[#353535] overflow-y-auto">
          <div className="p-4 border-b-2 border-[#353535]">
            <h2 className="text-[#CCAA4C] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Block Library
            </h2>
          </div>
          <BlockLibrary 
            onAddBlock={handleAddBlock} 
            onDragStart={handleLibraryDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-[#1a1a1a] overflow-auto p-8">
          <div className={`mx-auto transition-all duration-300 ${canvasWidths[viewMode]}`}>
            <BuilderCanvas
              blocks={layout.blocks}
              globals={layout.globals}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onDrop={handleCanvasDrop}
              onBlockDragStart={handleBlockDragStart}
              onBlockDragEnd={handleDragEnd}
              dragState={dragState}
            />
          </div>
        </div>

        {/* Right Panel - Settings */}
        <div className="w-80 bg-[#252525] border-l-2 border-[#353535] flex flex-col">
          <div className="flex border-b-2 border-[#353535]">
            <button
              onClick={() => setRightPanelTab('block')}
              className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                rightPanelTab === 'block'
                  ? 'bg-[#353535] text-[#CCAA4C]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              Block Settings
            </button>
            <button
              onClick={() => setRightPanelTab('global')}
              className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                rightPanelTab === 'global'
                  ? 'bg-[#353535] text-[#CCAA4C]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Page
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightPanelTab === 'block' ? (
              selectedBlock ? (
                <BlockSettings
                  block={selectedBlock}
                  onUpdate={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
                  onDelete={() => handleDeleteBlock(selectedBlock.id)}
                  onDuplicate={() => handleDuplicateBlock(selectedBlock.id)}
                />
              ) : (
                <div className="p-6 text-center text-[#666]">
                  <p className="text-sm">Select a block to edit</p>
                  <p className="text-xs mt-2">or drag a block from the library</p>
                </div>
              )
            ) : (
              <GlobalSettings
                globals={layout.globals}
                onUpdate={handleUpdateGlobals}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
