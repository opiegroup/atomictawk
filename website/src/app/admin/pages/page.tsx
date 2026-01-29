'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRole } from '@/lib/supabase'
import { Page } from '@/lib/supabase/types'
import { 
  Layout, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Globe,
  FileText,
  Clock,
  Home,
  Loader2
} from 'lucide-react'

export default function PagesListPage() {
  const { isAdmin } = useRole()
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setPages(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    await supabase.from('pages').delete().eq('id', id)
    setPages(pages.filter(p => p.id !== id))
  }

  const seedHomePage = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/pages/seed-home', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        alert('Home page created! Redirecting to editor...')
        router.push(`/admin/pages/${data.pageId}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Failed to seed home page')
    }
    setSeeding(false)
  }

  // Check if home page already exists
  const hasHomePage = pages.some(p => p.slug === 'home')

  if (!isAdmin) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layout className="w-8 h-8 text-[#CCAA4C]" />
            Page Builder
          </h1>
          <p className="text-[#AEACA1] mt-1">
            Create and manage pages with the drag-and-drop builder
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!hasHomePage && (
            <button
              onClick={seedHomePage}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-bold text-sm hover:bg-[#FF6B35]/80 transition-colors disabled:opacity-50"
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Home className="w-4 h-4" />
              )}
              {seeding ? 'Creating...' : 'Seed Home Page'}
            </button>
          )}
          <Link
            href="/admin/pages/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded-lg font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Page
          </Link>
        </div>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#AEACA1]">Loading pages...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-[#353535] mx-auto mb-4" />
          <p className="text-[#AEACA1] mb-4">No pages yet</p>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Page
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map(page => (
            <div
              key={page.id}
              className="bg-[#353535] rounded-lg overflow-hidden border-2 border-transparent hover:border-[#CCAA4C]/50 transition-colors"
            >
              {/* Preview */}
              <div className="aspect-video bg-[#252525] flex items-center justify-center">
                <Layout className="w-12 h-12 text-[#353535]" />
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-bold">{page.title}</h3>
                    <p className="text-[#CCAA4C] text-sm font-mono">/{page.slug}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    page.status === 'published' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {page.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#AEACA1] text-xs mb-4">
                  <Clock className="w-3 h-3" />
                  Updated {new Date(page.updated_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-xs hover:bg-[#CCAA4C]/80 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                  {page.status === 'published' && (
                    <Link
                      href={`/${page.slug}`}
                      target="_blank"
                      className="px-3 py-2 bg-[#252525] text-[#AEACA1] rounded font-bold text-xs hover:bg-[#1a1a1a] transition-colors"
                      title="View Live"
                    >
                      <Globe className="w-3 h-3" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="px-3 py-2 bg-[#252525] text-red-400 rounded font-bold text-xs hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
