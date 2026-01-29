'use client'

import { PageGlobals } from '@/lib/pageBuilder'

interface GlobalSettingsProps {
  globals: PageGlobals
  onUpdate: (updates: Partial<PageGlobals>) => void
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

export function GlobalSettings({ globals, onUpdate }: GlobalSettingsProps) {
  const updateSeo = (key: string, value: string) => {
    onUpdate({
      seo: { ...globals.seo, [key]: value },
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Theme Settings */}
      <div>
        <h3 className="text-[#CCAA4C] text-xs font-bold uppercase tracking-widest mb-4">
          Theme Settings
        </h3>
        <div className="space-y-4">
          <SelectField
            label="Theme"
            value={globals.theme}
            options={[
              { value: 'atomic-dark', label: 'Atomic Dark' },
              { value: 'atomic-light', label: 'Atomic Light' },
            ]}
            onChange={(v) => onUpdate({ theme: v as PageGlobals['theme'] })}
          />
          <SelectField
            label="Background Texture"
            value={globals.backgroundTexture}
            options={[
              { value: 'plain', label: 'Plain' },
              { value: 'metal', label: 'Brushed Metal' },
              { value: 'poster-paper', label: 'Poster Paper' },
              { value: 'concrete', label: 'Concrete' },
            ]}
            onChange={(v) => onUpdate({ backgroundTexture: v as PageGlobals['backgroundTexture'] })}
          />
        </div>
      </div>

      {/* Layout Settings */}
      <div className="pt-4 border-t border-[#353535]">
        <h3 className="text-[#CCAA4C] text-xs font-bold uppercase tracking-widest mb-4">
          Layout
        </h3>
        <div className="space-y-4">
          <SelectField
            label="Header Style"
            value={globals.headerStyle}
            options={[
              { value: 'full', label: 'Full Navigation' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'hidden', label: 'Hidden' },
            ]}
            onChange={(v) => onUpdate({ headerStyle: v as PageGlobals['headerStyle'] })}
          />
          <SelectField
            label="Footer Variant"
            value={globals.footerVariant}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'expanded', label: 'Expanded' },
            ]}
            onChange={(v) => onUpdate({ footerVariant: v as PageGlobals['footerVariant'] })}
          />
        </div>
      </div>

      {/* SEO Settings */}
      <div className="pt-4 border-t border-[#353535]">
        <h3 className="text-[#CCAA4C] text-xs font-bold uppercase tracking-widest mb-4">
          SEO Settings
        </h3>
        <div className="space-y-4">
          <TextField
            label="Page Title"
            value={globals.seo.title}
            onChange={(v) => updateSeo('title', v)}
            placeholder="Page Title | Atomic Tawk"
          />
          <TextField
            label="Meta Description"
            value={globals.seo.description}
            onChange={(v) => updateSeo('description', v)}
            placeholder="Describe this page..."
            multiline
          />
          <TextField
            label="OG Image URL"
            value={globals.seo.ogImage || ''}
            onChange={(v) => updateSeo('ogImage', v)}
            placeholder="/images/og-image.jpg"
          />
        </div>
      </div>
    </div>
  )
}
