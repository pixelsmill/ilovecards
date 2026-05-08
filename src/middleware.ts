import { auth } from "@/lib/auth"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/verify") ||
    req.nextUrl.pathname.startsWith("/api/auth")

  if (!isAuthenticated && !isAuthRoute) {
    return Response.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
