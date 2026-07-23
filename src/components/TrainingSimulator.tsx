'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCALE_OPTIONS } from '@/lib/questionnaire';

const PRINCIPLES = [
  { number: '01', title: 'Liderazgo visionario', copy: 'Visión centrada en usuarios, patrocinio real y capacidad de ajustar la estrategia.' },
  { number: '02', title: 'Liderazgo inspiracional', copy: 'Líderes que modelan diseño, escuchan usuarios, aprenden del error y reconocen buenas prácticas.' },
  { number: '03', title: 'Liderazgo relacional', copy: 'Seguridad para hablar, respuesta visible al feedback y relaciones que facilitan el cambio.' },
  { number: '04', title: 'Diseño como identidad', copy: 'El usuario está presente en valores, personas, ecosistema y decisiones.' },
  { number: '05', title: 'Adopción del diseño', copy: 'Métodos simples, uso interno, autonomía y rituales recurrentes.' },
  { number: '06', title: 'Innovación por diseño', copy: 'Prototipado, perspectivas diversas, tolerancia a la ambigüedad y mejora continua.' },
];

const SIMULATION = [
  {
    id: 'sim_voice',
    title: 'Voz del usuario en decisiones',
    prompt: 'La agencia mide NPS al cierre de campañas. Los resultados se guardan en un dashboard, pero solo se conversan cuando la nota es muy baja.',
    correct: 2,
    explanation: 'Existe información, pero todavía no está integrada de forma sistemática en las decisiones. “A veces” representa mejor la práctica predominante.',
  },
  {
    id: 'sim_brief',
    title: 'Diseño aplicado a procesos internos',
    prompt: 'Un nuevo proceso de brief fue probado en 2 de 12 cuentas. No tiene responsable ni fecha de revisión, aunque los equipos piloto lo valoran.',
    correct: 2,
    explanation: 'Es una prueba valiosa, pero sigue siendo aislada. Para “En desarrollo” debería existir una práctica reconocible con mayor orden y continuidad.',
  },
  {
    id: 'sim_ritual',
    title: 'Rituales de aprendizaje',
    prompt: 'Una de las tres unidades realiza una reunión mensual para compartir aprendizajes. Las otras lo hacen de manera ocasional.',
    correct: 2,
    explanation: 'La realidad transversal sigue siendo irregular. No corresponde usar el mejor caso como representación de toda la agencia.',
  },
  {
    id: 'sim_leaders',
    title: 'Conexión directa de líderes con usuarios',
    prompt: 'Dos directores participaron una vez en entrevistas con clientes durante el trimestre. No existe una expectativa o frecuencia definida.',
    correct: 2,
    explanation: 'Hay una señal positiva, pero todavía depende de ocasiones puntuales y personas específicas.',
  },
  {
    id: 'sim_feedback',
    title: 'Respuesta visible al feedback',
    prompt: 'Los equipos pueden plantear fricciones en retrospectivas. A veces se resuelven, pero no se registra qué decisión se tomó ni se comunica el seguimiento.',
    correct: 2,
    explanation: 'Existe escucha, pero falta cerrar el circuito. Sin respuesta visible no puede considerarse una práctica frecuente.',
  },
  {
    id: 'sim_internal',
    title: 'Mejora de experiencia interna',
    prompt: 'El flujo de reporting fue rediseñado con quienes lo usan, se implementó en todas las cuentas, tiene responsable y se revisa mensualmente con indicadores.',
    correct: 5,
    explanation: 'La práctica está integrada, tiene alcance transversal, responsable, evidencia y seguimiento. “Siempre” es defendible.',
  },
];

