'use client';

import { SCALE_OPTIONS } from '@/lib/questionnaire';

export type EvidenceSignals = {
  existence?: number;
  reach?: number;
  continuity?: number;
  impact?: number;
  note?: string;
};

const SIGNALS = [
  {
    key: 'existence' as const,
    step: '1',
    title: '¿Qué evidencia reciente existe?',
    hint: 'Pensá en los últimos tres meses, no en intenciones o planes futuros.',
    options: [
      { value: 0, label: 'No encuentro un caso', short: 'Sin evidencia' },
      { value: 1, label: 'Hay un caso puntual', short: 'Un ejemplo' },
      { value: 2, label: 'Hay varios casos verificables', short: 'Varios ejemplos' },
    ],
  },
  {
    key: 'reach' as const,
    step: '2',
    title: '¿Hasta dónde llega la práctica?',
    hint: 'Respondé por la realidad predominante, no por el mejor equipo.',
    options: [
      { value: 0, label: 'No ocurre', short: 'No existe' },
      { value: 1, label: 'Un proyecto o equipo', short: 'Aislada' },
      { value: 2, label: 'Varios equipos', short: 'Parcial' },
      { value: 3, label: 'Toda la agencia', short: 'Transversal' },
    ],
  },
  {
    key: 'continuity' as const,
    step: '3',
    title: '¿Qué tan sostenida está?',
    hint: 'Buscá repetición, responsable, seguimiento y una forma de trabajo reconocible.',
    options: [
      { value: 0, label: 'Fue una acción aislada', short: 'Puntual' },
      { value: 1, label: 'Se repite de forma informal', short: 'Irregular' },
      { value: 2, label: 'Tiene frecuencia y responsable', short: 'Sostenida' },
      { value: 3, label: 'Se mide, revisa y mejora', short: 'Sistemática' },
    ],
  },
  {
    key: 'impact' as const,
    step: '4',
    title: '¿Para qué se usa?',
    hint: 'La evidencia vale más cuando cambia una decisión, un proceso o un resultado.',
    options: [
      { value: 0, label: 'No influye en decisiones', short: 'Sin uso' },
      { value: 1, label: 'A veces orienta ajustes', short: 'Uso ocasional' },
      { value: 2, label: 'Se usa sistemáticamente para decidir', short: 'Uso real' },
    ],
  },
];

const EVIDENCE_REFERENCE = [
  ['E', 'Ejemplo', 'Un caso concreto'],
  ['V', 'Vigencia', 'Ocurrió recientemente'],
  ['I', 'Instalación', 'No es solo una intención'],
  ['D', 'Dueño', 'Alguien la sostiene'],
  ['E', 'Extensión', 'Representa a la agencia'],
  ['N', 'Nivel', 'La escala coincide'],
  ['C', 'Continuidad', 'Se repite y se sigue'],
  ['I', 'Impacto', 'Cambia decisiones'],
  ['A', 'Anotación', 'Queda contexto registrado'],
] as const;

export function evidenceSuggestion(signals: EvidenceSignals) {
  const complete = SIGNALS.every((signal) => typeof signals[signal.key] === 'number');
  if (!complete) return null;

  const existence = Number(signals.existence || 0);
  const reach = Number(signals.reach || 0);
  const continuity = Number(signals.continuity || 0);
  const impact = Number(signals.impact || 0);
  const total = existence + reach + continuity + impact;

  let score = 1;
  if (total >= 9 && existence === 2 && reach === 3 && continuity === 3 && impact === 2) score = 5;
  else if (total >= 7 && reach >= 2 && continuity >= 2) score = 4;
  else if (total >= 4 && existence >= 1 && reach >= 1) score = 3;
  else if (total >= 2) score = 2;

  const option = SCALE_OPTIONS.find((item) => item.value === score)!;
  const rationale = score === 5
    ? 'La práctica es transversal, sistemática, verificable y se usa para decidir.'
    : score === 4
      ? 'La práctica se repite y tiene estructura, aunque todavía no está completamente integrada.'
      : score === 3
        ? 'Existe una práctica reconocible, pero aún necesita mayor alcance, continuidad o impacto.'
        : score === 2
          ? 'Hay señales o casos concretos, pero siguen siendo parciales, irregulares o poco utilizados.'
          : 'No aparece evidencia reciente suficiente para afirmar que la práctica existe.';

  return { score, label: option.shortLabel, rationale };
}

