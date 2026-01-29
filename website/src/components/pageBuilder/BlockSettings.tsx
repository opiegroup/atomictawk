'use client'

import { PageBlock, getBlockDefinition, THEME_COLORS, ThemeColor } from '@/lib/pageBuilder'
import { Trash2, Copy, Eye, EyeOff } from 'lucide-react'

interface BlockSettingsProps {
  block: PageBlock
  onUpdate: (updates: Partial<PageBlock>) => void
  onDelete: () => void
  onDuplicate: () => void
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
            <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mt-4">
              Posters
            </label>
            {(block.props.posters || []).map((poster: any, i: number) => (
              <div key={poster.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-3">
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
            <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mt-4">
              Facts ({(block.props.facts || []).length})
            </label>
            {(block.props.facts || []).map((fact: any, i: number) => (
              <div key={fact.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-2">
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
            <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mt-4">
              Broadcasts
            </label>
            {(block.props.broadcasts || []).map((item: any, i: number) => (
              <div key={item.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-2">
                <TextField
                  label="Title"
                  value={item.title || ''}
                  onChange={(v) => updateArrayItem('broadcasts', i, { title: v })}
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
        )

      case 'categoryIconGrid':
        return (
          <>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#888]">
              Categories ({(block.props.categories || []).length})
            </label>
            {(block.props.categories || []).map((cat: any, i: number) => (
              <div key={cat.id} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-2">
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

      default:
        return (
          <p className="text-[#666] text-sm">
            Settings for this block type are not yet implemented.
          </p>
        )
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Block Header */}
      <div className="flex items-center justify-between">
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
        <SelectField
          label="Variant"
          value={block.variant}
          options={definition.variants.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
          onChange={(v) => onUpdate({ variant: v })}
        />
      )}

      {/* Block-specific settings */}
      <div className="space-y-4 pt-4 border-t border-[#353535]">
        {renderBlockSpecificSettings()}
      </div>
    </div>
  )
}