export function TrainingSimulator() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const completed = Object.keys(answers).length;
  const correct = useMemo(() => SIMULATION.filter((item) => answers[item.id] === item.correct).length, [answers]);
  const score = Math.round((correct / SIMULATION.length) * 100);
  const passed = score >= 80;

  function evaluate() {
    if (completed !== SIMULATION.length) return;
    setReviewed(true);
    document.getElementById('simulation-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function completeGuide() {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/qualification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete-guide', score }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo completar la guía.');
      router.push('/certification');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la guía.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="training-stack">
      <section className="panel training-intro">
        <div>
          <span className="hero-badge">Recurso opcional · Guía práctica</span>
          <h2>Cómo completar el diagnóstico sin inflar ni castigar el resultado</h2>
          <p>El playbook organiza la cultura de diseño en seis categorías y 22 principios. La aplicación debe comparar prácticas relativas, encontrar fortalezas y detectar dónde conviene actuar primero.</p>
        </div>
        <a className="button button-secondary" href="/design-led-culture-playbook.pdf" target="_blank" rel="noreferrer">Abrir playbook fuente ↗</a>
      </section>

      <section className="training-principles">
        {PRINCIPLES.map((principle) => <article key={principle.number}><span>{principle.number}</span><strong>{principle.title}</strong><p>{principle.copy}</p></article>)}
      </section>

      <section className="panel application-guide">
        <div className="section-head evidence-training-head"><div><p className="eyebrow">Brief de aplicación</p><h2>E.V.I.D.E.N.C.I.A. en lenguaje simple</h2><p>No necesitás memorizar nueve conceptos para responder. En la práctica, el método se traduce en cuatro señales que la plataforma te preguntará en cada práctica.</p></div><span className="evidence-training-badge">4 señales → 1 nivel sugerido</span></div>
        <div className="evidence-simple-grid">
          <article><span>01</span><strong>Existe</strong><p>¿Podés mostrar uno o varios casos reales de los últimos tres meses?</p><small>Resume Ejemplo + Vigencia + Instalación.</small></article>
          <article><span>02</span><strong>Se extiende</strong><p>¿Ocurre en un proyecto aislado, en varios equipos o en toda la agencia?</p><small>Resume Extensión + realidad predominante.</small></article>
          <article><span>03</span><strong>Se sostiene</strong><p>¿Tiene frecuencia, responsable, seguimiento y mejora?</p><small>Resume Dueño + Continuidad.</small></article>
          <article><span>04</span><strong>Se usa</strong><p>¿La práctica realmente cambia decisiones, procesos o resultados?</p><small>Resume Impacto + Nivel.</small></article>
        </div>
        <div className="evidence-training-example"><div><span>Ejemplo rápido</span><strong>“Medimos NPS, pero solo algunas cuentas lo revisan y no hay seguimiento.”</strong><p>Existe evidencia, pero tiene poco alcance y continuidad. La sugerencia sería <b>2 · A veces</b>, no 4 ni 5.</p></div><div className="evidence-training-score"><span>2</span><small>A veces</small></div></div>
        <details className="evidence-reference training-reference">
          <summary>Quiero ver las nueve letras del método original</summary>
          <div>
            <article><span>E</span><strong>Ejemplo</strong><small>Caso concreto</small></article><article><span>V</span><strong>Vigencia</strong><small>Últimos 3 meses</small></article><article><span>I</span><strong>Instalación</strong><small>Práctica real</small></article><article><span>D</span><strong>Dueño</strong><small>Responsable</small></article><article><span>E</span><strong>Extensión</strong><small>Alcance</small></article><article><span>N</span><strong>Nivel</strong><small>Escala coherente</small></article><article><span>C</span><strong>Continuidad</strong><small>Seguimiento</small></article><article><span>I</span><strong>Impacto</strong><small>Decisiones</small></article><article><span>A</span><strong>Anotación</strong><small>Contexto</small></article>
          </div>
        </details>
        <div className="scale-guide-row">
          {SCALE_OPTIONS.map((option) => <div key={option.value}><span>{option.value}</span><strong>{option.shortLabel}</strong><p>{option.description}</p></div>)}
        </div>
      </section>

      <section className="panel simulation-brief">
        <div className="simulation-brief-head">
          <div><p className="eyebrow">Simulacro guiado</p><h2>Brief: Agencia Nexo</h2><p>Agencia de 42 personas, organizada en tres unidades. Evaluá únicamente lo ocurrido en los últimos tres meses. La empresa se define como “customer centric”, pero tu tarea es responder según evidencia.</p></div>
          <div className="simulation-progress"><strong>{completed}/{SIMULATION.length}</strong><span>situaciones respondidas</span></div>
        </div>

        <div className="simulation-list">
          {SIMULATION.map((item, index) => {
            const selected = answers[item.id];
            const isCorrect = selected === item.correct;
            return (
              <article className={reviewed ? (isCorrect ? 'simulation-card correct' : 'simulation-card incorrect') : 'simulation-card'} key={item.id}>
                <header><span>{index + 1}</span><div><strong>{item.title}</strong><p>{item.prompt}</p></div></header>
                <div className="simulation-options">
                  {SCALE_OPTIONS.map((option) => <button type="button" key={option.value} className={selected === option.value ? 'selected' : ''} onClick={() => { setAnswers((current) => ({ ...current, [item.id]: option.value })); setReviewed(false); }}><span>{option.value}</span>{option.shortLabel}</button>)}
                </div>
                {reviewed ? <div className="simulation-feedback"><strong>{isCorrect ? '✓ Criterio correcto' : `Respuesta recomendada: ${item.correct} · ${SCALE_OPTIONS.find((option) => option.value === item.correct)?.shortLabel}`}</strong><p>{item.explanation}</p></div> : null}
              </article>
            );
          })}
        </div>

        {!reviewed ? <div className="simulation-actions"><p>{completed === SIMULATION.length ? 'Ya podés comparar tu criterio con la guía.' : `Faltan ${SIMULATION.length - completed} respuestas.`}</p><button type="button" className="button button-primary" disabled={completed !== SIMULATION.length} onClick={evaluate}>Corregir simulacro</button></div> : null}

        {reviewed ? <div id="simulation-result" className={passed ? 'simulation-result passed' : 'simulation-result'}><div><span>{score}%</span><div><strong>{passed ? 'Criterio preparado' : 'Revisá los casos marcados'}</strong><p>{passed ? 'Superaste el 80%. Podés registrar este avance y continuar al examen opcional.' : 'Podés revisar los casos y volver a intentar. También podés continuar al examen o ir directamente al diagnóstico: ningún resultado bloquea el acceso.'}</p></div></div>{passed ? <button type="button" className="button button-primary" disabled={saving} onClick={completeGuide}>{saving ? 'Guardando…' : 'Registrar avance e ir al examen →'}</button> : <div className="inline-actions"><button type="button" className="button button-secondary" onClick={() => setReviewed(false)}>Reintentar</button><button type="button" className="button button-primary" onClick={() => router.push('/certification')}>Ir al examen igualmente →</button></div>}</div> : null}
        {error ? <div className="auth-message auth-message-error">{error}</div> : null}
      </section>
    </div>
  );
}
