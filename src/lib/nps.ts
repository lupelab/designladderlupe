import crypto from 'crypto';
import { ActionItem, ActionPriority, AgencyName, DimensionKey } from '@/lib/types';
import { createActionId } from '@/lib/action-plan';

export type NpsSurveyRow = {
  timestamp: string;
  period: string;
  agency: AgencyName;
  email: string;
  respondentName: string;
  organization: string;
  jobTitle: string;
  service: string;
  q1EnjoyWorking: string;
  q2Reliable: string;
  q3Collaborative: string;
  q4CreatesValue: string;
  q5StrategyBased: string;
  q6CreativeMindset: string;
  aspects: string[];
  recommendationScore: number;
  recommendationCategory: string;
  continuityScore: number;
  continuityCategory: string;
  scoreReason: string;
  additionalComments: string;
  meetingRequested: string;
};

export type NpsBreakdown = {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
  nps: number;
};

export type NpsDriverMetric = {
  key: string;
  label: string;
  average: number;
  coverage: number;
  trend: number;
};

export type NpsOpportunity = NpsDriverMetric & {
  priority: ActionPriority;
  opportunityScore: number;
  summary: string;
};

export type NpsActionCandidate = {
  key: string;
  title: string;
  description: string;
  priority: ActionPriority;
  impact: ActionItem['impact'];
  effort: ActionItem['effort'];
  dimension: DimensionKey | 'general';
  dueDays: number;
  successMetric: string;
  marker: string;
};

export const NPS_AGENCIES: AgencyName[] = [
  'LUPE',
  'OMD',
  'PHD',
  'ROGER',
  'BRICK',
  'NASTA',
  'ROW',
  'BPR',
  'AMPLIFY',
];

export const NPS_DRIVER_LABELS: Record<string, string> = {
  q1EnjoyWorking: 'Disfrute al trabajar',
  q2Reliable: 'Fiabilidad',
  q3Collaborative: 'Colaboración',
  q4CreatesValue: 'Creación de valor',
  q5StrategyBased: 'Base estratégica',
  q6CreativeMindset: 'Mentalidad creativa',
};

const DRIVER_DIMENSIONS: Record<string, DimensionKey> = {
  q1EnjoyWorking: 'relational',
  q2Reliable: 'adoption',
  q3Collaborative: 'relational',
  q4CreatesValue: 'identity',
  q5StrategyBased: 'visionary',
  q6CreativeMindset: 'innovation',
};

const DRIVER_ACTIONS: Record<string, { title: string; successMetric: string }> = {
  q1EnjoyWorking: {
    title: 'Mejorar la experiencia de trabajo con el cliente',
    successMetric: 'Acordar y probar al menos dos mejoras concretas de experiencia con las cuentas priorizadas.',
  },
  q2Reliable: {
    title: 'Aumentar la fiabilidad de compromisos y entregables',
    successMetric: 'Alcanzar al menos 90% de cumplimiento de compromisos críticos en fecha durante el próximo ciclo.',
  },
  q3Collaborative: {
    title: 'Instalar rituales de colaboración con clientes',
    successMetric: 'Realizar un ritual de co-construcción mensual con agenda, acuerdos y seguimiento documentado.',
  },
  q4CreatesValue: {
    title: 'Hacer visible el valor generado para el cliente',
    successMetric: 'Presentar mensualmente resultados, aprendizajes y oportunidades vinculados al negocio del cliente.',
  },
  q5StrategyBased: {
    title: 'Fortalecer la base estratégica de las recomendaciones',
    successMetric: 'Incorporar evidencia, objetivo de negocio y criterio de éxito en 100% de las recomendaciones priorizadas.',
  },
  q6CreativeMindset: {
    title: 'Elevar la mentalidad creativa de las soluciones',
    successMetric: 'Probar al menos una alternativa o prototipo nuevo por cuenta priorizada y documentar el aprendizaje.',
  },
};

const LIKERT_MAP: Record<string, number> = {
  'Totalmente en desacuerdo': 1,
  'Muy en desacuerdo': 1,
  'En desacuerdo': 2,
  'Ni de acuerdo ni en desacuerdo': 3,
  'De acuerdo': 4,
  'Totalmente de acuerdo': 5,
  'Muy de acuerdo': 5,
};

function requiredNpsEnv(primary: string, fallback?: string) {
  const value = process.env[primary] || (fallback ? process.env[fallback] : '');
  if (!value) {
    throw new Error(`Falta la variable de entorno ${primary}${fallback ? ` (o ${fallback})` : ''}.`);
  }
  return value;
}

