'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DIMENSIONS, DIMENSION_DESCRIPTIONS, DIMENSION_INTROS, DIMENSION_LABELS, QUESTIONS, SCALE_OPTIONS } from '@/lib/questionnaire';
import { AgencyName, DimensionKey } from '@/lib/types';
import { Tooltip } from '@/components/Tooltip';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { EvidenceCoach, EvidenceSignals } from '@/components/EvidenceCoach';

const STORAGE_KEY = 'texo-design-ladder-draft-v5';
const initialAnswers = Object.fromEntries(QUESTIONS.map((question) => [question.id, 0]));
const REVIEW_STEP = DIMENSIONS.length + 1;

function questionsFor(dimension: DimensionKey) {
  return QUESTIONS.filter((question) => question.dimension === dimension);
}

export function QuestionnaireForm({ defaultName = '', defaultEmail = '', agency, certificationScore, certified = false, adminMode = false }: { defaultName?: string; defaultEmail?: string; agency: AgencyName; certificationScore?: number; certified?: boolean; adminMode?: boolean }) {
  const router = useRouter();
  const [respondentName, setRespondentName] = useState(defaultName);
  const [role, setRole] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [currentStep, setCurrentStep] = useState(0);
  const [openEvidence, setOpenEvidence] = useState<Record<string, boolean>>({});
  const [evidenceSignals, setEvidenceSignals] = useState<Record<string, EvidenceSignals>>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const grouped = useMemo(() => DIMENSIONS.map((dimension) => ({ dimension, questions: questionsFor(dimension) })), []);
  const totalAnswered = QUESTIONS.filter((question) => answers[question.id] > 0).length;
  const completion = Math.round((totalAnswered / QUESTIONS.length) * 100);
  const missingQuestions = QUESTIONS.filter((question) => !answers[question.id]);
  const activeGroup = currentStep >= 1 && currentStep <= DIMENSIONS.length ? grouped[currentStep - 1] : null;
  const activeAnswered = activeGroup?.questions.filter((question) => answers[question.id] > 0).length || 0;
  const activeComplete = Boolean(activeGroup?.questions.every((question) => answers[question.id] > 0));
  const contextComplete = respondentName.trim().length >= 2;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setRespondentName(draft.respondentName || defaultName);
      setRole(draft.role || '');
      setEmail(draft.email || defaultEmail);
      setNotes(draft.notes || '');
      setAnswers({ ...initialAnswers, ...(draft.answers || {}) });
      setEvidenceSignals(draft.evidenceSignals || {});
      setOpenEvidence(draft.openEvidence || {});
      setCurrentStep(Math.min(Number(draft.currentStep || 0), REVIEW_STEP));
    } catch {
      // Un borrador corrupto no debe bloquear la evaluación.
    } finally {
      setDraftLoaded(true);
    }
  }, [defaultEmail, defaultName]);

  useEffect(() => {
    if (!draftLoaded || loading) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ respondentName, role, email, notes, answers, evidenceSignals, openEvidence, currentStep }));
      setSavedAt(new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [respondentName, role, email, notes, answers, evidenceSignals, openEvidence, currentStep, draftLoaded, loading]);

  function goToStep(step: number) {
    setCurrentStep(Math.max(0, Math.min(REVIEW_STEP, step)));
    window.setTimeout(() => document.getElementById('diagnostic-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function answer(questionId: string, value: number) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function resetDraft() {
    if (!window.confirm('¿Querés borrar todas las respuestas de este diagnóstico?')) return;
    setRespondentName(defaultName);
    setRole('');
    setEmail(defaultEmail);
    setNotes('');
    setAnswers(initialAnswers);
    setEvidenceSignals({});
    setOpenEvidence({});
    setCurrentStep(0);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function firstIncompleteStep() {
    const index = grouped.findIndex((group) => group.questions.some((question) => !answers[question.id]));
    return index >= 0 ? index + 1 : REVIEW_STEP;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!contextComplete) return goToStep(0);
    if (missingQuestions.length) return goToStep(firstIncompleteStep());

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentName,
          respondentEmail: email,
          notes: [
            role ? `Rol declarado: ${role}` : '',
            notes,
            Object.entries(evidenceSignals)
              .filter(([, signals]) => signals.note?.trim())
              .map(([questionId, signals]) => {
                const question = QUESTIONS.find((item) => item.id === questionId);
                return `Evidencia · ${question?.title || questionId}: ${signals.note?.trim()}`;
              })
              .join('\n'),
          ].filter(Boolean).join('\n\n'),
          answers,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo guardar la evaluación.');
      setCompleted(true);
      window.localStorage.removeItem(STORAGE_KEY);
      window.setTimeout(() => {
        router.push(`/results/${data.item.id}`);
        router.refresh();
      }, 650);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'No se pudo generar el diagnóstico.');
    }
  }

  return (
    <form className="diagnostic-shell" onSubmit={submit} id="diagnostic-top">
      <ProcessingOverlay active={loading} completed={completed} />

      <section className="diagnostic-topbar panel">
        <div className="diagnostic-progress-copy">
          <span>{currentStep === 0 ? 'Contexto de la medición' : currentStep === REVIEW_STEP ? 'Revisión final' : `Dimensión ${currentStep} de ${DIMENSIONS.length}`}</span>
          <strong>{completion}% del diagnóstico respondido</strong>
        </div>
        <div className="diagnostic-progress-track"><span style={{ width: `${completion}%` }} /></div>
        <div className="diagnostic-topbar-statuses"><span className={adminMode ? 'certified-applicator-chip admin' : certified ? 'certified-applicator-chip' : 'certified-applicator-chip open-access'}>{adminMode ? '⚙ Modo administrador · prueba libre' : certified ? `✓ Certificación registrada${certificationScore ? ` · ${certificationScore}%` : ''}` : 'Acceso completo · preparación opcional'}</span><div className="autosave-state"><i /> {savedAt ? `Guardado automáticamente · ${savedAt}` : 'Guardado automático activo'}</div></div>
      </section>

      <div className="diagnostic-layout">
        <aside className="diagnostic-stepper">
          <button type="button" onClick={() => goToStep(0)} className={currentStep === 0 ? 'diagnostic-step active' : contextComplete ? 'diagnostic-step complete' : 'diagnostic-step'}><span>{contextComplete ? '✓' : '0'}</span><div><strong>Contexto</strong><small>Datos de esta medición</small></div></button>
          {grouped.map((group, index) => {
            const count = group.questions.filter((question) => answers[question.id] > 0).length;
            const complete = count === group.questions.length;
            return <button type="button" key={group.dimension} onClick={() => goToStep(index + 1)} className={currentStep === index + 1 ? 'diagnostic-step active' : complete ? 'diagnostic-step complete' : 'diagnostic-step'}><span>{complete ? '✓' : index + 1}</span><div><strong>{DIMENSION_LABELS[group.dimension]}</strong><small>{count}/{group.questions.length} respondidas</small></div></button>;
          })}
          <button type="button" onClick={() => goToStep(REVIEW_STEP)} className={currentStep === REVIEW_STEP ? 'diagnostic-step active' : missingQuestions.length === 0 ? 'diagnostic-step complete' : 'diagnostic-step'}><span>{missingQuestions.length === 0 ? '✓' : '7'}</span><div><strong>Revisar y generar</strong><small>{missingQuestions.length ? `${missingQuestions.length} pendientes` : 'Todo listo'}</small></div></button>
          <div className="diagnostic-help-card"><strong>¿Cómo responder?</strong><p>Usá evidencia de los últimos 3 meses. “Siempre” exige continuidad, responsable y trazabilidad.</p><Link href="/training" target="_blank">Abrir guía y simulacro →</Link></div>
        </aside>

        <main className="diagnostic-main">
          {currentStep === 0 ? (
            <section className="panel diagnostic-intro-panel">
              <div className="diagnostic-intro-head"><span className="hero-badge">12–18 minutos · Acceso completo</span><h2>Definí el contexto de esta medición</h2><p>Podés iniciar esta medición directamente. Registrá quién responde y cualquier situación que pueda influir en la lectura del resultado; la guía y la certificación quedan disponibles como apoyo opcional.</p></div>
              <div className="diagnostic-principles evidence-onboarding">
                <article><span>01</span><strong>Buscá un caso real</strong><p>Algo que efectivamente ocurrió durante los últimos tres meses.</p></article>
                <article><span>02</span><strong>Pasalo por 4 señales</strong><p>Existe, se extiende, se sostiene y se usa para decidir.</p></article>
                <article><span>03</span><strong>Usá la sugerencia</strong><p>El asistente propone un nivel; vos podés confirmarlo o justificar otro.</p></article>
              </div>
              <div className="evidence-onboarding-note"><span>E.V.I.D.E.N.C.I.A. en simple</span><strong>No tenés que memorizar nueve letras.</strong><p>En cada pregunta podés abrir un asistente que traduce evidencia concreta en una recomendación de respuesta.</p></div>
              <div className="diagnostic-context-grid">
                <label className="field"><span>Agencia evaluada</span><input value={agency} readOnly /></label>
                <label className="field"><span>Persona que responde *</span><input value={respondentName} onChange={(event) => setRespondentName(event.target.value)} placeholder="Nombre y apellido" /></label>
                <label className="field"><span>Rol o función</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ej. Dirección, estrategia, cuentas" /></label>
                <label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" /></label>
                <label className="field diagnostic-context-notes"><span>Contexto que pueda influir en la lectura</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Cambios recientes, proyectos piloto, reestructuraciones o prioridades." /></label>
              </div>
              <div className="diagnostic-footer-actions"><button type="button" className="button button-ghost" onClick={resetDraft}>Reiniciar</button><button type="button" className="button button-primary" disabled={!contextComplete} onClick={() => goToStep(1)}>Comenzar diagnóstico →</button></div>
            </section>
          ) : null}

          {activeGroup ? (
            <>
              <section className="panel diagnostic-dimension-head">
                <div><p className="eyebrow">Dimensión {currentStep} · {activeGroup.questions.length} prácticas</p><h2>{DIMENSION_LABELS[activeGroup.dimension]}</h2><p>{DIMENSION_DESCRIPTIONS[activeGroup.dimension]}</p></div>
                <div className="dimension-explainer"><span>Qué buscamos entender</span><p>{DIMENSION_INTROS[activeGroup.dimension]}</p></div>
              </section>

              <section className="evidence-dimension-guide">
                <div><span>Cómo responder este bloque</span><strong>Primero evidencia; después escala.</strong><p>En cada práctica abrí el asistente, marcá cuatro señales y usá la sugerencia como punto de partida.</p></div>
                <div className="evidence-dimension-flow"><span>1 · Caso real</span><i>→</i><span>2 · Cuatro señales</span><i>→</i><span>3 · Nivel sugerido</span></div>
              </section>

              <div className="diagnostic-question-list">
                {activeGroup.questions.map((question, questionIndex) => {
                  const selected = answers[question.id];
                  return (
                    <article className={selected ? 'diagnostic-question answered' : 'diagnostic-question'} key={question.id}>
                      <header><span className="diagnostic-question-number">{questionIndex + 1}</span><div><div className="question-status-row"><span>Principio {question.principleNumber}</span>{selected ? <strong>Respondida · {SCALE_OPTIONS.find((option) => option.value === selected)?.shortLabel}</strong> : <em>Pendiente</em>}</div><div className="question-title-row"><h3>{question.title}</h3>{question.tooltip ? <Tooltip content={question.tooltip} label={`Explicación de ${question.title}`} /> : null}</div><p>{question.description}</p></div></header>
                      <div className="evidence-entry">
                        <div><span>Paso recomendado</span><strong>Elegí el nivel con evidencia, no por intuición.</strong><p>El asistente hace cuatro preguntas y te explica por qué sugiere un nivel.</p></div>
                        <button type="button" className={openEvidence[question.id] ? 'button button-secondary button-small active' : 'button button-secondary button-small'} onClick={() => setOpenEvidence((current) => ({ ...current, [question.id]: !current[question.id] }))}>{openEvidence[question.id] ? 'Cerrar asistente' : 'Ayudarme a elegir →'}</button>
                      </div>
                      {openEvidence[question.id] ? <EvidenceCoach
                        questionId={question.id}
                        signals={evidenceSignals[question.id] || {}}
                        selectedScore={selected}
                        observation={question.glossary || question.tooltip}
                        agencyExample={question.agencyExample}
                        onChange={(next) => setEvidenceSignals((current) => ({ ...current, [question.id]: next }))}
                        onApply={(score) => { answer(question.id, score); setOpenEvidence((current) => ({ ...current, [question.id]: false })); }}
                      /> : null}
                      <div className="scale-choice-head"><div><strong>Respuesta final</strong><span>{selected ? `Seleccionaste ${selected} · ${SCALE_OPTIONS.find((option) => option.value === selected)?.shortLabel}` : 'Podés responder directamente o usar el asistente.'}</span></div>{evidenceSignals[question.id]?.note ? <em>✓ Evidencia anotada</em> : null}</div>
                      <div className="diagnostic-scale" role="radiogroup" aria-label={question.title}>
                        {SCALE_OPTIONS.map((option) => <label key={option.value} className={selected === option.value ? 'diagnostic-scale-option selected' : 'diagnostic-scale-option'}><input type="radio" name={question.id} checked={selected === option.value} onChange={() => answer(question.id, option.value)} /><span className="scale-value">{option.value}</span><strong>{option.shortLabel}</strong><small>{option.description}</small><i>✓</i></label>)}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="diagnostic-navigation panel"><button type="button" className="button button-secondary" onClick={() => goToStep(currentStep - 1)}>← Anterior</button><div><strong>{activeAnswered}/{activeGroup.questions.length}</strong><span>{activeComplete ? 'Bloque completo' : `Faltan ${activeGroup.questions.length - activeAnswered} respuestas`}</span></div><button type="button" className="button button-primary" disabled={!activeComplete} onClick={() => goToStep(currentStep === DIMENSIONS.length ? REVIEW_STEP : currentStep + 1)}>{currentStep === DIMENSIONS.length ? 'Revisar respuestas →' : 'Siguiente dimensión →'}</button></div>
            </>
          ) : null}

          {currentStep === REVIEW_STEP ? (
            <section className="panel diagnostic-review">
              <div className="diagnostic-review-head"><span className="hero-badge">Último paso</span><h2>Revisá antes de generar el resultado</h2><p>El resultado base se calcula con reglas predefinidas y estará disponible aunque la IA no esté configurada.</p></div>
              <div className="review-summary"><article><span>Prácticas respondidas</span><strong>{totalAnswered}/{QUESTIONS.length}</strong></article><article><span>Agencia</span><strong>{agency}</strong></article><article><span>Responsable</span><strong>{respondentName || 'Pendiente'}</strong></article></div>
              <div className="review-dimensions">
                {grouped.map((group, index) => {
                  const answered = group.questions.filter((question) => answers[question.id] > 0).length;
                  const average = answered ? group.questions.reduce((sum, question) => sum + Number(answers[question.id] || 0), 0) / answered : 0;
                  return <button type="button" key={group.dimension} onClick={() => goToStep(index + 1)}><span className={answered === group.questions.length ? 'review-status done' : 'review-status'}>{answered === group.questions.length ? '✓' : '!'}</span><div><strong>{DIMENSION_LABELS[group.dimension]}</strong><small>{answered}/{group.questions.length} respondidas</small></div><em>{average ? average.toFixed(1) : '—'}</em><b>Editar →</b></button>;
                })}
              </div>
              {error ? <div className="auth-message auth-message-error" role="alert"><strong>No pudimos generar el resultado.</strong><br />{error}</div> : null}
              {missingQuestions.length ? <div className="completion-warning"><strong>Todavía falta completar el diagnóstico</strong><p>Hay {missingQuestions.length} prácticas pendientes. Volvé al primer bloque incompleto para continuar.</p><button type="button" className="button button-secondary" onClick={() => goToStep(firstIncompleteStep())}>Ir a pendientes</button></div> : <div className="ready-to-generate"><div><strong>Todo listo para calcular</strong><p>Primero verás una lectura predeterminada. Luego podrás pedir una profundización con IA de manera opcional.</p></div><button type="submit" className="button button-primary button-xl">Generar mi diagnóstico</button></div>}
            </section>
          ) : null}
        </main>
      </div>
    </form>
  );
}
