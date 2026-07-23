import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ReadinessChecklist } from '@/components/ReadinessChecklist';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress } from '@/lib/qualification';

export default async function ReadinessPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const progress = await getQualificationProgress(user);

  return (
    <AppShell
      title="Checklist opcional de preparación"
      subtitle="Usalo como guía para reunir contexto y evidencia antes de evaluar. No bloquea el acceso al diagnóstico."
      agency={user.agency}
      actions={
        <div className="inline-actions">
          <Link href="/questionnaire" className="button button-primary">Ir al diagnóstico</Link>
          <Link href="/qualification" className="button button-secondary">Ver recursos</Link>
        </div>
      }
    >
      <ReadinessChecklist initialProgress={progress} />
    </AppShell>
  );
}
