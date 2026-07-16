import { getSupabaseAdmin } from '@/lib/supabase-server';
import {
  ActionItem,
  AssessmentRecord,
  DimensionKey,
  DimensionScore,
  HoldingBenchmark,
} from '@/lib/types';
import { DIMENSIONS, QUESTIONS, SCALE_OPTIONS } from '@/lib/questionnaire';
import {
  buildScoringResult,
  calculateOverallScore,
  getLadderStep,
  getMaturityLevelFromStep,
} from '@/lib/scoring';

type SafeLadderStep = NonNullable<AssessmentRecord['ladderStep']>;

type AgencyRow = {
  name?: string;
  slug?: string;
};

type AssessmentAnswerRow = {
  question_id: string;
  score: number;
  answer_label?: string;
};

type DimensionScoreRow = {
  dimension: DimensionKey;
  score: number | string;
};

type AssessmentRow = {
  id: string;
  agency_id: string;
  respondent_name: string;
  respondent_email: string | null;
  notes: string | null;
  overall_score: number | string;
  maturity_level: AssessmentRecord['maturityLevel'] | null;
  ladder_step: number | null;
  raw_payload: any;
  created_at: string;
  updated_at: string;
  agencies?: AgencyRow | AgencyRow[];
  assessment_answers?: AssessmentAnswerRow[];
  dimension_scores?: DimensionScoreRow[];
};

type ActionItemRow = {
  id: string;
  agency_id: string;
  assessment_id: string | null;
  question_id: string | null;
  dimension: DimensionKey | null;
  title: string;
  description: string | null;
  phase: ActionItem['phase'];
  status: ActionItem['status'];
  priority: ActionItem['priority'];
  impact: ActionItem['impact'];
  effort: ActionItem['effort'];
  owner_name: string | null;
  owner_email: string | null;
  due_date: string | null;
  completed_at: string | null;
  evidence_summary: string | null;
  source: ActionItem['source'];
  created_at: string;
  updated_at: string;
  agencies?: AgencyRow | AgencyRow[];
};

function normalizeAgencyName(agency?: string) {
  return String(agency || '').trim().toUpperCase();
}

function normalizeAgencySlug(agency?: string) {
  return String(agency || '').trim().toLowerCase();
}

function toSafeLadderStep(value: unknown): SafeLadderStep {
  const numeric = Number(value);

  if (numeric === 1 || numeric === 2 || numeric === 3 || numeric === 4) {
    return numeric as SafeLadderStep;
  }

  return 1 as SafeLadderStep;
}

function isUuid(value?: string | null) {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getAgencyFromRow(row: AssessmentRow) {
  const agencyRelation = Array.isArray(row.agencies)
    ? row.agencies[0]
    : row.agencies;

  return normalizeAgencyName(
    agencyRelation?.name || row.raw_payload?.agency || row.raw_payload?.userId
  );
}

function getAgencyFromActionRow(row: ActionItemRow) {
  const agencyRelation = Array.isArray(row.agencies)
    ? row.agencies[0]
    : row.agencies;

  return normalizeAgencyName(agencyRelation?.name);
}

function answerLabel(score: number) {
  return (
    SCALE_OPTIONS.find((option) => option.value === score)?.shortLabel ||
    String(score)
  );
}

function hasNewQuestionAnswers(item: Partial<AssessmentRecord>) {
  const answers = item.answers || {};

  return QUESTIONS.some((question) => typeof answers[question.id] === 'number');
}

function hasValidNewDimensionScores(scores: unknown): scores is DimensionScore {
  if (!scores || typeof scores !== 'object') return false;

  const record = scores as Record<string, unknown>;

  return DIMENSIONS.every(
    (dimension) =>
      typeof record[dimension] === 'number' &&
      Number.isFinite(record[dimension])
  );
}

function onlyNewDimensionScores(scores: DimensionScore): DimensionScore {
  return DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = Number(scores[dimension] ?? 0);
    return acc;
  }, {} as DimensionScore);
}

