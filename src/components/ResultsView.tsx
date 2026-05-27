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
  DimensionScore,
  HoldingBenchmark,
} from '@/lib/types';
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

function safeScore(value: number | undefined | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return value;
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
  const recommendations = getDimensionRecommendations(
    item.dimensionScores,
    ladderStep
  );
  const narrative = buildNarrativeFromScores(ladderStep, item.dimensionScores);

  const holdingMaturityLevel =
    holdingBenchmark.maturityLevel || 'Benchmark dinámico';

  const holdingNarrative =
    holdingBenchmark.narrative ||
    'Promedio calculado con la última evaluación disponible de cada agencia TEXO.';

  const [aiDiagnosis, setAiDiagnosis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const aiPayloadKey = useMemo(() => {
    return JSON.stringify({
      assessmentId: item.id,
      assessmentScore: item.overallScore,
      benchmarkScore: holdingBenchmark.overallScore,
      benchmarkDimensions: holdingBenchmark.dimensionScores,
    });
  }, [
    item.id,
    item.overallScore,
    holdingBenchmark.overallScore,
    holdingBenchmark.dimensionScores,
  ]);

  async function generateAiDiagnosis() {
    try {
      setAiLoading(true);
      setAiError('');

      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          assessment: item,
          texoBenchmark: holdingBenchmark,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo generar el diagnóstico IA.');
      }

      setAiDiagnosis(data.diagnosis || '');
    } catch (error) {
      setAiError(String(error));
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    generateAiDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPayloadKey]);

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
          <p className="result-next-step">
            <strong>Siguiente movimiento sugerido:</strong> {stepCopy.nextMove}
          </p>
        </article>
      </section>

      <section className="panel compare-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Comparador</p>
            <h3>Tu agencia frente al promedio TEXO</h3>
            <p className="muted">
              Esta referencia ayuda a ubicar tu resultado dentro del contexto
              actual del holding y a ver si la agencia está por delante,
              alineada o por detrás del promedio de madurez.
            </p>
          </div>
          <Link
            href="/about-model"
            className="button button-secondary button-small"
            title="Entender cómo se calcula el diagnóstico y cómo leer este comparador"
          >
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
            <small>{holdingMaturityLevel}</small>
          </div>

          <div className="compare-card">
            <span>Lectura relativa</span>
            <strong>
              {compareLabel(item.overallScore, holdingBenchmark.overallScore)}
            </strong>
            <small>{holdingNarrative}</small>
          </div>

          {agencyAverage ? (
            <div className="compare-card">
              <span>Promedio histórico de tu agencia</span>
              <strong>{agencyAverage.overallScore.toFixed(2)}</strong>
              <small>
                Se calcula con las evaluaciones guardadas para esta agencia.
              </small>
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel narrative-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Diagnóstico ejecutivo con IA</p>
            <h3>Lectura generada con Claude</h3>
            <p className="muted">
              Esta lectura usa los resultados de la agencia y el benchmark TEXO
              dinámico para generar una interpretación ejecutiva y accionable.
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

        {aiLoading ? (
          <p className="muted">
            Claude está generando la lectura ejecutiva del diagnóstico...
          </p>
        ) : null}

        {aiError ? (
          <div className="result-alert">
            <strong>No se pudo generar el diagnóstico IA.</strong>
            <p>{aiError}</p>
          </div>
        ) : null}

        {!aiLoading && !aiError && aiDiagnosis ? (
          <div className="ai-diagnosis-content">
            {aiDiagnosis.split('\n').map((paragraph, index) => {
              const cleanParagraph = paragraph.trim();

              if (!cleanParagraph) return null;

              return <p key={`${cleanParagraph}-${index}`}>{cleanParagraph}</p>;
            })}
          </div>
        ) : null}
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
              </li>
            ))}
          </ol>
          <div className="holding-compare-mini">
            <p className="muted">
              Tu resultado también puede leerse contra la base TEXO actual. Eso
              ayuda a distinguir qué capacidades ya están mejor instaladas y
              cuáles todavía están frenando la transformación.
            </p>
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
            <p>
              Las dimensiones con mejor desempeño son aquellas donde hoy existe
              una práctica más repetible, visible y compartida. Eso no significa
              perfección, pero sí una base útil para escalar.
            </p>
          </article>
          <article>
            <h4>Qué te está frenando</h4>
            <p>
              Las dimensiones con menor score suelen ser las que hacen que el
              diseño entre tarde, que la empatía con clientes ocurra de forma
              irregular o que el aprendizaje no se convierta en decisiones
              concretas.
            </p>
          </article>
        </div>
      </section>

      <section className="panel dimension-panel results-dimension-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detalle por dimensión</p>
            <h3>Interpretación abierta de cada capacidad</h3>
            <p className="muted">
              Cada dimensión se explica con lenguaje simple para que no dependa
              de interpretación personal del evaluador.
            </p>
          </div>
        </div>

        <div className="results-dimension-grid">
          {DIMENSIONS.map((dimension) => {
            const agencyScore = safeScore(item.dimensionScores[dimension]);
            const texoScore = safeScore(
              holdingBenchmark.dimensionScores[dimension]
            );

            return (
              <article className="result-dimension-card" key={dimension}>
                <div className="dimension-card-head">
                  <div>
                    <h4>{DIMENSION_LABELS[dimension]}</h4>
                    <p className="muted">
                      {DIMENSION_DESCRIPTIONS[dimension]}
                    </p>
                  </div>
                  <strong>{agencyScore.toFixed(2)}</strong>
                </div>

                <div className="result-badges-row">
                  <span className="dimension-band">
                    {getScoreBand(agencyScore)}
                  </span>
                  <span className="dimension-band dimension-band-soft">
                    TEXO: {texoScore.toFixed(2)} ·{' '}
                    {compareLabel(agencyScore, texoScore)}
                  </span>
                </div>

                <p>{getDimensionInterpretation(dimension, agencyScore)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="recommendations-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Plan de acción</p>
            <h3>Recomendaciones automáticas desarrolladas</h3>
            <p className="muted">
              Estas recomendaciones están pensadas para traducir el diagnóstico
              en decisiones concretas de operación, proceso y desarrollo de
              capacidades.
            </p>
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
                <span
                  className={`priority-badge priority-${rec.priority.toLowerCase()}`}
                >
                  {rec.priority}
                </span>
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
            <h3>
              ¿Querés entender con más detalle qué mide cada peldaño, dimensión
              y benchmark?
            </h3>
          </div>
          <div className="inline-actions">
            <Link
              href="/about-model"
              className="button button-primary"
              title="Abrir la explicación completa del modelo, los peldaños y el benchmark"
            >
              Cómo funciona este diagnóstico
            </Link>
            <Link
              href="/glossary"
              className="button button-secondary"
              title="Ir al glosario para revisar definiciones y ejemplos simples"
            >
              Ver glosario
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}