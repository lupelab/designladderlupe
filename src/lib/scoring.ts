import { AssessmentAnswer, DimensionKey, DimensionScore, LadderStep, ScoringResult } from '@/lib/types';
import { DIMENSIONS, DIMENSION_LABELS, DIMENSION_WEIGHTS, QUESTIONS } from '@/lib/questionnaire';

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function calculateDimensionScores(answers: AssessmentAnswer): DimensionScore {
  const sums = Object.fromEntries(DIMENSIONS.map((d) => [d, 0])) as Record<DimensionKey, number>;
  const weights = Object.fromEntries(DIMENSIONS.map((d) => [d, 0])) as Record<DimensionKey, number>;

  for (const question of QUESTIONS) {
    const answer = Number(answers[question.id] ?? 0);
    const qWeight = question.weight ?? 1;
    if (answer > 0) {
      sums[question.dimension] += answer * qWeight;
      weights[question.dimension] += qWeight;
    }
  }

  return DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = weights[dimension] ? round(sums[dimension] / weights[dimension]) : 0;
    return acc;
  }, {} as DimensionScore);
}

export function calculateOverallScore(dimensionScores: DimensionScore): number {
  const total = DIMENSIONS.reduce((sum, dimension) => sum + dimensionScores[dimension] * DIMENSION_WEIGHTS[dimension], 0);
  return round(total);
}

export function getLadderStep(d: DimensionScore, overall: number): LadderStep {
  const lowDims = DIMENSIONS.filter((key) => d[key] < 2).length;
  const hasCriticalGap = DIMENSIONS.some((key) => d[key] < 1.8);

  if (overall < 1.9 || lowDims >= 3 || hasCriticalGap) return 1;
  if (overall < 2.8 || d.strategy < 2.2 || d.process < 2.2) return 2;

  const qualifiesFor4 =
    overall >= 3.9 &&
    d.strategy >= 3.8 &&
    d.process >= 3.6 &&
    d.research >= 3.2 &&
    d.operations >= 3.2 &&
    DIMENSIONS.every((key) => d[key] >= 3);

  if (qualifiesFor4) return 4;
  return 3;
}

export function getMaturityLevelFromStep(step: LadderStep) {
  switch (step) {
    case 1:
      return 'Non-Design' as const;
    case 2:
      return 'Styling' as const;
    case 3:
      return 'Process' as const;
    case 4:
      return 'Strategy' as const;
  }
}

export function getDimensionStatus(score: number) {
  if (score < 2) return 'critical' as const;
  if (score < 3) return 'weak' as const;
  if (score < 4) return 'stable' as const;
  return 'strong' as const;
}

export function buildScoringResult(answers: AssessmentAnswer): ScoringResult {
  const dimensionScores = calculateDimensionScores(answers);
  const overallScore = calculateOverallScore(dimensionScores);
  const ladderStep = getLadderStep(dimensionScores, overallScore);

  const sorted = [...DIMENSIONS].sort((a, b) => dimensionScores[a] - dimensionScores[b]);

  return {
    dimensionScores,
    overallScore,
    ladderStep,
    maturityLevel: getMaturityLevelFromStep(ladderStep),
    weakestDimensions: sorted.slice(0, 2),
    strongestDimensions: [...sorted].reverse().slice(0, 2),
    insights: DIMENSIONS.map((key) => ({
      key,
      label: DIMENSION_LABELS[key],
      score: dimensionScores[key],
      weightedScore: round(dimensionScores[key] * DIMENSION_WEIGHTS[key]),
      status: getDimensionStatus(dimensionScores[key]),
    })),
  };
}
