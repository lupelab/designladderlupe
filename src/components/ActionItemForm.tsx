'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ACTION_PHASES, ACTION_STATUSES, emptyActionItem } from '@/lib/action-plan';
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/questionnaire';
import { ActionItem, AgencyName } from '@/lib/types';

export function ActionItemForm({ agency }: { agency: AgencyName }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => {
    const base = emptyActionItem(agency, searchParams.get('assessmentId') || undefined);
    return {
      ...base,
      title: searchParams.get('title') || '',
      description: searchParams.get('description') || '',
      dimension: (searchParams.get('dimension') || 'general') as ActionItem['dimension'],
      priority: (searchParams.get('priority') || 'Alta') as ActionItem['priority'],
      impact: (searchParams.get('impact') || 'Alto') as ActionItem['impact'],
      effort: (searchParams.get('effort') || 'Medio') as ActionItem['effort'],
      source: (searchParams.get('source') || 'Manual') as ActionItem['source'],
    };
  }, [agency, searchParams]);

  const [item, setItem] = useState<ActionItem>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof ActionItem>(key: K, value: ActionItem[K]) {
    setItem((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo crear la acción.');
      }

      router.push('/action-plan');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel action-form-panel" onSubmit={submit}>
      {error ? <div className="result-alert"><strong>No se pudo guardar.</strong><p>{error}</p></div> : null}

      <div className="form-grid">
        <label className="span-2">
          Título de la acción
          <input value={item.title} onChange={(event) => update('title', event.target.value)} required placeholder="Ej.: Instalar ritual mensual de aprendizaje con clientes" />
        </label>

        <label className="span-2">
          Descripción
          <textarea value={item.description} onChange={(event) => update('description', event.target.value)} placeholder="Qué se hará, por qué importa y qué práctica se quiere instalar." />
        </label>

        <label>
          Dimensión relacionada
          <select value={item.dimension || 'general'} onChange={(event) => update('dimension', event.target.value as ActionItem['dimension'])}>
            <option value="general">General</option>
            {DIMENSIONS.map((dimension) => <option key={dimension} value={dimension}>{DIMENSION_LABELS[dimension]}</option>)}
          </select>
        </label>

        <label>
          Fase
          <select value={item.phase} onChange={(event) => update('phase', event.target.value as ActionItem['phase'])}>
            {ACTION_PHASES.map((phase) => <option key={phase}>{phase}</option>)}
          </select>
        </label>

        <label>
          Estado
          <select value={item.status} onChange={(event) => update('status', event.target.value as ActionItem['status'])}>
            {ACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>

        <label>
          Prioridad
          <select value={item.priority} onChange={(event) => update('priority', event.target.value as ActionItem['priority'])}>
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
        </label>

        <label>
          Impacto
          <select value={item.impact} onChange={(event) => update('impact', event.target.value as ActionItem['impact'])}>
            <option>Alto</option>
            <option>Medio</option>
            <option>Bajo</option>
          </select>
        </label>

        <label>
          Esfuerzo
          <select value={item.effort} onChange={(event) => update('effort', event.target.value as ActionItem['effort'])}>
            <option>Alto</option>
            <option>Medio</option>
            <option>Bajo</option>
          </select>
        </label>

        <label>
          Responsable
          <input value={item.ownerName || ''} onChange={(event) => update('ownerName', event.target.value)} placeholder="Nombre y apellido" />
        </label>

        <label>
          Email responsable
          <input value={item.ownerEmail || ''} onChange={(event) => update('ownerEmail', event.target.value)} placeholder="nombre@empresa.com" />
        </label>

        <label>
          Fecha límite
          <input type="date" value={item.dueDate || ''} onChange={(event) => update('dueDate', event.target.value)} />
        </label>

        <label>
          Próxima revisión
          <input type="date" value={item.nextReviewDate || ''} onChange={(event) => update('nextReviewDate', event.target.value)} />
        </label>

        <label className="span-2">
          Criterio de éxito / métrica de consistencia
          <textarea value={item.successMetric || ''} onChange={(event) => update('successMetric', event.target.value)} placeholder="Ej.: práctica repetida en 3 reuniones, evidencia documentada, aprendizaje aplicado en un proyecto real." />
        </label>

        <label className="span-2">
          Evidencia esperada o disponible
          <textarea value={item.evidence || ''} onChange={(event) => update('evidence', event.target.value)} placeholder="Links, notas, aprendizajes, documentos o ejemplos de implementación." />
        </label>
      </div>

      <div className="submit-strip">
        <div>
          <strong>Regla de consistencia</strong>
          <p className="muted">Para marcar Frecuente o Siempre en la próxima evaluación, la acción debería tener evidencia, responsable, revisión y repetición.</p>
        </div>
        <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear acción'}</button>
      </div>
    </form>
  );
}
