'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DIMENSION_LABELS } from '@/lib/questionnaire';
import { DimensionKey, QualificationProgress } from '@/lib/types';

type ExamQuestion = {
  id: string;
  dimension: DimensionKey;
  principle: number;
  prompt: string;
  options: string[];
};

type Grade = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  gaps: DimensionKey[];
};

const PAGE_SIZE = 5;

export function CertificationExam({ initialProgress }: { initialProgress: QualificationProgress }) {
  const router = useRouter();
  const alreadyCertified = initialProgress.certificationStatus === 'passed' && Boolean(initialProgress.certifiedAt);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [passScore, setPassScore] = useState(80);
  const [minCorrect, setMinCorrect] = useState(24);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(!alreadyCertified);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);

  async function loadExam() {
    if (alreadyCertified) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/qualification', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo cargar el examen.');
      setQuestions(data.questions || []);
      setPassScore(data.passScore || 80);
      setMinCorrect(data.minCorrect || 24);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el examen.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadExam(); }, []);

  const answered = Object.keys(answers).length;
  const completion = questions.length ? Math.round((answered / questions.length) * 100) : 0;
  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const pageQuestions = useMemo(
    () => questions.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [questions, currentPage]
  );
  const currentPageComplete = pageQuestions.every((question) => answers[question.id] !== undefined);

  async function submit() {
    if (answered !== questions.length) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo corregir el examen.');
      setGrade(data.grade);
      setStarted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo corregir el examen.');
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setGrade(null);
    setCurrentPage(0);
    setStarted(true);
    loadExam();
  }

  if (alreadyCertified) {
    return (
      <section className="panel certification-result passed certification-credential">
        <div className="certification-result-badge"><span>✓</span></div>
        <p className="eyebrow">Certificación completada</p>
        <h2>Este examen ya fue aprobado</h2>
        <div className="certification-score-ring"><strong>{initialProgress.certificationScore ?? '—'}%</strong><span>resultado registrado</span></div>
        <p>La certificación opcional se realiza una sola vez y quedó asociada a tu cuenta{initialProgress.certifiedAt ? ` desde el ${new Date(initialProgress.certifiedAt).toLocaleDateString('es-PY')}` : ''}. No necesitás repetirla y el acceso a la plataforma no depende de este resultado.</p>
        <div className="certification-lock-note"><strong>Certificación protegida</strong><span>Solo un administrador puede reiniciar este proceso cuando exista una razón justificada.</span></div>
        <div className="inline-actions">
          <button className="button button-primary" onClick={() => router.push('/questionnaire')}>Iniciar diagnóstico →</button>
          <a className="button button-secondary" href="/design-led-culture-playbook.pdf" target="_blank" rel="noreferrer">Consultar playbook</a>
        </div>
      </section>
    );
  }

  if (loading) return <section className="panel certification-loading"><span className="mini-spinner" /><strong>Preparando tu examen…</strong><p>Estamos armando una evaluación equilibrada de las seis dimensiones.</p></section>;

  if (error && !questions.length) return <section className="panel certification-loading"><strong>No pudimos abrir el examen</strong><p>{error}</p><button className="button button-secondary" onClick={loadExam}>Reintentar</button></section>;

  if (grade) {
    return (
      <section className={grade.passed ? 'panel certification-result passed' : 'panel certification-result failed'}>
        <div className="certification-result-badge"><span>{grade.passed ? '✓' : '!'}</span></div>
        <p className="eyebrow">Resultado de certificación</p>
        <h2>{grade.passed ? 'Certificación aprobada' : 'Todavía falta consolidar el criterio'}</h2>
        <div className="certification-score-ring"><strong>{grade.score}%</strong><span>{grade.correct}/{grade.total} respuestas correctas</span></div>
        <p>{grade.passed ? 'Tu certificación quedó asociada a tu cuenta y no volverás a rendirla. El diagnóstico y los demás módulos ya estaban disponibles y continúan abiertos.' : `Necesitás ${passScore}%: al menos ${minCorrect} respuestas correctas de ${grade.total}. Podés repasar y volver a intentarlo cuando quieras; este resultado no limita el acceso a la herramienta.`}</p>
        {!grade.passed && grade.gaps.length ? <div className="certification-gaps"><strong>Dimensiones para repasar</strong><div>{grade.gaps.map((gap) => <span key={gap}>{DIMENSION_LABELS[gap]}</span>)}</div></div> : null}
        <div className="inline-actions">
          {grade.passed ? <button className="button button-primary" onClick={() => { router.push('/questionnaire?certified=1'); router.refresh(); }}>Iniciar diagnóstico →</button> : <button className="button button-primary" onClick={retry}>Volver a intentar</button>}
          <a className="button button-secondary" href="/design-led-culture-playbook.pdf" target="_blank" rel="noreferrer">Repasar playbook</a>
        </div>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="panel certification-start">
        <div className="certification-seal"><span>30</span><small>preguntas</small></div>
        <div>
          <span className="hero-badge">Recurso opcional · Certificación</span>
          <h2>Examen opcional del aplicador</h2>
          <p>Son 30 preguntas de opción múltiple, cinco por cada dimensión. Evalúan los 22 principios, el uso de evidencia y la capacidad de distinguir una práctica instalada de una intención. Podés usar toda la plataforma aunque no rindas o no apruebes este examen.</p>
          <div className="certification-rules"><span><strong>{questions.length}</strong> preguntas</span><span><strong>{minCorrect}</strong> correctas para aprobar</span><span><strong>Una sola vez</strong> después de aprobar</span><span><strong>15–20 min</strong> estimados</span></div>
          <div className="exam-playbook-card"><span>PDF</span><div><strong>Playbook Design-Led Culture</strong><p>Consultá los 22 principios y sus casos antes de comenzar. El documento también queda disponible durante todo el examen.</p></div><a className="button button-secondary button-small" href="/design-led-culture-playbook.pdf" target="_blank" rel="noreferrer">Abrir playbook</a></div>
          {initialProgress.certificationAttempts ? <p className="certification-attempt-note">Intentos anteriores: {initialProgress.certificationAttempts}. Último resultado: {initialProgress.certificationScore ?? '—'}%.</p> : null}
          <button className="button button-primary button-xl" onClick={() => { setCurrentPage(0); setStarted(true); }}>Comenzar examen →</button>
        </div>
      </section>
    );
  }

  return (
    <section className="certification-exam-shell">
      <div className="panel certification-exam-topbar exam-topbar-with-resource">
        <div><span>Progreso total</span><strong>{answered}/{questions.length} respondidas</strong></div>
        <div className="certification-exam-progress"><span style={{ width: `${completion}%` }} /></div>
        <b>{completion}%</b>
        <a href="/design-led-culture-playbook.pdf" target="_blank" rel="noreferrer" className="exam-pdf-link">PDF Design-Led ↗</a>
      </div>

      <div className="certification-page-nav" aria-label="Bloques del examen">
        {Array.from({ length: totalPages }, (_, index) => {
          const start = index * PAGE_SIZE;
          const block = questions.slice(start, start + PAGE_SIZE);
          const blockAnswered = block.filter((question) => answers[question.id] !== undefined).length;
          return <button key={index} type="button" className={index === currentPage ? 'active' : blockAnswered === block.length ? 'complete' : ''} onClick={() => setCurrentPage(index)}><span>{index + 1}</span><small>{blockAnswered}/{block.length}</small></button>;
        })}
      </div>

      <div className="certification-question-list">
        {pageQuestions.map((question, pageIndex) => {
          const questionIndex = currentPage * PAGE_SIZE + pageIndex;
          return (
            <article className={answers[question.id] !== undefined ? 'panel certification-question answered' : 'panel certification-question'} key={question.id}>
              <header><span>{questionIndex + 1}</span><div><small>{DIMENSION_LABELS[question.dimension]} · Principio {question.principle}</small><h3>{question.prompt}</h3></div></header>
              <div className="certification-options">
                {question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span>{String.fromCharCode(65 + optionIndex)}</span><p>{option}</p><i>✓</i></label>)}
              </div>
            </article>
          );
        })}
      </div>

      {error ? <div className="auth-message auth-message-error">{error}</div> : null}
      <div className="panel certification-submit certification-pagination">
        <button className="button button-secondary" disabled={currentPage === 0} onClick={() => { setCurrentPage((page) => Math.max(0, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>← Anterior</button>
        <div><strong>Bloque {currentPage + 1} de {totalPages}</strong><p>{currentPageComplete ? 'Bloque completo.' : `Respondé las ${pageQuestions.length} preguntas de este bloque.`}</p></div>
        {currentPage < totalPages - 1
          ? <button className="button button-primary" disabled={!currentPageComplete} onClick={() => { setCurrentPage((page) => Math.min(totalPages - 1, page + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Siguiente bloque →</button>
          : <button className="button button-primary button-xl" disabled={answered !== questions.length || submitting} onClick={submit}>{submitting ? 'Corrigiendo…' : 'Entregar examen'}</button>}
      </div>
    </section>
  );
}
