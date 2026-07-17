export type AgencyName =
  | 'ROGER'
  | 'LUPE'
  | 'AMPLIFY'
  | 'OMD'
  | 'PHD'
  | 'NASTA'
  | 'BRICK'
  | 'ROW'
  | 'BPR'
  | 'TEXO';


export type AccessRole = 'member' | 'admin';
export type AccessStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type CertificationStatus = 'not_started' | 'in_progress' | 'passed' | 'failed';

export type QualificationProgress = {
  readinessChecklist: Record<string, boolean>;
  readinessCompletedAt?: string;
  guideCompletedAt?: string;
  certificationStatus: CertificationStatus;
  certificationScore?: number;
  certificationAttempts: number;
  certifiedAt?: string;
  certificationVersion?: string;
};

export type AccessSession = {
  id: string;
  fullName: string;
  email: string;
  agency: AgencyName;
  role: AccessRole;
  legacy?: boolean;
  mustChangePassword?: boolean;
  adminPreview?: boolean;
};

export type AccessUser = AccessSession & {
  jobTitle?: string;
  status: AccessStatus;
  requestedAt: string;
  approvedAt?: string;
  lastLoginAt?: string;
  readinessCompletedAt?: string;
  guideCompletedAt?: string;
  certificationStatus?: CertificationStatus;
  certificationScore?: number;
  certificationAttempts?: number;
  certifiedAt?: string;
};

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


export type ActionPhase = 'Entender' | 'Priorizar' | 'Implementar' | 'Medir' | 'Escalar';
export type ActionStatus = 'Pendiente' | 'En curso' | 'Bloqueada' | 'Completada' | 'Descartada';
export type ActionPriority = 'Alta' | 'Media' | 'Baja';
export type ActionLevel = 'Alto' | 'Medio' | 'Bajo';
export type ScaleSuggestion = 'Nunca' | 'A veces' | 'En desarrollo' | 'Frecuente' | 'Siempre';

export type ActionItem = {
  id: string;
  agency: AgencyName;
  assessmentId?: string;
  dimension?: DimensionKey | 'general';
  title: string;
  description: string;
  phase: ActionPhase;
  ownerName: string;
  ownerEmail?: string;
  status: ActionStatus;
  priority: ActionPriority;
  impact: ActionLevel;
  effort: ActionLevel;
  dueDate?: string;
  nextReviewDate?: string;
  successMetric?: string;
  evidence?: string;
  comments?: string;
  source: 'IA' | 'Recomendación automática' | 'Manual';
  createdAt: string;
  updatedAt: string;
};

export type ConsistencyReading = {
  score: number;
  label: 'Inicial' | 'En instalación' | 'Consistente' | 'Sistemático';
  suggestedScale: ScaleSuggestion;
  rationale: string;
  checklist: Array<{ label: string; done: boolean }>;
};
