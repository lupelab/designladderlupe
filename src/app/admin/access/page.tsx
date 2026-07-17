import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { AdminAccessPanel } from '@/components/AdminAccessPanel';
import { getCurrentUser, isAdminAuthenticated } from '@/lib/auth';

export default async function AdminAccessPage() {
  if (!(await isAdminAuthenticated())) redirect('/login');
  const user = await getCurrentUser();
  return (
    <AppShell
      title="Administración de accesos"
      subtitle="Revisá solicitudes, asigná permisos y protegé el acceso a la información de cada agencia."
      agency={user?.agency || 'TEXO'}
      actions={<Link href="/dashboard" className="button button-primary">Probar plataforma →</Link>}
    >
      <AdminAccessPanel />
    </AppShell>
  );
}
