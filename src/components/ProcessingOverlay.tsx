'use client';

import { useEffect, useState } from 'react';

const DEFAULT_STAGES = [
  { at: 0, label: 'Validando tus respuestas' },
  { at: 22, label: 'Calculando el nivel de madurez' },
  { at: 46, label: 'Analizando fortalezas y brechas' },
  { at: 68, label: 'Preparando recomendaciones' },
  { at: 86, label: 'Armando tu lectura ejecutiva' },
  { at: 97, label: 'Casi listo' },
];

export function ProcessingOverlay({
  active,
  completed = false,
  title = 'Estamos preparando tu diagnóstico',
  stages = DEFAULT_STAGES,
}: {
  active: boolean;
  completed?: boolean;
  title?: string;
  stages?: Array<{ at: number; label: string }>;
}) {
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    if (!active) {
      setProgress(4);
      return;
    }
    if (completed) {
      setProgress(100);
      return;
    }

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 96) return 96;
        const increment = current < 45 ? 3 : current < 78 ? 2 : 1;
        return Math.min(96, current + increment);
      });
    }, 180);
    return () => window.clearInterval(timer);
  }, [active, completed]);

  if (!active) return null;
  const currentStage = [...stages].reverse().find((stage) => progress >= stage.at) || stages[0];

  return (
    <div className="processing-backdrop" role="dialog" aria-modal="true" aria-live="polite">
      <div className="processing-card">
        <div className="processing-ring" style={{ '--processing-progress': `${progress * 3.6}deg` } as React.CSSProperties}>
          <div className="processing-ring-inner"><strong>{progress}%</strong><span>completado</span></div>
        </div>
        <span className="hero-badge">Análisis seguro</span>
        <h2>{progress === 100 ? 'Tu resultado está listo' : title}</h2>
        <p className="processing-stage">{progress === 100 ? 'Abriendo la lectura ejecutiva…' : currentStage.label}</p>
        <div className="processing-linear"><span style={{ width: `${progress}%` }} /></div>
        <p className="processing-reassurance">No cierres esta ventana. Tus respuestas ya están guardadas y este proceso puede tomar unos segundos.</p>
        <div className="processing-checks">
          {stages.slice(0, 5).map((stage) => <span key={stage.label} className={progress >= stage.at + 12 ? 'done' : progress >= stage.at ? 'active' : ''}><i>{progress >= stage.at + 12 ? '✓' : ''}</i>{stage.label}</span>)}
        </div>
      </div>
    </div>
  );
}
