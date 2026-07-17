'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { NpsActionCandidate } from '@/lib/nps';
import { AgencyName } from '@/lib/types';

export function NpsActionCreator({
  agency,
  period,
  candidates,
}: {
  agency: AgencyName;
  period: string;
  candidates: NpsActionCandidate[];
}) {
  const [selected, setSelected] = useState<string[]>(candidates.map((item) => item.key));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; message: string } | null>(null);
  const [error, setError] = useState('');

  const selectedCount = useMemo(() => selected.length, [selected]);

  function toggle(key: string) {
    setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  }

  async function createActions() {
    if (!selected.length) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/nps/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agency, period, keys: selected }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudieron crear las acciones.');
      setResult({
        created: data.created || 0,
        skipped: data.skipped || 0,
        message: data.message || 'Las acciones fueron procesadas.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron crear las acciones.');
    } finally {
      setLoading(false);
    }
  }

  if (!candidates.length) {
    return (
      <section className="panel nps-actions-panel">
        <div className="section-head"><div><p className="eyebrow">Plan de acción</p><h2>No hay brechas suficientes para sugerir acciones</h2><p className="muted">El período seleccionado todavía no tiene datos suficientes o no presenta oportunidades priorizables.</p></div></div>
      </section>
    );
  }

  return (
    <section className="panel nps-actions-panel">
      <div className="nps-actions-head">
        <div>
          <span className="hero-badge">De la voz del cliente al tablero</span>
          <h2>Convertí los resultados en acciones</h2>
          <p>Seleccioná las recomendaciones que querés enviar al módulo Plan y seguimiento. Se crearán como tarjetas en “Por hacer”, con prioridad, fecha y criterio de éxito.</p>
        </div>
        <div className="nps-action-count"><strong>{selectedCount}</strong><span>seleccionadas</span></div>
      </div>

      <div className="nps-action-candidates">
        {candidates.map((candidate) => {
          const checked = selected.includes(candidate.key);
          return (
            <label key={candidate.key} className={checked ? 'nps-action-candidate selected' : 'nps-action-candidate'}>
              <input type="checkbox" checked={checked} onChange={() => toggle(candidate.key)} />
              <span className="nps-action-check">✓</span>
              <div>
                <div className="nps-action-card-title"><strong>{candidate.title}</strong><span className={`priority-badge priority-${candidate.priority.toLowerCase()}`}>{candidate.priority}</span></div>
                <p>{candidate.description}</p>
                <small>Plazo sugerido: {candidate.dueDays} días · Criterio: {candidate.successMetric}</small>
              </div>
            </label>
          );
        })}
      </div>

      {error ? <div className="auth-message auth-message-error">{error}</div> : null}
      {result ? (
        <div className="nps-action-result">
          <span>✓</span>
          <div><strong>{result.message}</strong><p>{result.created} nuevas · {result.skipped} ya existentes</p></div>
          <Link href="/action-plan" className="button button-secondary">Abrir tablero</Link>
        </div>
      ) : null}

      <div className="nps-actions-footer">
        <p>Las acciones duplicadas del mismo período y driver se omiten automáticamente.</p>
        <button className="button button-primary" type="button" disabled={!selected.length || loading} onClick={createActions}>
          {loading ? 'Creando acciones…' : `Crear ${selectedCount} ${selectedCount === 1 ? 'acción' : 'acciones'}`}
        </button>
      </div>
    </section>
  );
}