function averageExisting(values: Array<number | undefined>) {
  const valid = values.filter(
    (value): value is number =>
      typeof value === 'number' && Number.isFinite(value)
  );

  if (!valid.length) return 0;

  return Number(
    (valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(2)
  );
}

function legacyDimensionScoresToNew(
  rawScores: Record<string, unknown>,
  fallbackOverall = 0
): DimensionScore {
  const value = (key: string) => {
    const numeric = Number(rawScores?.[key]);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
  };

  const fallback =
    Number.isFinite(Number(fallbackOverall)) && Number(fallbackOverall) > 0
      ? Number(fallbackOverall)
      : undefined;

  return {
    visionary: averageExisting([value('strategy'), fallback]),
    inspirational: averageExisting([
      value('craft'),
      value('operations'),
      fallback,
    ]),
    relational: averageExisting([
      value('process'),
      value('operations'),
      fallback,
    ]),
    identity: averageExisting([
      value('strategy'),
      value('research'),
      fallback,
    ]),
    adoption: averageExisting([
      value('process'),
      value('craft'),
      fallback,
    ]),
    innovation: averageExisting([
      value('research'),
      value('process'),
      fallback,
    ]),
  };
}

export function normalizeAssessmentRecord(
  item: AssessmentRecord
): AssessmentRecord {
  if (hasNewQuestionAnswers(item)) {
    const scoring = buildScoringResult(item.answers || {});
    const safeLadderStep = toSafeLadderStep(scoring.ladderStep);

    return {
      ...item,
      dimensionScores: scoring.dimensionScores,
      overallScore: scoring.overallScore,
      maturityLevel: scoring.maturityLevel,
      ladderStep: safeLadderStep,
    };
  }

  if (hasValidNewDimensionScores(item.dimensionScores)) {
    const normalizedScores = onlyNewDimensionScores(item.dimensionScores);
    const overallScore =
      Number(item.overallScore) || calculateOverallScore(normalizedScores);

    const safeLadderStep = toSafeLadderStep(
      item.ladderStep || getLadderStep(normalizedScores, overallScore)
    );

    return {
      ...item,
      dimensionScores: normalizedScores,
      overallScore,
      ladderStep: safeLadderStep,
      maturityLevel:
        item.maturityLevel || getMaturityLevelFromStep(safeLadderStep),
    };
  }

  const migratedScores = legacyDimensionScoresToNew(
    (item.dimensionScores || {}) as Record<string, unknown>,
    Number(item.overallScore || 0)
  );

  const overallScore = calculateOverallScore(migratedScores);
  const safeLadderStep = toSafeLadderStep(
    getLadderStep(migratedScores, overallScore)
  );

  return {
    ...item,
    dimensionScores: migratedScores,
    overallScore,
    ladderStep: safeLadderStep,
    maturityLevel: getMaturityLevelFromStep(safeLadderStep),
  };
}

async function getAgencyId(agencyName: string) {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeAgencyName(agencyName);
  const slug = normalizeAgencySlug(agencyName);

  const { data, error } = await supabase
    .from('agencies')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Error buscando agencia en Supabase: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error(
      `No se encontró la agencia en Supabase: ${normalized}. Revisá que exista el slug "${slug}" en la tabla agencies.`
    );
  }

  return data.id as string;
}

function rowToAssessment(row: AssessmentRow): AssessmentRecord {
  const raw = row.raw_payload || {};
  const agencyName = getAgencyFromRow(row);

  const answersFromRows = Object.fromEntries(
    (row.assessment_answers || []).map((answer) => [
      answer.question_id,
      Number(answer.score),
    ])
  );

  const dimensionScoresFromRows = (row.dimension_scores || []).reduce(
    (acc, item) => {
      acc[item.dimension] = Number(item.score || 0);
      return acc;
    },
    {} as DimensionScore
  );

  const fallbackScores =
    raw.dimensionScores && typeof raw.dimensionScores === 'object'
      ? raw.dimensionScores
      : {};

  const dimensionScores = hasValidNewDimensionScores(dimensionScoresFromRows)
    ? dimensionScoresFromRows
    : hasValidNewDimensionScores(fallbackScores)
      ? fallbackScores
      : legacyDimensionScoresToNew(
          fallbackScores,
          Number(row.overall_score || 0)
        );

  const overallScore =
    Number(row.overall_score) || calculateOverallScore(dimensionScores);

  const safeLadderStep = toSafeLadderStep(
    row.ladder_step || getLadderStep(dimensionScores, overallScore)
  );

  return normalizeAssessmentRecord({
    id: row.id,
    userId: agencyName,
    agency: agencyName as AssessmentRecord['agency'],
    respondentName: row.respondent_name || raw.respondentName || '',
    respondentEmail: row.respondent_email || raw.respondentEmail || undefined,
    notes: row.notes || raw.notes || undefined,
    createdAt: row.created_at || raw.createdAt || '',
    updatedAt: row.updated_at || raw.updatedAt || '',
    answers:
      Object.keys(answersFromRows).length > 0
        ? answersFromRows
        : raw.answers || {},
    dimensionScores,
    overallScore,
    maturityLevel:
      row.maturity_level ||
      raw.maturityLevel ||
      getMaturityLevelFromStep(safeLadderStep),
    ladderStep: safeLadderStep,
  });
}

