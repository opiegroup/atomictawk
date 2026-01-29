import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/admin', '/profile', '/community/upload']
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes - check role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()

      // Check if user has admin access
      if (!profile || !['god', 'admin', 'sales'].includes(profile.role)) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      // Check if user is banned/suspended
      if (profile.status === 'banned' || profile.status === 'suspended') {
        const url = request.nextUrl.clone()
        url.pathname = '/account-suspended'
        return NextResponse.redirect(url)
      }

      // Sales users can only access /admin/leads
      if (profile.role === 'sales' && !request.nextUrl.pathname.startsWith('/admin/leads')) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/leads'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
