import { NextRequest, NextResponse } from 'next/server';
import { findAccessUserByEmail, touchLastLogin } from '@/lib/access-control';
import { ACCESS_COOKIE_NAME, makeAccessCookieValue, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Completá email y contraseña.' }, { status: 400 });
    }

    const found = await findAccessUserByEmail(email);
    if (!found || !verifyPassword(password, found.passwordHash)) {
      return NextResponse.json({ ok: false, error: 'Email o contraseña incorrectos.' }, { status: 401 });
    }

    if (found.user.status === 'pending') {
      return NextResponse.json({ ok: false, code: 'pending', error: 'Tu solicitud todavía está pendiente de aprobación.' }, { status: 403 });
    }
    if (found.user.status === 'rejected') {
      return NextResponse.json({ ok: false, code: 'rejected', error: 'La solicitud fue rechazada. Contactá al administrador.' }, { status: 403 });
    }
    if (found.user.status === 'suspended') {
      return NextResponse.json({ ok: false, code: 'suspended', error: 'Este acceso se encuentra suspendido.' }, { status: 403 });
    }

    const response = NextResponse.json({
      ok: true,
      redirectTo: found.user.mustChangePassword ? '/change-password' : found.user.role === 'admin' ? '/admin/access' : found.user.certificationStatus === 'passed' ? '/dashboard' : '/qualification',
      user: found.user,
    });

    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: makeAccessCookieValue({
        id: found.user.id,
        fullName: found.user.fullName,
        email: found.user.email,
        agency: found.user.agency,
        role: found.user.role,
        mustChangePassword: found.user.mustChangePassword,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    await touchLastLogin(found.user.id);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
    const setupError = /access_users|relation|does not exist/i.test(message);
    return NextResponse.json(
      {
        ok: false,
        code: setupError ? 'setup_required' : 'server_error',
        error: setupError
          ? 'El módulo de accesos todavía no fue inicializado. Ejecutá la migración de Supabase incluida en el proyecto.'
          : message,
      },
      { status: 500 }
    );
  }
}
