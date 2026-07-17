import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentUser } from '@/lib/auth';
import { listAssessments, listActionItems } from '@/lib/apps-script';
import { formatDate } from '@/lib/utils';
import { getQualificationProgress, isQualified } from '@/lib/qualification';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let latest: any = null;
  let assessmentCount = 0;
  let openActions = 0;
  try {
    const [assessments, actions] = await Promise.all([listAssessments(user.agency), listActionItems(user.agency)]);
    latest = assessments.items[0] || null;
    assessmentCount = assessments.items.length;
    openActions = actions.items.filter((item) => item.status !== 'Completada' && item.status !== 'Descartada').length;
  } catch {
    // El dashboard sigue operativo aunque las fuentes todavía no estén configuradas.
  }

  const qualification = await getQualificationProgress(user);
  const adminMode = user.role === 'admin';
  const certified = isQualified(qualification);
  const canDiagnose = certified || adminMode;
  const readinessDone = Boolean(qualification.readinessCompletedAt);
  const guideDone = Boolean(qualification.guideCompletedAt);
  const journeyProgress = [readinessDone, guideDone, certified].filter(Boolean).length;
  const primaryHref = canDiagnose ? '/questionnaire' : '/qualification';
  const primaryLabel = canDiagnose ? 'Iniciar diagnóstico' : 'Completar habilitación';

  return (
    <AppShell
      title={`Hola, ${user.fullName.split(' ')[0]}`}
      subtitle="Este es tu punto de partida para preparar, medir, entender y mejorar la cultura de innovación de tu agencia."
      agency={user.agency}
      actions={<Link href={primaryHref} className="button button-primary">{primaryLabel}</Link>}
    >
      {!canDiagnose ? <section className="dashboard-qualification-banner panel"><div><span className="hero-badge">Paso previo obligatorio</span><h2>Tu diagnóstico todavía no está habilitado</h2><p>Completá el checklist, practicá con un brief y aprobá una única certificación de 30 preguntas para asegurar una aplicación consistente.</p></div><div className="dashboard-qualification-progress"><strong>{journeyProgress}/3</strong><span>módulos completados</span><Link href="/qualification" className="button button-primary">Continuar recorrido →</Link></div></section> : null}

      <section className="dashboard-welcome panel">
        <div>
          <span className="hero-badge">Tu recorrido recomendado</span>
          <h2>{latest ? 'Continuá desde tu última medición' : canDiagnose ? 'Comenzá con una primera fotografía clara' : 'Primero aseguramos el criterio de aplicación'}</h2>
          <p>{latest ? 'Revisá el resultado, elegí una prioridad y documentá la implementación. La mejora ocurre entre una medición y la siguiente.' : canDiagnose ? 'El diagnóstico toma entre 12 y 18 minutos. Respondé según evidencia de los últimos tres meses, no según aspiraciones.' : 'La habilitación y el examen se realizan una sola vez; después quedan asociados a tu cuenta.'}</p>
          <div className="inline-actions">
            <Link href={latest ? `/results/${latest.id}` : primaryHref} className="button button-primary">{latest ? 'Ver último resultado' : primaryLabel}</Link>
            <Link href="/about-model" className="button button-secondary">Entender el modelo</Link>
          </div>
        </div>
        <div className="dashboard-score-card">
          <span>Última medición</span>
          <strong>{latest ? latest.overallScore.toFixed(2) : '—'}</strong>
          <small>{latest ? `${latest.maturityLevel} · ${formatDate(latest.createdAt)}` : 'Todavía no hay evaluaciones'}</small>
        </div>
      </section>

      <section className="dashboard-kpis">
        <article><span>Evaluaciones</span><strong>{assessmentCount}</strong><small>Historial de la agencia</small></article>
        <article><span>Acciones abiertas</span><strong>{openActions}</strong><small>Pendientes o en curso</small></article>
        <article><span>Habilitación</span><strong>{adminMode ? 'Libre' : certified ? `${qualification.certificationScore ?? '—'}%` : `${journeyProgress}/3`}</strong><small>{adminMode ? 'Modo administrador de prueba' : certified ? 'Aplicador certificado' : 'Recorrido pendiente'}</small></article>
      </section>

      <section className="dashboard-flow panel">
        <div className="section-head"><div><p className="eyebrow">Qué hacer ahora</p><h2>Un flujo que empieza con criterio y termina en implementación</h2></div></div>
        <div className="dashboard-flow-grid dashboard-flow-five">
          <Link href="/qualification"><span>01</span><strong>Preparar</strong><p>Checklist, guía, simulacro y certificación.</p></Link>
          <Link href={canDiagnose ? '/questionnaire' : '/qualification'}><span>02</span><strong>Diagnosticar</strong><p>Medí 22 prácticas con evidencia.</p></Link>
          <Link href={latest ? `/results/${latest.id}` : canDiagnose ? '/questionnaire' : '/qualification'}><span>03</span><strong>Entender</strong><p>Leé el resultado base sin depender de IA.</p></Link>
          <Link href="/action-plan"><span>04</span><strong>Priorizar</strong><p>Convertí brechas en acciones con responsable.</p></Link>
          <Link href="/follow-up"><span>05</span><strong>Implementar</strong><p>Registrá evidencia y prepará la próxima medición.</p></Link>
        </div>
      </section>
    </AppShell>
  );
}
