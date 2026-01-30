'use client'

import { useState } from 'react'
import { PageBlock, getBlockDefinition, THEME_COLORS, ThemeColor, BlockStyling, BlockButton, ButtonsConfig } from '@/lib/pageBuilder'
import { Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronRight, Plus, Palette, Image, Frame, Type, Film, Move } from 'lucide-react'
import { MediaUpload } from './MediaUpload'

interface BlockSettingsProps {
  block: PageBlock
  onUpdate: (updates: Partial<PageBlock>) => void
  onDelete: () => void
  onDuplicate: () => void
}

// Collapsible Section Component
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  icon?: any
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-t border-[#353535]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#2a2a2a] transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#888]">
          {Icon && <Icon className="w-4 h-4 text-[#CCAA4C]" />}
          {title}
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[#666]" /> : <ChevronRight className="w-4 h-4 text-[#666]" />}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

// Color Field with presets
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const presetColors = [
    { value: '', label: 'Default' },
    { value: '#CCAA4C', label: 'Gold' },
    { value: '#FF6B35', label: 'Orange' },
    { value: '#39FF14', label: 'Green' },
    { value: '#353535', label: 'Charcoal' },
    { value: '#1a1a1a', label: 'Black' },
    { value: '#E3E2D5', label: 'Cream' },
    { value: '#FFFFFF', label: 'White' },
  ]
  
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex gap-1 flex-wrap">
          {presetColors.map(color => (
            <button
              key={color.value || 'default'}
              onClick={() => onChange(color.value)}
              className={`w-6 h-6 rounded border-2 ${
                value === color.value ? 'border-[#CCAA4C]' : 'border-[#353535]'
              }`}
              style={{ backgroundColor: color.value || '#252525' }}
              title={color.label}
            />
          ))}
        </div>
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-6 rounded cursor-pointer"
        />
      </div>
    </div>
  )
}

// Reusable field components
function TextField({ 
  label, 
  value, 
  onChange, 
  placeholder,
  multiline = false,
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:outline-none focus:border-[#CCAA4C] resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:outline-none focus:border-[#CCAA4C]"
        />
      )}
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm focus:outline-none focus:border-[#CCAA4C]"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-1">
        {label}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#CCAA4C]"
      />
    </div>
  )
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
        {label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors ${
          value ? 'bg-[#CCAA4C]' : 'bg-[#353535]'
        }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
          value ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )
}

