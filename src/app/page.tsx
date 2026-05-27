import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';

export default async function HomePage() {
  const agency = await getCurrentAgency();

  if (agency) {
    redirect('/questionnaire');
  }

  return (
    <AppShell
      title="Diagnóstico TEXO de Cultura de Innovación Design-Led"
      subtitle="Una plataforma para diagnosticar, ordenar y hacer seguimiento de cómo cada agencia incorpora innovación, diseño, customer centricity y experimentación en su cultura y operación."
      agency={agency}
      actions={<Link href="/login" className="button button-primary" title="Ingresar con la credencial de tu agencia">Ingresar</Link>}
    >
      <section className="hero-home panel home-grid">
        <div>
          <p className="eyebrow">Qué resuelve</p>
          <h2>Convierte percepciones sobre innovación en una lectura clara, comparable y accionable</h2>
          <p className="lead">
            La plataforma mantiene el flujo actual de Design Ladder, pero ahora usa los 6 bloques y 22 principios de cultura design-led como estructura para entender madurez, brechas y próximos movimientos de cada agencia.
          </p>
          <div className="inline-actions hero-actions">
            <Link href="/login" className="button button-primary" title="Entrar al cuestionario y comenzar una nueva evaluación">Comenzar diagnóstico</Link>
            <Link href="/about-model" className="button button-secondary" title="Leer cómo funciona el modelo, los peldaños y el benchmark TEXO">Cómo funciona</Link>
          </div>
        </div>

        <div className="feature-list">
          <article className="mini-card">
            <strong>6 bloques culturales</strong>
            <p>Liderazgo visionario, liderazgo inspiracional, liderazgo relacional, diseño como identidad, adopción del diseño e innovación por diseño.</p>
          </article>
          <article className="mini-card">
            <strong>22 principios accionables</strong>
            <p>Cada principio se traduce en una pregunta, tooltip, ejemplo aplicado y recomendación para pasar del diagnóstico a la acción.</p>
          </article>
          <article className="mini-card">
            <strong>Comparación con TEXO</strong>
            <p>Además del score individual, cada resultado se puede leer contra una referencia promedio del holding.</p>
          </article>
          <article className="mini-card">
            <strong>Puerta de consultoría</strong>
            <p>El diagnóstico puede abrir un roadmap de innovación, workshops, pilotos y acompañamiento para clientes internos o corporaciones.</p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
