import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (adminSession?.value !== 'true') {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
