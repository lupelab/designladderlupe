import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';
import {
  DIMENSIONS,
  DIMENSION_DESCRIPTIONS,
  DIMENSION_LABELS,
  DIMENSION_WEIGHTS,
  SCALE_OPTIONS,
} from '@/lib/questionnaire';
import { STEP_COPY } from '@/lib/design-ladder';

export default async function AboutModelPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  return (
    <AppShell
      title="Instructivo de uso"
      agency={agency}
      subtitle="Cómo usar el instrumento de cultura de innovación y diseño centrado en las personas sin sobrecargar al usuario ni aumentar la subjetividad."
    >
      <section className="panel article-panel">
        <div className="article-grid">
          <article>
            <p className="eyebrow">Uso recomendado</p>
            <h2>Una persona completa en representación de la agencia</h2>
            <p>
              Para mantener consistencia, la recomendación es que complete una sola persona con mirada transversal. Puede consultar internamente, pero la carga debe quedar unificada.
            </p>
          </article>
          <article>
            <p className="eyebrow">Qué entendemos por diseño</p>
            <h2>Diseño centrado en las personas</h2>
            <p>
              En este instrumento, diseño no significa solo estética. Significa entender necesidades reales de clientes, usuarios, audiencias y equipos internos para crear, probar y mejorar soluciones.
            </p>
          </article>
        </div>
      </section>

      <section className="panel flow-panel">
        <p className="eyebrow">Secuencia obligatoria</p>
        <div className="flow-grid">
          <article className="flow-card"><span>1</span><h4>Leer</h4><p>Descargar el libro base en PDF.</p></article>
          <article className="flow-card"><span>2</span><h4>Aprender</h4><p>Revisar este instructivo y acordar quién responde.</p></article>
          <article className="flow-card"><span>3</span><h4>Alinear</h4><p>Usar el glosario para responder con criterios similares.</p></article>
          <article className="flow-card"><span>4</span><h4>Diagnosticar</h4><p>Completar el cuestionario por bloques simples.</p></article>
          <article className="flow-card"><span>5</span><h4>Implementar</h4><p>Tomar las conclusiones como checklist de avance.</p></article>
        </div>
      </section>

      <section className="panel article-panel">
        <p className="eyebrow">Bloques evaluados</p>
        <div className="results-dimension-grid">
          {DIMENSIONS.map((dimension) => (
            <article className="result-dimension-card" key={dimension}>
              <h3>{DIMENSION_LABELS[dimension]}</h3>
              <p>{DIMENSION_DESCRIPTIONS[dimension]}</p>
              <p className="muted">Peso en el score general: {(DIMENSION_WEIGHTS[dimension] * 100).toFixed(0)}%</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel article-panel">
        <p className="eyebrow">Escala de respuesta</p>
        <div className="scale-grid scale-grid-model">
          {SCALE_OPTIONS.map((option) => (
            <div className="scale-option scale-option-static" key={option.value}>
              <span className="scale-copy">
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel article-panel">
        <p className="eyebrow">Peldaños de madurez</p>
        <div className="results-dimension-grid">
          {Object.entries(STEP_COPY).map(([key, step]) => (
            <article className="result-dimension-card" key={key}>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
              <p className="muted">{step.implication}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
