import { NextRequest, NextResponse } from 'next/server';
import { createResetRequest } from '@/lib/access-control';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !String(email).includes('@')) {
      return NextResponse.json({ ok: false, error: 'Ingresá un email válido.' }, { status: 400 });
    }
    await createResetRequest(String(email));
    return NextResponse.json({
      ok: true,
      message: 'Registramos tu solicitud. El administrador podrá restablecer tu contraseña desde el panel de accesos.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo registrar la solicitud.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
