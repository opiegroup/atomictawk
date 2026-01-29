import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/pages/[slug]
// Fetches a page and its latest version by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch the page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Fetch the latest version
    const { data: version, error: versionError } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', (page as any).id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (versionError || !version) {
      return NextResponse.json({ error: 'No page version found' }, { status: 404 })
    }

    return NextResponse.json({
      page,
      layout: (version as any).layout,
    })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
