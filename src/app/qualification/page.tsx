import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress, isQualified } from '@/lib/qualification';

function statusLabel(done: boolean, current = false) {
  if (done) return <span className="journey-status done">✓ Completado</span>;
  if (current) return <span className="journey-status current">Siguiente paso</span>;
  return <span className="journey-status locked">Bloqueado</span>;
}

export default async function QualificationPage({ searchParams }: { searchParams?: { required?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const progress = await getQualificationProgress(user);
  const readinessDone = Boolean(progress.readinessCompletedAt);
  const guideDone = Boolean(progress.guideCompletedAt);
  const certified = isQualified(progress);
  const adminMode = user.role === 'admin';
  const canAccessAll = certified || adminMode;

  return (
    <AppShell
      title="Habilitación para aplicar el diagnóstico"
      subtitle="Un recorrido breve para asegurar que todas las mediciones usen el mismo criterio, evidencia comparable y una lectura responsable."
      agency={user.agency}
      actions={canAccessAll ? <Link href="/questionnaire" className="button button-primary">Iniciar diagnóstico</Link> : undefined}
    >
      {adminMode ? <div className="qualification-notice admin"><strong>Modo administrador activo.</strong><span>Podés abrir cualquier módulo para probarlo; estos accesos no certifican ni modifican el recorrido de los usuarios.</span></div> : null}
      {searchParams?.required && !adminMode ? <div className="qualification-notice"><strong>Antes de diagnosticar, necesitás completar tu habilitación.</strong><span>El recorrido inicial queda guardado. Una vez que aprobás, no volvés a rendir el examen.</span></div> : null}

      <section className="panel qualification-hero">
        <div>
          <span className="hero-badge">Recorrido del aplicador</span>
          <h2>{adminMode ? 'Todo el recorrido está abierto para pruebas' : certified ? 'Tu cuenta está habilitada' : 'Primero entrenamos el criterio; después medimos'}</h2>
          <p>{adminMode ? 'Entrá directamente al checklist, al simulacro, al examen o al diagnóstico para revisar la experiencia completa.' : certified ? `Certificación aprobada con ${progress.certificationScore ?? '—'}%. Podés volver a consultar la guía cuando lo necesites.` : 'La calidad del resultado depende de cómo se interpreta cada práctica. Por eso el diagnóstico se habilita luego de preparar evidencia, practicar con un caso y aprobar el examen.'}</p>
        </div>
        <div className={canAccessAll ? 'qualification-seal active' : 'qualification-seal'}><span>{adminMode ? '⚙' : certified ? '✓' : '3'}</span><small>{adminMode ? 'Prueba libre' : certified ? 'Aplicador certificado' : 'módulos'}</small></div>
      </section>

      <section className="qualification-journey">
        <article className={readinessDone ? 'qualification-step completed' : 'qualification-step current'}>
          <div className="qualification-step-number">01</div>
          <div className="qualification-step-copy"><p className="eyebrow">Preparación</p><h3>Checklist previo</h3><p>Definí alcance, período, evidencias, mirada transversal y criterio neutral.</p>{statusLabel(readinessDone, !readinessDone)}</div>
          <Link href="/readiness" className="button button-secondary">{readinessDone ? 'Revisar checklist' : 'Comenzar checklist'}</Link>
        </article>

        <article className={guideDone ? 'qualification-step completed' : (readinessDone || adminMode) ? 'qualification-step current' : 'qualification-step locked'}>
          <div className="qualification-step-number">02</div>
          <div className="qualification-step-copy"><p className="eyebrow">Entrenamiento</p><h3>Guía y simulacro</h3><p>Aprendé la escala con un brief de agencia y compará tu criterio con respuestas recomendadas.</p>{statusLabel(guideDone, (readinessDone || adminMode) && !guideDone)}</div>
          {readinessDone || adminMode ? <Link href="/training" className="button button-secondary">{guideDone ? 'Repasar guía' : adminMode ? 'Probar simulacro' : 'Abrir simulacro'}</Link> : <span className="button button-disabled">Completar paso 1</span>}
        </article>

        <article className={certified ? 'qualification-step completed' : (guideDone || adminMode) ? 'qualification-step current' : 'qualification-step locked'}>
          <div className="qualification-step-number">03</div>
          <div className="qualification-step-copy"><p className="eyebrow">Validación</p><h3>Examen de certificación</h3><p>30 preguntas de opción múltiple sobre los 22 principios. Se aprueba con 24 respuestas correctas y, una vez aprobado, no se repite.</p>{statusLabel(certified, (guideDone || adminMode) && !certified)}</div>
          {guideDone || adminMode ? <Link href="/certification" className="button button-primary">{certified ? 'Ver certificado' : adminMode ? 'Probar examen' : 'Rendir examen'}</Link> : <span className="button button-disabled">Completar paso 2</span>}
        </article>
      </section>

      <section className="panel qualification-why">
        <div><p className="eyebrow">Por qué existe este recorrido</p><h2>Evita tres errores que distorsionan el diagnóstico</h2></div>
        <div className="qualification-why-grid"><article><span>01</span><strong>Responder por aspiración</strong><p>Puntuar lo que se quiere hacer como si ya estuviera instalado.</p></article><article><span>02</span><strong>Usar el mejor caso</strong><p>Tomar una cuenta o equipo excepcional como realidad de toda la agencia.</p></article><article><span>03</span><strong>Confundir actividad con sistema</strong><p>Una charla o un proyecto aislado no equivale a una práctica sostenida.</p></article></div>
      </section>
    </AppShell>
  );
}
