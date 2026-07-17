import {
  ActionItem,
  ActionPhase,
  ActionStatus,
  AssessmentRecord,
  DimensionKey,
  DimensionScore,
  ConsistencyReading,
  ScaleSuggestion,
} from '@/lib/types';
import { DIMENSION_LABELS, QUESTIONS } from '@/lib/questionnaire';
import { getTopPriorities } from '@/lib/recommendations';
import { getLadderStep } from '@/lib/scoring';

export const ACTION_PHASES: ActionPhase[] = ['Entender', 'Priorizar', 'Implementar', 'Medir', 'Escalar'];
export const ACTION_STATUSES: ActionStatus[] = ['Pendiente', 'En curso', 'Bloqueada', 'Completada', 'Descartada'];

export const PHASE_DESCRIPTIONS: Record<ActionPhase, string> = {
  Entender: 'Alinear el problema, revisar evidencia y bajar la subjetividad antes de decidir.',
  Priorizar: 'Elegir pocas acciones de alto impacto y asignar responsable, fecha y criterio de éxito.',
  Implementar: 'Ejecutar el piloto, ritual o cambio de proceso con evidencia mínima documentada.',
  Medir: 'Revisar si la acción generó aprendizaje, adopción o cambio observable en la agencia.',
  Escalar: 'Convertir lo que funcionó en una práctica estable, repetible y conocida por el equipo.',
};

