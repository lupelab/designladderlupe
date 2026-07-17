import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  AGENCY_COOKIE_NAME,
  makeAdminCookieValue,
  makeAgencyCookieValue,
  validateAdminToken,
  validateAgencyCredentials,
} from '@/lib/auth';
import { AgencyName } from '@/lib/types';

export async function POST(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('mode');
  const formData = await request.formData();

  if (mode === 'agency') {
    const agency = String(formData.get('agency') || '').toUpperCase();
    const password = String(formData.get('password') || '');

    if (!validateAgencyCredentials(agency, password)) {
      return NextResponse.redirect(new URL('/login?error=invalid', request.url));
    }

    const response = NextResponse.redirect(new URL('/questionnaire', request.url));

    response.cookies.set({
      name: AGENCY_COOKIE_NAME,
      value: makeAgencyCookieValue(agency as AgencyName),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return response;
  }

  const token = String(formData.get('token') || '');

  if (!validateAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Invalid admin token' }, { status: 401 });
  }

  const response = NextResponse.redirect(new URL('/admin/access', request.url));

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: makeAdminCookieValue(),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
