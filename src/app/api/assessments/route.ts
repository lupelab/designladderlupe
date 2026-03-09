import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAssessment, listAssessments } from '@/lib/apps-script';
import { getCurrentAgency } from '@/lib/auth';
import { QUESTIONS } from '@/lib/questionnaire';
import { buildScoringResult } from '@/lib/scoring';

const assessmentSchema = z.object({
  respondentName: z.string().min(2),
  respondentEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  answers: z.record(z.string(), z.number().min(1).max(5)),
});

function createAssessmentId() {
  return `ass_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  try {
    const agency = await getCurrentAgency();

    if (!agency) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await listAssessments(agency);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno al listar evaluaciones.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const agency = await getCurrentAgency();

    if (!agency) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = assessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Payload inválido',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const missing = QUESTIONS.filter((q) => !parsed.data.answers[q.id]);
    if (missing.length) {
      return NextResponse.json(
        { ok: false, error: 'Faltan respuestas obligatorias.' },
        { status: 400 }
      );
    }

    const scoring = buildScoringResult(parsed.data.answers);

    const item = {
      id: createAssessmentId(),
      userId: agency,
      agency,
      respondentName: parsed.data.respondentName,
      respondentEmail: parsed.data.respondentEmail || undefined,
      notes: parsed.data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: parsed.data.answers,
      dimensionScores: scoring.dimensionScores,
      overallScore: scoring.overallScore,
      maturityLevel: scoring.maturityLevel,
      ladderStep: scoring.ladderStep,
    };

    const result = await createAssessment(item as any);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno al guardar la evaluación.',
      },
      { status: 500 }
    );
  }
}