function rowToActionItem(row: ActionItemRow): ActionItem {
  const agencyName = getAgencyFromActionRow(row);

  return {
    id: row.id,
    agency: agencyName as ActionItem['agency'],
    assessmentId: row.assessment_id || undefined,
    dimension: (row.dimension || 'general') as ActionItem['dimension'],
    title: row.title || '',
    description: row.description || '',
    phase: row.phase,
    ownerName: row.owner_name || '',
    ownerEmail: row.owner_email || undefined,
    status: row.status,
    priority: row.priority,
    impact: row.impact,
    effort: row.effort,
    dueDate: row.due_date || undefined,
    nextReviewDate: undefined,
    successMetric: '',
    evidence: row.evidence_summary || '',
    comments: '',
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function actionDimensionToDb(dimension?: ActionItem['dimension']) {
  if (!dimension || dimension === 'general') return null;
  return dimension;
}

function actionEvidenceSummary(item: ActionItem) {
  const parts = [
    item.successMetric ? `Criterio de éxito: ${item.successMetric}` : '',
    item.evidence ? `Evidencia: ${item.evidence}` : '',
    item.comments ? `Comentarios: ${item.comments}` : '',
    item.nextReviewDate ? `Próxima revisión: ${item.nextReviewDate}` : '',
  ].filter(Boolean);

  return parts.join('\n\n') || null;
}

export async function createAssessment(item: AssessmentRecord) {
  const supabase = getSupabaseAdmin();
  const agencyName = normalizeAgencyName(item.agency);
  const agencyId = await getAgencyId(agencyName);

  const scoring = buildScoringResult(item.answers || {});
  const safeLadderStep = toSafeLadderStep(scoring.ladderStep);
  const now = new Date().toISOString();

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      agency_id: agencyId,
      respondent_name: item.respondentName,
      respondent_email: item.respondentEmail || null,
      notes: item.notes || null,
      overall_score: scoring.overallScore,
      maturity_level: scoring.maturityLevel,
      ladder_step: safeLadderStep,
      raw_payload: {
        ...item,
        agency: agencyName,
        overallScore: scoring.overallScore,
        maturityLevel: scoring.maturityLevel,
        ladderStep: safeLadderStep,
        dimensionScores: scoring.dimensionScores,
        createdAt: item.createdAt || now,
        updatedAt: now,
      },
    })
    .select('*')
    .single();

  if (assessmentError || !assessment) {
    throw new Error(
      assessmentError?.message ||
        'No se pudo guardar la evaluación en Supabase.'
    );
  }

  const answersPayload = QUESTIONS.map((question) => {
    const score = Number(item.answers?.[question.id] || 0);

    return {
      assessment_id: assessment.id,
      question_id: question.id,
      dimension: question.dimension,
      score,
      answer_label: answerLabel(score),
    };
  }).filter((answer) => answer.score >= 1 && answer.score <= 5);

  if (answersPayload.length) {
    const { error: answersError } = await supabase
      .from('assessment_answers')
      .insert(answersPayload);

    if (answersError) {
      throw new Error(
        answersError.message || 'No se pudieron guardar las respuestas.'
      );
    }
  }

  const dimensionsPayload = DIMENSIONS.map((dimension) => ({
    assessment_id: assessment.id,
    dimension,
    score: scoring.dimensionScores[dimension],
  }));

  const { error: dimensionsError } = await supabase
    .from('dimension_scores')
    .insert(dimensionsPayload);

  if (dimensionsError) {
    throw new Error(
      dimensionsError.message ||
        'No se pudieron guardar los scores por dimensión.'
    );
  }

  const savedItem: AssessmentRecord = {
    id: assessment.id,
    userId: agencyName,
    agency: agencyName as AssessmentRecord['agency'],
    respondentName: item.respondentName,
    respondentEmail: item.respondentEmail,
    notes: item.notes,
    createdAt: assessment.created_at,
    updatedAt: assessment.updated_at,
    answers: item.answers,
    dimensionScores: scoring.dimensionScores,
    overallScore: scoring.overallScore,
    maturityLevel: scoring.maturityLevel,
    ladderStep: safeLadderStep,
  };

  return {
    ok: true as const,
    item: savedItem,
  };
}

export async function listAssessments(agency?: string) {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('assessments')
    .select(`
      *,
      agencies!inner(name, slug),
      assessment_answers(question_id, score, answer_label),
      dimension_scores(dimension, score)
    `)
    .order('created_at', { ascending: false });

  if (agency) {
    query = query.eq('agencies.slug', normalizeAgencySlug(agency));
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'No se pudieron listar las evaluaciones.');
  }

  return {
    ok: true as const,
    items: ((data || []) as unknown as AssessmentRow[]).map(rowToAssessment),
  };
}

