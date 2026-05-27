'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DIMENSIONS,
  DIMENSION_DESCRIPTIONS,
  DIMENSION_INTROS,
  DIMENSION_LABELS,
  QUESTIONS,
  SCALE_OPTIONS,
} from '@/lib/questionnaire';
import { DimensionKey } from '@/lib/types';
import { Tooltip } from '@/components/Tooltip';

const STORAGE_KEY = 'texo-design-ladder-draft-v2';
const initialAnswers = Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]));

function getDimensionQuestions(dimension: DimensionKey) {
  return QUESTIONS.filter((q) => q.dimension === dimension);
}

export function QuestionnaireForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [openExamples, setOpenExamples] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setDraftLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw);
      setOrgName(parsed.orgName || '');
      setRole(parsed.role || '');
      setEmail(parsed.email || '');
      setNotes(parsed.notes || '');
      setAnswers({ ...initialAnswers, ...(parsed.answers || {}) });
      setCurrentStep(Number(parsed.currentStep || 0));
    } catch {
      // ignore corrupted drafts
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ orgName, role, email, notes, answers, currentStep })
    );
  }, [orgName, role, email, notes, answers, currentStep, draftLoaded]);

  const grouped = useMemo(() => {
    return DIMENSIONS.map((dimension) => ({
      dimension,
      questions: getDimensionQuestions(dimension),
    }));
  }, []);

  const activeGroup = grouped[currentStep];
  const totalQuestions = QUESTIONS.length;
  const doneQuestions = QUESTIONS.filter((q) => answers[q.id] > 0).length;
  const completion = Math.round((doneQuestions / totalQuestions) * 100);
  const isLastStep = currentStep === grouped.length - 1;
  const canAdvance = activeGroup.questions.every((q) => answers[q.id] > 0);
  const missing = QUESTIONS.some((q) => !answers[q.id]) || !orgName.trim();

  function handleAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleExample(questionId: string) {
    setOpenExamples((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }

  function clearDraft() {
    setOrgName('');
    setRole('');
    setEmail('');
    setNotes('');
    setAnswers(initialAnswers);
    setCurrentStep(0);
    setError('');
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentName: orgName,
          respondentEmail: email,
          notes: [role ? `Rol declarado: ${role}` : '', notes].filter(Boolean).join('\n\n'),
          answers,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'No se pudo guardar la evaluación.');
      }

      window.localStorage.removeItem(STORAGE_KEY);
      router.push(`/results/${data.item.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la evaluación.');
    } finally {
      setLoading(false);
    }
  }

  if (!activeGroup) return null;

  return (
    <form className="questionnaire-form" onSubmit={onSubmit}>
      <section className="panel intake-panel">
        <div className="intake-head">
          <div>
            <p className="eyebrow">Contexto del diagnóstico</p>
            <h2>Antes de responder, contanos desde qué cuenta o unidad estás mirando el diagnóstico</h2>
          </div>
          <div className="inline-actions">
            <Link href="/glossary" className="button button-secondary button-small" title="Abrir el glosario con definiciones del modelo">
              Abrir glosario
            </Link>
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={clearDraft}
              title="Borra el borrador guardado en este navegador y reinicia el cuestionario"
            >
              Limpiar borrador
            </button>
          </div>
        </div>

        <div className="card-grid two-up">
          <div className="field">
            <label>Organización, cuenta o unidad evaluada</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Ej. New business, creatividad, medios o una cuenta puntual"
              required
              title="Nombre de la cuenta, unidad o frente de trabajo sobre el que estás haciendo el diagnóstico"
            />
          </div>

          <div className="field">
            <label>Rol del evaluador</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej. Dirección, estrategia, creatividad, medios"
              title="Nos ayuda a interpretar desde qué mirada fue respondido el diagnóstico"
            />
          </div>

          <div className="field">
            <label>Email de contacto</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@texo.com"
              title="Opcional. Sirve para seguimiento o para volver al diagnóstico"
            />
          </div>

          <div className="field">
            <label>Avance total</label>
            <div className="progress-box" title="Muestra cuánto del diagnóstico ya está respondido">
              <div className="progress-bar"><span style={{ width: `${completion}%` }} /></div>
              <strong>{completion}% completado · {doneQuestions} de {totalQuestions} preguntas</strong>
            </div>
          </div>

          <div className="field full-span">
            <label>Contexto adicional</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qué está pasando hoy, qué iniciativas están en curso, qué brechas sienten o qué quieren mejorar."
              rows={4}
              title="Este campo sirve para registrar contexto del momento y que luego el resultado sea más fácil de leer"
            />
          </div>
        </div>
      </section>

      <section className="panel progress-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Bloque {currentStep + 1} de {grouped.length}</p>
            <h2>{DIMENSION_LABELS[activeGroup.dimension]}</h2>
            <p className="muted">{DIMENSION_DESCRIPTIONS[activeGroup.dimension]}</p>
          </div>
          <div className="progress-copy">
            <strong>{Math.round(((currentStep + 1) / grouped.length) * 100)}%</strong>
            <span>del recorrido por bloques</span>
          </div>
        </div>

        <div className="dimension-intro">
          <p>{DIMENSION_INTROS[activeGroup.dimension]}</p>
        </div>

        <div className="step-tabs" aria-label="Bloques del cuestionario">
          {grouped.map((group, index) => {
            const answered = group.questions.filter((q) => answers[q.id] > 0).length;
            const active = index === currentStep;
            return (
              <button
                key={group.dimension}
                type="button"
                className={`step-tab ${active ? 'step-tab-active' : ''}`}
                onClick={() => setCurrentStep(index)}
                title={`Ir al bloque ${index + 1}: ${DIMENSION_LABELS[group.dimension]}`}
              >
                <strong>{index + 1}</strong>
                <span>{DIMENSION_LABELS[group.dimension]}</span>
                <small>{answered}/{group.questions.length}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel dimension-panel">
        <div className="question-list">
          {activeGroup.questions.map((question, index) => (
            <article className="question-card" key={question.id}>
              <div className="question-copy">
                <span className="question-index">P{question.principleNumber}</span>
                <div>
                  <div className="question-title-row">
                    <h3>{question.title}</h3>
                    <small className="muted">Principio {question.principleNumber}: {question.principleName}</small>
                    {question.tooltip ? <Tooltip content={question.tooltip} label={`Explicación de ${question.title}`} /> : null}
                  </div>
                  <p>{question.description}</p>
                  {question.glossary ? <small className="question-glossary">{question.glossary}</small> : null}
                </div>
              </div>

              {question.agencyExample ? (
                <div className="example-box">
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => toggleExample(question.id)}
                    title="Muestra un ejemplo aplicado al trabajo de una agencia de publicidad y medios"
                  >
                    {openExamples[question.id] ? 'Ocultar ejemplo aplicado' : 'Ver ejemplo aplicado'}
                  </button>
                  {openExamples[question.id] ? <p>{question.agencyExample}</p> : null}
                </div>
              ) : null}

              <div className="scale-grid" role="radiogroup" aria-label={question.title}>
                {SCALE_OPTIONS.map((option) => {
                  const active = answers[question.id] === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`scale-option ${active ? 'scale-option-active' : ''}`}
                      title={`${option.title}. ${option.description}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={active}
                        onChange={() => handleAnswer(question.id, option.value)}
                      />
                      <span className="scale-copy">
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            title="Volver al bloque anterior"
          >
            Bloque anterior
          </button>

          {!isLastStep ? (
            <button
              type="button"
              className="button button-primary"
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, grouped.length - 1))}
              disabled={!canAdvance}
              title="Ir al siguiente bloque. Se habilita cuando respondés todas las preguntas de este bloque"
            >
              Siguiente bloque
            </button>
          ) : null}
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="submit-strip">
        <div>
          <p className="eyebrow">Antes de generar resultados</p>
          <h3>El diagnóstico guarda tus respuestas, calcula la madurez actual y genera una lectura detallada con brechas, fortalezas y prioridades.</h3>
        </div>

        <button
          type="submit"
          className="button button-primary button-xl"
          disabled={loading || missing}
          title="Genera el diagnóstico final y abre la lectura completa de resultados"
        >
          {loading ? 'Generando diagnóstico…' : 'Generar diagnóstico ejecutivo ahora'}
        </button>
      </section>
    </form>
  );
}
