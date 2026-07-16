import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ActionItemForm } from '@/components/ActionItemForm';
import { getCurrentAgency } from '@/lib/auth';

export default async function NewActionPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  return (
    <AppShell
      title="Crear acción"
      agency={agency}
      subtitle="Definí una acción clara para avanzar en cultura de innovación y diseño centrado en las personas."
    >
      <ActionItemForm agency={agency} />
    </AppShell>
  );
}
