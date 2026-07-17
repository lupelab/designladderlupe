import { NextRequest, NextResponse } from 'next/server';
import { changeUserPassword } from '@/lib/access-control';
import { ACCESS_COOKIE_NAME, getCurrentUser, makeAccessCookieValue } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const current = await getCurrentUser();
  if (!current || current.legacy) {
    return NextResponse.json({ ok: false, error: 'No hay una sesión válida para cambiar la contraseña.' }, { status: 401 });
  }

  try {
    const { password } = await request.json();
    if (!password || String(password).length < 8) {
      return NextResponse.json({ ok: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }
    const user = await changeUserPassword(current.id, String(password));
    const response = NextResponse.json({ ok: true, redirectTo: user.role === 'admin' ? '/admin/access' : user.certificationStatus === 'passed' ? '/dashboard' : '/qualification' });
    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: makeAccessCookieValue({ id: user.id, fullName: user.fullName, email: user.email, agency: user.agency, role: user.role, mustChangePassword: false }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.' }, { status: 500 });
  }
}