export function createActionId() {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyActionItem(agency: string, assessmentId?: string): ActionItem {
  const now = new Date().toISOString();

  return {
    id: createActionId(),
    agency: agency as ActionItem['agency'],
    assessmentId,
    dimension: 'general',
    title: '',
    description: '',
    phase: 'Priorizar',
    ownerName: '',
    ownerEmail: '',
    status: 'Pendiente',
    priority: 'Alta',
    impact: 'Alto',
    effort: 'Medio',
    dueDate: '',
    nextReviewDate: '',
    successMetric: '',
    evidence: '',
    comments: '',
    source: 'Manual',
    createdAt: now,
    updatedAt: now,
  };
}

export function buildSuggestedActionsFromAssessment(item: AssessmentRecord): ActionItem[] {
  const ladderStep = item.ladderStep || getLadderStep(item.dimensionScores, item.overallScore);
  const priorities = getTopPriorities(item.dimensionScores, ladderStep).slice(0, 3);
  const now = new Date();

  return priorities.map((priority, index) => {
    const createdAt = now.toISOString();
    const due = new Date(now);
    due.setDate(due.getDate() + (index + 1) * 30);

    return {
      id: createActionId(),
      agency: item.agency,
      assessmentId: item.id,
      dimension: priority.dimension,
      title: priority.headline,
      description: `Acción derivada del diagnóstico para fortalecer ${priority.label}. Debe ejecutarse con foco en cultura de innovación y diseño centrado en las personas.`,
      phase: 'Priorizar',
      ownerName: '',
      ownerEmail: '',
      status: 'Pendiente',
      priority: priority.priority,
      impact: 'Alto',
      effort: priority.priority === 'Alta' ? 'Medio' : 'Bajo',
      dueDate: due.toISOString().slice(0, 10),
      nextReviewDate: '',
      successMetric: 'Evidencia documentada de implementación, aprendizaje o adopción por parte del equipo.',
      evidence: '',
      comments: '',
      source: 'Recomendación automática',
      createdAt,
      updatedAt: createdAt,
    } as ActionItem;
  });
}

export function getRelatedQuestions(dimension?: ActionItem['dimension']) {
  if (!dimension || dimension === 'general') return [];
  return QUESTIONS.filter((question) => question.dimension === dimension).map((question) => ({
    id: question.id,
    title: question.title,
    principleName: question.principleName,
  }));
}

export function getActionStats(actions: ActionItem[]) {
  const active = actions.filter((action) => action.status !== 'Descartada');
  const completed = active.filter((action) => action.status === 'Completada').length;
  const blocked = active.filter((action) => action.status === 'Bloqueada').length;
  const overdue = active.filter((action) => isOverdue(action)).length;
  const progress = active.length ? Math.round((completed / active.length) * 100) : 0;

  return {
    total: active.length,
    completed,
    blocked,
    overdue,
    progress,
  };
}

export function isOverdue(action: ActionItem) {
  if (!action.dueDate || action.status === 'Completada' || action.status === 'Descartada') return false;
  const due = new Date(`${action.dueDate}T23:59:59`);
  return due.getTime() < Date.now();
}

export function consistencyReading(action: ActionItem): ConsistencyReading {
  const checklist = [
    { label: 'Tiene responsable asignado', done: Boolean(action.ownerName?.trim()) },
    { label: 'Tiene fecha límite o próxima revisión', done: Boolean(action.dueDate || action.nextReviewDate) },
    { label: 'Tiene criterio de éxito o métrica', done: Boolean(action.successMetric?.trim()) },
    { label: 'Tiene evidencia o aprendizaje documentado', done: Boolean(action.evidence?.trim() || action.comments?.trim()) },
    { label: 'La acción está completada o en medición/escalamiento', done: action.status === 'Completada' || action.phase === 'Medir' || action.phase === 'Escalar' },
  ];

  const score = checklist.filter((item) => item.done).length;
  let label: ConsistencyReading['label'] = 'Inicial';
  let suggestedScale: ScaleSuggestion = 'A veces';
  let rationale = 'Todavía hay poca evidencia para afirmar que la práctica está instalada.';

  if (score >= 4) {
    label = 'Sistemático';
    suggestedScale = 'Siempre';
    rationale = 'Hay responsable, evidencia, criterio de éxito y señales de instalación como práctica repetible.';
  } else if (score === 3) {
    label = 'Consistente';
    suggestedScale = 'Frecuente';
    rationale = 'Hay suficiente evidencia para marcar avance frecuente, siempre que la práctica se haya repetido en más de un caso.';
  } else if (score === 2) {
    label = 'En instalación';
    suggestedScale = 'En desarrollo';
    rationale = 'La acción ya tiene estructura mínima, pero aún necesita evidencia o repetición para considerarse frecuente.';
  } else if (score === 1) {
    label = 'Inicial';
    suggestedScale = 'A veces';
    rationale = 'La práctica aparece de forma puntual o dependiente de una persona, todavía no como sistema.';
  }

  return { score, label, suggestedScale, rationale, checklist };
}

export function suggestedScaleFromDimensionProgress(
  dimension: DimensionKey,
  scores: DimensionScore,
  actions: ActionItem[]
): ScaleSuggestion {
  const related = actions.filter((action) => action.dimension === dimension && action.status !== 'Descartada');
  if (!related.length) {
    const current = scores[dimension] || 0;
    if (current >= 4.25) return 'Siempre';
    if (current >= 3.5) return 'Frecuente';
    if (current >= 2.5) return 'En desarrollo';
    if (current >= 1.5) return 'A veces';
    return 'Nunca';
  }

  const avgConsistency = related.reduce((sum, action) => sum + consistencyReading(action).score, 0) / related.length;
  if (avgConsistency >= 4) return 'Siempre';
  if (avgConsistency >= 3) return 'Frecuente';
  if (avgConsistency >= 2) return 'En desarrollo';
  return 'A veces';
}

export function dimensionActionSummary(dimension: DimensionKey, actions: ActionItem[]) {
  const related = actions.filter((action) => action.dimension === dimension && action.status !== 'Descartada');
  const completed = related.filter((action) => action.status === 'Completada').length;
  const active = related.filter((action) => action.status === 'En curso' || action.status === 'Pendiente').length;
  const blocked = related.filter((action) => action.status === 'Bloqueada').length;

  return {
    label: DIMENSION_LABELS[dimension],
    total: related.length,
    completed,
    active,
    blocked,
  };
}
