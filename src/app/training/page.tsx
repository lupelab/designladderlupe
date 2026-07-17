import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { TrainingSimulator } from '@/components/TrainingSimulator';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress } from '@/lib/qualification';

export default async function TrainingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const progress = await getQualificationProgress(user);
  if (user.role !== 'admin' && !progress.readinessCompletedAt) redirect('/readiness');

  return (
    <AppShell title="Guía de aplicación y simulacro" subtitle="Aprendé a traducir evidencia real en una respuesta consistente antes de rendir el examen." agency={user.agency} actions={<Link href="/qualification" className="button button-secondary">Ver recorrido</Link>}>
      <TrainingSimulator />
    </AppShell>
  );
}
