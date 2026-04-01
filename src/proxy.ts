/**
 * Next.js Edge Middleware
 * Runs on Edge (before any page loads)
 * Handles:
 * - Session verification
 * - Role-based route protection
 * - Session expiry handling
 * - Redirect before page renders
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/auth/session',
  '/api/auth/logout',
];

/**
 * Role-based route mappings
 * Maps route groups to required roles
 */
const ROLE_ROUTES: Record<string, string[]> = {
  '/student': ['student'],
  '/faculty': ['faculty'],
  '/admin': ['admin'],
};

/**
 * Check if a route is public
 */
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
};

/**
 * Extract route from pathname
 */
const getRouteBase = (pathname: string): string | null => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : null;
};

/**
 * Verify session cookie with Firebase Admin SDK
 */
const verifySessionCookie = async (
  request: NextRequest
): Promise<{ uid: string; role: string; unverifiable?: boolean } | null> => {
  try {
    // Extract session cookie from request headers
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader?.includes('session=')) {
      return null
    }

    // Parse session cookie
    const cookies = cookieHeader.split(';').map(c => c.trim())
    const sessionCookie = cookies.find(c => c.startsWith('session='))?.split('=')[1]

    if (!sessionCookie) {
      return null
    }

    // Import Admin SDK dynamically to avoid circular imports
    const { getAdminAuthIfInitialized } = await import('@/lib/firebase/admin')

    const adminAuth = getAdminAuthIfInitialized()
    if (!adminAuth) {
      console.warn('🔐 Middleware: Admin Auth not initialized')

      // In local development, avoid false redirects after successful login when
      // middleware cannot verify with Admin SDK in edge runtime.
      if (process.env.NODE_ENV !== 'production') {
        return { uid: 'session-cookie-present', role: 'student', unverifiable: true }
      }

      return null
    }

    // Verify session cookie with Firebase Admin SDK
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)

    // Extract user info and role from token
    const uid = decodedToken.uid
    const role = decodedToken.custom_claims?.role || 'student'

    return { uid, role }
  } catch (error) {
    // Log but don't throw - let route handler decide
    console.warn('🔐 Middleware: Session validation failed', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Main middleware function
 * Runs on every request before it reaches the page
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, images, etc.
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$/)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Only enforce auth for protected role route groups.
  // This prevents typos like /reester from being redirected to /login,
  // allowing Next.js to return a proper 404 page instead.
  const routeBase = getRouteBase(pathname);
  const isProtectedRoleRoute = !!(routeBase && ROLE_ROUTES[routeBase]);
  if (!isProtectedRoleRoute) {
    return NextResponse.next();
  }

  // Verify session for protected routes
  const session = await verifySessionCookie(request);

  // No valid session - redirect to login
  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // If the session cookie exists but cannot be verified in edge middleware,
  // let the request continue and defer strict validation to API routes/pages.
  if (session.unverifiable) {
    return NextResponse.next();
  }

  // Extract role from session
  const userRole = session.role;

  // Check if user has permission for this route
  if (routeBase && ROLE_ROUTES[routeBase]) {
    const allowedRoles = ROLE_ROUTES[routeBase];

    if (!allowedRoles.includes(userRole)) {
      // Role mismatch - redirect to appropriate dashboard or 403
      const unauthorizedUrl = request.nextUrl.clone();

      // Redirect to role-specific dashboard
      switch (userRole) {
        case 'student':
          unauthorizedUrl.pathname = '/student/dashboard';
          break;
        case 'faculty':
          unauthorizedUrl.pathname = '/faculty/dashboard';
          break;
        case 'admin':
          unauthorizedUrl.pathname = '/admin/dashboard';
          break;
        default:
          unauthorizedUrl.pathname = '/login';
      }

      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Request allowed - continue to next
  return NextResponse.next();
}

/**
 * Configure which routes trigger the middleware
 */
export const config = {
  // Run middleware on all routes except specified patterns
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
};

export default proxy;
