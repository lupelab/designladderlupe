import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { getCurrentUser } from '@/lib/auth';
import { getQualificationProgress, isQualified } from '@/lib/qualification';

export default async function QuestionnairePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const progress = await getQualificationProgress(user);
  const adminMode = user.role === 'admin';
  if (!adminMode && !isQualified(progress)) redirect('/qualification?required=1');

  return (
    <AppShell
      title="Diagnóstico de cultura de innovación"
      agency={user.agency}
      subtitle="Un recorrido guiado para entender qué prácticas están instaladas, cuáles dependen de esfuerzos aislados y qué conviene trabajar primero."
      actions={<Link href="/history" className="button button-secondary">Ver historial</Link>}
    >
      <QuestionnaireForm defaultName={user.fullName} defaultEmail={user.adminPreview ? 'adlens@lupe.com.py' : user.legacy ? '' : user.email} agency={user.agency} certificationScore={progress.certificationScore} adminMode={adminMode} />
    </AppShell>
  );
}
