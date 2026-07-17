import Link from 'next/link';
import { AgencyName } from '@/lib/types';
import { AppNavigation } from '@/components/AppNavigation';
import { getCurrentUser, isAdminAuthenticated } from '@/lib/auth';

export async function AppShell({
  agency,
  title,
  subtitle,
  children,
  actions,
}: {
  agency?: AgencyName | null;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const adminAuthenticated = await isAdminAuthenticated();
  const activeAgency = agency || user?.agency;

  return (
    <main className="page-shell texo-shell">
      <div className="app-frame">
        <aside className="app-sidebar">
          <Link href="/dashboard" className="sidebar-brand" title="Ir al inicio de la plataforma">
            <span className="sidebar-brand-mark">T</span>
            <span><strong>Design Ladder</strong><small>by TEXO</small></span>
          </Link>
          <AppNavigation isAdmin={adminAuthenticated} />
          <div className="sidebar-insight"><span>Objetivo del modelo</span><strong>Convertir diagnóstico en prácticas sostenibles.</strong><p>Medí, priorizá, implementá y volvé a medir con evidencia.</p></div>
          {user ? <div className="sidebar-user"><span className="sidebar-user-avatar">{user.fullName.slice(0, 1).toUpperCase()}</span><div><strong>{user.fullName}</strong><small>{user.adminPreview ? 'Modo prueba · acceso total' : `${activeAgency} · ${user.role === 'admin' ? 'Admin' : 'Miembro'}`}</small></div></div> : adminAuthenticated ? <div className="sidebar-user"><span className="sidebar-user-avatar">A</span><div><strong>Administración inicial</strong><small>Sesión temporal con token</small></div></div> : null}
        </aside>

        <div className="app-main">
          <header className="mobile-topbar"><Link href="/dashboard" className="mobile-brand"><span>T</span><strong>Design Ladder</strong></Link><AppNavigation isAdmin={adminAuthenticated} /></header>
          <div className="content-container">
            <header className="page-heading">
              <div className="page-heading-copy"><p className="eyebrow">TEXO · Cultura de innovación</p><h1>{title}</h1>{subtitle ? <p className="lead shell-subtitle">{subtitle}</p> : null}</div>
              <div className="page-heading-actions">{activeAgency ? <span className="agency-chip">{activeAgency}</span> : null}{actions}{user || adminAuthenticated ? <form action="/api/admin/logout" method="POST"><button className="button button-ghost button-small">{user ? 'Cerrar sesión' : 'Salir del modo administrador'}</button></form> : null}</div>
            </header>
            {user?.adminPreview ? <div className="admin-preview-banner"><div><span>⚙</span><p><strong>Modo administrador de prueba</strong> Todos los módulos están desbloqueados para que puedas recorrerlos sin completar checklist, simulacro ni examen.</p></div><Link href="/admin/access" className="button button-small button-secondary">Volver a accesos</Link></div> : null}
            <div className="page-content">{children}</div>
            <footer className="app-footer"><span>Design Ladder · TEXO</span><span>Diagnóstico de cultura de innovación centrada en las personas</span></footer>
          </div>
        </div>
      </div>
    </main>
  );
}
