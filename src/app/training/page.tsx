import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { TrainingSimulator } from '@/components/TrainingSimulator';
import { getCurrentUser } from '@/lib/auth';

export default async function TrainingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <AppShell
      title="Guía de aplicación y simulacro"
      subtitle="Un recurso opcional para practicar cómo traducir evidencia real en respuestas consistentes."
      agency={user.agency}
      actions={
        <div className="inline-actions">
          <Link href="/questionnaire" className="button button-primary">Ir al diagnóstico</Link>
          <Link href="/certification" className="button button-secondary">Abrir examen opcional</Link>
          <Link href="/qualification" className="button button-secondary">Ver recursos</Link>
        </div>
      }
    >
      <TrainingSimulator />
    </AppShell>
  );
}
