import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress, saveCertificationResult, updateQualificationProgress } from '@/lib/qualification';
import {
  CERTIFICATION_MIN_CORRECT,
  CERTIFICATION_PASS_SCORE,
  CERTIFICATION_VERSION,
  gradeCertification,
  selectCertificationQuestions,
} from '@/lib/certification';

const READINESS_ITEMS = [
  'scope',
  'period',
  'evidence',
  'crossFunctional',
  'examples',
  'intentVsPractice',
  'exceptions',
  'neutrality',
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const progress = await getQualificationProgress(user);
    const completed = progress.certificationStatus === 'passed' && Boolean(progress.certifiedAt);
    const questions = completed
      ? []
      : selectCertificationQuestions(progress.certificationAttempts).map(({ correctIndex, rationale, ...question }) => question);
    return NextResponse.json({
      ok: true,
      progress,
      completed,
      questions,
      passScore: CERTIFICATION_PASS_SCORE,
      minCorrect: CERTIFICATION_MIN_CORRECT,
      user: { id: user.id, fullName: user.fullName, agency: user.agency },
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo cargar el recorrido de habilitación.',
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const action = String(body.action || '');
    const current = await getQualificationProgress(user);

    if (action === 'save-readiness') {
      const checklist = body.checklist && typeof body.checklist === 'object' ? body.checklist : {};
      const normalized = Object.fromEntries(READINESS_ITEMS.map((id) => [id, Boolean(checklist[id])]));
      const complete = READINESS_ITEMS.every((id) => normalized[id]);
      const progress = await updateQualificationProgress(user, {
        readinessChecklist: normalized,
        readinessCompletedAt: complete ? (current.readinessCompletedAt || new Date().toISOString()) : undefined,
      });
      return NextResponse.json({ ok: true, complete, progress });
    }

    if (action === 'complete-guide') {
      if (!current.readinessCompletedAt) {
        return NextResponse.json({ ok: false, error: 'Primero completá el checklist de preparación.' }, { status: 409 });
      }
      const score = Number(body.score || 0);
      if (score < 80) {
        return NextResponse.json({ ok: false, error: 'Necesitás al menos 80% en el simulacro para continuar.' }, { status: 400 });
      }
      const progress = await updateQualificationProgress(user, {
        guideCompletedAt: current.guideCompletedAt || new Date().toISOString(),
        certificationStatus: current.certificationStatus === 'passed' ? 'passed' : 'in_progress',
      });
      return NextResponse.json({ ok: true, progress });
    }

    return NextResponse.json({ ok: false, error: 'Acción no reconocida.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el avance.';
    const migrationHint = message.includes('column') || message.includes('schema cache')
      ? ' Falta ejecutar la migración 20260717_qualification_journey.sql en Supabase.'
      : '';
    return NextResponse.json({ ok: false, error: `${message}${migrationHint}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const current = await getQualificationProgress(user);
    if (current.certificationStatus === 'passed' && current.certifiedAt) {
      return NextResponse.json({ ok: false, error: 'La certificación ya fue aprobada y se realiza una sola vez. Un administrador puede reiniciarla si fuera necesario.' }, { status: 409 });
    }
    if (!current.readinessCompletedAt || !current.guideCompletedAt) {
      return NextResponse.json({ ok: false, error: 'Completá la preparación y el simulacro antes del examen.' }, { status: 409 });
    }

    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    const grade = gradeCertification(answers, current.certificationAttempts);
    const now = new Date().toISOString();
    const progress = await saveCertificationResult(user, {
      certificationStatus: grade.passed ? 'passed' : 'failed',
      certificationScore: grade.score,
      certificationAttempts: current.certificationAttempts + 1,
      certifiedAt: grade.passed ? now : undefined,
      certificationVersion: CERTIFICATION_VERSION,
    }, answers);

    return NextResponse.json({
      ok: true,
      progress,
      grade: {
        score: grade.score,
        passed: grade.passed,
        correct: grade.correct,
        total: grade.total,
        gaps: grade.gaps,
        results: grade.results.map(({ correctIndex, selectedIndex, ...result }) => result),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo corregir el examen.';
    const migrationHint = message.includes('column') || message.includes('schema cache')
      ? ' Falta ejecutar la migración 20260717_qualification_journey.sql en Supabase.'
      : '';
    return NextResponse.json({ ok: false, error: `${message}${migrationHint}` }, { status: 500 });
  }
}
