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
      title="Diagnóstico de madurez de diseño"
      agency={agency}
      subtitle="Respondé por bloques. Cada dimensión tiene ejemplos aplicados a agencia y definiciones breves para que el diagnóstico sea claro, homogéneo y fácil de usar."
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
