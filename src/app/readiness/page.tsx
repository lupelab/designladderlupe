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
    <AppShell title="Preparación del diagnóstico" subtitle="Confirmá que tenés el alcance, la evidencia y la neutralidad necesarias antes de evaluar." agency={user.agency} actions={<Link href="/qualification" className="button button-secondary">Ver recorrido</Link>}>
      <ReadinessChecklist initialProgress={progress} />
    </AppShell>
  );
}
