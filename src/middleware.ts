import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Define path patterns
  const isAuthPage = pathname.startsWith('/auth/')
  const isPublicPage = pathname === '/'
  const isApiAuthRoute = pathname.startsWith('/api/auth/')
  const isApiRoute = pathname.startsWith('/api/')
  const isStaticAsset = pathname.startsWith('/_next/static/') || 
                       pathname.startsWith('/static/') ||
                       pathname.startsWith('/images/') ||
                       pathname.endsWith('.ico')

  // Skip middleware for static assets and API routes
  if (isStaticAsset || isApiRoute) {
    return NextResponse.next()
  }

  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Create base response
  const response = NextResponse.next()
  
  // Add security headers for non-API routes
  if (!isApiRoute) {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      connect-src 'self' https: wss:;
      frame-ancestors 'none';
      worker-src 'self' blob:;
      form-action 'self';
      base-uri 'self';
      frame-src 'self' https://accounts.google.com;
      media-src 'self' blob: data:;
    `.replace(/\s{2,}/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // Handle authentication redirects
  if (isAuthPage) {
    if (token) {
      // If user is already logged in and tries to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protected routes check
  if (!token && !isPublicPage && !isApiAuthRoute) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/auth/signin', request.url)
    if (pathname !== '/dashboard') {
      redirectUrl.searchParams.set('callbackUrl', pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Add cache control headers
  if (isStaticAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    // Use a less aggressive caching strategy for dynamic content
    response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  }

  return response
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 