export function EvidenceCoach({
  questionId,
  signals,
  selectedScore,
  observation,
  agencyExample,
  onChange,
  onApply,
}: {
  questionId: string;
  signals: EvidenceSignals;
  selectedScore?: number;
  observation?: string;
  agencyExample?: string;
  onChange: (next: EvidenceSignals) => void;
  onApply: (score: number) => void;
}) {
  const suggestion = evidenceSuggestion(signals);
  const mismatch = suggestion && selectedScore && Math.abs(suggestion.score - selectedScore) >= 2;

  return (
    <div className="evidence-coach" id={`evidence-${questionId}`}>
      <div className="evidence-coach-head">
        <div>
          <span className="evidence-coach-kicker">Asistente E.V.I.D.E.N.C.I.A.</span>
          <h4>No memorices el acrónimo: respondé estas cuatro preguntas</h4>
          <p>La herramienta traduce tu evidencia en una sugerencia de nivel. La decisión final sigue siendo tuya.</p>
        </div>
        <div className="evidence-coach-formula"><span>Existe</span><i>+</i><span>Se extiende</span><i>+</i><span>Se sostiene</span><i>+</i><span>Se usa</span></div>
      </div>

      <div className="evidence-coach-steps">
        {SIGNALS.map((signal) => (
          <fieldset key={signal.key} className={typeof signals[signal.key] === 'number' ? 'evidence-signal complete' : 'evidence-signal'}>
            <legend><span>{signal.step}</span><div><strong>{signal.title}</strong><small>{signal.hint}</small></div></legend>
            <div className="evidence-signal-options">
              {signal.options.map((option) => (
                <label key={option.value} className={signals[signal.key] === option.value ? 'selected' : ''}>
                  <input
                    type="radio"
                    name={`${questionId}-${signal.key}`}
                    checked={signals[signal.key] === option.value}
                    onChange={() => onChange({ ...signals, [signal.key]: option.value })}
                  />
                  <span>{option.short}</span>
                  <small>{option.label}</small>
                  <i>✓</i>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="evidence-coach-support">
        <article><strong>Qué observar en esta pregunta</strong><p>{observation || 'Buscá ejemplos recientes, responsables, recurrencia y decisiones que demuestren la práctica.'}</p></article>
        <article><strong>Ejemplo aplicado a una agencia</strong><p>{agencyExample || 'Identificá un caso concreto y verificá si representa a toda la agencia o solo a una excepción.'}</p></article>
      </div>

      <label className="evidence-note-field">
        <span>Evidencia o excepción que querés dejar registrada <em>Opcional</em></span>
        <textarea
          rows={2}
          value={signals.note || ''}
          onChange={(event) => onChange({ ...signals, note: event.target.value })}
          placeholder="Ej.: se aplica en 3 de 8 cuentas; responsable: Dirección de Estrategia; revisión mensual."
        />
      </label>

      {suggestion ? (
        <div className={mismatch ? 'evidence-suggestion mismatch' : 'evidence-suggestion'}>
          <div className="evidence-suggestion-score"><span>{suggestion.score}</span><small>{suggestion.label}</small></div>
          <div><strong>Nivel sugerido por la evidencia</strong><p>{suggestion.rationale}</p>{mismatch ? <em>Tu respuesta actual está bastante alejada de la evidencia marcada. Revisala o anotá la excepción.</em> : null}</div>
          <button type="button" className="button button-primary button-small" onClick={() => onApply(suggestion.score)}>Usar nivel {suggestion.score}</button>
        </div>
      ) : (
        <div className="evidence-suggestion pending"><span>1–4</span><div><strong>Completá las cuatro señales</strong><p>Al terminar vas a recibir una sugerencia de nivel y una explicación.</p></div></div>
      )}

      <details className="evidence-reference">
        <summary>Ver qué significa cada letra de E.V.I.D.E.N.C.I.A.</summary>
        <div>{EVIDENCE_REFERENCE.map(([letter, label, copy], index) => <article key={`${letter}-${index}`}><span>{letter}</span><strong>{label}</strong><small>{copy}</small></article>)}</div>
      </details>
    </div>
  );
}
