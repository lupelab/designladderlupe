import { NextRequest, NextResponse } from 'next/server';
import { getActionItemById, updateActionItem } from '@/lib/apps-script';
import { getCurrentAgency } from '@/lib/auth';
import { ActionItem } from '@/lib/types';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agency = await getCurrentAgency();

    if (!agency) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const item = await getActionItemById(params.id);

    if (!item || item.agency !== agency) {
      return NextResponse.json({ ok: true, item: null });
    }

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error interno al leer la acción.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agency = await getCurrentAgency();

    if (!agency) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const existing = await getActionItemById(params.id);

    if (!existing || existing.agency !== agency) {
      return NextResponse.json({ ok: false, error: 'Acción no encontrada' }, { status: 404 });
    }

    const item: ActionItem = {
      ...existing,
      ...body,
      id: params.id,
      agency,
      updatedAt: new Date().toISOString(),
    };

    const result = await updateActionItem(item);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error interno al actualizar la acción.' },
      { status: 500 }
    );
  }
}
