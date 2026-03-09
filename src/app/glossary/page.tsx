import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';
import { GLOSSARY_TERMS } from '@/lib/questionnaire';

export default async function GlossaryPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  return (
    <AppShell
      title="Glosario integrado"
      agency={agency}
      subtitle="Definiciones simples para que todo el equipo hable el mismo idioma cuando usa la herramienta o interpreta resultados."
    >
      <section className="panel glossary-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Definiciones</p>
            <h2>Términos clave del modelo</h2>
            <p className="muted">Cada definición incluye una explicación concreta y un ejemplo aplicado al trabajo de una agencia de publicidad, medios o contenidos.</p>
          </div>
        </div>
        <div className="glossary-grid">
          {GLOSSARY_TERMS.map((term) => (
            <article key={term.id} className="glossary-card">
              <h3>{term.term}</h3>
              <p>{term.definition}</p>
              {term.appliedExample ? (
                <div className="glossary-example">
                  <strong>Ejemplo aplicado</strong>
                  <p>{term.appliedExample}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
