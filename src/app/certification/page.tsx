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

  return (
    <AppShell
      title="Certificación opcional del aplicador"
      subtitle="Validá tu comprensión de los principios y del criterio de evidencia. El resultado no limita el acceso al diagnóstico ni a los demás módulos."
      agency={user.agency}
      actions={
        <div className="inline-actions">
          <Link href="/questionnaire" className="button button-primary">Ir al diagnóstico</Link>
          <a href="/design-led-culture-playbook.pdf" target="_blank" rel="noreferrer" className="button button-secondary">Abrir PDF Design-Led</a>
          <Link href="/training" className="button button-secondary">Repasar guía</Link>
        </div>
      }
    >
      <div className="qualification-notice optional"><strong>Este examen es opcional.</strong><span>Podés usar toda la plataforma, completar diagnósticos y crear planes de acción sin rendirlo.</span></div>
      <CertificationExam initialProgress={progress} />
    </AppShell>
  );
}
