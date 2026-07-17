import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { LoginExperience } from '@/components/LoginExperience';
import { getCurrentUser, isAdminAuthenticated } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (await isAdminAuthenticated()) redirect('/admin/access');
  if (user) redirect(user.role === 'admin' ? '/admin/access' : '/dashboard');
  return <Suspense fallback={<main className="auth-shell"><section className="auth-entry"><div className="auth-card">Cargando acceso…</div></section></main>}><LoginExperience /></Suspense>;
}
