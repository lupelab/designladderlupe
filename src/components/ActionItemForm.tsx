'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { emptyActionItem } from '@/lib/action-plan';
import { DIMENSIONS, DIMENSION_LABELS } from '@/lib/questionnaire';
import { ActionItem, AgencyName } from '@/lib/types';

export function ActionItemForm({ agency }: { agency: AgencyName }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => ({
    ...emptyActionItem(agency, searchParams.get('assessmentId') || undefined),
    title: searchParams.get('title') || '',
    description: searchParams.get('description') || '',
    dimension: (searchParams.get('dimension') || 'general') as ActionItem['dimension'],
    priority: (searchParams.get('priority') || 'Alta') as ActionItem['priority'],
    source: (searchParams.get('source') || 'Manual') as ActionItem['source'],
  }), [agency, searchParams]);

  const [item, setItem] = useState<ActionItem>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof ActionItem>(key: K, value: ActionItem[K]) {
    setItem((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/action-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo crear la acción.');
      router.push('/action-plan');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel simple-manual-action-form" onSubmit={submit}>
      <div className="section-head"><div><span className="hero-badge">Acción manual</span><h2>Agregá solo lo esencial</h2><p className="muted">Las acciones principales se crean desde el diagnóstico. Usá este formulario solo para sumar una iniciativa adicional.</p></div></div>
      {error ? <div className="auth-message auth-message-error">{error}</div> : null}
      <div className="simple-action-edit-grid">
        <label className="span-2">Título<input value={item.title} onChange={(event) => update('title', event.target.value)} required placeholder="Ej.: Instalar una revisión mensual de aprendizajes" /></label>
        <label className="span-2">Descripción<textarea value={item.description} onChange={(event) => update('description', event.target.value)} placeholder="Qué se hará y por qué importa." /></label>
        <label>Dimensión<select value={item.dimension || 'general'} onChange={(event) => update('dimension', event.target.value as ActionItem['dimension'])}><option value="general">General</option>{DIMENSIONS.map((dimension) => <option key={dimension} value={dimension}>{DIMENSION_LABELS[dimension]}</option>)}</select></label>
        <label>Prioridad<select value={item.priority} onChange={(event) => update('priority', event.target.value as ActionItem['priority'])}><option>Alta</option><option>Media</option><option>Baja</option></select></label>
        <label>Responsable<input value={item.ownerName || ''} onChange={(event) => update('ownerName', event.target.value)} placeholder="Nombre y apellido" /></label>
        <label>Fecha límite<input type="date" value={item.dueDate || ''} onChange={(event) => update('dueDate', event.target.value)} /></label>
        <label className="span-2">Evidencia esperada<textarea value={item.evidence || ''} onChange={(event) => update('evidence', event.target.value)} placeholder="Cómo sabremos que avanzó o qué aprendizaje queremos registrar." /></label>
      </div>
      <div className="simple-form-actions"><button className="button button-secondary" type="button" onClick={() => router.push('/action-plan')}>Cancelar</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Creando…' : 'Crear tarjeta'}</button></div>
    </form>
  );
}
