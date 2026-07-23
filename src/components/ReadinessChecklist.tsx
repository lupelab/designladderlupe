'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QualificationProgress } from '@/lib/types';

const ITEMS = [
  {
    id: 'scope',
    title: 'Alcance definido',
    description: 'Sé qué agencia, unidad o equipo voy a evaluar y no voy a mezclar realidades diferentes.',
    evidence: 'Ejemplo: “LUPE, operación completa; período abril-junio”.',
  },
  {
    id: 'period',
    title: 'Período de referencia acordado',
    description: 'Voy a responder usando principalmente evidencia de los últimos tres meses.',
    evidence: 'Evitá responder por un caso de hace dos años o por algo que recién está planificado.',
  },
  {
    id: 'evidence',
    title: 'Evidencias disponibles',
    description: 'Tengo acceso a ejemplos, rituales, documentos, métricas o personas que permitan verificar las prácticas.',
    evidence: 'Pueden ser minutas, NPS, retrospectivas, procesos, proyectos, reportes o entrevistas.',
  },
  {
    id: 'crossFunctional',
    title: 'Mirada transversal',
    description: 'Puedo observar más de un área y no voy a responder solamente desde mi equipo o experiencia personal.',
    evidence: 'Considerá dirección, cuentas, estrategia, creatividad, medios, datos y operación cuando aplique.',
  },
  {
    id: 'examples',
    title: 'Ejemplos concretos preparados',
    description: 'Puedo nombrar al menos dos situaciones reales que respalden respuestas altas o bajas.',
    evidence: 'Una práctica instalada debería poder verse en decisiones, comportamientos y resultados.',
  },
  {
    id: 'intentVsPractice',
    title: 'Diferencio intención de práctica',
    description: 'Entiendo que una iniciativa anunciada no equivale a una práctica instalada.',
    evidence: '“Queremos hacerlo” no es lo mismo que “se hace con frecuencia, responsable y seguimiento”.',
  },
  {
    id: 'exceptions',
    title: 'Voy a registrar excepciones',
    description: 'Si una práctica funciona solo en algunas cuentas o equipos, lo voy a reflejar en el puntaje y las notas.',
    evidence: 'La respuesta debe representar la realidad predominante, no el mejor caso de la agencia.',
  },
  {
    id: 'neutrality',
    title: 'Criterio neutral',
    description: 'Estoy dispuesto a mostrar brechas sin interpretar el resultado como una evaluación de desempeño personal.',
    evidence: 'El objetivo es encontrar dónde actuar, no obtener el puntaje más alto.',
  },
] as const;

export function ReadinessChecklist({ initialProgress }: { initialProgress: QualificationProgress }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialProgress.readinessChecklist || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const completed = ITEMS.filter((item) => checklist[item.id]).length;
  const percentage = Math.round((completed / ITEMS.length) * 100);
  const allReady = completed === ITEMS.length;

  const blockers = useMemo(() => ITEMS.filter((item) => !checklist[item.id]), [checklist]);

  async function save(continueJourney = false) {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/qualification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-readiness', checklist }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo guardar el checklist.');
      if (continueJourney && data.complete) {
        router.push('/training?first=1');
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el checklist.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="readiness-layout">
      <section className="panel readiness-main">
        <div className="readiness-head">
          <div>
            <span className="hero-badge">Recurso opcional · Preparación</span>
            <h2>Checklist previo a la aplicación</h2>
            <p>No mide cuánto sabés. Funciona como una guía para reunir contexto y evidencia antes de responder; podés iniciar el diagnóstico aunque no lo completes.</p>
          </div>
          <div className="readiness-score" aria-label={`${percentage}% listo`}>
            <span>{percentage}%</span>
            <small>{completed}/{ITEMS.length} condiciones</small>
          </div>
        </div>

        <div className="readiness-progress"><span style={{ width: `${percentage}%` }} /></div>

        <div className="readiness-items">
          {ITEMS.map((item, index) => {
            const checked = Boolean(checklist[item.id]);
            return (
              <article className={checked ? 'readiness-item ready' : 'readiness-item'} key={item.id}>
                <button type="button" className="readiness-check" onClick={() => setChecklist((current) => ({ ...current, [item.id]: !checked }))} aria-pressed={checked}>
                  <span>{checked ? '✓' : index + 1}</span>
                </button>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <small>{item.evidence}</small>
                </div>
                <button type="button" className={checked ? 'readiness-toggle selected' : 'readiness-toggle'} onClick={() => setChecklist((current) => ({ ...current, [item.id]: !checked }))}>
                  {checked ? 'Listo' : 'Marcar listo'}
                </button>
              </article>
            );
          })}
        </div>

        {error ? <div className="auth-message auth-message-error">{error}</div> : null}

        <div className="readiness-actions">
          <button type="button" className="button button-secondary" disabled={saving} onClick={() => save(false)}>{saving ? 'Guardando…' : 'Guardar y continuar luego'}</button>
          <button type="button" className="button button-primary" disabled={!allReady || saving} onClick={() => save(true)}>Ir a la guía práctica →</button>
        </div>
      </section>

      <aside className="panel readiness-side">
        <p className="eyebrow">Estado de preparación</p>
        {allReady ? (
          <div className="readiness-ready-message"><span>✓</span><strong>Checklist completo</strong><p>Podés continuar con el simulacro opcional o iniciar directamente el diagnóstico.</p></div>
        ) : (
          <>
            <h3>{blockers.length} {blockers.length === 1 ? 'condición pendiente' : 'condiciones pendientes'}</h3>
            <p>Podés guardar el avance y volver cuando quieras. Ninguna condición pendiente bloquea el diagnóstico ni los demás módulos.</p>
            <div className="readiness-blockers">
              {blockers.slice(0, 4).map((item) => <span key={item.id}>• {item.title}</span>)}
              {blockers.length > 4 ? <span>+ {blockers.length - 4} más</span> : null}
            </div>
          </>
        )}
        <div className="readiness-rule"><strong>Regla de aplicación</strong><p>Siempre debe existir una evidencia observable detrás de una respuesta alta.</p></div>
      </aside>
    </div>
  );
}
