import { NextRequest, NextResponse } from 'next/server';

const PRIVATE_PREFIXES = ['/dashboard', '/qualification', '/readiness', '/training', '/certification', '/questionnaire', '/nps', '/results', '/action-plan', '/follow-up', '/history', '/glossary', '/about-model', '/admin', '/change-password'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const hasSession = Boolean(
    request.cookies.get('designladder_access')?.value ||
    request.cookies.get('designladder_agency')?.value ||
    request.cookies.get('designladder_admin')?.value
  );

  if (!hasSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/qualification/:path*', '/readiness/:path*', '/training/:path*', '/certification/:path*', '/questionnaire/:path*', '/nps/:path*', '/results/:path*', '/action-plan/:path*', '/follow-up/:path*', '/history/:path*', '/glossary/:path*', '/about-model/:path*', '/admin/:path*', '/change-password/:path*'],
};
