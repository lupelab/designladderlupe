import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ActionPlanClient } from '@/components/ActionPlanClient';
import { getCurrentAgency } from '@/lib/auth';
import { createActionItem, listActionItems, listAssessments } from '@/lib/apps-script';
import { buildSuggestedActionsFromAssessment } from '@/lib/action-plan';
import { ActionItem, AssessmentRecord } from '@/lib/types';

export default async function ActionPlanPage() {
  const agency = await getCurrentAgency();
  if (!agency) redirect('/login');

  let actions: ActionItem[] = [];
  let latestAssessment: AssessmentRecord | null = null;
  let error = '';

  try {
    const [actionData, assessmentData] = await Promise.all([listActionItems(agency), listAssessments(agency)]);
    actions = [...(actionData.items || [])].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    latestAssessment = [...(assessmentData.items || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

    if (latestAssessment && !actions.some((action) => action.assessmentId === latestAssessment?.id)) {
      const suggestions = buildSuggestedActionsFromAssessment(latestAssessment);
      const created = await Promise.allSettled(suggestions.map((item) => createActionItem(item)));
      const newActions = created.flatMap((result) => result.status === 'fulfilled' && result.value.item ? [result.value.item] : []);
      actions = [...newActions, ...actions];
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <AppShell
      title="Plan y seguimiento"
      agency={agency}
      subtitle="Mové las acciones del diagnóstico y del NPS entre etapas y registrá solamente la información necesaria para avanzar."
      actions={<Link href="/history" className="button button-secondary">Ver historial</Link>}
    >
      {error ? <section className="panel result-alert"><strong>No se pudo cargar el tablero.</strong><p>{error}</p></section> : <ActionPlanClient initialActions={actions} latestAssessment={latestAssessment} />}
    </AppShell>
  );
}
