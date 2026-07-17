import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { CertificationExam } from '@/components/CertificationExam';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress } from '@/lib/qualification';

export default async function CertificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const progress = await getQualificationProgress(user);
  if (user.role !== 'admin' && !progress.readinessCompletedAt) redirect('/readiness');
  if (user.role !== 'admin' && !progress.guideCompletedAt) redirect('/training');

  return (
    <AppShell title="Certificación del aplicador" subtitle="Validá tu comprensión de los principios y el criterio de evidencia antes de completar diagnósticos oficiales." agency={user.agency} actions={<Link href="/training" className="button button-secondary">Repasar guía</Link>}>
      <CertificationExam initialProgress={progress} />
    </AppShell>
  );
}
