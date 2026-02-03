'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PageEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [PageBuilder, setPageBuilder] = useState<any>(null)
  const [layout, setLayout] = useState<any>(null)
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [pendingLayout, setPendingLayout] = useState<any>(null)
  const [newPageSlug, setNewPageSlug] = useState('')
  const [newPageTitle, setNewPageTitle] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const pageId = params.id as string
  const isNew = pageId === 'new'

  useEffect(() => {
    loadBuilder()
  }, [pageId, isNew])

  const loadBuilder = async () => {
    try {
      // Import modules
      const [builderMod, libMod, supabaseMod] = await Promise.all([
        import('@/components/pageBuilder/PageBuilder'),
        import('@/lib/pageBuilder'),
        import('@/lib/supabase/client'),
      ])

      setPageBuilder(() => builderMod.PageBuilder)

      // Check auth
      const supabase = supabaseMod.getSupabaseClient()
      if (!supabase) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      // Load layout
      if (isNew) {
        setLayout(libMod.createDefaultPageLayout())
      } else {
        const { data: pageData } = await supabase
          .from('pages')
          .select('*')
          .eq('id', pageId)
          .single()

        if (pageData) {
          setPage(pageData)

          const { data: versionData } = await supabase
            .from('page_versions')
            .select('*')
            .eq('page_id', pageId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single()

          if ((versionData as any)?.layout) {
            setLayout((versionData as any).layout)
          } else {
            setLayout(libMod.createDefaultPageLayout())
          }
        } else {
          setLayout(libMod.createDefaultPageLayout())
        }
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Load error:', err)
      setError(err.message || 'Failed to load')
      setLoading(false)
    }
  }

  const handleSave = async (newLayout: any) => {
    if (isNew) {
      // Show modal to get page details
      setPendingLayout(newLayout)
      setNewPageTitle(newLayout.globals?.seo?.title || '')
      setNewPageSlug('')
      setSaveError(null)
      setShowSaveModal(true)
      return
    }

    // Existing page - save directly
    const { getSupabaseClient } = await import('@/lib/supabase/client')
    const supabase = getSupabaseClient()
    if (!supabase) {
      alert('Not connected to database')
      return
    }

    try {
      const { data: versions } = await supabase
        .from('page_versions')
        .select('version_number')
        .eq('page_id', pageId)
        .order('version_number', { ascending: false })
        .limit(1)

      const nextVersion = ((versions as any)?.[0]?.version_number || 0) + 1

      const { error: insertError } = await (supabase.from('page_versions') as any).insert({
        page_id: pageId,
        version_number: nextVersion,
        layout: newLayout,
      })

      if (insertError) {
        alert('Save failed: ' + insertError.message)
        return
      }

      alert('Draft saved!')
    } catch (err: any) {
      alert('Save failed: ' + err.message)
    }
  }

  const handleCreateNewPage = async () => {
    if (!newPageSlug.trim()) {
      setSaveError('Please enter a page slug')
      return
    }

    const { getSupabaseClient } = await import('@/lib/supabase/client')
    const supabase = getSupabaseClient()
    if (!supabase) {
      setSaveError('Not connected to database')
      return
    }

    const slug = newPageSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const title = newPageTitle.trim() || slug

    try {
      const { data: newPage, error: pageError } = await (supabase.from('pages') as any)
        .insert({ slug, title, status: 'draft' })
        .select()
        .single()

      if (pageError || !newPage) {
        setSaveError('Failed to create page: ' + (pageError?.message || 'Unknown error'))
        return
      }

      await (supabase.from('page_versions') as any).insert({
        page_id: (newPage as any).id,
        version_number: 1,
        layout: pendingLayout,
      })

      setShowSaveModal(false)
      router.push(`/admin/pages/${(newPage as any).id}`)
    } catch (err: any) {
      setSaveError('Failed to create page: ' + err.message)
    }
  }

  const handlePublish = async (newLayout: any) => {
    await handleSave(newLayout)

    if (!isNew && pageId) {
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()
      if (supabase) {
        await (supabase.rpc as any)('publish_page', { p_page_id: pageId })
        alert('Page published!')
      }
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#CCAA4C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#CCAA4C]">Loading Page Builder...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error</p>
          <p className="text-[#666] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!PageBuilder || !layout) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-[#666]">Failed to load</p>
      </div>
    )
  }

  return (
    <>
      <PageBuilder
        initialLayout={layout}
        pageId={isNew ? undefined : pageId}
        pageSlug={page?.slug}
        onSave={handleSave}
        onPublish={handlePublish}
      />

      {/* Save New Page Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#252525] border-4 border-[#CCAA4C] p-6 max-w-md w-full mx-4">
            <h2 
              className="text-2xl font-bold uppercase tracking-tight text-white mb-6"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Save New Page
            </h2>

            {saveError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 mb-4 text-sm">
                {saveError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[#CCAA4C] text-sm font-bold uppercase tracking-wide mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="My New Page"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#353535] text-white focus:border-[#CCAA4C] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#CCAA4C] text-sm font-bold uppercase tracking-wide mb-2">
                  Page Slug (URL) *
                </label>
                <div className="flex items-center">
                  <span className="text-[#666] mr-1">/</span>
                  <input
                    type="text"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="my-new-page"
                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border-2 border-[#353535] text-white focus:border-[#CCAA4C] outline-none font-mono"
                  />
                </div>
                <p className="text-[#666] text-xs mt-1">Letters, numbers, and dashes only</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 bg-[#353535] text-white font-bold uppercase tracking-wide hover:bg-[#454545] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPage}
                className="flex-1 px-4 py-3 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase tracking-wide hover:bg-[#E0BE5A] transition-colors"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
