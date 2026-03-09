import { AssessmentRecord, DimensionScore, HoldingBenchmark } from '@/lib/types';

export const TEXO_HOLDING_BENCHMARK: HoldingBenchmark = {
  overallScore: 2.82,
  ladderStep: 2,
  maturityLevel: 'Styling',
  dimensionScores: {
    strategy: 2.55,
    process: 2.9,
    research: 2.45,
    craft: 3.2,
    operations: 2.8,
  },
  narrative:
    'Esta referencia TEXO representa un estado de madurez todavía intermedio: hay fortalezas creativas y señales de orden en proceso, pero el uso de diseño para construir nuevas soluciones, alinear áreas y trabajar con insights todavía es irregular.',
};

export function averageDimensionScores(items: AssessmentRecord[]): DimensionScore {
  if (!items.length) {
    return { strategy: 0, process: 0, research: 0, craft: 0, operations: 0 };
  }

  const totals = { strategy: 0, process: 0, research: 0, craft: 0, operations: 0 };
  for (const item of items) {
    totals.strategy += item.dimensionScores.strategy;
    totals.process += item.dimensionScores.process;
    totals.research += item.dimensionScores.research;
    totals.craft += item.dimensionScores.craft;
    totals.operations += item.dimensionScores.operations;
  }

  return {
    strategy: Number((totals.strategy / items.length).toFixed(2)),
    process: Number((totals.process / items.length).toFixed(2)),
    research: Number((totals.research / items.length).toFixed(2)),
    craft: Number((totals.craft / items.length).toFixed(2)),
    operations: Number((totals.operations / items.length).toFixed(2)),
  };
}

export function averageOverallScore(items: AssessmentRecord[]) {
  if (!items.length) return 0;
  return Number((items.reduce((acc, item) => acc + item.overallScore, 0) / items.length).toFixed(2));
}
