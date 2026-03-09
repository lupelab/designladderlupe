import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function NotFoundPage() {
  return (
    <AppShell title="No encontramos este recurso" subtitle="Puede que la evaluación no exista, que pertenezca a otra agencia o que el enlace ya no sea válido.">
      <section className="panel empty-panel">
        <div className="inline-actions">
          <Link href="/history" className="button button-primary" title="Volver al historial de tu agencia">
            Volver al historial
          </Link>
          <Link href="/questionnaire" className="button button-secondary" title="Crear una nueva evaluación">
            Nueva evaluación
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
