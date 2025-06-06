import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/')
  const isPublicPage = request.nextUrl.pathname === '/'
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth/')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

  // Add security headers
  const response = NextResponse.next()
  
  // Don't add CSP headers to API routes
  if (!isApiRoute) {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      connect-src 'self' https: wss:;
      frame-ancestors 'none';
      worker-src 'self' blob: 'unsafe-eval';
      form-action 'self';
      base-uri 'self';
      frame-src 'self';
      media-src 'self' blob: data:;
    `.replace(/\s{2,}/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // Skip auth check for API auth routes
  if (isApiAuthRoute) {
    return response;
  }

  // Add cache control headers
  const isStaticAsset = request.nextUrl.pathname.startsWith('/_next/static/') || 
                       request.nextUrl.pathname.startsWith('/static/')
  
  if (isStaticAsset) {
    // Cache static assets for 1 year
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    // No cache for dynamic content
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Authentication logic
  if (isAuthPage) {
    if (token) {
      // Redirect to dashboard if user is already logged in
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  if (!token && !isPublicPage && !isApiAuthRoute) {
    // Redirect to login if accessing protected route without token
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
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