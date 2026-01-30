'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Menu, Plus, Trash2, GripVertical, Eye, EyeOff, 
  ExternalLink, Lock, ChevronDown, ChevronRight, Save, Link2, CornerDownRight
} from 'lucide-react'
import { useAuth, useRole, getSupabaseClient } from '@/lib/supabase'

interface MenuItem {
  id: string
  menu_location: string
  label: string
  href: string
  icon: string | null
  sort_order: number
  parent_id: string | null
  page_id: string | null
  is_visible: boolean
  open_in_new_tab: boolean
  requires_auth: boolean
  required_roles: string[] | null
  children?: MenuItem[] // For nested display
}

interface Page {
  id: string
  title: string
  slug: string
  status: string
}

export default function MenuManagementPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: roleLoading } = useRole()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLocation, setActiveLocation] = useState<'header' | 'footer'>('header')
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Load menu items and pages
  useEffect(() => {
    if (authLoading || roleLoading) return
    if (!user || !isAdmin) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, isAdmin, authLoading, roleLoading])

  const loadData = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    setLoading(true)
    try {
      // Load menu items
      const { data: items, error: itemsError } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true })

      if (itemsError) throw itemsError
      setMenuItems(items || [])

      // Load pages for linking
      const { data: pagesData, error: pagesError } = await (supabase as any)
        .from('pages')
        .select('id, title, slug, status')
        .eq('status', 'published')
        .order('title', { ascending: true })

      if (pagesError) throw pagesError
      setPages(pagesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveItem = async (item: Partial<MenuItem> & { id?: string }) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    setSaving(true)
    try {
      if (item.id) {
        // Update existing
        const { error } = await (supabase as any)
          .from('menu_items')
          .update({
            label: item.label,
            href: item.href,
            icon: item.icon,
            is_visible: item.is_visible,
            open_in_new_tab: item.open_in_new_tab,
            requires_auth: item.requires_auth,
            page_id: item.page_id,
            parent_id: item.parent_id,
          })
          .eq('id', item.id)

        if (error) throw error
      } else {
        // Create new - calculate sort order based on parent
        const siblings = item.parent_id
          ? menuItems.filter(m => m.parent_id === item.parent_id)
          : menuItems.filter(m => m.menu_location === activeLocation && !m.parent_id)
        const maxOrder = siblings.reduce((max, m) => Math.max(max, m.sort_order), 0)

        const { error } = await (supabase as any)
          .from('menu_items')
          .insert({
            menu_location: activeLocation,
            label: item.label || 'New Link',
            href: item.href || '/',
            icon: item.icon,
            sort_order: maxOrder + 1,
            is_visible: true,
            open_in_new_tab: false,
            requires_auth: false,
            page_id: item.page_id,
            parent_id: item.parent_id,
          })

        if (error) throw error
      }

      await loadData()
      setEditingItem(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save menu item')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      const { error } = await (supabase as any)
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const reorderItems = async (items: MenuItem[]) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      // Update sort_order for all items
      for (let i = 0; i < items.length; i++) {
        await (supabase as any)
          .from('menu_items')
          .update({ sort_order: i })
          .eq('id', items[i].id)
      }
      setMenuItems(prev => {
        const others = prev.filter(m => m.menu_location !== activeLocation)
        return [...others, ...items]
      })
    } catch (error) {
      console.error('Error reordering:', error)
    }
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const locationItems = menuItems
      .filter(m => m.menu_location === activeLocation)
      .sort((a, b) => a.sort_order - b.sort_order)

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= locationItems.length) return

    const newItems = [...locationItems]
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    
    reorderItems(newItems)
  }

  // Get top-level items (no parent)
  const topLevelItems = menuItems
    .filter(m => m.menu_location === activeLocation && !m.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  // Get children for a parent
  const getChildren = (parentId: string) => {
    return menuItems
      .filter(m => m.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  // Build nested structure
  const buildNestedItems = (): MenuItem[] => {
    return topLevelItems.map(item => ({
      ...item,
      children: getChildren(item.id)
    }))
  }

  const nestedItems = buildNestedItems()

  if (authLoading || roleLoading || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-[#888]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Menu className="w-6 h-6 text-[#CCAA4C]" />
            Menu Management
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Manage navigation links that appear on the site
          </p>
        </div>
      </div>

      {/* Location Tabs */}
      <div className="flex gap-2">
        {(['header', 'footer'] as const).map(loc => (
          <button
            key={loc}
            onClick={() => setActiveLocation(loc)}
            className={`px-4 py-2 font-bold uppercase text-sm tracking-wider border-2 transition-colors ${
              activeLocation === loc
                ? 'bg-[#CCAA4C] border-[#CCAA4C] text-[#1a1a1a]'
                : 'bg-transparent border-[#353535] text-[#888] hover:border-[#CCAA4C]/50'
            }`}
          >
            {loc} Menu
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="bg-[#252525] border-2 border-[#353535] rounded">
        <div className="p-4 border-b border-[#353535] flex items-center justify-between">
          <span className="text-sm text-[#888]">
            {nestedItems.length} item(s)
          </span>
          <button
            onClick={() => {
              setIsAddingNew(true)
              setEditingItem({
                id: '',
                menu_location: activeLocation,
                label: '',
                href: '/',
                icon: null,
                sort_order: 0,
                parent_id: null,
                page_id: null,
                is_visible: true,
                open_in_new_tab: false,
                requires_auth: false,
                required_roles: null,
              })
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold uppercase tracking-wider hover:bg-[#CCAA4C]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>

        {/* Items List */}
        <div className="divide-y divide-[#353535]">
          {nestedItems.map((item, index) => (
            <div key={item.id}>
              {/* Parent Item */}
              <div
                className={`p-4 flex items-center gap-4 ${
                  editingItem?.id === item.id ? 'bg-[#1a1a1a]' : 'hover:bg-[#2a2a2a]'
                }`}
              >
                {/* Drag Handle */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="text-[#666] hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === nestedItems.length - 1}
                    className="text-[#666] hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    {item.icon && <span>{item.icon}</span>}
                    <span className="font-bold text-white">{item.label}</span>
                    {(item.children?.length || 0) > 0 && (
                      <span className="text-[10px] bg-[#CCAA4C]/20 text-[#CCAA4C] px-2 py-0.5 rounded">
                        {item.children?.length} sub-items
                      </span>
                    )}
                    {!item.is_visible && (
                      <EyeOff className="w-4 h-4 text-[#666]" />
                    )}
                    {item.requires_auth && (
                      <Lock className="w-3 h-3 text-[#CCAA4C]" />
                    )}
                    {item.open_in_new_tab && (
                      <ExternalLink className="w-3 h-3 text-[#666]" />
                    )}
                  </div>
                  <div className="text-xs text-[#666] flex items-center gap-1 mt-1">
                    <Link2 className="w-3 h-3" />
                    {item.page_id 
                      ? `Page: ${pages.find(p => p.id === item.page_id)?.title || 'Unknown'}`
                      : item.href
                    }
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAddingNew(true)
                      setEditingItem({
                        id: '',
                        menu_location: activeLocation,
                        label: '',
                        href: '/',
                        icon: null,
                        sort_order: 0,
                        parent_id: item.id, // Set parent to this item
                        page_id: null,
                        is_visible: true,
                        open_in_new_tab: false,
                        requires_auth: false,
                        required_roles: null,
                      })
                    }}
                    className="px-2 py-1 text-xs font-bold uppercase text-[#39FF14] hover:text-white flex items-center gap-1"
                    title="Add child item"
                  >
                    <Plus className="w-3 h-3" />
                    Sub
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1 text-xs font-bold uppercase text-[#CCAA4C] hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-[#666] hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Child Items */}
              {item.children && item.children.length > 0 && (
                <div className="bg-[#1a1a1a] border-l-4 border-[#CCAA4C]/30">
                  {item.children.map((child, childIndex) => (
                    <div
                      key={child.id}
                      className={`p-4 pl-8 flex items-center gap-4 border-t border-[#353535] ${
                        editingItem?.id === child.id ? 'bg-[#252525]' : 'hover:bg-[#252525]'
                      }`}
                    >
                      {/* Child indicator */}
                      <CornerDownRight className="w-4 h-4 text-[#CCAA4C]/50" />

                      {/* Item Info */}
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          {child.icon && <span>{child.icon}</span>}
                          <span className="font-medium text-white/80">{child.label}</span>
                          {!child.is_visible && (
                            <EyeOff className="w-4 h-4 text-[#666]" />
                          )}
                        </div>
                        <div className="text-xs text-[#666] flex items-center gap-1 mt-1">
                          <Link2 className="w-3 h-3" />
                          {child.page_id 
                            ? `Page: ${pages.find(p => p.id === child.page_id)?.title || 'Unknown'}`
                            : child.href
                          }
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem(child)}
                          className="px-3 py-1 text-xs font-bold uppercase text-[#CCAA4C] hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(child.id)}
                          className="p-2 text-[#666] hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {nestedItems.length === 0 && (
            <div className="p-8 text-center text-[#666]">
              No menu items yet. Click "Add Menu Item" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#252525] border-4 border-[#CCAA4C] rounded max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#353535] flex items-center justify-between">
              <h2 className="font-bold text-white">
                {isAddingNew ? 'Add Menu Item' : 'Edit Menu Item'}
              </h2>
              <button
                onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                className="text-[#666] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  placeholder="Menu label"
                />
              </div>

              {/* Link Type */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                  Link To
                </label>
                <select
                  value={editingItem.page_id ? 'page' : 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'page') {
                      setEditingItem({ ...editingItem, href: '', page_id: pages[0]?.id || null })
                    } else {
                      setEditingItem({ ...editingItem, page_id: null, href: '/' })
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                >
                  <option value="custom">Custom URL</option>
                  <option value="page">Page (from Page Builder)</option>
                </select>
              </div>

              {/* Page Selector or URL */}
              {editingItem.page_id !== null ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                    Select Page
                  </label>
                  <select
                    value={editingItem.page_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, page_id: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  >
                    <option value="">-- Select a page --</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.title} (/{page.slug})
                      </option>
                    ))}
                  </select>
                  {pages.length === 0 && (
                    <p className="text-xs text-[#FF6B35] mt-1">
                      No published pages available. Create and publish a page first.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={editingItem.href}
                    onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    placeholder="/about or https://..."
                  />
                </div>
              )}

              {/* Icon */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                  Icon (emoji)
                </label>
                <input
                  type="text"
                  value={editingItem.icon || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value || null })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  placeholder="🎮"
                />
              </div>

              {/* Parent (for dropdown) */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                  Parent Item (for dropdown)
                </label>
                <select
                  value={editingItem.parent_id || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                >
                  <option value="">— Top Level (no parent) —</option>
                  {topLevelItems
                    .filter(item => item.id !== editingItem.id) // Can't be parent of itself
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.icon && `${item.icon} `}{item.label}
                      </option>
                    ))
                  }
                </select>
                <p className="text-[10px] text-[#666] mt-1">
                  Select a parent to make this a dropdown sub-item
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_visible}
                    onChange={(e) => setEditingItem({ ...editingItem, is_visible: e.target.checked })}
                    className="w-4 h-4 accent-[#CCAA4C]"
                  />
                  <span className="text-sm text-white">Visible</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.open_in_new_tab}
                    onChange={(e) => setEditingItem({ ...editingItem, open_in_new_tab: e.target.checked })}
                    className="w-4 h-4 accent-[#CCAA4C]"
                  />
                  <span className="text-sm text-white">Open in new tab</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.requires_auth}
                    onChange={(e) => setEditingItem({ ...editingItem, requires_auth: e.target.checked })}
                    className="w-4 h-4 accent-[#CCAA4C]"
                  />
                  <span className="text-sm text-white">Require login to see</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-[#353535] flex justify-end gap-2">
              <button
                onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                className="px-4 py-2 text-sm font-bold uppercase text-[#888] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => saveItem(editingItem)}
                disabled={saving || !editingItem.label}
                className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] text-sm font-bold uppercase hover:bg-[#CCAA4C]/80 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-[#1a1a1a] border border-[#353535] rounded p-4">
        <h3 className="font-bold text-[#CCAA4C] uppercase text-sm mb-2">How to add a page to the menu:</h3>
        <ol className="text-sm text-[#888] space-y-1 list-decimal list-inside">
          <li>Create and <strong>publish</strong> your page in the Page Builder</li>
          <li>Click "Add Menu Item" above</li>
          <li>Set "Link To" to "Page (from Page Builder)"</li>
          <li>Select your page from the dropdown</li>
          <li>The URL will automatically use the page&apos;s slug</li>
        </ol>
      </div>
    </div>
  )
}
