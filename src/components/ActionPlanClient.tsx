'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ACTION_PHASES,
  ACTION_STATUSES,
  PHASE_DESCRIPTIONS,
  consistencyReading,
  dimensionActionSummary,
  getActionStats,
  getRelatedQuestions,
  isOverdue,
  suggestedScaleFromDimensionProgress,
} from '@/lib/action-plan';
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/questionnaire';
import { ActionItem, AssessmentRecord } from '@/lib/types';

function statusClass(status: ActionItem['status']) {
  if (status === 'Completada') return 'status-done';
  if (status === 'En curso') return 'status-progress';
  if (status === 'Bloqueada') return 'status-blocked';
  if (status === 'Descartada') return 'status-muted';
  return 'status-pending';
}

function priorityClass(priority: ActionItem['priority']) {
  return `priority-${priority.toLowerCase()}`;
}

export function ActionPlanClient({
  initialActions,
  latestAssessment,
}: {
  initialActions: ActionItem[];
  latestAssessment?: AssessmentRecord | null;
}) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [savingId, setSavingId] = useState('');
  const stats = useMemo(() => getActionStats(actions), [actions]);

  async function updateAction(action: ActionItem, patch: Partial<ActionItem>) {
    try {
      setSavingId(action.id);
      const next = { ...action, ...patch, updatedAt: new Date().toISOString() };
      setActions((current) => current.map((item) => (item.id === action.id ? next : item)));

      const response = await fetch(`/api/action-items/${action.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo actualizar la acción.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setSavingId('');
    }
  }

  return (
    <>
      <section className="panel action-summary-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Plan de acción</p>
            <h3>Seguimiento de cultura de innovación y diseño centrado en las personas</h3>
            <p className="muted">
              Convertí el diagnóstico en acciones con responsable, fecha, evidencia y criterio para decidir cómo responder en la próxima evaluación.
            </p>
          </div>
          <Link href="/action-plan/new" className="button button-primary">
            Crear acción
          </Link>
        </div>

        <div className="compare-grid">
          <div className="compare-card compare-card-dark">
            <span>Avance del plan</span>
            <strong>{stats.progress}%</strong>
            <small>{stats.completed} de {stats.total} acciones completadas</small>
          </div>
          <div className="compare-card">
            <span>Abiertas</span>
            <strong>{Math.max(0, stats.total - stats.completed)}</strong>
            <small>Pendientes, en curso o bloqueadas</small>
          </div>
          <div className="compare-card">
            <span>Vencidas</span>
            <strong>{stats.overdue}</strong>
            <small>Necesitan revisión de responsable</small>
          </div>
          <div className="compare-card">
            <span>Bloqueadas</span>
            <strong>{stats.blocked}</strong>
            <small>Requieren decisión o desbloqueo</small>
          </div>
        </div>
      </section>

      <section className="panel consistency-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Consistencia y próxima medición</p>
            <h3>Cómo decidir si marcar A veces, En desarrollo, Frecuente o Siempre</h3>
            <p className="muted">
              La app no debería inflar el resultado automáticamente. Te orienta con evidencia: una acción completada ayuda, pero para marcar Frecuente o Siempre debe existir repetición, responsable y medición.
            </p>
          </div>
        </div>

        <div className="consistency-grid">
          <article className="consistency-card">
            <strong>A veces</strong>
            <p>La práctica ocurrió una vez o depende de una persona. Hay intención, pero poca evidencia.</p>
          </article>
          <article className="consistency-card">
            <strong>En desarrollo</strong>
            <p>Existe una acción definida, responsable o piloto, pero todavía falta medir o repetir.</p>
          </article>
          <article className="consistency-card">
            <strong>Frecuente</strong>
            <p>La práctica se repitió en más de un caso y tiene evidencia documentada.</p>
          </article>
          <article className="consistency-card">
            <strong>Siempre</strong>
            <p>La práctica quedó instalada como sistema: responsable, ritual, evidencia, métrica y continuidad.</p>
          </article>
        </div>
      </section>

      {latestAssessment ? (
        <section className="panel next-eval-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Preparación para la próxima evaluación</p>
              <h3>Preguntas donde podrías esperar progreso</h3>
              <p className="muted">
                Esta lectura cruza el último diagnóstico con el avance del plan de acción. Sirve como guía, no como respuesta automática.
              </p>
            </div>
          </div>

          <div className="dimension-progress-grid">
            {DIMENSIONS.map((dimension) => {
              const summary = dimensionActionSummary(dimension, actions);
              const suggested = suggestedScaleFromDimensionProgress(dimension, latestAssessment.dimensionScores, actions);
              return (
                <article className="dimension-progress-card" key={dimension}>
                  <span>{summary.label}</span>
                  <strong>Sugerencia de consistencia: {suggested}</strong>
                  <p>
                    {summary.completed} completadas · {summary.active} activas · {summary.blocked} bloqueadas
                  </p>
                  <details>
                    <summary>Ver preguntas relacionadas</summary>
                    <ul className="compact-list">
                      {getRelatedQuestions(dimension).slice(0, 4).map((question) => (
                        <li key={question.id}>{question.title}</li>
                      ))}
                    </ul>
                  </details>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="panel phase-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Fases</p>
            <h3>Control por etapa de implementación</h3>
          </div>
        </div>
        <div className="phase-grid">
          {ACTION_PHASES.map((phase) => {
            const phaseActions = actions.filter((action) => action.phase === phase && action.status !== 'Descartada');
            const completed = phaseActions.filter((action) => action.status === 'Completada').length;
            const progress = phaseActions.length ? Math.round((completed / phaseActions.length) * 100) : 0;
            return (
              <article className="phase-card" key={phase}>
                <span>{phase}</span>
                <strong>{progress}%</strong>
                <p>{PHASE_DESCRIPTIONS[phase]}</p>
                <small>{completed} de {phaseActions.length} acciones completadas</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="action-board-grid">
        {ACTION_STATUSES.filter((status) => status !== 'Descartada').map((status) => (
          <article className="action-column" key={status}>
            <div className="action-column-head">
              <h4>{status}</h4>
              <span>{actions.filter((action) => action.status === status).length}</span>
            </div>

            <div className="action-card-list">
              {actions.filter((action) => action.status === status).map((action) => {
                const consistency = consistencyReading(action);
                return (
                  <div className={`action-card ${isOverdue(action) ? 'action-overdue' : ''}`} key={action.id}>
                    <div className="recommendation-top">
                      <strong>{action.title}</strong>
                      <span className={`priority-badge ${priorityClass(action.priority)}`}>{action.priority}</span>
                    </div>
                    <p>{action.description}</p>
                    <div className="result-badges-row">
                      <span className={`status-badge ${statusClass(action.status)}`}>{action.status}</span>
                      <span className="dimension-band dimension-band-soft">{action.phase}</span>
                    </div>
                    <dl className="action-meta-grid">
                      <div><dt>Responsable</dt><dd>{action.ownerName || 'Sin asignar'}</dd></div>
                      <div><dt>Fecha</dt><dd>{action.dueDate || 'Sin fecha'}</dd></div>
                      <div><dt>Dimensión</dt><dd>{action.dimension && action.dimension !== 'general' ? DIMENSION_LABELS[action.dimension] : 'General'}</dd></div>
                      <div><dt>Consistencia</dt><dd>{consistency.label}</dd></div>
                    </dl>
                    <div className="consistency-mini">
                      <strong>Próxima evaluación: {consistency.suggestedScale}</strong>
                      <p>{consistency.rationale}</p>
                    </div>
                    <details className="result-details action-details">
                      <summary>Editar seguimiento</summary>
                      <div className="action-edit-grid">
                        <label>
                          Estado
                          <select value={action.status} onChange={(event) => updateAction(action, { status: event.target.value as ActionItem['status'] })}>
                            {ACTION_STATUSES.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </label>
                        <label>
                          Fase
                          <select value={action.phase} onChange={(event) => updateAction(action, { phase: event.target.value as ActionItem['phase'] })}>
                            {ACTION_PHASES.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </label>
                        <label>
                          Responsable
                          <input value={action.ownerName || ''} onChange={(event) => updateAction(action, { ownerName: event.target.value })} placeholder="Nombre" />
                        </label>
                        <label>
                          Próxima revisión
                          <input type="date" value={action.nextReviewDate || ''} onChange={(event) => updateAction(action, { nextReviewDate: event.target.value })} />
                        </label>
                        <label className="span-2">
                          Criterio de éxito / métrica
                          <textarea value={action.successMetric || ''} onChange={(event) => updateAction(action, { successMetric: event.target.value })} placeholder="Ej.: ritual realizado 3 veces, evidencia documentada, feedback del equipo" />
                        </label>
                        <label className="span-2">
                          Evidencia o aprendizaje
                          <textarea value={action.evidence || ''} onChange={(event) => updateAction(action, { evidence: event.target.value })} placeholder="Pegá links, notas o aprendizajes" />
                        </label>
                      </div>
                      {savingId === action.id ? <p className="muted">Guardando cambios...</p> : null}
                    </details>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
