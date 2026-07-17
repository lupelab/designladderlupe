import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { AccessSession, QualificationProgress } from '@/lib/types';
import {
  QUALIFICATION_COOKIE_NAME,
  makeQualificationCookieValue,
  parseQualificationCookie,
} from '@/lib/auth';

export const EMPTY_QUALIFICATION_PROGRESS: QualificationProgress = {
  readinessChecklist: {},
  readinessCompletedAt: undefined,
  guideCompletedAt: undefined,
  certificationStatus: 'not_started',
  certificationScore: undefined,
  certificationAttempts: 0,
  certifiedAt: undefined,
  certificationVersion: undefined,
};

function mapProgress(row: any): QualificationProgress {
  return {
    readinessChecklist: row.readiness_checklist || {},
    readinessCompletedAt: row.readiness_completed_at || undefined,
    guideCompletedAt: row.guide_completed_at || undefined,
    certificationStatus: row.certification_status || 'not_started',
    certificationScore: typeof row.certification_score === 'number' ? row.certification_score : undefined,
    certificationAttempts: Number(row.certification_attempts || 0),
    certifiedAt: row.certified_at || undefined,
    certificationVersion: row.certification_version || undefined,
  };
}

export async function getQualificationProgress(user: AccessSession): Promise<QualificationProgress> {
  const cookieStore = await cookies();
  const cached = parseQualificationCookie(cookieStore.get(QUALIFICATION_COOKIE_NAME)?.value);
  if (user.legacy) {
    return cached && cached.userId === user.id ? cached.progress : EMPTY_QUALIFICATION_PROGRESS;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('access_users')
      .select('readiness_checklist, readiness_completed_at, guide_completed_at, certification_status, certification_score, certification_attempts, certified_at, certification_version')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return mapProgress(data);
  } catch {
    return EMPTY_QUALIFICATION_PROGRESS;
  }
}

export async function updateQualificationProgress(user: AccessSession, changes: Partial<QualificationProgress>) {
  const current = await getQualificationProgress(user);
  const next: QualificationProgress = { ...current, ...changes };

  if (!user.legacy) {
    const supabase = getSupabaseAdmin();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (changes.readinessChecklist !== undefined) payload.readiness_checklist = changes.readinessChecklist;
    if (changes.readinessCompletedAt !== undefined) payload.readiness_completed_at = changes.readinessCompletedAt || null;
    if (changes.guideCompletedAt !== undefined) payload.guide_completed_at = changes.guideCompletedAt || null;
    if (changes.certificationStatus !== undefined) payload.certification_status = changes.certificationStatus;
    if (changes.certificationScore !== undefined) payload.certification_score = changes.certificationScore ?? null;
    if (changes.certificationAttempts !== undefined) payload.certification_attempts = changes.certificationAttempts;
    if (changes.certifiedAt !== undefined) payload.certified_at = changes.certifiedAt || null;
    if (changes.certificationVersion !== undefined) payload.certification_version = changes.certificationVersion || null;

    const { error } = await supabase.from('access_users').update(payload).eq('id', user.id);
    if (error) throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(QUALIFICATION_COOKIE_NAME, makeQualificationCookieValue(user.id, next), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return next;
}

export function isQualified(progress: QualificationProgress) {
  return progress.certificationStatus === 'passed' && Boolean(progress.certifiedAt);
}


export async function saveCertificationResult(
  user: AccessSession,
  changes: Partial<QualificationProgress>,
  answers: Record<string, number>
) {
  const progress = await updateQualificationProgress(user, changes);
  if (!user.legacy) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('access_users')
      .update({ certification_answers: answers, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw new Error(error.message);
  }
  return progress;
}
