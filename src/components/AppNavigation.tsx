'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', description: 'Vista general', icon: 'home' },
  { href: '/qualification', label: 'Recursos', description: 'Preparación opcional', icon: 'shield' },
  { href: '/questionnaire', label: 'Diagnóstico', description: 'Medir madurez', icon: 'clipboard' },
  { href: '/nps', label: 'NPS de clientes', description: 'Escuchar y accionar', icon: 'pulse' },
  { href: '/action-plan', label: 'Plan y seguimiento', description: 'Mover acciones', icon: 'target' },
  { href: '/history', label: 'Historial', description: 'Comparar avances', icon: 'history' },
];

const RESOURCE_ITEMS = [
  { href: '/glossary', label: 'Glosario', icon: 'book' },
  { href: '/about-model', label: 'Cómo funciona', icon: 'info' },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M14.5 9.5 20 4"/></>,
    pulse: <><path d="M3 12h4l2-5 4 10 2-5h6"/><path d="M4 5.5A9 9 0 1 1 3 15"/></>,
    history: <><path d="M4 7v5h5"/><path d="M5.5 8.5A8 8 0 1 1 4 15"/><path d="M12 8v4l3 2"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <div className="nav-section-label">Trabajo</div>
      <nav className="sidebar-nav" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(pathname, item.href) ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
            onClick={() => setOpen(false)}
          >
            <span className="sidebar-link-icon"><Icon name={item.icon} /></span>
            <span className="sidebar-link-copy">
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </Link>
        ))}
      </nav>

      {isAdmin ? <>
        <div className="nav-section-label nav-section-label-secondary">Administración</div>
        <nav className="sidebar-nav sidebar-nav-compact" aria-label="Administración">
          <Link href="/admin/access" className={isActive(pathname, '/admin/access') ? 'sidebar-link sidebar-link-active' : 'sidebar-link'} onClick={() => setOpen(false)}>
            <span className="sidebar-link-icon"><Icon name="users" /></span><span className="sidebar-link-copy"><strong>Accesos</strong><small>Aprobar usuarios</small></span>
          </Link>
        </nav>
      </> : null}

      <div className="nav-section-label nav-section-label-secondary">Recursos</div>
      <nav className="sidebar-nav sidebar-nav-compact" aria-label="Recursos del modelo">
        {RESOURCE_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(pathname, item.href) ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
            onClick={() => setOpen(false)}
          >
            <span className="sidebar-link-icon"><Icon name={item.icon} /></span>
            <span className="sidebar-link-copy"><strong>{item.label}</strong></span>
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <div className="desktop-navigation">{links}</div>
      <button className="mobile-menu-button" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú">
        <Icon name="menu" />
      </button>
      {open ? (
        <div className="mobile-nav-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <aside className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Menú" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-nav-head">
              <div>
                <span className="mobile-nav-kicker">TEXO</span>
                <strong>Design Ladder</strong>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><Icon name="close" /></button>
            </div>
            {links}
          </aside>
        </div>
      ) : null}
    </>
  );
}
