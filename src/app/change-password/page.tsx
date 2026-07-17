import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { getCurrentUser } from '@/lib/auth';

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.mustChangePassword) redirect(user.role === 'admin' ? '/admin/access' : '/dashboard');

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="auth-brand"><span>T</span><strong>Design Ladder <small>by TEXO</small></strong></div>
        <div className="auth-story-copy"><span className="auth-kicker">Protección de cuenta</span><h1>Creá una contraseña que solo vos conozcas.</h1><p>La clave temporal ya cumplió su función. Para continuar, definí una nueva contraseña personal.</p></div>
        <div className="auth-story-footer"><span>Acceso protegido</span><span>TEXO</span></div>
      </section>
      <section className="auth-entry"><div className="auth-card"><div className="auth-card-head"><span className="auth-mobile-brand">Design Ladder · TEXO</span><h2>Cambiar contraseña</h2><p>Usá al menos 8 caracteres y evitá claves compartidas con otros servicios.</p></div><ChangePasswordForm /></div></section>
    </main>
  );
}
