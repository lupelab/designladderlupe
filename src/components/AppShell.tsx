import Link from 'next/link';
import { AgencyName } from '@/lib/types';

export function AppShell({
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
  return (
    <main className="page-shell texo-shell">
      <section className="container">
        <header className="shell-header texo-header">
          <div className="shell-main">
            <div className="brand-row">
              <Link href="/" className="brand-mark texo-logo" title="Ir al inicio de la plataforma">
                <span>TEXO</span>
              </Link>
              <div>
                <p className="eyebrow">TEXO · Cultura de innovación</p>
                <h1>{title}</h1>
              </div>
            </div>
            {subtitle ? <p className="lead shell-subtitle">{subtitle}</p> : null}
          </div>

          <div className="shell-actions">
            <nav className="top-nav" aria-label="Navegación principal">
              <Link href="/" title="Volver al inicio y ver el flujo recomendado">Inicio</Link>
              <Link href="/questionnaire" title="Ir al cuestionario de diagnóstico">Diagnóstico</Link>
              <Link href="/action-plan" title="Convertir recomendaciones en acciones concretas">Plan de acción</Link>
              <Link href="/follow-up" title="Controlar avance, fases y consistencia">Seguimiento</Link>
              <Link href="/history" title="Ver el historial de evaluaciones de tu agencia">Historial</Link>
              <Link href="/glossary" title="Abrir el glosario de términos y definiciones">Glosario</Link>
              <Link href="/about-model" title="Entender cómo funciona el modelo, los peldaños y el scoring">Cómo funciona</Link>
            </nav>
            {agency ? <span className="agency-chip" title="Agencia con la sesión activa">Empresa · {agency}</span> : null}
            {actions}
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
