import { AssessmentRecord, DimensionScore, HoldingBenchmark } from '@/lib/types';
import { DIMENSIONS } from '@/lib/questionnaire';

export const TEXO_HOLDING_BENCHMARK: HoldingBenchmark = {
  overallScore: 2.78,
  ladderStep: 2,
  maturityLevel: 'Styling',
  dimensionScores: {
    visionary: 2.65,
    inspirational: 2.75,
    relational: 2.55,
    identity: 2.7,
    adoption: 2.85,
    innovation: 2.8,
  },
  narrative:
    'Esta referencia TEXO representa un estado intermedio: existen señales de diseño, innovación y customer centricity, pero todavía dependen de líderes, equipos o iniciativas puntuales más que de un sistema cultural y operativo instalado.',
};

export function emptyDimensionScores(): DimensionScore {
  return DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = 0;
    return acc;
  }, {} as DimensionScore);
}

export function averageDimensionScores(items: AssessmentRecord[]): DimensionScore {
  if (!items.length) return emptyDimensionScores();

  const totals = emptyDimensionScores();
  for (const item of items) {
    for (const dimension of DIMENSIONS) {
      totals[dimension] += Number(item.dimensionScores?.[dimension] ?? 0);
    }
  }

  return DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = Number((totals[dimension] / items.length).toFixed(2));
    return acc;
  }, {} as DimensionScore);
}

export function averageOverallScore(items: AssessmentRecord[]) {
  if (!items.length) return 0;
  return Number((items.reduce((acc, item) => acc + item.overallScore, 0) / items.length).toFixed(2));
}
