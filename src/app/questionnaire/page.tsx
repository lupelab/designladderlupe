import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { getCurrentAgency } from '@/lib/auth';

export default async function QuestionnairePage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  return (
    <AppShell
      title="Cuestionario de cultura de innovación y diseño centrado en las personas"
      agency={agency}
      subtitle="Antes de responder, revisá el libro, el instructivo y el glosario. El cuestionario debe completarlo una sola persona en representación de la agencia o empresa para mantener una lectura consistente."
      actions={
        <div className="inline-actions">
          <Link href="/history" className="button button-secondary" title="Ver evaluaciones guardadas de tu agencia">
            Historial
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="button button-secondary" title="Cerrar la sesión actual de la agencia">
              Salir
            </button>
          </form>
        </div>
      }
    >
      <QuestionnaireForm />
    </AppShell>
  );
}
