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
      title="Diagnóstico de madurez de diseño para TEXO"
      subtitle="Una plataforma para diagnosticar, ordenar y hacer seguimiento de cómo cada agencia del holding incorpora diseño, empatía con clientes y pensamiento de diseño en su forma de trabajar."
      agency={agency}
      actions={<Link href="/login" className="button button-primary" title="Ingresar con la credencial de tu agencia">Ingresar</Link>}
    >
      <section className="hero-home panel home-grid">
        <div>
          <p className="eyebrow">Qué resuelve</p>
          <h2>Convierte percepciones sobre diseño en una lectura clara, comparable y accionable</h2>
          <p className="lead">
            La plataforma ayuda a TEXO a entender en qué estadio está cada agencia, dónde están las brechas más relevantes y qué prioridades conviene trabajar para llevar el diseño hacia una función más estratégica.
          </p>
          <div className="inline-actions hero-actions">
            <Link href="/login" className="button button-primary" title="Entrar al cuestionario y comenzar una nueva evaluación">Comenzar diagnóstico</Link>
            <Link href="/about-model" className="button button-secondary" title="Leer cómo funciona el modelo, los peldaños y el benchmark TEXO">Cómo funciona</Link>
          </div>
        </div>

        <div className="feature-list">
          <article className="mini-card">
            <strong>Lenguaje de agencia</strong>
            <p>Las preguntas, explicaciones y resultados están escritos en castellano claro y con ejemplos aplicados a publicidad y medios.</p>
          </article>
          <article className="mini-card">
            <strong>Glosario y tooltips</strong>
            <p>La plataforma explica términos, niveles y botones para que nadie tenga que interpretar solo qué significa cada cosa.</p>
          </article>
          <article className="mini-card">
            <strong>Comparación con TEXO</strong>
            <p>Además del score individual, cada resultado se puede leer contra una referencia promedio del holding.</p>
          </article>
          <article className="mini-card">
            <strong>Seguimiento continuo</strong>
            <p>No es solo un diagnóstico puntual: permite construir historial y usarlo como herramienta de mejora continua.</p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
