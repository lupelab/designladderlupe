import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated, getCurrentUser } from '@/lib/auth';
import { approveAccessUser, listAccessUsers, listPasswordResetRequests, resetUserCertification, resetUserPassword, updateAccessUser } from '@/lib/access-control';
import { AGENCIES } from '@/lib/questionnaire';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [users, resetRequests] = await Promise.all([listAccessUsers(), listPasswordResetRequests()]);
    return NextResponse.json({ ok: true, users, resetRequests });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudieron cargar los accesos.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || '');
    const action = String(body.action || '');
    const currentUser = await getCurrentUser();
    if (!id) return NextResponse.json({ ok: false, error: 'Falta el usuario.' }, { status: 400 });

    if (action === 'approve') {
      const result = await approveAccessUser(id, currentUser?.email || 'bootstrap-admin');
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === 'reset-password') {
      const result = await resetUserPassword(id);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === 'reset-certification') {
      const user = await resetUserCertification(id);
      return NextResponse.json({ ok: true, user });
    }

    const statusMap: Record<string, 'approved' | 'rejected' | 'suspended' | 'pending'> = {
      reject: 'rejected', suspend: 'suspended', reactivate: 'approved', pending: 'pending',
    };
    const status = statusMap[action] || body.status;
    const agency = AGENCIES.includes(body.agency) ? body.agency : undefined;
    const role = body.role === 'admin' || body.role === 'member' ? body.role : undefined;

    const user = await updateAccessUser(id, { status, agency, role, approvedBy: currentUser?.email || 'bootstrap-admin' });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo actualizar el acceso.' }, { status: 500 });
  }
}
