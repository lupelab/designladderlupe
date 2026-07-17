import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { HistoryTable } from '@/components/HistoryTable';
import { getCurrentAgency } from '@/lib/auth';
import { listAssessments } from '@/lib/apps-script';

export default async function HistoryPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  let items: any[] = [];
  try {
    const data = await listAssessments(agency);
    items = [...data.items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    // En modo de prueba el módulo debe abrir aunque la fuente de datos aún no esté configurada.
    items = [];
  }

  return (
    <AppShell
      title="Historial de diagnósticos"
      agency={agency}
      subtitle="Usá esta sección como herramienta de control continuo. Cada evaluación te ayuda a ver evolución, consistencia y foco de mejora en el tiempo."
      actions={
        <div className="inline-actions">
          <Link href="/questionnaire" className="button button-primary" title="Crear una nueva evaluación para tu agencia">
            Nueva evaluación
          </Link>
        </div>
      }
    >
      <HistoryTable items={items} />
    </AppShell>
  );
}
