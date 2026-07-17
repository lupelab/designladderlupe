import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAccessRequest } from '@/lib/access-control';
import { AGENCIES } from '@/lib/questionnaire';

const schema = z.object({
  fullName: z.string().min(3, 'Ingresá tu nombre completo.'),
  email: z.string().email('Ingresá un email válido.'),
  agency: z.enum(AGENCIES),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || 'Datos inválidos.' }, { status: 400 });
    }

    const user = await createAccessRequest(parsed.data);
    return NextResponse.json({
      ok: true,
      user,
      message: 'Solicitud enviada. Cuando el administrador la apruebe, recibirás una contraseña temporal para tu primer ingreso.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear la solicitud.';
    const setupError = /access_users|relation|does not exist/i.test(message);
    return NextResponse.json({
      ok: false,
      code: setupError ? 'setup_required' : 'server_error',
      error: setupError ? 'Primero ejecutá la migración de accesos incluida en supabase/migrations.' : message,
    }, { status: 500 });
  }
}
