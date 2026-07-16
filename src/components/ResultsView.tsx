'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RadarChart } from '@/components/RadarChart';
import {
  DIMENSIONS,
  DIMENSION_LABELS,
  DIMENSION_DESCRIPTIONS,
} from '@/lib/questionnaire';
import {
  STEP_COPY,
  buildNarrativeFromScores,
  getDimensionInterpretation,
} from '@/lib/design-ladder';
import {
  getDimensionRecommendations,
  getTopPriorities,
} from '@/lib/recommendations';
import { getLadderStep } from '@/lib/scoring';
import {
  AssessmentRecord,
  DimensionKey,
  DimensionScore,
  HoldingBenchmark,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';

type InsightType = 'strength' | 'gap' | 'opportunity' | 'risk';

type AiDiagnosis = {
  executiveSummary?: {
    title?: string;
    summary?: string;
    status?: string;
    nextStep?: string;
  };
  keyInsights?: Array<{
    title?: string;
    description?: string;
    type?: InsightType;
  }>;
  benchmarkComparison?: Array<{
    dimension?: string;
    agencyScore?: number;
    texoScore?: number;
    gap?: number;
    status?: 'above' | 'below' | 'equal';
  }>;
  priorities?: Array<{
    title?: string;
    priority?: 'Alta' | 'Media' | 'Baja';
    impact?: 'Alto' | 'Medio' | 'Bajo';
    effort?: 'Alto' | 'Medio' | 'Bajo';
    checklist?: string[];
  }>;
  roadmap90Days?: {
    days30?: string[];
    days60?: string[];
    days90?: string[];
  };
  finalRecommendation?: string;
};

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

function compareStatus(score: number, reference: number) {
  if (score >= reference + 0.25) return 'above';
  if (score <= reference - 0.25) return 'below';
  return 'equal';
}

function safeScore(value: number | undefined | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return value;
}

function gapValue(score: number, reference: number) {
  return Number((score - reference).toFixed(2));
}
function actionPlanHref(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  return `/action-plan/new?${search.toString()}`;
}


function getInsightLabel(type?: InsightType) {
  if (type === 'strength') return 'Fortaleza';
  if (type === 'gap') return 'Brecha';
  if (type === 'risk') return 'Riesgo';
  return 'Oportunidad';
}

function getInsightClass(type?: InsightType) {
  if (type === 'strength') return 'insight-strength';
  if (type === 'gap') return 'insight-gap';
  if (type === 'risk') return 'insight-risk';
  return 'insight-opportunity';
}

function defaultAiDiagnosis(
  item: AssessmentRecord,
  holdingBenchmark: HoldingBenchmark,
  priorities: ReturnType<typeof getTopPriorities>
): AiDiagnosis {
  const comparison = DIMENSIONS.map((dimension) => {
    const agencyScore = safeScore(item.dimensionScores[dimension]);
    const texoScore = safeScore(holdingBenchmark.dimensionScores[dimension]);
    return {
      dimension: DIMENSION_LABELS[dimension],
      agencyScore,
      texoScore,
      gap: gapValue(agencyScore, texoScore),
      status: compareStatus(agencyScore, texoScore) as 'above' | 'below' | 'equal',
    };
  });

  return {
    executiveSummary: {
      title: 'Lectura ejecutiva inicial',
      summary:
        'El diagnóstico ordena la madurez actual de cultura de innovación y diseño centrado en las personas para convertir percepciones en decisiones accionables.',
      status: item.maturityLevel,
      nextStep: priorities[0]?.headline || 'Priorizar una acción concreta para avanzar al siguiente peldaño.',
    },
    keyInsights: priorities.slice(0, 3).map((priority, index) => ({
      title: priority.label,
      description: priority.headline,
      type: index === 0 ? 'gap' : 'opportunity',
    })),
    benchmarkComparison: comparison,
    priorities: priorities.slice(0, 3).map((priority) => ({
      title: priority.label,
      priority: priority.priority,
      impact: 'Alto',
      effort: priority.priority === 'Alta' ? 'Medio' : 'Bajo',
      checklist: [
        priority.headline,
        'Definir un responsable y una fecha de revisión.',
        'Documentar evidencia de avance y aprendizaje.',
      ],
    })),
    roadmap90Days: {
      days30: ['Elegir un responsable por agencia.', 'Seleccionar una prioridad de mejora.'],
      days60: ['Probar un ritual o piloto simple.', 'Revisar aprendizajes con dirección.'],
      days90: ['Documentar resultados.', 'Definir qué se escala al siguiente ciclo.'],
    },
    finalRecommendation:
      'Avanzar con pocas acciones, claras y medibles, evitando convertir el diagnóstico en un informe largo sin implementación.',
  };
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
  const ladderStep =
    item.ladderStep ?? getLadderStep(item.dimensionScores, item.overallScore);

  const stepCopy = STEP_COPY[ladderStep];
  const priorities = getTopPriorities(item.dimensionScores, ladderStep);
  const recommendations = getDimensionRecommendations(item.dimensionScores, ladderStep);
  const narrative = buildNarrativeFromScores(ladderStep, item.dimensionScores);

  const holdingMaturityLevel = holdingBenchmark.maturityLevel || 'Benchmark dinámico';
  const holdingNarrative =
    holdingBenchmark.narrative ||
    'Promedio calculado con la última evaluación disponible de cada agencia del holding TEXO. No representa una evaluación individual de TEXO.';

  const fallbackDiagnosis = useMemo(
    () => defaultAiDiagnosis(item, holdingBenchmark, priorities),
    [item, holdingBenchmark, priorities]
  );

  const [aiDiagnosis, setAiDiagnosis] = useState<AiDiagnosis>(fallbackDiagnosis);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const aiPayloadKey = useMemo(() => {
    return JSON.stringify({
      assessmentId: item.id,
      assessmentScore: item.overallScore,
      benchmarkScore: holdingBenchmark.overallScore,
      benchmarkDimensions: holdingBenchmark.dimensionScores,
    });
  }, [item.id, item.overallScore, holdingBenchmark.overallScore, holdingBenchmark.dimensionScores]);

  async function generateAiDiagnosis() {
    try {
      setAiLoading(true);
      setAiError('');

      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ assessment: item, texoBenchmark: holdingBenchmark }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo generar el diagnóstico IA.');
      }

      setAiDiagnosis(data.diagnosis || fallbackDiagnosis);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : String(error));
      setAiDiagnosis(fallbackDiagnosis);
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    generateAiDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPayloadKey]);

  const benchmarkRows =
    aiDiagnosis.benchmarkComparison?.length
      ? aiDiagnosis.benchmarkComparison
      : fallbackDiagnosis.benchmarkComparison || [];

  return (
    <>
      <section className="hero-grid">
        <article className="hero-card hero-card-main texo-hero-card">
          <p className="eyebrow">Cultura de innovación y diseño centrado en las personas</p>
          <h2>{stepCopy.title}</h2>
          <p className="lead">{stepCopy.summary}</p>
          <p className="muted">
            Diseño centrado en las personas significa entender necesidades reales de clientes, usuarios,
            audiencias y equipos internos para crear, probar y mejorar soluciones.
          </p>

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
          <p className="eyebrow">Lectura breve</p>
          <h3>Qué está diciendo el diagnóstico</h3>
          <p className="muted">{narrative}</p>
          <p className="result-next-step">
            <strong>Siguiente movimiento sugerido:</strong> {stepCopy.nextMove}
          </p>
        </article>
      </section>

      <section className="panel compare-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Comparador</p>
            <h3>Tu agencia frente al benchmark de agencias TEXO</h3>
            <p className="muted">{holdingNarrative}</p>
          </div>
          <Link href="/about-model" className="button button-secondary button-small">
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
            <span>Benchmark agencias TEXO</span>
            <strong>{holdingBenchmark.overallScore.toFixed(2)}</strong>
            <small>{holdingMaturityLevel}</small>
          </div>
          <div className="compare-card">
            <span>Lectura relativa</span>
            <strong>{compareLabel(item.overallScore, holdingBenchmark.overallScore)}</strong>
            <small>Brecha: {gapValue(item.overallScore, holdingBenchmark.overallScore)}</small>
          </div>
          {agencyAverage ? (
            <div className="compare-card">
              <span>Promedio histórico agencia</span>
              <strong>{agencyAverage.overallScore.toFixed(2)}</strong>
              <small>Promedio de evaluaciones guardadas.</small>
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel ai-visual-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Diagnóstico ejecutivo con IA</p>
            <h3>{aiDiagnosis.executiveSummary?.title || 'Lectura modular'}</h3>
            <p className="muted">
              Lectura esquemática, menor a 400 palabras, orientada a próximos pasos y estrategia corporativa.
            </p>
          </div>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={generateAiDiagnosis}
            disabled={aiLoading}
          >
            {aiLoading ? 'Generando...' : 'Regenerar diagnóstico IA'}
          </button>
        </div>

        {aiError ? (
          <div className="result-alert">
            <strong>No se pudo generar el diagnóstico IA.</strong>
            <p>{aiError}</p>
          </div>
        ) : null}

        <div className="ai-summary-grid">
          <article className="ai-summary-card ai-summary-main">
            <span>Estado ejecutivo</span>
            <strong>{aiDiagnosis.executiveSummary?.status || item.maturityLevel}</strong>
            <p>{aiDiagnosis.executiveSummary?.summary}</p>
          </article>
          <article className="ai-summary-card">
            <span>Siguiente paso recomendado</span>
            <strong>Acción inmediata</strong>
            <p>{aiDiagnosis.executiveSummary?.nextStep}</p>
          </article>
          <article className="ai-summary-card">
            <span>Foco</span>
            <strong>Implementar</strong>
            <p>{aiDiagnosis.finalRecommendation}</p>
          </article>
        </div>

        <div className="ai-insight-grid">
          {(aiDiagnosis.keyInsights || []).slice(0, 4).map((insight, index) => (
            <article className={`ai-insight-card ${getInsightClass(insight.type)}`} key={`${insight.title}-${index}`}>
              <span>{getInsightLabel(insight.type)}</span>
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
            </article>
          ))}
        </div>

        <details className="result-details" open>
          <summary>Ver comparación por bloque</summary>
          <div className="benchmark-bars">
            {benchmarkRows.map((row, index) => {
              const agencyScore = safeScore(row.agencyScore);
              const texoScore = safeScore(row.texoScore);
              const agencyWidth = Math.min(100, Math.max(0, (agencyScore / 5) * 100));
              const texoWidth = Math.min(100, Math.max(0, (texoScore / 5) * 100));
              return (
                <div className="benchmark-row" key={`${row.dimension}-${index}`}>
                  <div className="benchmark-row-head">
                    <strong>{row.dimension}</strong>
                    <span>{row.gap && row.gap > 0 ? '+' : ''}{safeScore(row.gap).toFixed(2)} vs benchmark</span>
                  </div>
                  <div className="bar-pair">
                    <span style={{ width: `${agencyWidth}%` }}>Agencia {agencyScore.toFixed(2)}</span>
                  </div>
                  <div className="bar-pair bar-pair-soft">
                    <span style={{ width: `${texoWidth}%` }}>Benchmark {texoScore.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </details>

        <details className="result-details" open>
          <summary>Prioridades convertidas en checklist</summary>
          <div className="ai-priority-grid">
            {(aiDiagnosis.priorities || []).slice(0, 3).map((priority, index) => (
              <article className="ai-priority-card" key={`${priority.title}-${index}`}>
                <div className="recommendation-top">
                  <h4>{priority.title}</h4>
                  <span className={`priority-badge priority-${(priority.priority || 'Media').toLowerCase()}`}>
                    {priority.priority || 'Media'}
                  </span>
                </div>
                <div className="result-badges-row">
                  <span className="dimension-band">Impacto {priority.impact || 'Medio'}</span>
                  <span className="dimension-band dimension-band-soft">Esfuerzo {priority.effort || 'Medio'}</span>
                </div>
                <ul className="checklist-list">
                  {(priority.checklist || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  className="button button-secondary button-small action-create-button"
                  href={actionPlanHref({
                    assessmentId: item.id,
                    title: priority.title || 'Acción sugerida por IA',
                    description: (priority.checklist || []).join(' · '),
                    priority: priority.priority || 'Alta',
                    impact: priority.impact || 'Alto',
                    effort: priority.effort || 'Medio',
                    source: 'IA',
                  })}
                >
                  Convertir en acción
                </Link>
              </article>
            ))}
          </div>
        </details>

        <details className="result-details">
          <summary>Roadmap 30 · 60 · 90 días</summary>
          <div className="roadmap-grid">
            <RoadmapColumn title="30 días" items={aiDiagnosis.roadmap90Days?.days30 || []} />
            <RoadmapColumn title="60 días" items={aiDiagnosis.roadmap90Days?.days60 || []} />
            <RoadmapColumn title="90 días" items={aiDiagnosis.roadmap90Days?.days90 || []} />
          </div>
        </details>
      </section>

      <section className="content-grid">
        <RadarChart
          scores={item.dimensionScores}
          ladderStep={ladderStep}
          benchmarkScores={holdingBenchmark.dimensionScores}
        />

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
                <Link
                  className="button button-secondary button-small"
                  href={actionPlanHref({
                    assessmentId: item.id,
                    dimension: priority.dimension,
                    title: priority.headline,
                    description: `Acción prioritaria para ${priority.label}.`,
                    priority: priority.priority,
                    source: 'Recomendación automática',
                  })}
                >
                  Crear acción
                </Link>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="panel dimension-panel results-dimension-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detalle por bloque</p>
            <h3>Profundizar solo donde haga falta</h3>
            <p className="muted">
              La información queda plegada para reducir carga cognitiva. Abrí cada bloque si querés revisar la interpretación.
            </p>
          </div>
        </div>

        <div className="results-dimension-grid">
          {DIMENSIONS.map((dimension: DimensionKey) => {
            const agencyScore = safeScore(item.dimensionScores[dimension]);
            const texoScore = safeScore(holdingBenchmark.dimensionScores[dimension]);

            return (
              <details className="result-dimension-card dimension-detail-card" key={dimension}>
                <summary>
                  <span>{DIMENSION_LABELS[dimension]}</span>
                  <strong>{agencyScore.toFixed(2)}</strong>
                </summary>
                <p className="muted">{DIMENSION_DESCRIPTIONS[dimension]}</p>
                <div className="result-badges-row">
                  <span className="dimension-band">{getScoreBand(agencyScore)}</span>
                  <span className="dimension-band dimension-band-soft">
                    Benchmark: {texoScore.toFixed(2)} · {compareLabel(agencyScore, texoScore)}
                  </span>
                </div>
                <p>{getDimensionInterpretation(dimension, agencyScore)}</p>
              </details>
            );
          })}
        </div>
      </section>

      <section className="recommendations-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Plan de acción</p>
            <h3>Recomendaciones automáticas resumidas</h3>
            <p className="muted">Abrí solo las recomendaciones que quieras revisar en detalle.</p>
          </div>
        </div>

        <div className="recommendation-grid">
          {recommendations.map((rec) => (
            <details key={rec.dimension} className="recommendation-card result-details-card">
              <summary>
                <span>{rec.label}</span>
                <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>{rec.priority}</span>
              </summary>
              <p className="muted">{rec.rationale}</p>
              <ul className="action-list">
                {rec.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
              <Link
                className="button button-secondary button-small"
                href={actionPlanHref({
                  assessmentId: item.id,
                  dimension: rec.dimension,
                  title: rec.headline,
                  description: rec.rationale,
                  priority: rec.priority,
                  source: 'Recomendación automática',
                })}
              >
                Convertir recomendación en acción
              </Link>
            </details>
          ))}
        </div>
      </section>

      <section className="panel consistency-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Medición de consistencia</p>
            <h3>Cómo usar el plan de acción en la próxima evaluación</h3>
            <p className="muted">
              En la próxima medición no se sube el puntaje por intención, sino por evidencia. Si una acción queda solo como idea, corresponde A veces. Si tiene responsable y piloto, En desarrollo. Si se repite y deja evidencia, Frecuente. Si se instala como práctica estable, Siempre.
            </p>
          </div>
          <Link href="/action-plan" className="button button-primary">
            Ir al plan de acción
          </Link>
        </div>
        <div className="consistency-grid">
          <article className="consistency-card"><strong>A veces</strong><p>Ocurrió de forma puntual o depende de una persona.</p></article>
          <article className="consistency-card"><strong>En desarrollo</strong><p>Existe acción, responsable o piloto, pero todavía falta repetir y medir.</p></article>
          <article className="consistency-card"><strong>Frecuente</strong><p>La práctica se repitió y tiene evidencia documentada.</p></article>
          <article className="consistency-card"><strong>Siempre</strong><p>La práctica está instalada con ritual, métrica, responsable y continuidad.</p></article>
        </div>
      </section>

      <section className="panel model-links-panel">
        <div className="inline-actions split-actions">
          <div>
            <p className="eyebrow">Leer · aprender · implementar</p>
            <h3>Volvé al material base o al glosario cuando necesites alinear criterios.</h3>
          </div>
          <div className="inline-actions">
            <Link href="/master-plan-innovacion-texo.pdf" className="button button-primary" target="_blank">
              Descargar libro PDF
            </Link>
            <Link href="/glossary" className="button button-secondary">
              Ver glosario
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function RoadmapColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="roadmap-card">
      <strong>{title}</strong>
      <ul className="checklist-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