function normalize(value: unknown) {
  return String(value ?? '').trim();
}

function toNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function normalizeAspectList(value: unknown) {
  return normalize(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeNpsAgency(value: unknown): AgencyName | null {
  const normalized = normalize(value).toUpperCase();
  const mapped = normalized === 'RAW' ? 'ROW' : normalized;
  const agencies: AgencyName[] = ['ROGER', 'LUPE', 'AMPLIFY', 'OMD', 'PHD', 'NASTA', 'BRICK', 'ROW', 'BPR', 'TEXO'];
  return agencies.includes(mapped as AgencyName) ? (mapped as AgencyName) : null;
}

function mapRow(values: unknown[]): NpsSurveyRow | null {
  const agency = normalizeNpsAgency(values[2]);
  if (!agency || agency === 'TEXO') return null;

  return {
    timestamp: normalize(values[0]),
    period: normalize(values[1]),
    agency,
    email: normalize(values[3]),
    respondentName: normalize(values[4]),
    organization: normalize(values[5]),
    jobTitle: normalize(values[6]),
    service: normalize(values[7]),
    q1EnjoyWorking: normalize(values[8]),
    q2Reliable: normalize(values[9]),
    q3Collaborative: normalize(values[10]),
    q4CreatesValue: normalize(values[11]),
    q5StrategyBased: normalize(values[12]),
    q6CreativeMindset: normalize(values[13]),
    aspects: normalizeAspectList(values[14]),
    recommendationScore: toNumber(values[15]),
    recommendationCategory: normalize(values[16]),
    continuityScore: toNumber(values[17]),
    continuityCategory: normalize(values[18]),
    scoreReason: normalize(values[19]),
    additionalComments: normalize(values[20]),
    meetingRequested: normalize(values[21]),
  };
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

async function getGoogleAccessToken() {
  const email = requiredNpsEnv('NPS_GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = requiredNpsEnv('NPS_GOOGLE_PRIVATE_KEY', 'GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).end().sign(privateKey);
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });
  const data = await response.json() as { access_token?: string; error_description?: string; error?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'No se pudo autenticar la cuenta de servicio de Google.');
  }
  return data.access_token;
}

