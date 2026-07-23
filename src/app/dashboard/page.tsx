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
  const certified = isQualified(qualification);
  const readinessDone = Boolean(qualification.readinessCompletedAt);
  const guideDone = Boolean(qualification.guideCompletedAt);
  const learningProgress = [readinessDone, guideDone, certified].filter(Boolean).length;

  return (
    <AppShell
      title={`Hola, ${user.fullName.split(' ')[0]}`}
      subtitle="Este es tu punto de partida para medir, entender y mejorar la cultura de innovación de tu agencia."
      agency={user.agency}
      actions={<Link href="/questionnaire" className="button button-primary">Iniciar diagnóstico</Link>}
    >
      <section className="dashboard-access-banner panel">
        <div>
          <span className="hero-badge">Acceso completo</span>
          <h2>Todos los módulos están disponibles desde el primer ingreso</h2>
          <p>El checklist, el simulacro y la certificación quedan como recursos opcionales. Podés iniciar el diagnóstico, revisar NPS y trabajar en planes de acción sin completar pasos previos.</p>
        </div>
        <div className="inline-actions">
          <Link href="/questionnaire" className="button button-primary">Comenzar diagnóstico →</Link>
          <Link href="/qualification" className="button button-secondary">Ver recursos opcionales</Link>
        </div>
      </section>

      <section className="dashboard-welcome panel">
        <div>
          <span className="hero-badge">Tu recorrido recomendado</span>
          <h2>{latest ? 'Continuá desde tu última medición' : 'Comenzá con una primera fotografía clara'}</h2>
          <p>{latest ? 'Revisá el resultado, elegí una prioridad y documentá la implementación. La mejora ocurre entre una medición y la siguiente.' : 'El diagnóstico toma entre 12 y 18 minutos. Respondé según evidencia de los últimos tres meses, no según aspiraciones.'}</p>
          <div className="inline-actions">
            <Link href={latest ? `/results/${latest.id}` : '/questionnaire'} className="button button-primary">{latest ? 'Ver último resultado' : 'Iniciar diagnóstico'}</Link>
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
        <article><span>Recursos completados</span><strong>{certified ? '3/3' : `${learningProgress}/3`}</strong><small>{certified ? `Certificación ${qualification.certificationScore ?? '—'}%` : 'Opcionales · no bloquean el acceso'}</small></article>
      </section>

      <section className="dashboard-flow panel">
        <div className="section-head"><div><p className="eyebrow">Qué hacer ahora</p><h2>Un flujo abierto que convierte información en implementación</h2></div></div>
        <div className="dashboard-flow-grid dashboard-flow-six">
          <Link href="/qualification"><span>01</span><strong>Prepararte</strong><p>Usá checklist, guía y examen cuando te resulte útil.</p></Link>
          <Link href="/questionnaire"><span>02</span><strong>Diagnosticar</strong><p>Medí las prácticas con evidencia.</p></Link>
          <Link href={latest ? `/results/${latest.id}` : '/questionnaire'}><span>03</span><strong>Entender</strong><p>Leé fortalezas, brechas y prioridades.</p></Link>
          <Link href="/nps"><span>04</span><strong>Escuchar</strong><p>Sumá la percepción de clientes y detectá brechas externas.</p></Link>
          <Link href="/action-plan"><span>05</span><strong>Priorizar</strong><p>Convertí diagnóstico y NPS en acciones con responsable.</p></Link>
          <Link href="/follow-up"><span>06</span><strong>Implementar</strong><p>Mové tarjetas, registrá evidencia y prepará la próxima medición.</p></Link>
        </div>
      </section>
    </AppShell>
  );
}
