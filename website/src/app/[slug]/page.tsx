import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageRenderer } from '@/components/pageBuilder'
import { PageLayout } from '@/lib/pageBuilder'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Fetch page from database by slug
async function getPageBySlug(slug: string): Promise<PageLayout | null> {
  try {
    const supabase = await createClient()
    
    // Try both with and without leading slash
    const slugVariants = [slug, `/${slug}`, slug.replace(/^\//, '')]
    
    let pageData = null
    
    for (const s of slugVariants) {
      const result = await supabase
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', s)
        .eq('status', 'published')
        .single()
      
      if (result.data) {
        pageData = result.data
        break
      }
    }

    if (!pageData) {
      console.log(`[getPageBySlug] Page not found for slug: ${slug}`)
      return null
    }

    // Get the latest version's layout
    const { data: versionData, error: versionError } = await supabase
      .from('page_versions')
      .select('layout')
      .eq('page_id', pageData.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (versionError || !versionData) {
      console.log(`[getPageBySlug] No version found for page: ${pageData.id}`)
      return null
    }

    const layoutData = versionData.layout as any

    // Parse the layout JSON
    const layout: PageLayout = {
      globals: layoutData?.globals || {
        theme: 'atomic-light',
        headerStyle: 'full',
        footerVariant: 'default',
        backgroundTexture: 'plain',
        seo: {
          title: pageData.title || 'Atomic Tawk',
          description: '',
          ogImage: '',
        },
      },
      blocks: layoutData?.blocks || [],
    }

    console.log(`[getPageBySlug] Found page "${pageData.title}" with ${layout.blocks.length} blocks`)

    return layout
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  
  const supabase = await createClient()
  const slugVariants = [slug, `/${slug}`, slug.replace(/^\//, '')]
  
  let pageData = null
  for (const s of slugVariants) {
    const result = await supabase
      .from('pages')
      .select('id, title')
      .eq('slug', s)
      .eq('status', 'published')
      .single()
    
    if (result.data) {
      pageData = result.data
      break
    }
  }

  if (!pageData) {
    return {
      title: 'Page Not Found | Atomic Tawk',
    }
  }

  // Get description from the latest version's globals if available
  const { data: versionData } = await supabase
    .from('page_versions')
    .select('layout')
    .eq('page_id', pageData.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()

  const layoutData = versionData?.layout as any
  const description = layoutData?.globals?.seo?.description || ''

  return {
    title: `${pageData.title} | Atomic Tawk`,
    description,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  
  console.log(`[DynamicPage] Rendering page for slug: ${slug}`)
  
  // Skip if this looks like a known route (prevents conflict)
  const knownRoutes = ['about', 'blog', 'community', 'contact', 'game', 'profile', 'shows', 'store', 'tv', 'admin', 'api']
  if (knownRoutes.includes(slug)) {
    console.log(`[DynamicPage] Slug "${slug}" is a known route, returning 404`)
    notFound()
  }

  // Try to fetch the page from database
  const pageLayout = await getPageBySlug(slug)
  
  console.log(`[DynamicPage] Page layout:`, pageLayout ? `Found with ${pageLayout.blocks?.length || 0} blocks` : 'NOT FOUND')

  if (!pageLayout) {
    console.log(`[DynamicPage] No layout found, returning 404`)
    notFound()
  }

  console.log(`[DynamicPage] Rendering PageRenderer with blocks:`, pageLayout.blocks?.map(b => b.type))

  return <PageRenderer layout={pageLayout} />
}
