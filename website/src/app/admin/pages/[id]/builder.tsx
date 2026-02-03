'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageBuilder } from '@/components/pageBuilder/PageBuilder'
import { PageLayout, createDefaultPageLayout } from '@/lib/pageBuilder'
import { getSupabaseClient } from '@/lib/supabase/client'

interface BuilderWrapperProps {
  pageId: string
  isNew: boolean
}

export default function BuilderWrapper({ pageId, isNew }: BuilderWrapperProps) {
  const router = useRouter()
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuthAndLoad()
  }, [pageId, isNew])

  const checkAuthAndLoad = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['god', 'admin'].includes(profile.role)) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setIsAdmin(true)

    // Load page
    if (isNew) {
      setLayout(createDefaultPageLayout())
      setLoading(false)
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
          setLayout((versionData as any).layout as PageLayout)
        } else {
          setLayout(createDefaultPageLayout())
        }
      } else {
        setLayout(createDefaultPageLayout())
      }
      setLoading(false)
    }
  }

  const handleSave = async (newLayout: PageLayout) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    if (isNew) {
      const slug = prompt('Enter page slug (e.g., about-us):')
      if (!slug) return

      const title = newLayout.globals.seo.title || slug

      const { data: newPage, error: pageError } = await (supabase.from('pages') as any)
        .insert({ slug, title, status: 'draft' })
        .select()
        .single()

      if (pageError || !newPage) {
        alert('Failed to create page: ' + pageError?.message)
        return
      }

      await (supabase.from('page_versions') as any).insert({
        page_id: (newPage as any).id,
        version_number: 1,
        layout: newLayout,
      })

      router.push(`/admin/pages/${(newPage as any).id}`)
    } else {
      const { data: versions } = await supabase
        .from('page_versions')
        .select('version_number')
        .eq('page_id', pageId)
        .order('version_number', { ascending: false })
        .limit(1)

      const nextVersion = ((versions as any)?.[0]?.version_number || 0) + 1

      await (supabase.from('page_versions') as any).insert({
        page_id: pageId,
        version_number: nextVersion,
        layout: newLayout,
      })

      if (newLayout.globals.seo.title && page?.title !== newLayout.globals.seo.title) {
        await (supabase.from('pages') as any)
          .update({ title: newLayout.globals.seo.title })
          .eq('id', pageId)
      }

      alert('Draft saved!')
    }
  }

  const handlePublish = async (newLayout: PageLayout) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    await handleSave(newLayout)

    if (!isNew && pageId) {
      await (supabase.rpc as any)('publish_page', { p_page_id: pageId })
      alert('Page published!')
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-[#CCAA4C]">Loading...</p>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-red-500">Access denied</p>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-[#666]">Page not found</p>
      </div>
    )
  }

  return (
    <PageBuilder
      initialLayout={layout}
      pageId={isNew ? undefined : pageId}
      pageSlug={page?.slug}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  )
}
