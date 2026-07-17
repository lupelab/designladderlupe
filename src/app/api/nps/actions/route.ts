import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createActionItem, listActionItems } from '@/lib/apps-script';
import { getCurrentUser } from '@/lib/auth';
import {
  buildNpsActionCandidates,
  filterNpsRows,
  getNpsSurveyRows,
  normalizeNpsAgency,
  npsCandidateToAction,
  previousNpsPeriod,
} from '@/lib/nps';

const bodySchema = z.object({
  agency: z.string().min(2),
  period: z.string().min(3),
  keys: z.array(z.string()).min(1).max(4),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Solicitud inválida', details: parsed.error.flatten() }, { status: 400 });
    }

    const requestedAgency = normalizeNpsAgency(parsed.data.agency);
    if (!requestedAgency || requestedAgency === 'TEXO') {
      return NextResponse.json({ ok: false, error: 'Elegí una agencia válida para crear acciones.' }, { status: 400 });
    }

    const canManageAnyAgency = user.role === 'admin' || user.agency === 'TEXO';
    const agency = canManageAnyAgency ? requestedAgency : user.agency;
    if (agency !== requestedAgency) {
      return NextResponse.json({ ok: false, error: 'No tenés permiso para crear acciones para otra agencia.' }, { status: 403 });
    }

    const rows = await getNpsSurveyRows();
    const currentRows = filterNpsRows(rows, parsed.data.period, agency);
    if (!currentRows.length) {
      return NextResponse.json({ ok: false, error: 'No hay respuestas NPS para esa agencia y período.' }, { status: 404 });
    }

    const previousPeriod = previousNpsPeriod(parsed.data.period);
    const previousRows = previousPeriod ? filterNpsRows(rows, previousPeriod, agency) : [];
    const candidates = buildNpsActionCandidates({ agency, period: parsed.data.period, currentRows, previousRows })
      .filter((candidate) => parsed.data.keys.includes(candidate.key));

    const existing = await listActionItems(agency);
    const existingText = existing.items.map((item) => `${item.description}\n${item.evidence}`).join('\n');
    let created = 0;
    let skipped = 0;

    for (const candidate of candidates) {
      if (existingText.includes(candidate.marker)) {
        skipped += 1;
        continue;
      }
      await createActionItem(npsCandidateToAction(candidate, agency, parsed.data.period));
      created += 1;
    }

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      message: created
        ? 'Las acciones NPS ya están en Plan y seguimiento.'
        : 'Estas acciones ya habían sido creadas para el período seleccionado.',
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudieron generar las acciones NPS.',
    }, { status: 500 });
  }
}
