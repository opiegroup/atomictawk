import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHomePageLayout } from '@/lib/pageBuilder'

// POST /api/pages/seed-home
// Seeds the home page with all the default Atomic Tawk blocks
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is god/admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['god', 'admin'].includes((profile as any).role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Check if home page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'home')
      .single()

    const homeLayout = createHomePageLayout()

    if (existingPage) {
      // Create new version for existing page
      const { error: versionError } = await (supabase.from('page_versions') as any)
        .insert({
          page_id: (existingPage as any).id,
          version_number: 1,
          layout: homeLayout,
          created_by: user.id,
        })

      if (versionError) {
        console.error('Version error:', versionError)
        return NextResponse.json({ error: versionError.message }, { status: 500 })
      }

      // Update page
      const { error: updateError } = await (supabase.from('pages') as any)
        .update({
          title: 'Home',
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', (existingPage as any).id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Home page updated',
        pageId: (existingPage as any).id 
      })
    }

    // Create new home page
    const { data: newPage, error: pageError } = await (supabase.from('pages') as any)
      .insert({
        slug: 'home',
        title: 'Home',
        status: 'published',
        published_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single()

    if (pageError) {
      console.error('Page error:', pageError)
      return NextResponse.json({ error: pageError.message }, { status: 500 })
    }

    // Create first version
    const { error: versionError } = await (supabase.from('page_versions') as any)
      .insert({
        page_id: (newPage as any).id,
        version_number: 1,
        layout: homeLayout,
        created_by: user.id,
      })

    if (versionError) {
      console.error('Version error:', versionError)
      return NextResponse.json({ error: versionError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Home page created',
      pageId: (newPage as any).id 
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET /api/pages/seed-home
// Returns the default home page layout (for preview)
export async function GET() {
  const homeLayout = createHomePageLayout()
  return NextResponse.json(homeLayout)
}
