import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ActionItemForm } from '@/components/ActionItemForm';
import { getCurrentAgency } from '@/lib/auth';

export default async function NewActionPage() {
  const agency = await getCurrentAgency();
  if (!agency) redirect('/login');
  return <AppShell title="Agregar acción" agency={agency} subtitle="Sumá una tarjeta manual cuando el diagnóstico no cubra una necesidad específica."><ActionItemForm agency={agency} /></AppShell>;
}
