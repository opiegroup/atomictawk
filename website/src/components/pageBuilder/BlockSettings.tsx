'use client'

import React, { useState, useRef } from 'react'
import { PageBlock, getBlockDefinition, THEME_COLORS, ThemeColor, BlockStyling, BlockButton, ButtonsConfig } from '@/lib/pageBuilder'
import { Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronRight, Plus, Palette, Image, Frame, Type, Film, Move } from 'lucide-react'
import { MediaUpload } from './MediaUpload'

// Rich text editor with toolbar and preview
function RichTextEditorField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Block-level tags that shouldn't be nested
  const blockTags = ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'div']

  // Strip all HTML tags from text
  const stripTags = (text: string) => {
    return text.replace(/<[^>]*>/g, '')
  }

  // Insert or wrap with HTML tag
  const insertTag = (tag: string, isBlock: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    let selectedText = value.substring(start, end)
    const before = value.substring(0, start)
    const after = value.substring(end)

    // For block-level tags, strip existing tags from selection to prevent nesting
    if (isBlock && selectedText) {
      selectedText = stripTags(selectedText)
    }

    // If no selection, insert placeholder text for block tags
    if (!selectedText && isBlock) {
      selectedText = tag === 'li' ? 'List item' : 'Your text here'
    }

    const openTag = `<${tag}>`
    const closeTag = `</${tag}>`
    
    const newValue = before + openTag + selectedText + closeTag + after
    onChange(newValue)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + openTag.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Insert link with prompt
  const insertLink = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const url = prompt('Enter URL:')
    if (!url) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || 'Link text'
    const before = value.substring(0, start)
    const after = value.substring(end)
    
    const linkHtml = `<a href="${url}">${selectedText}</a>`
    const newValue = before + linkHtml + after
    onChange(newValue)
  }

  // Clear all formatting
  const clearFormatting = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    if (start === end) {
      // No selection - clear all formatting in entire content
      const cleaned = stripTags(value)
      onChange(cleaned)
    } else {
      // Clear formatting from selection only
      const selectedText = value.substring(start, end)
      const before = value.substring(0, start)
      const after = value.substring(end)
      const cleaned = stripTags(selectedText)
      onChange(before + cleaned + after)
    }
  }

  // Toolbar buttons - inline tags
  const inlineButtons = [
    { label: 'B', tag: 'strong', title: 'Bold' },
    { label: 'I', tag: 'em', title: 'Italic' },
    { label: 'U', tag: 'u', title: 'Underline' },
  ]

  // Block-level tags
  const blockButtons = [
    { label: 'H1', tag: 'h1', title: 'Heading 1 (largest)' },
    { label: 'H2', tag: 'h2', title: 'Heading 2' },
    { label: 'H3', tag: 'h3', title: 'Heading 3' },
    { label: 'P', tag: 'p', title: 'Paragraph' },
    { label: '•', tag: 'li', title: 'List Item' },
  ]

  return (
    <div className="border border-[#353535] rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#252525] border-b border-[#353535]">
        {/* Inline formatting */}
        {inlineButtons.map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={() => insertTag(btn.tag, false)}
            title={btn.title}
            className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#353535] hover:bg-[#CCAA4C] hover:text-[#1a1a1a] transition-colors rounded"
          >
            {btn.label}
          </button>
        ))}
        <div className="w-px h-6 bg-[#444] mx-1" />
        {/* Block formatting */}
        {blockButtons.map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={() => insertTag(btn.tag, true)}
            title={btn.title}
            className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#353535] hover:bg-[#CCAA4C] hover:text-[#1a1a1a] transition-colors rounded"
          >
            {btn.label}
          </button>
        ))}
        <div className="w-px h-6 bg-[#444] mx-1" />
        <button
          type="button"
          onClick={insertLink}
          title="Add Link"
          className="w-8 h-8 flex items-center justify-center text-sm text-white bg-[#353535] hover:bg-[#CCAA4C] hover:text-[#1a1a1a] transition-colors rounded"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={clearFormatting}
          title="Clear Formatting"
          className="w-8 h-8 flex items-center justify-center text-sm text-white bg-[#353535] hover:bg-[#CCAA4C] hover:text-[#1a1a1a] transition-colors rounded"
        >
          ✕
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
            showPreview 
              ? 'bg-[#CCAA4C] text-[#1a1a1a]' 
              : 'bg-[#353535] text-white hover:bg-[#454545]'
          }`}
        >
          {showPreview ? 'EDIT' : 'PREVIEW'}
        </button>
      </div>
      
      {/* Editor or Preview with proper heading styles */}
      {showPreview ? (
        <div className="min-h-[200px] p-4 bg-[#1a1a1a] text-white max-w-none">
          <style>{`
            .rich-preview h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; color: #CCAA4C; text-transform: uppercase; }
            .rich-preview h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; color: #CCAA4C; text-transform: uppercase; }
            .rich-preview h3 { font-size: 1.25em; font-weight: bold; margin: 0.5em 0; color: #CCAA4C; text-transform: uppercase; }
            .rich-preview p { margin: 0.5em 0; }
            .rich-preview li { margin-left: 1.5em; list-style: disc; }
            .rich-preview a { color: #CCAA4C; text-decoration: underline; }
            .rich-preview strong, .rich-preview b { font-weight: bold; }
            .rich-preview em, .rich-preview i { font-style: italic; }
            .rich-preview u { text-decoration: underline; }
          `}</style>
          <div 
            className="rich-preview"
            dangerouslySetInnerHTML={{ __html: value || '<p style="color:#666">No content yet...</p>' }}
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Type your content here.\n\nTip: Select text, then click H1/H2/H3 for headings, B/I/U for formatting.'}
          className="w-full min-h-[200px] p-4 bg-[#1a1a1a] text-white text-sm font-mono focus:outline-none resize-y"
        />
      )}
      
      {/* Instructions */}
      <div className="px-3 py-2 bg-[#1f1f1f] border-t border-[#353535]">
        <p className="text-[10px] text-[#666]">
          Select text → click H1/H2/H3 for headings (strips existing tags). Click ✕ to clear formatting.
        </p>
      </div>
    </div>
  )
}

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

// Color Field with presets and custom picker
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
    // Row 1 - Atomic Tawk brand colors
    { value: '#CCAA4C', label: 'Gold' },
    { value: '#FF6B35', label: 'Orange' },
    { value: '#39FF14', label: 'Neon Green' },
    { value: '#E53935', label: 'Red' },
    { value: '#2196F3', label: 'Blue' },
    { value: '#9C27B0', label: 'Purple' },
    // Row 2 - Neutrals
    { value: '#FFFFFF', label: 'White' },
    { value: '#E8E7DA', label: 'Cream' },
    { value: '#888888', label: 'Gray' },
    { value: '#555555', label: 'Dark Gray' },
    { value: '#353535', label: 'Charcoal' },
    { value: '#1a1a1a', label: 'Black' },
  ]
  
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-2">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-6 gap-1">
          {presetColors.map(color => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              className={`w-full aspect-square rounded border-2 transition-all ${
                value === color.value ? 'border-[#CCAA4C] scale-110 z-10' : 'border-[#353535] hover:border-[#555]'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || '#CCAA4C'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer border border-[#353535]"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#CCAA4C"
            className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-[#353535] rounded text-white text-xs font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2 py-1 bg-[#353535] hover:bg-[#454545] rounded text-xs text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Gradient Field with presets and easy customization
function GradientField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [showCustom, setShowCustom] = useState(false)
  const [color1, setColor1] = useState('#CCAA4C')
  const [color2, setColor2] = useState('#FF6B35')
  const [direction, setDirection] = useState('to right')

  const presetGradients = [
    { value: '', label: 'None', preview: '#252525' },
    { value: 'linear-gradient(to right, #CCAA4C, #FF6B35)', label: 'Gold → Orange', preview: 'linear-gradient(to right, #CCAA4C, #FF6B35)' },
    { value: 'linear-gradient(to right, #353535, #1a1a1a)', label: 'Dark', preview: 'linear-gradient(to right, #353535, #1a1a1a)' },
    { value: 'linear-gradient(to bottom, #CCAA4C, #353535)', label: 'Gold → Dark', preview: 'linear-gradient(to bottom, #CCAA4C, #353535)' },
    { value: 'linear-gradient(135deg, #1a1a1a, #353535, #1a1a1a)', label: 'Metal', preview: 'linear-gradient(135deg, #1a1a1a, #353535, #1a1a1a)' },
    { value: 'linear-gradient(to right, #39FF14, #2196F3)', label: 'Neon', preview: 'linear-gradient(to right, #39FF14, #2196F3)' },
    { value: 'linear-gradient(to right, #E53935, #FF6B35)', label: 'Fire', preview: 'linear-gradient(to right, #E53935, #FF6B35)' },
    { value: 'linear-gradient(to right, #9C27B0, #2196F3)', label: 'Purple → Blue', preview: 'linear-gradient(to right, #9C27B0, #2196F3)' },
  ]

  const directions = [
    { value: 'to right', label: '→' },
    { value: 'to left', label: '←' },
    { value: 'to bottom', label: '↓' },
    { value: 'to top', label: '↑' },
    { value: '135deg', label: '↘' },
    { value: '45deg', label: '↗' },
  ]

  const applyCustomGradient = () => {
    onChange(`linear-gradient(${direction}, ${color1}, ${color2})`)
  }
  
  return (
    <div className="mb-3">
      <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-2">
        {label}
      </label>
      
      {/* Preset gradients */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {presetGradients.map((gradient, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(gradient.value)}
            className={`h-8 rounded border-2 transition-all ${
              value === gradient.value ? 'border-[#CCAA4C]' : 'border-[#353535] hover:border-[#555]'
            }`}
            style={{ background: gradient.preview }}
            title={gradient.label}
          />
        ))}
      </div>

      {/* Toggle custom builder */}
      <button
        type="button"
        onClick={() => setShowCustom(!showCustom)}
        className="w-full py-1 px-2 bg-[#252525] hover:bg-[#353535] border border-[#353535] rounded text-xs text-[#888] mb-2"
      >
        {showCustom ? '▼ Hide Custom Builder' : '▶ Create Custom Gradient'}
      </button>

      {/* Custom gradient builder */}
      {showCustom && (
        <div className="p-3 bg-[#1a1a1a] border border-[#353535] rounded">
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="block text-[10px] text-[#666] mb-1">Color 1</label>
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-full h-8 rounded cursor-pointer border border-[#353535]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-[#666] mb-1">Color 2</label>
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-full h-8 rounded cursor-pointer border border-[#353535]"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-[10px] text-[#666] mb-1">Direction</label>
            <div className="flex gap-1">
              {directions.map(dir => (
                <button
                  key={dir.value}
                  type="button"
                  onClick={() => setDirection(dir.value)}
                  className={`flex-1 py-1 rounded text-sm ${
                    direction === dir.value ? 'bg-[#CCAA4C] text-[#1a1a1a]' : 'bg-[#353535] text-white'
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>
          {/* Preview */}
          <div 
            className="h-8 rounded border border-[#353535] mb-2"
            style={{ background: `linear-gradient(${direction}, ${color1}, ${color2})` }}
          />
          <button
            type="button"
            onClick={applyCustomGradient}
            className="w-full py-2 bg-[#CCAA4C] hover:bg-[#B8992F] text-[#1a1a1a] font-bold text-xs rounded uppercase"
          >
            Apply Gradient
          </button>
        </div>
      )}

      {/* Current value display */}
      {value && (
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="w-8 h-6 rounded border border-[#353535]"
            style={{ background: value }}
          />
          <code className="flex-1 text-[10px] text-[#666] truncate">{value}</code>
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-2 py-1 bg-[#353535] hover:bg-[#454545] rounded text-xs text-white"
          >
            Clear
          </button>
        </div>
      )}
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
            <MediaUpload
              label="Logo Image"
              value={block.props.logoUrl || ''}
              onChange={(v) => updateProp('logoUrl', v)}
              accept="image"
              placeholder="Upload or paste logo URL"
            />
            <SliderField
              label="Logo Scale"
              value={block.props.logoScale ?? 100}
              onChange={(v) => updateProp('logoScale', v)}
              min={50}
              max={200}
              step={10}
              suffix="%"
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
            {/* Primary Button */}
            <ToggleField
              label="Show Primary Button"
              value={block.props.showPrimaryButton ?? true}
              onChange={(v) => updateProp('showPrimaryButton', v)}
            />
            {(block.props.showPrimaryButton ?? true) && (
              <>
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
                <ColorField
                  label="Primary Button Text Color"
                  value={block.props.primaryButtonTextColor || '#353535'}
                  onChange={(v) => updateProp('primaryButtonTextColor', v)}
                />
              </>
            )}
            {/* Secondary Button */}
            <ToggleField
              label="Show Secondary Button"
              value={block.props.showSecondaryButton ?? true}
              onChange={(v) => updateProp('showSecondaryButton', v)}
            />
            {(block.props.showSecondaryButton ?? true) && (
              <>
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
                <ColorField
                  label="Secondary Button Text Color"
                  value={block.props.secondaryButtonTextColor || '#353535'}
                  onChange={(v) => updateProp('secondaryButtonTextColor', v)}
                />
              </>
            )}
            <ToggleField
              label="Show Decorative Gears"
              value={block.props.showDecorativeGears ?? true}
              onChange={(v) => updateProp('showDecorativeGears', v)}
            />
          </>
        )

      case 'tickerBar':
        const defaultTickerItems = [
          { id: '1', icon: '⚡', text: 'BREAKING NEWS', highlight: true },
          { id: '2', icon: '⚠️', text: 'SHED ALERT', highlight: false },
          { id: '3', icon: '🔧', text: 'UNDER CONSTRUCTION', highlight: false },
          { id: '4', icon: '📻', text: 'NOW BROADCASTING', highlight: true },
        ]
        const tickerItems = block.props.items || defaultTickerItems
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
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wide text-[#888]">
                  Ticker Items
                </label>
                <button
                  onClick={() => {
                    const newItems = [...(block.props.items || tickerItems), {
                      id: `item_${Date.now()}`,
                      icon: '⚡',
                      text: 'NEW MESSAGE',
                      highlight: false,
                    }]
                    updateProp('items', newItems)
                  }}
                  className="text-xs px-2 py-1 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase hover:bg-[#E0BE5A]"
                >
                  + Add Item
                </button>
              </div>
              {(block.props.items || tickerItems).map((item: any, i: number) => (
                <div key={item.id || i} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 flex-1">
                      <SelectField
                        label="Icon"
                        value={item.icon || '⚡'}
                        options={[
                          { value: '⚡', label: '⚡ Bolt' },
                          { value: '⚠️', label: '⚠️ Warning' },
                          { value: '🔧', label: '🔧 Construction' },
                          { value: '🎮', label: '🎮 Gaming' },
                          { value: '📻', label: '📻 Radio' },
                          { value: '🔥', label: '🔥 Fire' },
                          { value: '🏆', label: '🏆 Trophy' },
                          { value: '🛒', label: '🛒 Cart' },
                        ]}
                        onChange={(v) => updateArrayItem('items', i, { icon: v })}
                      />
                      <ToggleField
                        label="Highlight"
                        value={item.highlight ?? false}
                        onChange={(v) => updateArrayItem('items', i, { highlight: v })}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newItems = (block.props.items || tickerItems).filter((_: any, idx: number) => idx !== i)
                        updateProp('items', newItems)
                      }}
                      className="text-red-500 hover:text-red-400 text-xs px-2 py-1"
                    >
                      ✕
                    </button>
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
              <div key={module.id || i} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#CCAA4C] font-bold text-sm">{module.title?.toUpperCase() || module.type?.toUpperCase()}</span>
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
                  placeholder="🎮 Build • Customize • Dominate"
                />
                <TextField
                  label="Description"
                  value={module.description || ''}
                  onChange={(v) => updateArrayItem('modules', i, { description: v })}
                  multiline
                />
                <TextField
                  label="Corner Badge"
                  value={module.badge || ''}
                  onChange={(v) => updateArrayItem('modules', i, { badge: v })}
                  placeholder="Free to Play"
                />
                
                {/* Feature Badges */}
                <div className="border-t border-[#353535] pt-2 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#666]">
                      Feature Badges ({(module.features || []).length})
                    </label>
                    <button
                      onClick={() => {
                        const newFeature = { icon: '⭐', label: 'New Feature' }
                        const newFeatures = [...(module.features || []), newFeature]
                        updateArrayItem('modules', i, { features: newFeatures })
                      }}
                      className="text-xs text-[#CCAA4C] hover:text-white"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {(module.features || []).map((feature: any, fi: number) => (
                      <div key={fi} className="flex items-center gap-2 bg-[#252525] p-2 rounded">
                        <input
                          type="text"
                          value={feature.icon || ''}
                          onChange={(e) => {
                            const newFeatures = [...module.features]
                            newFeatures[fi] = { ...newFeatures[fi], icon: e.target.value }
                            updateArrayItem('modules', i, { features: newFeatures })
                          }}
                          className="w-10 bg-[#353535] border border-[#454545] rounded px-2 py-1 text-sm text-center text-white"
                          placeholder="🎮"
                        />
                        <input
                          type="text"
                          value={feature.label || ''}
                          onChange={(e) => {
                            const newFeatures = [...module.features]
                            newFeatures[fi] = { ...newFeatures[fi], label: e.target.value }
                            updateArrayItem('modules', i, { features: newFeatures })
                          }}
                          className="flex-1 bg-[#353535] border border-[#454545] rounded px-2 py-1 text-sm text-white"
                          placeholder="Feature Label"
                        />
                        <button
                          onClick={() => {
                            const newFeatures = module.features.filter((_: any, idx: number) => idx !== fi)
                            updateArrayItem('modules', i, { features: newFeatures })
                          }}
                          className="text-red-400 hover:text-red-300 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 border-t border-[#353535] pt-2 mt-2">
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
            
            {/* Category Badges */}
            <div className="border-t border-[#353535] pt-3 mt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                  Category Badges ({(block.props.categories || []).length})
                </label>
                <button
                  onClick={() => {
                    const newCategory = { icon: '⭐', label: 'New' }
                    updateProp('categories', [...(block.props.categories || []), newCategory])
                  }}
                  className="text-xs text-[#CCAA4C] hover:text-white"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {(block.props.categories || [
                  { icon: '🔥', label: 'Burnouts' },
                  { icon: '🔧', label: 'Builds' },
                  { icon: '🎮', label: 'Gaming' },
                  { icon: '📺', label: 'Live' },
                ]).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-[#252525] p-2 rounded">
                    <input
                      type="text"
                      value={cat.icon || ''}
                      onChange={(e) => {
                        const cats = block.props.categories || [
                          { icon: '🔥', label: 'Burnouts' },
                          { icon: '🔧', label: 'Builds' },
                          { icon: '🎮', label: 'Gaming' },
                          { icon: '📺', label: 'Live' },
                        ]
                        const newCats = [...cats]
                        newCats[i] = { ...newCats[i], icon: e.target.value }
                        updateProp('categories', newCats)
                      }}
                      className="w-10 bg-[#353535] border border-[#454545] rounded px-2 py-1 text-sm text-center text-white"
                      placeholder="🔥"
                    />
                    <input
                      type="text"
                      value={cat.label || ''}
                      onChange={(e) => {
                        const cats = block.props.categories || [
                          { icon: '🔥', label: 'Burnouts' },
                          { icon: '🔧', label: 'Builds' },
                          { icon: '🎮', label: 'Gaming' },
                          { icon: '📺', label: 'Live' },
                        ]
                        const newCats = [...cats]
                        newCats[i] = { ...newCats[i], label: e.target.value }
                        updateProp('categories', newCats)
                      }}
                      className="flex-1 bg-[#353535] border border-[#454545] rounded px-2 py-1 text-sm text-white"
                      placeholder="Category"
                    />
                    <button
                      onClick={() => {
                        const cats = block.props.categories || [
                          { icon: '🔥', label: 'Burnouts' },
                          { icon: '🔧', label: 'Builds' },
                          { icon: '🎮', label: 'Gaming' },
                          { icon: '📺', label: 'Live' },
                        ]
                        const newCats = cats.filter((_: any, idx: number) => idx !== i)
                        updateProp('categories', newCats)
                      }}
                      className="text-red-400 hover:text-red-300 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 border-t border-[#353535] pt-3 mt-3">
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
            <SliderField
              label="Visible Cards"
              value={block.props.visibleCards || 3}
              min={1}
              max={5}
              onChange={(v) => updateProp('visibleCards', v)}
            />
            <div className="flex items-center justify-between mt-4">
              <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                Cards ({(block.props.facts || []).length})
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const defaultFacts = [
                      { id: '1', title: 'The First V8 Engine', fact: 'The first V8 engine was patented in 1902 by Léon Levavasseur, a French inventor. Originally designed for aircraft, the V8 configuration became the heart of American muscle cars by the 1960s.', type: 'text' },
                      { id: '2', title: 'Burnout Physics', fact: 'A proper burnout can heat tyre rubber to over 200°C (392°F). The smoke you see is actually vaporized rubber particles mixed with superheated air.', type: 'text' },
                      { id: '3', title: 'The 10mm Socket Curse', fact: 'Studies show the average mechanic loses 3-5 10mm sockets per year. Scientists believe they may be slipping into a parallel dimension.', type: 'text' },
                      { id: '4', title: 'Horsepower Origins', fact: 'James Watt coined "horsepower" in the 1780s to sell steam engines. He calculated one horse could do 33,000 foot-pounds of work per minute.', type: 'text' },
                      { id: '5', title: 'Shed Thermodynamics', fact: 'The average shed maintains a temperature exactly 15°C hotter than outside in summer and 15°C colder in winter. This is known as the Shed Paradox.', type: 'text' },
                      { id: '6', title: 'Beer Can Engineering', fact: 'An empty beer can can support the weight of a grown man standing on it. However, the slightest dent causes catastrophic structural failure.', type: 'text' },
                      { id: '7', title: 'Torque vs Power', fact: 'Torque is what pushes you back in your seat. Horsepower is how fast you stay pushed. Knowing the difference makes you 47% more interesting at BBQs.', type: 'text' },
                      { id: '8', title: 'WD-40 Facts', fact: 'WD-40 was invented in 1953 on the 40th attempt (hence the name). It was originally designed to prevent corrosion on nuclear missiles.', type: 'text' },
                      { id: '9', title: 'Duct Tape Science', fact: 'Duct tape was invented during WWII to seal ammunition cases. Soldiers called it "duck tape" because water rolled off like a duck\'s back.', type: 'text' },
                      { id: '10', title: 'Garage Door Physics', fact: 'The average garage door travels over 1,500 kilometers in its lifetime. That\'s roughly the distance from Sydney to Brisbane.', type: 'text' },
                    ]
                    updateProp('facts', defaultFacts)
                  }}
                  className="text-xs text-[#888] hover:text-[#CCAA4C] font-bold uppercase"
                >
                  Load 10 Defaults
                </button>
                <button
                  onClick={() => {
                    const newFact = { id: `fact_${Date.now()}`, title: 'New Title', fact: 'Enter text here...', imageUrl: '', type: 'text' }
                    updateProp('facts', [...(block.props.facts || []), newFact])
                  }}
                  className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
                >
                  + Add Card
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {(block.props.facts || []).map((fact: any, i: number) => (
                <div key={fact.id || i} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#CCAA4C] text-xs font-bold">Card #{i + 1}</span>
                    <div className="flex gap-2">
                      {i > 0 && (
                        <button
                          onClick={() => {
                            const newFacts = [...block.props.facts]
                            ;[newFacts[i - 1], newFacts[i]] = [newFacts[i], newFacts[i - 1]]
                            updateProp('facts', newFacts)
                          }}
                          className="text-xs text-[#888] hover:text-white"
                        >
                          ↑
                        </button>
                      )}
                      {i < (block.props.facts?.length || 0) - 1 && (
                        <button
                          onClick={() => {
                            const newFacts = [...block.props.facts]
                            ;[newFacts[i], newFacts[i + 1]] = [newFacts[i + 1], newFacts[i]]
                            updateProp('facts', newFacts)
                          }}
                          className="text-xs text-[#888] hover:text-white"
                        >
                          ↓
                        </button>
                      )}
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
                  </div>
                  <SelectField
                    label="Card Type"
                    value={fact.type || 'text'}
                    options={[
                      { value: 'text', label: 'Text Fact' },
                      { value: 'image', label: 'Image Only' },
                    ]}
                    onChange={(v) => updateArrayItem('facts', i, { type: v })}
                  />
                  {(fact.type || 'text') === 'text' ? (
                    <>
                      <TextField
                        label="Title"
                        value={fact.title || ''}
                        onChange={(v) => updateArrayItem('facts', i, { title: v })}
                      />
                      <TextField
                        label="Fact Text"
                        value={fact.fact || ''}
                        onChange={(v) => updateArrayItem('facts', i, { fact: v })}
                        multiline
                      />
                    </>
                  ) : (
                    <>
                      <MediaUpload
                        label="Slide Image"
                        value={fact.imageUrl || ''}
                        onChange={(v) => updateArrayItem('facts', i, { imageUrl: v })}
                        accept="image"
                        placeholder="Upload or paste image URL"
                      />
                      <TextField
                        label="Caption (optional)"
                        value={fact.caption || ''}
                        onChange={(v) => updateArrayItem('facts', i, { caption: v })}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
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

      case 'imageSlider':
        return (
          <>
            {/* Slider Settings */}
            <div className="grid grid-cols-2 gap-2">
              <ToggleField
                label="Auto Play"
                value={block.props.autoPlay ?? true}
                onChange={(v) => updateProp('autoPlay', v)}
              />
              <ToggleField
                label="Show Arrows"
                value={block.props.showArrows ?? true}
                onChange={(v) => updateProp('showArrows', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ToggleField
                label="Show Dots"
                value={block.props.showDots ?? true}
                onChange={(v) => updateProp('showDots', v)}
              />
              <ToggleField
                label="Use Gallery Data"
                value={block.props.useGallery ?? false}
                onChange={(v) => updateProp('useGallery', v)}
              />
            </div>
            <SliderField
              label="Interval (ms)"
              value={block.props.interval || 5000}
              min={2000}
              max={10000}
              onChange={(v) => updateProp('interval', v)}
            />
            <SelectField
              label="Aspect Ratio"
              value={block.props.aspectRatio || '16:9'}
              options={[
                { value: '16:9', label: '16:9 (Widescreen)' },
                { value: '4:3', label: '4:3 (Standard)' },
                { value: '21:9', label: '21:9 (Cinematic)' },
                { value: '1:1', label: '1:1 (Square)' },
                { value: '3:2', label: '3:2 (Photo)' },
              ]}
              onChange={(v) => updateProp('aspectRatio', v)}
            />
            <SelectField
              label="Height"
              value={block.props.height || 'auto'}
              options={[
                { value: 'auto', label: 'Auto (Aspect Ratio)' },
                { value: '300px', label: 'Small (300px)' },
                { value: '400px', label: 'Medium (400px)' },
                { value: '500px', label: 'Large (500px)' },
                { value: '600px', label: 'Extra Large (600px)' },
                { value: '100vh', label: 'Full Screen' },
              ]}
              onChange={(v) => updateProp('height', v)}
            />
            
            {/* Gallery connection notice */}
            {block.props.useGallery && (
              <div className="p-3 bg-[#CCAA4C]/20 border border-[#CCAA4C]/50 rounded text-xs text-[#CCAA4C]">
                📸 Slider will display images from the Community Gallery
              </div>
            )}
            
            {/* Slides - only show if not using gallery */}
            {!block.props.useGallery && (
              <>
                <div className="flex items-center justify-between mt-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#888]">
                    Slides ({(block.props.slides || []).length})
                  </label>
                  <button
                    onClick={() => {
                      const newSlide = { 
                        id: `slide_${Date.now()}`, 
                        imageUrl: '', 
                        title: '', 
                        subtitle: '', 
                        buttonText: '', 
                        buttonLink: '',
                        overlay: true 
                      }
                      updateProp('slides', [...(block.props.slides || []), newSlide])
                    }}
                    className="text-xs text-[#CCAA4C] hover:text-white font-bold uppercase"
                  >
                    + Add Slide
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                  {(block.props.slides || []).map((slide: any, i: number) => (
                    <div key={slide.id || i} className="p-3 bg-[#1a1a1a] border border-[#353535] rounded space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#CCAA4C] text-xs font-bold">Slide #{i + 1}</span>
                        <div className="flex gap-2">
                          {i > 0 && (
                            <button
                              onClick={() => {
                                const newSlides = [...block.props.slides]
                                ;[newSlides[i - 1], newSlides[i]] = [newSlides[i], newSlides[i - 1]]
                                updateProp('slides', newSlides)
                              }}
                              className="text-xs text-[#888] hover:text-white"
                            >
                              ↑
                            </button>
                          )}
                          {i < (block.props.slides?.length || 0) - 1 && (
                            <button
                              onClick={() => {
                                const newSlides = [...block.props.slides]
                                ;[newSlides[i], newSlides[i + 1]] = [newSlides[i + 1], newSlides[i]]
                                updateProp('slides', newSlides)
                              }}
                              className="text-xs text-[#888] hover:text-white"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const newSlides = block.props.slides.filter((_: any, idx: number) => idx !== i)
                              updateProp('slides', newSlides)
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <MediaUpload
                        label="Image"
                        value={slide.imageUrl || ''}
                        onChange={(v) => updateArrayItem('slides', i, { imageUrl: v })}
                        accept="image"
                        placeholder="Upload or paste image URL"
                      />
                      <ToggleField
                        label="Show Overlay"
                        value={slide.overlay ?? true}
                        onChange={(v) => updateArrayItem('slides', i, { overlay: v })}
                      />
                      {slide.overlay !== false && (
                        <>
                          <TextField
                            label="Title (optional)"
                            value={slide.title || ''}
                            onChange={(v) => updateArrayItem('slides', i, { title: v })}
                            placeholder="Slide heading..."
                          />
                          <TextField
                            label="Subtitle (optional)"
                            value={slide.subtitle || ''}
                            onChange={(v) => updateArrayItem('slides', i, { subtitle: v })}
                            placeholder="Slide description..."
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <TextField
                              label="Button Text"
                              value={slide.buttonText || ''}
                              onChange={(v) => updateArrayItem('slides', i, { buttonText: v })}
                              placeholder="Learn More"
                            />
                            <TextField
                              label="Button Link"
                              value={slide.buttonLink || ''}
                              onChange={(v) => updateArrayItem('slides', i, { buttonLink: v })}
                              placeholder="/page"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )

      // ============================================
      // GENERIC BLOCKS
      // ============================================
      case 'hero':
        return (
          <>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#888]">
                Title (use Enter for line breaks)
              </label>
              <textarea
                value={block.props.title || ''}
                onChange={(e) => updateProp('title', e.target.value)}
                placeholder="Tawk Loud.&#10;Drive Louder.&#10;Feel Prouder."
                rows={4}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] text-white text-sm focus:border-[#CCAA4C] outline-none resize-none"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              />
              <p className="text-xs text-[#666]">Press Enter to add line breaks</p>
            </div>
            <TextField
              label="Subtitle"
              value={block.props.subtitle || ''}
              onChange={(v) => updateProp('subtitle', v)}
              placeholder="Where real blokes talk torque."
            />
            <MediaUpload
              label="Background Image"
              value={block.props.backgroundImage || ''}
              onChange={(v) => updateProp('backgroundImage', v)}
              accept="image"
              placeholder="Upload or paste image URL"
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
            
            {/* Quick Color Settings (also available in Background & Colors section) */}
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <p className="text-[10px] text-[#666] mb-3 uppercase tracking-wide">Quick Color Settings</p>
              <ColorField
                label="Title Color"
                value={block.styling?.textColor || '#FFFFFF'}
                onChange={(v) => updateStyling('textColor', v)}
              />
              <div className="mt-3">
                <ColorField
                  label="Subtitle/Accent Color"
                  value={block.styling?.accentColor || '#CCAA4C'}
                  onChange={(v) => updateStyling('accentColor', v)}
                />
              </div>
            </div>
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
            
            {/* Rich Text Editor for Body */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#888] mb-2">
                Body Content
              </label>
              <RichTextEditorField
                value={block.props.body || ''}
                onChange={(html) => updateProp('body', html)}
                placeholder="Write your content here... Use the toolbar to format text."
              />
              <p className="text-[10px] text-[#555] mt-2">
                Use the toolbar to add headings, bold, italic, links, lists, and more.
              </p>
            </div>
            
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

            {/* Color Settings for Text Block */}
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <p className="text-[10px] text-[#666] mb-3 uppercase tracking-wide">Text Colors</p>
              <ColorField
                label="Body Text Color"
                value={block.styling?.textColor || ''}
                onChange={(v) => updateStyling('textColor', v)}
              />
              <ColorField
                label="Headings Color (H1, H2, H3)"
                value={block.styling?.accentColor || ''}
                onChange={(v) => updateStyling('accentColor', v)}
              />
            </div>
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

      case 'simpleImage':
        return (
          <>
            <MediaUpload
              label="Image"
              value={block.props.imageUrl || ''}
              onChange={(v) => updateProp('imageUrl', v)}
              accept="image"
              placeholder="Upload or paste image URL"
            />
            <TextField
              label="Alt Text"
              value={block.props.alt || ''}
              onChange={(v) => updateProp('alt', v)}
              placeholder="Describe the image..."
            />
            <SliderField
              label="Scale"
              value={block.props.scale ?? 100}
              onChange={(v) => updateProp('scale', v)}
              min={25}
              max={100}
              step={5}
              suffix="%"
            />
            <SelectField
              label="Max Width"
              value={block.props.maxWidth || 'full'}
              options={[
                { value: 'small', label: 'Small (448px)' },
                { value: 'medium', label: 'Medium (672px)' },
                { value: 'large', label: 'Large (896px)' },
                { value: 'full', label: 'Full Width' },
              ]}
              onChange={(v) => updateProp('maxWidth', v)}
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
            <ToggleField
              label="Show Caption"
              value={block.props.showCaption ?? false}
              onChange={(v) => updateProp('showCaption', v)}
            />
            {block.props.showCaption && (
              <TextField
                label="Caption"
                value={block.props.caption || ''}
                onChange={(v) => updateProp('caption', v)}
                placeholder="Image caption..."
                multiline
              />
            )}
          </>
        )

      case 'video':
        return (
          <>
            <MediaUpload
              label="Video File"
              value={block.props.videoUrl || ''}
              onChange={(v) => updateProp('videoUrl', v)}
              accept="video"
              placeholder="Upload MP4/WebM or paste URL"
            />
            <TextField
              label="Or YouTube/Vimeo URL"
              value={block.props.videos?.[0]?.url || ''}
              onChange={(v) => updateProp('videos', [{ id: '1', url: v, caption: '' }])}
              placeholder="https://youtube.com/watch?v=..."
            />
            <TextField
              label="Caption"
              value={block.props.caption || ''}
              onChange={(v) => updateProp('caption', v)}
              placeholder="Video caption..."
            />
            <SelectField
              label="Size"
              value={block.props.size || 'large'}
              options={[
                { value: 'small', label: 'Small (400px)' },
                { value: 'medium', label: 'Medium (600px)' },
                { value: 'large', label: 'Large (800px)' },
                { value: 'xlarge', label: 'Extra Large (1000px)' },
                { value: 'full', label: 'Full Width' },
              ]}
              onChange={(v) => updateProp('size', v)}
            />
            <SelectField
              label="Aspect Ratio"
              value={block.props.aspectRatio || '16:9'}
              options={[
                { value: '16:9', label: '16:9 (Widescreen)' },
                { value: '4:3', label: '4:3 (Standard)' },
                { value: '1:1', label: '1:1 (Square)' },
                { value: '9:16', label: '9:16 (Vertical)' },
                { value: '21:9', label: '21:9 (Cinematic)' },
                { value: 'auto', label: 'Auto (Native)' },
              ]}
              onChange={(v) => updateProp('aspectRatio', v)}
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
            <ToggleField
              label="Autoplay (muted)"
              value={block.props.autoplay ?? false}
              onChange={(v) => updateProp('autoplay', v)}
            />
            <ToggleField
              label="Loop"
              value={block.props.loop ?? false}
              onChange={(v) => updateProp('loop', v)}
            />
            <ToggleField
              label="Show Controls"
              value={block.props.showControls ?? true}
              onChange={(v) => updateProp('showControls', v)}
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
            <TextField
              label="Section Heading"
              value={block.props.heading || ''}
              onChange={(v) => updateProp('heading', v)}
              placeholder="Featured Products"
            />
            <SelectField
              label="Data Source"
              value={block.props.dataSource || 'featured'}
              options={[
                { value: 'featured', label: '⭐ Featured Products (from DB)' },
                { value: 'latest', label: '🆕 Latest Products (from DB)' },
                { value: 'category', label: '📁 By Category (from DB)' },
                { value: 'manual', label: '✏️ Manual Selection' },
              ]}
              onChange={(v) => updateProp('dataSource', v)}
            />
            {block.props.dataSource === 'category' && (
              <SelectField
                label="Product Category"
                value={block.props.productCategory || 'all'}
                options={[
                  { value: 'all', label: 'All Products' },
                  { value: 'apparel', label: 'Apparel' },
                  { value: 'poster', label: 'Posters' },
                  { value: 'sticker', label: 'Stickers' },
                  { value: 'gear', label: 'Gear' },
                ]}
                onChange={(v) => updateProp('productCategory', v)}
              />
            )}
            <SelectField
              label="Layout"
              value={block.props.layout || 'grid'}
              options={[
                { value: 'grid', label: '▦ Grid (2-4 columns)' },
                { value: 'carousel', label: '◀▶ Carousel Slider' },
                { value: 'featured', label: '⭐ Featured (1 large + 2 small)' },
                { value: 'list', label: '☰ List View' },
              ]}
              onChange={(v) => updateProp('layout', v)}
            />
            {block.props.layout === 'grid' && (
              <SelectField
                label="Columns"
                value={String(block.props.columns || 4)}
                options={[
                  { value: '2', label: '2 Columns' },
                  { value: '3', label: '3 Columns' },
                  { value: '4', label: '4 Columns' },
                ]}
                onChange={(v) => updateProp('columns', parseInt(v))}
              />
            )}
            <SliderField
              label="Max Items"
              value={block.props.maxItems || 4}
              min={1}
              max={12}
              onChange={(v) => updateProp('maxItems', v)}
            />
            <ToggleField
              label="Show Prices"
              value={block.props.showPrices !== false}
              onChange={(v) => updateProp('showPrices', v)}
            />
            <ToggleField
              label="Show Add to Cart"
              value={block.props.showAddToCart !== false}
              onChange={(v) => updateProp('showAddToCart', v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="View All Text"
                value={block.props.viewAllText || ''}
                onChange={(v) => updateProp('viewAllText', v)}
                placeholder="View All"
              />
              <TextField
                label="View All Link"
                value={block.props.viewAllLink || ''}
                onChange={(v) => updateProp('viewAllLink', v)}
                placeholder="/store"
              />
            </div>
            
            {/* Data source info */}
            {block.props.dataSource !== 'manual' && (
              <div className="p-3 bg-[#CCAA4C]/20 border border-[#CCAA4C]/50 rounded text-xs text-[#CCAA4C]">
                🛒 Products will be loaded from your store database
              </div>
            )}
          </>
        )

      // ============================================
      // CARD GRID SETTINGS
      // ============================================
      case 'cardGrid':
        const cards = block.props.cards || []
        return (
          <>
            <SelectField
              label="Columns"
              value={String(block.props.columns || 3)}
              options={[
                { value: '1', label: '1 Column' },
                { value: '2', label: '2 Columns' },
                { value: '3', label: '3 Columns' },
              ]}
              onChange={(v) => updateProp('columns', parseInt(v))}
            />
            <ToggleField
              label="Show Images"
              value={block.props.showImages !== false}
              onChange={(v) => updateProp('showImages', v)}
            />
            <ToggleField
              label="Show Buttons"
              value={block.props.showButtons !== false}
              onChange={(v) => updateProp('showButtons', v)}
            />
            
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#888]">Cards ({cards.length})</p>
                <button
                  type="button"
                  onClick={() => {
                    const newCard = { 
                      id: `card_${Date.now()}`, 
                      title: 'New Card', 
                      description: 'Card description', 
                      image: '', 
                      link: '', 
                      buttonText: 'Learn More' 
                    }
                    updateProp('cards', [...cards, newCard])
                  }}
                  className="px-2 py-1 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold rounded"
                >
                  + Add Card
                </button>
              </div>
              
              {cards.map((card: any, i: number) => (
                <div key={card.id || i} className="mb-4 p-3 bg-[#1a1a1a] border border-[#353535] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#666]">Card {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newCards = cards.filter((_: any, idx: number) => idx !== i)
                        updateProp('cards', newCards)
                      }}
                      className="text-red-500 text-xs hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                  <TextField
                    label="Title"
                    value={card.title || ''}
                    onChange={(v) => updateArrayItem('cards', i, { title: v })}
                    placeholder="Card title..."
                  />
                  <TextField
                    label="Description"
                    value={card.description || ''}
                    onChange={(v) => updateArrayItem('cards', i, { description: v })}
                    placeholder="Card description..."
                    multiline
                  />
                  <MediaUpload
                    label="Image"
                    value={card.image || ''}
                    onChange={(v) => updateArrayItem('cards', i, { image: v })}
                    accept="image"
                    placeholder="Upload card image"
                  />
                  <TextField
                    label="Link URL"
                    value={card.link || ''}
                    onChange={(v) => updateArrayItem('cards', i, { link: v })}
                    placeholder="/page-url"
                  />
                  <TextField
                    label="Button Text"
                    value={card.buttonText || ''}
                    onChange={(v) => updateArrayItem('cards', i, { buttonText: v })}
                    placeholder="Learn More"
                  />
                </div>
              ))}
            </div>
            
            {/* Colors */}
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <p className="text-[10px] text-[#666] mb-3 uppercase tracking-wide">Card Colors</p>
              <ColorField
                label="Title Color"
                value={block.styling?.accentColor || ''}
                onChange={(v) => updateStyling('accentColor', v)}
              />
              <ColorField
                label="Description Color"
                value={block.styling?.textColor || ''}
                onChange={(v) => updateStyling('textColor', v)}
              />
            </div>
            
            {/* Button Colors */}
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <p className="text-[10px] text-[#666] mb-3 uppercase tracking-wide">Button Colors</p>
              <ColorField
                label="Button Background"
                value={block.props.buttonBgColor || ''}
                onChange={(v) => updateProp('buttonBgColor', v)}
              />
              <ColorField
                label="Button Text"
                value={block.props.buttonTextColor || ''}
                onChange={(v) => updateProp('buttonTextColor', v)}
              />
            </div>
          </>
        )

      // ============================================
      // IMAGE COLUMNS SETTINGS
      // ============================================
      case 'imageColumns':
        const images = block.props.images || []
        return (
          <>
            <SelectField
              label="Columns"
              value={String(block.props.columns || 2)}
              options={[
                { value: '1', label: '1 Column' },
                { value: '2', label: '2 Columns' },
                { value: '3', label: '3 Columns' },
              ]}
              onChange={(v) => updateProp('columns', parseInt(v))}
            />
            <SelectField
              label="Aspect Ratio"
              value={block.props.aspectRatio || '16:9'}
              options={[
                { value: '1:1', label: 'Square (1:1)' },
                { value: '4:3', label: 'Classic (4:3)' },
                { value: '3:2', label: 'Photo (3:2)' },
                { value: '16:9', label: 'Widescreen (16:9)' },
                { value: '21:9', label: 'Cinematic (21:9)' },
              ]}
              onChange={(v) => updateProp('aspectRatio', v)}
            />
            <SelectField
              label="Gap Size"
              value={block.props.gap || 'medium'}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
              onChange={(v) => updateProp('gap', v)}
            />
            <ToggleField
              label="Show Captions"
              value={block.props.showCaptions !== false}
              onChange={(v) => updateProp('showCaptions', v)}
            />
            
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#888]">Images ({images.length})</p>
                <button
                  type="button"
                  onClick={() => {
                    const newImage = { 
                      id: `img_${Date.now()}`, 
                      src: '', 
                      alt: `Image ${images.length + 1}`, 
                      caption: '' 
                    }
                    updateProp('images', [...images, newImage])
                  }}
                  className="px-2 py-1 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold rounded"
                >
                  + Add Image
                </button>
              </div>
              
              {images.map((img: any, i: number) => (
                <div key={img.id || i} className="mb-4 p-3 bg-[#1a1a1a] border border-[#353535] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#666]">Image {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = images.filter((_: any, idx: number) => idx !== i)
                        updateProp('images', newImages)
                      }}
                      className="text-red-500 text-xs hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                  <MediaUpload
                    label="Image"
                    value={img.src || ''}
                    onChange={(v) => updateArrayItem('images', i, { src: v })}
                    accept="image"
                    placeholder="Upload image"
                  />
                  <TextField
                    label="Alt Text"
                    value={img.alt || ''}
                    onChange={(v) => updateArrayItem('images', i, { alt: v })}
                    placeholder="Image description..."
                  />
                  <TextField
                    label="Caption"
                    value={img.caption || ''}
                    onChange={(v) => updateArrayItem('images', i, { caption: v })}
                    placeholder="Optional caption..."
                  />
                </div>
              ))}
            </div>
            
            {/* Colors */}
            <div className="mt-4 pt-4 border-t border-[#353535]">
              <p className="text-[10px] text-[#666] mb-3 uppercase tracking-wide">Caption Color</p>
              <ColorField
                label="Caption Text"
                value={block.styling?.textColor || ''}
                onChange={(v) => updateStyling('textColor', v)}
              />
            </div>
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
            onClick={() => onUpdate({ visible: block.visible === false ? true : false })}
            className={`p-2 rounded ${block.visible !== false ? 'text-[#CCAA4C]' : 'text-[#666]'} hover:bg-[#353535]`}
            title={block.visible !== false ? 'Hide' : 'Show'}
          >
            {block.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
          onChange={(v) => {
            // Setting a color clears the gradient
            const newStyling = { 
              ...(block.styling || {}), 
              backgroundColor: v,
              backgroundGradient: v ? '' : block.styling?.backgroundGradient || '',
            }
            console.log('BlockSettings: Setting backgroundColor', {
              inputValue: v,
              newStyling,
              blockId: block.id
            })
            onUpdate({ styling: newStyling })
          }}
        />
        <GradientField
          label="Background Gradient"
          value={block.styling?.backgroundGradient || ''}
          onChange={(v) => {
            // Setting a gradient clears the color
            onUpdate({
              styling: { 
                ...(block.styling || {}), 
                backgroundGradient: v,
                backgroundColor: v ? '' : block.styling?.backgroundColor || '',
              },
            })
          }}
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
      </CollapsibleSection>

      {/* Spacing - Dedicated section for margin/padding */}
      <CollapsibleSection title="Spacing" icon={Move} defaultOpen={true}>
        <p className="text-[10px] text-[#666] mb-3">
          Control space inside (padding) and outside (margin) this block
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-[#CCAA4C] uppercase tracking-wider mb-2 font-bold">
              Margin (Outside Space)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Top"
                value={block.styling?.marginTop || 'none'}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'small', label: 'Small (8px)' },
                  { value: 'medium', label: 'Medium (16px)' },
                  { value: 'large', label: 'Large (32px)' },
                  { value: 'xlarge', label: 'X-Large (64px)' },
                ]}
                onChange={(v) => updateStyling('marginTop', v)}
              />
              <SelectField
                label="Bottom"
                value={block.styling?.marginBottom || 'none'}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'small', label: 'Small (8px)' },
                  { value: 'medium', label: 'Medium (16px)' },
                  { value: 'large', label: 'Large (32px)' },
                  { value: 'xlarge', label: 'X-Large (64px)' },
                ]}
                onChange={(v) => updateStyling('marginBottom', v)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] text-[#CCAA4C] uppercase tracking-wider mb-2 font-bold">
              Padding (Inside Space)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Top"
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
                label="Bottom"
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
          </div>
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
