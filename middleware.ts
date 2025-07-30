import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, /login)
  const { pathname } = request.nextUrl

  // Check if the request is for admin routes
  if (pathname.startsWith("/admin")) {
    // Check for authentication token in cookies or headers
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    // If no token is found, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If accessing login page while authenticated, redirect to admin
  if (pathname === "/login") {
    const token = request.cookies.get("token")?.value
    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