export function BlockSettings({ block, onUpdate, onDelete, onDuplicate }: BlockSettingsProps) {
  const definition = getBlockDefinition(block.type)

  const updateProp = (key: string, value: any) => {
    onUpdate({
      props: { ...block.props, [key]: value },
    })
  }

  // Helper to update array items
  const updateArrayItem = (arrayKey: string, index: number, itemUpdates: Record<string, any>) => {
    const array = [...(block.props[arrayKey] || [])]
    array[index] = { ...array[index], ...itemUpdates }
    updateProp(arrayKey, array)
  }

  // Render settings based on block type
  const renderBlockSpecificSettings = () => {
    switch (block.type) {
      // ============================================
      // ATOMIC TAWK SPECIFIC BLOCKS
      // ============================================
      case 'atomicHero':
        return (
          <>
            <TextField
              label="Logo URL"
              value={block.props.logoUrl || ''}
              onChange={(v) => updateProp('logoUrl', v)}
              placeholder="/logo.png"
            />
            <TextField
              label="Headline"
              value={block.props.headline || ''}
              onChange={(v) => updateProp('headline', v)}
              placeholder="Tawk Loud..."
              multiline
            />
            <TextField
              label="Subheadline"
              value={block.props.subheadline || ''}
              onChange={(v) => updateProp('subheadline', v)}
              placeholder="Where real blokes talk torque."
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Primary Button"
                value={block.props.primaryButtonText || ''}
                onChange={(v) => updateProp('primaryButtonText', v)}
                placeholder="Start Broadcast"
              />
              <TextField
                label="Primary Link"
                value={block.props.primaryButtonLink || ''}
                onChange={(v) => updateProp('primaryButtonLink', v)}
                placeholder="/shows"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Secondary Button"
                value={block.props.secondaryButtonText || ''}
                onChange={(v) => updateProp('secondaryButtonText', v)}
                placeholder="Garage Store"
              />
              <TextField
                label="Secondary Link"
                value={block.props.secondaryButtonLink || ''}
                onChange={(v) => updateProp('secondaryButtonLink', v)}
                placeholder="/store"
              />
            </div>
            <ToggleField
              label="Show Decorative Gears"
              value={block.props.showDecorativeGears ?? true}
              onChange={(v) => updateProp('showDecorativeGears', v)}
            />
          </>
        )

      case 'tickerBar':
        return (
          <>
            <SelectField
              label="Speed"
              value={block.props.speed || 'normal'}
              options={[
                { value: 'slow', label: 'Slow' },
                { value: 'normal', label: 'Normal' },
                { value: 'fast', label: 'Fast' },
              ]}
              onChange={(v) => updateProp('speed', v)}
            />
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#888]">
                Ticker Items
              </label>
              {(block.props.items || []).map((item: any, i: number) => (
                <div key={item.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2">
                  <div className="flex gap-2">
                    <SelectField
                      label="Icon"
                      value={item.icon || 'bolt'}
                      options={[
                        { value: 'bolt', label: '⚡ Bolt' },
                        { value: 'warning', label: '⚠️ Warning' },
                        { value: 'construction', label: '🔧 Construction' },
                        { value: 'gaming', label: '🎮 Gaming' },
                      ]}
                      onChange={(v) => updateArrayItem('items', i, { icon: v })}
                    />
                    <ToggleField
                      label="Highlight"
                      value={item.highlight ?? false}
                      onChange={(v) => updateArrayItem('items', i, { highlight: v })}
                    />
                  </div>
                  <TextField
                    label="Text"
                    value={item.text || ''}
                    onChange={(v) => updateArrayItem('items', i, { text: v })}
                    placeholder="TICKER MESSAGE..."
                  />
                </div>
              ))}
            </div>
          </>
        )

      case 'featureModuleGrid':
        return (
          <>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-2">
              Feature Modules
            </label>
            {(block.props.modules || []).map((module: any, i: number) => (
              <div key={module.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#CCAA4C] font-bold text-sm">{module.type?.toUpperCase()}</span>
                  <SelectField
                    label=""
                    value={module.accentColor || 'gold'}
                    options={[
                      { value: 'orange', label: '🟠 Orange' },
                      { value: 'gold', label: '🟡 Gold' },
                      { value: 'green', label: '🟢 Green' },
                    ]}
                    onChange={(v) => updateArrayItem('modules', i, { accentColor: v })}
                  />
                </div>
                <TextField
                  label="Title"
                  value={module.title || ''}
                  onChange={(v) => updateArrayItem('modules', i, { title: v })}
                />
                <TextField
                  label="Subtitle"
                  value={module.subtitle || ''}
                  onChange={(v) => updateArrayItem('modules', i, { subtitle: v })}
                />
                <TextField
                  label="Description"
                  value={module.description || ''}
                  onChange={(v) => updateArrayItem('modules', i, { description: v })}
                  multiline
                />
                <TextField
                  label="Badge"
                  value={module.badge || ''}
                  onChange={(v) => updateArrayItem('modules', i, { badge: v })}
                  placeholder="Free to Play"
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    label="Button Text"
                    value={module.buttonText || ''}
                    onChange={(v) => updateArrayItem('modules', i, { buttonText: v })}
                  />
                  <TextField
                    label="Button Link"
                    value={module.buttonLink || ''}
                    onChange={(v) => updateArrayItem('modules', i, { buttonLink: v })}
                  />
                </div>
              </div>
            ))}
          </>
        )

      case 'atomicTVBanner':
        return (
          <>
            <TextField
              label="Title"
              value={block.props.title || ''}
              onChange={(v) => updateProp('title', v)}
              placeholder="Atomic TV"
            />
            <TextField
              label="Subtitle"
              value={block.props.subtitle || ''}
              onChange={(v) => updateProp('subtitle', v)}
              placeholder="Official Broadcast Network"
            />
            <TextField
              label="Description"
              value={block.props.description || ''}
              onChange={(v) => updateProp('description', v)}
              multiline
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Button Text"
                value={block.props.buttonText || ''}
                onChange={(v) => updateProp('buttonText', v)}
                placeholder="Watch Now"
              />
              <TextField
                label="Button Link"
                value={block.props.buttonLink || ''}
                onChange={(v) => updateProp('buttonLink', v)}
                placeholder="/tv"
              />
            </div>
          </>
        )

      case 'propagandaGrid':
        return (
          <>
            <TextField
              label="Section Heading"
              value={block.props.heading || ''}
              onChange={(v) => updateProp('heading', v)}
              placeholder="Featured Propaganda"
            />
            <SelectField
              label="Columns"
              value={String(block.props.columns || 3)}
              options={[
                { value: '2', label: '2 Columns' },
                { value: '3', label: '3 Columns' },
                { value: '4', label: '4 Columns' },
              ]}
              onChange={(v) => updateProp('columns', parseInt(v))}
            />
            
            {/* Dynamic Content Toggle */}
            <div className="p-3 bg-[#1a1a1a] border border-[#CCAA4C]/30 rounded mt-4">
              <ToggleField
                label="🔄 Use Database Content"
                value={block.props.useDatabaseContent ?? false}
                onChange={(v) => updateProp('useDatabaseContent', v)}
              />
              <p className="text-[10px] text-[#666] mt-1">
                Automatically shows featured content from the content manager
              </p>
            </div>
            
            {block.props.useDatabaseContent && (
              <TextField
                label="Max Items"
                value={String(block.props.maxItems || 3)}
                onChange={(v) => updateProp('maxItems', parseInt(v) || 3)}
                placeholder="3"
              />
            )}
            
            {/* Manual posters only shown when not using database */}
            {!block.props.useDatabaseContent && (
              <>
                <div className="flex items-center justify-between mt-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                    Manual Posters ({(block.props.posters || []).length})
                  </label>
                  <button
                    onClick={() => {
                      const newPoster = { 
                        id: `poster_${Date.now()}`, 
                        title: 'New Poster', 
                        description: 'Poster description...', 
                        imageUrl: '',
                        link: '/',
                        reportNumber: `Report #${(block.props.posters?.length || 0) + 1}`,
                        buttonText: 'View'
                      }
                      updateProp('posters', [...(block.props.posters || []), newPoster])
                    }}
                    className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
                  >
                    + Add Poster
                  </button>
                </div>
                {(block.props.posters || []).map((poster: any, i: number) => (
                  <div key={poster.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#CCAA4C] text-xs font-bold">Poster #{i + 1}</span>
                      <button
                        onClick={() => {
                          const newPosters = block.props.posters.filter((_: any, idx: number) => idx !== i)
                          updateProp('posters', newPosters)
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <TextField
                      label="Title"
                      value={poster.title || ''}
                      onChange={(v) => updateArrayItem('posters', i, { title: v })}
                    />
                    <TextField
                      label="Description"
                      value={poster.description || ''}
                      onChange={(v) => updateArrayItem('posters', i, { description: v })}
                    />
                    <TextField
                      label="Image URL"
                      value={poster.imageUrl || ''}
                      onChange={(v) => updateArrayItem('posters', i, { imageUrl: v })}
                      placeholder="https://..."
                    />
                    <TextField
                      label="Link"
                      value={poster.link || ''}
                      onChange={(v) => updateArrayItem('posters', i, { link: v })}
                      placeholder="/shows/..."
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <TextField
                        label="Report #"
                        value={poster.reportNumber || ''}
                        onChange={(v) => updateArrayItem('posters', i, { reportNumber: v })}
                        placeholder="Report #001"
                      />
                      <TextField
                        label="Button"
                        value={poster.buttonText || ''}
                        onChange={(v) => updateArrayItem('posters', i, { buttonText: v })}
                        placeholder="Analyze Data"
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )

      case 'blokeScienceSlider':
        return (
          <>
            <TextField
              label="Section Heading"
              value={block.props.heading || ''}
              onChange={(v) => updateProp('heading', v)}
              placeholder="Bloke Science"
            />
            <ToggleField
              label="Auto Play"
              value={block.props.autoPlay ?? true}
              onChange={(v) => updateProp('autoPlay', v)}
            />
            <SliderField
              label="Interval (ms)"
              value={block.props.interval || 5000}
              min={2000}
              max={10000}
              onChange={(v) => updateProp('interval', v)}
            />
            <div className="flex items-center justify-between mt-4">
              <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                Facts ({(block.props.facts || []).length})
              </label>
              <button
                onClick={() => {
                  const newFact = { id: `fact_${Date.now()}`, title: 'New Fact Title', fact: 'Enter your fact here...' }
                  updateProp('facts', [...(block.props.facts || []), newFact])
                }}
                className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
              >
                + Add Fact
              </button>
            </div>
            {(block.props.facts || []).map((fact: any, i: number) => (
              <div key={fact.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#CCAA4C] text-xs font-bold">Fact #{i + 1}</span>
                  <button
                    onClick={() => {
                      const newFacts = block.props.facts.filter((_: any, idx: number) => idx !== i)
                      updateProp('facts', newFacts)
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <TextField
                  label="Title"
                  value={fact.title || ''}
                  onChange={(v) => updateArrayItem('facts', i, { title: v })}
                />
                <TextField
                  label="Fact"
                  value={fact.fact || ''}
                  onChange={(v) => updateArrayItem('facts', i, { fact: v })}
                  multiline
                />
              </div>
            ))}
          </>
        )

      case 'broadcastList':
        return (
          <>
            <TextField
              label="Section Heading"
              value={block.props.heading || ''}
              onChange={(v) => updateProp('heading', v)}
              placeholder="Latest Broadcasts"
            />
            <SelectField
              label="Heading Variant"
              value={block.props.headingVariant || 'left'}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={(v) => updateProp('headingVariant', v)}
            />
            
            {/* Dynamic Content Toggle */}
            <div className="p-3 bg-[#1a1a1a] border border-[#CCAA4C]/30 rounded mt-4">
              <ToggleField
                label="🔄 Use Database Content"
                value={block.props.useDatabaseContent ?? false}
                onChange={(v) => updateProp('useDatabaseContent', v)}
              />
              <p className="text-[10px] text-[#666] mt-1">
                Automatically shows latest broadcasts from the content manager
              </p>
            </div>
            
            {block.props.useDatabaseContent && (
              <>
                <TextField
                  label="Max Items"
                  value={String(block.props.maxItems || 5)}
                  onChange={(v) => updateProp('maxItems', parseInt(v) || 5)}
                  placeholder="5"
                />
                <SelectField
                  label="Display Variant"
                  value={block.props.variant || 'list'}
                  options={[
                    { value: 'list', label: 'List (with description)' },
                    { value: 'grid', label: 'Grid Cards' },
                    { value: 'compact', label: 'Compact List' },
                  ]}
                  onChange={(v) => updateProp('variant', v)}
                />
              </>
            )}
            
            <ToggleField
              label="Show View All Button"
              value={block.props.showViewAllButton ?? true}
              onChange={(v) => updateProp('showViewAllButton', v)}
            />
            {block.props.showViewAllButton && (
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="View All Text"
                  value={block.props.viewAllText || ''}
                  onChange={(v) => updateProp('viewAllText', v)}
                  placeholder="Access Full Archive"
                />
                <TextField
                  label="View All Link"
                  value={block.props.viewAllLink || ''}
                  onChange={(v) => updateProp('viewAllLink', v)}
                  placeholder="/shows"
                />
              </div>
            )}
            
            {/* Manual broadcasts only shown when not using database */}
            {!block.props.useDatabaseContent && (
              <>
                <div className="flex items-center justify-between mt-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                    Manual Broadcasts ({(block.props.broadcasts || []).length})
                  </label>
                  <button
                    onClick={() => {
                      const newBroadcast = { 
                        id: `broadcast_${Date.now()}`, 
                        title: 'New Broadcast', 
                        date: new Date().toLocaleDateString(),
                        thumbnailUrl: '',
                        description: '',
                        link: '/shows'
                      }
                      updateProp('broadcasts', [...(block.props.broadcasts || []), newBroadcast])
                    }}
                    className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
                  >
                    + Add Broadcast
                  </button>
                </div>
                {(block.props.broadcasts || []).map((item: any, i: number) => (
                  <div key={item.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#CCAA4C] text-xs font-bold">Broadcast #{i + 1}</span>
                      <button
                        onClick={() => {
                          const newBroadcasts = block.props.broadcasts.filter((_: any, idx: number) => idx !== i)
                          updateProp('broadcasts', newBroadcasts)
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <TextField
                      label="Title"
                      value={item.title || ''}
                      onChange={(v) => updateArrayItem('broadcasts', i, { title: v })}
                    />
                    <TextField
                      label="Description"
                      value={item.description || ''}
                      onChange={(v) => updateArrayItem('broadcasts', i, { description: v })}
                      placeholder="Brief intro paragraph..."
                    />
                    <TextField
                      label="Date"
                      value={item.date || ''}
                      onChange={(v) => updateArrayItem('broadcasts', i, { date: v })}
                      placeholder="August 14, 2077"
                    />
                    <TextField
                      label="Thumbnail URL"
                      value={item.thumbnailUrl || ''}
                      onChange={(v) => updateArrayItem('broadcasts', i, { thumbnailUrl: v })}
                    />
                    <TextField
                      label="Link"
                      value={item.link || ''}
                      onChange={(v) => updateArrayItem('broadcasts', i, { link: v })}
                      placeholder="/shows"
                    />
                  </div>
                ))}
              </>
            )}
          </>
        )

      case 'categoryIconGrid':
        return (
          <>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                Categories ({(block.props.categories || []).length})
              </label>
              <button
                onClick={() => {
                  const newCategory = { 
                    id: `cat_${Date.now()}`, 
                    label: 'New Category', 
                    imageUrl: '',
                    link: '/'
                  }
                  updateProp('categories', [...(block.props.categories || []), newCategory])
                }}
                className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
              >
                + Add Category
              </button>
            </div>
            {(block.props.categories || []).map((cat: any, i: number) => (
              <div key={cat.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#CCAA4C] text-xs font-bold">Category #{i + 1}</span>
                  <button
                    onClick={() => {
                      const newCategories = block.props.categories.filter((_: any, idx: number) => idx !== i)
                      updateProp('categories', newCategories)
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <TextField
                  label="Label"
                  value={cat.label || ''}
                  onChange={(v) => updateArrayItem('categories', i, { label: v })}
                />
                <TextField
                  label="Image URL"
                  value={cat.imageUrl || ''}
                  onChange={(v) => updateArrayItem('categories', i, { imageUrl: v })}
                  placeholder="/images/categories/..."
                />
                <TextField
                  label="Link"
                  value={cat.link || ''}
                  onChange={(v) => updateArrayItem('categories', i, { link: v })}
                  placeholder="/shows/..."
                />
              </div>
            ))}
          </>
        )

      case 'brandStatement':
        return (
          <>
            <TextField
              label="Quote"
              value={block.props.quote || ''}
              onChange={(v) => updateProp('quote', v)}
              placeholder={'"Civil Defence PSA for Horsepower"'}
            />
            <TextField
              label="Subtitle"
              value={block.props.subtitle || ''}
              onChange={(v) => updateProp('subtitle', v)}
              placeholder="Broadcasting from the Shed..."
            />
          </>
        )

      // ============================================
      // GENERIC BLOCKS
      // ============================================
      case 'hero':
        return (
          <>
            <TextField
              label="Title"
              value={block.props.title || ''}
              onChange={(v) => updateProp('title', v)}
              placeholder="Enter title..."
            />
            <TextField
              label="Subtitle"
              value={block.props.subtitle || ''}
              onChange={(v) => updateProp('subtitle', v)}
              placeholder="Enter subtitle..."
            />
            <TextField
              label="Background Image URL"
              value={block.props.backgroundImage || ''}
              onChange={(v) => updateProp('backgroundImage', v)}
              placeholder="/images/..."
            />
            <SliderField
              label="Overlay Opacity"
              value={block.props.overlayOpacity || 60}
              min={0}
              max={100}
              onChange={(v) => updateProp('overlayOpacity', v)}
            />
            <TextField
              label="Button Text"
              value={block.props.buttonText || ''}
              onChange={(v) => updateProp('buttonText', v)}
              placeholder="Learn More"
            />
            <TextField
              label="Button Link"
              value={block.props.buttonLink || ''}
              onChange={(v) => updateProp('buttonLink', v)}
              placeholder="/about"
            />
            <SelectField
              label="Alignment"
              value={block.props.alignment || 'center'}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={(v) => updateProp('alignment', v)}
            />
          </>
        )

      case 'richText':
        return (
          <>
            <TextField
              label="Heading"
              value={block.props.heading || ''}
              onChange={(v) => updateProp('heading', v)}
              placeholder="Section heading..."
            />
            <SelectField
              label="Heading Size"
              value={block.props.headingSize || 'medium'}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
              onChange={(v) => updateProp('headingSize', v)}
            />
            <TextField
              label="Body Text"
              value={block.props.body || ''}
              onChange={(v) => updateProp('body', v)}
              placeholder="Enter content..."
              multiline
            />
            <SelectField
              label="Alignment"
              value={block.props.alignment || 'left'}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={(v) => updateProp('alignment', v)}
            />
          </>
        )

      case 'ctaStrip':
        return (
          <>
            <TextField
              label="Text"
              value={block.props.text || ''}
              onChange={(v) => updateProp('text', v)}
              placeholder="Call to action text..."
            />
            <TextField
              label="Button Text"
              value={block.props.buttonText || ''}
              onChange={(v) => updateProp('buttonText', v)}
              placeholder="Click Here"
            />
            <TextField
              label="Button Link"
              value={block.props.buttonLink || ''}
              onChange={(v) => updateProp('buttonLink', v)}
              placeholder="/signup"
            />
          </>
        )

      case 'poster':
        return (
          <>
            <TextField
              label="Image URL"
              value={block.props.image || ''}
              onChange={(v) => updateProp('image', v)}
              placeholder="/images/poster.jpg"
            />
            <TextField
              label="Caption"
              value={block.props.caption || ''}
              onChange={(v) => updateProp('caption', v)}
              placeholder="Poster caption..."
            />
            <TextField
              label="CTA Text"
              value={block.props.ctaText || ''}
              onChange={(v) => updateProp('ctaText', v)}
              placeholder="Learn More"
            />
            <TextField
              label="CTA Link"
              value={block.props.ctaLink || ''}
              onChange={(v) => updateProp('ctaLink', v)}
              placeholder="/about"
            />
          </>
        )

      case 'video':
        return (
          <>
            <TextField
              label="Video URL (YouTube/Vimeo)"
              value={block.props.videos?.[0]?.url || ''}
              onChange={(v) => updateProp('videos', [{ id: '1', url: v, caption: '' }])}
              placeholder="https://youtube.com/watch?v=..."
            />
            <SelectField
              label="Layout"
              value={block.props.layout || 'single'}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'fullWidth', label: 'Full Width' },
              ]}
              onChange={(v) => updateProp('layout', v)}
            />
          </>
        )

      case 'communityFeed':
        return (
          <>
            <SelectField
              label="Feed Type"
              value={block.props.feedType || 'latest'}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'trending', label: 'Trending' },
                { value: 'featured', label: 'Featured' },
              ]}
              onChange={(v) => updateProp('feedType', v)}
            />
            <SliderField
              label="Max Items"
              value={block.props.maxItems || 6}
              min={3}
              max={12}
              onChange={(v) => updateProp('maxItems', v)}
            />
            <ToggleField
              label="Show Captions"
              value={block.props.showCaptions ?? true}
              onChange={(v) => updateProp('showCaptions', v)}
            />
            <ToggleField
              label="Show Usernames"
              value={block.props.showUsernames ?? true}
              onChange={(v) => updateProp('showUsernames', v)}
            />
          </>
        )

      case 'productEmbed':
        return (
          <>
            <SelectField
              label="Product Category"
              value={block.props.productCategory || 'all'}
              options={[
                { value: 'all', label: 'All Products' },
                { value: 'apparel', label: 'Apparel' },
                { value: 'poster', label: 'Posters' },
                { value: 'sticker', label: 'Stickers' },
              ]}
              onChange={(v) => updateProp('productCategory', v)}
            />
            <SliderField
              label="Max Items"
              value={block.props.maxItems || 4}
              min={2}
              max={8}
              onChange={(v) => updateProp('maxItems', v)}
            />
            <TextField
              label="CTA Link"
              value={block.props.ctaLink || ''}
              onChange={(v) => updateProp('ctaLink', v)}
              placeholder="/store"
            />
          </>
        )

      case 'divider':
        return (
          <>
            <SelectField
              label="Height"
              value={block.props.height || 'medium'}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
              onChange={(v) => updateProp('height', v)}
            />
          </>
        )

      case 'buttonGroup':
        return (
          <>
            <SelectField
              label="Alignment"
              value={block.props.alignment || 'center'}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={(v) => updateProp('alignment', v)}
            />
            <SelectField
              label="Direction"
              value={block.props.direction || 'horizontal'}
              options={[
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Stacked' },
              ]}
              onChange={(v) => updateProp('direction', v)}
            />
            <SelectField
              label="Spacing"
              value={block.props.spacing || 'normal'}
              options={[
                { value: 'tight', label: 'Tight' },
                { value: 'normal', label: 'Normal' },
                { value: 'wide', label: 'Wide' },
              ]}
              onChange={(v) => updateProp('spacing', v)}
            />

            {/* Buttons List */}
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                  Buttons ({(block.props.buttons || []).length})
                </label>
                <button
                  onClick={() => {
                    const newButton = {
                      id: `btn_${Date.now()}`,
                      text: 'New Button',
                      link: '/',
                      style: 'primary',
                      size: 'medium',
                      icon: '',
                    }
                    updateProp('buttons', [...(block.props.buttons || []), newButton])
                  }}
                  className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
                >
                  + Add Button
                </button>
              </div>

              {(block.props.buttons || []).map((btn: any, i: number) => (
                <div key={btn.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#CCAA4C] text-xs font-bold">Button {i + 1}</span>
                    <button
                      onClick={() => {
                        const newButtons = block.props.buttons.filter((_: any, idx: number) => idx !== i)
                        updateProp('buttons', newButtons)
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <TextField
                    label="Text"
                    value={btn.text || ''}
                    onChange={(v) => updateArrayItem('buttons', i, { text: v })}
                    placeholder="Button text..."
                  />
                  <TextField
                    label="Link"
                    value={btn.link || ''}
                    onChange={(v) => updateArrayItem('buttons', i, { link: v })}
                    placeholder="/page-url"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <SelectField
                      label="Style"
                      value={btn.style || 'primary'}
                      options={[
                        { value: 'primary', label: '🟡 Primary' },
                        { value: 'secondary', label: '⬛ Secondary' },
                        { value: 'outline', label: '🔲 Outline' },
                        { value: 'ghost', label: '👻 Ghost' },
                      ]}
                      onChange={(v) => updateArrayItem('buttons', i, { style: v })}
                    />
                    <SelectField
                      label="Size"
                      value={btn.size || 'medium'}
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                      ]}
                      onChange={(v) => updateArrayItem('buttons', i, { size: v })}
                    />
                  </div>
                  <TextField
                    label="Icon (emoji)"
                    value={btn.icon || ''}
                    onChange={(v) => updateArrayItem('buttons', i, { icon: v })}
                    placeholder="🚀"
                  />
                </div>
              ))}
            </div>
          </>
        )

      default:
        return (
          <p className="text-[#666] text-sm">
            Settings for this block type are not yet implemented.
          </p>
        )
    }
  }

  // Helper to update styling
  const updateStyling = (key: keyof BlockStyling, value: any) => {
    onUpdate({
      styling: { ...(block.styling || {}), [key]: value },
    })
  }

  // Helper to update buttons array
  const updateButtons = (newButtons: BlockButton[]) => {
    onUpdate({ buttons: newButtons })
  }

  const addButton = () => {
    const newButton: BlockButton = {
      id: `btn_${Date.now()}`,
      text: 'New Button',
      link: '/',
      style: 'primary',
      size: 'medium',
      icon: '',
    }
    updateButtons([...(block.buttons || []), newButton])
  }

  const updateButton = (index: number, updates: Partial<BlockButton>) => {
    const newButtons = [...(block.buttons || [])]
    newButtons[index] = { ...newButtons[index], ...updates }
    updateButtons(newButtons)
  }

  const removeButton = (index: number) => {
    updateButtons((block.buttons || []).filter((_: any, i: number) => i !== index))
  }

  // Helper to update buttons config
  const updateButtonsConfig = (key: keyof ButtonsConfig, value: any) => {
    onUpdate({
      buttonsConfig: { ...(block.buttonsConfig || { position: 'bottom-center', spacing: 'normal', direction: 'horizontal' }), [key]: value },
    })
  }

  return (
    <div className="space-y-0">
      {/* Block Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <span>{definition?.icon}</span>
            {definition?.name}
          </h3>
          <p className="text-[#666] text-xs">{block.id}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate({ visible: !block.visible })}
            className={`p-2 rounded ${block.visible ? 'text-[#CCAA4C]' : 'text-[#666]'} hover:bg-[#353535]`}
            title={block.visible ? 'Hide' : 'Show'}
          >
            {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-[#666] hover:text-white hover:bg-[#353535] rounded"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[#666] hover:text-red-500 hover:bg-[#353535] rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Variant Selector */}
      {definition && definition.variants.length > 1 && (
        <div className="px-4 pb-4">
          <SelectField
            label="Variant"
            value={block.variant}
            options={definition.variants.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
            onChange={(v) => onUpdate({ variant: v })}
          />
        </div>
      )}

      {/* Block Content Settings */}
      <CollapsibleSection title="Content" icon={Type} defaultOpen>
        <div className="space-y-4">
          {renderBlockSpecificSettings()}
        </div>
      </CollapsibleSection>

      {/* Background & Colors */}
      <CollapsibleSection title="Background & Colors" icon={Palette}>
        <ColorField
          label="Background Color"
          value={block.styling?.backgroundColor || ''}
          onChange={(v) => updateStyling('backgroundColor', v)}
        />
        <TextField
          label="Background Gradient"
          value={block.styling?.backgroundGradient || ''}
          onChange={(v) => updateStyling('backgroundGradient', v)}
          placeholder="linear-gradient(to right, #CCAA4C, #FF6B35)"
        />
        <MediaUpload
          label="Background Image"
          value={block.styling?.backgroundImage || ''}
          onChange={(v) => updateStyling('backgroundImage', v)}
          accept="image"
          placeholder="Upload or paste image URL"
        />
        <ColorField
          label="Accent Color"
          value={block.styling?.accentColor || ''}
          onChange={(v) => updateStyling('accentColor', v)}
        />
        <ColorField
          label="Text Color"
          value={block.styling?.textColor || ''}
          onChange={(v) => updateStyling('textColor', v)}
        />
      </CollapsibleSection>

      {/* Background Video */}
      <CollapsibleSection title="Background Video" icon={Film}>
        <MediaUpload
          label="Video File"
          value={block.styling?.backgroundVideo || ''}
          onChange={(v) => updateStyling('backgroundVideo', v)}
          accept="video"
          placeholder="Upload MP4/WebM video"
        />
        {(block.styling?.backgroundImage || block.styling?.backgroundVideo) && (
          <SliderField
            label="Overlay Darkness"
            value={block.styling?.backgroundOverlay ?? 50}
            min={0}
            max={100}
            onChange={(v) => updateStyling('backgroundOverlay', v)}
          />
        )}
        <p className="text-[10px] text-[#555] mt-2">
          Video will autoplay muted and loop. Image is used as fallback.
        </p>
      </CollapsibleSection>

      {/* Texture Overlay */}
      <CollapsibleSection title="Texture Overlay" icon={Image}>
        <SelectField
          label="Texture"
          value={block.styling?.textureOverlay || 'none'}
          options={[
            { value: 'none', label: 'None' },
            { value: 'halftone', label: 'Halftone Dots' },
            { value: 'noise', label: 'Noise/Grain' },
            { value: 'scanlines', label: 'Scanlines' },
            { value: 'metal', label: 'Brushed Metal' },
            { value: 'paper', label: 'Paper Texture' },
          ]}
          onChange={(v) => updateStyling('textureOverlay', v)}
        />
        {block.styling?.textureOverlay && block.styling.textureOverlay !== 'none' && (
          <SliderField
            label="Texture Opacity"
            value={block.styling?.textureOpacity ?? 20}
            min={5}
            max={50}
            onChange={(v) => updateStyling('textureOpacity', v)}
          />
        )}
      </CollapsibleSection>

      {/* Frame & Border */}
      <CollapsibleSection title="Frame & Border" icon={Frame}>
        <SelectField
          label="Frame Style"
          value={block.styling?.frameStyle || 'none'}
          options={[
            { value: 'none', label: 'None' },
            { value: 'solid', label: 'Solid' },
            { value: 'thick', label: 'Thick' },
            { value: 'industrial', label: 'Industrial' },
            { value: 'double', label: 'Double' },
            { value: 'dashed', label: 'Dashed' },
          ]}
          onChange={(v) => updateStyling('frameStyle', v)}
        />
        {block.styling?.frameStyle && block.styling.frameStyle !== 'none' && (
          <ColorField
            label="Frame Color"
            value={block.styling?.frameColor || '#CCAA4C'}
            onChange={(v) => updateStyling('frameColor', v)}
          />
        )}
        <SelectField
          label="Border Radius"
          value={block.styling?.borderRadius || 'none'}
          options={[
            { value: 'none', label: 'None (Square)' },
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
          onChange={(v) => updateStyling('borderRadius', v)}
        />
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Padding Top"
            value={block.styling?.paddingTop || 'medium'}
            options={[
              { value: 'none', label: 'None' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'xlarge', label: 'X-Large' },
            ]}
            onChange={(v) => updateStyling('paddingTop', v)}
          />
          <SelectField
            label="Padding Bottom"
            value={block.styling?.paddingBottom || 'medium'}
            options={[
              { value: 'none', label: 'None' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'xlarge', label: 'X-Large' },
            ]}
            onChange={(v) => updateStyling('paddingBottom', v)}
          />
        </div>
      </CollapsibleSection>

      {/* Additional Buttons (Inside Block) */}
      <CollapsibleSection title="Block Buttons" icon={Plus}>
        <p className="text-[10px] text-[#666] mb-3">
          Add buttons that appear inside this block
        </p>
        
        {/* Button Position Settings */}
        {(block.buttons?.length || 0) > 0 && (
          <div className="p-3 bg-[#252525] rounded mb-4 space-y-3">
            <div className="flex items-center gap-2 text-[#CCAA4C] text-xs font-bold uppercase">
              <Move className="w-3 h-3" /> Button Position
            </div>
            <SelectField
              label="Position"
              value={block.buttonsConfig?.position || 'bottom-center'}
              options={[
                { value: 'bottom-center', label: 'Bottom Center' },
                { value: 'bottom-left', label: 'Bottom Left' },
                { value: 'bottom-right', label: 'Bottom Right' },
                { value: 'top-center', label: 'Top Center' },
                { value: 'top-left', label: 'Top Left' },
                { value: 'top-right', label: 'Top Right' },
                { value: 'center', label: 'Center' },
                { value: 'inline', label: 'Inline (After Content)' },
              ]}
              onChange={(v) => updateButtonsConfig('position', v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Direction"
                value={block.buttonsConfig?.direction || 'horizontal'}
                options={[
                  { value: 'horizontal', label: 'Horizontal' },
                  { value: 'vertical', label: 'Stacked' },
                ]}
                onChange={(v) => updateButtonsConfig('direction', v)}
              />
              <SelectField
                label="Spacing"
                value={block.buttonsConfig?.spacing || 'normal'}
                options={[
                  { value: 'tight', label: 'Tight' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'wide', label: 'Wide' },
                ]}
                onChange={(v) => updateButtonsConfig('spacing', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SliderField
                label="Margin Top (px)"
                value={block.buttonsConfig?.marginTop || 0}
                min={0}
                max={100}
                onChange={(v) => updateButtonsConfig('marginTop', v)}
              />
              <SliderField
                label="Margin Bottom (px)"
                value={block.buttonsConfig?.marginBottom || 0}
                min={0}
                max={100}
                onChange={(v) => updateButtonsConfig('marginBottom', v)}
              />
            </div>
          </div>
        )}

        {/* Button List */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#888]">
            {(block.buttons || []).length} button(s)
          </span>
          <button
            onClick={addButton}
            className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Button
          </button>
        </div>

        {(block.buttons || []).map((btn: BlockButton, i: number) => (
          <div key={btn.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[#CCAA4C] text-xs font-bold">Button {i + 1}</span>
              <button
                onClick={() => removeButton(i)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <TextField
              label="Text"
              value={btn.text || ''}
              onChange={(v) => updateButton(i, { text: v })}
              placeholder="Button text..."
            />
            <TextField
              label="Link"
              value={btn.link || ''}
              onChange={(v) => updateButton(i, { link: v })}
              placeholder="/page-url"
            />
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Style"
                value={btn.style || 'primary'}
                options={[
                  { value: 'primary', label: '🟡 Primary' },
                  { value: 'secondary', label: '⬛ Secondary' },
                  { value: 'outline', label: '🔲 Outline' },
                  { value: 'ghost', label: '👻 Ghost' },
                ]}
                onChange={(v) => updateButton(i, { style: v as any })}
              />
              <SelectField
                label="Size"
                value={btn.size || 'medium'}
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ]}
                onChange={(v) => updateButton(i, { size: v as any })}
              />
            </div>
            <TextField
              label="Icon (emoji)"
              value={btn.icon || ''}
              onChange={(v) => updateButton(i, { icon: v })}
              placeholder="🚀"
            />
          </div>
        ))}
      </CollapsibleSection>
    </div>
  )
}