export async function getNpsSurveyRows(): Promise<NpsSurveyRow[]> {
  const spreadsheetId = requiredNpsEnv('NPS_GOOGLE_SHEETS_ID', 'GOOGLE_SHEETS_ID');
  const sheetName = process.env.NPS_GOOGLE_SHEET_NAME || process.env.GOOGLE_SHEET_NAME || 'Respuestas';
  const accessToken = await getGoogleAccessToken();
  const range = encodeURIComponent(`${sheetName}!A:V`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  const data = await response.json() as { values?: unknown[][]; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(data.error?.message || 'No se pudieron leer las respuestas del Google Sheet.');
  }

  const rows = data.values || [];
  if (rows.length <= 1) return [];

  return rows
    .slice(1)
    .map((row) => mapRow(row))
    .filter((row): row is NpsSurveyRow => Boolean(row));
}

export function availableNpsPeriods(rows: NpsSurveyRow[]) {
  return [...new Set(rows.map((row) => row.period).filter(Boolean))].sort().reverse();
}

export function previousNpsPeriod(period: string) {
  const match = period.match(/^(\d{4})-Q([1-4])$/);
  if (!match) return null;
  const year = Number(match[1]);
  const quarter = Number(match[2]);
  return quarter === 1 ? `${year - 1}-Q4` : `${year}-Q${quarter - 1}`;
}

export function filterNpsRows(rows: NpsSurveyRow[], period: string, agency?: AgencyName) {
  return rows.filter((row) => row.period === period && (!agency || row.agency === agency));
}

export function calculateNps(scores: number[]): NpsBreakdown {
  const valid = scores.filter((score) => Number.isFinite(score) && score >= 0 && score <= 10);
  const total = valid.length;
  if (!total) {
    return { total: 0, promoters: 0, passives: 0, detractors: 0, promotersPct: 0, passivesPct: 0, detractorsPct: 0, nps: 0 };
  }

  const promoters = valid.filter((score) => score >= 9).length;
  const passives = valid.filter((score) => score >= 7 && score <= 8).length;
  const detractors = valid.filter((score) => score <= 6).length;
  const promotersPct = round1((promoters / total) * 100);
  const passivesPct = round1((passives / total) * 100);
  const detractorsPct = round1((detractors / total) * 100);

  return {
    total,
    promoters,
    passives,
    detractors,
    promotersPct,
    passivesPct,
    detractorsPct,
    nps: Math.round(promotersPct - detractorsPct),
  };
}

export function computeNpsDriverMetrics(currentRows: NpsSurveyRow[], previousRows: NpsSurveyRow[]): NpsDriverMetric[] {
  return Object.entries(NPS_DRIVER_LABELS).map(([key, label]) => {
    const current = currentRows
      .map((row) => LIKERT_MAP[(row as unknown as Record<string, string>)[key]] || 0)
      .filter(Boolean);
    const previous = previousRows
      .map((row) => LIKERT_MAP[(row as unknown as Record<string, string>)[key]] || 0)
      .filter(Boolean);
    const currentAverage = average(current);
    const previousAverage = average(previous);

    return {
      key,
      label,
      average: currentAverage,
      coverage: currentRows.length ? round1((current.length / currentRows.length) * 100) : 0,
      trend: round1(currentAverage - previousAverage),
    };
  });
}

export function topNpsStrengths(metrics: NpsDriverMetric[], limit = 3) {
  return [...metrics].sort((a, b) => b.average - a.average || b.trend - a.trend).slice(0, limit);
}

export function identifyNpsOpportunities(currentRows: NpsSurveyRow[], previousRows: NpsSurveyRow[]): NpsOpportunity[] {
  return computeNpsDriverMetrics(currentRows, previousRows)
    .map((driver) => {
      const gapImpact = (5 - driver.average) * 20;
      const negativeTrend = Math.max(driver.trend * -1, 0) * 18;
      const lowCoveragePenalty = Math.max(100 - driver.coverage, 0) * 0.05;
      const opportunityScore = round1(gapImpact * 0.68 + negativeTrend * 0.27 + lowCoveragePenalty);
      const priority: ActionPriority = opportunityScore >= 44 ? 'Alta' : opportunityScore >= 27 ? 'Media' : 'Baja';

      return {
        ...driver,
        priority,
        opportunityScore,
        summary: driver.trend < 0
          ? `Cayó ${Math.abs(driver.trend).toFixed(1)} puntos y hoy promedia ${driver.average}/5.`
          : `Promedia ${driver.average}/5 y todavía tiene espacio para convertirse en una práctica consistente.`,
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore || a.average - b.average);
}

export function computeNpsAgencyRanking(rows: NpsSurveyRow[], period: string) {
  const groups = new Map<AgencyName, NpsSurveyRow[]>();
  rows.filter((row) => row.period === period).forEach((row) => {
    const bucket = groups.get(row.agency) || [];
    bucket.push(row);
    groups.set(row.agency, bucket);
  });

  return [...groups.entries()]
    .map(([agency, agencyRows]) => ({
      agency,
      nps: calculateNps(agencyRows.map((row) => row.recommendationScore)).nps,
      continuityNps: calculateNps(agencyRows.map((row) => row.continuityScore)).nps,
      responses: agencyRows.length,
    }))
    .sort((a, b) => b.nps - a.nps || b.responses - a.responses);
}

export function summarizeNpsAspects(rows: NpsSurveyRow[]) {
  const counts = new Map<string, number>();
  rows.forEach((row) => row.aspects.forEach((aspect) => counts.set(aspect, (counts.get(aspect) || 0) + 1)));
  return [...counts.entries()]
    .map(([aspect, mentions]) => ({ aspect, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);
}

export function extractNpsThemes(rows: NpsSurveyRow[]) {
  const corpus = rows
    .flatMap((row) => [row.scoreReason, row.additionalComments].filter(Boolean))
    .join(' ')
    .toLowerCase();
  const themes = ['estrategia', 'análisis', 'procesos', 'implementación', 'oportunidades', 'colaboración', 'creatividad', 'tiempos', 'comunicación', 'calidad'];

  return themes
    .map((theme) => ({ theme, count: corpus.split(theme).length - 1 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function getNpsCriticalAccounts(rows: NpsSurveyRow[]) {
  return rows
    .filter((row) => row.recommendationScore <= 6 || /sí|si|yes/i.test(row.meetingRequested))
    .sort((a, b) => a.recommendationScore - b.recommendationScore)
    .slice(0, 12);
}

export function buildNpsActionCandidates({
  agency,
  period,
  currentRows,
  previousRows,
}: {
  agency: AgencyName;
  period: string;
  currentRows: NpsSurveyRow[];
  previousRows: NpsSurveyRow[];
}): NpsActionCandidate[] {
  const recommendation = calculateNps(currentRows.map((row) => row.recommendationScore));
  const continuity = calculateNps(currentRows.map((row) => row.continuityScore));
  const opportunities = identifyNpsOpportunities(currentRows, previousRows).slice(0, 3);
  const candidates: NpsActionCandidate[] = [];
  const detractorAccounts = currentRows
    .filter((row) => row.recommendationScore <= 6)
    .map((row) => row.organization || row.respondentName)
    .filter(Boolean);

  if (recommendation.detractors > 0) {
    const names = [...new Set(detractorAccounts)].slice(0, 5);
    const key = 'recover-detractors';
    candidates.push({
      key,
      title: `Recuperar cuentas detractoras de ${period}`,
      description: `Acción derivada del NPS de ${agency}. Hay ${recommendation.detractors} respuesta(s) detractora(s) sobre ${recommendation.total}. ${names.length ? `Cuentas a priorizar: ${names.join(', ')}.` : ''} Revisar cada caso, contactar al cliente y acordar un plan concreto de recuperación.`,
      priority: 'Alta',
      impact: 'Alto',
      effort: 'Medio',
      dimension: 'relational',
      dueDays: 21,
      successMetric: 'Contactar 100% de las cuentas detractoras, documentar causa raíz y acordar al menos una acción de recuperación por cuenta.',
      marker: `[NPS:${agency}:${period}:${key}]`,
    });
  }

  opportunities.forEach((opportunity, index) => {
    const template = DRIVER_ACTIONS[opportunity.key];
    const key = `driver-${opportunity.key}`;
    candidates.push({
      key,
      title: template?.title || `Mejorar ${opportunity.label.toLowerCase()}`,
      description: `Acción derivada del NPS de ${agency} para ${period}. ${opportunity.label} promedia ${opportunity.average}/5 (${opportunity.trend >= 0 ? '+' : ''}${opportunity.trend} vs. el período anterior). ${opportunity.summary} Definir una mejora concreta, probarla con cuentas priorizadas y registrar el aprendizaje.`,
      priority: opportunity.priority,
      impact: opportunity.priority === 'Baja' ? 'Medio' : 'Alto',
      effort: index === 0 ? 'Medio' : 'Bajo',
      dimension: DRIVER_DIMENSIONS[opportunity.key] || 'general',
      dueDays: 30 + index * 15,
      successMetric: template?.successMetric || `Mejorar el promedio de ${opportunity.label.toLowerCase()} en la próxima medición.`,
      marker: `[NPS:${agency}:${period}:${key}]`,
    });
  });

  if (!recommendation.detractors && continuity.nps + 10 < recommendation.nps) {
    const key = 'continuity-gap';
    candidates.unshift({
      key,
      title: `Cerrar la brecha de continuidad de ${period}`,
      description: `El NPS de continuidad (${continuity.nps}) está por debajo del NPS de recomendación (${recommendation.nps}). Identificar qué condiciones impiden que la satisfacción se transforme en intención de continuidad y acordar respuestas por cuenta.`,
      priority: 'Alta',
      impact: 'Alto',
      effort: 'Medio',
      dimension: 'identity',
      dueDays: 30,
      successMetric: 'Documentar los motivos de continuidad de las cuentas priorizadas y acordar una respuesta comercial o de servicio para cada brecha.',
      marker: `[NPS:${agency}:${period}:${key}]`,
    });
  }

  return candidates.slice(0, 4);
}

export function npsCandidateToAction(candidate: NpsActionCandidate, agency: AgencyName, period: string): ActionItem {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + candidate.dueDays);
  const createdAt = now.toISOString();

  return {
    id: createActionId(),
    agency,
    dimension: candidate.dimension,
    title: candidate.title,
    description: candidate.description,
    phase: 'Priorizar',
    ownerName: '',
    ownerEmail: '',
    status: 'Pendiente',
    priority: candidate.priority,
    impact: candidate.impact,
    effort: candidate.effort,
    dueDate: due.toISOString().slice(0, 10),
    nextReviewDate: '',
    successMetric: candidate.successMetric,
    evidence: '',
    comments: `Origen NPS · ${period} · ${candidate.marker}`,
    source: 'Recomendación automática',
    createdAt,
    updatedAt: createdAt,
  };
}

export function isNpsAction(action: ActionItem) {
  return /Acción derivada del NPS/i.test(action.description || '') || /\[NPS:/i.test(action.evidence || '') || /Origen NPS/i.test(action.evidence || '');
}
