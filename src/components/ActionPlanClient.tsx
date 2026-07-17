'use client';

import Link from 'next/link';
import { DragEvent, useMemo, useState } from 'react';
import { ACTION_BOARD_STAGES, ActionBoardStageId, getBoardStage, getStagePatch } from '@/lib/action-board';
import { getActionStats, isOverdue } from '@/lib/action-plan';
import { DIMENSION_LABELS } from '@/lib/questionnaire';
import { ActionItem, AssessmentRecord } from '@/lib/types';

function formatDate(value?: string) {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });
}

function priorityClass(priority: ActionItem['priority']) {
  return `priority-${priority.toLowerCase()}`;
}

function isNpsAction(action: ActionItem) {
  return /Acción derivada del NPS/i.test(action.description || '') || /\[NPS:/i.test(action.evidence || '') || /Origen NPS/i.test(action.evidence || '');
}

export function ActionPlanClient({
  initialActions,
  latestAssessment,
}: {
  initialActions: ActionItem[];
  latestAssessment?: AssessmentRecord | null;
}) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions.filter((action) => action.status !== 'Descartada'));
  const [draggedId, setDraggedId] = useState('');
  const [overStage, setOverStage] = useState<ActionBoardStageId | ''>('');
  const [savingId, setSavingId] = useState('');
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);
  const [error, setError] = useState('');

  const stats = useMemo(() => getActionStats(actions), [actions]);
  const selectedAction = editingAction;
  const sourceActions = latestAssessment
    ? actions.filter((action) => action.assessmentId === latestAssessment.id)
    : [];
  const npsActions = actions.filter(isNpsAction);

  async function persist(action: ActionItem, patch: Partial<ActionItem>) {
    const previous = action;
    const next: ActionItem = { ...action, ...patch, updatedAt: new Date().toISOString() };
    setError('');
    setSavingId(action.id);
    setActions((current) => current.map((item) => (item.id === action.id ? next : item)));

    try {
      const response = await fetch(`/api/action-items/${action.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo guardar el cambio.');
      if (data.item) setActions((current) => current.map((item) => (item.id === action.id ? { ...next, ...data.item } : item)));
    } catch (err) {
      setActions((current) => current.map((item) => (item.id === action.id ? previous : item)));
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
    } finally {
      setSavingId('');
    }
  }

  function startDrag(event: DragEvent<HTMLElement>, action: ActionItem) {
    setDraggedId(action.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', action.id);
  }

  function dropOnStage(event: DragEvent<HTMLElement>, stageId: ActionBoardStageId) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || draggedId;
    const action = actions.find((item) => item.id === id);
    setDraggedId('');
    setOverStage('');
    if (!action || getBoardStage(action) === stageId) return;
    void persist(action, getStagePatch(stageId));
  }

  function updateSelected(patch: Partial<ActionItem>) {
    setEditingAction((current) => current ? { ...current, ...patch } : current);
  }

  async function saveSelected() {
    if (!selectedAction) return;
    const current = actions.find((item) => item.id === selectedAction.id);
    if (!current) return;
    await persist(current, selectedAction);
    setEditingAction(null);
  }

  return (
    <>
      <section className="panel simple-plan-overview">
        <div className="simple-plan-heading">
          <div>
            <span className="hero-badge">De la evidencia a la implementación</span>
            <h2>Un solo tablero para diagnóstico y voz del cliente</h2>
            <p>Las prioridades del diagnóstico interno y del NPS se convierten en tarjetas. Arrastralas de una columna a otra a medida que avanzan.</p>
          </div>
          <Link href="/action-plan/new" className="button button-secondary">Agregar acción manual</Link>
        </div>

        <div className="simple-plan-kpis">
          <article><span>Avance general</span><strong>{stats.progress}%</strong><small>{stats.completed} de {stats.total} completadas</small></article>
          <article><span>En movimiento</span><strong>{actions.filter((action) => ['doing', 'validate'].includes(getBoardStage(action))).length}</strong><small>En curso o validación</small></article>
          <article><span>Necesitan atención</span><strong>{stats.overdue + stats.blocked}</strong><small>Vencidas o bloqueadas</small></article>
        </div>

        {latestAssessment ? (
          <div className="diagnosis-source-strip">
            <span>✓</span>
            <div>
              <strong>Acciones conectadas al diagnóstico</strong>
              <p>{sourceActions.length} tarjetas provienen del diagnóstico del {new Date(latestAssessment.createdAt).toLocaleDateString('es-PY')}. Podés editarlas, asignarlas y moverlas sin alterar el resultado original.</p>
            </div>
          </div>
        ) : (
          <div className="diagnosis-source-strip empty">
            <span>!</span><div><strong>Todavía no hay un diagnóstico</strong><p>Al completar el diagnóstico, la plataforma creará automáticamente las primeras acciones priorizadas.</p></div>
          </div>
        )}

        {npsActions.length ? (
          <div className="diagnosis-source-strip nps-source-strip">
            <span>N</span>
            <div>
              <strong>Acciones conectadas al NPS</strong>
              <p>{npsActions.length} tarjetas nacieron de resultados y comentarios de clientes. Se gestionan en el mismo tablero que las acciones del diagnóstico.</p>
            </div>
          </div>
        ) : (
          <div className="diagnosis-source-strip nps-source-strip empty">
            <span>N</span><div><strong>Todavía no hay acciones NPS</strong><p>Entrá a NPS de clientes, elegí una agencia y convertí las oportunidades priorizadas en tarjetas.</p></div>
          </div>
        )}
      </section>

      {error ? <div className="auth-message auth-message-error plan-save-error">{error}</div> : null}

      <section className="simple-kanban" aria-label="Tablero de plan y seguimiento">
        {ACTION_BOARD_STAGES.map((stage) => {
          const stageActions = actions.filter((action) => getBoardStage(action) === stage.id);
          return (
            <article
              key={stage.id}
              className={`simple-kanban-column ${overStage === stage.id ? 'drag-over' : ''}`}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOverStage(stage.id); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOverStage(''); }}
              onDrop={(event) => dropOnStage(event, stage.id)}
            >
              <header>
                <div><h3>{stage.label}</h3><p>{stage.description}</p></div>
                <span>{stageActions.length}</span>
              </header>

              <div className="simple-kanban-list">
                {stageActions.length ? stageActions.map((action) => (
                  <article
                    key={action.id}
                    draggable
                    onDragStart={(event) => startDrag(event, action)}
                    onDragEnd={() => { setDraggedId(''); setOverStage(''); }}
                    className={`simple-action-card ${draggedId === action.id ? 'dragging' : ''} ${isOverdue(action) ? 'overdue' : ''}`}
                  >
                    <div className="simple-action-card-top">
                      <span className="drag-handle" title="Arrastrar tarjeta" aria-hidden="true">⠿</span>
                      <span className={`priority-badge ${priorityClass(action.priority)}`}>{action.priority}</span>
                    </div>
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                    <div className="simple-action-tags">
                      <span>{action.dimension && action.dimension !== 'general' ? DIMENSION_LABELS[action.dimension] : 'General'}</span>
                      {isNpsAction(action) ? <span className="from-nps">NPS</span> : action.source === 'Recomendación automática' ? <span className="from-diagnosis">Diagnóstico</span> : null}
                      {action.status === 'Bloqueada' ? <span className="blocked">Bloqueada</span> : null}
                    </div>
                    <div className="simple-action-meta">
                      <div><span>Responsable</span><strong>{action.ownerName || 'Asignar'}</strong></div>
                      <div><span>Fecha</span><strong className={isOverdue(action) ? 'danger-text' : ''}>{formatDate(action.dueDate)}</strong></div>
                    </div>
                    <div className="mobile-stage-control">
                      <label>
                        Mover a
                        <select value={getBoardStage(action)} onChange={(event) => void persist(action, getStagePatch(event.target.value as ActionBoardStageId))}>
                          {ACTION_BOARD_STAGES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                        </select>
                      </label>
                    </div>
                    <button className="simple-card-edit" type="button" onClick={() => setEditingAction({ ...action })}>{savingId === action.id ? 'Guardando…' : 'Editar detalles'}</button>
                  </article>
                )) : <div className="simple-kanban-empty"><span>Soltá una tarjeta acá</span><small>Esta etapa todavía no tiene acciones.</small></div>}
              </div>
            </article>
          );
        })}
      </section>

      {selectedAction ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setEditingAction(null)}>
          <section className="simple-action-modal" role="dialog" aria-modal="true" aria-label="Editar acción" onClick={(event) => event.stopPropagation()}>
            <header><div><span className="eyebrow">Editar acción</span><h3>{selectedAction.title}</h3></div><button type="button" onClick={() => setEditingAction(null)} aria-label="Cerrar">×</button></header>
            <div className="simple-action-edit-grid">
              <label className="span-2">Título<input value={selectedAction.title} onChange={(event) => updateSelected({ title: event.target.value })} /></label>
              <label className="span-2">Descripción<textarea value={selectedAction.description || ''} onChange={(event) => updateSelected({ description: event.target.value })} /></label>
              <label>Responsable<input value={selectedAction.ownerName || ''} onChange={(event) => updateSelected({ ownerName: event.target.value })} placeholder="Nombre y apellido" /></label>
              <label>Fecha límite<input type="date" value={selectedAction.dueDate || ''} onChange={(event) => updateSelected({ dueDate: event.target.value })} /></label>
              <label>Prioridad<select value={selectedAction.priority} onChange={(event) => updateSelected({ priority: event.target.value as ActionItem['priority'] })}><option>Alta</option><option>Media</option><option>Baja</option></select></label>
              <label>Estado especial<select value={selectedAction.status === 'Bloqueada' ? 'Bloqueada' : 'Normal'} onChange={(event) => updateSelected({ status: event.target.value === 'Bloqueada' ? 'Bloqueada' : getStagePatch(getBoardStage(selectedAction)).status })}><option>Normal</option><option>Bloqueada</option></select></label>
              <label className="span-2">Evidencia o aprendizaje<textarea value={selectedAction.evidence || ''} onChange={(event) => updateSelected({ evidence: event.target.value })} placeholder="Qué ocurrió, qué aprendimos o qué evidencia demuestra el avance." /></label>
            </div>
            <footer><button className="button button-secondary" type="button" onClick={() => setEditingAction(null)}>Cancelar</button><button className="button button-primary" type="button" onClick={saveSelected} disabled={savingId === selectedAction.id}>{savingId === selectedAction.id ? 'Guardando…' : 'Guardar cambios'}</button></footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