export async function getAssessmentById(id: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      agencies!inner(name, slug),
      assessment_answers(question_id, score, answer_label),
      dimension_scores(dimension, score)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return rowToAssessment(data as unknown as AssessmentRow);
}

export async function getTexoBenchmark(): Promise<HoldingBenchmark | null> {
  const supabase = getSupabaseAdmin();

  const { data: overall, error: overallError } = await supabase
    .from('v_texo_benchmark_overall')
    .select('*')
    .single();

  if (overallError) {
    throw new Error(
      overallError.message || 'No se pudo cargar el benchmark general TEXO.'
    );
  }

  const { data: dimensions, error: dimensionsError } = await supabase
    .from('v_texo_benchmark_dimensions')
    .select('*');

  if (dimensionsError) {
    throw new Error(
      dimensionsError.message || 'No se pudo cargar el benchmark por dimensión.'
    );
  }

  const overallScore = Number(overall?.overall_score || 0);

  const dimensionScores = DIMENSIONS.reduce((acc, dimension) => {
    const row = (dimensions || []).find(
      (item: any) => item.dimension === dimension
    );

    acc[dimension] = Number(row?.score || 0);
    return acc;
  }, {} as DimensionScore);

  if (!overallScore && Object.values(dimensionScores).every((score) => !score)) {
    return null;
  }

  const safeLadderStep = toSafeLadderStep(
    getLadderStep(dimensionScores, overallScore)
  );

  return {
    overallScore,
    ladderStep: safeLadderStep,
    maturityLevel: getMaturityLevelFromStep(safeLadderStep),
    dimensionScores,
    narrative:
      'Benchmark agencias TEXO calculado con la última evaluación disponible de cada agencia activa del holding. No incluye evaluaciones cargadas como TEXO ni pruebas.',
  };
}

export async function createActionItem(item: ActionItem) {
  const supabase = getSupabaseAdmin();
  const agencyName = normalizeAgencyName(item.agency);
  const agencyId = await getAgencyId(agencyName);

  const { data, error } = await supabase
    .from('action_items')
    .insert({
      agency_id: agencyId,
      assessment_id: isUuid(item.assessmentId) ? item.assessmentId : null,
      question_id: null,
      dimension: actionDimensionToDb(item.dimension),
      title: item.title,
      description: item.description || null,
      phase: item.phase,
      status: item.status,
      priority: item.priority,
      impact: item.impact,
      effort: item.effort,
      owner_name: item.ownerName || null,
      owner_email: item.ownerEmail || null,
      due_date: item.dueDate || null,
      evidence_summary: actionEvidenceSummary(item),
      source: item.source || 'Manual',
    })
    .select(`
      *,
      agencies!inner(name, slug)
    `)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'No se pudo crear la acción.');
  }

  return {
    ok: true as const,
    item: rowToActionItem(data as unknown as ActionItemRow),
  };
}

export async function listActionItems(agency?: string) {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('action_items')
    .select(`
      *,
      agencies!inner(name, slug)
    `)
    .order('created_at', { ascending: false });

  if (agency) {
    query = query.eq('agencies.slug', normalizeAgencySlug(agency));
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'No se pudieron listar las acciones.');
  }

  return {
    ok: true as const,
    items: ((data || []) as unknown as ActionItemRow[]).map(rowToActionItem),
  };
}

export async function getActionItemById(id: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('action_items')
    .select(`
      *,
      agencies!inner(name, slug)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return rowToActionItem(data as unknown as ActionItemRow);
}

export async function updateActionItem(item: ActionItem) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('action_items')
    .update({
      assessment_id: isUuid(item.assessmentId) ? item.assessmentId : null,
      question_id: null,
      dimension: actionDimensionToDb(item.dimension),
      title: item.title,
      description: item.description || null,
      phase: item.phase,
      status: item.status,
      priority: item.priority,
      impact: item.impact,
      effort: item.effort,
      owner_name: item.ownerName || null,
      owner_email: item.ownerEmail || null,
      due_date: item.dueDate || null,
      completed_at:
        item.status === 'Completada' ? new Date().toISOString() : null,
      evidence_summary: actionEvidenceSummary(item),
      source: item.source || 'Manual',
    })
    .eq('id', item.id)
    .select(`
      *,
      agencies!inner(name, slug)
    `)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'No se pudo actualizar la acción.');
  }

  return {
    ok: true as const,
    item: rowToActionItem(data as unknown as ActionItemRow),
  };
}