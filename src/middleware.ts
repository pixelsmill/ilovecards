import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Stub minimal — sera remplacé en story 1.3 avec Auth.js v5
export default function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*', '/api/:path*'] }
