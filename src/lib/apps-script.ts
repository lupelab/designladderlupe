import { AssessmentRecord, DimensionKey, DimensionScore } from '@/lib/types';
import { DIMENSIONS, QUESTIONS } from '@/lib/questionnaire';
import { buildScoringResult, calculateOverallScore, getLadderStep, getMaturityLevelFromStep } from '@/lib/scoring';

function getEnv() {
  const url = process.env.GSCRIPT_URL;
  const token = process.env.GSCRIPT_TOKEN;

  if (!url) throw new Error('Missing GSCRIPT_URL');
  if (!token) throw new Error('Missing GSCRIPT_TOKEN');

  return { url, token };
}

function hasNewQuestionAnswers(item: Partial<AssessmentRecord>) {
  const answers = item.answers || {};
  return QUESTIONS.some((question) => typeof answers[question.id] === 'number');
}

function hasValidNewDimensionScores(scores: unknown): scores is DimensionScore {
  if (!scores || typeof scores !== 'object') return false;
  const record = scores as Record<string, unknown>;
  return DIMENSIONS.every((dimension) => typeof record[dimension] === 'number' && Number.isFinite(record[dimension]));
}

function onlyNewDimensionScores(scores: DimensionScore): DimensionScore {
  return DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = Number(scores[dimension] ?? 0);
    return acc;
  }, {} as DimensionScore);
}

function averageExisting(values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (!valid.length) return 0;
  return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(2));
}

function legacyDimensionScoresToNew(rawScores: Record<string, unknown>, fallbackOverall = 0): DimensionScore {
  const value = (key: string) => {
    const numeric = Number(rawScores?.[key]);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
  };

  const fallback = Number.isFinite(Number(fallbackOverall)) && Number(fallbackOverall) > 0 ? Number(fallbackOverall) : undefined;

  return {
    visionary: averageExisting([value('strategy'), fallback]),
    inspirational: averageExisting([value('craft'), value('operations'), fallback]),
    relational: averageExisting([value('process'), value('operations'), fallback]),
    identity: averageExisting([value('strategy'), value('research'), fallback]),
    adoption: averageExisting([value('process'), value('craft'), fallback]),
    innovation: averageExisting([value('research'), value('process'), fallback]),
  };
}

export function normalizeAssessmentRecord(item: AssessmentRecord): AssessmentRecord {
  if (hasNewQuestionAnswers(item)) {
    const scoring = buildScoringResult(item.answers || {});
    return {
      ...item,
      dimensionScores: scoring.dimensionScores,
      overallScore: scoring.overallScore,
      maturityLevel: scoring.maturityLevel,
      ladderStep: scoring.ladderStep,
    };
  }

  if (hasValidNewDimensionScores(item.dimensionScores)) {
    const normalizedScores = onlyNewDimensionScores(item.dimensionScores);
    const overallScore = Number(item.overallScore) || calculateOverallScore(normalizedScores);
    const ladderStep = item.ladderStep || getLadderStep(normalizedScores, overallScore);
    return {
      ...item,
      dimensionScores: normalizedScores,
      overallScore,
      ladderStep,
      maturityLevel: item.maturityLevel || getMaturityLevelFromStep(ladderStep),
    };
  }

  const migratedScores = legacyDimensionScoresToNew((item.dimensionScores || {}) as Record<string, unknown>, Number(item.overallScore || 0));
  const overallScore = calculateOverallScore(migratedScores);
  const ladderStep = getLadderStep(migratedScores, overallScore);

  return {
    ...item,
    dimensionScores: migratedScores,
    overallScore,
    ladderStep,
    maturityLevel: getMaturityLevelFromStep(ladderStep),
  };
}

async function callAppsScript<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const { url, token } = getEnv();

  const response = await fetch(`${url}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-gscript-token': token,
    },
    body: JSON.stringify({
      action,
      token,
      ...(payload || {}),
    }),
  });

  const text = await response.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Apps Script respondió algo no JSON: ${text.slice(0, 180)}`);
  }

  if (!response.ok || json?.ok === false) {
    throw new Error(json?.error || 'No se pudo completar la operación con Apps Script.');
  }

  return json;
}

export async function createAssessment(item: AssessmentRecord) {
  return callAppsScript<{ ok: true; item: AssessmentRecord }>('createAssessment', {
    userId: item.userId,
    agency: item.agency,
    item,
  });
}

export async function listAssessments(agency?: string) {
  const data = await callAppsScript<{ ok: true; items: AssessmentRecord[] }>('listAssessments', agency ? { agency } : {});
  return {
    ...data,
    items: (data.items || []).map(normalizeAssessmentRecord),
  };
}

export async function getAssessmentById(id: string) {
  const data = await callAppsScript<{ ok: true; item: AssessmentRecord | null }>('getAssessment', { id });
  return data.item ? normalizeAssessmentRecord(data.item) : null;
}
export async function getTexoBenchmark() {
  const scriptUrl = process.env.GSCRIPT_URL;
  const token = process.env.GSCRIPT_TOKEN;

  if (!scriptUrl) {
    throw new Error('Missing GSCRIPT_URL');
  }

  if (!token) {
    throw new Error('Missing GSCRIPT_TOKEN');
  }

  const url = new URL(scriptUrl);
  url.searchParams.set('action', 'getTexoBenchmark');
  url.searchParams.set('token', token);

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Error loading TEXO benchmark');
  }

  return data.benchmark || null;
}