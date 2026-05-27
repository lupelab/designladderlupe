export type AgencyName =
  | 'ROGER'
  | 'LUPE'
  | 'AMPLIFY'
  | 'OMD'
  | 'NASTA'
  | 'BRICK'
  | 'ROW'
  | 'BPR';

export type DimensionKey =
  | 'visionary'
  | 'inspirational'
  | 'relational'
  | 'identity'
  | 'adoption'
  | 'innovation';

export type LadderStep = 1 | 2 | 3 | 4;

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  appliedExample?: string;
};

export type ScaleOption = {
  value: number;
  shortLabel: string;
  title: string;
  description: string;
};

export type Question = {
  id: string;
  dimension: DimensionKey;
  principleNumber: number;
  principleName: string;
  title: string;
  description: string;
  weight?: number;
  glossary?: string;
  tooltip?: string;
  agencyExample?: string;
};

export type AssessmentAnswer = Record<string, number>;
export type DimensionScore = Record<DimensionKey, number>;

export type DimensionInsight = {
  key: DimensionKey;
  label: string;
  score: number;
  weightedScore: number;
  status: 'critical' | 'weak' | 'stable' | 'strong';
};

export type AssessmentRecord = {
  id: string;
  userId?: string;
  agency: AgencyName;
  respondentName: string;
  respondentEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  answers: AssessmentAnswer;
  dimensionScores: DimensionScore;
  overallScore: number;
  maturityLevel: 'Non-Design' | 'Styling' | 'Process' | 'Strategy';
  ladderStep?: LadderStep;
};

export type ScoringResult = {
  dimensionScores: DimensionScore;
  overallScore: number;
  ladderStep: LadderStep;
  maturityLevel: 'Non-Design' | 'Styling' | 'Process' | 'Strategy';
  weakestDimensions: DimensionKey[];
  strongestDimensions: DimensionKey[];
  insights: DimensionInsight[];
};

export type RecommendationBlock = {
  dimension: DimensionKey;
  label: string;
  priority: 'Alta' | 'Media' | 'Baja';
  headline: string;
  rationale: string;
  actions: string[];
};

export type HoldingBenchmark = {
  overallScore: number;
  ladderStep: LadderStep;
  maturityLevel: string;
  dimensionScores: DimensionScore;
  narrative: string;
};
