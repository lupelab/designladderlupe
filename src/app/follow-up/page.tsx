import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';
import { listActionItems, listAssessments } from '@/lib/apps-script';
import { ACTION_PHASES, PHASE_DESCRIPTIONS, consistencyReading, getActionStats } from '@/lib/action-plan';

export default async function FollowUpPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  let actions: any[] = [];
  let assessments: any[] = [];
  let error = '';

  try {
    const [actionData, assessmentData] = await Promise.all([
      listActionItems(agency),
      listAssessments(agency),
    ]);
    actions = actionData.items || [];
    assessments = assessmentData.items || [];
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const stats = getActionStats(actions as any);
  const installed = actions.filter((action) => consistencyReading(action).suggestedScale === 'Siempre').length;
  const frequent = actions.filter((action) => consistencyReading(action).suggestedScale === 'Frecuente').length;

  return (
    <AppShell
      title="Seguimiento"
      agency={agency}
      subtitle="Control ejecutivo de fases, consistencia y preparación para la próxima medición."
      actions={
        <div className="inline-actions">
          <Link href="/action-plan" className="button button-primary">Ver plan de acción</Link>
        </div>
      }
    >
      {error ? (
        <section className="panel result-alert"><strong>No se pudo cargar seguimiento.</strong><p>{error}</p></section>
      ) : (
        <>
          <section className="panel action-summary-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Control de avance</p>
                <h3>De acciones a consistencia cultural</h3>
                <p className="muted">La consistencia se mide por evidencia, responsable, repetición, revisión y avance de fase.</p>
              </div>
            </div>
            <div className="compare-grid">
              <div className="compare-card compare-card-dark"><span>Avance general</span><strong>{stats.progress}%</strong><small>{stats.completed} acciones completadas</small></div>
              <div className="compare-card"><span>Prácticas frecuentes</span><strong>{frequent}</strong><small>Con evidencia suficiente para marcar Frecuente</small></div>
              <div className="compare-card"><span>Prácticas sistemáticas</span><strong>{installed}</strong><small>Con señales para marcar Siempre</small></div>
              <div className="compare-card"><span>Evaluaciones</span><strong>{assessments.length}</strong><small>Mediciones guardadas de la agencia</small></div>
            </div>
          </section>

          <section className="panel phase-panel">
            <div className="section-head"><div><p className="eyebrow">Fases</p><h3>Embudo de implementación</h3></div></div>
            <div className="phase-grid">
              {ACTION_PHASES.map((phase) => {
                const items = actions.filter((action) => action.phase === phase && action.status !== 'Descartada');
                return (
                  <article className="phase-card" key={phase}>
                    <span>{phase}</span>
                    <strong>{items.length}</strong>
                    <p>{PHASE_DESCRIPTIONS[phase]}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel consistency-panel">
            <div className="section-head"><div><p className="eyebrow">Regla para próxima evaluación</p><h3>Qué respuesta marcar según evidencia</h3></div></div>
            <div className="consistency-grid">
              <article className="consistency-card"><strong>A veces</strong><p>La acción ocurrió una vez o depende de una persona.</p></article>
              <article className="consistency-card"><strong>En desarrollo</strong><p>Hay responsable, piloto o plan, pero falta repetición y medición.</p></article>
              <article className="consistency-card"><strong>Frecuente</strong><p>La práctica se repitió y tiene evidencia documentada.</p></article>
              <article className="consistency-card"><strong>Siempre</strong><p>La práctica está instalada con ritual, métrica, responsable y continuidad.</p></article>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
