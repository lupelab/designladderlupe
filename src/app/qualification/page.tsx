import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress, isQualified } from '@/lib/qualification';

function statusLabel(done: boolean) {
  if (done) return <span className="journey-status done">✓ Completado</span>;
  return <span className="journey-status available">Opcional</span>;
}

export default async function QualificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const progress = await getQualificationProgress(user);
  const readinessDone = Boolean(progress.readinessCompletedAt);
  const guideDone = Boolean(progress.guideCompletedAt);
  const certified = isQualified(progress);
  const completedCount = [readinessDone, guideDone, certified].filter(Boolean).length;

  return (
    <AppShell
      title="Recursos opcionales de preparación"
      subtitle="Checklist, guía, simulacro y certificación para quienes quieran reforzar el criterio de aplicación. Ninguno de estos pasos bloquea la herramienta."
      agency={user.agency}
      actions={<Link href="/questionnaire" className="button button-primary">Iniciar diagnóstico</Link>}
    >
      <div className="qualification-notice optional">
        <strong>Acceso completo habilitado.</strong>
        <span>Podés entrar directamente al diagnóstico, NPS, resultados y planes de acción. Este recorrido queda disponible como apoyo.</span>
      </div>

      <section className="panel qualification-hero">
        <div>
          <span className="hero-badge">Centro de aprendizaje</span>
          <h2>{certified ? 'Tu certificación quedó registrada' : 'Prepararte suma valor, pero ya podés usar toda la plataforma'}</h2>
          <p>{certified ? `Aprobaste con ${progress.certificationScore ?? '—'}%. Podés volver a consultar la guía y el playbook cuando lo necesites.` : 'Elegí libremente qué recurso usar. El diagnóstico está disponible desde el primer ingreso y la certificación funciona como una validación opcional del criterio.'}</p>
        </div>
        <div className={certified ? 'qualification-seal active' : 'qualification-seal'}>
          <span>{certified ? '✓' : completedCount}</span>
          <small>{certified ? 'Certificación registrada' : `${completedCount} de 3 completados`}</small>
        </div>
      </section>

      <section className="qualification-journey">
        <article className={readinessDone ? 'qualification-step completed' : 'qualification-step current'}>
          <div className="qualification-step-number">01</div>
          <div className="qualification-step-copy">
            <p className="eyebrow">Preparación opcional</p>
            <h3>Checklist previo</h3>
            <p>Definí alcance, período, evidencias, mirada transversal y criterio neutral.</p>
            {statusLabel(readinessDone)}
          </div>
          <Link href="/readiness" className="button button-secondary">{readinessDone ? 'Revisar checklist' : 'Abrir checklist'}</Link>
        </article>

        <article className={guideDone ? 'qualification-step completed' : 'qualification-step current'}>
          <div className="qualification-step-number">02</div>
          <div className="qualification-step-copy">
            <p className="eyebrow">Entrenamiento opcional</p>
            <h3>Guía y simulacro</h3>
            <p>Practicá con casos reales y compará tu criterio con respuestas recomendadas.</p>
            {statusLabel(guideDone)}
          </div>
          <Link href="/training" className="button button-secondary">{guideDone ? 'Repasar guía' : 'Abrir simulacro'}</Link>
        </article>

        <article className={certified ? 'qualification-step completed' : 'qualification-step current'}>
          <div className="qualification-step-number">03</div>
          <div className="qualification-step-copy">
            <p className="eyebrow">Validación opcional</p>
            <h3>Examen de certificación</h3>
            <p>30 preguntas sobre los 22 principios. Podés rendirlo directamente y su resultado no condiciona el acceso.</p>
            {statusLabel(certified)}
          </div>
          <Link href="/certification" className="button button-primary">{certified ? 'Ver certificado' : 'Abrir examen'}</Link>
        </article>
      </section>

      <section className="panel qualification-why">
        <div><p className="eyebrow">Cuándo conviene usar estos recursos</p><h2>Ayudan a mejorar la calidad de la medición</h2></div>
        <div className="qualification-why-grid">
          <article><span>01</span><strong>Antes de la primera medición</strong><p>Sirven para alinear conceptos y entender la escala.</p></article>
          <article><span>02</span><strong>Cuando hay respuestas muy diferentes</strong><p>Permiten revisar qué evidencia sostiene cada nivel.</p></article>
          <article><span>03</span><strong>Al incorporar nuevos aplicadores</strong><p>Funcionan como material de onboarding sin bloquear su trabajo.</p></article>
        </div>
      </section>
    </AppShell>
  );
}
