import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';
import { DIMENSIONS, DIMENSION_DESCRIPTIONS, DIMENSION_LABELS, DIMENSION_WEIGHTS, SCALE_OPTIONS } from '@/lib/questionnaire';
import { STEP_COPY } from '@/lib/design-ladder';

export default async function AboutModelPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  return (
    <AppShell
      title="Cómo funciona este diagnóstico"
      agency={agency}
      subtitle="Esta sección explica de forma abierta qué mide la plataforma, cómo se calcula el score y qué significa cada peldaño para que el resultado no dependa de interpretación personal."
    >
      <section className="panel article-panel">
        <div className="article-grid">
          <article>
            <p className="eyebrow">Propósito</p>
            <h2>Qué busca medir la herramienta</h2>
            <p>El diagnóstico ayuda a entender qué tan integrada está la gestión del diseño dentro de la forma de trabajar de cada agencia del holding. No mide solo “calidad visual”: también observa estrategia, proceso, insights y capacidad operativa para sostener la transformación.</p>
          </article>
          <article>
            <p className="eyebrow">Qué devuelve</p>
            <h2>Cómo leer el resultado</h2>
            <p>El sistema genera un score general, una lectura por dimensión, un peldaño de madurez, comparación con la referencia TEXO y un plan de acción priorizado. La idea es que el resultado sirva para conversar, decidir e intervenir, no solo para “poner una nota”.</p>
          </article>
        </div>
      </section>

      <section className="panel article-panel">
        <p className="eyebrow">Dimensiones evaluadas</p>
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
        <p className="eyebrow">Escala de madurez</p>
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
        <p className="eyebrow">Peldaños de la Design Ladder</p>
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
