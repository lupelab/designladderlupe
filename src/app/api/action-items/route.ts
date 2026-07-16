import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createActionItem, listActionItems } from '@/lib/apps-script';
import { getCurrentAgency } from '@/lib/auth';
import { createActionId } from '@/lib/action-plan';
import { ActionItem } from '@/lib/types';

const actionSchema = z.object({
  id: z.string().optional(),
  assessmentId: z.string().optional().or(z.literal('')),
  dimension: z.string().optional().or(z.literal('general')),
  title: z.string().min(3),
  description: z.string().optional().or(z.literal('')),
  phase: z.enum(['Entender', 'Priorizar', 'Implementar', 'Medir', 'Escalar']).default('Priorizar'),
  ownerName: z.string().optional().or(z.literal('')),
  ownerEmail: z.string().optional().or(z.literal('')),
  status: z.enum(['Pendiente', 'En curso', 'Bloqueada', 'Completada', 'Descartada']).default('Pendiente'),
  priority: z.enum(['Alta', 'Media', 'Baja']).default('Alta'),
  impact: z.enum(['Alto', 'Medio', 'Bajo']).default('Alto'),
  effort: z.enum(['Alto', 'Medio', 'Bajo']).default('Medio'),
  dueDate: z.string().optional().or(z.literal('')),
  nextReviewDate: z.string().optional().or(z.literal('')),
  successMetric: z.string().optional().or(z.literal('')),
  evidence: z.string().optional().or(z.literal('')),
  comments: z.string().optional().or(z.literal('')),
  source: z.enum(['IA', 'Recomendación automática', 'Manual']).default('Manual'),
});

export async function GET() {
  try {
    const agency = await getCurrentAgency();

    if (!agency) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await listActionItems(agency);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno al listar acciones.',
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
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const item: ActionItem = {
      ...parsed.data,
      id: parsed.data.id || createActionId(),
      agency,
      dimension: (parsed.data.dimension || 'general') as ActionItem['dimension'],
      description: parsed.data.description || '',
      createdAt: now,
      updatedAt: now,
    } as ActionItem;

    const result = await createActionItem(item);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno al guardar la acción.',
      },
      { status: 500 }
    );
  }
}
