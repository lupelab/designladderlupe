import Link from 'next/link';
import { RadarChart } from '@/components/RadarChart';
import { DIMENSIONS, DIMENSION_LABELS, DIMENSION_DESCRIPTIONS } from '@/lib/questionnaire';
import { STEP_COPY, buildNarrativeFromScores, getDimensionInterpretation } from '@/lib/design-ladder';
import { getDimensionRecommendations, getTopPriorities } from '@/lib/recommendations';
import { getLadderStep } from '@/lib/scoring';
import { AssessmentRecord, DimensionScore, HoldingBenchmark } from '@/lib/types';
import { formatDate } from '@/lib/utils';

function getScoreBand(score: number) {
  if (score < 2) return 'Brecha crítica';
  if (score < 3) return 'En desarrollo';
  if (score < 4) return 'Capacidad consistente';
  return 'Fortaleza';
}

function compareLabel(score: number, reference: number) {
  if (score >= reference + 0.25) return 'Por encima';
  if (score <= reference - 0.25) return 'Por debajo';
  return 'Alineado';
}

export function ResultsView({
  item,
  holdingBenchmark,
  agencyAverage,
}: {
  item: AssessmentRecord;
  holdingBenchmark: HoldingBenchmark;
  agencyAverage?: { overallScore: number; dimensionScores: DimensionScore };
}) {
  const ladderStep = item.ladderStep ?? getLadderStep(item.dimensionScores, item.overallScore);
  const stepCopy = STEP_COPY[ladderStep];
  const priorities = getTopPriorities(item.dimensionScores, ladderStep);
  const recommendations = getDimensionRecommendations(item.dimensionScores, ladderStep);
  const narrative = buildNarrativeFromScores(ladderStep, item.dimensionScores);

  return (
    <>
      <section className="hero-grid">
        <article className="hero-card hero-card-main">
          <p className="eyebrow">Diagnóstico general</p>
          <h2>{stepCopy.title}</h2>
          <p className="lead">{stepCopy.summary}</p>
          <p className="muted">{stepCopy.implication}</p>

          <div className="kpi-row">
            <div className="kpi-card">
              <span>Score general</span>
              <strong>{item.overallScore.toFixed(2)}</strong>
            </div>
            <div className="kpi-card">
              <span>Nivel actual</span>
              <strong>{item.maturityLevel}</strong>
            </div>
            <div className="kpi-card">
              <span>Evaluación</span>
              <strong>{formatDate(item.createdAt)}</strong>
            </div>
          </div>
        </article>

        <article className="hero-card">
          <p className="eyebrow">Cómo leer este resultado</p>
          <h3>Qué está diciendo el diagnóstico</h3>
          <p className="muted">{narrative}</p>
          <ul className="priority-list compact-list">
            {stepCopy.signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
          <p className="result-next-step"><strong>Siguiente movimiento sugerido:</strong> {stepCopy.nextMove}</p>
        </article>
      </section>

      <section className="panel compare-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Comparador</p>
            <h3>Tu agencia frente al promedio TEXO</h3>
            <p className="muted">Esta referencia ayuda a ubicar tu resultado dentro del contexto actual del holding y a ver si la agencia está por delante, alineada o por detrás del promedio de madurez.</p>
          </div>
          <Link href="/about-model" className="button button-secondary button-small" title="Entender cómo se calcula el diagnóstico y cómo leer este comparador">
            Entender el modelo
          </Link>
        </div>

        <div className="compare-grid">
          <div className="compare-card compare-card-dark">
            <span>Tu agencia hoy</span>
            <strong>{item.overallScore.toFixed(2)}</strong>
            <small>{item.maturityLevel}</small>
          </div>
          <div className="compare-card">
            <span>Promedio TEXO</span>
            <strong>{holdingBenchmark.overallScore.toFixed(2)}</strong>
            <small>{holdingBenchmark.maturityLevel}</small>
          </div>
          <div className="compare-card">
            <span>Lectura relativa</span>
            <strong>{compareLabel(item.overallScore, holdingBenchmark.overallScore)}</strong>
            <small>{holdingBenchmark.narrative}</small>
          </div>
          {agencyAverage ? (
            <div className="compare-card">
              <span>Promedio histórico de tu agencia</span>
              <strong>{agencyAverage.overallScore.toFixed(2)}</strong>
              <small>Se calcula con las evaluaciones guardadas para esta agencia.</small>
            </div>
          ) : null}
        </div>
      </section>

      <section className="content-grid">
        <RadarChart scores={item.dimensionScores} ladderStep={ladderStep} benchmarkScores={holdingBenchmark.dimensionScores} />

        <article className="scorecard-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Prioridades</p>
              <h3>Dónde conviene intervenir primero</h3>
            </div>
          </div>
          <ol className="priority-list">
            {priorities.map((priority) => (
              <li key={priority.dimension}>
                <strong>{priority.label}</strong>
                <p>{priority.headline}</p>
              </li>
            ))}
          </ol>
          <div className="holding-compare-mini">
            <p className="muted">Tu resultado también puede leerse contra la base TEXO actual. Eso ayuda a distinguir qué capacidades ya están mejor instaladas y cuáles todavía están frenando la transformación.</p>
          </div>
        </article>
      </section>

      <section className="panel narrative-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Lectura desarrollada</p>
            <h3>Qué significa este resultado para una agencia como la tuya</h3>
          </div>
        </div>
        <div className="narrative-grid">
          <article>
            <h4>Lectura general</h4>
            <p>{narrative}</p>
          </article>
          <article>
            <h4>Qué suele pasar en este nivel</h4>
            <p>{stepCopy.implication}</p>
          </article>
          <article>
            <h4>Qué ya está funcionando</h4>
            <p>Las dimensiones con mejor desempeño son aquellas donde hoy existe una práctica más repetible, visible y compartida. Eso no significa perfección, pero sí una base útil para escalar.</p>
          </article>
          <article>
            <h4>Qué te está frenando</h4>
            <p>Las dimensiones con menor score suelen ser las que hacen que el diseño entre tarde, que la empatía con clientes ocurra de forma irregular o que el aprendizaje no se convierta en decisiones concretas.</p>
          </article>
        </div>
      </section>

      <section className="panel dimension-panel results-dimension-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detalle por dimensión</p>
            <h3>Interpretación abierta de cada capacidad</h3>
            <p className="muted">Cada dimensión se explica con lenguaje simple para que no dependa de interpretación personal del evaluador.</p>
          </div>
        </div>

        <div className="results-dimension-grid">
          {DIMENSIONS.map((dimension) => (
            <article className="result-dimension-card" key={dimension}>
              <div className="dimension-card-head">
                <div>
                  <h4>{DIMENSION_LABELS[dimension]}</h4>
                  <p className="muted">{DIMENSION_DESCRIPTIONS[dimension]}</p>
                </div>
                <strong>{item.dimensionScores[dimension].toFixed(2)}</strong>
              </div>
              <div className="result-badges-row">
                <span className="dimension-band">{getScoreBand(item.dimensionScores[dimension])}</span>
                <span className="dimension-band dimension-band-soft">
                  TEXO: {holdingBenchmark.dimensionScores[dimension].toFixed(2)} · {compareLabel(item.dimensionScores[dimension], holdingBenchmark.dimensionScores[dimension])}
                </span>
              </div>
              <p>{getDimensionInterpretation(dimension, item.dimensionScores[dimension])}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="recommendations-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Plan de acción</p>
            <h3>Recomendaciones automáticas desarrolladas</h3>
            <p className="muted">Estas recomendaciones están pensadas para traducir el diagnóstico en decisiones concretas de operación, proceso y desarrollo de capacidades.</p>
          </div>
        </div>

        <div className="recommendation-grid">
          {recommendations.map((rec) => (
            <article key={rec.dimension} className="recommendation-card">
              <div className="recommendation-top">
                <div>
                  <h4>{rec.label}</h4>
                  <p>{rec.headline}</p>
                </div>
                <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>{rec.priority}</span>
              </div>

              <p className="muted">{rec.rationale}</p>

              <ul className="action-list">
                {rec.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="panel model-links-panel">
        <div className="inline-actions split-actions">
          <div>
            <p className="eyebrow">Contexto del modelo</p>
            <h3>¿Querés entender con más detalle qué mide cada peldaño, dimensión y benchmark?</h3>
          </div>
          <div className="inline-actions">
            <Link href="/about-model" className="button button-primary" title="Abrir la explicación completa del modelo, los peldaños y el benchmark">
              Cómo funciona este diagnóstico
            </Link>
            <Link href="/glossary" className="button button-secondary" title="Ir al glosario para revisar definiciones y ejemplos simples">
              Ver glosario
            </Link>
          </div>
        </div>
      </section>

      {item.notes ? (
        <section className="notes-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Contexto adicional</p>
              <h3>Notas del evaluador</h3>
            </div>
          </div>
          <p className="notes-copy">{item.notes}</p>
        </section>
      ) : null}
    </>
  );
}
