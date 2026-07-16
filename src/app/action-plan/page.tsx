import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ActionPlanClient } from '@/components/ActionPlanClient';
import { getCurrentAgency } from '@/lib/auth';
import { listActionItems, listAssessments } from '@/lib/apps-script';

export default async function ActionPlanPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  let actions: any[] = [];
  let latestAssessment: any = null;
  let error = '';

  try {
    const [actionData, assessmentData] = await Promise.all([
      listActionItems(agency),
      listAssessments(agency),
    ]);

    actions = [...(actionData.items || [])].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );

    latestAssessment = [...(assessmentData.items || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] || null;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <AppShell
      title="Plan de acción"
      agency={agency}
      subtitle="Convertí el diagnóstico en acciones concretas, responsables, fechas, evidencias y seguimiento por fases."
      actions={
        <div className="inline-actions">
          <Link href="/action-plan/new" className="button button-primary">
            Nueva acción
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="button button-secondary">Salir</button>
          </form>
        </div>
      }
    >
      {error ? (
        <section className="panel result-alert">
          <strong>No se pudo cargar el plan de acción.</strong>
          <p>{error}</p>
          <p className="muted">
            Si acabás de agregar esta función, actualizá primero el Apps Script con las acciones createActionItem, listActionItems, updateActionItem y getActionItem.
          </p>
        </section>
      ) : (
        <ActionPlanClient initialActions={actions as any} latestAssessment={latestAssessment as any} />
      )}
    </AppShell>
  );
}
